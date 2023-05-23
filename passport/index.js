const passport = require('passport');
const local = require('./localStrategy');
const { getUserRecord2: User }   = require('../models/user');
const axios = require('axios');

module.exports = () => {
    passport.serializeUser((user, done) => {
        //done(null, user.id);
        //done(null, user['identity']);
        done(null, user.identity);
    });

    /* passport.deserializeUser((id, done) => {
        User.findOne({ where: { id } })
            .then(user => done(null, user))
            .catch(err => done(err));
    }); */



    passport.deserializeUser(async (identity, done) => {
        try {
            const query2=`
                MATCH (n:Customer)
                WHERE n.identity=$identity
                RETURN n.identity as identity, n.lastname as id, n.loginPw as password,n.pagerank as pagerank,n.community as community
            `;
            const user = await User(query2, identity);
            console.log("delse");
            console.log(user);
            console.log(user.identity);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    local();
}