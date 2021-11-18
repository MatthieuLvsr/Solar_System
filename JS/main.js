// Path to three js :  '../../three.js-master'

import * as THREE from '../../three.js-master/build/three.module.js';
import { OrbitControls } from '../../three.js-master/examples/jsm/controls/OrbitControls.js';
import {GUI} from "../../three.js-master/examples/jsm/libs/dat.gui.module.js";
import Stats from '../../three.js-master/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from '../../three.js-master/examples/jsm/loaders/GLTFLoader.js';

let load = 0
let bar = document.getElementsByClassName('progress-bar')[0]

let scene, camera, renderer, stats, clock, controls, pause = false;
let helpSphere, sun, mercury, mars, earth, clouds, earthNight, earthNightGhost, earthGhost, moon, venus, venusAtmosphereF, venusAtmosphereB, jupiter, ghostSaturn, saturn, ring, uranus, neptune, spaceship, spaceshipGhost, deathstar;
let earthTexture, cloudTexture, earthNightTexture, earthNormalMap, earthRoughMap, sunTexture, mercuryTexture, mercuryNormalMap, marsTexture, marsNormalMap, earthBumpMap, moonTexture, moonNormalMap
let venusTexture, venusBumpMap, venusAtmosphereTexture, jupiterTexture, saturnTexture, ringTexture, uranusTexture, neptuneTexture, skyBoxTexture
let alpha_mercury = 0;
let alpha_venus = 5
let alpha_moon = 10;
let alpha_earth = 15;
let alpha_mars = 25
let alpha_jupiter = 30
let alpha_saturn = 35
let alpha_uranus = 40
let alpha_neptune = 45

let alpha_speed = 0.001;

let divStats = true

let camPos = new THREE.Vector3(0,305,2005)
let shipPos = new THREE.Vector3(0,300,2000)


const Z = 'z'
const Q = 'q'
const S = 's'
const D = 'd'
const P = 'p'
const SHIFT = 'shift'
const SPACE = ' '
const CTRL = 'control'

// temporary data
let walkDirection = new THREE.Vector3()
let rotateAngle = new THREE.Vector3(0, 1, 0)
let cameraTarget = new THREE.Vector3()

// constants
let maxSpeed = 300
let minSpeed = 50



// CONTROL KEYS
const keysPressed = {  }
document.addEventListener('keydown', (event) => {
    (keysPressed)[event.key.toLowerCase()] = true;
    if(event.key.toLowerCase()==='p')togglePause();
}, false);
document.addEventListener('keyup', (event) => {
    (keysPressed)[event.key.toLowerCase()] = false;
}, false);

// SPACESHIP
// -----------------------------------------
// Load a glTF resource
const loader = new GLTFLoader()
loader.load(
    '../../three.js-master/examples/models/spaceshipV2/scene.gltf',
    function (gltf) {
        gltf.scene.traverse(function (child) {
            if ((child).isMesh) {
                let m = child
                m.receiveShadow = true
                m.castShadow = true
            }
            if ((child).isLight) {
                let l = child
                l.castShadow = true
                l.shadow.bias = -0.003
                l.shadow.mapSize.width = 2048
                l.shadow.mapSize.height = 2048
            }
        })
        spaceship = gltf.scene
        spaceship.position.set(0,0,0)

        loadTextures()
        // spaceship.scale.set(1.2,1.2,1.2)
        // const fbxLoader = new FBXLoader()
        // fbxLoader.load(
        //     '../../three.js-master/examples/models/death-star-star-wars/source/Death Star.FBX',
        //     (object) => {
        //         object.traverse(function (child) {
        //             if ((child).isMesh) {
        //                 // (child as THREE.Mesh).material = material
        //                 if ((child).material) {
        //                     ((child).material).transparent = false
        //                 }
        //             }
        //         })
        //         // object.scale.set(.01, .01, .01)
        //         deathstar = object
        //         loadTextures()
        //     },
        //     (xhr) => {
        //         console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        //     },
        //     (error) => {
        //         console.log(error)
        //     }
        // )
    },
    (xhr) => {
        load += (xhr.loaded / xhr.total) * 50
        bar.style.setProperty('--width', load)
        bar.setAttribute('data-label', load+"%")
        // document.getElementById("loader").innerText = 'Loading Ship' + (xhr.loaded / xhr.total) * 100 + '%'
    },
    (error) => {
        console.log(error)
    }
)


function init(){
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/innerHeight,1,100000);

    scene = new THREE.Scene();

    // const axesHelper = new THREE.AxesHelper( 200 );
    // scene.add( axesHelper );

    // SUN
    // -----------------------------------------

    const sunGeometry = new THREE.SphereGeometry( 1000, 64, 32 );
    const sunMaterial = new THREE.MeshBasicMaterial( { map:sunTexture, side: THREE.DoubleSide} );
    sun = new THREE.Mesh( sunGeometry, sunMaterial );
    scene.add( sun );
    // ------------------------------------------

    // MERCURY
    // -----------------------------------------
    // const mercuryBumpMap = new THREE.TextureLoader().load( "../../three.js-master/examples/textures/mercurybump.jpg" );


    const mercuryGeometry = new THREE.SphereGeometry( 25*0.383, 64, 32 );
    const mercuryMaterial = new THREE.MeshStandardMaterial( { map:mercuryTexture, normalMap: mercuryNormalMap} );
    mercury = new THREE.Mesh( mercuryGeometry, mercuryMaterial );
    mercury.castShadow = true; //default is false
    mercury.receiveShadow = true; //default
    scene.add( mercury );
    // ------------------------------------------

    // MARS
    // -----------------------------------------
    // const marsBumpMap = new THREE.TextureLoader().load( "../../three.js-master/examples/textures/mars_6k_bump.jpg" );

    const marsGeometry = new THREE.SphereGeometry( 25*0.533, 64, 32 );
    const marsMaterial = new THREE.MeshStandardMaterial( { map:marsTexture, normalMap: marsNormalMap} );
    mars = new THREE.Mesh( marsGeometry, marsMaterial );
    mars.castShadow = true; //default is false
    mars.receiveShadow = true; //default
    scene.add( mars );
    // ------------------------------------------

    // EARTH GHOST
    // -----------------------------------------
    // const earthGhostTexture = new THREE.TextureLoader().load( "../../three.js-master/examples/textures/2k_clouds.jpg" );

    const earthGhostGeometry = new THREE.SphereGeometry( 10, 64, 32 );
    const earthGhostMaterial = new THREE.MeshStandardMaterial( { color:0xfff} );
    earthGhost = new THREE.Mesh( earthGhostGeometry, earthGhostMaterial );
    // earthGhost.visible = false
    earthGhost.rotation.z = toRad(23.5)
    scene.add( earthGhost );
    // ------------------------------------------

    // EARTH
    // -----------------------------------------


    const earthGeometry = new THREE.SphereGeometry( 25, 64, 32 );
    const earthMaterial = new THREE.MeshStandardMaterial( { map:earthTexture, normalMap:earthNormalMap, metalnessMap:earthRoughMap, BumpMap: earthBumpMap} );
    earth = new THREE.Mesh( earthGeometry, earthMaterial );
    earth.castShadow = true; //default is false
    earth.receiveShadow = true; //default
    earthGhost.add( earth );
    // ------------------------------------------

    // EARTH CLOUD
    // -----------------------------------------
    // const earthNormalMap = new THREE.TextureLoader().load( "../../three.js-master/examples/textures/earth_normal_map.jpg" );

    const cloudGeometry = new THREE.SphereGeometry( 25.5, 64, 32 );
    const cloudMaterial = new THREE.MeshStandardMaterial( { alphaMap:cloudTexture, transparent: true} );
    clouds = new THREE.Mesh( cloudGeometry, cloudMaterial );
    clouds.castShadow = true; //default is false
    clouds.receiveShadow = true; //default
    earthGhost.add( clouds );
    // ------------------------------------------
    // EARTH NIGHT GHOST
    // -----------------------------------------
    // const earthGhostTexture = new THREE.TextureLoader().load( "../../three.js-master/examples/textures/2k_clouds.jpg" );

    earthNightGhost = new THREE.Mesh( earthGhostGeometry, earthGhostMaterial );
    // earthGhost.visible = false
    earthNightGhost.rotation.z = 0.41
    scene.add( earthNightGhost );
    // ------------------------------------------

    // EARTH NIGHT
    // -----------------------------------------

    const earthNightGeometry = new THREE.SphereGeometry( 25, 64, 32 );
    const earthNightMaterial = new THREE.MeshBasicMaterial( { map:earthNightTexture, normalMap:earthNormalMap} );
    earthNight = new THREE.Mesh( earthNightGeometry, earthNightMaterial );
    earthNight.castShadow = true; //default is false
    earthNight.receiveShadow = true; //default
    earthNightGhost.add( earthNight );
    // ------------------------------------------

    // MOON
    // -----------------------------------------
    // const moonBumpMap = new THREE.TextureLoader().load( "../../three.js-master/examples/textures/moonbump2k.jpg" );
    const moonGeometry = new THREE.SphereGeometry( 25*0.273, 64, 32 );
    const moonMaterial = new THREE.MeshStandardMaterial( { map:moonTexture, normalMap: moonNormalMap} );
    moon = new THREE.Mesh( moonGeometry, moonMaterial );
    moon.castShadow = true; //default is false
    moon.receiveShadow = true; //default
    scene.add( moon );
    // ------------------------------------------

    // VENUS
    // -----------------------------------------
    const venusGeometry = new THREE.SphereGeometry( 25*0.949, 64, 32 );
    const venusMaterial = new THREE.MeshStandardMaterial( { map:venusTexture, bumpMap: venusBumpMap});//normalMap: venusNormalMap} );
    venus = new THREE.Mesh( venusGeometry, venusMaterial );
    venus.castShadow = true; //default is false
    venus.receiveShadow = true; //default
    scene.add( venus );
    // ------------------------------------------

    // VENUS ATMOSPHERE FRONT
    // -----------------------------------------

    const venusAtmosphereGeometry = new THREE.SphereGeometry( 35, 64, 32 );
    const venusAtmosphereMaterialF = new THREE.MeshStandardMaterial( { map:venusAtmosphereTexture, transparent: true, opacity: 0.95});//normalMap: venusNormalMap} );
    venusAtmosphereF = new THREE.Mesh( venusAtmosphereGeometry, venusAtmosphereMaterialF );
    // venusAtmosphereF.castShadow = true; //default is false
    venusAtmosphereF.receiveShadow = true; //default
    venusAtmosphereF.material.side = THREE.FrontSide
    scene.add( venusAtmosphereF );
    // ------------------------------------------

    // VENUS ATMOSPHERE BACK
    // -----------------------------------------
    // const venusAtmosphereTexture = new THREE.TextureLoader().load( "../../three.js-master/examples/textures/4k_venus_atmosphere.jpg" );
    //
    // const venusAtmosphereGeometry = new THREE.SphereGeometry( 35, 64, 32 );
    const venusAtmosphereMaterialB = new THREE.MeshBasicMaterial( { map:venusAtmosphereTexture, transparent: true, opacity: 0.95});//normalMap: venusNormalMap} );
    venusAtmosphereB = new THREE.Mesh( venusAtmosphereGeometry, venusAtmosphereMaterialB );
    // venusAtmosphereB.castShadow = true; //default is false
    venusAtmosphereB.receiveShadow = true; //default
    venusAtmosphereB.material.side = THREE.BackSide
    scene.add( venusAtmosphereB );
    // ------------------------------------------

    // JUPITER
    // -----------------------------------------

    const jupiterGeometry = new THREE.SphereGeometry( 25*11.209, 64, 32 );
    const jupiterMaterial = new THREE.MeshStandardMaterial( { map:jupiterTexture} );
    jupiter = new THREE.Mesh( jupiterGeometry, jupiterMaterial );
    jupiter.castShadow = true; //default is false
    jupiter.receiveShadow = true; //default
    scene.add( jupiter );
    // ------------------------------------------

    // SATURN GHOST
    // -----------------------------------------
    // const earthGhostTexture = new THREE.TextureLoader().load( "../../three.js-master/examples/textures/2k_clouds.jpg" );

    const saturnGhostGeometry = new THREE.SphereGeometry( 10, 64, 32 );
    const saturnGhostMaterial = new THREE.MeshStandardMaterial( { color:0xfff} );
    ghostSaturn = new THREE.Mesh( saturnGhostGeometry, saturnGhostMaterial );
    // earthGhost.visible = false
    ghostSaturn.rotation.x = toRad(23.5)
    scene.add( ghostSaturn );
    // ------------------------------------------

    // SATURN
    // -----------------------------------------

    const saturnGeometry = new THREE.SphereGeometry( 25*9.449, 64, 32 );
    const saturnMaterial = new THREE.MeshStandardMaterial( { map:saturnTexture} );
    saturn = new THREE.Mesh( saturnGeometry, saturnMaterial );
    saturn.castShadow = true; //default is false
    saturn.receiveShadow = true; //default
    ghostSaturn.add( saturn );
    // ------------------------------------------

    // RING
    // ------------------------------------------
    const ringGeometry = new THREE.RingBufferGeometry( 25*9.449+50, 25*9.449+250, 64, 64 );
    const ringMaterial = new THREE.MeshStandardMaterial( { map:ringTexture, side: THREE.DoubleSide } );
    ring = new THREE.Mesh( ringGeometry, ringMaterial );
    // ring.castShadow = true; //default is false
    ring.receiveShadow = true; //default
    ring.rotation.x = - Math.PI/2
    ghostSaturn.add( ring );
    //-------------------------------------------

    // URANUS
    // -----------------------------------------

    const uranusGeometry = new THREE.SphereGeometry( 25*4, 64, 32 );
    const uranusMaterial = new THREE.MeshStandardMaterial( { map:uranusTexture} );
    uranus = new THREE.Mesh( uranusGeometry, uranusMaterial );
    uranus.castShadow = true; //default is false
    uranus.receiveShadow = true; //default
    scene.add( uranus );
    // ------------------------------------------

    // NEPTUNE
    // -----------------------------------------

    const neptuneGeometry = new THREE.SphereGeometry( 25*3.883, 64, 32 );
    const neptuneMaterial = new THREE.MeshStandardMaterial( { map:neptuneTexture} );
    neptune = new THREE.Mesh( neptuneGeometry, neptuneMaterial );
    neptune.castShadow = true; //default is false
    neptune.receiveShadow = true; //default
    scene.add( neptune );
    // ------------------------------------------

    // HELPER
    // -----------------------------------------
    // const earthGhostTexture = new THREE.TextureLoader().load( "../../three.js-master/examples/textures/2k_clouds.jpg" );

    const helpSphereGeometry = new THREE.SphereGeometry( 30, 64, 32 );
    const helpSphereMaterial = new THREE.MeshBasicMaterial( { color:0xfff} );
    helpSphere = new THREE.Mesh( helpSphereGeometry, helpSphereMaterial );
    helpSphere.visible = false
    scene.add( helpSphere );
    // ------------------------------------------

    // SKYBOX
    // ------------------------------------------

    const skyBoxGeometry = new THREE.SphereGeometry( 7000, 64, 32 );
    const skyBoxMaterial = new THREE.MeshBasicMaterial( { map:skyBoxTexture, side: THREE.DoubleSide } );
    const skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    scene.add( skyBox );
    // ------------------------------------------


    // STATS
    // ------------------------------------------
    stats = new Stats();

    // GUI
    // ------------------------------------------
    const gui = new GUI()
    const folder1 = gui.addFolder( 'Général' );
    const folder2 = gui.addFolder( 'Vaisseau' );
    const params = {
        speed:1,
        minSpeed:minSpeed,
        maxSpeed:maxSpeed,
        fps:true,
    }
    folder1.add(params,'speed',-100,100).step(0.1).name('Vitesse').onChange(function (v){
        alpha_speed = v/1000;
        render();
    })
    folder2.add(params,'minSpeed',20,50).step(1).name('Vitesse minimale du vaisseau').onChange(function(v){
        minSpeed = v;
        render();
    })
    folder2.add(params,'maxSpeed',100,500).step(1).name('Vitesse maximale du vaisseau').onChange(function(v){
        maxSpeed = v;
        render();
    })
    folder1.add(params,'fps').name('Statistiques').onChange(function(v){
        divStats = v
        if(divStats) {
            document.body.appendChild(stats.dom);
        }else{
            document.body.removeChild(stats.dom)
        }
        render()
    })
    // ------------------------------------------


    if(divStats) {
        document.body.appendChild(stats.dom);
    }else{
        document.body.removeChild(stats.dom)
    }

    // ------------------------------------------

    // LIGHT & SHADOW
    // ------------------------------------------

    //Create a PointLight and turn on shadows for the light
    const light = new THREE.PointLight( 0xffffff, 1, 0 );
    light.position.set( 0, 0, 10 );
    light.castShadow = true; // default false
    scene.add( light );

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 10000; // default
    // -----------------------------------------





    const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    // scene.add( ambientLight );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    document.body.appendChild( renderer.domElement );
    onWindowResize();
    window.addEventListener( 'resize', onWindowResize );

    // FLY
    // const controls = new FlyControls( camera, renderer.domElement );
    //
    // controls.movementSpeed = 1000;
    // controls.domElement = renderer.domElement;
    // controls.rollSpeed = Math.PI / 24;
    // controls.autoForward = false;
    // controls.dragToLook = false;
    //

    // ORBIT CONTROL
    controls = new OrbitControls( camera, renderer.domElement );
    // controls.enableDamping = true
    // controls.minDistance = 5
    // controls.maxDistance = 15
    // controls.enablePan = false
    // controls.maxPolarAngle = Math.PI / 2 - 0.05
    //controls.update() must be called after any manual changes to the camera's transform

    // SPACESHIP GHOST
    // -----------------------------------------
    const spaceshipGhostGeometry = new THREE.SphereGeometry( 10, 64, 32 );
    const spaceshipGhostMaterial = new THREE.MeshStandardMaterial( { color:0xfff} );
    spaceshipGhost = new THREE.Mesh( spaceshipGhostGeometry, spaceshipGhostMaterial );
    scene.add( spaceshipGhost );
    // ------------------------------------------

    spaceshipGhost.add( spaceship);
    spaceship.scale.set(1.2,1.2,1.2)
    spaceshipGhost.position.x = shipPos.x;
    spaceshipGhost.position.y = shipPos.y;
    spaceshipGhost.position.z = shipPos.z;
    camera.position.x = camPos.x;
    camera.position.y = camPos.y;
    camera.position.z = camPos.z;
    camera.rotation.x = -Math.PI/7
    // update camera target
    cameraTarget.x = spaceshipGhost.position.x
    cameraTarget.y = spaceshipGhost.position.y + 1
    cameraTarget.z = spaceshipGhost.position.z
    controls.target = cameraTarget

    // deathstar.position.set(0,0,0)
    // deathstar.scale.set(0.1,0.1,0.1)
    // scene.add(deathstar)

    // controls.update();
}

function animate() {

    requestAnimationFrame( animate );



    let distToSun = new THREE.Vector3(spaceshipGhost.position.x,
        spaceshipGhost.position.y,
        spaceshipGhost.position.z)
    distToSun = Math.sqrt(Math.pow(distToSun.x,2)+Math.pow(distToSun.y,2)+Math.pow(distToSun.z,2))

    let distToEarth = new THREE.Vector3((spaceshipGhost.position.x - earthGhost.position.x),
        (spaceshipGhost.position.y - earthGhost.position.y),
        (spaceshipGhost.position.z - earthGhost.position.z))
    distToEarth = Math.sqrt(Math.pow(distToEarth.x,2)+Math.pow(distToEarth.y,2)+Math.pow(distToEarth.z,2))

    let distToMercury = new THREE.Vector3((spaceshipGhost.position.x - mercury.position.x),
        (spaceshipGhost.position.y - mercury.position.y),
        (spaceshipGhost.position.z - mercury.position.z))
    distToMercury = Math.sqrt(Math.pow(distToMercury.x,2)+Math.pow(distToMercury.y,2)+Math.pow(distToMercury.z,2))

    let distToVenus = new THREE.Vector3((spaceshipGhost.position.x - venus.position.x),
        (spaceshipGhost.position.y - venus.position.y),
        (spaceshipGhost.position.z - venus.position.z))
    distToVenus = Math.sqrt(Math.pow(distToVenus.x,2)+Math.pow(distToVenus.y,2)+Math.pow(distToVenus.z,2))

    if(distToSun<170||distToEarth < 25 || distToMercury < 20 || distToVenus < 35){
        if(!document.getElementById('divAlert').classList.contains('alert')){
            document.getElementById('divAlert').classList.add('alert')
        }
    }else{
        if(document.getElementById('divAlert').classList.contains('alert')){
            document.getElementById('divAlert').classList.remove('alert')
        }
    }

    // console.log("x:"+spaceship.position.x+"\ny:"+spaceship.position.y+"\nz:"+spaceship.position.z)

    let mixerUpdateDelta = clock.getDelta();

    if(keysPressed[Z]===true || keysPressed[Q]===true || keysPressed[S]===true || keysPressed[D] === true || keysPressed[CTRL] === true || keysPressed[SPACE] === true) {
        // calculate towards camera direction
        var angleYCameraDirection = Math.atan2(
            (camera.position.x - spaceshipGhost.position.x),
            (camera.position.z - spaceshipGhost.position.z))
        // diagonal movement angle offset
        var directionOffset = getDirectionOffset()

        // let rotateAngleX = new THREE.Vector3(1,0,0)

        // let rotateQuaternionX = new THREE.Quaternion()
        // rotateQuaternionX.setFromAxisAngle(rotateAngleX, angleXCameraDirection + keysPressed[SPACE]?Math.PI/4:keysPressed[CTRL]?-Math.PI/4:0)
        let offsetX
        if(keysPressed[SPACE] === true){
            offsetX = Math.PI/4
        }else if(keysPressed[CTRL] === true){
            offsetX = -Math.PI/4
        }else{
            offsetX = 0
        }

        // spaceship.rotation.z = angleZCameraDirection


        // calculate direction
        camera.getWorldDirection(walkDirection)
        walkDirection.y = (keysPressed[SPACE])?10:(keysPressed[CTRL])?-10:0
        walkDirection.normalize()
        walkDirection.applyAxisAngle(rotateAngle, directionOffset)
        // rotate model
        spaceshipGhost.rotation.y = angleYCameraDirection + directionOffset

        spaceship.rotation.x = offsetX

        // run/walk velocity
        const velocity = keysPressed[SHIFT]?maxSpeed:minSpeed

        // move model & camera
        const moveX = walkDirection.x * velocity * mixerUpdateDelta
        const moveZ = walkDirection.z * velocity * mixerUpdateDelta
        const moveY = walkDirection.y * velocity * mixerUpdateDelta
        spaceshipGhost.position.x += moveX
        spaceshipGhost.position.z += moveZ
        spaceshipGhost.position.y += moveY
        shipPos = spaceshipGhost.position
        updateCameraTarget(moveX, moveZ, moveY)
    }

    // sun.rotation.y += pause?0:alpha_speed;
    mercury.rotation.y += pause?0:alpha_speed*1.8;
    mars.rotation.y += pause?0:alpha_speed*3;
    earth.rotation.y += pause?0:alpha_speed*3;
    earthNight.rotation.y += pause?0:alpha_speed*3;
    clouds.rotation.y -= pause?0:alpha_speed;
    // clouds.rotation.z +=pause?0:alpha_speed/2;
    clouds.rotation.x -= pause?0:alpha_speed;
    venus.rotation.y += pause?0:alpha_speed*-0.43;
    jupiter.rotation.y += pause?0:alpha_speed*5;
    saturn.rotation.y += pause?0:alpha_speed*5;
    ring.rotation.z += pause?0:alpha_speed*5;
    uranus.rotation.y -= pause?0:alpha_speed*5;
    moon.rotation.y += pause?0:alpha_speed*0.7;
    neptune.rotation.y += pause?0:alpha_speed*5;

    mercury.position.x = Math.cos(alpha_mercury)*(1500+57);
    mercury.position.z = Math.sin(alpha_mercury)*(1500+57);
    alpha_mercury += pause?0:alpha_speed*1.1;

    venus.position.x = Math.cos(alpha_venus)*(1500+108);
    venus.position.z = Math.sin(alpha_venus)*(1500+108);

    venusAtmosphereF.position.x = Math.cos(alpha_venus)*(1500+108);
    venusAtmosphereF.position.z = Math.sin(alpha_venus)*(1500+108);

    venusAtmosphereB.position.x = Math.cos(alpha_venus)*(1500+108);
    venusAtmosphereB.position.z = Math.sin(alpha_venus)*(1500+108);
    alpha_venus += 0.466*pause?0:alpha_speed;

    earthGhost.position.x = Math.cos(alpha_earth)*(1500+149);
    earthGhost.position.z = Math.sin(alpha_earth)*(1500+149);
    earthNightGhost.position.x = Math.cos(alpha_earth)*(1500+149.07);
    earthNightGhost.position.z = Math.sin(alpha_earth)*(1500+149.07);

    alpha_earth += pause?0:alpha_speed/3.3;

    mars.position.x = Math.cos(alpha_mars)*(1500+227);
    mars.position.z = Math.sin(alpha_mars)*(1500+227);
    alpha_mars += 0.15*pause?0:alpha_speed;

    // let alpha_deathstar = alpha_mars + Math.PI/2
    // deathstar.position.x = Math.cos(alpha_deathstar)*(1500+500);
    // deathstar.position.z = Math.sin(alpha_deathstar)*(1500+500);

    moon.position.x =earthGhost.position.x + (Math.cos(alpha_moon)*(80));
    moon.position.z =earthGhost.position.z + (Math.sin(alpha_moon)*(80));
    alpha_moon += pause?0:alpha_speed*0.7;

    jupiter.position.x =(Math.cos(alpha_jupiter)*(1500+778));
    jupiter.position.z =(Math.sin(alpha_jupiter)*(1500+778));
    alpha_jupiter -= 0.024*pause?0:alpha_speed;

    ghostSaturn.position.x =(Math.cos(alpha_saturn)*(1500+1426));
    ghostSaturn.position.z =(Math.sin(alpha_saturn)*(1500+1426));

    // ring.position.x =(Math.cos(alpha_saturn)*(1500+1426));
    // ring.position.z =(Math.sin(alpha_saturn)*(1500+1426));
    alpha_saturn += 0.01*pause?0:alpha_speed;

    uranus.position.x =(Math.cos(alpha_uranus)*(1500+2870));
    uranus.position.z =(Math.sin(alpha_uranus)*(1500+2870));
    alpha_uranus += 0.003*pause?0:alpha_speed;

    neptune.position.x =(Math.cos(alpha_neptune)*(1500+4500));
    neptune.position.z =(Math.sin(alpha_neptune)*(1500+4500));
    alpha_neptune += 0.002*pause?0:alpha_speed;

    // earth.position.z -= 0.01;
    // earth.position.x = Math.sqrt(Math.pow(210)-Math.pow(earth.position.z));

    //controls.update();
    render()


}

function render() {

    renderer.render( scene, camera );
    stats.update();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}
function updateCameraTarget(moveX, moveZ, moveY) {
    // move camera
    camera.position.x += moveX
    camera.position.z += moveZ
    camera.position.y += moveY

    // update camera target
    cameraTarget.x = spaceshipGhost.position.x
    cameraTarget.y = spaceshipGhost.position.y + 1
    cameraTarget.z = spaceshipGhost.position.z
    controls.target = cameraTarget
}
function getDirectionOffset() {
    var directionOffset = 0 // z

    if (keysPressed[Z]) {
        if (keysPressed[Q]) {
            directionOffset = Math.PI / 4 // z+q
        } else if (keysPressed[D]) {
            directionOffset = - Math.PI / 4 // z+d
        }
    } else if (keysPressed[S]) {
        if (keysPressed[Q]) {
            directionOffset = Math.PI / 4 + Math.PI / 2 // s+q
        } else if (keysPressed[D]) {
            directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
        } else {
            directionOffset = Math.PI // s
        }
    } else if (keysPressed[Q]) {
        directionOffset = Math.PI / 2 // q
    } else if (keysPressed[D]) {
        directionOffset = - Math.PI / 2 // d
    }

    return directionOffset
}

function toRad(deg){
    return (deg * Math.PI)/180
}

function loadTextures(){
    const texture_loader = new THREE.TextureLoader()
    cloudTexture = texture_loader.load( "../../three.js-master/examples/textures/8k_earth_clouds.jpg" , function(){
            loadBar(50/23, 'Texture des nuages')
            earthNightTexture = texture_loader.load( "../../three.js-master/examples/textures/8k_earth_nightmapV2.jpg" , function(){
                loadBar(50/23, 'Texture de la Terre de nuit')
                earthTexture = texture_loader.load( "../../three.js-master/examples/textures/8k_earth_daymap.jpg" , function(){
                    loadBar(50/23, 'Texture de la Terre')
                    earthNormalMap = texture_loader.load( "../../three.js-master/examples/textures/EarthNormal.png" , function(){
                        loadBar(50/23, 'Relief de la Terre')
                        earthRoughMap = texture_loader.load( "../../three.js-master/examples/textures/8k_earth_specular_map.jpg" , function(){
                            loadBar(50/23, 'Texture de rugosité de la Terre')
                            sunTexture = texture_loader.load( "../../three.js-master/examples/textures/8k_sun.jpg" , function(){
                                loadBar(50/23, 'Texture du Soleil')
                                mercuryTexture = texture_loader.load( "../../three.js-master/examples/textures/mercury_texture_map_16k.jpg" , function(){
                                    loadBar(50/23, 'Texture de Mercure')
                                    mercuryNormalMap = texture_loader.load( "../../three.js-master/examples/textures/mercury_normal_map_8k.png" , function(){
                                        loadBar(50/23, 'Relief de Mercure')
                                        marsTexture = texture_loader.load( "../../three.js-master/examples/textures/mars_4k_color.jpg" , function(){
                                            loadBar(50/23, 'Texture de Mars')
                                            marsNormalMap = texture_loader.load( "../../three.js-master/examples/textures/mars_4k_normal.jpg" , function(){
                                                loadBar(50/23, 'Relief de Mars')
                                                earthBumpMap = texture_loader.load( "../../three.js-master/examples/textures/earthbump1k.jpg" , function(){
                                                    loadBar(50/23, 'lumière de la Terre')
                                                    moonTexture = texture_loader.load( "../../three.js-master/examples/textures/moon-4k.png" , function(){
                                                        loadBar(50/23, 'Texture de la Lune')
                                                        moonNormalMap = texture_loader.load( "../../three.js-master/examples/textures/moon_normal.jpg" , function(){
                                                            loadBar(50/23, 'Relief de la Lune')
                                                            venusTexture = texture_loader.load( "../../three.js-master/examples/textures/8k_venus_surface.jpg" , function(){
                                                                loadBar(50/23, 'Texture de Vénus')
                                                                venusBumpMap = texture_loader.load( "../../three.js-master/examples/textures/venus_8k_bump.png" , function(){
                                                                    loadBar(50/23, 'Relief de Vénus')
                                                                    venusAtmosphereTexture = texture_loader.load( "../../three.js-master/examples/textures/4k_venus_atmosphere.jpg" , function(){
                                                                        loadBar(50/23, 'Texture de l\'atmosphère de Vénus')
                                                                        jupiterTexture = texture_loader.load( "../../three.js-master/examples/textures/2k_jupiter.jpg" , function(){
                                                                            loadBar(50/23, 'Texture de Jupiter')
                                                                            saturnTexture = texture_loader.load( "../../three.js-master/examples/textures/2k_saturn.jpg" , function(){
                                                                                loadBar(50/23, 'Texture de Saturne')
                                                                                // ringTexture = texture_loader.load( "../../three.js-master/examples/textures/Ring.png" , function(){
                                                                                ringTexture = texture_loader.load( "../../three.js-master/examples/textures/2k_ring.png" , function(){
                                                                                    loadBar(50/23, 'Texture de l\'anneau de Saturne')
                                                                                    uranusTexture = texture_loader.load( "../../three.js-master/examples/textures/2k_uranus.jpg" , function(){
                                                                                        loadBar(50/23, 'Texture d\'Uranus')
                                                                                        neptuneTexture = texture_loader.load( "../../three.js-master/examples/textures/2k_neptune.jpg" , function(){
                                                                                            loadBar(50/23,'Texture de Neptune')
                                                                                            skyBoxTexture = texture_loader.load( "../../three.js-master/examples/textures/8k_stars_milky_way.jpg" , function(){
                                                                                                loadBar(50/23,'Texture de la Skybox')
                                                                                                init();
                                                                                                loadBar(50/23,'Initialisation')
                                                                                                setTimeout(function(){
                                                                                                    animate();
                                                                                                    document.getElementById('content').style.visibility='hidden'
                                                                                                    document.getElementById('loader').style.visibility='hidden'
                                                                                                },500)
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        },
        (xhr) => {
            document.getElementById("loader").innerText = 'Loading textures' + (xhr.loaded / xhr.total) * 100 + '%'
        });







}
function togglePause(){
    pause = !pause
    console.log(pause)
}

function loadBar(loadValue, text){
    load += loadValue
    // load = load.toFixed(4)
    // load.slice(0,2)
    bar.style.setProperty('--width', load)
    bar.setAttribute('data-label', load.toFixed(2)+"% - "+text)
}
