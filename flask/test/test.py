import warnings 
import pickle

warnings.simplefilter(action='ignore',category=FutureWarning)
import pandas as pd
import numpy as np
import pickle

#OrderDataFinal.csv 위치에 따라 변경
df = pd.read_csv('C:/Users/like0/Downloads/OrderDataFinal.csv')
df = df.set_index(keys='IDX')
#print(df.head(5))

df['SERV_DT']= df['SERV_DT'].astype('str')
pd.to_datetime(df['SERV_DT'])
df_2022 = df[df['SERV_DT'] >= '2022-01-01']

df_2022 = df_2022.drop(['TLNO'], axis = 'columns')
df_2022['STORE_ID'] = df_2022['STORE_ID'].astype(str)
df_2022['PRD_ID'] = df_2022['PRD_ID'].astype(str)
df_2022['WEATHER'] = df_2022['WEATHER'].replace({'폭염': 0, '더위': 1, '선선함': 2, '쌀쌀함': 3, '추위': 4, '한파': 5, '눈': 6, '비': 7, '장마': 8})


# 데이터에서 구매했던 상점의 list를 추출한다.
customer_store_round_lst = df_2022.groupby('MBR_ID')['STORE_ID'].apply(list)

#인덱스를 문자열로 변환
customer_store_round_lst.index = customer_store_round_lst.index.astype(str)
#중복된 가게 제거
customer_store_round_lst_unique = pd.Series([np.unique(lst) for lst in customer_store_round_lst], index=customer_store_round_lst.index)

df_ReRules = customer_store_round_lst_unique.reset_index(name='value')

data = {
    "STORE_ID" : list(range(1, 497)),
    "STORE_NAME" : ['더 키친 일뽀르노 청담점',
                      '일편등심 강남점',
                      '빠레뜨한남 가로수길점',
                      '구구당',
                      '해목정 X 연수동해물나라 역삼점',
                      '미뉴트 빠삐용',
                      '차만다 도곡점',
                      '감성타코 강남역점',
                      '은행골 신사점',
                      '에그서울',
                      '마초쉐프 강남본점',
                      '진미평양냉면',
                      '대림국수 신사가로수길점',
                      '까폼',
                      '땀땀',
                      '어슬 청담',
                      '무탄 압구정 본점',
                      '오마카세 오사이초밥 강남역점',
                      '소보키 강남점',
                      '대가방 본점',
                      '피자덕후 피자힙 압구정점',
                      '삼무곱창흑돼지 강남점',
                      '트라가 가로수길점',
                      '꽁티드툴레아',
                      '중앙해장',
                      '을지다락 강남',
                      '페어링룸',
                      '크리스갈비',
                      '한판도',
                      '노티드 청담',
                      '피플더테라스',
                      '돈불리제담',
                      '정식당',
                      '스케줄청담',
                      '나폴리회관 강남역점',
                      '호족반 청담',
                      '아쭈',
                      '팀호완 삼성점',
                      '신동궁감자탕 역삼직영점',
                      '류센소 강남점',
                      '테라스룸',
                      '런던 베이글 뮤지엄 도산점',
                      '떡도리탕 강남본점',
                      '듀자미',
                      '강남어시장',
                      '양철지붕 본점',
                      '트라가 역삼점',
                      '부암갈비',
                      '만다복',
                      '은성보쌈',
                      '동명항생선숯불구이',
                      '만정',
                      '오대산산채전문점',
                      '방화동쭈꾸미마을',
                      '가나안',
                      '에버그린',
                      '신동태',
                      '강수곱창',
                      '군자네',
                      '싹쓰리 솥뚜껑김치삼겹살',
                      '농실가찹쌀순대 ',
                      '더 키친 일뽀르노 청담점',
                      '방학사거리짬뽕집',
                      '뉴욕엔와이',
                      '대우부대찌개',
                      '한참치 2호점',
                      '광주똑순이아구찜',
                      '더수제비 남양주본점',
                      '청송함흥냉면전문점 본관',
                      '조점례남문피순대',
                      '삼촌식당',
                      '꽃새우영번지 역삼점',
                      '페리카나',
                      '땡초닭발',
                      '광주식당',
                      '대가향',
                      '유림',
                      '돌곰네',
                      '광화문미진',
                      '맛자랑',
                      '버섯잔치집',
                      '청룡식당',
                      '금목서 광양불고기',
                      '전주전집 영등포점',
                      '하노이안',
                      'The담다(구 대흥식당)',
                      '호남식당',
                      '청솔유황오리진흙구이',
                      '새마을식당 서초교대점',
                      '처가집추어탕 본점',
                      '신포순대 본점',
                      '성화라멘',
                      '안동참찜닭',
                      '다락정',
                      '오불뚝 위례본점',
                      '우작설렁탕',
                      '수인씨의마당',
                      '혜화양육관',
                      '백년옥 본관',
                      '팔팔전복',
                      '소풍',
                      '아소정',
                      '오근내닭갈비',
                      '산촌 고양점',
                      '옛집',
                      '전라도팥바지락칼국수',
                      '자성화맛집코다리네 별관',
                      '초원오리농장',
                      '바위꽃',
                      '땅끝마을',
                      '콩지팥찌',
                      '정솔닭한마리 영등포본점',
                      '대관령황태마을 역촌점',
                      '송정삼대국밥',
                      '동래할매파전',
                      '윤금자모리칼국수 본점',
                      '엘토르 원조구룡포과메기전문점',
                      '한일관 압구정점',
                      '허육도',
                      '여자만 관훈점본관',
                      '우동카덴 서교점',
                      '통영집',
                      '참숯꼼장어',
                      '장모님해장국',
                      '바오차이',
                      '바른면집 건대점',
                      '동경전통육개장',
                      '정통우거지탕',
                      '아따맵소',
                      '청담정스시',
                      '쫄면가',
                      '바다의집',
                      '꽃돼지연탄구이',
                      '해월정',
                      '금강올갱이해장국',
                      '볏짚구이이야기',
                      '유정역',
                      '평양초계탕막국수',
                      '종로진낙지',
                      '일출보리밥',
                      '계탄집 본점',
                      '부흥동태탕',
                      '시가올비빔국수',
                      '호인족발',
                      '오비야',
                      '숲속도토리마을',
                      '폭탄밥',
                      '길거리쌀국수',
                      '미스터케밥',
                      '목포신안18호횟집',
                      '신포찬누리닭강정',
                      '정인면옥',
                      '청어람',
                      '팔당원조칼제비칼국수',
                      '대갈곱창&막창',
                      '만정수산',
                      '웰빙김치찜',
                      '만석장',
                      '담뿍화로된장',
                      '부여집',
                      '초량돼지',
                      '서해안횟집',
                      '외포왕꽃게탕',
                      '영광굴비전문점 서초점',
                      '송원마포돼지갈비',
                      '청산어죽',
                      '우렁각시쌈밥총각',
                      '추억의연탄집 미금점',
                      '황평집',
                      '원대구탕',
                      '삼도갈비',
                      '팔팔해물탕',
                      '하나우동',
                      '강남목장',
                      '송죽장',
                      '삼국지',
                      '진미통닭',
                      '김앤김대게전문점 서교점',
                      '로코스비비큐',
                      '구기영조방낙지',
                      '사랑방',
                      '내호냉면',
                      '한방장어구이',
                      '김영자나주곰탕',
                      '강촌원조쭈꾸미',
                      '바다회사랑',
                      '매화반점',
                      '디 안다만',
                      '까꿍돼지사당삼겹살',
                      '화수목',
                      '야바이',
                      '개미집',
                      '순라길',
                      '등촌최월선칼국수',
                      '도셰프',
                      '현대기사식당',
                      '먹깨비',
                      '무등산',
                      '포브라더스',
                      '드래곤힐스파',
                      '정통부대고기',
                      '건대통골뱅이',
                      '청운누룽지백숙 본점',
                      '그릭슈바인',
                      '수협회센터',
                      '일억조식당',
                      '두메향기산',
                      '매봉골황제능이버섯',
                      '진흥관',
                      '순천만가든',
                      '남문식당',
                      '보리네생고깃간',
                      '소문난멸치국수',
                      '원조양평해장국 직영점',
                      '뿌자',
                      '코레아노스',
                      '조선김밥',
                      '진순자김밥 봉천본점',
                      '최대섭대박김밥 속초본점',
                      '오선모옛날김밥',
                      '교리김밥 본점',
                      '영도해녀촌',
                      '오는정김밥',
                      '우정회센터 2호점',
                      '장하촌',
                      '항아리홍어',
                      '박달재자연식당',
                      '만복기사식당',
                      '명가막국수',
                      '개화옥',
                      '텍사스데브라질',
                      '한옥집',
                      '우정낙지',
                      '팔팔민물장어',
                      '샘밭막국수',
                      '원조숯불닭불고기집',
                      '진로집',
                      '사돈집',
                      '대동할매국수',
                      '김정식의삼일뒷고기',
                      '해운대속씨원한대구탕 해운대점',
                      '시오 연희본점',
                      '샤이바나 광화문점',
                      '백담황태구이',
                      '자작나무집',
                      '메이탄 종로점',
                      '미타우동',
                      '도마 인사점',
                      '텐마루 가산점',
                      '라화쿵부 신촌점',
                      '소백산 양재별관',
                      '황소곱창 건대본점',
                      '박승광 최강해물손칼국수 본점',
                      '큰손참붕어찜',
                      '봉산옥 서초동본점',
                      '가람떡갈비',
                      '어메이징타일랜드',
                      '찌마기 본점',
                      '서경도락 논현본점',
                      '사람사는고깃집 김일도 신논현점',
                      '하롱베이의하루 여의도본점',
                      '철길왕갈비살',
                      '한강껍데기',
                      '김북순큰남비집 신사본점',
                      '신당동 마복림떡볶이집',
                      '나정순할매쭈꾸미',
                      '주은감자탕',
                      '고향양꼬치',
                      '시추안하우스 삼성점',
                      '속초생선찜 연신내점',
                      '전주식당',
                      '도토리편백집 문정법조단지점',
                      '자연석돌구이',
                      '원조남산왕돈까스',
                      '춘심이네 본점',
                      '봉구네고기집 김포본점',
                      '뚱보할매김밥집',
                      '울산다찌',
                      '채선당 수락산점',
                      '왕대통수라찜',
                      '트로이카',
                      '팔당초계국수 본점',
                      '털보네바베큐 미사동본점',
                      '봉족발',
                      '아카라',
                      '꾸띠자르당',
                      '사보르페루아노',
                      '라카사',
                      '진대감 선릉점',
                      '삼거리먼지막순대국',
                      '두툼',
                      '와글와글족발',
                      '정돈프리미엄',
                      '용마루굴다리껍데기',
                      '이문설농탕',
                      '용금옥',
                      '박군자진주냉면 수원본점',
                      '은하곱창',
                      '윤선희평양냉면양각도',
                      '피양콩할마니 본점',
                      '용순가재골수제비',
                      '삼각산머루집',
                      '애마오리 본점',
                      '차호랑',
                      '골목집',
                      '제일분식',
                      '핫피자앤버거',
                      '야고만두 이태원점',
                      '동동국수집',
                      '늘봄해물찜손칼국수 답십리본점',
                      '강경해물칼국수',
                      '내당한우',
                      '피에프창 송도트리플스트리트점',
                      '류재열의 명품코다리찜 송정점',
                      '홈수끼 학동점',
                      '오두산막국수 본점',
                      '허기숙할머니 원조오뎅식당 의정부본점',
                      '생아구한마리',
                      '해장촌',
                      '마로니에',
                      '수양식당',
                      '통영다찌',
                      '원조원할매소문난닭한마리',
                      '또순이순대 본점',
                      '시골야채된장전문점',
                      '24시뼈다귀감자탕',
                      '삼수갑산',
                      '사대분식',
                      '풍납닭내장탕',
                      '송쉐프',
                      '꼬끄더그릴',
                      '빅토리아',
                      '달짜국수',
                      '고궁 전주본점',
                      '화정떡갈비',
                      '영미오리탕',
                      '더백푸드트럭',
                      '볼트스테이크하우스',
                      '청화집',
                      '본수원갈비 수원점',
                      '옥합',
                      '강동해물찜해천탕',
                      '춘천통나무집닭갈비',
                      '갈비1987',
                      '정글애갑오징어',
                      '원조수구레',
                      '초월보리밥 수양점',
                      '도꼭지',
                      '양지말화로구이',
                      '양양터미널기사님식당',
                      '하당먹거리',
                      '미락',
                      '동흥재첩국',
                      '설송',
                      '더아리엘 목동점',
                      '진성옛날소머리국밥',
                      '길풍식당',
                      '송죽',
                      '옛향기가득한 동인동 신사본점',
                      '일일향 1호점',
                      '원조태평소국밥',
                      '오씨칼국수',
                      '유가',
                      '중림장',
                      '동화가든',
                      '현대장칼국수',
                      '대한회센터',
                      '원조뚝배기식당',
                      '고기대통령 본점',
                      '우리식당',
                      '완벽한인생브루어리',
                      '내대막국수',
                      '솔향기',
                      '시장회집',
                      '속초생태집',
                      '동해반점 3호점',
                      '광주빛고을식당',
                      '생선국수찐한식당',
                      '태조석갈비',
                      '미정이네식당 2호점',
                      '굴따세',
                      '듀드팡',
                      '주막',
                      '오성닭한마리',
                      '해몽',
                      '다로베 서울숲점',
                      '봉산집',
                      '청진옥 본점',
                      '잠수교집 2호점',
                      '새만금횟집',
                      '빈해원',
                      '진미평양냉면',
                      '남도음식토말 본점',
                      '다래식당',
                      '락희옥 서초교대역점',
                      '반포치킨',
                      '잉글랜드왕돈까스',
                      '평이담백뼈칼국수',
                      '부산복집',
                      '연남서식당',
                      '신촌기사식당',
                      '사랑방칼국수',
                      '천마산곰탕',
                      '초롱이고모부대찌개',
                      '보배네집',
                      '그래니살룬',
                      '돈사랑',
                      '문오리',
                      '청어람 본점',
                      '자하손만두',
                      '마담밍 선릉점',
                      '오향선 신관',
                      '발리인망원',
                      '라스위스',
                      '팀호완 삼성점',
                      '따빠마드레',
                      '능곡할머니북어탕 본1호점',
                      '대장군집',
                      '오리대가',
                      '뱃고동',
                      '사마르칸트',
                      '솔티인도네팔음식점',
                      '할매집',
                      '논밭골 봉천점',
                      '양인환대 신용산점',
                      '바다동산',
                      '진솔통닭',
                      '독천식당',
                      '양지가든',
                      '서촌통영',
                      '원당쇠고기국밥',
                      '고려분식',
                      '산밑할머니',
                      '속초동명항게찜',
                      '한량',
                      '한라국수',
                      '서울 설로인',
                      '홍리마라탕',
                      '원조동글갈비',
                      '새봄떡국국수',
                      '임학순전통웰빙파김치강화갯벌장어민물장어',
                      '오레노라멘 인사점',
                      '원조남원닭발',
                      '한일옥',
                      '신성루',
                      '팜파스휴게소',
                      '홍천막장시래기국밥',
                      '서울 을지분식',
                      '석바위토스트',
                      '두메촌',
                      '용문원조 능이버섯국밥',
                      '옥동식',
                      '명실상감한우 홍보테마타운점',
                      '리치몬드과자점 성산본점',
                      '나폴레옹제과점 본점',
                      '류재은베이커리 본점',
                      '대원당',
                      '성심당',
                      '궁전제과 충장본점',
                      '씨엘비베이커리 명륜동본점',
                      '비엔씨 광복본점',
                      '맘모스베이커리',
                      '이성당',
                      '오복가정식',
                      '청담골',
                      '해피홈레스토랑',
                      '서유기짬뽕',
                      '금문',
                      '미소손짜장',
                      '천안성',
                      '천금반점',
                      '공푸',
                      '황제짬뽕',
                      '소룡각',
                      '진양횟집',
                      '속초대게나라홍게마을',
                      '옥천냉면황해식당',
                      '숯골원냉면 본점',
                      '부산안면옥',
                      '백령면옥',
                      '해주냉면',
                      '40년전통오미냉면',
                      '소래기',
                      '종가면옥',
                      '이라면',
                      '빨간세상라면학교',
                      '라면점빵',
                      '일호점미역',
                      '평방옥',
                      '32파르페',
                      '무공돈까스',
                      '망원시장',
                      '스타일난다 핑크풀카페 홍대점',
                      '속초우리왕만두',
                      '속초에살다',
                      '참마루한식보리밥부페']
}

storeid_name = pd.DataFrame(data)

from sklearn.linear_model import LogisticRegression
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split

# 독립 변수와 종속 변수 나누기
x = df_2022[['STORE_ID']]
y = df_2022['WEATHER']

(x_train, x_valid, y_train, y_valid) = train_test_split(x, y, train_size=0.8, random_state=1)


# 로지스틱 회귀 모델 학습
logreg = LogisticRegression()
logreg.fit(x_train, y_train)


#print(logreg.predict([[10]]))
#print(logreg.predict_proba([[10]]))

from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules
from sklearn.metrics.pairwise import cosine_similarity

# TransactionEncoder를 사용하여 구매 데이터를 이진화합니다.
te = TransactionEncoder()
te_ary = te.fit_transform(df_ReRules['value'])
bin_df = pd.DataFrame(te_ary, columns=te.columns_)

# 유저 간 코사인 유사도를 계산합니다.
cos_sim = cosine_similarity(bin_df)

from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules
from sklearn.metrics.pairwise import cosine_similarity



# TransactionEncoder를 사용하여 구매 데이터를 이진화합니다.
te = TransactionEncoder()
te_ary = te.fit_transform(df_ReRules['value'])
bin_df = pd.DataFrame(te_ary, columns=te.columns_)

# Apriori 알고리즘을 사용하여 빈발 아이템셋을 찾습니다.
freq_itemsets = apriori(bin_df, min_support=0.1, use_colnames=True)

# 연관규칙을 생성합니다.
rules = association_rules(freq_itemsets, metric='lift', min_threshold=1)


# 추천 대상이 되는 유저를 선택합니다.
target_user = 0
today_weather = 4


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
print(f"Target user {target_user} may be interested in the following stors: {', '.join(recommendations)}")

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
  storeid_name.loc[storeid_name['STORE_ID'] == store_id, 'STORE_NAME'].values[0]


