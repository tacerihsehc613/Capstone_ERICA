# neo-dashboard
### AuraDB db company meta-graph 

AuraDB 에 호스팅한 회사 데이타 베이스. 
#### 링크
- Company: neo4j+s://21f49612.databases.neo4j.io (Username: neo4j, Password:Jay2833748!)
- Review: neo4j+s://b2036ca7.databases.neo4j.io (Username: neo4j, Password:niax1729@)

선택한 데이타 베이스 인스턴스의 최대 노드수와 관계 수에 제한이 있기 때문에 처음 로컬에서 생성한 db 인스턴스와 형태가 달라졌기 때문에 서버 db 쿼리문에 차이가 있음.
먼저, 초기 company csv 파일로부터 Customer, Product, Store 노드와 SELLS 관계를 단순 열 삽입으로 생성했고
BoughtAt and Customer_INTER 는 graph ds algorithm과  apoc library 를 이용해 생성한 관계이다.
리모트에서는 노드 간 커플링을 최소화하고 추천 모델 학습의 용이성을 위해 Customer, Product, Store, Customer_Inter 노드 SELLS, BoughtAt 관계를 사용했다.
<img src="https://user-images.githubusercontent.com/127294863/235351485-1c6c0241-cc9e-4c78-96e1-d030b3305d64.png">

1. Pagerank algorithm - top 10 인플루엔서 customer nodes and Inter 릴레이션
페이지 랭크 알고리즘을 통해 다른 노드와의 관계적 영향이 큰 노드를 찾을 수 있었고 이를 인플루엔서 노드로 지정했다.
페이지 랭크를 학습시키는데 사용한 Inter relationship (서로 다른 customer 간에 공통으로 방문한 가게의 수를 프로퍼티로 가짐) 의 정보를  Customer_INTER 노드에 identity, 시작 노드, 끝 노드의 identity의 키와 둘 사이의 weight value로 이루어진 map property를 넣어 대신하기로 했다. 따라서 상위 페이지 랭크 수치를 10개의 customer 노드와 각각의 관계를 구하기 위해 다음 쿼리를 실행했다.
```sql
MATCH (c:Customer)
WITH c ORDER BY c.pagerank DESC LIMIT 10
with COLLECT(c.identity) AS c_ids
UNWIND c_ids AS c_id with c_id, c_ids
MATCH (i:Customer_INTER) WHERE i.from = c_id
UNWIND keys(apoc.convert.fromJsonMap(i.map)) AS c2_id
MATCH (c2:Customer) WHERE c2.identity = toInteger(c2_id) AND c2.identity <> c_id and c2.identity in c_ids WITH c_id,  c2_id,apoc.convert.fromJsonMap(i.map)[c2_id] AS weight
RETURN c_id, toInteger(c2_id) as c2_id, weight
```
##### 최상위 pagerank인 customer 노드와 weight로 표시된 노드간 Inter 관계를 d3.js를 사용하여 force directed graph로 나타냈다.
<img src="https://user-images.githubusercontent.com/127294863/235338949-1adf00ba-b4c6-4856-814c-b4b931317042.png">

2. Louvain algorithm - 각각의 customer node community 구하기
총 1651명의 customer 노드가 크게 두 개의 community 로 균등하게 나누어졌음을 확인할 수 있다. 
<img src="https://user-images.githubusercontent.com/127294863/235304148-929e07c8-543a-46b4-b3d1-026316b26616.png">
<img src="https://user-images.githubusercontent.com/127294863/235304274-a5a0252e-ca22-45c0-a342-30a3183c9c1a.png">

### Neo4j desktop company meta-graph 
neo4j 데스크탑에서 생성한 쿼리의 원본 메타 그래프가 더 직관적이고 이해하기 쉬운 것을 알 수 있다.
만들고자 하는 추천 시스템은 고객이 어떤 가게를 몇 번 방문했는지를 바탕으로 설계되었으므로 여기서는 ORDERED 관계를 제외한 노드, 관계를 사용했다.
<img src="https://user-images.githubusercontent.com/127294863/235306369-53412e9c-bf46-4f77-a058-940266c05c46.png">


1. Pagerank algorithm 
```sql
match (c:Customer)
return ID(c),c.customerId,c.lastname,c.pagerank
order by c.pagerank desc 
limit 10
```
리모트에서와 같은 결과를 보여주는 쿼리이다. 바로 더 직관적인 결과를 확인 할 수 있다.
<img src="https://user-images.githubusercontent.com/127294863/235306845-4cdc0e4d-b1d0-4978-b66d-cb1969df7707.png">
페이지 랭크 알고리즘 만드는 법
- 먼저 서로 다른 조합의 customer 노드 사이에 공통으로 주문한 store를 바탕으로 Inter relationship을 만든다.
```sql
CALL apoc.periodic.iterate(
'MATCH (a:Customer)-[:BoughtAt]->(s:Store)<-[:BoughtAt]-(b:Customer)
WHERE id(a) > id(b)
return a, b, count(*) as weight',
'MERGE (a)-[r:Inter]-(b)
ON CREATE SET r.w = weight',
{batchSize : 10000})
YIELD batch, operations
```
두 노드 사이에 중복된 관계 생성을 피하기 위해, 화살의 방향은 항상 노드 id가 높은 곳에서 낮은 곳으로 흐른다.
- 다음으로, 그래프 이름, 노드를 어떻게 매칭할 지 알려주는 노드 쿼리, 사용할 관계 & 가중치를 설정하는 에지 쿼리를 인자로 하여 in-memory 그래프를 생성한다.
```sql
CALL gds.graph.project.cypher( 'Customer_Inter', 'MATCH (c:Customer) RETURN id(c) AS id', 'MATCH (n:Customer)-[e:Inter]-(m:Customer) RETURN id(n) AS source, e.w AS w, id(m) AS target' )
```
- 마지막으로 생성한 Customer_Inter graph를 바탕으로 pagerank 를 계산하고 Customer 노드의 속성으로 추가한다.
CALL gds.pageRank.write('Customer_Inter', {maxIterations: 20, dampingFactor: 0.85, relationshipWeightProperty: 'w', writeProperty: 'pagerank'}) YIELD nodePropertiesWritten, ranIterations

2. community 찾기 (louvain)
- 같은 in-memory 그래프를 이용하여 루바인 알고리즘을 통해 community를 노드 속성으로 추가할 수 있다.

```sql
CALL gds.louvain.write('Review_Inter', 
{relationshipWeightProperty: 'w', writeProperty: 'community' })
YIELD communityCount, modularity, modularities
```
<img src="https://user-images.githubusercontent.com/127294863/235307951-9bcbb5df-74be-44be-9cd9-89cbec207fe6.png">
modularity는 커뮤니티 구조를 평가하는 척도로 커뮤니티 내의 노드가 다른 커뮤니티의 노드보다 서로 더 밀접하게 연결되어 있는 정도를 측정한다.
-1 to 1 사이의 값을 가질 수 있으며 0은 무질서한 랜덤 상태를 나타낸다. 여기서는 0.3에 가까운 수가 customer 노드 사이에 community가 존재함을 보여준다.

- community 203 에 속하는 customer이 구매한 상위 10개의 product 목록이다.
```sql
MATCH (c:Customer)-[:BoughtAt]->(s:Store)-[:SELLS]->(p:Product)
WHERE c.community = 203 
RETURN p.productId,p.productName, COUNT(*) AS purchases
ORDER BY purchases DESC
LIMIT 10
```
