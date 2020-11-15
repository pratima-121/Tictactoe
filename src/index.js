import React from 'react'
import ReactDOM from 'react-dom'
import { hashHistory, Router, Route, Redirect, Link } from 'react-router';

class App extends React.Component {
    constructor() {
        super();
    }

    render () {
        return (
            <div>
                <Game />
                hi
            </div>
        )
    }
}

const Game = () => {
    return (
        <div id="gameWrapper">
        </div>
    )
}

ReactDOM.render(<App/> , document.getElementById('master'))

// ------------------------------------------------------------------

//
// // GAME-- -------------------------
// import './game/util.js';
// import './game/model.js';
//
//     // 3D -------------------------
//     import './game/3d/model.js';
//     import './game/3d/render.js';
//     import './game/3d/animation.js';
//     import './game/3d/events.js';
//     // 2D -------------------------
//     import './game/2d/model.js';
//     import './game/2d/render.js';
//     import './game/2d/events.js';
//
// import './game/init.js';
