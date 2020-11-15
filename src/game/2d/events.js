import {createBoard, resetModel, resetBoxes, updateModel, isWin} from '../model.js'
import {reset2DModel} from './model.js'

// console.log('/2d/events.js: ', createBoard, resetModel, resetBoxes, updateModel, isWin);

export const onSink = (model, callback) => {
    if(model.cutscene === 'sink') callback(model);
}

export const socketHandler2D = (data, domNode) => {
    var newModel = updateModel(board, data);
    render2D(newModel, domNode);
}

export const boxClick = (model, gameNode) => {
    return (event) => {
        var clickedId = event.currentTarget.dataset.box;
        console.log('clicked: ', clickedId);
        console.log('before update model: ', model);
        updateModel(model, clickedId);
        console.log('after update model: ', model);
        render2D(model, gameNode);
        forEachElementByClass('box',
            addListener('click', boxClick(model, gameNode)));
        socket.emit('game:play', clickedId);
        onSink(model, () => {
            console.log('on sink callback ------')
            console.log(reset2DModel(model).boxes);
        });
    }
}

export const init2D = (gameID) => {
    gameWrapper.innerHTML = "";
    var game2D = document.createElement('div')
        gameWrapper.appendChild(game2D);
    render2D(board, game2D);
    forEachElementByClass('box', addListener('click', boxClick(board, game2D)));
    socket.on('game:play', (data) => {
        socketHandler2D(data, game2D);
        forEachElementByClass('box',
            addListener('click', boxClick(board, game2D)));
    });
}
