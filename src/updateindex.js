
var http = require("http");
var fs = require('fs');
var xmldoc = require("xmldoc");

var crypto = require("crypto");

var sys = require("sys");

var _ = require('lodash');

//parse xml document
function parseDoc(document) {
	var allP = document.descendantWithPath("body.div.p");
	//console.log(allP);
	//console.log(document);
	var cat = "";
	_.each(allP, function(value, key, list) {
		console.log("-----");
		//console.log(value);
		if (value.attr) {
			console.log(value.attr.class);
		}
	});
}

//parse plain text file
function parseTxt(data) {

	var category = "";
	data = _.filter(data.split("\n"), function(data) {return data.trim().length!=0});
	var recettes = [];
	_.each(data,  function(value, key, list) {
			if (value.substring(0,1)!="-") {
				//title
				category = value.trim();
				console.log("=============== "+category);
			} else { //it's a receipt !
				console.log("-----------------");
				//- Tomates au surimi  p81 (Ã©vider les tomates, les salerÂ ; mÃ©langer le surimi rapÃ© avec un yaourt nature, 3cÃ c dâ€™huile et de vinaigre, puis rajouter sel, poivre, 1cs de cÃ¢pres, 1cs de moutarde, des cornichons coupÃ©s en rondelles et de lâ€™anethÂ ; bien mÃ©langer et remplir les tomates et mettre au frais) frais
				var m = value.trim().match(/-\s*(.*?)(p[0-9]*)?\s*\((.*?)\)+/);

				var sha1 = crypto.createHash("sha1");


				if (m) {
					
					/*console.log(m[1]);
					console.log(m[2]);
					console.log(m[3]);
					console.log(category);*/
					sha1.update(m[1]);
					

					var recette = { 'title' : m[1], 
									'recette': m[3], 
									'category': category,
									'id': sha1.digest("hex")}

					/*var recette = { 'title' : 1, 
									'recette': 'toto', 
									'category': 'plop',
									'id': 1};*/

					//
					recettes.push(recette);

				} else {
					console.log(" mismatch: "+value);
				}

				console.log(key);
				if (key > 6) {
					//	sys.exit(0);
				}
			}
				//console.log(value);
	});

	addElt(recettes);
}

fs.readFile("d:\\TOUTf2.txt", {"encoding": "utf8"}, function(err, data) {
	if(err) {
		return console.error(err);
	}

	parseTxt(data.toString());
	/*data = data.toString().replace(/style='[ \s\S]*?'/im, "");
	data = data.toString().replace(/<head>[ \s\S]*?<\/head>/im, "");
	console.log(data.substring(0,3000));

	parseDoc(new xmldoc.XmlDocument(data));*/

});





function addElt(param, res) {
    //var result = res;

    //param.id = param.id || Math.random()*9999999;
    //delete param._version_;
    //param.id="toto1332323";

      /*jsonObject = JSON.stringify({
        "add": {
          "doc": param
          }
        ,
          "commit": {}
      });*/

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
