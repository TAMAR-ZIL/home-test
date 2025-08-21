$.settings = {
	allowSendingMsgs: true,
	
	allowConsoleLog: true,
	showConsoleLogLevelAndAbove: 0,
	showConsoleLogTrace: false,
	
	updateChatWithInterval: true,
	chatUpdateInterval: 5*1000,
	
	playIncommingMsgSound: true,
	incommingMsgSoundUrl: "assets/audio/new-message.mp3",
	api_full_url: "./api.php?data=",
	defaultChatsLoadingLimiting: 6,
	defaultMsgsLoadingLimiting: 6,
	defaultProfilePicture: "./profile_pics/assaf.jpg",
	
	popupDefaultOptions: {
		animation: "none",
		title: false,
		content: false,
		theme: "supervan",
		columnClass: 'col-md-12',
		backgroundDismiss: true,
		closeIcon: false,
		draggable: true,
	}	
};

$.globals = {
	username: "assaf",
	loggedIn: true,
	lastTimeSentMsg: 0,
	isLoadingMsgs: 0,
	longPressTimer: null,
	contactId:"100",
	thisContact: {
		profile_picture_url: null
	},
};

$.intervals = {};

var consoleLog = function(...args){
	
	if(!$.settings.allowConsoleLog){
		return false;
	}
	
	var level = 0;
	var type = "log";
	var showTrace = $.settings?.showConsoleLogTrace ?? false;	
		
	if(args.length > 1){
		var lastArg = args[args.length - 1];
		if(lastArg && typeof lastArg === "object"){
			
			if("level" in lastArg){
				level = lastArg.level;
			}
						
			if("type" in lastArg){
				type = lastArg.type;
			}
			
			if("showTrace" in lastArg){
				showTrace = lastArg.showTrace;
			}
			
			args.splice(args.length - 1, 1);
		}		
	}
	
	const showLevel = $.settings?.showConsoleLogLevelAndAbove ?? 0;
	
	if(level === showLevel || level > showLevel){
		
		switch(type){
			default:
			case "log":
				console.log(...args);
			break;
			
			case "alert":
				popup(jsonEncode({...args}));
			break;
			
			case "info":
				console.info(...args);
			break;
			
			case "warn":
				console.warn(...args);
			break;
			
			case "error":
				console.error(...args);
			break;
		}
		
		if(showTrace){
			console.trace();
		}
		
	}	
}

var postToServer = async function($arguments=null){
	
	if(typeof $arguments !== "object"){
		var forceRoute = $arguments ?? "";
	}
	
	var postObj = $arguments?.data ?? arguments?.postObj ??{};
		postObj.username = $arguments?.data?.username ?? $.globals.username;
		
	var route = forceRoute ?? $arguments?.route ?? "a";
	
	if(!route){
		consoleLog("you're trying to call postToServer function without route. route:", route,{level: 0});
		return false;
	}	
	
	var url = $.settings.api_full_url+route;
	var method = $arguments?.medthod ?? "POST";
	var successCallback = $arguments?.successCallback ?? $arguments?.onSuccess ?? null;
	var errorCallback = $arguments?.errorCallback ?? null;
	var onAnywayCallback = $arguments?.onAnywayCallback ?? null;
	var asyncValue = $arguments?.async ?? true;
		
	$.ajax({
		"url": url,
		"method": method,
		"data": postObj,
		"async": asyncValue,
		"error": function(data){
			if(typeof errorCallback === "function"){
				errorCallback(data);
			}
		},
		"success": function(data){
			if(typeof successCallback === "function"){
				successCallback(data);
			}
		},
		"complete": function(data){
			if(typeof onAnywayCallback === "function"){
				onAnywayCallback(data);
			}		
		}
	});
}

var base64Encode = function($str){
	try {
		return btoa(unescape(encodeURIComponent($str)));
	} catch (e) {
		console.error("base64Encode failed", e);
	}
};

var base64Decode = function($str){
	try {
		return decodeURIComponent(escape(atob($str)));
	} catch (e) {
		console.error("base64Decode failed", e);
	}
}

var jsonEncode = function($obj){
	return JSON.stringify($obj);
}

var jsonDecode = function($json){
	return JSON.parse($json);
}

var popup = function(options=null){
	var defaultOptions = $.settings.popupDefaultOptions;
	var $content = false;
	
	if(typeof options !== "object"){
		var thisOptions = $.settings.popupDefaultOptions;
		thisOptions.content = options;
	}else{
		var thisOptions = {...$.settings.popupDefaultOptions, ...options};
	}
	
	consoleLog("popup function fired with options:",options,{level: 0});
	
	$.alert(thisOptions);
}

var countMsgsInActiveChat = function(){
	return $("#msgs").find(".message-box").length;
}



function isMobile() {
   return /Mobi|Android/i.test(navigator.userAgent);
}

const imageInput = document.getElementById('image-upload-input');
const dragDropArea = document.getElementById('drag-drop-area');
const imageUploadContainer = document.getElementById('image-upload-container');

if (!isMobile()) {
   imageUploadContainer.addEventListener('dragover', function(e) {
      e.preventDefault();
      dragDropArea.style.display = 'block';
   });

   imageUploadContainer.addEventListener('dragleave', function(e) {
      dragDropArea.style.display = 'none';
   });

   dragDropArea.addEventListener('drop', function(e) {
      e.preventDefault();
      dragDropArea.style.display = 'none';
      if (e.dataTransfer.files.length) {
         handleImageUpload(e.dataTransfer.files[0]);
      }
   });
}

imageInput.addEventListener('change', function(e) {
   if (e.target.files.length) {
      handleImageUpload(e.target.files[0]);
   }
});

function handleImageUpload(file) {
   const formData = new FormData();
   formData.append('image', file);
   formData.append('username', window.$?.globals?.username || 'assaf');
   formData.append('contact_id', window.$?.globals?.contactId || '1');
   formData.append('is_from_me', 1);

   fetch('image_upload.php', {
      method: 'POST',
      body: formData
   })
   .then(res => res.json())
   .then(data => {
      if (data.success) {
         if (window.loadMsgsFromServerByContactId) {
            window.loadMsgsFromServerByContactId();
         }
      } else {
         alert('Upload failed: ' + data.message);
      }
   })
   .catch(() => alert('Upload error.'));
}


// Mapping of emoji characters to GIF filenames
const emojiGifMap = {
    // Smileys & Emotion
    '😀': 'Smile.gif',
    '😁': 'Grinning.gif',
    '😂': 'Joy.gif',
    '🤣': 'Rofl.gif',
    '😃': 'Smile-with-big-eyes.gif',
    '😅': 'Grin-sweat.gif',
    '😆': 'Laughing.gif',
    '😉': 'Wink.gif',
    '😊': 'Blush.gif',
    '😋': 'Yum.gif',
    '😎': 'Sunglasses-face.gif',
    '😍': 'Heart-eyes.gif',
    '😘': 'Kissing-heart.gif',
	'🥰':'Heart-face.gif',
    '😗': 'Kissing.gif',
    '😚': 'Kissing-closed-eyes.gif',
    '☺️': 'Warm-smile.gif',
    '🙂': 'Slightly-happy.gif',
    '🤗': 'Hug-face.gif',
	'🤢':'Sick.gif',
    '🤩': 'Star-struck.gif',
    '🤔': 'Thinking-face.gif',
    '🤨': 'Raised-eyebrow.gif',
    '😐': 'Netural-face.gif',
    '😑': 'Expressionless.gif',
    '😶': 'Mouth-none.gif',
    '🙄': 'Rolling-eyes.gif',
    '😏': 'Smirk.gif',
	'😥':'Conncered.gif',
    '😮': 'Mouth-open.gif',
    '🤐': 'Zipper-face.gif',
    '😯': 'Hushed-face.gif',
    '😪': 'Sleepy.gif',
    '😫': 'Distraught.gif',
    '🥱': 'Yawn.gif',
    '😴': 'Sleep.gif',
    '😌': 'Relieved.gif',
    '😛': 'Stuck-out-tongue.gif',
    '😜': 'Winky-tongue.gif',
    '🤪': 'Zany-face.gif',
    '😝': 'Squinting-tongue.gif',
    '🤤': 'Drool.gif',
    '😒': 'Unamused.gif',
    '😓': 'Sweat.gif',
    '😔': 'Pensive.gif',
    '😕': 'Slightly-frowning.gif',
    '🙃': 'Upside-down-face.gif',
    '🤑': 'Money-face.gif',
    '😲': 'Flushed.gif',
    '☹️': 'Big-frown.gif',
    '🙁': 'Frown.gif',
    '😖': 'Scrunched-eyes.gif',
    '😟': 'Worried.gif',
    '😤': 'Face-with-steam-from-nose.gif',
    '😢': 'Cry.gif',
    '😭': 'Loudly-crying.gif',
    '😦': 'Frown.gif',
    '😧': 'Anguished.gif',
    '😨': 'Scared.gif',
    '😩': 'Weary.gif',
    '🤯': 'Mind-blown.gif',
    '😬': 'Grimacing.gif',
    '😰': 'Anxious-with-sweat.gif',
    '😱': 'Screaming-in-fear.gif',
    '🥵': 'Hot-face.gif',
    '🥶': 'Cold-face.gif',
    '😳': 'Flushed.gif',
    '🤪': 'Zany-face.gif',
    '😵': 'Dizzy-face.gif',
    '🥴': 'Woozy.gif',
    '😠': 'Angry.gif',
    '😡': 'Rage.gif',
    '🤬': 'Face-with-symbols-on-mouth.gif',
	'😷':'Mask.gif',
	'🤒':'Thermomter-face.gif',
	'🤕':'Bandage-face.gif',
	'🤢':'Sick.gif',
	'🤮':'Vomit.gif',
	'🤧':'Sneeze.gif',
	'😇':'Halo.gif',
	'🥳':'Partying-face.gif',
	'🤠':'Cowboy.gif',
    '🤡': 'Clown.gif',
	'🤥':'Liar.gif',
	'🤫':'Shushing-face.gif',
	'🤭':'Smiling-eyes-with-hand-over-mouth.gif',
	'🧐':'Monocle.gif',
	'🤓':'Nerd-face.gif',
	'😈':'Imp-smile.gif',
	'👿':'Imp-frown.gif',
	 '💀': 'Skull.gif',
    '👻': 'Ghost.gif',
    '👽': 'Alien.gif',
    '👾': 'Alien-monster.gif',
    '🤖': 'Robot.gif',
    // Hearts
    '❤️': 'Red-heart.gif',
    '🧡': 'Orange-heart.gif',
    '💛': 'Yellow-heart.gif',
    '💚': 'Green-heart.gif',
    '💙': 'Blue-heart.gif',
    '💜': 'Purple-heart.gif',
    '🖤': 'Black-heart.gif',
    '🤍': 'White-heart.gif',
    '💖': 'Sparkling-heart.gif',
    '💗': 'Growing-heart.gif',
    '💓': 'Beating-heart.gif',
    '💞': 'Revolving-hearts.gif',
    '💕': 'Two-hearts.gif',
    '💘': 'Heart-with-arrow.gif',
    '💝': 'Gift-heart.gif',
    // Gestures
    '👍': 'Thumbs-up.gif',
    '👎': 'Thumbs-down.gif',
    '👋': 'Clap.gif',
    '👌': 'OK.gif',
    '🤞': 'Crossed-fingers.gif',
    '🙏': 'Folded-hands.gif',
	'🦶':'Foot.gif',
	'👂':'Ear.gif'
};
function playerInit(url) {//this is a function that play the sound of the new message:
    const audioPlayer = document.createElement('audio');
    audioPlayer.src = url;
    audioPlayer.controls = true;
    audioPlayer.autoplay = true;
    document.body.appendChild(audioPlayer);
}


let mediaRecorder;
let audioChunks = [];//קטעי שמע
let recordedBlob = null;//
let timerInterval = null;
let secondsElapsed = 0;

const recordBtn = $("#record_btn");
const recordImg = $("#record_img");
const previewContainer = $("#voice_preview");
const timerEl = $("<span id='record_timer' style='margin-left:8px;font-weight:bold;'>00:00</span>");
recordBtn.after(timerEl.hide());

function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
}

recordBtn.on("mousedown touchstart", async function (e) {
    e.preventDefault();
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            recordedBlob = new Blob(audioChunks, { type: "audio/webm" });
            showPreview(recordedBlob);
            stopTimer();
        };

        mediaRecorder.start();

        // === הפעלת מד זמן ===
        secondsElapsed = 0;
        timerEl.text("00:00").show();
        timerInterval = setInterval(() => {
            secondsElapsed++;
            timerEl.text(formatTime(secondsElapsed));
        }, 1000);

        // === החלפת תמונה ל־GIF בזמן הקלטה ===
        recordImg.attr("src", "assets/images/unnamed.png");

        console.log("Recording started");
    } catch (err) {
        console.error("Microphone error:", err);
        alert("אין הרשאה למיקרופון. אנא אפשר/י גישה בהגדרות הדפדפן.");
    }
});

$(document).on("mouseup touchend", function () {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
		mediaRecorder.stream.getTracks().forEach(track => track.stop());
        recordImg.attr("src", "assets/images/voice-message-icon-vector-isolated-chat-symbol-flat-197058076.webp");
        console.log("Recording stopped");
    }
});

function stopTimer() {
    clearInterval(timerInterval);
    timerEl.hide();
}

function showPreview(blob) {
    const audioURL = URL.createObjectURL(blob);
    previewContainer.html(`
        <audio controls src="${audioURL}"></audio>
        <button id="send_voice_btn">Send</button>
    `);

    $("#send_voice_btn").on("click", function () {
        sendVoiceMsg(blob);
        previewContainer.empty();
    });

    $(document).on("keydown", function (e) {
        if (e.key === "Enter" && recordedBlob) {
            sendVoiceMsg(recordedBlob);
            previewContainer.empty();
        }
    });
}

function sendVoiceMsg(audioBlob) {
    const formData = new FormData();
    formData.append("username", $.globals.username);
    formData.append("contact_id", $.globals.contactId);
    formData.append("voice", audioBlob, "voice_message.webm");

    $.ajax({
        url: $.settings.api_full_url + "send_wa_voice_msg",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function () {
            console.log("Voice sent successfully");
            loadMsgsFromServerByContactId();
        },
        error: function (err) {
            console.error("Voice send failed:", err);
        }
    });
}


// Converts emoji chars to <img> tags (for chat rendering)
function convertEmojiCharsToImages(text) {
   if (!text) return text;
   const emojiRegex = new RegExp('(' + Object.keys(emojiGifMap).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
   return text.replace(emojiRegex, function(emoji) {
	   var filename = emojiGifMap[emoji];
	   if (filename) {
return `
  <img 
    src="assets/images/${filename.replace('.gif', '.png')}" 
    data-gif="assets/images/${filename}" 
    class="chat-emoji-gif" 
    style="height:1em;width:1em;max-width:24px;max-height:24px;vertical-align:middle;cursor:pointer;"
    onmouseover="this.src=this.dataset.gif"
    onmouseout="this.src=this.dataset.gif.replace('.gif', '.png')"
  />
`;
	   }
	   return emoji;
   });
}

var proccessMsgsArr = function(msgs){
    var $msgs = msgs;

    if(!$msgs || $msgs.length === 0){
        return false;
    }

    var $i = 0;
    var $msgsHTML = "";

    for(var $thisMsg in $msgs){
        var $msg = $msgs[$i];

        var $msgId = $msg["row_id"];
        var $msgHTMLId = "msg_id_"+$msg["row_id"];
        var $msgContent = $msg["msg_body"] ?? null;
        var $msgDatetime = $msg["msg_datetime"];
        var $isFromMe = $msg["is_from_me"] ?? 0;
        var $msgType = $msg["msg_type"] ?? null;
        var $isFromMeOrOtherSideCssClass;
        var $msgDirection = "ltr";

        // זיהוי האם ההודעה מכילה רק אימוג'ים - IMPROVED VERSION
        var isOnlyEmojis = false;
        if ($msgContent) {
			
            // Create a copy to test
            let testContent = $msgContent.toString();
            
            // Remove all unicode emojis
            testContent = testContent.replace(/[\u{1F600}-\u{1F64F}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}]/gu, '');
            
            // Remove custom emojis from emojiGifMap
            if (typeof emojiGifMap !== 'undefined' && Object.keys(emojiGifMap).length > 0) {
                Object.keys(emojiGifMap).forEach(function(emojiChar) {
                    var escapedEmoji = emojiChar.replace(/[.*+?^${}()|[\]\\]/g, '\\  ');      // זיהוי האם ההודעה מכילה רק אימוג'ים - IMPROVED VERSION
        var isOnlyEmojis = false;
        if ($msgContent) {
            // Remove all unicode emojis AND emoji images/gifs from emojiGifMap
            let textWithoutEmojis = $msgContent;
            
            // Remove unicode emojis
            textWithoutEmojis = textWithoutEmojis.replace(/[\u{1F600}-\u{1F64F}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{1F1E6}-\u{1F1FF}]/gu, '');
            
            // Remove custom emojis from emojiGifMap
            if (typeof emojiGifMap !== 'undefined') {
                Object.keys(emojiGifMap).forEach(function(emojiChar) {
                    textWithoutEmojis = textWithoutEmojis.replace(new RegExp(emojiChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
                });
            }
            
            // Check if only whitespace remains
            if(textWithoutEmojis.trim() === '') {
                isOnlyEmojis = true;
            }
        }
                    testContent = testContent.replace(new RegExp(escapedEmoji, 'g'), '');
                });
            }
            
            // Remove whitespace, newlines, and common punctuation
            testContent = testContent.replace(/[\s\n\r\t]/g, '');
            
            // Check if anything meaningful remains
            if(testContent === '') {
                isOnlyEmojis = true;
                console.log("Detected emoji-only message:", $msgContent);
            }
        }

        if($msgContent){
            if(detectMainLanguage($msgContent)==="hebrew"){
                $msgDirection = "rtl";
            }
            $msgContent = linkifyText($msgContent);
            $msgContent = putPhonesLinks($msgContent);
            $msgContent = newlinesToBr($msgContent);
            $msgContent = convertEmojiCharsToImages($msgContent);
            var contentWithoutImgs = $msgContent.replace(/<img[^>]*>/g, '').trim();
            if(contentWithoutImgs === ''){
                isOnlyEmojis = true;
            }
		}

		
        if($isFromMe===1){
            $isFromMeOrOtherSideCssClass = "my-message";
        }else{
            $isFromMeOrOtherSideCssClass = "friend-message";
        }

        if($msgType=="image"){
            $msgContent = "";
            $msgContent += '<img src="'+$msg["msg_body"]+'" />';
        }

        if($msgType=="e2e_notification"){
            continue;
        }

        if($msgType=="notification_template"){
            continue;
        }

        if($msgType=="revoked"){
            $msgContent = "הודעה זו נמחקה";
        }

        if($msgType=="audio"){
            $msgContent = "";
            $msgContent += '<audio id="'+$msgHTMLId+'" class="audio_msg" controls>';
            $msgContent += 	'<source src="'+$msg["msg_body"]+'"></source>';
            $msgContent += '</audio>';
        }

        if($msgType==="video" && $media_file_url){
            $msgContent = "";
            $msgContent += '<video controls>';
            $msgContent += 	'<source src="'+$msg["msg_body"]+'" type="video/mp4">';
            $msgContent += '</video>';
        }

        var $elm = "";

        // הוספת מחלקה מיוחדת להודעות שמכילות רק אימוג'ים
        var extraClass = isOnlyEmojis ? " large-emoji" : "";

        $elm += '<div id="'+$msgHTMLId+'" class="message-box '+$isFromMeOrOtherSideCssClass + extraClass +'">';
        $elm += 	'<p class="content '+$msgDirection+'">';
        $elm += 		$msgContent;
        $elm += 		"<br/>";
        $elm += 		'<span class="datetime">';
        $elm += 			$msgDatetime;
        $elm += 		'</span>';
        $elm += 		'<span class="msg_id">';
        $elm += 			$msgId;
        $elm += 		'</span>'
        $elm += 	'</p>';
        $elm += '</div>';

        $msgsHTML = $elm + $msgsHTML;
        ++$i;
    }

    return $msgsHTML;
}

let userInteracted = false;

// מאזין לראשונה לאינטראקציה (קליק או הקשה)
function enableAudioOnFirstInteraction() {
  if (!userInteracted) {
    userInteracted = true;
    // טוען את הצליל מראש ומפעיל לזמן קצר כדי "לשחרר" את ההרשאות
    const audio = new Audio($.settings.incommingMsgSoundUrl);
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => {});
    
    // מסיר את המאזינים מכיוון שאין צורך בהם יותר
    window.removeEventListener('click', enableAudioOnFirstInteraction);
    window.removeEventListener('keydown', enableAudioOnFirstInteraction);
  }
}

// מוסיף מאזינים לאירועי אינטראקציה
window.addEventListener('click', enableAudioOnFirstInteraction);
window.addEventListener('keydown', enableAudioOnFirstInteraction);

// פונקציה שמשמיעה צליל רק אם המשתמש כבר אינטראקטיבי
var playIncommingMsgSound = async function(){
  if($.settings.playIncommingMsgSound && userInteracted){
    try {
      var audio = new Audio($.settings.incommingMsgSoundUrl);
      await audio.play();
    } catch (e) {
      console.log("Failed to play incoming message sound:", e);
    }
  } else {
    console.log("User hasn't interacted yet – sound not played.");
  }
}

var loadMsgsFromServerByContactId = async function($prepend=0,$contactId=null,$limit=null,$clearChatIfEmpty=0){
	consoleLog("loadMsgsFromServerByContactId fired!");
	
	$.globals.isLoadingMsgs = 1;
	var $contactId = $contactId ?? $.globals.contactId;
	var $username = $.globals.username;
	
	var $numberOfCurrentMsgs = countMsgsInActiveChat() ?? 0;
	
	if($prepend){
		var $limit = $limit ?? $numberOfCurrentMsgs+","+$.settings.defaultMsgsLoadingLimiting;
	}else{
		var $limit = $limit ?? $.settings.defaultMsgsLoadingLimiting;
	}
	
	var firstMsgId = $("#msgs").find(".message-box").first().attr("id");
	
	postToServer({
		"route":"get_msgs",
		"data": {
			"username": $username,
			"contact_id": $contactId,
			"limit": $limit,
		},
		"successCallback": function(data){
			
			if(!data || data.length == 0){
				if(!$clearChatIfEmpty){
					consoleLog("loadMsgsFromServerByContactId returned empty string. That could be because there's no other msgs to load. data: ",data,{level: 3, type: "warn"});
					return false;
				}
				return;				
			}
		
			var $html = proccessMsgsArr(data);
			
			if($prepend){
				$("#msgs").prepend($html);
			}else{
				$("#msgs").html($html);
				
				clearInterval($.intervals.chatUpdateInterval);
				
				$.intervals.chatUpdateInterval = setInterval(async function(){
					if($.settings.updateChatWithInterval){
						loadNewMsgs();
					}
				},$.settings.chatUpdateInterval);
			}

			$("#msgs audio").each(function(){
				var $this = $(this);
				var $elm_id = $this.attr("id") ?? null;
				
				var player = new Plyr("#"+$elm_id, {});
				window.player = player;								
			});
			
			var player = new Plyr('audio', {});
			window.player = player;			
			
			var d = $("#msgs");
			
			if(!$prepend){
				d.scrollTop(d.prop("scrollHeight"));
				d.on("load",async function(){
					d.scrollTop(d.prop("scrollHeight"));
				});
			}else{
				try{
					if(firstMsgId){
						document.getElementById(firstMsgId).scrollIntoView({
							behavior: "auto",
							block: "start",
						});
						
						d.on("load",async function(){
							document.getElementById(firstMsgId).scrollIntoView({
								behavior: "auto",
								block: "start",
							});
						});
					}
				}catch(e){
					consoleLog(e,{level: 5, type: "error"});
				}
			}					
		},
		"onAnywayCallback": function(){
			getLastMsgId();
			$.globals.isLoadingMsgs = 0;
		}
	});	
}

var chatsOffset = 0; // מספר הצ'אטים שכבר נטענו

var getChats = async function($append=false,$limit=null,$username=null){
	var $route = "get_chats";
	var $username = $username ?? $.globals.username ?? null;
	var $limit = $limit ?? $.settings.defaultChatsLoadingLimiting ?? 20;
	
	if(!$username){
		consoleLog("YOU TRIED TO RUN FUNCTION getChats WITHOUT username",{level: 0});
		return false;
	}

	if($.globals.isLoadingChats) return;
	$.globals.isLoadingChats = true;
	
	postToServer({
		"route":$route,
		"data": {
			"username": $username,
			"limit": $limit,
			"offset": chatsOffset,
		},
		"successCallback": function(data){
			$.globals.isLoadingChats = false;

			if(!data || data.length === 0){
				consoleLog("No more chats to load",{level:0});
				$("#chats").off("scroll.lazyLoad"); // הסרת מאזין הגלילה אם אין עוד צ'אטים
				return;
			}

			chatsOffset += data.length;

			var $allChatsHtml = "";
			data.forEach(function($thisChat){
				var $contactId = $thisChat["contact_id"];
				var $contactName = $thisChat["contact_name"] ?? $thisChat["notify_name"] ?? $contactId ?? null;
				var $profilePicture = $thisChat["profile_picture_url"] ?? $.settings.defaultProfilePicture;
				var $lastMsgBody = $thisChat["msg_body"] ?? "";
				var $shortLastMsgBody = $lastMsgBody.substring(0,30)+"...";

				var $contactInformation = {
					"contactName": $contactName,
					"profilePicture": $profilePicture,
				};

				var $jsonStrContactObj = jsonEncode($contactInformation);
				var $encodedContactInformation = base64Encode($jsonStrContactObj);

				$allChatsHtml += `
					<div id="${$contactId}" class="chat chat-box" data-contactInformation="${$encodedContactInformation}" data-contactId="${$contactId}">
						<div class="img-box contact_profile_img_container">
							<img class="img-cover" src="${$profilePicture}" alt="">
						</div>
						<div class="chat-details">
							<div class="text-head">
								<h4>${$contactName}</h4>
							</div>
							<div class="text-message">
								<p>${$shortLastMsgBody}</p>
							</div>
						</div>
					</div>
				`;
			});

			if(!$append){
				$("#chats").html($allChatsHtml);
				$("#chats .chat").first().click();
			}else{
				$("#chats").append($allChatsHtml);
			}			

			// Lazy loading on scroll
			$("#chats").off("scroll.lazyLoad").on("scroll.lazyLoad", function(){
				var $container = $(this);
				if($container.scrollTop() + $container.innerHeight() >= $container[0].scrollHeight - 100){
					getChats(true, $limit, $username);
				}
			});
		},
		"onAnywayCallback": function(){
			$.globals.isLoadingChats = false;
		}
	});
}

var getMoreChats = async function(){
	var $currentChatsNum = $("#chats .chat").length;
var $limit = $.settings.defaultChatsLoadingLimiting;
var $offset = $currentChatsNum;

getChats(true, $limit, null, $offset);

}

var refreshApp = async function(){
	$.globlas.username = localStorage.getItem("username");
	updateBotsList();
	getChats();
}

var resetAllForms = function(){
	$("body").find("form").each(function(){
		var $this = $(this);
		$this.trigger("reset")
	});
	
	$(".send_msg_form").removeClass("disabled");
}

var sendTxtMsg = async function($msg=null, $contactId=null, $username=null, $time=0){
   $(".send_msg_form").addClass("disabled");
   if($.globals.isPendingMsg){
	   consoleLog("you're trying to call sendTxtMsg while another proccess is running",{level: 2, type: "error"});
	   return false;
   }
   $.globals.isPendingMsg = 1;
   if(!$.settings.allowSendingMsgs){
	   consoleLog("you're trying to call sendTxtMsg while $.settings.allowSendingMsgs is false",{level: 5, type: "error"});
	   $.globals.isPendingMsg = 0;
	   return false;
   }
   if(!$msg){
	   consoleLog("you're trying to call sendTxtMsg width empty msg: ",$msg, {level: 5, type: "error"});
	   $.globals.isPendingMsg = 0;
	   return false;
   }
   var $username = $username ?? $.globals.username;
   if(!$username){
	   $.globals.isPendingMsg = 0;
	   console.error("you're trying to send a txt msg without a username");
	   return false;
   }
   var $contactId = $contactId ?? $.globals.contactId;
   if(!$contactId){
	   $.globals.isPendingMsg = 0;
	   console.error("you're trying to send a txt msg without a contact id");
	   return false;
   }
   // Send the emoji char as-is (not a marker)
   var postData = {
	   msg: $msg,
	   username: $username,
	   contact_id: $contactId,
	   time: $time,
   }
   $.globals.lastTimeSentMsg = Date.now();
   postToServer({
	   "data": postData,
	   "route": "send_wa_txt_msg",
	   "successCallback": function(data){
		   $(".send_msg_form").removeClass("disabled");
		   $.globals.isPendingMsg = 0;
		   $.globals.lastMsgContent = $msg;
		   resetAllForms();
		   setTimeout(function(){
			   loadMsgsFromServerByContactId();
			   $.globals.isPendingMsg = 0;
		        $(".send_msg_form").removeClass("disabled");
		   },250);
	   },
	   "onAnywayCallback": function(){
		   $.globals.isPendingMsg = 0;
		   $(".send_msg_form").removeClass("disabled");
	   }
   });      
}

var getProfilePicByContactId = async function($contactId=null,$username=null){
	var $contactId = $contactId ?? $.globals.contactId;
	var $username = $username ?? $.globals.username;
	
	consoleLog("getProfilePicByContactId fired with $contactId",$contactId, {level: 3});
	
	postToServer({
		"route":"get_profile_pic_by_contact_id",
		"data": {
			"contact_id": $contactId,
			"username": $username,
		},
		"successCallback": function(data){
			try{
				var $url = data?.[0]?.[0] ?? $.settings.defaultProfilePicture;
								
				$.globals.thisContact.profile_picture_url = $url;
				$(".contact_profile_img img[data-contactId='"+$contactId+"']").attr("src",$url);
				
				consoleLog($(".contact_profile_img img[data-contactId='"+$contactId+"']"),{level: 0});
				
				$("img.contact_profile_img[data-contactId='"+$contactId+"']").attr("src",$url);
				$(".chat[data-contactId='"+$contactId+"'] .contact_profile_img_container img").attr("src",$url);
			}catch(e){
				consoleLog(e,{level: 5, type: "error"});
			}
		},
		onAnywayCallback: function(){
		}
	});		
}

var getContactNameById = async function($contactId=null,$username=null){
	var $contactId = $contactId ?? $.globals.contactId;
	var $username = $username ?? $.globals.username;
	
	consoleLog("getContactNameById fired with $contactId",$contactId, {level: 3});
	
	postToServer({
		"route":"get_contact_name_by_contact_id",
		"data": {
			"contact_id": $contactId,
			"username": $username,
		},
		"successCallback": function(data){
			try{
				var $contactName = data?.[0]?.[0] ?? "";
				$(".contact_name").text($contactName);
				$.globals.contactName = $contactName;
			}catch(e){
				consoleLog(e,{level: 5, type: "error"});
			}
		},
		onAnywayCallback: function(){
		}
	});		
}

var goToChat = async function($contactId){
	$(".send_msg_form").removeClass("disabled");
	
	$("#chat_window .contact_profile_img img").attr("data-contactId",$contactId);
	
	getProfilePicByContactId($contactId);
	getContactNameById($contactId);
	
	$(".contact_id").text($contactId);
	$.globals.contactId = $contactId;
	
	$("#chat_window").addClass("visable");
	loadMsgsFromServerByContactId(false,$contactId,$.settings.defaultMsgsLoadingLimiting,1);
}

var getLastMsgId = function(){
	var $lastMsgId = $("#msgs .message-box").last().find(".msg_id").text();
	if($lastMsgId){
		$.globals.lastMsgId = $lastMsgId;
		return $.globals.lastMsgId;
	}
	return null;
}

var loadNewMsgs = async function($contactId=null){
  consoleLog("loadNewMsgs fired!");
  
  $.globals.isLoadingMsgs = 1;
  var $contactId = $contactId ?? $.globals.contactId;
  var $username = $username ?? $.globals.username;
  var $lastMsgId = getLastMsgId() ?? $.globals.lastMsgId ?? null;
  
  if(!$lastMsgId){
    consoleLog("Can't find lastMsgId: ", $lastMsgId);
    return false;
  }   

  postToServer({
    "route":"get_new_msgs",
    "data": {
      "contact_id": $contactId,
      "username": $username,
      "last_id": $lastMsgId,
    },
    "successCallback": function(data){   
      if(!data || data.length == 0){
        consoleLog("no new msgs",{level: 0});
        return;
      }
      
      var $html = proccessMsgsArr(data);
      $("#msgs").append($html);

      // שים לב – מפעילים צליל רק אם יש הודעות חדשות שהן לא של המשתמש עצמו
       if (Array.isArray(data) && data.length > 0) {
 		 const hasIncoming = data.some(msg => msg.is_from_me != 1);
  		if (hasIncoming) {
   		 playIncommingMsgSound();
  		}
		}


      $("#msgs audio").each(function(){
        var $this = $(this);
        var $elm_id = $this.attr("id") ?? null;
        if ($elm_id){
          var player = new Plyr("#"+$elm_id, {});  
          window.player = player;        
        }
      });
      
      var player = new Plyr('audio', {});
      window.player = player;     
    },
    "onAnywayCallback": function(){
      getLastMsgId();
      $.globals.isLoadingMsgs = 0;
    }
  }); 
}

var linkifyText = function(text) {
    var urlRegex = /((https?:\/\/|www\.)[^\s<>"']+)/g;

    var replacedText = text.replace(urlRegex, function(match) {
        var href = match;

        if (!/^https?:\/\//.test(href)) {

	// === Lazy loading older messages on scroll to top ===
	var chatScrollEl = $("#msgs");
	var lazyLoadThreshold = 60; // px from top
	chatScrollEl.on("scroll", function() {
		if (chatScrollEl.scrollTop() <= lazyLoadThreshold && !$.globals.isLoadingMsgs) {
			// Only load if not already loading
			loadMsgsFromServerByContactId(true);
		}
	});
            href = 'http://' + href;
        }

        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });

    return replacedText;
}

var newlinesToBr = function(text) {
    return text.replace(/(\r\n|\n|\r)/g, '<br/>');
}

var detectMainLanguage = function(text) {
    var hebrewMatches = text.match(/[\u0590-\u05FF]/g) || [];
    var englishMatches = text.match(/[a-zA-Z]/g) || [];

    var hebrewCount = hebrewMatches.length;
    var englishCount = englishMatches.length;

    if(hebrewCount > englishCount){
        return 'hebrew';
    }else if (englishCount > hebrewCount){
        return 'english';
    }else{
       return 'english';
    }
}

var putPhonesLinks = function(text) {
    var phoneRegex = /\d{9,}/g;

    // נחלק את הטקסט לחלקים: כאלה שעטופים בתגיות a וכאלה שלא
    var parts = text.split(/(<a [^>]*>.*?<\/a>)/g);

    // נעבור על כל החלקים
    for (var i = 0; i < parts.length; i++) {
        // אם זה לא לינק - נעשה החלפה
        if (!parts[i].startsWith('<a ')) {
            parts[i] = parts[i].replace(phoneRegex, function(match) {
                return '<a href="#" class="goToChat" data-contactId="' + match + '@c.us">' + match + '</a>';
            });
        }
    }

    // נחבר את הכל בחזרה
    return parts.join('');
}

var disableMsgsUpdateInterval = function(){
	$.settings.updateChatWithInterval = false;
}

var enableMsgsUpdateInterval = function(){
	$.settings.updateChatWithInterval = false;
}

// ==== Picker HTML ====
$(document).ready(function() {
	if ($('#emoji-picker').length === 0) {
		var pickerHtml = '<div id="emoji-picker" style="display:none;position:absolute;z-index:9999;background:#fff;border:1px solid #ccc;padding:10px;border-radius:8px;box-shadow:0 2px 8px #0002;max-width:350px;max-height:300px;overflow:auto;">';
		pickerHtml += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
		Object.keys(emojiGifMap).forEach(function(emojiChar) {
    var filename = emojiGifMap[emojiChar];
    var pngSrc = 'assets/images/' + filename.replace('.gif', '.png');
    var gifSrc = 'assets/images/' + filename;

    pickerHtml += `
      <span class="emoji-item" tabindex="0" data-emoji="${emojiChar}" title="${emojiChar}">
        <img 
          src="${pngSrc}" 
          data-gif="${gifSrc}" 
          class="chat-emoji-gif"
          style="height:24px;width:24px;cursor:pointer;vertical-align:middle;"
          onmouseover="this.src=this.dataset.gif"
          onmouseout="this.src=this.dataset.gif.replace('.gif', '.png')"
        />
      </span>
    `;
});

		pickerHtml += '</div>';
		pickerHtml += '</div>';
		$('body').append(pickerHtml);
	}
});

// ==== Search ====
$(document).on('input', '#emoji-search', function() {
    const term = $(this).val().trim().toLowerCase();
    renderGifs(term);
});

// ==== Tab Switching ====
$(document).on('click', '.tab-btn', function() {
    $('.tab-btn').removeClass('active');
    $(this).addClass('active');
    $('.tab-content').hide();
    $(`#emoji-tab-${$(this).data('tab')}`).show();
});

// ==== Open Picker ====
$(document).on('click', '#emoji-btn', function(e) {
    e.stopPropagation();
    const $picker = $('#emoji-picker');
    const offset = $(this).offset();
    $picker.css({ 
        top: offset.top - $picker.outerHeight() - 8, 
        left: offset.left 
    }).toggle();
    $('#emoji-search').focus();
});

// ==== Close Picker on Outside Click ====
$(document).on('click', function(e) {
    if (!$(e.target).closest('#emoji-picker').length && !$(e.target).is('#emoji-btn')) {
        $('#emoji-picker').hide();
    }
});

// ====  Insert emoji char at cursor without deleting existing text ====
function insertAtCursor(input, textToInsert) {
	if (!input) return;
	
	// Get current cursor position
	const start = input.selectionStart || 0;
	const end = input.selectionEnd || 0;
	const value = input.value || '';
	
	// Insert text at cursor position
	input.value = value.slice(0, start) + textToInsert + value.slice(end);
	
	// Set cursor position after inserted text
	const newPos = start + textToInsert.length;
	input.selectionStart = input.selectionEnd = newPos;
	
	// Focus back to input
	input.focus();
}


// ==== PREVENT AUTO SUBMIT ON EMOJI CLICK ====
$(document).on('click keypress', '.emoji-item', function(e) {
	e.preventDefault();
	e.stopPropagation();
	e.stopImmediatePropagation();
	
	if (e.type === 'click' || (e.type === 'keypress' && e.key === 'Enter')) {
		const emojiChar = $(this).data('emoji');
		const inputElement = document.getElementById('msg');
		
		if (inputElement && emojiChar) {
			insertAtCursor(inputElement, emojiChar);
			$('#emoji-picker').hide();
		}
	}
	
	return false; // Extra prevention
});

// ==== CSS FOR LARGE EMOJIS ====
$(document).ready(function() {
	// Remove existing styles if any
	$('#large-emoji-styles').remove();
	
	// Add CSS for large emoji messages
	var emojiStyles = ` `;
	$('head').append(emojiStyles);
	
});

$(document).ready(function(){
	consoleLog("document ready",{level: 0});
});

$(window).on("load",function(){
	
	consoleLog("window loaded",{level: 0});
	
	getChats();
	
	$("body").on("click", ".show_chats_list",function(){
		$("#chat_window").removeClass("visable");
	});

	$("body").on("click", ".goToChat",function(){		
		var $this = $(this); // FIX: Added missing variable declaration
		var $contactId = $this.attr("data-contactId");
		$(".contact_id").text($contactId);

		$.globals.contactId = $contactId;

		$("#chat_window").addClass("visable");

		loadMsgsFromServerByContactId(false);
	})

	$("body").on("click","#chats .chat",function(){
		var $this = $(this);

		$("#chats .chat").removeClass("active");
		$this.addClass("active");

		var $encodedContactInformation = $this.attr("data-contactInformation") ?? null;

		if($encodedContactInformation){
			$.globals.thisContact = jsonDecode(base64Decode($encodedContactInformation));
		}

		var $profilePicture = $.globals.thisContact?.profile_picture_url ?? $.settings.defaultProfilePicture ?? null;
		var $contactName = $.globals.thisContact?.name ?? $.globals.thisContact?.notify_name ?? null;

		$(".contact_profile_img img").attr("src",$profilePicture)
		$(".contact_name_container .contact_name").text($contactName);

		var $contactId = $this.attr("id");
		consoleLog($contactId,{level: 0});
		
		goToChat($contactId);
	});

	$("body").on("click", ".user_avatar_container, .contact_profile_img", async function(){	
		getProfilePicByContactId();
		var $imgUrl = $(this).find("img").attr("src");
		var $imgTag = "<img class='contact_profile_img' src='"+$imgUrl+"' />";

		popup($imgTag);
	});

	$("body").on("click", ".message-box .content img",function(){
		
		var $this = $(this);
		var $img_url = $this.attr("src");
		var $img_tag = "<img class='full_height_img' src='"+$img_url+"' />";

		popup($img_tag);
	});

	// Remove load_trigger button click handler

	// === Fully automate lazy loading on scroll ===
	var chatScrollEl = $("#msgs");
	var lazyLoadTopThreshold = 60; // px from top
	var lazyLoadBottomThreshold = 60; // px from bottom
	chatScrollEl.on("scroll", function() {
		var scrollTop = chatScrollEl.scrollTop();
		var scrollHeight = chatScrollEl.prop("scrollHeight");
		var clientHeight = chatScrollEl.innerHeight();

		// Load older messages when near the top
		if (scrollTop <= lazyLoadTopThreshold && !$.globals.isLoadingMsgs) {
			loadMsgsFromServerByContactId(true);
		}

		// Load new messages when near the bottom
		if (scrollHeight - (scrollTop + clientHeight) <= lazyLoadBottomThreshold && !$.globals.isLoadingMsgs) {
			loadNewMsgs();
		}
	});

	$("body").on("click", ".logout", async function(){	
		popup({
			"content": "Are you sure you wanna logout?",
			buttons:{
				yes:{
					text: "Yes",
					action: function(){
						popup("Logout function comes here!");
					}
				},
				no:{
					text: "No",
					action: function(){}					
				}
			}
		});
	});

	$("body").on("submit","#send_msg",function(e){
		e.preventDefault();
		var $msg = $("#send_msg #msg").val();
		if(!$(this).hasClass("disabled")){
			sendTxtMsg($msg);
		}
	});

	$("body").on("click", ".load_more_chats", function(){
		getMoreChats();
	});
	
	
});




