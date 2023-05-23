const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
//const { Post, User, Hashtag } = require('../models');
const { getUserRecord: User }   = require('../models/user');
const {getSimilarStore, getSimilarStoreInfo} = require('../neo4j/similarity');
//const {getNeoRecommendationUser, getNeoRecommendationStore} = require('../neo4j/rating');
const request = require("request");
const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    console.log("xxxxx");
    console.log(res.locals.user);
    next();
});

//폭염': 0, '더위': 1, '선선함': 2, '쌀쌀함': 3, '추위': 4, '한파': 5, '눈': 6, '비': 7, '장마': 8
router.use( async (req, res, next) => {
    try {
        let date = new Date();
        console.log("date: " + date);

        let hour = date.getHours();
        if (hour == "0") {
            date = new Date(date.getTime() - 60 * 60 * 1000);
        }
        let year = date.getFullYear();
        let month = date.getMonth() + 1; //1월을 0으로 반환값이 나오므로 +1
        let day = date.getDate();
        let minute = date.getMinutes();

        if (month < 10) {
            month = "0" + month;
        }

        if (day < 10) {
            day = "0" + day;
        }

        //초단기 예보는 45분이후로 API호출이 가능해서 예로 10시 10분이면 9시나 9시 30분으로 base_time을 설정해야한다
        if (hour < 11) {
            hour = "0" + (hour - 1);
        } else {
            hour = hour - 1;
        }

        if (minute < 10) {
            minute = "0" + minute;
        }

        const yearMonthDay = `${year}${month}${day}`;
        const hourMinute = `${hour}${minute}`;
        const currentTime = new Date().toLocaleString();

        console.log(yearMonthDay);
        console.log(hourMinute);
        const url =
        "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";
        let queryParams =
        "?" +
        encodeURIComponent("serviceKey") +
        "=ugqSJxHzZYRe6wuifFPL1LCIauXUJhB80lmSsG8unpOK%2BW7Ja2g3nAjvfQ%2Bmg9JQnKA664z48PSPWmvC1s7uBQ%3D%3D";
        queryParams +=
        "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1");
        queryParams +=
        "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("30");
        queryParams +=
        "&" + encodeURIComponent("dataType") + "=" + encodeURIComponent("JSON");
        queryParams +=
        "&" +
        encodeURIComponent("base_date") +
        "=" +
        encodeURIComponent(`${yearMonthDay}`);
        queryParams +=
        "&" +
        encodeURIComponent("base_time") +
        "=" +
        encodeURIComponent(`${hourMinute}`);
        queryParams +=
        "&" + encodeURIComponent("nx") + "=" + encodeURIComponent("61");
        queryParams +=
        "&" + encodeURIComponent("ny") + "=" + encodeURIComponent("125");

        console.log(url + queryParams);
        let weatherFetched = false; 
        console.log("session-weather2");
    console.log(req.session.weather);
    console.log("session-weather-null2");
    console.log(req.session.weather==null);
        if (req.session.weather == null) {
        request(
            {
                url: url + queryParams,
                method: "GET",
            },
            function (error, response, body) {
                if (error) {
                    console.error(error);
                    return;
                }

                const data = JSON.parse(body);

                let items = data.response.body.items.item;
                let t1hValue = null;
                let ptyValue = null;
                let weather = null;

                ptyValue = items[6].fcstValue;
                t1hValue = items[24].fcstValue;

                t1hValue = getTemStatus(t1hValue);
                ptyValue = getPtyStatus(ptyValue);
                console.log("ptyValue:" + ptyValue);
                weather = getWeather(t1hValue, ptyValue);
                if (weather != null) {
                    console.log(`현재 강남구 ${items[6].fcstTime}시, 날씨:${weather}`);
                    res.locals.weather = weather;
                    req.session.weather = weather; 
                    //next();
                    weatherFetched = true;
                }
                // Call next() only if the weather data is successfully fetched
                
                //resolve(weather);
            }
        );
        /*if (weatherFetched) {
            next();
        }*/
    }
        next(); 

        /*const fetchWeather = () => {
            return new Promise((resolve, reject) => {
              request(
                {
                  url: url + queryParams,
                  method: "GET",
                },
                function (error, response, body) {
                  if (error) {
                    reject(error);
                    return;
                  }
                  const data = JSON.parse(body);

                let items = data.response.body.items.item;
                let t1hValue = null;
                let ptyValue = null;
                let weather = null;

                ptyValue = items[6].fcstValue;
                t1hValue = items[24].fcstValue;

                t1hValue = getTemStatus(t1hValue);
                ptyValue = getPtyStatus(ptyValue);
                console.log("ptyValue:" + ptyValue);
                weather = getWeather(t1hValue, ptyValue);
                if (weather != null) {
                    console.log(`현재 강남구 ${items[6].fcstTime}시, 날씨:${weather}`);
                    res.locals.weather = weather;
                }
      
                  // Parse the response and extract weather data
      
                  resolve(weather);
                }
              );
            });
          };
      
          // Fetch the weather data
          const weather = await fetchWeather();
      
          // Set the weather value in res.locals
          res.locals.weather = weather; */
      
          //next();

        function getPtyStatus(ptyValue) {
            switch (ptyValue) {
                case "1":
                case "2":
                case "5":
                case "6":
                    return "비";
                case "3":
                case "7":
                    return "눈";
                default:
                    return "강수없음";
            }
        }
        function getTemStatus(t1hValue) {
            let tem = Number(t1hValue);
            if (tem >= 33) {
                return "0";
            } else if (tem >= 23) {
                return "1";
            } else if (tem >= 12) {
                return "2";
            } else if (tem >= 5) {
                return "3";
            } else if (tem >= -12) {
                return "4";
            } else {
                return "5";
            }
        }
  
        function getWeather(t1hValue, ptyValue) {
            if (ptyValue == "7") {
                if (t1hValue == "0" || t1hValue == "1") {
                    return "8";
                } else if (t1hValue == "2" || t1hValue == "3") {
                    return "비";
                }
            } else if (ptyValue == "6") {
                if (t1hValue == "5") {
                    return "5"; //?@
                } else {
                    return "6";
                }
            } else if (ptyValue == "강수없음") {
                return t1hValue;
            } else {
                return "알수없음";
            }
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
    //next();
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
        if (res.locals.user) {
            /*res.render('main', {
                title: 'NodeBird'
            });*/
            console.log('user print');
            console.log(req.user);
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
    //const weather_t = user['w' + res.locals.weather];
    //console.log("weather_t: ",weather_t);
    //const weather=user['w2'];
    //var weather_t;
    /*if(weather=='2'){
        //weather_t = user['w' + res.locals.weather];
        console.log("kkkkk");
        weather_t = user['w2'];
    }*/
    /*if (weather === '2') {
        weather_t = user['w' + res.locals.weather];
    } else {
        weather_t = user['w' + res.locals.weather];
    }*/
    //weather_t = user['w' + res.locals.weather];
    //console.log(weather_t);
    
    console.log("session-weather");
    console.log(req.session.weather);
    console.log("session-weather-null");
    console.log(req.session.weather==null);
    //const weather = user['w' + res.locals.weather];
    const weather = user['w' + req.session.weather];
    console.log("weather: ",weather);
    //console.log("weather: ",res.locals.weather);
    console.log(typeof(res.locals.weather));
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