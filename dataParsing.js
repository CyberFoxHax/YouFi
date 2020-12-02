/*	results out format:
int		id;			// index in playlist(starting@1)
string	title;		// the title of the entry
String	uploader;	// uploader of song
int		duration;	// duration of song
int		views;		// how many views the entry has
float	rating;		// how big the rating is
string	url; 		// http link to watch on youtube
string	ytId;		// youtube id of track
string	deleteId;	// entry id in the playlist
string	playlistId;	// id of playlist it belongs to
string	category;	// the category its in
*/

youfi.dataParsing=new function(){
	this.youtube=new function(){
		this.playlistFeed=function(json){
			var playlistId=json.feed.id.$t.split(":").pop();
			var outData=[];
			
			for(var i=0; i<json.feed.entry.length; i++){
				
				var entri=json.feed.entry[i];
				var entry={
					id: i+1,
					title:		entri.title.$t,
					uploader:	"-",
					duration:	"-",
					views:		"-",
					rating:		"-",
					url:		"-",
					ytId:		"-",
					deleteId:	entri.id.$t.split(":").pop(),
					playlistId:	playlistId,
					category:	entri.media$group.media$category[0].$t
				};
				if(playlistId=="videos") // occurs with search results
					entry.playlistId=json.feed.title.$t;
				if(entri.gd$rating!=null)
					entry.rating=entri.gd$rating.average;
				if(entri.yt$statistics!=null)
					entry.duration=entri.media$group.yt$duration.seconds;
				if(entri.yt$statistics!=null)
					entry.views=entri.yt$statistics.viewCount;
				
				if(entri.media$group.media$credit!=null)
					entry.uploader=entri.media$group.media$credit.$text;
				else if(entri.media$group.media$credit.length!=null)
					entry.uploader=entri.media$group.media$credit[0].$text;
				else if(entri.media$group.media$credit.yt$display!=null)
					entry.uploader=entri.media$group.media$credit.yt$display;
				else
					entry.uploader=entri.media$group.media$credit.$text;
				
				{// get http link
					var cacheArr=entri.link;
					for(var linkId in cacheArr){
						var attr=cacheArr[linkId];
						if(attr.type=="text/html"&&
						   attr.rel=="alternate"){
							entry.url=attr.href;
							entry.ytId=entry.url.substring(32, entry.url.indexOf("&"));
						}
					}
				}
				{// get uploader account name
					var cacheArr=entri.media$group.media$credit;
					if(cacheArr==null)
						for(var linkId in cacheArr){
							var attr=cacheArr[linkId];
							if(attr.role=="uploader"){
								entry.uploader=attr.yt$display;
							}
						}
					else entry.uploader=entri.media$group.media$credit[0].$t;
				}
				outData[i]=entry;
			}
			
			return outData;
		}
		this.playlistsFeed=function(rawData){
			var outData=[];
			
			return outData;
		}
	}
}