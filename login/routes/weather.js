const express = require("express");
const User = require("../models/user");
const request = require("request");

exports.getWeather = async (req, res, next) => {
  let dateObject = await User.findOne({
    where: { last_login: req.user.dataValues.last_login },
    attributes: ["last_login"],
  });

  let date = new Date(dateObject.dataValues.last_login);
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
      }
    }
  );
  next();
};

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

//폭염': 0, '더위': 1, '선선함': 2, '쌀쌀함': 3, '추위': 4, '한파': 5, '눈': 6, '비': 7, '장마': 8
