const width = 8;
const foregroundColor = '#a17962'
const backgroundColor = '#553725'
const GlobalyOffset = 3;
const GlobalxOffset = 1;
var canvas;
var ctx;

var maxNumOfRoots = 1;
var maxGenerativeBends = 4;
var maxGenerativeRootLength = 200;
var minGenerativeRootLength = 20;

const PPF = 2; //points moved per frame

function init(){
    console.log('init');
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    ctx.lineJoin = 'round';

    
    //no imediate turn out of root
    var rootStruct = [
        [0, 40],
        [50,40],
        [200,40],
        [200, 90],
        [150, 90],
        [150, 120]
    ]

    //immediate turn out of root
    var turnedRoot = [
        [0, 40],
        [50,40],
        [50,70],
        [200,70],
        [200, 90],
        [150, 90],
        [150, 120]
    ]

    var randRooter = getRandomArbitrary(1, maxNumOfRoots);
    for(var i = 0 ; i < randRooter; i++){
        var randRoots = GenerateRootStructure();
        console.log('randRoots');
        console.log(randRoots);
        Rootify(randRoots);

    }
}
//max is len. So max == 1 will always return 0
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function getDirection(lastDirection){
    //0 == u, 1 == d, 2 == l, 3 == r
    var udlr = getRandomInt(4);
    if(lastDirection && udlr == lastDirection){
        return getDirection(lastDirection);
    }else{
        return udlr;
    }
}
function GenerateRootStructure(){
    var xOrY = getRandomInt(2);
    var firstEntry = [0, 0];
    if(xOrY == 0){
        //x is gonna be on a wall
        var options = [0, canvas.width];
        var choice = options[getRandomInt(2)];
        var x = choice;
        var y = getRandomInt(canvas.height);
        firstEntry = [x, y];

    }else{
        //y is gonna be on a wall
        var options = [0, canvas.height];
        var choice = options[getRandomInt(2)];

        var x = getRandomInt(canvas.width);
        var y = choice;
        firstEntry = [x, y];
    }

    var numOfBends = getRandomArbitrary(1, maxGenerativeBends);
    var points = [];
    var lastDirection = null;
    for(var i = 0; i < numOfBends; i++){
        //not going there yet
        /*
        //0 == clockwise, 1 == counterClockwise
        var turnDir = getRandomInt(2);
        */

        //0 == u, 1 == d, 2 == l, 3 == r
        var udlr = getDirection(lastDirection)
        lastDirection= udlr;


        //last used points
        var prevCoords = [0 ,0];
        if(i == 0){
            prevCoords = firstEntry;
        }else{
            prevCoords = points[i-1];
        }
        var nextCoords = [prevCoords[0],prevCoords[1]];
        switch(udlr){
            case 0:
                //u
                nextCoords[1] -= getRandomArbitrary(minGenerativeRootLength, maxGenerativeRootLength);
                if(nextCoords[1] <= 0){
                    nextCoords[1] = 2;
                }

            break;
            case 1:
                //d
                nextCoords[1] += getRandomArbitrary(minGenerativeRootLength, maxGenerativeRootLength);
                if(nextCoords[1] >= canvas.height){
                    nextCoords[1] = canvas.height - 2;
                }

            break;
            case 2:
                //d
                nextCoords[0] -= getRandomArbitrary(minGenerativeRootLength, maxGenerativeRootLength);
                if(nextCoords[0] <= 0){
                    nextCoords[0] = 2;
                }

            break;
            case 3:
                //d
                nextCoords[0] += getRandomArbitrary(minGenerativeRootLength, maxGenerativeRootLength);
                if(nextCoords[0] >= canvas.width){
                    nextCoords[0] = canvas.width - 2;
                }

            break;
            
        }
        points.push(nextCoords);


    }
    
    return points;

}

function Rootify(necessaryPoints){
    //DrawRoot(necessaryPoints, backgroundColor, GlobalxOffset, GlobalyOffset);
    //DrawRoot(necessaryPoints, foregroundColor, 0, 0);
    DrawRootAnim(necessaryPoints, foregroundColor, 0, 0);

}


function DrawRoot(necessaryPoints, color, xOffset, yOffset)
{
    ctx.lineWidth = width
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();

    for(var i = 0; i < necessaryPoints.length; i++){
        var coords = necessaryPoints[i];
        var nextCoords = necessaryPoints[i+1]
        if(i == 0){
            ctx.moveTo(coords[0] + xOffset, coords[1] + yOffset)
        }
        if(i+1 < necessaryPoints.length){
            ctx.lineTo(nextCoords[0] + xOffset, nextCoords[1] + yOffset)

        }
    }

    //cap root
    ctx.stroke();
}


function AnimateRoot(coords, nextCoords, color, xOffset, yOffset, waypoints, t){

    
    ctx.lineWidth = width
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();

    var lastpts = waypoints[t-1];
    var nextpts = waypoints[t];
    ctx.moveTo(lastpts[0]+ xOffset, lastpts[1]+ yOffset);
    ctx.lineTo(nextpts[0] + xOffset, nextpts[1] + yOffset);
    //cap root
    ctx.stroke();
    t++;

    
    console.log('animating along waypoints. t == ' + t);
    console.log(waypoints);
    console.log(t<waypoints.length);
    if(t<waypoints.length){ 
        requestAnimationFrame(() => {this.AnimateRoot(coords, nextCoords, color, xOffset, yOffset, waypoints, t) }); 
    }else{
        return true;
    }
}

function GetPointsBetweenCoords(coords, nextCoords){
    /*
    console.log('');
    console.log('');
    console.log('');
    console.log('____________________________________________');
    console.log('coords & next coords');
    console.log(coords);
    console.log(nextCoords);
    */
    var distanceX = nextCoords[0] - coords[0];
    var distanceY = nextCoords[1] - coords[1];
    var waypoints = [];
    /*
    console.log('distances');
    console.log(distanceX,distanceY);
    */
    //determine how long its gonna take for us to travel a distance
    //moving at x points per frame (PPF)
    var numFramesX = distanceX / PPF;
    var numFramesY = distanceY / PPF;
    var numFrames = 0;
    //get num frames by getting the highest absolute value of the two
    numFrames = Math.max(Math.abs(numFramesX), Math.abs(numFramesY))
    /*
    if(Math.abs(numFramesX) == Math.max(Math.abs(numFramesX), Math.abs(numFramesY)))
        numFrames = numFramesX;
    else
        numFrames = numFramesY;
    */
   /*
    console.log('all num frame info');
    console.log({numFramesX, numFramesY, numFrames});
    */
    for(var i = 0; i < numFrames; i++){
        var x = coords[0] + distanceX * i / numFrames;
        var y = coords[1] + distanceY * i / numFrames;
        waypoints.push([x,y]);
    }
    /*
    console.log('waypoints');
    console.log(waypoints);
    console.log('____________________________________________');
    console.log('');
    console.log('');
    console.log('');
    */

    return waypoints;
}

function DrawRootAnim(necessaryPoints, color, xOffset, yOffset)
{

    for(var i = 0; i < necessaryPoints.length; i++){
        var coords = necessaryPoints[i];
        var nextCoords = necessaryPoints[i+1]

        var waypoints = [];
        if( coords && nextCoords)
            waypoints = GetPointsBetweenCoords(coords, nextCoords);
        var isDone = false;
        if(waypoints.length >= 1){
            isDone = AnimateRoot(coords, nextCoords, color, xOffset, yOffset, waypoints, 1);
        }else{
            isDone = false;
        }
        /*
        if(i == 0){
            ctx.moveTo(coords[0] + xOffset, coords[1] + yOffset)
        }
        if(i+1 < necessaryPoints.length){
            ctx.lineTo(nextCoords[0] + xOffset, nextCoords[1] + yOffset)

        }
        */
    }

}



init();