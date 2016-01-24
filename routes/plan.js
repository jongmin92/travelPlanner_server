var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = mysql.createConnection({
  'host' : 'aws-rds-mysql.cjj4qeglpmie.us-west-2.rds.amazonaws.com',
  'user' : 'user',
  'password' : 'rlawlsrb1!',
  'database' : 'TravelPlanner',
});

/*
 * Method       : POST
 * Path         : http://52.34.206.80:3000/plan/list/add
 * Description  : 사용자가 플랜 리스트를 추가합니다.
 */
router.post('/list/add', function(req, res, next) { 
  
  // 플랜명을 DB와 비교하여 이미 존재하면 등록된 플랜명이라고 알림, 존재하지 않는다면 새로 등록합니다.
  connection.query('select name from PlanList where id;', [req.body.id], function (error, cursor) {
    if (error == null) {
      if (cursor.length == 0) {
        connection.query('insert into PlanList (id, name, describtion) values (?,?,?);', 
                         [req.body.id, req.body.name, req.body.describtion], function (error, info) {
          res.status(200).json({ result : true });
        });
      } else {
        if (cursor.name == req.body.name) {
          // DB에 이미 해당ID의 존재하는 플랜명이 있음
          res.status(405).json({ result : false, message : 'This planname already exist' });
        }
      }
    } else {
      // debug
      // console.log('server DB load error');
      // res.status(503).json({ result : false, message : 'server DB error' })
    }
  });
});

/*
 * Method       : POST
 * Path         : http://52.34.206.80:3000/plan/list/delete
 * Description  : 사용자가 플랜 리스트를 삭제합니다.
 */
router.post('/list/delete', function(req, res, next) { 
  
  // DB에 해당하는 플랜을 삭제합니다.
  connection.query('delete from PlanList where (id, name) values (?,?);', [req.body.id, req.body.name], function (error, info) {
    if (error == null) {
      res.status(200).json({ result : true });      
    } else {
      // debug
      // console.log('server DB load error');
      // res.status(503).json({ result : false, message : 'server DB error' });
    }
  });
});

module.exports = router;