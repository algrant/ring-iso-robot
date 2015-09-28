// all angular geometry will be in radians

var ringIsolationRobot = function(){
  this.l1;
  this.l2;
  this.l2_5;
  this.l3; 
  this.ring_radius;
  this.geometry_2d;
  this.arm1;
  this.arm2;
  this.arm3;
};

ringIsolationRobot.prototype.init = function(l1, l2, l2_5, ring_radius){
  this.l1 = l1;
  this.l2 = l2;
  this.l2_5 = l2_5;
  this.l3 = l2_5+ring_radius; 
  this.ring_radius = ring_radius;

  this.initGeometry2D();
};


ringIsolationRobot.prototype.initGeometry2D = function(){

  this.geometry_2d = {};
  this.geometry_2d.p0 = undefined;
  this.geometry_2d.p1 = undefined;
  this.geometry_2d.p2 = undefined;
  this.geometry_2d.p3 = undefined;
  this.geometry_2d.theta1 = undefined;
  this.geometry_2d.theta2 = undefined;
  this.geometry_2d.theta3 = undefined;

};

ringIsolationRobot.prototype.inverseKinematics = function(point, theta_input){
  // given a point and an angle, generate theta1, theta2 and theta3;
  // such that the centre of the ring is at point, and the final connection is at angle theta_input

  var q1, q2, B, p0, p1, p2, p3, theta1, theta2, theta3;

  var l1 = this.l1, 
      l2 = this.l2, 
      l3 = this.l3;

  p0 = {x:0, y:0};

  p2 = new simple2d.Point( l3 *Math.cos(theta_input) + point.x, 
                           l3 *Math.sin(theta_input) + point.y );

  B = Math.sqrt(p2.x*p2.x + p2.y*p2.y);
  q1 = Math.atan2(p2.y, p2.x);
  q2 = Math.acos((l1*l1 - l2*l2 + B*B)/(2*l1*B));

  theta1 = q1 + q2;
  p1 = new simple2d.Point( this.l1*Math.cos(theta1), 
                           this.l1*Math.sin(theta1));
  vec_1_2 = p2.sub(p1);

  theta2 = Math.atan2(vec_1_2.y, vec_1_2.x);
  theta3 = theta_input - Math.PI;

  this.updateGeometry(theta1, theta2, theta3);

};

ringIsolationRobot.prototype.updateGeometry = function(theta1, theta2, theta3){

  this.geometry_2d.p0 = new simple2d.Point(0,0);
  this.geometry_2d.p1 = this.geometry_2d.p0.add(new simple2d.Point(this.l1*Math.cos(theta1), this.l1*Math.sin(theta1)));
  this.geometry_2d.p2 = this.geometry_2d.p1.add(new simple2d.Point(this.l2*Math.cos(theta2), this.l2*Math.sin(theta2)));
  this.geometry_2d.p3 = this.geometry_2d.p2.add(new simple2d.Point(this.l3*Math.cos(theta3), this.l3*Math.sin(theta3)));
  this.geometry_2d.theta1 = theta1;
  this.geometry_2d.theta2 = theta2;
  this.geometry_2d.theta3 = theta3;

};

ringIsolationRobot.prototype.createArmMesh = function(settings){
  var armShape = new THREE.Shape();
  var length= settings.length,
      width = settings.width,
      thickness = settings.thickness,
      colour = settings.colour;
  armShape.moveTo( 0, width/2);
  armShape.bezierCurveTo( -width/2, width/2, -width/2, -width/2, 0, -width/2);
  armShape.lineTo(length, -width/2);
  armShape.bezierCurveTo( length + width/2, -width/2, length + width/2, width/2, length, width/2);
  armShape.lineTo(0, width/2);

  var options = {
    amount:thickness,
    bevelEnabled:false
  }

  var armMesh = new THREE.Mesh( new THREE.ExtrudeGeometry(armShape, options), new THREE.MeshPhongMaterial( { color: colour } ) ) ;

  return armMesh
}

ringIsolationRobot.prototype.createRingMesh = function(settings){
  var radius= settings.radius,
      width = settings.width,
      thickness = settings.thickness,
      colour = settings.colour;

  var ringShape = new THREE.Shape();

  
  
  var holePath = new THREE.Path();

  ringShape.moveTo( radius+width/2, 0);
  holePath.moveTo( radius - width/2, 0);

  var segments = 50;
  for(var i = 1; i <= segments; i ++){
    var x_relative = Math.cos(Math.PI*2*i/segments), y_relative = Math.sin(Math.PI*2*i/segments);
    ringShape.lineTo((radius+width/2)*x_relative, (radius+width/2)*y_relative);
    holePath.lineTo((radius-width/2)*x_relative, (radius-width/2)*y_relative);
  }
  ringShape.holes.push(holePath);
  var options = {
    amount:thickness,
    bevelEnabled:false
  }

  var ringMesh = new THREE.Mesh( new THREE.ExtrudeGeometry(ringShape, options), new THREE.MeshPhongMaterial( { color: colour } ) ) ;

  return ringMesh
}

ringIsolationRobot.prototype.createGeometry3D = function(scene){
  var arm1_settings = {length:this.l1, width: 1, thickness: 1, colour: 0x7B898E},
      arm2_settings = {length:this.l2, width: 1, thickness: 1, colour: 0xB2D2C1},
      arm3_settings = { length:this.l2_5, width: 1, thickness: .5, colour: 0x7B898E},
      ring_settings = { radius:this.ring_radius, width:1, thickness:.5, colour:0x8B9EBF };

  this.arm1 = this.createArmMesh(arm1_settings);
  this.arm2 = this.createArmMesh(arm2_settings);
  this.arm3 = this.createArmMesh(arm3_settings);
  this.ring = this.createRingMesh(ring_settings);

  this.arm1.castShadow = true;
  this.arm1.recieveShadow = true;
  this.arm2.castShadow = true;
  this.arm2.recieveShadow = true;
  this.arm3.castShadow = true;
  this.arm3.recieveShadow = true;
  this.ring.castShadow = true;
  this.ring.recieveShadow = true;

  this.arm2.position.x = arm1_settings.length;
  this.arm2.position.z = arm1_settings.thickness;
  this.arm3.position.x = arm1_settings.length + arm2_settings.length;
  this.arm3.position.z = arm1_settings.thickness + arm2_settings.thickness;
  this.ring.position.x = arm1_settings.length + arm2_settings.length; + arm3_settings.length + ring_settings.radius;
  this.ring.position.z = arm1_settings.thickness + arm2_settings.thickness + arm3_settings.thickness;

  console.log(this.ring.position.x);
  scene.add( this.arm1 );
  scene.add( this.arm2 );
  scene.add( this.arm3 );
  scene.add( this.ring );

}

ringIsolationRobot.prototype.updateGeometry3D = function(scene){
  this.arm1.rotation.z = this.geometry_2d.theta1;
  this.arm2.rotation.z = this.geometry_2d.theta2;
  this.arm3.rotation.z = this.geometry_2d.theta3;

  this.arm2.position.x = this.geometry_2d.p1.x;
  this.arm2.position.y = this.geometry_2d.p1.y;
  this.arm3.position.x = this.geometry_2d.p2.x;
  this.arm3.position.y = this.geometry_2d.p2.y;

  this.ring.position.x = this.geometry_2d.p3.x;
  this.ring.position.y = this.geometry_2d.p3.y;
}
