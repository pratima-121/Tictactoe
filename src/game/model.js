import { ArrforEachProto, createNode, gameWrapper } from './util.js'

console.log(socket);

// board export constructor
export const createBoard = (dimension) => {
  return {
    turn        : playerO,
    boxes       : (new Array(9)).fill(null),
    active      : true,
    cutscene    : false,
    end         : false,
    winPos      : [],
    gameID      : '',
    gameType    : '',
    gameDim     : dimension,
    games       : [],
    opponentID  : null,
    clientID    : null,
    water       : { ampX: 0, ampY: 0, speed: 0 }
  }
}

board = createBoard();

export const resetModel = (model) => {
    model = createBoard()
}

export const resetBoxes = (model) => {
    model.boxes = (new Array(9).fill(null));
    return model.boxes;
}

export const updateModel = (model, boxId) => {
    var model = model

    //if multiplayer without another player
    if (model.gameType === "multi" && model.opponentID === null) {
        return model
    }

    // Ignore if box already clicked or game not active
    if (model.boxes[boxId] !== null || !model.active) {
      return model
    }

    // updateModel: box
    model.boxes[boxId] = model.turn;

    // ifGameOver deactivate model
    if ( isWin(model).state === 'draw' ) {
        model.active = false
        // reset2DModel(model)
        return model
    }

    // win condition
    if ( isWin(model).state === 'win' ) {
        model.active = false
        socket.emit('game:state', model.active);
        model.winPos = isWin(model).winPositions
        model.cutscene = 'sink'
        // reset2DModel(model);
        return model
    }

    // updateModel: turn
    if( model.turn === playerX ) {
        model.turn = playerO
    } else {
        model.turn = playerX
    }

    return model;
}

export const isWin = (model) => {
    var drawCounter = 0;
    var topLeft = model.boxes[0];
    var topMid = model.boxes[1];
    var topRight = model.boxes[2];
    var midLeft = model.boxes[3];
    var midMid = model.boxes[4];
    var midRight = model.boxes[5];
    var botLeft = model.boxes[6];
    var botMid = model.boxes[7];
    var botRight = model.boxes[8];

    // var winStates = [[0, 1, 2],
    //                  [3, 4, 5],
    //                  [6, 7, 8],
    //                  [0, 3, 6],
    //                  [1, 4, 7],
    //                  [2, 5, 8],
    //                  [0, 4, 8],
    //                  [2, 4, 6]]
    //
    // winStates.forEach(function(state){
    //     // loop through win states
    //     // check to see if the win states are satisified
    //     // append to a counter
    //     state.forEach(function(pos) {
    //         var currentBox = model.boxes[pos];
    //
    //     })
    //
    //     // if its 3 then then a win state has been found
    // })


    if ((topLeft !== null) && (topMid !== null) && (topRight !== null)) {
        if((topLeft === topMid) && (topMid === topRight)) return {state: 'win', winPositions: [0, 1, 2]};
    };
    if ((midLeft !== null) && (midMid !== null) && (midRight !== null)) {
        if((midLeft === midMid) && (midMid === midRight)) return {state: 'win', winPositions: [3, 4, 5]};
    };
    if ((botLeft !== null) && (botMid !== null) && (botRight !== null)) {
        if((botLeft === botMid) && (botMid === botRight)) return {state: 'win', winPositions: [6, 7, 8]};
    };
    // // VERTICAL
    if ((topLeft !== null) && (midLeft !== null) && (botLeft !== null)) {
        if((topLeft === midLeft) && (midLeft === botLeft)) return {state: 'win', winPositions: [0, 3, 6]};
    };
    if ((topMid!== null) && (midMid!== null) && (botMid!== null)) {
        if((topMid=== midMid) && (midMid=== botMid)) return {state: 'win', winPositions: [1, 4, 7]};
    };
    if ((topRight !== null) && (midRight !== null) && (botRight !== null)) {
        if((topRight === midRight) && (midRight === botRight)) return {state: 'win', winPositions: [2, 5, 8]};
    };
    // // CROSS
    if ((topLeft !== null) && (midMid !== null) && (botRight !== null)) {
        if((topLeft === midMid) && (midMid === botRight)) return {state: 'win', winPositions: [0, 4, 8]};
    };
    if ((topRight !== null) && (midMid !== null) && (botLeft !== null)) {
        if((topRight === midMid) && (midMid === botLeft)) return {state: 'win', winPositions: [2, 4, 6]};
    };

    for (var i = 0; i < model.boxes.length; i += 1) {
        if (model.boxes[i] !== null) drawCounter += 1;
        if (drawCounter === (model.boxes.length)) {
            return {state: 'draw', winPositions: [0, 1, 2]};
        }

    }

    return false;
}

console.log('model.js rendered');
