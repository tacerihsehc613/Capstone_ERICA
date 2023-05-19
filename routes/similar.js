const express = require('express');

const { getUserRecord, getUserRecord2 } = require('../models/user');
const {getSimilarStore, getSimilarStoreInfo} = require('../neo4j/similarity');
const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    //console.log("xxxxx22");
    //console.log(res.locals.user);
    next();
});

router.get('/', async (req, res, next) => {
  try {
    const query=`
        MATCH (s:Customer_Similar), (c:Customer)
        WHERE s.identity = $identity AND s.identity=c.identity
        RETURN c.identity as identity,c.lastname as lastname,s.w0 as w0,s.w1 as w1,s.w2 as w2,s.w3 as w3,s.w4 as w4,s.w5 as w5,s.w6 as w6,s.w7 as w7,s.w8 as w8
    `;
    const query2 = `
        MATCH (s:Store) 
        WHERE s.storeId IN $identityList
        RETURN s.storeId as storeId, s.name as name
    `;
    const identity=0;
    const user = await getSimilarStore(query, identity);
    const weather=user['w2'];
    const regex = /\d+/g;  
    const matches = weather.match(regex);  
    const numbers = matches.map(match => Number(match));
    console.log("weather");
    console.log(numbers);
    console.log(typeof(numbers));
    console.log(numbers[0]);
    const identityList = numbers;
    const params = {
        identityList: identityList
    };
    const storeList = await getSimilarStoreInfo(query2, params);
    console.log(user);
    for (var i = 0; i < storeList.length; i++) {
        console.log(storeList[i]['storeId']);
        console.log(storeList[i]['name']);
    }
    //res.render('user', { user });
  } catch (err) {
    console.error(err);
    next(err);
  }
});


module.exports = router;