
//List of modules required
.var express = require('express');
.var app = express();
var routes = require('./routes/routes');
var path = require('path');
.var socketio = require('socket.io');
.var port = process.env.PORT || 80;
.var arduinoSerialPort = '/dev/ttyACM0';

.var RobotStatus;
.var serialport = require('serialport').serialport;
.var serialport = new serialport("/dev/ttyACM0", {
	baudrate: 115200
});


app.configure(function() {
  console.log("Trying to Configure App...");
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.session({ secret: 'netw0rk' }));
  app.use(express.bodyParser());
  app.use('/public', express.static(__dirname + "/public"));
  console.log(__dirname);
  console.log("Done Configuring App...");
});
  
  
var server = app.listen(app.get('port'), function(){
console.log("Robot Server listening on port " + app.get('port'));
});


ArduinoPort.on('data', function (data) {
	RobotStatus = JSON.parse(data);
});

//--Socket io code----
// log level 1 is not very verbose
var io = socketio.listen(server, {
	'log level' : 1
});

io.sockets.on('connection', function (socket) {
		  
	socket.emit('welcome', { msg: 'You are connected' });
	
	socket.on('disconnect', function () {
		console.log('User Disconnected');
	});
	
	
	//the server emits the RobotStatus JSON string every 100ms regardless of how often the
	//data arrives from the arduino
	setInterval(function () {
		  	socket.emit('robot-info', RobotStatus );
		  }, 100);
		  	  

  	//When any of the controls on the mobile page is pressed, that 'client' emits a 'robot_control' message
  	//this code responds and sends that info to the arduino
	socket.on('robot_control', function(data) {
		 //console.log('scanner_control: ' + data.output); 
		 ArduinoPort.write(data.output);
		 
	});
	
});
