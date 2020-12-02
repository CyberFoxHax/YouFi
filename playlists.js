youfi.playlists=new function(){
	this.entries=null;
	this.selectedElement={youfi:{},removeAttribute:function(){}};
	this.currentlyPlayingElement={youfi:{},removeAttribute:function(){}};
	this.renameBoxHandle=null;
	
	this.getAll=function(){
		var xhr=youfi.getXMLHttpRequestObject();
		xhr.onreadystatechange=function(){
			if(xhr.readyState==4){
				var json=JSON.parse(this.responseText);
				
				var result=new Array();
				for(var i=0; i<json.feed.entry.length; i++){
					result[i]={
						title:json.feed.entry[i].title.$t,
						id:json.feed.entry[i].yt$playlistId.$t,
						length:json.feed.entry[i].gd$feedLink[0].countHint
					};
				}
				youfi.playControls.playlistId=result[0].id;
				youfi.results.getPlaylist(result[0].id, result[0].length, true, true);
				youfi.playlists.render(result);
			}
		};
		xhr.open("GET","https://gdata.youtube.com/feeds/api/users/"+youfi.currentUserID+"/playlists?alt=json&access_token="+youfi.auth.accessKey,true);
		xhr.send(null);
	}
	this.addToPlaylistAtIndex=function(playlistId, songId, index){
		console.log("send request to add song to playlist "+playlistId+" at index "+index);
		var xhr=youfi.getXMLHttpRequestObject();
		xhr.playlistId=playlistId;
		xhr.index=index;
		xhr.onreadystatechange=function(){
			if(this.readyState==4){
				if(youfi.massiveCache[this.playlistId]==null)
					return;
				var json=JSON.parse(this.responseText);
				if(this.playlistId=="favorites"){
					youfi.massiveCache[this.playlistId][0].deleteId=json.entry.id.$t.split(":").pop();
					youfi.massiveCache[this.playlistId][0].playlistId=this.playlistId;
				}
				else{
					youfi.massiveCache[this.playlistId][this.index-1].deleteId=json.entry.id.$t.split(":").pop();
					youfi.massiveCache[this.playlistId][this.index-1].playlistId=this.playlistId;
				}				
				if(youfi.results.currentId==this.playlistId)
					youfi.results.render(youfi.massiveCache[this.playlistId]);
			}
			
		}
		
		var data="";
		data+='<?xml version="1.0" encoding="UTF-8"?>';
		data+='<entry xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://gdata.youtube.com/schemas/2007">';
		data+='<id>'+songId+'</id>';
		data+='<yt:position>'+index+'</yt:position>';
		data+='</entry>';
		
		if(playlistId=="favorites")
			xhr.open("POST","http://gdata.youtube.com/feeds/api/users/default/favorites?alt=json", true);
		else
			xhr.open("POST","http://gdata.youtube.com/feeds/api/playlists/"+playlistId+"?alt=json", true);
		youfi.setRequestHeaders(xhr);
		xhr.send(data);
	}
	this.createNewPlaylist=function(dummyPlaylistId){
		console.log("send request to create new playlist");
		var xhr=youfi.getXMLHttpRequestObject();
		
		var data="";
		data+='<?xml version="1.0" encoding="UTF-8"?>';
		data+='<entry xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://gdata.youtube.com/schemas/2007">';
		data+='<title type="text">name</title>';
		data+='</entry>';
		
		xhr.dummyPlaylistId=dummyPlaylistId;
		xhr.onreadystatechange=function(){
			if(this.readyState==4){
				var newPlaylistId=this.responseXML.firstChild.firstChild.textContent.split(":").pop();
				youfi.massiveCache[newPlaylistId]=youfi.massiveCache[this.dummyPlaylistId];
				delete youfi.massiveCache[this.dummyPlaylistId];
				
				youfi.playlists.entries[0].id=newPlaylistId;
				youfi.playlists.entries[0].title="Enter name...";
				youfi.playlists.render(youfi.playlists.entries);
				youfi.playlists.deactivateRenamePlaylist();
				youfi.playlists.selectedElement=document.getElementById("playlists").children[1].children[1];
				youfi.playlists.activateRenamePlaylist();
			}
		}
		
		xhr.open("POST","http://gdata.youtube.com/feeds/api/users/default/playlists/", true);
		youfi.setRequestHeaders(xhr);
		xhr.send(data);
	}
	this.changeSongIndex=function(playlistId, songId, newIndex){
		console.log("send request to change song with id "+songId+" into "+newIndex+" in playlist with id "+playlistId);
		var xhr=youfi.getXMLHttpRequestObject();
		
		var data="";
		data+='<?xml version="1.0" encoding="UTF-8"?>';
		data+='<entry xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://gdata.youtube.com/schemas/2007">';
		data+='<yt:position>'+newIndex+'</yt:position>';
		data+='</entry>';
		
		xhr.open("PUT","http://gdata.youtube.com/feeds/api/playlists/"+playlistId+"/"+songId, true);
		youfi.setRequestHeaders(xhr);
		xhr.send(data);
	}
	this.appendToPlaylist=function(songId, playlistId){
		console.log("send request to append song with id "+songId+" into playlist "+playlistId);
		var xhr=youfi.getXMLHttpRequestObject();
		xhr.playlistId=playlistId;
		xhr.songId=songId;
		xhr.onreadystatechange=function(){
			if(this.readyState==4){
				if(youfi.massiveCache[this.playlistId]==null)
					return;
				var json=JSON.parse(this.responseText);
				if(this.playlistId=="favorites"){
					youfi.massiveCache[this.playlistId][0].deleteId=json.entry.id.$t.split(":").pop();
					youfi.massiveCache[this.playlistId][0].playlistId=this.playlistId;
				}
				else{
					// find out which index this.songId is assigned to.
					var playlist=youfi.massiveCache[playlistId];
					var songIndex;
					for(var i=0; i<playlist.length; i++)
						if(playlist[i].ytId==this.songId)
							songIndex=i;
					
					youfi.massiveCache[this.playlistId][songIndex].deleteId=json.entry.id.$t.split(":").pop();
					youfi.massiveCache[this.playlistId][songIndex].playlistId=this.playlistId;
				}				
				if(youfi.results.currentId==this.playlistId)
					youfi.results.render(youfi.massiveCache[this.playlistId]);
			}
			
		}
		
		var data="";
		data+='<?xml version="1.0" encoding="UTF-8"?>';
		data+='<entry xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://gdata.youtube.com/schemas/2007">';
		data+='<id>'+songId+'</id>';
		data+='</entry>';
		
		if(playlistId=="favorites")
			xhr.open("POST","http://gdata.youtube.com/feeds/api/users/default/favorites?alt=json", true);
		else
			xhr.open("POST","http://gdata.youtube.com/feeds/api/playlists/"+playlistId+"?alt=json", true);
		youfi.setRequestHeaders(xhr);
		xhr.send(data);
	}
	this.deletePlaylist=function(playlistId){
		console.log("send request to delete playlist with id "+playlistId);
		var xhr=youfi.getXMLHttpRequestObject();
		
		xhr.open("DELETE","http://gdata.youtube.com/feeds/api/users/default/playlists/"+playlistId, true);
		youfi.setRequestHeaders(xhr);
		xhr.send();
	}
	this.deleteFromPlaylist=function(playlistId, songId){
		console.log("send request to delete song with id "+songId+" from playlist with id "+playlistId);
		var xhr=youfi.getXMLHttpRequestObject();
		
		if(playlistId=="favorites")
			xhr.open("DELETE","http://gdata.youtube.com/feeds/api/users/default/favorites/"+songId, true);
		else
			xhr.open("DELETE","https://gdata.youtube.com/feeds/api/playlists/"+playlistId+"/"+songId, true);
		youfi.setRequestHeaders(xhr);
		xhr.send();
	}
	this.renamePlaylist=function(playlistId, name){
		console.log("send request to rename playlist with id "+playlistId+" into "+name);
		var xhr=youfi.getXMLHttpRequestObject();
		
		var data="";
		data+='<?xml version="1.0" encoding="UTF-8"?>';
		data+='<entry xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://gdata.youtube.com/schemas/2007">';
		data+='<title>'+name+'</title>';
		data+='</entry>';
		
		xhr.open("PUT","http://gdata.youtube.com/feeds/api/users/default/playlists/"+playlistId, true);
		youfi.setRequestHeaders(xhr);
		xhr.send(data);
	}
	this.render=function(data){
		var PLdivElement=document.getElementById("playlists");
		PLdivElement.innerHTML="";
		/////////////////////////
		// playlists title box //
		/////////////////////////
		{
			var newDiv=document.createElement("div");
			newDiv.innerHTML="Playlists:";
			PLdivElement.appendChild(newDiv);
		}
		/////////////////////
		// playlists items //
		/////////////////////
		var newDivContainer=document.createElement("div");
		PLdivElement.appendChild(newDivContainer);
		///////////////
		// Favorites //
		///////////////
		if(youfi.currentUserID=="default"){
			var newDiv=document.createElement("div");
			newDiv.setAttribute("youfiType","favorites");
			newDiv.youfi={
				parent:	"playlists",
				title:	"Favorites",
				id:		"favorites",
				length:	0
			};
			newDiv.innerHTML="Favorites";
			newDiv.onclick=youfi.playlists.favesEntryClick;
			newDiv.addEventListener("dragover", youfi.playlists.dragHover);
			newDiv.addEventListener("drop", youfi.playlists.dragDrop);
			newDiv.addEventListener("dragleave", youfi.playlists.dragLeave);
			newDiv.ondblclick=function(){
				youfi.playControls.playlistId=this.youfi.id;
				youfi.results.getFavoritesLength();
			}
			newDivContainer.appendChild(newDiv);
		}
		for(var i in data){
			var newDiv=document.createElement("div");
			newDiv.youfi={
				parent:	"playlists",
				title:	data[i].title,
				id:		data[i].id,
				length:	data[i].length
			};
			newDiv.innerHTML=data[i].title;
			newDiv.addEventListener("dragover", youfi.playlists.dragHover);
			newDiv.addEventListener("drop", youfi.playlists.dragDrop);
			newDiv.addEventListener("dragleave", youfi.playlists.dragLeave);
			newDiv.onclick=youfi.playlists.entryClick;
			newDiv.ondblclick=youfi.playlists.entryDblClick;
			
			newDivContainer.appendChild(newDiv);
		}
		// "Add new" button
		{
			var newDiv=document.createElement("div");
			newDiv.innerHTML="Add new";
			newDiv.onclick=youfi.playlists.btnAddNewClick;
			PLdivElement.appendChild(newDiv);
		}
		this.entries=data;
	}
	this.getLocalPlaylist=function(playlistId){
		var entries=youfi.playlists.entries;
		for(var i in entries){
			if(entries[i].id==playlistId)
				return entries[i];
		}
	}
	this.favesEntryClick=function(){
		if(youfi.activeWindowName==this.youfi.parent){
			youfi.activeElement.removeAttribute("youfiState");
		}
		else{
			youfi.playlists.selectedElement.removeAttribute("youfiState");
			if(youfi.activeElement.setAttribute!=null)
				youfi.activeElement.setAttribute("youfiState","inactive");
		}
		
		this.setAttribute("youfiState","active");
		youfi.playlists.selectedElement=this;
		youfi.activeElement=this;
		youfi.activeWindowName=this.youfi.parent;
		if(this.youfi.id!=youfi.results.entries[0].playlistId)
			youfi.results.getFavoritesLength();
	}
	this.doubleClickTimoutId=0;
	this.entryClick=function(){
		if(youfi.activeElement==this) return;
		if(youfi.activeWindowName==this.youfi.parent){
			youfi.activeElement.removeAttribute("youfiState");
		}
		else{
			youfi.playlists.selectedElement.removeAttribute("youfiState");
			if(youfi.activeElement.setAttribute!=null)
				youfi.activeElement.setAttribute("youfiState","inactive");
		}
		this.setAttribute("youfiState","active");
		youfi.playlists.selectedElement=this;
		youfi.activeElement=this;
		youfi.activeWindowName=this.youfi.parent;
		
		if(this.youfi.id!=youfi.results.currentId){
			youfi.results.getPlaylist(this.youfi.id, this.youfi.length);
			document.getElementById("results").scrollTop = 0;
		}
	}
	this.entryDblClick=function(){
		youfi.playControls.playlistId=this.youfi.id;
		setTimeout(function(){
			
			// the playlist in results area is not the selected playlist.
			if(youfi.activeElement.youfi.id!=youfi.results.entries[0].playlistId) return;
			
			var songEntries=youfi.results.entries;
			youfi.playControls.currentSongId	=songEntries[0].ytId;
			youfi.playControls.songs			=songEntries;
			youfi.playControls.playlistId		=songEntries[0].playlistId;
			youfi.playControls.currentSongIndex	=0;
			youfi.playControls.renderSongInfo(songEntries[0]);
			
			youfi.playControls.play();
			youfi.playControls.resume();
			
			youfi.results.render(youfi.results.entries); // fuk it
			
		},youfi.massiveCache[this.youfi.id]==null?2e3:1);
	}
	this.dragHover=function(event){
		event.preventDefault();
		this.setAttribute("youfiState","active");
		event.dataTransfer.dropEffect = "copy";
	}
	this.dragDrop=function(event){
		event.preventDefault();
		this.removeAttribute("youfiState");
		event.dataTransfer.dropEffect = "copy";
		if(youfi.massiveCache[this.youfi.id]==null){
			youfi.playlists.appendToPlaylist(
				event.dataTransfer.getData('ytId'),
				this.youfi.id
			);
			return;
		}
		
		if(event.dataTransfer.getData('parent')=="related"){
			var droppedEntry=youfi.objectClone(youfi.related.entries[event.dataTransfer.getData('id')]);
			droppedEntry.id=youfi.massiveCache[this.youfi.id].length+1;
			droppedEntry.playlistId=this.youfi.id;
			youfi.massiveCache[this.youfi.id].push(droppedEntry);
		}
		else if(event.dataTransfer.getData('parent')=="results"){
			var droppedEntry=youfi.objectClone(youfi.results.entries[event.dataTransfer.getData('id')-1]);
			droppedEntry.id=youfi.massiveCache[this.youfi.id].length+1;
			droppedEntry.playlistId=this.youfi.id;
			youfi.massiveCache[this.youfi.id].push(droppedEntry);
		}
		else if(event.dataTransfer.getData('parent')=="currentSong"){
			var droppedEntry=youfi.objectClone(document.getElementById("currentSong").youfi);
			droppedEntry.id=youfi.massiveCache[this.youfi.id].length+1;
			droppedEntry.playlistId=this.youfi.id;
			youfi.massiveCache[this.youfi.id].push(droppedEntry);
		}
		
		youfi.playlists.appendToPlaylist(
			event.dataTransfer.getData('ytId'),
			this.youfi.id
		);
		if(youfi.results.currentId==this.youfi.id)
			youfi.results.render(youfi.massiveCache[youfi.results.currentId]);
		
	}
	this.dragLeave=function(event){
		this.removeAttribute("youfiState");
	}
	this.entryDelete=function(){
		var playlistId=youfi.playlists.selectedElement.youfi.id;
		
		for(var i=0; i<youfi.playlists.entries.length; i++)
			if(youfi.playlists.entries[i].id==playlistId)
				youfi.playlists.entries.splice(i, 1);
		if(youfi.massiveCache[playlistId]!=null)
			delete youfi.massiveCache[playlistId];
		
		youfi.playlists.render(youfi.playlists.entries);
		if(youfi.results.currentId==playlistId)
			for(var i in youfi.massiveCache){
				youfi.results.render(youfi.massiveCache[i]);
				break;
			}
		youfi.playlists.deletePlaylist(playlistId);
	}
	this.btnAddNewClick=function(){
		var newEntry={
			id:"PL"+(new Date()).getTime(),
			length:"0",
			title:"loading..."
		};
		youfi.playlists.entries.unshift(newEntry);
		youfi.massiveCache[newEntry.id]=new Array();
		youfi.playlists.render(youfi.playlists.entries);
		youfi.playlists.selectedElement.youfi=newEntry;
		youfi.playlists.createNewPlaylist(newEntry.id);
	}
	this.activateRenamePlaylist=function(){
		if(youfi.playlists.selectedElement.youfi.id=="favorites")
			return;
		var pos=youfi.getGlobalPos(youfi.playlists.selectedElement);
		pos.y-=document.getElementById("playlists").scrollTop;
		var newInput=document.createElement("input");
		newInput.id="renameBox";
		newInput.type="text";
		newInput.style.position="absolute";
		newInput.style.top =pos.y+"px";
		newInput.style.left=pos.x+"px";
		newInput.value=youfi.playlists.selectedElement.youfi.title;
		newInput.onchange=function(){
			var playlistId=youfi.playlists.selectedElement.youfi.id;
			var newName=this.value;
			youfi.playlists.renamePlaylistEvent(playlistId, newName);
		}
		
		if(youfi.playlists.renameBoxHandle!=null)
			document.body.removeChild(youfi.playlists.renameBoxHandle);
		youfi.playlists.renameBoxHandle=newInput;
		document.body.appendChild(newInput);
		newInput.focus();
		newInput.select();
	}
	this.deactivateRenamePlaylist=function(){
		if(youfi.playlists.renameBoxHandle!=null){
			document.body.removeChild(youfi.playlists.renameBoxHandle);
			youfi.playlists.renameBoxHandle=null;
		}
	}
	this.renamePlaylistEvent=function(playlistId, name){
		youfi.playlists.selectedElement.innerHTML=name;
		youfi.playlists.selectedElement.innerHTML=name;
		
		var oldName=youfi.playlists.selectedElement.youfi.title;
		var selectedIndex;
		{ // find current index
			for(var i=0; i<youfi.playlists.entries.length; i++)
				if(youfi.playlists.entries[i].id==playlistId)
					selectedIndex=i;
		}
		
		youfi.playlists.entries[selectedIndex].title=name;
		youfi.playlists.deactivateRenamePlaylist();
		youfi.playlists.render(youfi.playlists.entries);
		youfi.playlists.renamePlaylist(playlistId, name);
	}
}