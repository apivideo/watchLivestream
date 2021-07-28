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
//const apiVideo = require('@api.video/nodejs-sdk');
const apiVideoClient = require('@api.video/nodejs-client');

const apiVideoKey = process.env.apivideoKeyProd;
const client = new apiVideoClient({ apiKey: apiVideoKey });

//pi livestreamId
var piLiveId = 'liEJzHaTzuWTSWilgL0MSJ9'
//when the webhook fires broadcasting true - we'll add the value of the views to be 500 for testing
viewersAtStartOfStream = { [piLiveId]: 500};

//is the livestream going? Build JSON array of all livestreams
//seed with pi livestream
broadcastingStatus = new Set;
broadcastingStatus = {[piLiveId]: false};
var startCount=0;
/*
console.log(viewersAtStartOfStream);
if(viewersAtStartOfStream.hasOwnProperty(piLiveId)){
	console.log(viewersAtStartOfStream[piLiveId]);
}else{
	console.log("crap");
}
*/

app.get('/broadcast', (req, res) => {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	//create apivideo client
	
	
	var numberOfWatchers = "";
	var liveStreamId = piLiveId;
	if(req.query.streamId){
		liveStreamId=req.query.streamId;
	}

	//assume that it is not broadcasting
	broadcastingStatus = {[liveStreamId]: false};
	var liveResult = "The camera is not currently livestreaming. Please try again later.";
	var videoIframe = "";
	var thumbnail = "";
	//get this livestream
	let result =client.liveStreams.get(liveStreamId);
	result.then(function(liveStream){
		console.log(liveStream);
		var broadcasting = liveStream.broadcasting;
		console.log(broadcasting);
	
		if(broadcasting){
			broadcastingStatus[liveStreamId] = true;	
			liveResult = "Here is your Live Video:";
			videoIframe = "iframe src=\""+liveStream.assets.player+"#autoplay\" width=\"100%\" height=\"50%\" frameborder=\"0\" scrolling=\"no\" allowfullscreen=\true\"";
			
			//get number of sessions when stream started
			startCount = viewersAtStartOfStream[liveStreamId];
			var currentCount = getLiveSessionCount(liveStreamId);
			currentCount.then(function(currentWatchCount){
				console.log(startCount + " " + currentWatchCount);
				numberOfWatchers = currentWatchCount - startCount;
				console.log("numberOfWatchers", numberOfWatchers);
				var vodVideoList =getVodList(liveStreamId);
				vodVideoList.then(function(vodVideos){
					return res.render('live', {liveResult, videoIframe, vodVideos, numberOfWatchers, liveStreamId});
				})
			});

		}else{
			videoIframe = "img src ="+liveStream.assets.thumbnail +" width=\"100%\"";
			var vodVideoList =getVodList(liveStreamId);
			vodVideoList.then(function(vodVideos){
				return res.render('live', {liveResult, videoIframe, vodVideos, numberOfWatchers, liveStreamId});
			})
		}



	}).catch((error) => {
		console.log(error);
	});
});

function getLiveSessionCount(liveStreamId){

	return new Promise(function(resolve, reject){
		console.log(liveStreamId);
		var pageSize=1;
		var currentPage = 1;
		params = {
			"liveStreamId": liveStreamId,
			"pageSize":pageSize,
			"currentPage":currentPage
		}
		//get all sessions for livestream
		var sessionList = client.rawStatistics.listLiveStreamSessions(params);
		sessionList.then(function(liveSessionList){
			//get total sessoin 
			var sessionCount = liveSessionList.pagination.itemsTotal;
			console.log("live sessions" , sessionCount);
			resolve(sessionCount);
		}).catch((error) =>{
			reject(error);
		});
	});	
}
function getVodList(livestreamId){
		return new Promise(function(resolve, reject){
				//Now we can get the most recent VOD from the stream.
				var recordedVideos = [];	
		    let videoList = client.videos.list({'liveStreamId': livestreamId, sortOrder: 'desc', sortBy: 'publishedAt'});
			videoList.then(function(liveStreamList){
			//	console.log(liveStreamList.data);
				liveVideoList = liveStreamList.data;
				//loop through all the videos, we'll show 5, ad if there are more than 20 - delete them
				
				for(i=0; i< liveVideoList.length; i++){
					
					if(i<5){
						var iframe = "iframe src=\""+liveVideoList[i].assets.player+"\" width=\"50%\" height=\"25%\" frameborder=\"0\" scrolling=\"no\" allowfullscreen=\true\"";
						var name = liveVideoList[i].title;
						var data = {
							"name": name, 
							"iframe":iframe
						};
						recordedVideos.push(data);
					}else if(i>20){
						//delete the videos...
						var videoId = liveVideoList[i].videoId;
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
				resolve(recordedVideos);
			}).catch((err) => {
				console.log(err);
			});
		});
	}
//get webhook
app.post("/broadcast/receive_webhook", function (request, response) {
	console.log("new video event from api.video");
  
	let event = request.body;
	let body =request.body;
	console.log((body));
	 let headers = request.headers;
	//console.log("headers",headers);
	let type = body.type;
	console.log("webhook type: ", type);
	let emittedAt = body.emittedAt;
	webhookResponse = "";
	if(type =="live-stream.broadcast.started"){
		liveStreamId = body.liveStreamId;
		liveStreamStatus = true;
		webhookResponse = "event: " +type+ " at: "+ emittedAt+ " LiveStream,Id: "+liveStreamId+ "  has started.";
		
		//change the broadcasting status in the JSON pbject
		broadcastingStatus[liveStreamId]=liveStreamStatus;
		//TODO - get the number of views at start
		startViews = getLiveSessionCount(liveStreamId);
		startViews.then(function(startcounter){
			console.log("number of views when broadcast starts", startcounter);
			viewersAtStartOfStream[liveStreamId] = startcounter;
			webhookResponse = "event: " +type+ " at: "+ emittedAt+ " LiveStreamId: "+liveStreamId+ "  has started. There have been "+startcounter+" at the beginnig";

		});
		
  
	} else if (type =="live-stream.broadcast.ended"){
		liveStreamId = body.liveStreamId;
		liveStreamStatus = false;
		broadcastingStatus[piLiveId]=liveStreamStatus;
		webhookResponse = "event: " +type+ " at: "+ emittedAt+ " LiveStreamId: "+liveStreamId+ "  has stopped.";
  
	}
	
	//console.log(headers);
	console.log("response",webhookResponse);

	
	response.sendStatus(200);  
  });
  
// Send list of the new count of viewers every x seconds
app.get("broadcast/get_livecount", function (request, response) {


	var LiveId = request.query.live;
	console.log("LiveId", LiveId);
	console.log(viewersAtStartOfStream);
	startCount = viewersAtStartOfStream[LiveId];
	console.log("startCount", startCount);
	//we have liveid get new user count
	var currentCount = getLiveSessionCount(LiveId);
			currentCount.then(function(currentWatchCount){

				console.log(startCount + " " + currentWatchCount);
				numberOfWatchers = currentWatchCount - startCount;
				console.log("numberOfWatchers", numberOfWatchers);
				response.send("There are " +numberOfWatchers + " watching this stream!");
			}).catch((err) => {
				console.log(err);
			});
  });

  app.get("/test", function (request, response) {
		return response.render("test");
  });
  

//testing on 3003
app.listen(process.env.PORT || 3003, () =>
  console.log('Example app listening on port 3003!'),
);
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
    // Note: after client disconnect, the subprocess will cause an Error EPIPE, which can only be caught this way.
});

