const width = 8;
const foregroundColor = '#a17962'
const backgroundColor = '#553725'
const GlobalyOffset = 3;
const GlobalxOffset = 1;
var canvas;
var ctx;

var maxNumOfRoots = 10;
var maxGenerativeBends = 20;
var maxGenerativeRootLength = 200;
var minGenerativeRootLength = 20;


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

    var randRooter = getRandomInt(maxNumOfRoots);
    for(var i = 0 ; i < randRooter; i++){
        var randRoots = GenerateRootStructure();
        
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

    var numOfBends = getRandomInt(maxGenerativeBends);
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
    DrawRoot(necessaryPoints, backgroundColor, GlobalxOffset, GlobalyOffset);
    DrawRoot(necessaryPoints, foregroundColor, 0, 0);

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


init();