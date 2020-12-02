youfi.results=new function(){
	this.sentRequests=0;
	this.completedRequests=0;
	this.selectedElement={youfi:{},removeAttribute:function(){}};
	this.currentPlayingElement={youfi:{},removeAttribute:function(){}};
	this.sortColumn="id";
	this.currentId="";
	this.entries=null;


	this.mainCallback=function(){ // context is xmlhttp onreadystatechange
		if(this.readyState==4){
			var tempArr;
			document.getElementById("results").scrollTop = 0;
			try{
				tempArr=youfi.dataParsing.youtube.playlistFeed(JSON.parse(this.responseText));
			}
			catch(e){
				youfi.massiveCache[this.playlistId]=[];
				tempArr= [{
					id: 1,
					title: "(Avoid empty playlists)",
					uploader: "Jesus",
					duration: 3e6,
					views: 9e9,
					rating: 6,
					url: "-",
					ytId: "2Z4m4lnjxkY",
					deleteId: "",
					playlistId: "ur an idiot",
					categrory: "bacon"
				}];
			}

			for(var i=0; i<tempArr.length; i++){
				tempArr[i].id=i+this.id*50+1;
				this.playlistArrHandle[tempArr[i].id-1]=tempArr[i];
			}

			youfi.results.completedRequests++;
			if(youfi.results.completedRequests==youfi.results.sentRequests)
				youfi.results.render(this.playlistArrHandle);
			if(this.playNow==true&&this.id==0){
				youfi.playControls.currentSongId	=this.playlistArrHandle[0].ytId;
				youfi.playControls.songs			=this.playlistArrHandle;
				youfi.playControls.playlistId		=this.playlistArrHandle[0].playlistId;
				youfi.playControls.currentSongIndex	=0;
				youfi.playControls.renderSongInfo(this.playlistArrHandle[0]);
				youfi.playControls.play();
				if(this.isInit==true){
					youfi.playControls.pause();
				}
			}
			delete this;
		}
	}

	this.getFavoritesLength=function(){
		var id="favorites";
		if(youfi.massiveCache[id]!=null){
			youfi.results.render(youfi.massiveCache[id]);
			return;
		}
		var xhr=youfi.getXMLHttpRequestObject();
		// if last request
		xhr.onreadystatechange=function(){
			if(this.readyState==4){
				var json=JSON.parse(this.responseText);
				var value=parseInt(json.feed.openSearch$totalResults.$t);
				if(value>=1000)
					value=1000;
				youfi.results.getFavoritesAll(value);

				delete this;
			}
		};
		var params="?v=2&alt=json&max-results=1&start-index=1&access_token="+youfi.auth.accessKey;
		xhr.open("GET","https://gdata.youtube.com/feeds/api/users/"+youfi.currentUserID+"/favorites/"+params,true);
		xhr.send(null);
	}
	this.getFavoritesAll=function(length){
		id="favorites";
		var result=new Array();
		var playlistId=id==null?youfi.playControls.playlistId:id;
		var segments=Math.ceil(length/50);
		youfi.results.sentRequests=segments;
		youfi.results.completedRequests=0;
		for(var req=0; req<segments; req++){
			var xhr=youfi.getXMLHttpRequestObject();
			xhr.id=req;
			xhr.playlistArrHandle=result;
			// if last request
			xhr.onreadystatechange=youfi.results.mainCallback;
			var amount=length>50?50:length;
			var params="?v=2&alt=json&max-results="+amount+"&start-index="+(50*xhr.id+1)+"&access_token="+youfi.auth.accessKey;
			length-=50;
			xhr.open("GET","https://gdata.youtube.com/feeds/api/users/"+youfi.currentUserID+"/favorites/"+params,true);
			xhr.send(null);
		}
	}

	this.getPlaylist=function(id, length, play, init){
		if(youfi.massiveCache[id]!=null){
			if(play){
				youfi.playControls.currentSongId	=youfi.massiveCache[id][0].ytId;
				youfi.playControls.songs			=youfi.massiveCache[id];
				youfi.playControls.playlistId		=youfi.massiveCache[id][0].playlistId;
				youfi.playControls.currentSongIndex	=0;
				youfi.playControls.renderSongInfo(youfi.massiveCache[id][0]);
				youfi.playControls.play();
				if(init)
					youfi.playControls.pause();
			}
			youfi.results.currentId=id;
			youfi.results.render(youfi.massiveCache[id]);
			return;
		}
		var result=new Array();
		var playlistId=id==null?youfi.playControls.playlistId:id;
		var segments=Math.ceil(length/50);
		if(segments==0) segments=1;
		youfi.results.sentRequests=segments;
		youfi.results.completedRequests=0;
		for(var req=0; req<segments; req++){
			var xhr=youfi.getXMLHttpRequestObject();
			xhr.playNow=play;
			xhr.isInit=init;
			xhr.id=req;
			xhr.playlistArrHandle=result;
			xhr.playlistId=playlistId;
			// if last request
			xhr.onreadystatechange=youfi.results.mainCallback;
			var amount=length>50?50:length;
			var params=
				"?v=2&max-results="+amount+
				"&start-index="+(50*xhr.id+1)+
				"&access_token="+youfi.auth.accessKey+
				"&alt=json"+
				"&ymer="+(new Date()).getTime();
			length-=50;
			xhr.open("GET","https://gdata.youtube.com/feeds/api/playlists/"+playlistId+params,true);
			xhr.send(null);
		}
	}
	this.getSearchResultsLength=function(query){
		var id=query;
		if(youfi.massiveCache[id]!=null){
			document.getElementById("results").scrollTop = 0;
			youfi.results.render(youfi.massiveCache[id]);
			return;
		}
		var xhr=youfi.getXMLHttpRequestObject();
		xhr.query=query;
		xhr.onreadystatechange=function(){
			if(this.readyState==4){
				var json=JSON.parse(this.responseText);;

				var length=parseInt(json.feed.openSearch$totalResults.$t);
				if(length>=200)
					length=200;
				youfi.results.getSearchResultsRange(this.query, length);

				delete this;
			}
		};
		var params="?v=2&alt=json&max-results=1&start-index=1&q="+query;
		xhr.open("GET","https://gdata.youtube.com/feeds/api/videos"+params,true);
		xhr.send(null);
	}
	this.getSearchResultsRange=function(query, length){
		var result=new Array();
		var segments=Math.ceil(length/50);
		youfi.results.sentRequests=segments;
		youfi.results.completedRequests=0;
		for(var req=0; req<segments; req++){
			var xhr=youfi.getXMLHttpRequestObject();
			xhr.id=req;
			xhr.playlistArrHandle=result;
			// if last request
			xhr.onreadystatechange=youfi.results.mainCallback;
			var amount=length>50?50:length;

			var params="?v=2&alt=json&max-results="+amount+"&start-index="+(50*xhr.id+1)+"&q="+query;
			length-=50;
			xhr.open("GET","https://gdata.youtube.com/feeds/api/videos"+params,true);
			xhr.send(null);
		}
	}
	this.render=function(data){
		var RSdivElement=document.getElementById("results");
		RSdivElement.innerHTML="";
		if(data.length<1) return;
		///////////
		// items // // column > row
		///////////

		var newDivContainer=document.createElement("div");
		var table=document.createElement("table");
		{ // Generating title row
			var newColumn=document.createElement("tr");
			// append a dummy column for notes symbols
			{
				var newDiv=document.createElement("td");
				newDiv.innerHTML="&#9835;";
				newColumn.appendChild(newDiv);
			}

			for(var column in data[0]){
				if(column=="id"||
				   column=="title"||
				   column=="uploader"||
				   column=="duration"||
				   column=="views"||
				   column=="rating"){
					var newDiv=document.createElement("td");
					newDiv.id="titleRow";
					newDiv.innerHTML=column;
					newColumn.appendChild(newDiv);
				}
			}
			table.appendChild(newColumn);
		}

		// rendering the data in rows
		for(var i1=0; i1<data.length; i1++){
			var row=i1+"";
			if(data[row]==null) continue;
			var newColumn=document.createElement("tr");

			// append a dummy column for notes symbols
			{
				var newDiv=document.createElement("td");
				newDiv.youfi={
					parent:	"results",
					id:		 data[row].id,
					title:	 data[row].title,
					uploader:data[row].uploader,
					duration:data[row].duration,
					views:	 data[row].views,
					rating:	 data[row].rating,
					url:	 data[row].url,
					ytId:	 data[row].ytId,
					category:data[row].category,
					playlistId: data[row].playlistId
				};
				if(data[row].category=="Music")
					newDiv.innerHTML="&#9835;";
				//if(youfi.results.isFavorite(data[row].ytId))
				//	newDiv.innerHTML="&#x2605;"; // this is a star
				else
					newDiv.innerHTML="&nbsp;";
				newColumn.appendChild(newDiv);
			}
			for(var column in data[row]){
				var newDiv=document.createElement("td");
				newDiv.youfi={
					parent:	"results",
					id:		 data[row].id,
					title:	 data[row].title,
					uploader:data[row].uploader,
					duration:data[row].duration,
					views:	 data[row].views,
					rating:	 data[row].rating,
					url:	 data[row].url,
					ytId:	 data[row].ytId,
					category:data[row].category,
					deleteId:data[row].deleteId,
					playlistId: data[row].playlistId
				};
				newDiv.innerHTML	=youfi.results.formatData(newDiv, column);
				newDiv.onclick		=youfi.results.entryOnClick;
				newDiv.ondblclick	=youfi.results.entryOnDblClick;
				newDiv.setAttribute("draggable", true);
				newDiv.addEventListener("dragleave",youfi.results.dragLeave);
				newDiv.addEventListener("dragover",youfi.results.dragHover);
				newDiv.addEventListener("dragstart",youfi.results.dragStart);
				newDiv.addEventListener("drop",youfi.results.dragDrop);

				if(newDiv.youfi.playlistId==youfi.playControls.playlistId&&
				   newDiv.youfi.id-1==youfi.playControls.currentSongIndex){
					newColumn.setAttribute("youfiState","playing");
					youfi.results.currentPlayingElement=newColumn;
				}
				// for deleted vids
				if(newDiv.youfi.title=="undefined"||
				   newDiv.youfi.duration=="-"||
				   newDiv.youfi.views=="-"){
					newColumn.setAttribute("youfiState","brokenEntry");
					newDiv.youfi.state="broken";
					newColumn.children[0].youfi=newDiv.youfi;
				}

				if(column=="id"||
				   column=="title"||
				   column=="uploader"||
				   column=="duration"||
				   column=="views"||
				   column=="rating")
					newColumn.appendChild(newDiv);
			}
			table.appendChild(newColumn);
		}
		newDivContainer.appendChild(table);
		RSdivElement.appendChild(newDivContainer);
		youfi.massiveCache[data[0].playlistId]=data;
		youfi.results.currentId=data[0].playlistId;
		this.entries=data;
	}
	this.formatData=function(inDiv, col){
		switch(col){
			case "duration":
				var numba=parseInt(inDiv.youfi[col]);
				var minutes=Math.floor(numba/60);
				var seconds=numba-60*minutes;
				var str="";
				str+=minutes<10?"&nbsp;&nbsp;"+minutes:minutes;
				str+=":";
				str+=seconds>9?seconds:"0"+seconds;
				return str;
			break;
			case "views":
				inDiv.title=youfi.thousandSeperate(inDiv.youfi[col]);
				var numba=parseInt(inDiv.youfi[col]);
				if(numba>1e3){
					if(numba>1e6){
						return (numba/1e6).toFixed(1)+"mio";
					}
					return (numba/1e3).toFixed(1)+"k";
				}
				return numba;
			break;
			case "rating":
				if(inDiv.youfi[col]=="-")
					return "-";
				var numba=parseFloat(inDiv.youfi[col]);
				return (numba*20).toFixed(1);
			break;
			default:
				return inDiv.youfi[col];
			break;
		}

	}
	this.entryDelete=function(){
		if(youfi.results.selectedElement.youfi==null) return;
		var playlist=youfi.massiveCache[youfi.results.currentId];
		var selectedIndex=youfi.results.selectedElement.youfi.id-1;


		playlist.splice(selectedIndex, 1);
		for(var i=selectedIndex; i<playlist.length; i++)
			playlist[i].id--;

		youfi.results.render(youfi.massiveCache[youfi.results.currentId]);
		if(youfi.results.currentId.substring(0,13)!="searchResult-")
			youfi.playlists.deleteFromPlaylist(
				youfi.results.currentId, 
				youfi.results.selectedElement.youfi.deleteId
			);

		youfi.results.currentPlayingElement.removeAttribute("youfiState");
		youfi.results.selectedElement=document.createElement("tr");
		youfi.playControls.currentSongIndex-=1;
	}
	this.entryOnClick=function(){
		if(youfi.activeWindowName==this.youfi.parent){
			if(youfi.results.selectedElement.getAttribute("youfiState")!="brokenEntry"&&
			   youfi.results.selectedElement.getAttribute("youfiState")!="warning")
				youfi.activeElement.removeAttribute("youfiState");
			if(this.youfi.playlistId==youfi.playControls.playlistId){
				youfi.results.currentPlayingElement.setAttribute("youfiState","playing");
			}
		}
		else{
			youfi.results.selectedElement.removeAttribute("youfiState");
			youfi.activeElement.setAttribute("youfiState","inactive");
		}

		this.parentElement.setAttribute("youfiState","active");
		youfi.results.selectedElement=this.parentElement;
		youfi.activeElement=this.parentElement;
		youfi.activeWindowName=this.youfi.parent;

		// transfer youfiObj to its parent, the <tr> element
		this.parentElement.youfi=this.youfi;
	}
	this.entryOnDblClick=function(){
		youfi.results.currentPlayingElement.removeAttribute("youfiState");
		youfi.results.currentPlayingElement=this.parentElement;
		this.parentElement.setAttribute("youfiState","playing");
		youfi.playControls.currentSongId	=this.youfi.ytId;
		youfi.playControls.songs			=youfi.results.entries;
		youfi.playControls.playlistId		=this.youfi.playlistId;
		youfi.playControls.currentSongIndex	=this.youfi.id-1;
		youfi.playControls.playerState		=youfi.playControls.playerStates.playing;
		youfi.playControls.renderSongInfo(this.youfi);
		youfi.playControls.play();
	}
	this.dragStart=function(event){
		event.dataTransfer.setDragImage(document.createElement("img"),0,0);
		event.dataTransfer.effectAllowed = "all";
		for(var i in this.youfi)
			event.dataTransfer.setData(i, this.youfi[i]);
	}
	this.dragLeave=function(event){
		this.parentElement.setAttribute("youfiState", this.parentElement.prevYoufiState);
		if(this.parentElement.prevYoufiState==null)
			this.parentElement.removeAttribute("youfiState");
		delete this.parentElement.prevYoufiState;
	}
	this.dragHover=function(event){

		if(this.youfi.playlistId!=null&&
		   this.youfi.playlistId.substring(0,13)=="searchResult-"){
			return;
		}
		event.preventDefault();
		if(this.parentElement.getAttribute("youfiState")!="drag"&&this.parentElement.getAttribute("youfiState")!="dragReverse")
			this.parentElement.prevYoufiState=this.parentElement.getAttribute("youfiState");

		if(event.dataTransfer.getData('id')<this.youfi.id)
			this.parentElement.setAttribute("youfiState","dragReverse");
		else if(event.dataTransfer.getData('id')>this.youfi.id)
			this.parentElement.setAttribute("youfiState","drag");

		// override if we drag from another window
		if(event.dataTransfer.getData('parent')=="related"||event.dataTransfer.getData('parent')=="currentSong")
			this.parentElement.setAttribute("youfiState","drag");

		event.dataTransfer.dropEffect = "copy";
	}
	this.dragDrop=function(event){
		event.preventDefault();
		event.stopPropagation();

		// if we drop on the blank area (if there is one that is :P)
		// append to playlist in active list
		if(this.id=="results"&&this.youfi==null){
			if(youfi.results.currentId!=null&&
		       youfi.results.currentId.substring(0,13)=="searchResult-"){
				youfi.results.render(playlist);
				return;
			}

			var droppedEntry;
			if(event.dataTransfer.getData('parent')=="related")
				droppedEntry=youfi.objectClone(youfi.related.entries[event.dataTransfer.getData('id')]);
			else if(event.dataTransfer.getData('parent')=="currentSong")
				droppedEntry=youfi.objectClone(document.getElementById("currentSong").youfi);

			droppedEntry.id=youfi.massiveCache[youfi.results.currentId].length+1;
			youfi.massiveCache[youfi.results.currentId].push(droppedEntry);

			youfi.playlists.appendToPlaylist(event.dataTransfer.getData('ytId'), youfi.results.currentId);

			youfi.results.render(youfi.massiveCache[youfi.results.currentId]);
			return;
		}

		this.parentElement.removeAttribute("youfiState");
		event.dataTransfer.dropEffect = "copy";

		var oldId=event.dataTransfer.getData('id'); // source element
		var newId=this.youfi.id; // hover element
		var playlist=youfi.massiveCache[this.youfi.playlistId];

		if(this.youfi.currentId!=null&&
		   this.youfi.currentId.substring(0,13)=="searchResult-"){
			youfi.results.render(playlist);
			return;
		}


		if(this.youfi.playlistId=="favorites"){
			if(this.youfi.parent==event.dataTransfer.getData('parent'))
				return;
			if(youfi.results.currentId==youfi.playControls.playlistId)
				if(newId<=youfi.playControls.currentSongIndex)
					youfi.playControls.currentSongIndex++;

			for(var i in playlist)
				playlist[i].id++;

			var newEntry=youfi.objectClone(youfi.related.entries[oldId]);
			newEntry.id=1;
			newEntry.playlistId=this.youfi.playlistId;
			// the delete id is unknown, we need to fetch it from the server

			playlist.unshift(newEntry);
			youfi.playlists.addToPlaylistAtIndex(this.youfi.playlistId, event.dataTransfer.getData('ytId'), newId);

		}
		// its comes from itself
		else if(this.youfi.parent==event.dataTransfer.getData('parent')){
			youfi.playlists.changeSongIndex(this.youfi.playlistId ,event.dataTransfer.getData('deleteId'), newId);
			if(youfi.results.currentId==youfi.playControls.playlistId){
				if(newId<=youfi.playControls.currentSongIndex)
					youfi.playControls.currentSongIndex++;
				if(oldId<=youfi.playControls.currentSongIndex)
					youfi.playControls.currentSongIndex--;
				if(oldId==youfi.playControls.currentSongIndex+1)
					youfi.playControls.currentSongIndex=newId-1;
				else if(newId==youfi.playControls.currentSongIndex+1)
					youfi.playControls.currentSongIndex++;
			}

			var savedEntry=playlist[oldId-1];
			playlist[oldId-1].id=newId;
			playlist.splice(oldId-1,1);

			for(var i=oldId-1; i<playlist.length; i++)
				playlist[i].id-=1;

			playlist.splice(newId-1,0,savedEntry)

			for(var i=newId; i<playlist.length; i++)
				playlist[i].id+=1;
		}
		else if(event.dataTransfer.getData('parent')=="related"){
			playlist.splice(newId-1,0,youfi.objectClone(youfi.related.entries[oldId-1]));
			playlist[newId-1].id=newId;
			playlist[newId-1].playlistId=this.youfi.playlistId;
			playlist[newId-1].parent=this.youfi.parent;

			for(var i=newId; i<playlist.length; i++)
				playlist[i].id+=1;

			if(youfi.results.currentId==youfi.playControls.playlistId){
				if(newId-1<=youfi.playControls.currentSongIndex)
					youfi.playControls.currentSongIndex++;
				else if(newId-1==youfi.playControls.currentSongIndex)
					youfi.playControls.currentSongIndex+=2;
			}	

			youfi.playlists.addToPlaylistAtIndex(this.youfi.playlistId, event.dataTransfer.getData('ytId'), newId);
		}
		else if(event.dataTransfer.getData('parent')=="currentSong"){
			playlist.splice(newId-1,0,youfi.objectClone(document.getElementById("currentSong").youfi));
			playlist[newId-1].id=newId;
			playlist[newId-1].playlistId=this.youfi.playlistId;
			playlist[newId-1].parent=this.youfi.parent;

			for(var i=newId; i<playlist.length; i++)
				playlist[i].id+=1;

			if(youfi.results.currentId==youfi.playControls.playlistId){
				if(newId-1<=youfi.playControls.currentSongIndex)
					youfi.playControls.currentSongIndex++;
				else if(newId-1==youfi.playControls.currentSongIndex)
					youfi.playControls.currentSongIndex+=2;
			}	

			youfi.playlists.addToPlaylistAtIndex(this.youfi.playlistId, event.dataTransfer.getData('ytId'), newId);
		}
		youfi.results.render(playlist);
	}
}