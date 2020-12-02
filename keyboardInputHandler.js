youfi.keyboardInput=new function(){
	// an array of keys currently being held down
	this.currentKeys=[];
	this.disabled=false;
	
	// array of undo actions
	this.undo=[];
	// the part that registers keyboard events
	this.upEvent=function(event){
		currentKey=event.keyCode?event.keyCode:event.charCode;
		youfi.keyboardInput.currentKeys[currentKey]=null;
		youfi.keyboardInput.handleInput();
	}
	this.downEvent=function(event){
		currentKey=event.keyCode?event.keyCode:event.charCode;
		// prevent continous capturing when holding down
		if(youfi.keyboardInput.currentKeys[currentKey]!=null) return;
		youfi.keyboardInput.currentKeys[currentKey]=true;
		youfi.keyboardInput.handleInput();
	}
	
	// massive list of key id's
	this.keyId={
		0:48, 1:49, 2:50, 3:51, 4:52, 5:53, 6:54, 7:55, 8:56, 9:57,
		a:65, b:66, c:67, d:68, e:69, f:70, g:71, h:72, i:73,
		j:74, k:75, l:76, m:77, n:78, o:79, p:80, q:81, r:82,
		s:83, t:84, u:85, v:86, w:87, x:88, y:89, z:90,
		comma:188, dot:190, tab:9, backspace:8, enter:13, 
		shift:16, ctrl:17, alt:18, space:32, capslock:20,
		plus:171, minus:172, smallerThan:60, accent:192, esc:27,
		scrolllock:145, pausebreak:19, winbtn:91, contextmenu:93,
		f1:112, f2:113, f3:114, f4 :115, f5 :116, f6 :117,
		f7:118, f8:119, f9:120, f10:121, f11:122, f12:123, 
		insert:45, home:36, pgup:33,
		delete:46, end:35, pgdown:34,
		arrow:{left:37, up:38, right:39, down:40},
		numpad:{
			0:96, 1:97, 2:98, 3:99, 4:100, 5:101, 6:102, 7:103, 8:104, 9:105,
			komma:110, plus:107, minus:109, asterisk:106, slash:111, numlock:144
		}
	}
	
	this.handleInput=function(){
		if(this.disabled) return;
		if(this.currentKeys[this.keyId.space]!=null)
			youfi.playControls.playPause();
		
		if(youfi.activeWindowName=="playlists")
			this.playlistsKeyInput();
		else if(youfi.activeWindowName=="results")
			this.resultsKeyInput();
	}
	this.resultsKeyInput=function(){
		if(this.currentKeys[this.keyId.delete]!=null&&
		   this.currentKeys[this.keyId.shift]!=null){
			youfi.results.entryDelete();
		}
	}
	this.playlistsKeyInput=function(){
		if(this.currentKeys[this.keyId.f2]!=null)
			youfi.playlists.activateRenamePlaylist();
		if(this.currentKeys[this.keyId.delete]!=null&&
		   this.currentKeys[this.keyId.shift]!=null){
			youfi.playlists.entryDelete();
		}
		if(this.currentKeys[this.keyId.esc]!=null)
			youfi.playlists.deactivateRenamePlaylist();
	}
}