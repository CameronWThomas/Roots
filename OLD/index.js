
const width = 20;
const foregroundColor = '#a17962'
const backgroundColor = '#553725'
const colorOffset = 3;
var canvas;
var ctx;


function init(){
    console.log('init');
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    ctx.lineJoin = 'round';

    /*
    var start = canvas.getContext("2d");
    start.strokeStyle = 'brown';
    start.lineWidth = 20;
    start.beginPath();
    start.moveTo(100, 0);
    //curve at points 20, 100 & 200,100 to point 200,20
    start.bezierCurveTo(100, 0, 100, 100, 100, 100);
    //straight line
    //ctx.bezierCurveTo(20, 20, 200, 20, 200, 20);
    start.stroke();

    //curve
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = 'brown';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    //curve at points 20, 100 & 200,100 to point 200,20
    ctx.bezierCurveTo(100, 180, 300, 180, 300, 100);
    //straight line
    //ctx.bezierCurveTo(20, 20, 200, 20, 200, 20);
    ctx.stroke();
    */

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
        [200,40],
        [200, 90],
        [150, 90],
        [150, 120]
    ]
    
    DrawRoot(rootStruct);

    //DrawOriginStump(0,40, 50, 40);
    
    //DrawBranchSegment(50,40, 200,40);
}

function DrawRoot(necessaryPoints){
    //necessaryPoints expected as follows
    /*
        necessaryPoints = [
            [x, y],
            [x, y],
            [x, y],
            [{...etc}]
        ]
    */


    console.log('necessaryPoints');
    console.log(necessaryPoints);

    ctx.strokeStyle = foregroundColor;
    ctx.lineWidth = width;
    
    ctx.beginPath();
    for(var i = 0; i < necessaryPoints.length; i++){
        //ensure we are not on the final itteration
        if(i < necessaryPoints.length -1){
            var coords = necessaryPoints[i];
            var nextCoords = necessaryPoints[i+1]
            if( i == 0){
                
                DrawOriginStump(coords[0], coords[1], nextCoords[0], nextCoords[1]);

            }else{
                if(i == 1){
                    ctx.moveTo(coords[0], coords[1]);
                    //ctx.lineWidth = width;
                }   

                DrawBranchSegment(coords[0], coords[1], nextCoords[0], nextCoords[1]);
            }
            
        }
    }
    
    ctx.stroke();
}
//gonna start at a side
function DrawOriginStump(startX, startY, endX, endY){

    //should handle corners but not yet
    var startingLoc = null;
    if(startX == 0)
        startingLoc = "left";
    if(startY == 0)
        startingLoc = "top";
    if(startX == canvas.width){
        startingLoc = "right";
    }
    if(startY == canvas.height){
        startingLoc = "bottom";
    }
    

    //only manipulate start variables
    switch (startingLoc) {
        case "left":
            startY = startY - (width / 2);
            endY = endY - (width / 2);
            var topY = startY - endY , bottomY = startY + width + endY;

            var ctx2 = canvas.getContext("2d");
            //draw background
            ctx2.lineWidth = 1
            ctx2.strokeStyle = backgroundColor;
            ctx2.fillStyle = backgroundColor;
            ctx2.beginPath();
            //top of origin
            ctx2.moveTo(startX, topY + colorOffset);
            // end of top origin
            ctx2.quadraticCurveTo(startX, startY +colorOffset, endX, endY + colorOffset);
            //
            ctx2.lineTo(endX, endY + width + colorOffset);
            ctx2.quadraticCurveTo(startX, startY + width + colorOffset, startX, bottomY + colorOffset);
            ctx2.lineTo( startX, topY + colorOffset);
            ctx2.fill();
            ctx2.stroke();

            //draw foreground
            ctx2.lineWidth = 1
            ctx2.strokeStyle = foregroundColor;
            ctx2.fillStyle = foregroundColor;
            ctx2.beginPath();
            ctx2.moveTo(startX, topY);
            ctx2.quadraticCurveTo(startX, startY, endX, endY);
            ctx2.lineTo(endX, endY + width);
            ctx2.quadraticCurveTo(startX, startY + width , startX, bottomY);
            ctx2.lineTo( startX, topY);
            ctx2.fill();
            ctx2.stroke();
            ctx.lineWidth = width;

            break;

    }
}




function DrawBranchSegment(startX, startY, endX, endY){
    /*
    ctx.strokeStyle = backgroundColor;
    ctx.lineWidth = width + colorOffset;
    
    ctx.beginPath();
    DrawBezierCurve(startX, startY + colorOffset, startX, startY + colorOffset, endX, endY + colorOffset, endX, endY + colorOffset);
    ctx.stroke();
    */
    
    //DrawBezierCurve(startX, startY, startX, startY, endX, endY, endX, endY);
    ctx.lineTo(endX, endY);
    
}

function DrawBezierCurve(startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY){
    
    
    if(cp2x == null && cp2y == null){
        ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);

    }else{
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    }

}

init();