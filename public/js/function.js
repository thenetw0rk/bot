var socket;
socket = io.connect("http://192.168.1.10:3000");
//Modes and Info
var DRIVE_AUTO 		= 'a';  
var DRIVE_MANUAL 	= 'm'; //  
var DRIVE_HALT 		= 'h'; //  
var DRIVE = DRIVE_MANUAL;

var SCAN_CONTINUOUS = 'o'; //  
var SCAN_TURN		= 't'; //  
var SCAN_FORWARD	= 'f'; //  
var SCAN_LEFT		= 'l'; // 
var SCAN_RIGHT		= 'r'; // 
var SCAN_STOP		= 's'; // 
var SCAN = SCAN_FORWARD;

//Guidance and Power
var MOVE_FORWARD 	= 'f'; //  
var MOVE_BACK 		= 'b'; //  
var TURN_LEFT 		= '<'; //  
var TURN_RIGHT 		= '>'; //  
var STOP			= 's';
var MOVE = STOP;
var old_MOVE = STOP;	//this is to resume either forward motion or stop after a turn

var POWER 	= 0;
var INFO	= 0; // 


$(function() {
	socket.on('robot-info', function (data) {
		//console.log("Serial Status: " + data.msg);
		$("#robot-status").html("<em>Status: </em>" + data.Status);
		$("#robot-info").html("<em>Drive: </em>" + data.Drive + 
								" <em>Scan: </em>" + data.Scan +
								" <em>Power: </em>" + data.Power);
		$("#distance-info").html("<em>Left: </em>" + data.Left +
									" <em>Forward: </em>" + data.Forward +
									" <em>Right: </em>" + data.Right);	
	});

	//$("#robot-status").hide();
	$("#robot-info").hide();
	$("#distance-info").hide();

/* 	Scanner Control */		  
	var refreshScannerFunction = function() {
		  	/*
			$('#scanner-left').attr("data-theme", "d").removeClass("ui-btn-up-e").addClass("ui-btn-up-d");
		  	$('#scanner-center').attr("data-theme", "e").removeClass("ui-btn-up-d").addClass("ui-btn-up-e");
		  	$('#scanner-right').attr("data-theme", "d").removeClass("ui-btn-up-e").addClass("ui-btn-up-d");
		  	*/
			$('#scanner-right').attr("checked",false).checkboxradio("refresh");
			$('#scanner-left').attr("checked",false).checkboxradio("refresh");
			$('#scanner-center').attr("checked",true).checkboxradio("refresh");
			SCAN = SCAN_FORWARD;
			UpdateControl();	
	};
	
	var refreshMoveFunction = function() {
		$('#turn-left').attr("checked",false).checkboxradio("refresh");
    	$('#turn-right').attr("checked",false).checkboxradio("refresh");
    	MOVE = old_MOVE;
    	UpdateControl();
    	if (MOVE == MOVE_FORWARD)
	    	$('#forward').attr("checked",true).checkboxradio("refresh");
    	else 
    		$('#stop').attr("checked",true).checkboxradio("refresh");
	};
	
		  	  
	$('#scanner-left').click(function() {
    	console.log("left clicked");
    	SCAN = SCAN_LEFT;
    	setTimeout(refreshScannerFunction, 2000); 
    	UpdateControl();
    });
    $('#scanner-center').click(function() {
    	console.log("center clicked");
    	SCAN = SCAN_FORWARD;
    	UpdateControl();
    });
    
    $("#scanner-right").click(function() {
    	console.log("right clicked");
    	SCAN = SCAN_RIGHT;
    	setTimeout(refreshScannerFunction, 2000);  
    	UpdateControl();
    });
    
    $('#scanner-continuous').click(function() {
    	console.log("continuous clicked");
    	$('#scanner-center').attr("checked",false).checkboxradio("refresh");
    	$('#scanner-right').attr("checked",false).checkboxradio("refresh");
		$('#scanner-left').attr("checked",false).checkboxradio("refresh");
    	SCAN = SCAN_CONTINUOUS;
    	UpdateControl();
    });
    
/* Direction Control */
    $('#forward').click(function() {
    	console.log("forward");
    	$('#turn-left').attr("checked",false).checkboxradio("refresh");
    	$('#turn-right').attr("checked",false).checkboxradio("refresh");
    	MOVE = MOVE_FORWARD;
    	UpdateControl();
    });
    $('#turn-left').click(function() {
    	console.log("turn left");
    	$('#forward').attr("checked",false).checkboxradio("refresh");
    	$('#back').attr("checked",false).checkboxradio("refresh");
    	$('#stop').attr("checked",false).checkboxradio("refresh");
    	setTimeout(refreshMoveFunction, 1000);
    	old_MOVE = MOVE;
    	MOVE = TURN_LEFT;
    	UpdateControl();
    });
    $('#turn-right').click(function() {
    	console.log("Turn Right");
    	$('#forward').attr("checked",false).checkboxradio("refresh");
    	$('#back').attr("checked",false).checkboxradio("refresh");
    	$('#stop').attr("checked",false).checkboxradio("refresh");
    	setTimeout(refreshMoveFunction, 1000);
    	old_MOVE = MOVE;
    	MOVE = TURN_RIGHT;
    	UpdateControl();
    });
    $('#back').click(function() {
    	console.log("Move Back");
    	$('#turn-left').attr("checked",false).checkboxradio("refresh");
    	$('#turn-right').attr("checked",false).checkboxradio("refresh");
    	MOVE = MOVE_BACK;
    	UpdateControl();
    	
    	setTimeout(function() {
    		$('#back').attr("checked",false).checkboxradio("refresh");
    		$('#stop').attr("checked",true).checkboxradio("refresh");
    	}, 1700);
    });
    $('#stop').click(function() {
    	console.log("Stop");
    	$('#turn-left').attr("checked",false).checkboxradio("refresh");
    	$('#turn-right').attr("checked",false).checkboxradio("refresh");
    	MOVE = STOP;
       	POWER = 0;
       	$( "#speed" ).val("0").slider("refresh");
       	console.log("Speed: " + $("#speed").val());
    	UpdateControl();
    });

/* Drive Mode     */
	$('#drive_auto').click(function() {
    	console.log("Drive Auto");
    	DRIVE = DRIVE_AUTO;
    	$(this).attr("data-theme", "b");
    	$('#drive_manual').attr("data-theme", "a").removeClass("ui-btn-up-b").addClass("ui-btn-up-a");
    	UpdateControl();
    });

    $('#drive_manual').click(function() {
    	console.log("Drive Manual");
    	$(this).attr("data-theme", "b");
    	$('#drive_auto').attr("data-theme", "a").removeClass("ui-btn-up-b").addClass("ui-btn-up-a");
    	DRIVE = DRIVE_MANUAL;
    	UpdateControl();
    });

/* Speed Control*/
    $( "#speed" ).on( 'slidestop', function( event ) {
            POWER = $( this ).val();
            console.log("Speed: " + POWER); 
	        UpdateControl();           
    });

/* Robot Info */
	$( "#robot-data" ).on( 'slidestop', function( event ) {
		var value = $(this).val();
		 console.log("value: " + value);
		 if (value == 'on') {
		 	INFO = 1;
		 	$("#robot-info").show('slow');
		 	$("#distance-info").show('slow');
		 	//$("#robot-status").show('slow');
		 }
		 else {
		 	INFO = 0;
		 	$("#robot-info").hide('slow');
		 	$("#distance-info").hide('slow');
		 	//$("#robot-status").hide('slow');
		 }
		 UpdateControl();
	});
	
});

function UpdateControl() {
	
	str = DRIVE + SCAN  + POWER + MOVE + INFO;
	socket.emit('robot_control', {output: str});
}

