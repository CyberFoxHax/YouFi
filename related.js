youfi.related=new function(){
	this.selectedElement={youfi:{},removeAttribute:function(){}};
	this.currentPlayingElement={youfi:{},removeAttribute:function(){}};
	this.entries=null;
	
	this.getRelated=function(id){
		var result=new Array();
		var xhr=youfi.getXMLHttpRequestObject();
		xhr.playlistArrHandle=result;
		// if last request
		xhr.onreadystatechange=function(){
			if(this.readyState==4){
				var tempArr=youfi.dataParsing.youtube.playlistFeed(JSON.parse(this.responseText));
				youfi.related.entries=tempArr;
				youfi.related.render(tempArr);
				delete this;
			}
		};
		var idToUse=youfi.playControls.currentSongId;
		if(id!=null) idToUse=id;
		var params="?v=2&alt=json&max-results=20";
		xhr.open("GET","https://gdata.youtube.com/feeds/api/videos/"+idToUse+"/related"+params,true);
		// "https://gdata.youtube.com/feeds/api/videos/"+id+"/related?v=2";
		xhr.send(null);
	}
	
	this.render=function(data){
		var RLdivElement=document.getElementById("related");
		RLdivElement.innerHTML="";
		{
			var newDiv=document.createElement("div");
			newDiv.innerHTML="Related:";
			RLdivElement.appendChild(newDiv);
		}
		// rendering the data in rows
		for(var row in data){
			var newDivContainer=document.createElement("div");
			var youfiObj={
				parent:	"related",
				id:		 data[row].id,
				title:	 data[row].title,
				uploader:data[row].uploader,
				duration:data[row].duration,
				views:	 data[row].views,
				rating:	 data[row].rating,
				url:	 data[row].url,
				ytId:	 data[row].ytId,
				category:data[row].category,
			};
			newDivContainer.youfi=youfiObj;
			newDivContainer.setAttribute("draggable", true);
			/////////////////////////////////
			////<-- Rendering the data-->////
			/////////////////////////////////
			{
				var newP=document.createElement("p");
				
				if(youfiObj.category=="Music")
					newP.innerHTML="&#9835;";
				else
					newP.innerHTML="&nbsp;";
				
				newDivContainer.youfi=youfiObj;
				newDivContainer.appendChild(newP);
			}
			{
				var newP=document.createElement("p");
				newP.innerHTML=youfiObj.title;
				newDivContainer.appendChild(newP);
			}
			{
				var newP=document.createElement("p");
				newP.innerHTML=youfiObj.uploader;
				newDivContainer.appendChild(newP);
			}
			{
				var newP=document.createElement("p");
				newP.innerHTML=youfi.results.formatData(newDivContainer, "duration");
				newDivContainer.appendChild(newP);
			}
			/////////////////////////////////////////
			////<-- Registering event handlers-->////
			/////////////////////////////////////////
			newDivContainer.onclick=youfi.related.click;
			newDivContainer.ondblclick=youfi.related.dblClick;
			newDivContainer.addEventListener("dragstart",youfi.related.dragStart);
			///////////////////////////
			////<-- Send to HTML-->////
			///////////////////////////
			RLdivElement.appendChild(newDivContainer);
		}
	}
	this.click=function(){
		if(youfi.activeWindowName==this.youfi.parent){
			if(youfi.related.selectedElement.getAttribute("youfiState")!="brokenEntry"&&
			   youfi.related.selectedElement.getAttribute("youfiState")!="warning")
				youfi.activeElement.removeAttribute("youfiState");
		}
		else{
			youfi.related.selectedElement.removeAttribute("youfiState");
			youfi.activeElement.setAttribute("youfiState","inactive");
		}
		
		this.setAttribute("youfiState","active");
		youfi.related.selectedElement=this;
		youfi.activeElement=this;
		youfi.activeWindowName=this.youfi.parent;
		
		// transfer youfiObj
		this.parentElement.youfi=this.youfi;
	}
	this.dblClick=function(){
		youfi.related.currentPlayingElement.removeAttribute("youfiState");
		youfi.related.currentPlayingElement=this;
		this.setAttribute("youfiState","playing");
		youfi.playControls.currentSongId=this.youfi.ytId;
		youfi.playControls.renderSongInfo(this.youfi);
		youfi.playControls.playerState=youfi.playControls.playerStates.playing;
		youfi.playControls.play();
		youfi.results.currentPlayingElement.removeAttribute("youfiState");
	}
	this.dragStart=function(event){
		event.dataTransfer.setDragImage(document.createElement("img"),0,0);
		event.dataTransfer.effectAllowed = "all";
		for(var i in this.youfi)
			event.dataTransfer.setData(i, this.youfi[i]);
	}
}