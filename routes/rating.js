const express = require('express');

const {getNeoRecommendationUser, getNeoRecommendationStore} = require('../neo4j/rating');
const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    //console.log("xxxxx33");
    //console.log(res.locals.user);
    next();
});

router.get('/', async (req, res, next) => {
  try {
    const query=`
    CALL {
        MATCH (c:Customer_INTER)
        WHERE c.from = $identity
        UNWIND keys(apoc.convert.fromJsonMap(c.map)) AS c2_id
        MATCH (c2:Customer)
        WHERE c2.identity = toInteger(c2_id)
        RETURN c2.identity AS c, apoc.convert.fromJsonMap(c.map)[c2_id] AS num, c2.lastname as name, c2.community as community
        UNION ALL
        MATCH (c:Customer_INTER)
        WHERE toString($identity) IN keys(apoc.convert.fromJsonMap(c.map))
        MATCH (customer:Customer {identity: c.from})
        RETURN c.from AS c, apoc.convert.fromJsonMap(c.map)[toString($identity)] AS num, customer.lastname AS name,customer.community as community
    }
    return c,num,name,community
    ORDER BY num DESC limit 3
    `;
    const query2=`
MATCH (c1:Customer)-[b:BoughtAt]->(s:Store)
WHERE c1.identity IN $cList AND NOT EXISTS {
  MATCH (c2:Customer {identity: $identity})-[:BoughtAt]->(s)
}
RETURN c1.identity,c1.community,s.storeId, s.name, b.num
ORDER BY b.num DESC limit 3
`;
    const identity=0;
    const users= await getNeoRecommendationUser(query, identity);
    console.log("neo-users");
    console.log(users);
    console.log(typeof(users));
    const cList = users.map(user => user.c);
    console.log(cList);
    console.log(typeof(cList));
    const params = {
        identity: identity,
        c: cList
    };
    const stores= await getNeoRecommendationStore(query2,identity,cList);
    console.log("neo-stores");
    console.log(stores);
    let rating;
    console.log(req.user);
    const user=req.user;
    if (stores.every(store => store.community === user.community)) {
        rating = 100;
      } else if (stores.length === 1) {
        rating = 33;
      } else if (stores.length === 2) {
        rating = 66;
      } else {
        rating = 0;
      }
      
      console.log('Rating:', rating);
    
  } catch (err) {
    console.error(err);
    next(err);
  }
});


module.exports = router;