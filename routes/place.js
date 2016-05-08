var express = require('express');
var mysql = require('mysql');
var request = require('request');
var router = express.Router();
var connection = mysql.createConnection({
  'host': 'aws-rds-mysql.cjj4qeglpmie.us-west-2.rds.amazonaws.com',
  'user': 'user',
  'password': 'rlawlsrb1!',
  'database': 'TravelPlanner',
});
//var Graph = require('node-dijkstra')
const Graph = require('node-dijkstra')

/*
 * Method       : POST
 * Path           : http://52.34.206.80:3000/place/add
 * Description  : 사용자가 장소를 추가합니다.
 */
router.post('/add', function (req, res, next) {

  var itemInfo = req.body.item;
  var userId = req.body.id;
  var planName = req.body.planname;
  var address = req.body.address;
  var imgpath = req.body.imgpath;
  var itemLength = req.body.item.length;

  var routeDatas = [];
  var totalCallFuncCnt;

  // debug
  //console.log("----------req----------");
  //console.log(req);

  var routeAPI = function (itemInfo) {
    routeDatas = [];
    totalCallFuncCnt = 0;

    for (var i = 0; i < itemInfo.length - 3; i++) {
      routeDatas.push([]);
      for (var j = i + 1; j < itemInfo.length - 2; j++) {
        totalCallFuncCnt++;
        _getPropertyOfTwoLocation(i, itemInfo[i].placename, itemInfo[i].mapx,
          itemInfo[i].mapy, j, itemInfo[j].placename, itemInfo[j].mapx, itemInfo[j].mapy);
      }
    }
  };

  var _getPropertyOfTwoLocation = function (startIndex,
    startName, startX, startY, endIndex, endName, endX, endY) {
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
          property = {
            startIndex: startIndex, startName: startName,
            endIndex: endIndex, endName: endName,
            time: time, distance: distance
          };

          routeDatas[startIndex].push(property);

          var routeDatasLength = 0;
          for (var i = 0; i < itemLength - 3; i++) {
            if (routeDatas[i]) {
              routeDatasLength += routeDatas[i].length;
            }
          }

          //console.log("들어옴");
          //console.log("routeDatasLength = ", routeDatasLength);

          if (routeDatasLength == totalCallFuncCnt) {
            console.log(routeDatas);
            console.log("routeDatas.length = " + routeDatas.length);
            console.log("----------모든 장소간의 거리 시간 받아옴----------");
            __makeShortestPath();
            __insertToDB();
          }
        }
      }
    );
  };

  var __makeShortestPath = function () {
    const short = new Graph();

    for (var i = 0; i < itemInfo.length - 3; i++) {
      var tmp = {};

      for (var j = 0; j < itemInfo.length - 3 - i; j++) {
        //var tmpendName = "'" + routeDatas[i][j].endName + "'";
        var tmpendName = routeDatas[i][j].endName;
        //var tmpDistance =  "'" + routeDatas[i][j].distance +  "'";
        var tmpDistance = routeDatas[i][j].distance;
        var tmpstartName = "'" + routeDatas[i][0].startName + "'";
        //var tmp = '{' + tmpendName + ': ' + tmpDistance + '}';

        //
        tmp[tmpendName] = tmpDistance;
        //

        // debug
        console.log("----------debug 시작----------");
        console.log("tmpstartName : ", tmpstartName);
        console.log("tmpendName : ", tmpendName);
        console.log("tmpDistance : ", tmpDistance);
        console.log("tmp : ", tmp);

        //console.log("routeDatas[i][0].startName : ", routeDatas[i][0].startName);
        console.log("----------debug 끝----------\n");
      }
      short.addNode(routeDatas[i][0].startName, tmp);
    }

    //var startplaceName = itemInfo[itemLength - 2].placename;
    //var endplaceName = itemInfo[itemLength - 1].placename;
    var startplaceName = "'" + itemInfo[itemLength - 2].placename + "'";
    var endplaceName = "'" + itemInfo[itemLength - 1].placename + "'";
    //const path = short.path(startplaceName, endplaceName, { cost : true });
    console.log(short);
    const path = short.path('낙원동 아구찜 거리', '청와대', {cost: true});
    console.log(path);
  };

  var __insertToDB = function () {
    var insertCnt = 0;

    connection.query('delete from Place where id=? && planname=?;', [
      userId,
      planName
    ], function (error, info) {
      if (!error) {

        // debug
        console.log("--- 출발지 : " + itemInfo[itemLength - 2].placename + "---");
        console.log("--- 도착지 : " + itemInfo[itemLength - 1].placename + "---");

        for (var i = 0; i < itemLength - 2; i++) {
          connection.query('insert into Place (id, planname, placename, address, contentid, contenttypeid, mapx, mapy, imgpath, porder) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
            [
              userId,
              planName,
              itemInfo[i].placename,
              itemInfo[i].address,
              itemInfo[i].contentid,
              itemInfo[i].contenttypeid,
              itemInfo[i].mapx,
              itemInfo[i].mapy,
              itemInfo[i].imgpath,
              i
            ],
            function (error, cursor) {
              if (!error) {
                console.log("DB Insert");

                if (++insertCnt == itemLength - 2) {
                  console.log("----------모든 장소 DB 저장 완료----------");
                  ___responseToClient(200);
                }
              } else {
                console.log(error);
                ___responseToClient(400);
              }
            });
        }
      }
    });
  };

  var ___responseToClient = function (rescode) {
    res.status(rescode).json({result: true});
    console.log("----------서버 처리 완료----------");
  };

  routeAPI(itemInfo);
});

/*
 * Method       : POST
 * Path           : http://52.34.206.80:3000/place/load
 * Description  : 사용자가 장소를 장소를 불러옵니다.
 */
router.post('/load', function (req, res, next) {

  // debug
  console.log("------------- req ------------- \n" + req);
  // console.log(req);

  var userId = req.query.id;
  var planName = req.query.planname;

  // debug
  console.log("userId : " + userId);
  console.log("planName : " + planName);

  connection.query('select * from Place where id=? && planname=? order by date desc;', [
    userId,
    planName
  ], function (error, cursor) {
    if (cursor.length == 0) {
      // DB에 저장된 플랜의 장소가 없음
      res.status(404).json();
    } else {
      // debug
      // console.log(cursor);
      // DB에 저장된 플랜의 장소가 있음
      res.status(200).json(cursor);
    }
  });

});

module.exports = router;