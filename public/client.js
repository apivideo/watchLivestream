window.onload =function() {
    var auto_refresh = setInterval(function(){
        var liveId = document.getElementById("livestreamid").innerHTML;
    //    console.log("liveId", liveId);
        var oReq = new XMLHttpRequest();
        const url ="broadcastget_livecount?live=" + liveId;
        oReq.open("GET", url, true);
        
        oReq.onload = function (oEvent) {
                    // Uploaded.
                        console.log("oReq.response", oReq.response);
                        var resp = oReq.response
                        
                        document.getElementById("watchers").innerHTML = resp ;
                     
           
                        
        };
        oReq.send();
        /*$.get('/get_livecount', function(webhooks) {
        var content="";
        if(webhooks.length!==0){
          console.log("number of results", webhooks.length);
          webhooks.forEach(function(webhook) {
            content+='<li>' + webhook + '</li>';
          });
          $('ul#webhooks').html(content);
          content="";
        } else {
          $('ul#webhooks').html("None received yet");
        }
      });*/
    }, 3000);
 
}