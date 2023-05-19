const express = require('express');
const { getNodeRecords, getEdgeRecords } = require('../neo4j/company');
const { getNodeRecords2, getEdgeRecords2 } = require('../neo4j/review');
const { getCustomerStoreList } = require('../neo4j/aura');
const getRecords = require('../ML/connect');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const {getNeoRecommendationUser, getNeoRecommendationStore} = require('../neo4j/rating');

//const User = require('../models/user');
const { getUserRecord, getUserRecord2 } = require('../models/user');
//const { getUserRecord: User }   = require('../models/user');
const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  console.log("neo-user");
  console.log(res.locals.user);
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const query=`
      MATCH (n:Customer)
      WHERE n.lastname = $id and n.loginPw=$password
      RETURN n.identity as identity, n.lastname as id, n.loginPw as password,n.pagerank as pagerank,n.community as community
    `;
    const query2=`
      MATCH (n:Customer)
      WHERE n.identity=$identity
      RETURN n.identity as identity, n.lastname as id, n.loginPw as password,n.pagerank as pagerank,n.community as community
    `;
    const id="Kang";
    const password=221115889719;
    const identity=0;
    const user = await getUserRecord(query, id, password);
    const user2 = await getUserRecord2(query2,identity);
    console.log(user);
    console.log(user2);
    console.log(typeof(user));
    console.log(user['id']);
    console.log(user['identity']);
    res.render('user', { user });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/company',isLoggedIn, async (req, res, next) => {
  try {
    const limit = 10; // the limit value can be set to any number you want
    const query=`
      match (c:Customer)
      return c.identity as id, c.lastname as lastname, c.pagerank as pagerank, c.community as community
      order by c.pagerank desc 
      LIMIT $limit
    `;
    const query2 = `
      MATCH (c:Customer)
      WITH c ORDER BY c.pagerank DESC LIMIT $limit
      with COLLECT(c.identity) AS c_ids
      UNWIND c_ids AS c_id with c_id, c_ids
      MATCH (i:Customer_INTER) WHERE i.from = c_id
      UNWIND keys(apoc.convert.fromJsonMap(i.map)) AS c2_id
      MATCH (c2:Customer) WHERE c2.identity = toInteger(c2_id) AND c2.identity <> c_id and c2.identity in c_ids WITH c_id,  c2_id,apoc.convert.fromJsonMap(i.map)[c2_id] AS weight
      RETURN c_id as from, toInteger(c2_id) as to, weight
    `;
    const query3=`
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
        const query4=`
            MATCH (c1:Customer)-[b:BoughtAt]->(s:Store)
            WHERE c1.identity IN $cList AND NOT EXISTS {
                MATCH (c2:Customer {identity: $identity})-[:BoughtAt]->(s)
            }
            RETURN c1.identity,c1.lastname,c1.community,s.storeId, s.name, b.num
            ORDER BY b.num DESC limit 3
        `;
    var graph = {
      nodes : [],
      links : []
    }
    graph.nodes= await getNodeRecords(query, limit);
    graph.links = await getEdgeRecords(query2, limit);
    console.log('user33 print');
    console.log(req.user);
    const identity=req.user['identity'];
        const comunity=req.user['community'];
        const users = await getNeoRecommendationUser(query3, identity);
        const cList = users.map(user => user.c);
        const stores= await getNeoRecommendationStore(query4,identity,cList);
        let rating;
        if (stores.every(store => store.community === comunity)) {
            rating = 100;
          } else if (stores.length === 1) {
            rating = 33;
          } else if (stores.length === 2) {
            rating = 66;
          } else {
            rating = 0;
          }
        console.log('stores print');
        console.log(stores);
        console.log('Rating:', rating);
    //res.render('neo-graph', { g: JSON.stringify(graph).replace(/"/g, '&quot;')  });
    //res.render('neo-graph', { g: JSON.stringify(graph)  });
    //res.render('neo-graph', { g: graph });
    res.render('force', { g: JSON.stringify(graph), stores, rating });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/review', async (req, res, next) => {
  try {
    const limit = 10; // the limit value can be set to any number you want
    const query=`
      match (r:Review)
      return r.identity as id, r.store as store, r.text as text, r.pagerank as pagerank, r.community as community
      order by r.pagerank desc 
      LIMIT $limit
    `;
    const query2 = `
      MATCH (c:Review)
      WITH c ORDER BY c.pagerank DESC LIMIT $limit
      with COLLECT(c.identity) AS c_ids
      UNWIND c_ids AS c_id with c_id, c_ids
      MATCH (i:Review_INTER) WHERE i.from = c_id
      UNWIND keys(apoc.convert.fromJsonMap(i.map)) AS c2_id
      MATCH (c2:Review) WHERE c2.identity = toInteger(c2_id) AND c2.identity <> c_id and c2.identity in c_ids WITH c_id,  c2_id,apoc.convert.fromJsonMap(i.map)[c2_id] AS weight
      RETURN c_id as from, toInteger(c2_id) as to, weight
    `;
    var graph = {
      nodes : [],
      links : []
    }
    graph.nodes= await getNodeRecords2(query, limit);
    graph.links = await getEdgeRecords2(query2, limit);

    //res.render('neo-graph', { g: JSON.stringify(graph).replace(/"/g, '&quot;')  });
    //res.render('neo-graph', { g: JSON.stringify(graph)  });
    //res.render('neo-graph', { g: graph });
    //console.log(graph);
    res.render('force2', { g: JSON.stringify(graph) });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/aura', async (req, res, next) => {
  try {
    const customers = await getCustomerStoreList();
    res.render('neo', { customers });
  } catch (err) {
    console.error(err);
    next(err);
  }
});


router.get('/review', async (req, res, next) => {
  try {
    const limit = 6; // the limit value can be set to any number you want
    const query = `
      match (r:Review)
      return r.identity as id, r.store as store, r.pagerank as pagerank, r.community as community
      order by r.pagerank desc 
      LIMIT $limit
    `;
    const records = await getRecords(query, limit);
    res.render('review', { records });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
}); 

router.post('/review-text', (req, res) => {
  const { limit } = req.body;
  const query = `
    MATCH (n:Review)
    RETURN n.store, n.address, n.text, n.pagerank as pg
    ORDER BY pg DESC
    LIMIT $limit
  `;

  getRecords(query, limit)
    .then(records => {
      res.render('review', { records });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
});
module.exports = router;