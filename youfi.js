var youfi=new function(){
	///////////////////////////////////////////////////////////////////
	//////////<--- Awesome functions --->//////////////////////////////
	///////////////////////////////////////////////////////////////////
	this.getXMLHttpRequestObject=function(){
		if (window.XMLHttpRequest) 
			return new XMLHttpRequest();
		else if (window.ActiveXObject)// Older IE.
			return new ActiveXObject("MSXML2.XMLHTTP.3.0");
		return null;
	}
	this.setRequestHeaders=function(xhr){
		xhr.setRequestHeader("Host", "gdata.youtube.com");
		xhr.setRequestHeader("Content-type","application/atom+xml");
		xhr.setRequestHeader("Authorization", "Bearer "+youfi.auth.accessKey);
		xhr.setRequestHeader("GData-Version", 2);
		xhr.setRequestHeader("X-GData-Key", "key="+youfi.auth.apiKey);
	}
	this.thousandSeperate=function(n){
		var parts=n.toString().split(".");
		return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
	}
	this.getGlobalPos=function(element){
		var offset={x:0,y:0};
		while(element!=null){
			offset.x+=element.offsetLeft;
			offset.y+=element.offsetTop;
			element=element.offsetParent;
		}
		return offset;
	}
	this.objectClone=function(obj){
		if (null == obj || "object" != typeof obj)
			return obj;
		var copy = obj.constructor();
		for (var attr in obj) 
			if (obj.hasOwnProperty(attr))
				copy[attr]=obj[attr];
		return copy;
	}
	
	///////////////////////////////////////////////////////////////////
	//////////<-- Init -->/////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////
	
	// all the data caught in the results area are cached into this array
	this.massiveCache=[];
	
	this.activeElement={youfi:{},setAttribute:function(){}};
	this.activeWindowName="";
	this.currentUserID="default";
	this.currentDragElement=null;
	
	this.init=function(){
		// find user by GET parameter
		{
			var regexPattern=/[\&\?]userId=[^\&\?]*/;
			if(regexPattern.test(window.location.href)==true){
				var userid=regexPattern.exec(window.location.href);
				userid=/=[^]*/.exec(userid)[0].substring(1);
				youfi.currentUserID=userid;
			}
		}
		// keyboardEvents
		if (document.addEventListener){
		   document.addEventListener("keydown",youfi.keyboardInput.downEvent,false);
		   document.addEventListener("keyup",youfi.keyboardInput.upEvent,false);
		}
		else if (document.attachEvent){
		   document.attachEvent("onkeydown", youfi.keyboardInput.downEvent);
		   document.attachEvent("onkeyup", youfi.keyboardInput.upEvent);
		}
		else{
		   document.onkeydown= youfi.keyboardInput.downEvent;
		   document.onkeyup= youfi.keyboardInput.upEvent;
		}
		
		// input field
		var searchInputBaseValue=document.getElementById("search").children[0].value;
		document.getElementById("search").children[0].onfocus=function(){
			youfi.keyboardInput.disabled=true;
			if(this.value==searchInputBaseValue)
				this.value='';
		}
		document.getElementById("search").children[0].onblur=function(){
			youfi.keyboardInput.disabled=false;
		}
		document.getElementById("search").children[0].onchange=function(){
			youfi.results.getSearchResultsLength(this.value);
		}
		
		// load playlists
		if(youfi.currentUserID!="default"||youfi.auth.accessKey!="")
			youfi.playlists.getAll();
		
		// load progress bar controls
		{
			var elm=youfi.playControls.posElements;
			elm.wrapper=document.getElementById("progressBar");
			elm.bar=elm.wrapper.children[0];
			elm.wrapper.onmousedown=youfi.playControls.posMouseDown;
			document.onmouseup  =function(){window.onmousemove=null};
		}
		
		// load volume bar controls
		{
			var elm=youfi.playControls.volumeControlElements;
			elm.wrapper=document.getElementById("vol");
			elm.barWrap=elm.wrapper.firstElementChild;
			elm.bar=elm.barWrap.firstElementChild;
			elm.barWrap.onmousedown=youfi.playControls.volMouseDown;
			elm.wrapper.onmousedown=youfi.playControls.mute;
		}
		
		// quality element
		youfi.playControls.btnOnclick_quality.buttonElement = document.getElementById("quality");
		youfi.playControls.btnOnclick_quality.buttonElement.innerHTML = youfi.playControls.qualityTrans[youfi.playControls.quality];
		youfi.playControls.btnOnclick_quality.buttonElement.onclick = function(){
			youfi.playControls.btnOnclick_quality();
		};
		
		// assign image container
		youfi.playControls.imageContainer=document.getElementById("currentSong").children[0];
		
		// assign drag'n'drop event listener for currently playing field
		document.getElementById("currentSong").addEventListener("dragstart", youfi.playControls.songInfo_dragStart)
		document.getElementById("currentSong").setAttribute("draggable", true);
		
		// results drop event handler for when on black area
		document.getElementById("results").addEventListener("drop",youfi.results.dragDrop);
		document.getElementById("results").addEventListener("dragover",function(event){event.preventDefault();});
		
		(function(){
			var index=2;
			var styleList = [
				"youfi",
				"youfi-compact",
				"youfi-compact-white"
			];
			var button = document.getElementById("swapTheme");
			button.style.float = "right";
			button.style.cursor = "pointer";
			button.onclick = function(){
				var linkTag = document.head.querySelector("link[rel=stylesheet]");
				var linkHref = styleList[index++%styleList.length]+".css";
				linkTag.href = linkHref;
				linkTag.setAttribute("href", linkHref);
			};
		})();
	}
}
window.onbeforeunload = function(event){
	if(youfi.playControls.playerState == youfi.playControls.playerStates.stopped)
		event.preventDefault();
	else
		return "Are you serious? You've still got some tunes playing!";
}