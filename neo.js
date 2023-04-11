const express = require('express');
const { getCustomerStoreList } = require('../neo4j/connect');
const getRecords = require('../ML/connect');

const router = express.Router();

router.get('/', async (req, res, next) => {
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
      MATCH (n:Review)
      RETURN n.store, n.address, n.text, n.pagerank as pg
      ORDER BY pg DESC
      LIMIT $limit
    `;
    const records = await getRecords(query, limit);
    res.render('review', { records });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
}); 

router.post('/review', (req, res) => {
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