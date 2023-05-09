const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//const User = require('../models/user');
const { getUserRecord: User }   = require('../models/user');
module.exports = () => {
    passport.use(new LocalStrategy({
        //usernameField: 'email',
        usernameField: 'id',
        passwordField: 'password',
        //passReqToCallback: false,
    }, async (id, password, done) => {
        try {
            //const exUser = await User.findOne({ where: { id } });
            const query=`
                MATCH (n:Customer)
                WHERE n.lastname = $id and n.loginPw=$password
                RETURN n.identity as identity, n.lastname as id, n.loginPw as password,n.pagerank as pagerank,n.community as community
            `;
            const exUser = await User(query, id, password);
            if (exUser) {
                console.log("Sdfds");
                console.log(exUser);
                console.log(exUser.identity);
                done(null, exUser);
                /*const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    done(null, exUser);
                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                } */
            } else {
                done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
