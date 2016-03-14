var express = require('express');
var router = express.Router();
//Load the request module
var request = require('request');

// TODO 진규형한테 받은 값 넣기
var endX = 126.7636062976;
var endY = 37.5026717226;
var startX = 126.9835815178;
var startY = 37.5718842715;

//Lets configure and request
request({
  url: 'https://apis.skplanetx.com/tmap/routes?callback=&version=1', //URL to hit
  method: 'POST',
  headers : {
    // 'Content-Type': 'application/x-www-form-urlencoded',   
    'Accept': 'application/json',
    'appKey': '7ee755f7-eed9-3096-ab67-7083094711c9'
  },
  //Lets post the following key/values as form
  form: {
    /*
    endX: '126.7636062976',
    endY: '37.5026717226',
    startX: '126.9835815178',
    startY: '37.5718842715',
    */
    endX: endX,
    endY: endY,
    startX: startX,
    startY: startY,
    reqCoordType: 'WGS84GEO'
  }
}, function(error, response, body){
  if(error) {
    console.log(error);
  } else {
    var totalTime = JSON.parse(body).features[0].properties.totalTime;
    console.log('totalTime : ' + totalTime);
  }
});

module.exports = router;