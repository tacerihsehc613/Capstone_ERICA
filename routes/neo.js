const express = require('express');
const { getNodeRecords, getEdgeRecords } = require('../neo4j/company');
const { getNodeRecords2, getEdgeRecords2 } = require('../neo4j/review');
const { getCustomerStoreList } = require('../neo4j/aura');
const getRecords = require('../ML/connect');

const router = express.Router();

router.get('/company', async (req, res, next) => {
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
    var graph = {
      nodes : [],
      links : []
    }
    graph.nodes= await getNodeRecords(query, limit);
    graph.links = await getEdgeRecords(query2, limit);

    //res.render('neo-graph', { g: JSON.stringify(graph).replace(/"/g, '&quot;')  });
    //res.render('neo-graph', { g: JSON.stringify(graph)  });
    //res.render('neo-graph', { g: graph });
    res.render('force', { g: JSON.stringify(graph) });
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
    console.log(graph);
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