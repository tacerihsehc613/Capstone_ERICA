
from model import df_ReRules,bin_df,cos_sim,logreg,storeid_name,freq_itemsets,rules
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules
from sklearn.metrics.pairwise import cosine_similarity


def recommend_list(target_user:int,today_weather:int) -> list[str]:



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
    #print("most similar user is", most_similar)
    #print(f"Target user {target_user} may be interested in the following stors: {', '.join(recommendations)}")

    # target_user가 소비한 제품을 추출합니다.
    target_user_items = list(df_ReRules.iloc[target_user]['value'])

    appriorstore = []


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
      recommended_store_name = storeid_name.loc[storeid_name['STORE_ID'] == store_id, 'STORE_NAME'].values[0]
      recommended_store_name.append(recommended_store_name)
    
    return recommended_store_name

print(recommend_list(0,1))