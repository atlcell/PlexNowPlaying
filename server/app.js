const express = require('express');
const app = express();
////////////////////////////////////
let path = require('path');
let fs = require('fs');
let bodyParser = require('body-parser');
let colors = require('./colors');
let md5 = require("blueimp-md5");
let mkdirp = require('mkdirp');



let config = require('./config');
let request = require('request');
//let rq = require('request-promise');
let parseString = require('xml2js').parseString;
//let hostURL = 'http://192.168.1.44:32400';
let hostURL = 'https://192-168-1-44.36a853b665d5414290d5395b68b16037.plex.direct:32400';
let sessionURL = hostURL + '/status/sessions?X-Plex-Token=' + config.token;


//static
app.use(express.static(__dirname + '/..'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../client/index.html'));
})

//now playing OBJ
app.get('/nowplaying', function (req, res) {


	request(sessionURL, function (error, response, body) {
			parseString(body, function (err, result) {

				if(!err){

					var DOM_OBJ = {};
					var currentSongs = JSON.parse(JSON.stringify(result.MediaContainer.Track)),
						currentSongsNumber = result.MediaContainer.Track.length,
						clientSongs = [];

						currentSongs.forEach(function(val, index) {

							var parentThumb = val.$.parentThumb;
							var parentTitle = val.$.parentTitle;
							var title = val.$.title;
							var originalTitle = val.$.originalTitle;
							var file = val.Media[0].Part[0].$.key;
							var codec = val.Media[0].Part[0].$.container;
							var fileURL = hostURL + file + '?X-Plex-Token=' + config.token;
							var thumbURL = hostURL + parentThumb + '?X-Plex-Token=' + config.token;

							var debug = val.Media[0];

							colors.ImageAnalyzer(thumbURL, function(bgcolor, primaryColor, secondaryColor, detailColor) {

								DOM_OBJ = {
									parentThumb: parentThumb,
									album: parentTitle,
									title: title,
									artist: originalTitle,
									file: file,
									fileURL: fileURL,
									thumbURL: thumbURL,
									codec: codec,
									/////////////////
									hash: md5(title),
									bgcolor: "0, 0, 0",
									primaryColor: "0, 0, 0",
									secondaryColor: "0, 0, 0",
									detailColor: "0, 0, 0"
								}
								
								DOM_OBJ.bgcolor = bgcolor;
								DOM_OBJ.primaryColor = primaryColor;
								DOM_OBJ.secondaryColor = secondaryColor;
								DOM_OBJ.detailColor = detailColor;

								//console.log(DOM_OBJ);
				
								res.setHeader('Content-Type', 'application/json');
					  			res.send(JSON.stringify(DOM_OBJ));
							});
						});
		  		}

			});
			
	});
})

//hashed/saved OBJ
app.get('/saved/:hash', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.sendFile(path.join(__dirname + `/../states/${req.params.hash}.json`));
})

//hashed/saved OBJ
app.post('/save', function (req, res) {

	var saveObj = req.body;


	//make path
	mkdirp(path.join(__dirname + '/../stash/' + req.body.hash));

	//save thumb
	request({url: req.body.thumbURL, encoding: 'binary'}).pipe(fs.createWriteStream(path.join(__dirname + '/../stash/' + req.body.hash + '/thumb')));
	
	//save media
	//request({url: req.body.fileURL, encoding: 'binary'}).pipe(fs.createWriteStream(path.join(__dirname + '/../stash/' + req.body.hash + '/audio')));

	request.get({url: req.body.fileURL, encoding: 'binary'}).then(function (res) { 
		const buffer = Buffer.from(res, 'utf8'); 
		fs.writeFileSync(path.join(__dirname + '/../stash/' + req.body.hash + '/audio'), buffer); 
	});

	saveObj.fileURL = 'stash/' + req.body.hash + '/audio';
	saveObj.thumbURL = 'stash/' + req.body.hash + '/thumb';

	//save meta
	fs.writeFile(path.join(__dirname + '/../states/' + req.body.hash + '.json'), JSON.stringify(req.body), { flag: 'wx' }, function(err) {
	    if (!err) {
		    res.setHeader('Content-Type', 'application/json');
			res.send({
				saved : true,
				hash : req.body.hash
			}); 
	    }

	});

});

//app
app.listen(config.port, () => console.log('#PlexNowPlaying running on port ' + config.port))

