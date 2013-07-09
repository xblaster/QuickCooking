
var http = require("http");
var fs = require('fs');
var xmldoc = require("xmldoc");

var crypto = require("crypto");

var sys = require("sys");

var _ = require('lodash');


var tesseractBin = "\"C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe\"";

var imgpath = process.argv[2];

console.log("process img "+imgpath);


function getSha1OfImg(imgpath, finalCb) {

	var cb = finalCb;
	var shasum = crypto.createHash('sha1');

	var s = fs.ReadStream(imgpath);

	s.on('data', function(d) {
		shasum.update(d);
	});

	s.on('end', function() {
		var d = shasum.digest('hex');
		cb(imgpath, d);
	});

}


function constructJson(imgpath, signature, content) {
	console.log("content = "+content.toString("utf8").substring(0,300));
	console.log("signature = "+signature);

}

/** process the file **/
var  ocrFile = function(imgpath, signature) {


	var exec = require('child_process').exec,
		cmd = exec(tesseractBin+" "+imgpath+" "+signature+" -l fra", function(error, stdout, stderr) {
			//console.log(stdout);

			if (error) {
				console.log(stderr);
				return;
			}

			constructJson(imgpath, signature, fs.readFileSync(signature+".txt"));
			fs.unlink(signature+".txt");

		});
	

}



function addElt(param, res) {
    
    jsonObject = JSON.stringify(param);
    console.log(jsonObject);
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
        //result.send(d);
      })
    });

    httpReq.write(jsonObject+",");
    httpReq.end();

    httpReq.on('error', function(e) {
      console.error(e);
    });
};


// main


getSha1OfImg(imgpath, ocrFile);