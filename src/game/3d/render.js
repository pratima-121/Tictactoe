import { OBJ, SCENE, ANIM, scene, color, camControls, objControls, createGUIHelper, devAnimations, getObjectsByName, updateAnimationModel } from './model.js';

// console.log('/3d/render.js: ' , OBJ, SCENE, ANIM, scene, color, camControls, objControls, createGUIHelper, devAnimations, getObjectsByName, updateAnimationModel);

// RENDER **********************************************************************

export const addCamera = () => {
    SCENE.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 800)
    SCENE.camera.position.x = -35;
    SCENE.camera.position.y = 63;
    SCENE.camera.position.z = 54;
    SCENE.camera.lookAt(scene.position);
};

export const addOrbitControls = () => {
    SCENE.orbitControls = new THREE.OrbitControls(SCENE.camera);
    // SCENE.orbitControls.autoRotate = true;
    SCENE.clock = new THREE.Clock();
};

export const addRenderer = () => {
    SCENE.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    SCENE.renderer.setSize(window.innerWidth, window.innerHeight);
    SCENE.renderer.shadowMap.enabled = true;
};

export const addPlane = () => {
    var planeGeo = new THREE.PlaneGeometry(50, 50);
    var planeMat = new THREE.MeshLambertMaterial({color: color.blue});
    var plane = new THREE.Mesh(planeGeo, planeMat);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;
    scene.add(plane);
};

export const addGrid3D = () => {
    var cubeId = 0;
    for (var h = 0; h < 3; h += 1) {
        for (var w = 0; w < 3; w += 1) {
            addCube(w, h, cubeId);
            cubeId += 1;
        }
    }
};

export const addCube = (w, h, cubeId) => {
    var cubeGeo = new THREE.BoxGeometry(5, 5, 5);
    var cubeMat = new THREE.MeshLambertMaterial({color: color.red});
    OBJ.cube = new THREE.Mesh(cubeGeo, cubeMat);
    OBJ.cube.castShadow = true;
    OBJ.cube.position.x = -13 + (h * 8);
    OBJ.cube.position.y = 10;
    OBJ.cube.position.z = -4.5 + (w * 8);
    OBJ.cube.name = 'cube-' + cubeId;
    scene.add(OBJ.cube);
}

export const addLight = () => {
    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( -40, 60, -10 );
    spotLight.castShadow = true;
    scene.add(spotLight);
}

export const addCloud = () => {
    return createCloud();
}

export const createCloud = () => {
    var mesh = new THREE.Object3D();
    var geom = new THREE.BoxGeometry(20,20,20);
    var mat = new THREE.MeshPhongMaterial({color: color.white});

    // duplicate the geometry a random number of times
	var nBlocs = 3+Math.floor(Math.random()*3);
	for (var i=0; i<nBlocs; i++ ){
		// create the mesh by cloning the geometry
		var m = new THREE.Mesh(geom, mat);
		// set the position and the rotation of each cube randomly

        var f = .3;

		m.position.x = i*15 * f;
		m.position.y = Math.random()*10 * f;
		m.position.z = Math.random()*10 * f;
		m.rotation.z = Math.random()*Math.PI*2;
		m.rotation.y = Math.random()*Math.PI*2;
		// set the size of the cube randomly
		var s = .1 + Math.random()*.9 * f;
		m.scale.set(s,s,s);

		// allow each cube to cast and to receive shadows
		m.castShadow = true;
		m.receiveShadow = true;

		// add the cube to the container we first created
		mesh.add(m);
	}

    return mesh;
}

export const createSky = () => {

    var mesh = new THREE.Object3D();

    var nClouds = 600;

    var stepAngle = Math.PI*2 / nClouds;

    for (let i = 0; i < nClouds; i += 1) {

        var cloud = createCloud();

        var angle = stepAngle * i;
        var height = 200 + Math.random() * 200; // play with these
        var scale = 1 + Math.random() * 2;

        // cloud.position.y = Math.sin(angle) * height;
        // cloud.position.x = Math.cos(angle) * height;
        // cloud.rotation.z = angle + Math.PI / 2;
        // cloud.position.z = -200 - Math.random() * 400; // play with these'

        cloud.position.x = Math.sin(angle) * height;
        cloud.position.z = Math.cos(angle) * height;
        cloud.rotation.y = angle + Math.PI / 8;
        cloud.position.y =  -500 + Math.random() * 1000; // play with these'

        cloud.scale.set(scale, scale, scale);

        mesh.add(cloud);
    }

    return mesh;
}

export const addObjectToScene = (scene, state, name, object) => {
    state[name] = object;
    scene.add(state[name]);
}


export const createWater = () => {

    var geom = new THREE.SphereGeometry(60, 20, 20);
    var mat = new THREE.MeshPhongMaterial(
        { color : color.blue
        , transparent: false
        , opacity: 0.6
        , shading: THREE.FlatShading
        }
    );

    var water = new THREE.Mesh(geom, mat);

    water.receiveShadow = true;

    // rotate geomtry on the x-axis

    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    geom.mergeVertices();

    var l = geom.vertices.length;
    // debugger;

    water.castShadow = true;
    water.position.x = 0;
    water.position.y = -51;
    water.position.z = -7.4;

    water.waves = geom.vertices.map((v) => {
        return {
            y: v.y,
            x: v.x,
            z: v.z,
            ang: Math.random() * Math.PI * 2,
            amp: 1 + Math.random() * Math.PI * 2,
            speed: 0.016 + Math.random() * 0.032,
        }
    });

    water.moveWaves = function (spec) {
        water.geometry.vertices.forEach(function (vert, i) {
            // console.log(water.waves[i]);
            var vprops = water.waves[i];
            vert.x = vprops.x + Math.cos(vprops.ang) * ( vprops.amp + spec.ampX);
		    vert.y = vprops.y + Math.sin(vprops.ang) * ( vprops.amp + spec.ampY);
            vprops.ang += vprops.speed + spec.speed;
        })
        water.geometry.verticesNeedUpdate=true;
    }
    return water;
}
