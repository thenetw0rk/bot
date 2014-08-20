//List of modules required
var express = require('express')
var http = require('http')
var path = require('path')
var serialport = require('serialport')
var socketio = require('socket.io');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use('/public', express.static(__dirname + "/public"));

});

require('./routes/routes.js')(app);

var server = app.listen(app.get('port'), function(){
  console.log("Robot Server listening on port " + app.get('port'));
});


//--SerialPort Code---
//Listening on the serial port for data coming from Arduino over USB
var arduinoSerialPort = '/dev/ttyACM0';
var RobotStatus;

var ArduinoPort = new serialport.SerialPort(arduinoSerialPort, {
  parser: serialport.parsers.readline('\n'),
  baudrate: 115200
});

console.log('Serial Port Started...');

//When a new line of text is received from Arduino over USB
ArduinoPort.on('data', function (data) {
  RobotStatus = JSON.parse(data);
});

//--Socket io code----
// log level 1 is not very verbose
var io = socketio.listen(server, {
  'log level' : 1
});
io.sockets.on('connection', function (socket) {

  /* socket.emit('welcome', { msg: 'You are connected' });

  socket.on('disconnect', function () {
    console.log('User Disconnected');
  });
  */

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
