var express = require('express');
var router = express.Router();
var models = require('../models');

// marked
var marked = require('marked');

// marked設定
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

/**
 * 新規ファイルを作成
 */
router.get('/new', function(req, res, next) {
  
  // identify_codeのテスト
  var identify = new Date().getTime().toString(16)  + Math.floor(20 * Math.random()).toString(16);
  
  // 新規マークダウンファイルを作成する
  models.markdown.create({
      identify_code: identify
  }).then(result => {
      // 新規マークダウンを作成したら/viewにリダイレクト
      res.redirect('/mds/view/' + result.id);
  });
});

/**
 * 画面表示
 */
router.get('/view/:id', function(req, res, next) {
  // id取得
  var id = req.params.id;
  
  models.markdown.findOne({
      where : {
          'id' : id
      }
  }).then(result => {
      // 新規作成時は、中身が空の可能性があるので考慮
      if (result.markdown_text != null) {
          res.render('mds/view', {
              'text' : result.markdown_text,
              'id'   : id,
              'convert_text' : marked(result.markdown_text),
              'identify_code' : result.identify_code,
          })
      } else {
          res.render('mds/view', {
              'id'   : id,
              'identify_code' : result.identify_code,
          });
      }
  })
});

/**
 * 編集権限のない画面表示
 */
router.get('/preview/:identify', function(req, res, next) {
    // 識別コードをurlより取得する
    var identify_code = req.params.identify;
    
    models.markdown.findOne({
        where : {
            'identify_code' : identify_code,
        }
    }).then(result => {
        res.render('mds/preview', {
            'convert_text' : marked(result.markdown_text),
            'id' : result.id,
        })
    })
});

/**
 * 一覧表示
 */
router.get('/list', function(req, res, next) {
    
    models.markdown.findAll({
        // where : {
        //     is_delete : null
        // },
        order : [
          ['id', 'desc']
        ]
    }).then(function(results) {
        res.render('mds/list', {results: results});
    });

        // 下の諸々はなぜか迷走した思考の塊。Objectはどうやって値として渡すねんとかなってた。戒め。

//        // データを取得する連想配列を宣言
//        var datas = [];
//        // Object（連想配列）の実験。これって、単純にresult渡して、result[key]['dataValues']でいけん？
//        Object.keys(result).forEach(function(key) {
////            Object.keys(key).forEach(function(k) {
////              console.log(key, result[k]);
////            });
////             console.log(result[key]['dataValues']);
//            // @TODO もしこれでいくなら絶対関数化 20171203 
//            datas.push({name : 'id', value : result[key]['dataValues']['id']});
//            datas.push({name : 'title', value : result[key]['dataValues']['title']});
//            datas.push({name : 'markdown_text', value : result[key]['dataValues']['markdown_text']});
//            datas.push({name : 'created_at', value : result[key]['dataValues']['created_at']});
//            datas.push({name : 'updated_at', value : result[key]['dataValues']['updated_at']});
//        });
        
        
//        res.render('mds/list', {
//            result : result
//        })
//        result.forEach(r => {
//            console.log(r.id, r.identify_code, r.title, r.created_at);
//        });
//        console.log(result);
});

/**
 * 記事の削除
 * @TODO : 論理削除を行うなら、スタイルも変える必要があるな
 * @TODO : 最終的にはDELETEのHTTPステータスを使用する
 */
router.get('/delete/:id', function(req, res, next) {
    // id取得
    var id = req.params.id;

    models.markdown.update({
        is_delete : true
    }, {
        where: {
            'id' : id
        }
    }).then(result => {
        res.redirect('/mds/list');
    });
})

/**
 * 記事の復活
 */
router.get('/restore/:id', function(req, res, next) {
    // id取得
    var id = req.params.id;

    models.markdown.update({
        is_delete : false
    }, {
        where: {
            'id' : id
        }
    }).then(result => {
        res.redirect('/mds/list');
    });
})

/**
 * ajax周り
 */

/* ajax反映 */
router.post('/convert', function(req, res, next) {
  
  // 対象id
  var id = req.body.id;
  
  // 画面から取得した値
  var text = req.body.text;
  
  // テキストを保存する
  models.markdown.update({
      markdown_text: text
  }, {
      where: {
          id: id
      }
  }).then(result => {
      // マークダウンを生成し画面に渡す
      res.send(marked(text));
  });

});

/**
 * 編集権限のないプレビュー画面
 */
router.post('/preview', function(req, res, next) {
    // 対象id
    var id = req.body.id;
    
    // テキストを表示
    models.markdown.findOne({
        where : {
            'id' : id
        }
    }).then(result => {
        res.send(marked(result.markdown_text));
    })
});

module.exports = router;


