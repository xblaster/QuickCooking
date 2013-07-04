
var http = require("http");

/*jsonObject = JSON.stringify({
	"index": {
		"analysis": {
			"analyzer": {
				"testr_french": {
					"type" : "snowball",
					"language": "French"
				}
			}
		}
	}
});

var postheaders= {
	'Content-Type': 'application/json',
	'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
};

var options = {
	host: 'localhost',
	port: 9200,
	path: '/test_french2', //or recettes/misc
	method: 'POST',
	headers: postheaders
}

var req = http.request(options, function(res) {
	//console.log(res);

	res.on('data', function(d) {
		console.info(d.toString());
	})
});

req.write(jsonObject+",");
req.end();

req.on('error', function(e) {
	console.error(e);
});*/
jsonObject = JSON.stringify({
	"add": {
		"doc": {
			"id": "ER toto123",
			"title": "er ere toto2323",
			"recette": "toto123"
			}
		}
	,
		"commit": {}
		
	});

var postheaders= {
	'Content-Type': 'application/json',
	'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
};

var options = {
	host: 'localhost',
	port: 8983,
	path: '/solr/update', //or recettes/misc
	method: 'POST',
	headers: postheaders
}

var req = http.request(options, function(res) {
	//console.log(res);

	res.on('data', function(d) {
		console.info(d.toString());
	})
});

req.write(jsonObject+",");
req.end();

req.on('error', function(e) {
	console.error(e);
});

