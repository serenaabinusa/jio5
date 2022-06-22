const socket = require("socket.io");

const socketServer = (server) => {
	// Socket setup
	const io = socket(server);
	// const statusdata = io.of('/status')

	// statusdata.on('connection', function(socket) {
	// 	console.log("Made socket connection");

	// 	socket.emit('welcome', {
	// 		message: 'Welcome!',
	// 		id: socket.id
	// 	});

	// });
	return io
}

module.exports = socketServer;