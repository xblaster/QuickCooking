
var http = require("http");
var fs = require('fs');
var xmldoc = require("xmldoc");

var gm = require('gm');

//var host = "localhost";
var hosttotal = "cook.lo2k.net:3002";
var host = "cook.lo2k.net";
var hostport = 8983;


var crypto = require("crypto");

var sys = require("sys");
  
var request = require('request')

var _ = require('lodash');


//var tesseractBin = "\"C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe\"";
var tesseractBin = "tesseract";
//var gsbin = "\"C:\\Program Files (x86)\\gs\\gs9.07\\bin\\gswin32c.exe\"";
var gsbin = "ghostscript";

var pdfpath = process.argv[2];

console.log("process pdf "+pdfpath);


function separatePdf(pdfpath, cb) {
  var exec = require('child_process').exec,
    cmd = exec(gsbin+" -dBATCH -dNOPAUSE -dSAFER -sDEVICE=jpeg -dJPEGQ=95 -r600x600 -dPDFFitPage -dFIXEDMEDIA -sOutputFile=%03d.jpg "+pdfpath, function(error, stdout, stderr) {
      console.log(stdout);



      if (error) {
        console.log(stderr);
        return;
      }

      cb();

    });
}

function getSha1OfImg(imgpath, finalCb) {
  console.log("calculate sha1 of "+imgpath);
  var cb = finalCb;
  var shasum = crypto.createHash('sha1');

  var s = fs.ReadStream(imgpath);

  s.on('data', function(d) {
    shasum.update(d);
  });

  s.on('end', function() {

    var d = shasum.digest('hex');
    console.log("calculate sha1 of "+imgpath+" ok");
    cb(imgpath, d);
  });

}


function constructJson(imgpath, signature, content) {
  //console.log("content = "+content.toString("utf8").substring(0,300));
  console.log("signature = "+signature);

  var recette = { 'title' : 'unknown', 
                  'recette': content.toString("utf8"), 
                  'category': "scanned",
                  'id': signature}
  addElt([recette]);

}

/** process the file **/
var  ocrFile = function(imgpath, signature) {

 
  uploadFile(imgpath, signature);
  console.log("process "+imgpath);
  var cmdl = tesseractBin+" "+imgpath+" "+signature+" -l fra -psm 1";
  console.log(cmdl);
  var exec = require('child_process').exec,
    //cmd = exec("echo lol", function(error, stdout, stderr) {
    
    cmd = exec(cmdl, function(error, stdout, stderr) {
      //console.log("command ok");
      console.log(stdout);

      if (error) {
        console.log(stderr);
        return;
      }

      constructJson(imgpath, signature, fs.readFileSync(signature+".txt"));
      
      fs.unlinkSync(signature+".txt");

    });

     while(!fs.existsSync(signature+".txt")) {
        //console.log("wait !");
      }
    console.log("traitement ok pour "+imgpath);
}



function addElt(param, res) {
    
    jsonObject = JSON.stringify(param);
    //console.log(jsonObject);
    console.log("add ----------------------");
    //console.log(param);

    var postheaders= {
      'Content-Type': 'application/json',
      'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
    };

    var options = {
      host: host,
      port: hostport,
      path: '/solr/update?commit=true', //or recettes/misc
      method: 'POST',
      headers: postheaders
    }

    var httpReq = http.request(options, function(resP) {
      //console.log(res);

      resP.on('data', function(d) {
        console.info(d.toString());
      })


    });

    httpReq.write(jsonObject+",");
    httpReq.end();

    httpReq.on('error', function(e) {
      console.error('add elt '+e);
    });
};


var __list;


function removeAllImage() {
    var l = _.filter(fs.readdirSync("."), function(value) {
      return value.indexOf("jpg")!=-1});
    _.map(l, function(value, key, list) {
        fs.unlinkSync(value);
    })
}

function scanAllImage() {
    __list = _.filter(fs.readdirSync("."), function(value) {
      return value.indexOf("jpg")!=-1});
    scanAsync();
}

function scanAsync() {
  console.log(" queue "+__list.length);
  //console.log(__list);
  var elt = _.head(__list);
  __list = _.tail(__list);
  getSha1OfImg(elt, handleValue);            
  
  
}

function uploadFile(imgpath, signature) {
  console.log('upload file '+imgpath);
  var newFileName = "signature_"+signature+".jpg";
  gm(imgpath).resize(720).write(newFileName, onFileResized(newFileName, signature));
}

function onFileResized(imgpath, signature) {
  console.log('uploading file '+imgpath);
  return function() {
       var r = request.post('http://'+hosttotal+'/upload', function(error, response, body) {
        if (error) {
          console.error("error during upload"+error);
        }
        else {
          console.log('file uploaded ==> '+imgpath);
        }
      });
      var form = r.form();
      form.append("uploadfile",fs.createReadStream(imgpath));
      form.append("filename",signature+"_img.jpg");
  }
}

var handleValue = function(imgpath, signature) {
  ocrFile(imgpath, signature);
  scanAsync();
}

// main

removeAllImage();
separatePdf(pdfpath, scanAllImage);
removeAllImage();

//scanAllImage();
