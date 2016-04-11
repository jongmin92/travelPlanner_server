var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = mysql.createConnection({
  'host': 'aws-rds-mysql.cjj4qeglpmie.us-west-2.rds.amazonaws.com',
  'user': 'user',
  'password': 'rlawlsrb1!',
  'database': 'TravelPlanner',
});
var route = require('./route.js');

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

  // debug
  // console.log(req);
  //console.log("userId : " + userId);
  //console.log("planName : " + planName);
  //console.log("itemInfo : \n" + itemInfo);
  //console.log("itemLength : " + itemLength);

  // ShortPass 알고리즘
  route.routeAPI(itemInfo);

  connection.query('delete from Place where id=? && planname=?;', [
    userId,
    planName
  ], function (error, info) {
    if (!error) {

      // debug
      console.log("--- 출발지 : " + itemInfo[itemLength - 2].placename + "---\n");
      console.log("--- 도착지 : " + itemInfo[itemLength - 1].placename + "---\n");

      for (var i = 0; i < itemLength - 2; i++) {
        // debug
        //console.log(itemInfo[i]);

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

            } else {
              console.log(error);
            }
          });
      }

    }
  });

  res.status(200).json({result: true});
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