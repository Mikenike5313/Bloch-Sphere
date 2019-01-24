Number.prototype.roundTo = function(n) {
  return Math.round(this*Math.pow(10, n))/Math.pow(10, n);
}

//constants
var precision = 4;


//get DOM elements, access their values with ".value"
var aIO = document.getElementById('a'),
    bIO = document.getElementById('b');
var prbIO = document.getElementById('prb');

var thetaIO = document.getElementById('theta'),
    phiIO = document.getElementById('phi');

var xIO = document.getElementById('x'),
    yIO = document.getElementById('y'),
    zIO = document.getElementById('z');


//canvas & drawing
var canvas = document.getElementById('bloch');
    ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
ctx.translate(canvas.width/2, canvas.height/2);

var mouseDown = false;
var preX = null,
    preY = null;

var basis = [
  [0, 0, 1],
  [1, 0, 0],
  [0, 1, 0]
]; // [xyz-xbasis, xyz-ybasis, xyz-zbasis]












//variables
/*
a = √P(0)
b = √P(1)

theta = angle with z-axis
phi = angle with x-axis on x-y plane

x-axis = in/out
y-axis = left/right, imaginary
z-axis = up/down
*/




//backbone functions


function getSuperposition(theta, phi) {
  //a = cos(θ/2)
  var ar = Math.cos(theta/2);
  //format
  var a = ar.roundTo(precision) === 0 ? '0' : ar.roundTo(precision);

  //b = sin(θ/2)eⁱᵠ = sin(θ/2)(cos(φ) + 𝑖sin(φ))
  var br = Math.sin(theta/2)*Math.cos(phi),
      bi = Math.sin(theta/2)*Math.sin(phi);

  //format
  var b = '';
  b += br.roundTo(precision) === 0 ? '' : br.roundTo(precision);
  b += br.roundTo(precision) !== 0 && bi.roundTo(precision) !== 0 ? ' + ' : '';
  b += bi.roundTo(precision) === 0 ? '' : bi.roundTo(precision) + '𝑖';

  var prb = (ar*ar*100).roundTo(precision) + '% |0>\n' + ((br*br+bi*bi)*100).roundTo(precision) + '% |1>';


  aIO.value = a;
  bIO.value = b;

  prbIO.innerText = prb;
}

function getVector(theta, phi) {
  //x = cos(φ)*sin(θ)
  //y = sin(φ)*sin(θ)
  //z = cos(θ)
  var x = Math.cos(phi)*Math.sin(theta),
      y = Math.sin(phi)*Math.sin(theta),
      z = Math.cos(theta);


  xIO.value = x.roundTo(precision);
  yIO.value = y.roundTo(precision);
  zIO.value = z.roundTo(precision);
}


function fromSuperposition() {
  var a = aIO.value.replace(/\s/g, '').match(/(-?[\d.]+(?:𝑖|i)?)/);
  var ar = 0;
  //var ai = 0;
  for(var i = 1; i < a.length; i++) { //start at i = 1 b/c first match is the entire thing
    if(a[i].indexOf('i') + a[i].indexOf('𝑖') > -2) {
      //ai += parseFloat(a[i]);
      console.log('Imaginary component not conventionally used in coefficient for |0>, it was excuded.');
      continue;
    }
    ar += parseFloat(a[i]);
  }

  var b = bIO.value.replace(/\s/g, '').match(/(-?[\d.]+(?:𝑖|i)?)(\+?-?[\d.]+(?:𝑖|i)?)?/); //remove whitespace, then match
  var br = 0,
      bi = 0;
  for(var i = 1; i < b.length; i++) { //start at i = 1 b/c first match is the entire thing
    if(b[i].indexOf('i') + b[i].indexOf('𝑖') > -2) {
      bi += parseFloat(b[i]);
      continue;
    }
    br += parseFloat(b[i]);
  }

  var prb = (ar*ar*100).roundTo(precision) + '% |0>\n' + ((br*br+bi*bi)*100).roundTo(precision) + '% |1>';

  prbIO.innerText = prb;


  //a = cos(θ/2)
  var theta = 2*Math.acos(ar);
  //b = sin(θ/2)eⁱᵠ = sin(θ/2)(cos(φ) + 𝑖sin(φ))
  var phi = Math.acos(br/Math.sin(theta/2)) || Math.asin(bi/Math.sin(theta/2));

  thetaIO.value = (theta/Math.PI).roundTo(precision);
  phiIO.value = (phi/Math.PI).roundTo(precision);


  getVector(theta, phi);
}

function fromPolar() {
  var theta = thetaIO.value ? thetaIO.value*Math.PI : 0,
      phi = phiIO.value ? phiIO.value*Math.PI : 0;


  getVector(theta, phi);


  getSuperposition(theta, phi);
}

function fromVector() {
  var x = xIO.value ? xIO.value : 0,
      y = yIO.value ? yIO.value : 0,
      z = zIO.value ? zIO.value : 0;


  //find angles
  var theta = Math.acos(z),
      phi = Math.acos(x) || Math.asin(y);

  thetaIO.value = (theta/Math.PI).roundTo(precision);
  phiIO.value = (phi/Math.PI).roundTo(precision);


  getSuperposition(theta, phi);
}




















//display functions

function transpose(m) {
  if(m.length <= 0 || m[0].length <= 0) {
    console.log('Input Error: Cannot transpose matrix:\n' + m);
  }
  var mT = [];
  for(var i = 0; i < m[0].length; i++) {
    mT.push([]);
    for(var j = 0; j < m.length; j++) {
      mT[i][j] = m[j][i];
    }
  }
  return mT;
}

function linearTransform(x, t) { //t is a matrix, x is a vector
  if(!t || !x || t[0].length !== x.length) {
    console.log('InputError: Could not perform linear transformation:\n' + t + '\non:\n' + x);
    return;
  }

  var b = [];

  for(var i = 0; i < t.length; i++) {
    b[i] = 0;
    for(var j = 0; j < x.length; j++) {
      b[i] += t[i][j] * x[j];
    }
  }

  return b;
}

function scaleVector(l, v) {
  var u = [];
  for(var i = 0; i < v.length; i++) {
    u[i] = l*v[i];
  }
  return u;
}

function project(r3) {
  var r2 = [r3[0], r3[1]];
  return r2;
}

function rotate3D(v, ax, rad) { //v is the r3 vector, ax is the unit r3 vector of the axis, rad is radians rotated
  // http://ksuweb.kennesaw.edu/~plaval/math4490/rotgen.pdf
  //put into  ^ their ^  terminology
  var ux = ax[0],
      uy = ax[1],
      uz = ax[2];
  var c = Math.cos(rad),
      s = Math.sin(rad);
  var t = 1 - c;

  var rotationMatrix = [
    [t*ux*ux + c, t*ux*uy - s*uz, t*ux*uz + s*uy],
    [t*ux*uy + s*uz, t*uy*uy + c, t*uy*uz - s*ux],
    [t*ux*uz - s*uy, t*uy*uz + s*ux, t*uz*uz + c]
  ];

  return linearTransform(v, rotationMatrix);
}

function displayVector(r2, color) {
  //line
  ctx.strokeStyle = color || 'white';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(r2[0], -r2[1]);
  ctx.stroke();

  //tip
  ctx.fillStyle = color || 'white';
  ctx.fillRect(r2[0]-2, -r2[1]-2, 4, 4);
}

function displayAxes() {
  displayVector(project(scaleVector(Math.min(canvas.width, canvas.height)/2 - 5, basis[0])), 'rgba(255, 0, 0, 1)'); //+x-axis
  displayVector(project(scaleVector(Math.min(canvas.width, canvas.height)/2 - 5, basis[1])), 'rgba(0, 255, 0, 1)'); //+y-axis
  displayVector(project(scaleVector(Math.min(canvas.width, canvas.height)/2 - 5, basis[2])), 'rgba(0, 0, 255, 1)'); //+z-axis
  displayVector(project(scaleVector(Math.min(canvas.width, canvas.height)/2 - 5, scaleVector(-1, basis[0]))), 'rgba(255, 0, 0, 0.4)'); //-x-axis
  displayVector(project(scaleVector(Math.min(canvas.width, canvas.height)/2 - 5, scaleVector(-1, basis[1]))), 'rgba(0, 255, 0, 0.4)'); //-y-axis
  displayVector(project(scaleVector(Math.min(canvas.width, canvas.height)/2 - 5, scaleVector(-1, basis[2]))), 'rgba(0, 0, 255, 0.4)'); //-z-axis
}

function displaySphere() {
  //TODO: show sphere
}

function display() {
  ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);

  var x = xIO.value ? xIO.value : 0,
      y = yIO.value ? yIO.value : 0,
      z = zIO.value ? zIO.value : 0;

  u = [x, y, z]; //r3 vector when basis is the identity

  var v = scaleVector(9*Math.min(canvas.width, canvas.height)/20, linearTransform(u, transpose(basis))); //modified for display

  displayAxes();
  displayVector(project(v)); //project & display
  displaySphere();
}

canvas.addEventListener('mousedown', function(event) {
  mouseDown = true;
  preX = event.clientX-canvas.offsetLeft-canvas.width/2;
  preY = -(event.clientY-canvas.offsetTop-canvas.height/2);
});
canvas.addEventListener('mousemove', function(event) {
  if(mouseDown) {

    //r needs to enclose points on canvas, or cosAng will be > 1 => BAD
    //ERROR: for some reason when cosAng = 1, the system breaks

    var curX = event.clientX-canvas.offsetLeft-canvas.width/2,
        curY = -(event.clientY-canvas.offsetTop-canvas.height/2);

    var r = (canvas.width/2)*(canvas.width/2) + (canvas.height/2)*(canvas.height/2) + 1; //ensure no point on canvas is outside of radius
    //get previous rotation start '3d' coordinates
    var px = preX,
        py = preY;
    var pz = Math.sqrt(r - px*px - py*py); //calc z

    //get current '3d' coordinates
    var cx = curX,
        cy = curY;
    var cz = Math.sqrt(r - cx*cx - cy*cy); //calc z

    //make sure to update
    preX = curX;
    preY = curY;


    var cosAng = (px*cx + py*cy + pz*cz)/r;

    console.log(cosAng);

    var rotAng = Math.acos(cosAng);
    var axis = scaleVector(1/(r*Math.sin(rotAng)), [py*cz - pz*cy, pz*cx - px*cz, px*cy - py*cx]);


    //make sure cosAng is within range, if not, don't rotate
    if(cosAng >= 1 || cosAng <= -1) {
      return;
    }

    //rotate
    basis[0] = rotate3D(basis[0], axis, rotAng);
    basis[1] = rotate3D(basis[1], axis, rotAng);
    basis[2] = rotate3D(basis[2], axis, rotAng);

    display();


  }
});
canvas.addEventListener('mouseup', function() {
  mouseDown = false;
  preX = null;
  preY = null;
})
