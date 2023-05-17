const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
//const { Post, User, Hashtag } = require('../models');
const { getUserRecord: User }   = require('../models/user');
const {getSimilarStore, getSimilarStoreInfo} = require('../neo4j/similarity');
const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    console.log("xxxxx");
    console.log(res.locals.user);
    next();
});

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { title: '내 정보 - NodeBird' });
});

/*router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', { title: '회원가입 - NodeBird '});
});*/

router.get('/moderator', isLoggedIn, (req, res) => {
    res.render('moderator', { title: 'Manage Store' });
});

router.get('/', async (req, res, next) => {
    try{
        const query2=`
            MATCH (n:Customer)
            WHERE n.identity=$identity
            RETURN n.identity as identity, n.lastname as id, n.loginPw as password,n.pagerank as pagerank,n.community as community
        `;
        //const user = await User(query2, identity);
        console.log('user print');
        console.log(req.user);
        /*res.render('main', {
            title: 'NodeBird'
        });*/
        if (res.locals.user) {
            /*res.render('main', {
                title: 'NodeBird'
            });*/
            return res.redirect('/neo/review');
        } else {
            res.render('login', {
                title: 'JR Login'
            });
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/mypage', isLoggedIn, async (req, res) => {
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
    const identity=req.user['identity'];
    const user = await getSimilarStore(query, identity);
    const weather=user['w2'];
    const regex = /\d+/g;  
    const matches = weather.match(regex);  
    const numbers = matches.map(match => Number(match));
    const params = {
        identityList: numbers
    };
    const stores = await getSimilarStoreInfo(query2, params);
    console.log("mypage");
    console.log(identity);
    console.log(user);
    for (var i = 0; i < stores.length; i++) {
        console.log(stores[i]['storeId']);
        console.log(stores[i]['name']);
        console.log(stores[i]['img']);
    }
    console.log(stores);
    console.log(stores[0]);
    res.render('mypage', { 
        title: 'JR My Page',
        stores: stores
     });
});

/*router.get('/hashtag', async (req, res, next) => {
    const query = req.query.hashtag;
    if(!query) {
        return res.redirect('/');
    }
    try {
        const hashtag = await Hashtag.findOne({ where: { title: query } });
        let posts = [];
        if (hashtag) {
            posts = await hashtag.getPosts( {include: [{ model: User }] });
        }
        return res.render('main', {
            title: `${query} | NodeBird`,
            twits: posts,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
}); */

/* router.get('/', (req, res, next) => {
    const twits = [];
    res.render('main', {
        title: 'NodeBird',
        twits,
    });
}); */

module.exports = router;