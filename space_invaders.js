var canvas;
var gl;

var vertexCount = 0;
var vertices;
var frameCount = 0;
var gameEnded = false;

var alienAlreadySpliced = false;
var red = vec3(1.0, 0.0, 0.0);
var green = vec3(0.0, 1.0, 0.0);

// Positions are wrt top left corner of alien
var alienYPos = 0.975;
var alienRowYDist = 0.25;
var alienXPos = [-0.8, -0.3, 0.2, 0.7, -0.8, -0.3, 0.2, 0.7];
var alienPosLeftBounds = [-1, -0.5, 0, 0.5, -1, -0.5, 0, 0.5];
var alienPosRightBounds = [-0.6, -0.1, 0.4, 0.9, -0.6, -0.1, 0.4, 0.9];

// 1 means right
var alienDirs = [1, 1, 1, 1, -1, -1, -1, -1];

// 0 means top row
var alienRow = [0, 0, 0, 0, 1, 1, 1, 1];

var alienBulletVertices = [];
var cannonBulletVertices = [];

// Tuning Parameters
var alienDirChangeProb = 0.01;
var alienYSpeed = 0.0005;
var alienXSpeed = 0.0005;
var expAlienXSpeedIncrease = 1.5;
var cannonXPos = -0.05;
var cannonSpeed = 0.01;
var bulletSpeed = 0.01;
var alienBulletsInterval = 1.5; // in seconds

window.addEventListener("keydown", getKey, false);
window.addEventListener("keyup", getKey1, false);
window.addEventListener("click", getClick, false);

var leftPressed = 0;
var rightPressed = 0;
var leftMousePressed = 0;

function getKey(key) {
    if (key.key == "ArrowLeft")
        leftPressed = 1;
    if (key.key == "ArrowRight")
        rightPressed = 1;
    if (key.key == "r")
        location.reload()
    if (key.key == "q")
        gameEnded = true;
}

function getKey1(key) {
    if (key.key == "ArrowLeft")
        leftPressed = 0;
    if (key.key == "ArrowRight")
        rightPressed = 0;
    if (key.key == "Mouse0")
        leftMousePressed = 0;
}

function getClick(key) {
    leftMousePressed = 1;
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
    
    // Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    // Binding the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    // Binding the color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // Associate out shader variables with our data buffer
    var color = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(color);

    render();
}

function aliensShoot() {
    if (alienRow.includes(1)) {

        for (var i = 0; i < alienXPos.length; i++) {
            if (alienRow[i] == 1) {
                alienBulletVertices.push(vec2(alienXPos[i] + 0.04, alienYPos - alienRowYDist - 0.2));
                alienBulletVertices.push(vec2(alienXPos[i] + 0.06, alienYPos - alienRowYDist - 0.2));
                alienBulletVertices.push(vec2(alienXPos[i] + 0.05, alienYPos - alienRowYDist - 0.25));
            }
        }
    } else {
        for (var i = 0; i < alienXPos.length; i++) {
            alienBulletVertices.push(vec2(alienXPos[i] + 0.04, alienYPos - 0.2));
            alienBulletVertices.push(vec2(alienXPos[i] + 0.06, alienYPos - 0.2));
            alienBulletVertices.push(vec2(alienXPos[i] + 0.05, alienYPos - 0.25));
        }
    }
}

function cannonShoot() {
    cannonBulletVertices.push(vec2(cannonXPos + 0.04, -0.8));
    cannonBulletVertices.push(vec2(cannonXPos + 0.06, -0.8));
    cannonBulletVertices.push(vec2(cannonXPos + 0.05, -0.75));
}

function render() {
    if (alienXPos.length == 0) {
        console.log("YOU WON!!!!");
        window.open("win.html","blank","height=50,width=500");
        gameEnded = true;
    }

    frameCount += 1;
    vertexCount = 0;
    vertices = [];

    // Alien vertices
    for (var i = 0; i < alienXPos.length; i++) {
        if (alienRow[i] == 0) {
            vertices.push(
                vec2( alienXPos[i], alienYPos),
                vec2( alienXPos[i] + 0.1, alienYPos),
                vec2( alienXPos[i] + 0.1, alienYPos - 0.2 ),
                vec2( alienXPos[i], alienYPos),
                vec2( alienXPos[i] + 0.1, alienYPos - 0.2 ),
                vec2( alienXPos[i], alienYPos - 0.2 ) )
         } else {
            vertices.push(
                vec2( alienXPos[i], alienYPos - alienRowYDist),
                vec2( alienXPos[i] + 0.1, alienYPos - alienRowYDist),
                vec2( alienXPos[i] + 0.1, alienYPos - alienRowYDist - 0.2 ),
                vec2( alienXPos[i], alienYPos - alienRowYDist),
                vec2( alienXPos[i] + 0.1, alienYPos - alienRowYDist - 0.2 ),
                vec2( alienXPos[i], alienYPos - alienRowYDist - 0.2 ) )   
        }
    }

    // Cannon vertices
    vertices.push(
        vec2 (cannonXPos, -0.8),
        vec2 (cannonXPos + 0.1, -0.8),
        vec2 (cannonXPos + 0.1, -1),
        vec2 (cannonXPos, -0.8),
        vec2 (cannonXPos + 0.1, -1),
        vec2 (cannonXPos, -1)
    )

    var colors = [];

    for (var i = 0; i < alienXPos.length*6; i++) {
        colors.push(red);
    }
    for (var i = 0; i < 6; i++) {
        colors.push(green);
    }

    // +6 for cannon
    vertexCount += alienXPos.length*6 + 6;

    ////////////////////////////////// Aliens movement //////////////////////////////////
    for (var i = 0; i < alienXPos.length; i++) {
        // Check for bounds and change direction with probability
        if (alienXPos[i] <= alienPosLeftBounds[i])
            alienDirs[i] = 1;
        else if (alienXPos[i] >= alienPosRightBounds[i])
            alienDirs[i] = -1;
        else if (Math.random() < alienDirChangeProb)
                alienDirs[i] = -alienDirs[i];

        alienXPos[i] += alienDirs[i]*alienXSpeed*Math.pow(2 - alienYPos, expAlienXSpeedIncrease);
    }

    // Changing the height value for moving the aliens
    if ((alienRow.includes(1) && alienYPos > -0.8 + alienRowYDist) || (!alienRow.includes(1) && alienYPos > -0.8))
        alienYPos -= alienYSpeed;
    else {
        console.log("The aliens have reached the base!");
        console.log("You lose");
        window.open("lose.html","blank","height=50,width=300");
        gameEnded = true;
    }

    /////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////// Cannon movement //////////////////////////////////
    if (leftPressed && cannonXPos >= -1) cannonXPos -= cannonSpeed;
    if (rightPressed && cannonXPos <= 0.9) cannonXPos += cannonSpeed;

    /////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////// Alien bullets ///////////////////////////////////
    if (frameCount % (alienBulletsInterval*60) == 0) {
        aliensShoot();
    }

    var posToSplice = []
    for (var i = 0; i < alienBulletVertices.length; i++) {
        alienBulletVertices[i][1] -= bulletSpeed;
    }

    
    for (var i = 0; i < alienBulletVertices.length; i++) {
        colors.push(red);
    }
    vertices = vertices.concat(alienBulletVertices);
    vertexCount += alienBulletVertices.length;
    
    /////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////// Cannon bullets //////////////////////////////////
    if (leftMousePressed == 1) {
        console.log("Fire!");
        cannonShoot();
    }

    for (var i = 0; i < cannonBulletVertices.length; i++) {
        cannonBulletVertices[i][1] += bulletSpeed;
    }

    vertices = vertices.concat(cannonBulletVertices);
    vertexCount += cannonBulletVertices.length;

    for (var i = 0; i < cannonBulletVertices.length; i++) {
        colors.push(green);
    }

    leftMousePressed = 0;
    
    /////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////// Bullet collisions /////////////////////////////////

    // Alien bullet collision with cannon
    for (var i = 0; i < alienBulletVertices.length; i++) {
        if (alienBulletVertices[i][0] >= cannonXPos && alienBulletVertices[i][0] <= cannonXPos + 0.1 &&
            alienBulletVertices[i][1] <= -0.8 && alienBulletVertices[i][1] >= -1) {
                console.log("Player hit!");
                console.log("You lose");
                vertices.splice(alienXPos.length*6,6);
                colors.splice(alienXPos.length*6,6);
                vertexCount -= 6;
                gameEnded = true;        
                window.open("lose.html","blank","height=50,width=300")
        }
    }

    // Cannon bullet collision with alien
    var alienNumHit = -1;
    for (var i = 0; i < cannonBulletVertices.length; i++) {
        for (var j = 0; j < alienXPos.length; j++) {
            if (alienRow[j] == 0) {
                if (cannonBulletVertices[i][0] >= alienXPos[j] && cannonBulletVertices[i][0] <= alienXPos[j] + 0.1 &&
                    cannonBulletVertices[i][1] <= alienYPos && cannonBulletVertices[i][1] >= alienYPos - 0.2) {
                        console.log("Back alien hit!");
                        alienNumHit = j;
                        vertices.splice(j*6, 6);
                        colors.splice(j*6, 6);
                        vertexCount -= 6;
                }
            } else {
                if (cannonBulletVertices[i][0] >= alienXPos[j] && cannonBulletVertices[i][0] <= alienXPos[j] + 0.1 &&
                    cannonBulletVertices[i][1] <= alienYPos - alienRowYDist && cannonBulletVertices[i][1] >= alienYPos - alienRowYDist - 0.2) {
                        console.log("Front alien hit!");
                        alienNumHit = j;
                        vertices.splice(j*6, 6);
                        colors.splice(j*6, 6);
                        vertexCount -= 6;
                }
            }
        }
    }

    if (alienNumHit != -1 && alienAlreadySpliced == false) {
        alienXPos.splice(alienNumHit, 1);
        alienRow.splice(alienNumHit, 1);
        alienPosLeftBounds.splice(alienNumHit, 1);
        alienPosRightBounds.splice(alienNumHit, 1);
        alienAlreadySpliced = true;
    } else if (alienNumHit == -1) {
        alienAlreadySpliced = false;
    }

    /////////////////////////////////////////////////////////////////////////////////////

    // Binding the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Binding the color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    // Clearing the buffer and drawing
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, vertexCount );
    if (!gameEnded) {
        window.requestAnimFrame(render);
    }
}
