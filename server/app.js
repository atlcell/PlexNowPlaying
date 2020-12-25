/******************************************
  _____  _           _   _               _____  _             _             
 |  __ \| |         | \ | |             |  __ \| |           (_)            
 | |__) | | _____  _|  \| | _____      _| |__) | | __ _ _   _ _ _ __   __ _ 
 |  ___/| |/ _ \ \/ / . ` |/ _ \ \ /\ / /  ___/| |/ _` | | | | | '_ \ / _` |
 | |    | |  __/>  <| |\  | (_) \ V  V /| |    | | (_| | |_| | | | | | (_| |
 |_|    |_|\___/_/\_\_| \_|\___/ \_/\_/ |_|    |_|\__,_|\__, |_|_| |_|\__, |
                                                         __/ |         __/ |
                                                        |___/         |___/ 
******************************************/

//Lib Import
let path = require('path');
let fs = require('fs');
let bodyParser = require('body-parser');
let colors = require('./colors');
let md5 = require("blueimp-md5");
let mkdirp = require('mkdirp');

//App Config
let config = require('./config');
let request = require('request');
let parseString = require('xml2js').parseString;
let hostURL = config.url;
let sessionURL = hostURL + '/status/sessions?X-Plex-Token=' + config.token;

//App
const express = require('express');
const app = express();
app.use(express.static(__dirname + '/..'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Index Page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../client/index.html'));
})

//Get Media Object
app.get('/nowplaying', function (req, res) {
	request(sessionURL, function (error, response, body) {
			parseString(body, function (err, result) {

				/*
				console.log('===============');
				console.log(typeof result);
				console.log(result);
				console.log(typeof result.MediaContainer);
				console.log(result.MediaContainer);				
				console.log(typeof result.MediaContainer['$']);
				console.log(result.MediaContainer['$']);
				console.log('===============');
				*/

				if(!err && result.MediaContainer['$'].size != '0'){

					var DOM_OBJ = {};
					var currentSongs = JSON.parse(JSON.stringify(result.MediaContainer.Track));

						currentSongs.forEach(function(val, index) {

							console.log('===============');
							console.log(val.Media);
							console.log('===============');

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
									parentThumb: parentThumb || 'unknown',
									album: parentTitle || 'unknown',
									title: title || 'unknown',
									artist: originalTitle || '',
									file: file || 'unknown',
									fileURL: fileURL || 'unknown',
									thumbURL: thumbURL || 'unknown',
									codec: codec || 'unknown',
									hash: md5(title),
									/////////////////
									detailColor: detailColor || "0, 0, 0",
									bgcolor: bgcolor || "0, 0, 0",
									primaryColor: primaryColor || "0, 0, 0",
									secondaryColor: secondaryColor || "0, 0, 0",
									detailColor: detailColor || "0, 0, 0"
								}
								
								console.log(DOM_OBJ);
				
								res.setHeader('Content-Type', 'application/json');
					  			res.send(JSON.stringify(DOM_OBJ));
							});
						});
		  		}

			});
			
	});

})

//Get Saved Media Object
app.get('/saved/:hash', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.sendFile(path.join(__dirname + `/../stash/${req.params.hash}/meta.json`));
})

//Convert Saved Hash to .mp4 for Social Media
app.get('/convert/:hash', function (req, res) {
	//Get the saved media hash
	//Save the media hash as an mp4
})

//Save Media Object
app.post('/save', function (req, res) {

	var saveObj = req.body;
	var stashPath = path.join(__dirname + '/../stash/' + saveObj.hash)

	console.log(saveObj.thumbURL);
	console.log(saveObj.fileURL);

	mkdirp(stashPath);

	//save thumb
	request({url: saveObj.thumbURL, encoding: 'binary'}).pipe(fs.createWriteStream(path.join(__dirname + '/../stash/' + saveObj.hash + '/thumb')));

	//save media
	request({url: saveObj.fileURL, encoding: 'binary'}).pipe(fs.createWriteStream(path.join(__dirname + '/../stash/' + saveObj.hash + '/audio')));

	//save meta
	fs.writeFile(path.join(__dirname + '/../stash/' + saveObj.hash + '/meta.json'), JSON.stringify(saveObj), { flag: 'wx' }, function(err) {
	    if (!err) {
		    res.setHeader('Content-Type', 'application/json');
			res.send({
				saved : true,
				hash : saveObj.hash
			}); 
	    } else {
	    	console.log(err);
	    }

	});


	/*

	//make path

	

	request.get({url: req.body.fileURL, encoding: 'binary'}).then(function (res) { 
		const buffer = Buffer.from(res, 'utf8'); 
		fs.writeFileSync(path.join(__dirname + '/../stash/' + req.body.hash + '/audio'), buffer); 
	});

	saveObj.fileURL = 'stash/' + req.body.hash + '/audio';
	saveObj.thumbURL = 'stash/' + req.body.hash + '/thumb';

	*/

});

//Server
app.listen(config.port, () => console.log('#PlexNowPlaying running on port ' + config.port))