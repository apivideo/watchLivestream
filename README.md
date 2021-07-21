# watchLivestream
watch a video livestream


This site runs on NodeJS

To create your own:

1. clone the repo
2. npm install to add all the node modeules required.
3. create a .env file and add apivideoKeyProd={your apivideo key}
4. launch (npm start)


This will launch a site at localhost:3003

You can then add  a streamId query parameter with your livestream:

For example, this url will show whatever video is playing at [livestream.a.video](https//:livestream.a.video):

https://watch.a.video/livestream/broadcast?streamId=li400mYKSgQ6xs7taUeSaEKr

### Under the hood

On a request - if there is no parameter in the URL, it will default to the "pi livestream".  

An API call is made to see if the stream "is broadcasting"  If true: the video is shown.  If false - the thumbnail appears.

A second API call is made to the VOD endpoint to see if there are any saved videos. If there are videos: the first 5 are displayed.  NB:  If there are >20 - they are all deleted.  I do this mostly to keep my demo accout from accumulating too many live stream video recordings.
