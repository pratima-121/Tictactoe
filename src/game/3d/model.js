import { socket, ArrforEachProto, createNode, gameWrapper } from '../util.js'

// console.log('/model.js/: ', socket, ArrforEachProto, createNode, gameWrapper);



export const OBJ = {}
export const SCENE = {}
export const ANIM = {}
// export var scene;

export const color = {
  red         : 0xf25346,
  white       : 0xd8d0d1,
  brown       : 0x59332e,
  pink        : 0xF5986E,
  brownDark   : 0x23190f,
  blue        : 0x68c3c0,
  green       : 0xBED730,
}

// DEV *************************************************************************

export var camControls = new function () {
    this.rotationSpeed = 0
    this.camX = -30
    this.camY = 60
    this.camZ = 30
}

export var objControls = new function () {
    // this.scaleX = 1
    // this.scaleY = 1
    // this.scaleZ = 1
    this.positionX = -9.7
    this.positionY = -53.7
    this.positionZ = 5.9

}


export const createGUIHelper = () => {

    const gui = new dat.GUI();

    [ [ 'rotationSpeed', 0, 1 ]
    , [ 'camX', -100, 0 ]
    , [ 'camY', 0, 100 ]
    , [ 'camZ', 0, 100 ]
    ]
    .forEach( ([prop, low, high]) => {
        gui.add( camControls, prop, low, high );
    });

    var cube1Folder = gui.addFolder('Cube_1');

    [
    //   [ 'scaleX', 0, 5, .001 ]
    // , [ 'scaleY', 0, 5, .001 ]
    // , [ 'scaleZ', 0, 5, .001 ]
    // ,
      [ 'positionX', -100, 100, .001 ]
    , [ 'positionY', -100, 100, .001 ]
    , [ 'positionZ', -100, 100, .001 ]
    ]
    .forEach( ([prop, low, high]) => {
        cube1Folder.add( objControls, prop, low, high );
    });

};

export const devAnimations = () => {

    OBJ.cube.rotation.x += camControls.rotationSpeed;
    OBJ.cube.rotation.z += camControls.rotationSpeed;
    OBJ.cube.position.x += camControls.rotationSpeed;
    //
    // SCENE.camera.position.x = camControls.camX;
    // SCENE.camera.position.y = camControls.camY;
    // SCENE.camera.position.z = camControls.camZ;

    // OBJ.water.scale.x = objControls.scaleX;
    // OBJ.water.scale.y = objControls.scaleY;
    // OBJ.water.scale.z = objControls.scaleZ;

    OBJ.water.position.x = objControls.positionX;
    OBJ.water.position.y = objControls.positionY;
    OBJ.water.position.z = objControls.positionZ;
}

// UTIL ************************************************************************

export const getObjectsByName = (sceneObject, name) => {
    return sceneObject.children.filter(item => {
      if (!item.name) { return false }
      return item.name.split('-')[0] === name;
    })
}

// ANIM STATE  *************************************************************




// ANIMATION MODEL *************************************************************

// updateAnimationModel()
// constantly checking the state of the scene to change the board
// model is thus animation dependent
//  this means something for th

export const updateAnimationModel = (model) => {

    var newModel = model;
    var cubeAmount = getObjectsByName(scene, 'cube').length;
    var sinkCounter = 0, riseCounter = 0;


    scene.children.forEach((object) => {
        // cube objects
        if (object.name.slice(0, object.name.indexOf('-')) === 'cube') {
            // if sunk, then turn 'rise' switch on
            if (object.position.y <= -4) {
                sinkCounter += 1;
            }
            // if risen, turn cutscene to false
            if (object.position.y > 10 && model.cutscene !== "sink") {
                riseCounter += 1;
            }
        }
        // other objects to come
    });

    if(sinkCounter === cubeAmount) {
        model.cutscene = 'rise';
        model.boxes = [null, null, null, null, null, null, null, null, null];

        model.water = {  ampX: 1
                     ,  ampY: 1
                     , speed: 0.2
                    };
    }

    if (riseCounter === cubeAmount) {
        model.cutscene = false;
        if (!model.cutscene && !model.active) {
            socket.emit('game:state', true);
        }
        model.active = true;
        model.water = {  ampX: 0
                     ,  ampY: 0
                     , speed: 0
                    };
    }

    return newModel;
}
