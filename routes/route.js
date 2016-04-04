var express = require('express');
//var router = express.Router();
//Load the request module
var request = require('request');

// TODO 진규형한테 받은 값 넣기
/*
var endX;
var endY;
var startX;
var startY;
*/

exports.routeAPI = function (endX, endY, startX, startY) {
  var property = new Object();
  var time;
  var distance;

  //Lets configure and request
  request({
    url: 'https://apis.skplanetx.com/tmap/routes?callback=&version=1',
    method: 'POST',
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'appKey': '7ee755f7-eed9-3096-ab67-7083094711c9'
    },
    //Lets post the following key/values as form
    form: {
      endX: endX,
      endY: endY,
      startX: startX,
      startY: startY,
      reqCoordType: 'WGS84GEO'
    }
  }, function (error, response, body) {
    if (error) {
      console.log(error);
    } else {
      time = JSON.parse(body).features[0].properties.totalTime;
      distance = JSON.parse(body).features[0].properties.totalDistance;
      property = {"time" : time, "distance" : distance};
    }
  });

  return property
};

//module.exports = router;