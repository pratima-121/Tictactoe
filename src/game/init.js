import { socketHandler3D, clickHandler3D, loop3D, renderScene3D, init3D } from './3d/events.js'
import { onSink, socketHandler2D, boxClick, init2D } from './2d/events.js'
import $ from '../lib/jquery.js'



const renderGameTypeScreen = () => {
    var gameType = $('<div>');
    var gameTypeList = $('<ul>')
    gameType.addClass('gameType');
    gameType.append(gameTypeList);
    gameTypeList.append('<li id="single"> <div> LONESOME </div> </li> ');
    gameTypeList.append('<li id="multi"> <div> COMRADE  </div> </li> ');
    $(gameWrapper).append(gameType);
}

const appendLI = (parent, text, id, className) => {
    var li;
    li = $('<li>');
    li.text(text);
    li.addClass(className);
    li[0].dataset.id = id;
    parent.append(li);
}

const renderGameList = () => {
    var $gameList = $('<div>')
    var $gameListUL = $('<ul>')
    $(gameWrapper).html('')
    $(gameWrapper).append($gameList)
    $gameList.addClass('gameList')
    $($gameList).append($gameListUL)
    $($gameListUL).append('<li id="createGame"> Start your game </li>')
    board.games.forEach((gameId) => {
        appendLI($gameListUL, gameId, gameId, 'openGames');
    });
}

const generateID = () => {
    var gameID = "ID-";
    gameID += Math.round(Math.random() * 128)
    gameID += "-"
    gameID += Math.round(Math.random() * 42123123)
    gameID += "-"
    gameID += new Date().getTime();
    return gameID;
}

const initGame = (gameID, state) => {
    var windowWidth = $(window).width();
    board.gameID = gameID;

    if (state === undefined) {
        if(windowWidth <= 800) {
            board.gameDim = '2d';
            init2D();
        } else {
            board.gameDim = '3d';
            init3D();
        }
    } else if (state === '3d') {
        board.gameDim = '3d';
        init3D();
    } else if (state === '2d') {
        board.gameDim = '2d';
        init2D();
    }
}

const init = () => {

    console.log('init() fired');

    board.clientID = socket.id;

    renderGameTypeScreen();

    $(document).on('click', '#single', (e) => {
        board.gameType = "single";
        // INIT game with single player
    });

    $(document).on('click', '#multi', (e) => {
        board.gameType = "multi";
        // render game list screen
        renderGameList();
    });

    $(document).on('click', "#createGame", (e) => {
        // initialise a 3D or 2D game
        socket.emit('connect:host', generateID());
        initGame();
    });

    // JOIN OPEN GAME
    // - join the room with the current ID

    $(document).on('click', ".openGames", (e) => {
        var selectedID = e.target.dataset.id
        socket.emit('connect:join', selectedID);
        initGame(selectedID);
    });

    socket.on('player:host', (data) => {
        console.log('player:host')
        console.log('you have joined: ', data);
        console.log(data)
        board.opponentID = data;
    })

    socket.on('player:joined', (data) => {
        console.log('player:joined')
        console.log('a player has joined your game')
        console.log(data);
        board.opponentID = data;
    })

    // GAME LIST EVENTS


    socket.on('gamelist:added', (data) => {
        console.log('socket - gamelist:added')
        console.log('gamelist:added,', data);
        board.games.push(data);
        console.log(board.games);
    });

    socket.on('gamelist:removed', (data) => {
        console.log('gamelist:removed', data);
        board.games = data;
    })

    socket.on('gamelist:all', (data) => {
        console.log('socket - gamelist:all: ', data);
        board.games = data;
        console.log(board.games);
    });

    socket.on('game:state', (data) => {
        console.log('recieved oponent game state: ', data);
    })
}


// -----------------------------------------------------------------------------
// *****************************************************************************
// INIT ************************************************************************
// *****************************************************************************
// -----------------------------------------------------------------------------
socket.on("connect", () => {
    console.log('you are connected as: ', socket.id);
    board.clientID = socket.id;
    init();

    // DEV STUFF ********************************
    // // LAUNCH GAME ON STARTUP
    // socket.emit('connect:host', generateID());
    // initGame('DEV', '3d');
    console.log('connected');

})
