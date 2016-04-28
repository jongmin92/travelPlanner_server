var express = require('express');
//var router = express.Router();
//Load the request module
var request = require('request');

exports.routeAPI = function (itemInfo) {
  //debug
  //console.log("------ itemInfo ------\n", itemInfo);
  totalCallFuncCnt = (itemInfo.length - 4) * (itemInfo.length - 3);

  for (var i = 0; i < itemInfo.length - 3; i++) {
    for (var j = i + 1; j < itemInfo.length - 2; j++) {
      _getPropertyOfTwoLocation(itemInfo[i].placename, itemInfo[i].mapx,
        itemInfo[i].mapy, itemInfo[j].placename, itemInfo[j].mapx, itemInfo[j].mapy);
    }
  }
};

var _getPropertyOfTwoLocation = function (startName, startX, startY, endName,
  endX, endY) {
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
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      reqCoordType: 'WGS84GEO'
    }
  }, function (error, response, body) {
    if (error) {
      console.log(error);
    } else {
      time = JSON.parse(body).features[0].properties.totalTime;
      distance = JSON.parse(body).features[0].properties.totalDistance;
      //console.log("time = " + time);
      //console.log("distance = " + distance);
      property = {time: time, distance: distance};

      console.log("(" + startName + ") 과 (" + endName + ") 의 정보");
      console.log(property);
    }
  });
};

//module.exports = router;