


var express = require('express')
  , routes = require('./routes')
  //, user = require('./routes/user')
  //, testCtrl = require('./routes/test')
  , http = require('http')
  , https = require('https')

  , path = require('path')
  , request = require('request')
  , fs = require('fs');

var app = express();
var url = require('url');
var _ = require('lodash');

var gm = require('gm');


app.configure(function(){
  app.set('port', process.env.PORT || 3002);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.compress());
  app.use(express.logger('dev'));
  //app.use(express.static(__dirname+"/public", {maxAge: 60*60*24}));
  app.use(express.bodyParser({keepExtensions: true, uploadDir: __dirname+"/public/images"}));
  //app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));


  /*app.use(expressUglify.middleware({ 
    src: __dirname + '/public',
    logLevel: 'info'
    //logger: new (winston.Logger)() // Specify your own winston logger or category
  }));*/

  app.use(express.static(path.join(__dirname, 'public')));

  

});

var server = http.createServer(app);

var gmResizeCb = function(err, stdout, stderr, command) {
  console.log(command);
  if (err) {
    console.error(stderr);
  }
}

app.post('/upload', function(req, res) {
  console.log(req.files.uploadfile.name);
  var temppath = req.files.uploadfile.path;
  var savepath = "public/images/";
  var savefile = savepath+req.body.filename;

  //fs.renameSync(temppath, savepath);


  gm(temppath).resize(720).write(savepath+"l/"+req.body.filename, gmResizeCb);
  gm(temppath).resize(500).write(savepath+"m/"+req.body.filename, gmResizeCb);
  gm(temppath).resize(200).write(savepath+"s/"+req.body.filename, gmResizeCb);
  gm(temppath).resize(100).write(savepath+"xs/"+req.body.filename, gmResizeCb);

  //fs.unlinkSync(temppath);
  res.send("ok");

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
//app.get('/users', user.list);
//app.get('/test', testCtrl.show);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/** service part */

app.get('/add' , function(req, res) {
  addElt(req.query, res);
});

app.post('/add', function(req,res) {
  addElt(req.body, res);
});

function addElt(param, res) {
    var result = res;

    param.id = param.id || Math.random()*9999999;
    delete param._version_;
    //param.id="toto1332323";

      /*jsonObject = JSON.stringify({
        "add": {
          "doc": param
          }
        ,
          "commit": {}
      });*/

    jsonObject = JSON.stringify([ param]);
    console.log("add ----------------------");
    console.log(param);

    var postheaders= {
      'Content-Type': 'application/json',
      'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
    };

    var options = {
      host: 'localhost',
      port: 8983,
      path: '/solr/update?commit=true', //or recettes/misc
      method: 'POST',
      headers: postheaders
    }

    var httpReq = http.request(options, function(resP) {
      //console.log(res);

      resP.on('data', function(d) {
        console.info(d.toString());
        result.send(d);
      })
    });

    httpReq.write(jsonObject+",");
    httpReq.end();

    httpReq.on('error', function(e) {
      console.error(e);
    });


};


app.post('/delete', function(req,res) {
  delElt(req.body.id, res);
});

function delElt(id, res) {
    var result = res;

    
    jsonObject = JSON.stringify({"delete": {"id":id}});
    console.log("delete "+id+"----------------------");

    var postheaders= {
      'Content-Type': 'application/json',
      'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
    };

    var options = {
      host: 'localhost',
      port: 8983,
      path: '/solr/update?commit=true', //or recettes/misc
      method: 'POST',
      headers: postheaders
    }

    var httpReq = http.request(options, function(resP) {
      //console.log(res);

      resP.on('data', function(d) {
        console.info(d.toString());
        result.send(d);
      })
    });

    httpReq.write(jsonObject+",");
    httpReq.end();

    httpReq.on('error', function(e) {
      console.error(e);
    });


};

//////////////var retrieve a suggesiton
app.get('/suggest', function (req, res) {
  //http://localhost:8983/solr/terms?terms.fl=recette&omitHeader=true&wt=json
  var params = "terms.fl=recette&terms.prefix="+encodeURIComponent(req.query.q);

  params+="&omitHeader=true&wt=json";

    console.log(params);

    var myRequest = this;

    var postheaders= {
      'Content-Type': 'application/json'//,
    };

    var options = {
      host: 'localhost',
      port: 8983,
      path: '/solr/terms?'+params,
      method: 'GET',
      headers: postheaders
    }

    var httpReq = http.request(options, function(resP) {
      //console.log(res);

      resP.on('data', function(d) {
        console.info(d.toString());

        res.set('Content-Type','application/json');
        res.set('Accept', 'application/json, text/plain');
        res.send(200, d);
      })
    });

    //httpReq.write(jsonObject+",");
    httpReq.end();

    httpReq.on('error', function(e) {
      console.error(e);
    });

    return httpReq;
});

////////////// var search value
app.get('/search', function(req,res) {

    
    req.query.indent=true;
    var  params = _.map(req.query, function(value, key, list) {
      return key+"="+encodeURIComponent(value);
    }).join("&");

    params+="&wt=json";//&df=recetteEtTitle";

    console.log(params);

    var myRequest = this;

    var postheaders= {
      'Content-Type': 'application/json'//,
      //'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
    };

    console.log( '/solr/spell?'+params);

    var options = {
      host: 'localhost',
      port: 8983,
      path: '/solr/select?'+params, //or recettes/misc
      method: 'GET',
      headers: postheaders
    }

      var rq = request('http://localhost:8983/solr/spell?'+params, function(error, responde, body) {
          console.log(error);
          console.log(responde);
          console.log(body);
          res.set('Content-Type','application/json');
          res.set('Accept', 'application/json, text/plain');
          res.send(200, body);
    });


    

    //httpReq.write(jsonObject+",");
    return rq;
});

////////////: retrieve value
app.get('/get', function(req,res) {

    
    var params = "id="+encodeURIComponent(req.query.id);
    params+="&wt=json";

    console.log(params);

    var myRequest = this;

    var postheaders= {
      'Content-Type': 'application/json'//,
    };

    console.log( '/solr/select?'+params);

    var options = {
      host: 'localhost',
      port: 8983,
      path: '/solr/get?'+params, //or recettes/misc
      method: 'GET',
      headers: postheaders
    }


   var rq = request('http://localhost:8983/solr/select?'+params, function(error, responde, body) {

         console.log(error);
          console.log(responde);
          console.log(body);
          res.set('Content-Type','application/json');
          res.set('Accept', 'application/json, text/plain');
          res.send(200, body);

  });

    return rq;
});