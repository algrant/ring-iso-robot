var container, stats;
var camera, scene, renderer, gui;
var robot;

init();
animate();

function init() {

  //grab the div called 'container';
  container = document.getElementById( 'container' );

  // set up threejs camera
  camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 100;
  camera.position.y = 50;
  camera.position.x = 0;



  // create a three.js scene
  scene = new THREE.Scene();

  // add lights to the scene
  var light = new THREE.SpotLight( 0xffffff );
  light.position.set( 0, 0, 100 );
  light.castShadow = true;
  // light.shadowCameraVisible = true;
  // light.shadowDarkness = 0.5;
  scene.add( light );

  // light = new THREE.DirectionalLight( 0xffffff );
  // light.position.set( 100, 100, 0 );
  // light.castShadow = true;

  // scene.add( light );

  // light = new THREE.DirectionalLight( 0x888888 );
  // light.position.set( 1, 0, 0 );
  // scene.add( light );

  // light = new THREE.DirectionalLight( 0x888888 );
  // light.position.set( -1, 1, 0 );
  // scene.add( light );


  // create the robot geometry & add it to the scene;
  robot = new ringIsolationRobot();

  robot.init(8, 8, 1, 3);

  robot.inverseKinematics({x:5, y:5}, -Math.PI);

  robot.createGeometry3D(scene);
  robot.updateGeometry3D();


  camera.lookAt( {x:0, y:10, z:0} );


  // create the three js renderer and add it to the container

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xffffff );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  // renderer.shadowMapEnabled = true;
  // renderer.shadowMapType = THREE.PCFSoftShadowMap;
  container.appendChild( renderer.domElement );

}

var theta = 0;
var t = 0;
var offset_x = 0;
var offset_y = 0;

function animate(){
  requestAnimationFrame( animate );
  theta += 0.02;
  t += 0.02;

  robot.inverseKinematics({x:10*Math.cos(t)+4, y:10}, Math.PI*1.5*Math.cos(theta));

  robot.updateGeometry3D();
  //camera.lookAt( robot.ring.position );
  render();
}

function render(){
  renderer.render(scene, camera);
}