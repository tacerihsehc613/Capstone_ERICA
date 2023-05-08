import warnings 
import pickle
warnings.simplefilter(action='ignore',category=FutureWarning)
import pandas as pd
import numpy as np
import pickle
from mlxtend.preprocessing import TransactionEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.linear_model import LogisticRegression
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules
from sklearn.metrics.pairwise import cosine_similarity
import store_name
import time




def data_preprocessing():
    #OrderDataFinal.csv위치에 따라 수정
    df = pd.read_csv('C:/Users/like0/Downloads/OrderDataFinal.csv')
    df = df.set_index(keys='IDX')
    df['SERV_DT']= df['SERV_DT'].astype('str')
    pd.to_datetime(df['SERV_DT'])
    df_2022 = df[df['SERV_DT'] >= '2022-01-01']

    df_2022 = df_2022.drop(['TLNO'], axis = 'columns')
    df_2022['STORE_ID'] = df_2022['STORE_ID'].astype(str)
    df_2022['PRD_ID'] = df_2022['PRD_ID'].astype(str)
    df_2022['WEATHER'] = df_2022['WEATHER'].replace({'폭염': 0, '더위': 1, '선선함': 2, '쌀쌀함': 3, '추위': 4, '한파': 5, '눈': 6, '비': 7, '장마': 8})
    df_2022 = df_2022[['MBR_ID','STORE_ID','PRD_ID','WEATHER']]

    df_2022.to_csv("df_2022.csv",index=True)

#전처리 데이터 csv파일 생성 
#data_preprocessing()

#따로 설정 해야 한다 
df_2022 = pd.read_csv('C:/Users/like0/OneDrive/바탕 화면/CapstoneServer/flask/test/df_2022.csv')

# 데이터에서 구매했던 상점의 list를 추출한다.
customer_store_round_lst = df_2022.groupby('MBR_ID')['STORE_ID'].apply(list)

#인덱스를 문자열로 변환
customer_store_round_lst.index = customer_store_round_lst.index.astype(str)
#중복된 가게 제거
customer_store_round_lst_unique = pd.Series([np.unique(lst) for lst in customer_store_round_lst], index=customer_store_round_lst.index)

df_ReRules = customer_store_round_lst_unique.reset_index(name='value')

#print(df_ReRules.head(5))

with open('data.pickle','rb') as fr:
    data= pickle.load(fr)


#print(data)

storeid_name = pd.DataFrame(data)




# 독립 변수와 종속 변수 나누기
x = df_2022[['STORE_ID']]
y = df_2022['WEATHER']

(x_train, x_valid, y_train, y_valid) = train_test_split(x, y, train_size=0.8, random_state=1)

# 로지스틱 회귀 모델 학습
logreg = LogisticRegression()
logreg.fit(x_train, y_train)

#print(logreg.predict([[10]]))
#print(logreg.predict_proba([[10]]))





# TransactionEncoder를 사용하여 구매 데이터를 이진화합니다.
te = TransactionEncoder()
te_ary = te.fit_transform(df_ReRules['value'])
bin_df = pd.DataFrame(te_ary, columns=te.columns_)

# 유저 간 코사인 유사도를 계산합니다.
cos_sim = cosine_similarity(bin_df)

# Apriori 알고리즘을 사용하여 빈발 아이템셋을 찾습니다.
freq_itemsets = apriori(bin_df, min_support=0.1, use_colnames=True)


def train_model(target_user,today_weather):

    # 추천 대상이 되는 유저를 선택합니다.
    #target_user = 0
    #today_weather = 4


    # target_user와 가장 유사한 상위 1명의 유저를 추출합니다.
    similarities = cos_sim[target_user]
    most_similar = similarities.argsort()[::-1][1:2]

    # 유사한 유저가 구매한 상품 목록을 가져옵니다.
    similar_products = bin_df.iloc[most_similar, :]
    similar_products = similar_products.sum().where(lambda x: x > 0).dropna().index

    # target_user가 아직 구매하지 않은 상품 중, 추천 대상 유저와 유사한 유저들이 구매한 상품을 찾습니다.
    target_user_items = list(df_ReRules.iloc[target_user]['value'])
    target_user_items = set(target_user_items)
    recommendations = set()

    for product in similar_products:
        if product not in target_user_items:
            recommendations.add(product)

    # 추천 결과를 출력합니다.
    print("most similar user is", most_similar)
    print(f"Target user {target_user} may be interested in the following stores: {', '.join(str(x) for x in recommendations)}")
    #print(f"Target user {target_user} may be interested in the following stors: {', '.join(recommendations)}")

    # target_user가 소비한 제품을 추출합니다.
    target_user_items = list(df_ReRules.iloc[target_user]['value'])

    appriorstore = []

    # 연관규칙을 생성합니다.
    rules = association_rules(freq_itemsets, metric='lift', min_threshold=1)
    for store in target_user_items:
        rules = rules[(rules.antecedents == frozenset({store})) & (rules.consequents.apply(lambda x: len(x) ==1))].sort_values(by='lift' , ascending=False)
        if len(rules) > 0:
            for i in range(len(rules)) :
                if rules.iloc[i]['lift'] > 1.0:
                    f = rules.iloc[i]['consequents']
                    value = list(f)[0]
                    appriorstore.append(value)


    appriorstore = set(appriorstore)
    appriorstore = list(appriorstore)
    appriorstore

    #최종 추천 가게 출력

    recommendations = list(recommendations)
    fin_recommendations = []


    for finstore in recommendations:
        if finstore in appriorstore:
            fin_recommendations.append(finstore)

        else:
            if len(fin_recommendations) < 3:
                if logreg.predict([[int(finstore)]]) == today_weather:
                    fin_recommendations.append(finstore)
            else:
                break

    if len(fin_recommendations) < 3:
        for addstore in recommendations:
            if addstore not in fin_recommendations:
                fin_recommendations.append(addstore)
            if len(fin_recommendations) == 3:
                break

    fin_recommendations

    for i in range(3):
        store_id = int(fin_recommendations[i])
        print(storeid_name.loc[storeid_name['STORE_ID'] == store_id, 'STORE_NAME'].values[0])
    

    
if __name__ == "__main__":
    target_user = 0
    today_weather = 1
    train_model(target_user, today_weather)











