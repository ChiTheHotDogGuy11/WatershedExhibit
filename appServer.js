var io;
var gameSocket;

/**
	This defines the behavior of the server.
**/

/**
 * This function is called by index.js to initialize a new simulation instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initSimulation = function(sio, socket){
	console.log("Connected on node end.");
    io = sio;
    gameSocket = socket;

    gameSocket.emit('connected', { message: "You are connected!" });

    // Host Events
    /*gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('hostRoomFull', hostPrepareGame);
    gameSocket.on('hostCountdownFinished', hostStartGame);
    gameSocket.on('hostNextRound', hostNextRound);

    // Player Events
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('playerAnswer', playerAnswer);
    gameSocket.on('playerRestart', playerRestart);*/
}

exports.update = function(data) {
    gameSocket.emit('update', { message: data});
    console.log("update sent");
}
