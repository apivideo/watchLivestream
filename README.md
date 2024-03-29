[![badge](https://img.shields.io/twitter/follow/api_video?style=social)](https://twitter.com/intent/follow?screen_name=api_video)

[![badge](https://img.shields.io/github/stars/apivideo/watchLivestream?style=social)](https://github.com/apivideo/watchLivestream)

[![badge](https://img.shields.io/discourse/topics?server=https%3A%2F%2Fcommunity.api.video)](https://community.api.video)

![](https://github.com/apivideo/.github/blob/main/assets/apivideo_banner.png)

<h1 align="center">api.video watch a video livestream</h1>

[api.video](https://api.video) is the video infrastructure for product builders. Lightning fast video APIs for integrating, scaling, and managing on-demand & low latency live streaming features in your app.

# watchLivestream
Watch a video livestream

Try it out [watch.a.video/livestream](https://watch.a.video/livestream)

This site runs on NodeJS

To create your own:

1. clone the repo
2. npm install to add all the node modeules required.
3. create a .env file and add apivideoKeyProd={your apivideo key}
4. launch (npm start)


This will launch a site at localhost:3003

You can then add a streamId query parameter with your livestream:

For example, this url will show whatever video is playing at [livestream.a.video](https//:livestream.a.video):

https://watch.a.video/livestream/broadcast?streamId=li400mYKSgQ6xs7taUeSaEKr

### Under the hood

On a request - if there is no parameter in the URL, it will default to the "pi livestream".  

An API call is made to see if the stream "is broadcasting"  If true: the video is shown.  If false - the thumbnail appears.

A second API call is made to the VOD endpoint to see if there are any saved videos. If there are videos: the first 5 are displayed.  NB:  If there are >20 - they are all deleted.  I do this mostly to keep my demo accout from accumulating too many live stream video recordings.
