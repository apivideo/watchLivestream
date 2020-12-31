require('dotenv').config();
//import express from 'express';
const express = require('express');
//express for the website and pug to create the pages
const app = express();
const pug = require('pug');
const path = require('path');
var publicDir = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','pug');
app.use(express.static('public'));

var request = require("request");

//apivideo
const apiVideo = require('@api.video/nodejs-sdk');


const apiVideoKey = process.env.apivideoKeyProd;



app.get('/', (req, res) => {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	//create apivideo client
	const client = new apiVideo.Client({ apiKey: apiVideoKey });
	
	//pi livstream Id  is liEJzHaTzuWTSWilgL0MSJ9
	var liveStreamId = 'liEJzHaTzuWTSWilgL0MSJ9';
	if(req.query.streamId){
		liveStreamId=req.query.streamId;
	}

	//assume that it is not broadcasting
	var liveResult = "The camera is not currently livestreaming. Please try again later.";
	var videoIframe = "";
	var thumbnail = "";
	//get this livestream
	let result =client.lives.get(liveStreamId);
	result.then(function(liveStream){
		console.log(liveStream);
		var broadcasting = liveStream.broadcasting;
		console.log(broadcasting);
		var recordedVideos = [];		
		if(broadcasting){
			liveResult = "Here is your Live Video:";
			videoIframe = "iframe src=\""+liveStream.assets.player+"#autoplay\" width=\"100%\" height=\"50%\" frameborder=\"0\" scrolling=\"no\" allowfullscreen=\true\"";
			

		}else{
			videoIframe = "img src ="+liveStream.assets.thumbnail +" width=\"100%\"";
		}


			//Now we can get the most recent VOD from the stream.
		    let videoList = client.videos.search({'liveStreamId': liveStreamId, sortOrder: 'desc', sortBy: 'publishedAt'});
			videoList.then(function(liveStreamList){
				//console.log(liveStreamList);

				//loop through all the videos, we'll show 5, ad if there are more than 20 - delete them
				
				for(i=0; i< liveStreamList.length; i++){
					if(i<5){
						var iframe = "iframe src=\""+liveStreamList[i].assets.player+"\" width=\"50%\" height=\"25%\" frameborder=\"0\" scrolling=\"no\" allowfullscreen=\true\"";
						var name = liveStreamList[i].title;
						var data = {
							"name": name, 
							"iframe":iframe
						};
						recordedVideos.push(data);
					}else if(i>20){
						//delete the videos...
						var videoId = liveStreamList[i].videoId;
						let deleteVid = client.videos.delete(videoId);
						deleteVid.then(function(statusCode) {
		  					console.log(videoId, "deleted");
		  					console.log(statusCode);
						}).catch(function(error) {
		  					console.error(error);
						});	
					}


				}
				//now we have an array with all the videos to show:
				console.log(recordedVideos);
				return res.render('live', {liveResult, videoIframe, recordedVideos});
			}).catch((err) => {
				console.log(err);
			});

		
		



		

	}).catch((error) => {
		console.log(error);
	});
});




//testing on 3003
app.listen(3003, () =>
  console.log('Example app listening on port 3003!'),
);
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
    // Note: after client disconnect, the subprocess will cause an Error EPIPE, which can only be caught this way.
});

