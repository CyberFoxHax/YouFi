youfi.playControls=new function(){
	this.intervalId=null;

	//this.shuffledSongs=null; // youfiObj[]
	this.songs=null; // youfiObj[]
	this.playlistId="";
	this.currentSongId="";
	this.currentSongIndex=0;
	this.imgContainer=null; // assigned in init()

	this.quality="large";
	this.qualities = [
		"small",
		"medium",
		"large",
		"hd720",
		"hd1080",
		"highres",
		"default"
	];
	this.qualityTrans = {
		"small"		:"240p",
		"medium"	:"360p",
		"large"		:"480p",
		"hd720"		:"720p",
		"hd1080"	:"1080p",
		"highres"	:"biggest",
		"default" 	:"w/e youtube thinks fitting i.e auto"
	};
	this.btnOnclick_quality=function(){
		var i=this.qualities.indexOf(this.quality);
		this.quality = this.qualities[(i+1)%(this.qualities.length)];
		this.btnOnclick_quality.buttonElement.innerHTML = this.qualityTrans[this.quality];
		player.setPlaybackQuality(this.quality);
	};
	this.btnOnclick_quality.buttonElement = null;
	

	/////////////////////////////////////////////
	//////<-- Player Creation and events-->//////
	/////////////////////////////////////////////
	this.play=function(){
		if(youfi.playControls.currentSongId=="") return;
		document.getElementById("currentSong").removeAttribute("youfiState");
		youfi.related.getRelated();
		player.loadVideoById(youfi.playControls.currentSongId, 0, youfi.playControls.quality);

		// the active "playing" element in the results namespace
		var RPE=youfi.results.currentPlayingElement;
		// mark current song in list as playing and unmark previous
		if(RPE.children[0].youfi.playlistId==this.playlistId){
			if	   (RPE.children[0].youfi.state=="broken")
				RPE.setAttribute("youfiState","brokenEntry");
			else if(RPE.children[0].youfi.state=="warning")
				RPE.setAttribute("youfiState","warning");
			else
				RPE.removeAttribute("youfiState");
			RPE=document.getElementById("results").firstChild.firstChild.children[this.currentSongIndex+1];
			RPE.parentElement.children[this.currentSongIndex+1].setAttribute("youfiState","playing");
			youfi.results.currentPlayingElement=RPE;
		}
		player.setVolume(youfi.playControls.volume*100);

		if(youfi.playControls.playerState==youfi.playControls.playerStates.playing)
			youfi.playControls.resume();
		else
			youfi.playControls.stop();
	}
	this.onPlayerRdy=function(event){
		setTimeout(function(){
			var tags=document.body.getElementsByTagName("script");
			for(var i=0; i<tags.length; i++)
				document.body.removeChild(tags.item(i));
		},1000);
		setTimeout(function(){
			var tags=document.body.getElementsByTagName("script");
			for(var i=0; i<tags.length; i++)
			document.body.removeChild(tags.item(i));
		},2000);

		if(youfi.playControls.interval==null)
			youfi.playControls.intervalId=setInterval(function(){
				if(player.getCurrentTime()==player.getDuration()) return;
				youfi.playControls.currentPos=player.getCurrentTime()/player.getDuration();
				youfi.playControls.renderPos();
			},1000);
	}
	this.onPlayerStateChange=function(event){
		switch(event.data){
			case YT.PlayerState.PLAYING:

			break;
			case YT.PlayerState.CUED:

			break;
			case YT.PlayerState.ENDED:
				if(youfi.playControls.playMode==youfi.playControls.playModes.loopAll)
					youfi.playControls.next();
				else if(youfi.playControls.playMode==youfi.playControls.playModes.loop1){
					player.seekTo(0);
					youfi.playControls.resume();
				}
				else if(youfi.playControls.playMode==youfi.playControls.playModes.shuffle){
					youfi.playControls.currentSongIndex=Math.floor(Math.random()*youfi.playControls.songs.length);
					youfi.playControls.currentSongId =youfi.playControls.songs[youfi.playControls.currentSongIndex].ytId;
					youfi.playControls.renderSongInfo(youfi.playControls.songs[youfi.playControls.currentSongIndex]);
					youfi.playControls.play();
				}
				else if(youfi.playControls.playMode==youfi.playControls.playModes.songOnce)
					youfi.playControls.stop();
				else if(youfi.playControls.playMode==youfi.playControls.playModes.playlistOnce){
					if(youfi.playControls.currentSongIndex>=youfi.playControls.songs.length-1)
						youfi.playControls.stop();
					else 
						youfi.playControls.next();
				}
			break;
			case YT.PlayerState.PAUSED:

			break;
			case YT.PlayerState.BUFFERING:

			break;
			default: break;
		}
	}
	this.onError=function(event){
		document.getElementById("currentSong").setAttribute("youfiState","error");

		document.getElementById("title").innerHTML="This track wont play";

		var cpe=youfi.results.currentPlayingElement;
		if(cpe.children[0].youfi.state!="broken"){
			cpe.children[0].youfi.state="warning";
			cpe.setAttribute("youfiState","warning");
		}

		if(youfi.playControls.songs[youfi.playControls.currentSongIndex].duration=="-"){
			document.getElementById("uploader").innerHTML="This track has been taken down";
			document.getElementById("currentSong").children[0].src="gfx/broken_link.png";
		}
		else{
			document.getElementById("uploader").innerHTML="You can thank the uploader for blocking embeds";
			document.getElementById("currentSong").children[0].src="gfx/denied.png";
		}
		if(youfi.playControls.playerState==youfi.playControls.playerStates.playing)
			setTimeout(function(){youfi.playControls.next();},1000);
	}
	/////////////////////////////////////////////
	/////////<-- Information and UI -->//////////
	/////////////////////////////////////////////
	this.songInfo_dragStart=function(event){
		event.dataTransfer.setDragImage(document.createElement("img"),0,0);
		event.dataTransfer.effectAllowed = "all";
		for(var i in this.youfi)
			event.dataTransfer.setData(i, this.youfi[i]);
	}
	this.renderSongInfo=function(youfiObj){
		this.imageContainer.src="https://img.youtube.com/vi/"+this.currentSongId+"/0.jpg";
		var root=document.getElementById("currentSong");
		root.youfi=youfi.objectClone(youfiObj);
		root.youfi.parent="currentSong";
		var textarea=root.children[1];
		textarea.innerHTML="<p id='title'><a target='blank' href='"+youfiObj.url+"'>"+youfiObj.title+"</a></p>";
        document.title = youfiObj.title;
		textarea.innerHTML+="<p id='uploader'>~"+youfiObj.uploader+"</p>";

        //////////// <-- desktop notifications --> /////////////
        Notification.requestPermission();
		new Notification(youfiObj.title, {
			body: youfiObj.uploader,
			icon: this.imageContainer.src
		});
        ///////////////////////////////////////////////////////////////
	}
	/////////////////////////////////////////////
	/////////<-- play Controls -->///////////////
	/////////////////////////////////////////////

	this.playModes={
		loopAll:0,
		loop1:1,
		shuffle:2,
		songOnce:3,
		playlistOnce:4
	}
	this.playerStates={
		paused :0,
		playing:1,
		stopped:2
	}
	this.playMode=this.playModes.loopAll;
	this.playerState=this.playerStates.stopped;

	this.resume=function(){
		this.playerState=this.playerStates.playing;
		var rootElm=document.getElementById("playControls").children[2];
		rootElm.setAttribute("youfiState","pause");
		player.playVideo();
	}

	this.stop=function(){
		this.playerState=this.playerStates.stopped;
		var rootElm=document.getElementById("playControls").children[2];
		rootElm.removeAttribute("youfiState");
		player.seekTo(0);
		player.pauseVideo();
	}

	this.pause=function(){
		this.playerState=this.playerStates.paused;
		var rootElm=document.getElementById("playControls").children[2];
		rootElm.removeAttribute("youfiState");
		player.pauseVideo();
	}
	this.prev=function(){
		var rootElm=document.getElementById("playControls").children[2];
		rootElm.removeAttribute("youfiState");
		this.currentSongIndex--;
		if(this.currentSongIndex<0)
			this.currentSongIndex=this.songs.length-1;
		this.currentSongId=this.songs[this.currentSongIndex].ytId;
		this.renderSongInfo(this.songs[this.currentSongIndex]);
		this.play();
	}
	this.next=function(){
		var rootElm=document.getElementById("playControls").children[2];
		rootElm.removeAttribute("youfiState");
		this.currentSongIndex++;
		this.currentSongIndex%=this.songs.length;
		this.currentSongId=this.songs[this.currentSongIndex].ytId;
		this.renderSongInfo(this.songs[this.currentSongIndex]);
		this.play();
	}
	this.playPause=function(){
		if(youfi.playControls.currentSongId=="") return;
		var ctrlRef=youfi.playControls;
		if(ctrlRef.playerState==ctrlRef.playerStates.playing)
			ctrlRef.pause();
		else if(ctrlRef.playerState==ctrlRef.playerStates.stopped)
			ctrlRef.resume();
		else if(ctrlRef.playerState==ctrlRef.playerStates.paused)
			ctrlRef.resume();
	}

	/////////////////////////////////////////////
	/////////<-- Volume Control -->//////////////
	/////////////////////////////////////////////

	this.muted=false;
	this.volume=1.0;
	this.volumeControlElements={
		wrapper:null,
		barWrap:null,
		bar:null
	};

	this.mute=function(event){
		if(event.target.id=="vol"){
			if(!youfi.playControls.muted){
				youfi.playControls.muted=true;
				var saveVol=youfi.playControls.volume;
				youfi.playControls.volume=0;
				youfi.playControls.setVolume();
				youfi.playControls.renderVolume();
				youfi.playControls.volume=saveVol;
			}
			else{
				youfi.playControls.muted=false;
				youfi.playControls.setVolume();
				youfi.playControls.renderVolume();
			}
		}
	}
	this.setVolume=function(){
		player.setVolume(youfi.playControls.volume*100);
	}
	this.volMouseDown=function(event){
		event.preventDefault();
		if(event.which!=1) return;

		youfi.lastClicked=youfi.playControls.volumeControlElements.wrapper;
		youfi.playControls.volMouseMove(event);
		window.onmousemove=youfi.playControls.volMouseMove;
	}
	this.volMouseMove=function(event){
		youfi.playControls.muted=false;
		var elm=youfi.playControls.volumeControlElements;
		var totalWidth=elm.barWrap.offsetWidth;
		var elementPos=youfi.getGlobalPos(elm.barWrap);
		//elementPos.x=220;

		var mouseRelativePos=event.clientX-elementPos.x;
		var percentage=mouseRelativePos/totalWidth;
		youfi.playControls.volume=percentage;

		youfi.playControls.setVolume();
		youfi.playControls.renderVolume();
	}
	this.renderVolume=function(){
		var elm=youfi.playControls.volumeControlElements;
		var elmWidth=youfi.playControls.volume*100;
		if(elmWidth>95)
			elmWidth=95;
		else if(elmWidth<0)
			elmWidth=0;

		elm.bar.style.width=elmWidth+"%";
	}

	/////////////////////////////////////////////
	/////////<-- Position Control -->////////////
	/////////////////////////////////////////////

	this.currentPos=0.0;
	this.posElements={
		wrapper:null,
		bar:null
	};

	this.setPos=function(){
		player.seekTo(player.getDuration()*this.currentPos, true);
	}
	this.posMouseDown=function(event){
		event.preventDefault();
		if(event.which!=1) return;

		youfi.lastClicked=youfi.playControls.posElements.wrapper;
		youfi.playControls.posMouseMove(event);
		window.onmousemove=youfi.playControls.posMouseMove;
	}
	this.posMouseMove=function(event){
		var elm=youfi.playControls.posElements;
		var totalWidth=elm.wrapper.offsetWidth;
		var elementPos=youfi.getGlobalPos(elm.wrapper);

		var mouseRelativePos=event.clientX-elementPos.x;
		var percentage=mouseRelativePos/totalWidth;
		youfi.playControls.currentPos=percentage;

		youfi.playControls.setPos();
		youfi.playControls.renderPos();
	}
	this.renderPos=function(){
        var _this = youfi.playControls;

		var elm=_this.posElements;
		elm.bar.style.width=_this.currentPos*100+"%";

        var currentSongDuration = parseInt(_this.songs[_this.currentSongIndex].duration);
        var currentSongProgression = currentSongDuration*_this.currentPos;
        var formatTime = function(int_seconds){
            var numba=int_seconds;
			var minutes=Math.floor(numba/60);
			var seconds=Math.floor(numba-60*minutes);
			var str="";
			str+=minutes<10?"&nbsp;&nbsp;"+minutes:minutes;
			str+=":";
			str+=seconds>9?seconds:"0"+seconds;
			return str;
        }

        elm.bar.innerHTML = formatTime(currentSongProgression)+"<br />"+formatTime(currentSongDuration);
	}
}