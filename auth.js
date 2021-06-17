youfi.auth=new function(){
	this.windowHandle=null;
	this.lifeTime=0;
	this.tokenType="";
	this.accessKey="";
	this.link="https://accounts.google.com/o/oauth2/auth"
		+"?client_id=266746415306-9ckov9p9isv3kknhllf6jerjno7qlpt6.apps.googleusercontent.com"
		+"&redirect_uri=https://cyberfoxhax.github.io/YouFi/OAuthHandler"
		+"&scope=https://gdata.youtube.com"
		+"&response_type=token";
	this.timeoutId=0;
	this.apiKey="AIzaSyC7siu7rgcTfIA-Ft0tI2W146kqUP1qSSU";
	
	this.btnLogin_onClick=function(){
		window.addEventListener("message", youfi.auth.onResponse);
		youfi.auth.windowhandle=window.open(youfi.auth.link,'authWindow','height=512,width=400');
	}
	this.refreshKey=function(){
		console.log("refreshing OAuth key");
		window.addEventListener("message", youfi.auth.onResponse);
		var iframe=document.createElement("iframe");
		iframe.src=youfi.auth.link;
		iframe.height="1";
		iframe.width ="1";
		youfi.auth.windowHandle=iframe;
		document.body.appendChild(youfi.auth.windowHandle);
	}
	this.onResponse=function(event){
		if(typeof event.data != "string")
			return;
		var message = JSON.parse(event.data);
		if(message.signature != "EFzOoCth9a")
			return;
		window.removeEventListener("message", youfi.auth.onResponse);
		
		// parse data
		var data=message.message.substring(1).split("&");
		var json={};
		for(var i in data){
			var indexOfIt=data[i].indexOf("=");
			json[data[i].substring(0, indexOfIt)]=data[i].substring(indexOfIt+1);
		}
		
		// apply data
		youfi.auth.lifeTime=parseInt(json.expires_in);
		youfi.auth.tokenType=json.token_type;
		youfi.auth.accessKey=json.access_token;
		
		// setup timer to refresh
		if(youfi.auth.timoutId!=0)
			clearTimeout(youfi.auth.timoutId);
		youfi.auth.timoutId=setTimeout(youfi.auth.refreshKey, (youfi.auth.lifeTime-30)*1000);
		
		// cleanup
		if(youfi.auth.windowHandle!=null&&
		   youfi.auth.windowHandle.tagName=="IFRAME"){
			console.log("got the new key closing iframe");
			document.body.removeChild(youfi.auth.windowHandle);
		}
		else{
			console.log("got the key closing window");
			youfi.auth.windowhandle.close();
			youfi.playlists.getAll();
		}
		
		setTimeout(function(){
			youfi.playControls.playPause();
			setTimeout(function(){
				youfi.playControls.playPause();
			},1000);
		},1000);
	}
}

//#access_token=ya29.AHES6ZSVTEx2SQ-ZOi7DzBzWxQ4wuooA01fFEgR4KzIIBdfk3QTg
//&token_type=Bearer
//&expires_in=3600