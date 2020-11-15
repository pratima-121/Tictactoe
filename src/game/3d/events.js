
import { OBJ, SCENE, ANIM, color, camControls, objControls, createGUIHelper, devAnimations, getObjectsByName, updateAnimationModel } from './model.js';

import { addCamera, addOrbitControls, addRenderer, addPlane, addGrid3D, addCube, addLight, addCloud, createCloud, createSky, addObjectToScene, createWater } from './render.js'

import { updateControls, updateColor, rotateCube, sinkCube, rotateSky, rotateWater, changeCubeColor, animateObjects, updateAnimation, updateRender3d } from './animation.js'

// console.log('/3d/events.js: ',updateControls, updateColor, rotateCube, sinkCube, rotateSky, rotateWater, changeCubeColor, animateObjects, updateAnimation, updateRender3d );


// EVENTS **********************************************************************

// What we need to do is listen for click events from the DOM version
//

LOLS.sickmate = 'lol';

console.log(LOLS);

export const socketHandler3D = (data) => {

    // origin client event
        // mark x on thing
        // emit x to server

    // server
        // recieve data
        // emit to clients

    // dest client event
        // recieve mark x data
        // mark x on board

    // CASES ----------------------

    // 3d to 2d socket

    // 2 DESKTOP CLIENTS

    // >2 connected client
    var newModel = updateModel(board, data);
    updateRender3D(scene, newModel);
}

export const clickHandler3D = (evt) => {
    // vector is created based on the position that
    // we've clicked on, on the screen.

    var vector = new THREE.Vector3(
        (event.clientX / window.innerWidth ) * 2 - 1,
       -(event.clientY / window.innerHeight ) * 2 + 1, 0.5);

    //with the unprojectVector function we convert the
    //clicked position on the screen, to coordinates in our Three.js scene.

    vector = vector.unproject(SCENE.camera);

    //send out a ray into the world from the position we've clicked on,
    //on the screen.

    var raycaster = new THREE.Raycaster(SCENE.camera.position, vector.sub(SCENE.camera.position).normalize());

    // get the clicked object if it is of the type we specify ie. name = 'cube';

    var intersectCube = raycaster.intersectObjects(getObjectsByName(scene, 'cube'));

    // -------------------------------------------------

    // if we clicked on the cube object then;
    var newModel = board;

    var selectedCubeId, selectedObject;

    if (intersectCube.length !== 0) {
        selectedCubeId = intersectCube[0].object.name.slice(5, 6);
        selectedObject = intersectCube[0].object;
        console.log(selectedCubeId);
        newModel = updateModel(board, selectedCubeId);
        socket.emit('game:play', selectedCubeId);
    } else if (false) {
        // if clicked on another element, do something
    } else if (false) {
        // same same
    }
    updateRender3D(scene, newModel);
};

export var loop3D = () => {
    devAnimations();
    updateControls(SCENE.clock, SCENE.orbitControls);
    updateAnimation(board);
    requestAnimationFrame(loop3D);
    OBJ.water.moveWaves(board.water)
    SCENE.renderer.render(scene, SCENE.camera);
}

export var renderScene3D = () => {
    addLight();
    addCamera();
    addOrbitControls();
    addRenderer();
    // addPlane();
    addGrid3D();
    addObjectToScene(scene, OBJ, 'sky', createSky())
    addObjectToScene(scene, OBJ, 'water', createWater())
    loop3D();
    getObjectsByName(scene, 'cube');
}

export const init3D = () => {
    gameWrapper.innerHTML = "";
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xf7d9aa, 0.015, 400 );
    renderScene3D();
    gameWrapper.appendChild(SCENE.renderer.domElement);
    document.addEventListener('mousedown', clickHandler3D, false);
    createGUIHelper();
    socket.on('game:play', (data) => {
        socketHandler3D(data);
    })
}
