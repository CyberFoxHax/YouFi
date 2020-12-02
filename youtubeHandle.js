// 2. This code loads the IFrame Player API code asynchronously.
(function(){
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onload=function(){
        document.head.removeChild(tag);
    }
    document.head.appendChild(tag);
})();

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		height: '512',
		width:  '512',
		playerVars:{
			controls: 0,
			rel: 0,
			showinfo: 0,
			disablekb: 1,
            iv_load_policy: 3
		},
		events: {
			'onReady': youfi.playControls.onPlayerRdy,
			'onStateChange': youfi.playControls.onPlayerStateChange,
			'onError': youfi.playControls.onError
		}
	});
}