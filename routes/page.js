const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
//const { Post, User, Hashtag } = require('../models');
const { getUserRecord: User }   = require('../models/user');

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

router.get('/', async (req, res, next) => {
    try{
        const query2=`
            MATCH (n:Customer)
            WHERE n.identity=$identity
            RETURN n.identity as identity, n.lastname as id, n.loginPw as password,n.pagerank as pagerank,n.community as community
        `;
        //const user = await User(query2, identity);
        res.render('main', {
            title: 'NodeBird'
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
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