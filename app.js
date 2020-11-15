"use strict";

const express   = require('express');
const app       = express();
const http      = require('http').Server(app);
const io        = require('socket.io')(http);
const path      = require("path");

app.set('port', process.env.PORT || 3005);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/app.html'));
});

app.use((req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

app.use((err, req, res, next) => {
    console.log(err);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

// Store all rooms here
var currentRooms = [];

const addUniqueToArray = (array, thing) => {
    if(array.indexOf(thing) === -1) return array.push(thing);
    return array;
}

const getCurrentRoom = (rooms) => {
    var currentRoom = '';
    for (let key in rooms) {
        if (key.slice(0, 2) === "ID") {
            currentRoom = key;
        }
    }
    if(currentRoom === '') {
        currentRoom = "could not find room"
    }
    return currentRoom;
}

const getRooms = (socketRooms) => {
    var roomsAndClients = socketRooms, rooms = {};
    for (let key in roomsAndClients) {
        var first3char = key.slice(0,3);
        if (first3char === "ID-") {
            rooms[key] = roomsAndClients[key];
        }
    }
    return rooms;
}

const getOpenRooms = (rooms) => {
    var openRooms = [];
    for (let key in rooms) {
        var occupants = rooms[key].length;
        if (occupants < 2) {
            openRooms.push(key);
        }
    }
    return openRooms;
}


const getCurrentPlayers = (currentRoom, socket) => {
    var currentPlayers = [], currentClients;
    currentClients = io.sockets.adapter.rooms[currentRoom].sockets;
    for (let key in currentClients) {
        currentPlayers.push(key);
    }
    return currentPlayers;
}

// getOtherPlayer()
// gets the other players ID

const getOtherPlayer = (currentRoom, playerID, socket) => {
    var currentPlayers = [], currentClients, playerSocketID;
    playerSocketID = playerID;
    console.log('excluding ', playerSocketID)
    currentClients = io.sockets.adapter.rooms[currentRoom].sockets;
    for (let key in currentClients) {
        if(playerSocketID !== key) {
            currentPlayers.push(key);
        }
    }
    return currentPlayers[0];
}

const removeRoom = (rooms, roomID) => {
    var rooms = rooms;
    var roomIdIndex = rooms.indexOf(roomID);
    rooms.splice(roomIdIndex, 1);
    return rooms;
}

io.on('connection', (socket) => {

    console.log("socket connection established: " + socket.id);
    console.log("current open rooms are: ", currentRooms);
    console.log("this current socket is in: ", socket.rooms)

    socket.emit('gamelist:all', currentRooms);

    socket.on('game:play', (data) => {
        // only emit plays clients in the same room
        var currentRoom = getCurrentRoom(socket.rooms);
        io.to(currentRoom)
            .emit('game:play', data);
    });

    socket.on('game:state', (data) => {
        console.log('game state of', socket.id , 'is', data);
        //broadcast the state to the other client connected in the same room
        var gameState = {}
            gameState.state = data;
        var currentRoom = getCurrentRoom(socket.rooms);

        socket.to(currentRoom)
            .emit('game:state', gameState);
    });

    socket.on('connect:host', (gameID) => {

        // WHAT DOES THIS EVEN DO MATE?

        console.log('connecting to ' + gameID);
        var rooms = getRooms(io.sockets.adapter.rooms);
        console.log('rooms: ', rooms);
        var openRooms = getOpenRooms(rooms); // instead of getting all rooms
        console.log('openRooms: ', openRooms);
        socket.join(gameID, () => {

            if (Object.keys(rooms).length === 0) {
                console.log('sending gameID')
                addUniqueToArray(currentRooms, gameID);
                io.emit('gamelist:added', [gameID]);
            } else {
                console.log('sending found ID');
                addUniqueToArray(currentRooms, gameID);
                io.emit('gamelist:added', openRooms);
            }


        })
    });

    socket.on('connect:join', (gameID) => {
        socket.join(gameID, () => {
            var currentRoom = getCurrentRoom(socket.rooms);
            // console.log('connect:join - socket.rooms: ', socket.rooms);
            // console.log('connect:join - io.rooms: ', io.sockets.adapter.rooms)
            var joiningID = socket.id;
            var hostID = getOtherPlayer(currentRoom, joiningID, socket);
            socket.emit('player:host', hostID);
            io.emit('gamelist:removed', removeRoom(currentRooms, gameID));
            socket.to(currentRoom).emit('player:joined', joiningID);
        });
    });

    socket.on('disconnect:game', function(gameID) {
        socket.leave(gameID, () => {
            console.log('leaving');
        });
    });

    socket.on('disconnect', function () {
        console.log('disconnected');

        var rooms = getRooms(io.sockets.adapter.rooms);
        var openRooms = getOpenRooms(rooms); // instead of getting all rooms
        if(openRooms.length) {



            openRooms.forEach((room) => {

                // ADDINIG WHEN ANY PLAYER DISCONNECTS
                io.emit('gamelist:added', openRooms);
                var otherPlayer = getOtherPlayer(room, socket.id, socket)
                console.log('getOtherPlayer: ', otherPlayer);


                // Instead of looping through all rooms
                // loop through the rooms the current socket is inside
                console.log('checking if can get currentRooms: ', io.sockets.adapter.rooms[room].sockets)

                if (otherPlayer) {
                    console.log('ADDING TO CURRENT ROOMS');
                    addUniqueToArray(currentRooms, room);
                } else {
                    let currentRoomIndex = currentRooms.indexOf(room);
                    currentRooms.slice(currentRoomIndex, currentRoomIndex + 1);
                    console.log(currentRooms);
                }
                // IF THERE IS ONLY ONE PERSON LEFT WE SHOULD NOT PUSH
            });
        } else {
            currentRooms = [];
        }

        console.log('rooms: ', rooms);
        console.log('openRooms: ', openRooms);
    });
});

http.listen(app.get('port'), () => {
    console.log('express started on ' + app.get('port'));
});
