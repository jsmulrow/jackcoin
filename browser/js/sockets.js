// attach sockets
var socket = io(window.location.origin);
console.log('connected socketio');

socket.on('connect', function() {
	console.log('browser connected to server (i.e. node)');
});
