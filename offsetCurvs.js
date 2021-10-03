
//shamelessly stolen from
//https://codepen.io/brunoimbrizi/pen/VYEWgY

var canvas, ctx;
var drags;
var thickness = 30;
var drawControlPoints = true;
var useSplitCurve = true;

function init() {
	canvas = document.createElement('canvas');
	ctx = canvas.getContext('2d');
	document.body.appendChild(canvas);
  
	drags = [];
	
	window.addEventListener('resize', resize );
	window.addEventListener('mousedown', mousedown );
	window.addEventListener('mouseup', mouseup );
	window.addEventListener('mousemove', mousemove );

	document.getElementById('btnControl').addEventListener('click', function(e) { drawControlPoints = !drawControlPoints} );
	document.getElementById('btnSplit').addEventListener('click', function(e) { useSplitCurve = !useSplitCurve} );
	
	resize();
	draw();
  
  var positions = [ {x:canvas.width * 0.3, y:canvas.height * 0.4}, {x:canvas.width * 0.35, y:canvas.height * 0.85}, {x:canvas.width * 0.7, y:canvas.height * 0.25} ];
	for (var i = 0; i < positions.length; i++) {
		drags.push(new Drag(ctx, new Vec2D(positions[i].x, positions[i].y)));
	}
}

function draw() {
	requestAnimationFrame(draw);
	
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = 1;

	for (var i = 0; i < drags.length; i++) {
		d = drags[i];
		d.draw();
	}
  
	for (var i = 1; i < drags.length - 1; i++) {
		/*
		var d1 = (i == 0) ? drags[i].pos : drags[i - 1].pos;
		var d2 = drags[i].pos;
		var d3 = (i == drags.length - 1) ? drags[drags.length - 1].pos : drags[i + 1].pos;

		var v1 = d2.sub(d1);
		var v2 = d3.sub(d2);
		var p1 = d2.sub(v1.scale(0.5));
		var p2 = d3.sub(v2.scale(0.5));
		var c = d2;
		*/
		var p1 = drags[i - 1].pos;
		var p2 = drags[i + 1].pos;
		var c = drags[i].pos;

		var v1 = c.sub(p1);
		var v2 = p2.sub(c);

		var n1 = v1.normalizeTo(thickness).getPerpendicular();
		var n2 = v2.normalizeTo(thickness).getPerpendicular();

		var p1a = p1.add(n1);
		var p1b = p1.sub(n1);
		var p2a = p2.add(n2);
		var p2b = p2.sub(n2);

		var c1a = c.add(n1);
		var c1b = c.sub(n1);
		var c2a = c.add(n2);
		var c2b = c.sub(n2);

		var line1a = new Line2D(p1a, c1a);
		var line1b = new Line2D(p1b, c1b);
		var line2a = new Line2D(p2a, c2a);
		var line2b = new Line2D(p2b, c2b);

		var split = (useSplitCurve && v1.angleBetween(v2, true) > Math.PI / 2);

		if (!split) {
			var ca = line1a.intersectLine(line2a).pos;
			var cb = line1b.intersectLine(line2b).pos;
		}
		else {
			var t = MathUtils.getNearestPoint(p1, c, p2);
			var pt = MathUtils.getPointInQuadraticCurve(t, p1, c, p2);

			var t1 = p1.scale(1 - t).add(c.scale(t));
			var t2 = c.scale(1 - t).add(p2.scale(t));

			var vt = t2.sub(t1).normalizeTo(thickness).getPerpendicular();
			var qa = pt.add(vt);
			var qb = pt.sub(vt);

			var lineqa = new Line2D(qa, qa.add(vt.getPerpendicular()));
			var lineqb = new Line2D(qb, qb.add(vt.getPerpendicular()));

			var q1a = line1a.intersectLine(lineqa).pos;
			var q2a = line2a.intersectLine(lineqa).pos;
			var q1b = line1b.intersectLine(lineqb).pos;
			var q2b = line2b.intersectLine(lineqb).pos;
		}

		if (drawControlPoints) {
			// draw control points
			var r = 2;
			ctx.beginPath();
			if (!split) {
				ctx.rect(ca.x - r, ca.y - r, r * 2, r * 2);
				ctx.rect(cb.x - r, cb.y - r, r * 2, r * 2);
			}
			else {
				// ctx.rect(pt.x - r, pt.y - r, r * 2, r * 2);
				ctx.rect(p1a.x - r, p1a.y - r, r * 2, r * 2);
				ctx.rect(q1a.x - r, q1a.y - r, r * 2, r * 2);
				ctx.rect(p2a.x - r, p2a.y - r, r * 2, r * 2);
				ctx.rect(q2a.x - r, q2a.y - r, r * 2, r * 2);
				ctx.rect(qa.x - r, qa.y - r, r * 2, r * 2);

				ctx.rect(p1b.x - r, p1b.y - r, r * 2, r * 2);
				ctx.rect(q1b.x - r, q1b.y - r, r * 2, r * 2);
				ctx.rect(p2b.x - r, p2b.y - r, r * 2, r * 2);
				ctx.rect(q2b.x - r, q2b.y - r, r * 2, r * 2);
				ctx.rect(qb.x - r, qb.y - r, r * 2, r * 2);

				ctx.moveTo(qa.x, qa.y);
				ctx.lineTo(qb.x, qb.y);
			}
			ctx.closePath();
			ctx.strokeStyle = '#0072bc';
			ctx.stroke();
			ctx.fillStyle = '#0072bc';
			ctx.fill();

			// draw dashed lines
			ctx.beginPath();
			if (!split) {
				ctx.moveTo(p1a.x, p1a.y);
				ctx.lineTo(ca.x, ca.y);
				ctx.lineTo(p2a.x, p2a.y);

				ctx.moveTo(p1b.x, p1b.y);
				ctx.lineTo(cb.x, cb.y);
				ctx.lineTo(p2b.x, p2b.y);
			}
			else {
				ctx.moveTo(p1a.x, p1a.y);
				ctx.lineTo(q1a.x, q1a.y);
				ctx.lineTo(qa.x, qa.y);
				ctx.lineTo(q2a.x, q2a.y);
				ctx.lineTo(p2a.x, p2a.y);

				ctx.moveTo(p1b.x, p1b.y);
				ctx.lineTo(q1b.x, q1b.y);
				ctx.lineTo(qb.x, qb.y);
				ctx.lineTo(q2b.x, q2b.y);
				ctx.lineTo(p2b.x, p2b.y);
			}
			ctx.setLineDash([2,4]);
			ctx.stroke();
			ctx.closePath();
			ctx.setLineDash([]);
		}

		// central line
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.quadraticCurveTo(c.x, c.y, p2.x, p2.y);
		ctx.strokeStyle = '#959595';
		ctx.stroke();

		// offset curve a
		ctx.beginPath();
		ctx.moveTo(p1a.x, p1a.y);
		if (!split) {
			ctx.quadraticCurveTo(ca.x, ca.y, p2a.x, p2a.y);
		}
		else {
			ctx.quadraticCurveTo(q1a.x, q1a.y, qa.x, qa.y);
			ctx.quadraticCurveTo(q2a.x, q2a.y, p2a.x, p2a.y);
		}
		ctx.strokeStyle = '#0072bc';
		ctx.lineWidth = 2;
		ctx.stroke();

		// offset curve b
		ctx.beginPath();
		ctx.moveTo(p1b.x, p1b.y);
		if (!split) {
			ctx.quadraticCurveTo(cb.x, cb.y, p2b.x, p2b.y);
		}
		else {
			ctx.quadraticCurveTo(q1b.x, q1b.y, qb.x, qb.y);
			ctx.quadraticCurveTo(q2b.x, q2b.y, p2b.x, p2b.y);
		}
		ctx.strokeStyle = '#0072bc';
		ctx.stroke();
	}
}

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function mousedown(e) {
	e.preventDefault();
	
	var m = new Vec2D(e.clientX, e.clientY);

 	for (var i = 0; i < drags.length; i++) {
 		var d = drags[i];
 		var dist = d.pos.distanceToSquared(m);
 		if (dist < d.hitRadiusSq) {
 			d.down = true;
 			break;
 		}
 	}
}

function mouseup() {
  	for (var i = 0; i < drags.length; i++) {
 		var d = drags[i];
 		d.down = false;
 	}
}

function mousemove(e) {
	var m = new Vec2D(e.clientX, e.clientY);

  	for (var i = 0; i < drags.length; i++) {
 		var d = drags[i];
 		if (d.down) {
 			d.pos.x = m.x;
 			d.pos.y = m.y;
 			break;
 		}
 	}
}

function Drag(ctx, pos) {
	this.ctx = ctx;
	this.pos = pos;
	this.radius = 6;
	this.hitRadiusSq = 900;
	this.down = false;
}

Drag.prototype = {
	draw: function() {
		this.ctx.beginPath();
		this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
		this.ctx.closePath();
		this.ctx.strokeStyle = '#959595'
		this.ctx.stroke();
	}
}

// http://toxiclibs.org/docs/core/toxi/geom/Vec2D.html
function Vec2D(a,b) {
	this.x = a;
	this.y = b;
}

Vec2D.prototype = {
	add: function(a) {
	  return new Vec2D(this.x + a.x, this.y + a.y);
	},
	angleBetween: function(v, faceNormalize) {
	  if(faceNormalize === undefined){
		var dot = this.dot(v);
		return Math.acos(this.dot(v));
	  }
	  var theta = (faceNormalize) ? this.getNormalized().dot(v.getNormalized()) : this.dot(v);
	  return Math.acos(theta);
	},
	distanceToSquared: function(v) {
        if (v !== undefined) {
            var dx = this.x - v.x;
            var dy = this.y - v.y;
            return dx * dx + dy * dy;
        } else {
            return NaN;
        }
    },
	dot: function(v) {
	  return this.x * v.x + this.y * v.y;
	},
	getNormalized: function() {
	   return new Vec2D(this.x, this.y).normalize();
	},
	getPerpendicular: function() {
	  return new Vec2D(this.x, this.y).perpendicular();
	},
	interpolateTo: function(v, f) {
	   return new Vec2D(this.x + (v.x -this.x) * f, this.y + (v.y - this.y) * f);
	},
	normalize: function() {
		var mag = this.x * this.x + this.y * this.y;
		if (mag > 0) {
			mag = 1.0 / Math.sqrt(mag);
			this.x *= mag;
			this.y *= mag;
		}
		return this;
	},
	normalizeTo: function(len) {
	  var mag = Math.sqrt(this.x * this.x + this.y * this.y);
	  if (mag > 0) {
		mag = len / mag;
		this.x *= mag;
		this.y *= mag;
	  }
	  return this;
	},
	perpendicular: function() {
	  var t = this.x;
	  this.x = -this.y;
	  this.y = t;
	  return this;
	},
	scale: function(a) {
	  return new Vec2D(this.x * a, this.y * a);
	},
	sub: function(a,b){
	  return new Vec2D(this.x -a.x, this.y - a.y);
  },
}

// http://toxiclibs.org/docs/core/toxi/geom/Line2D.html
function Line2D(a, b) {
	this.a = a;
	this.b = b;
}

Line2D.prototype = {
	intersectLine: function(l) {
	var isec,
	  denom = (l.b.y - l.a.y) * (this.b.x - this.a.x) - (l.b.x - l.a.x) * (this.b.y - this.a.y),
	  na = (l.b.x - l.a.x) * (this.a.y - l.a.y) - (l.b.y - l.a.y) * (this.a.x - l.a.x),
	  nb = (this.b.x - this.a.x) * (this.a.y - l.a.y) - (this.b.y - this.a.y) * (this.a.x - l.a.x);
	if (denom !== 0) {
	  var ua = na / denom,
		ub = nb / denom;
	  if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0) {
		isec =new Line2D.LineIntersection(Line2D.LineIntersection.Type.INTERSECTING,this.a.interpolateTo(this.b, ua));
	  } else {
		isec = new Line2D.LineIntersection(Line2D.LineIntersection.Type.NON_INTERSECTING, this.a.interpolateTo(this.b, ua));
	  }
	} else {
	  if (na === 0 && nb === 0) {
		isec = new Line2D.LineIntersection(Line2D.LineIntersection.Type.COINCIDENT, undefined);
	  } else {
		isec = new Line2D.LineIntersection(Line2D.LineIntersection.Type.COINCIDENT, undefined);
	  }
	}
	return isec;
  }
}

Line2D.LineIntersection = function(type, pos) {
  this.type = type;
  this.pos = pos;
}

Line2D.LineIntersection.Type = { COINCIDENT: 0, PARALLEL: 1, NON_INTERSECTING: 2, INTERSECTING: 3};


window.MathUtils = {
	getPointInQuadraticCurve: function(t, p1, pc, p2) {
		var x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * pc.x + t * t * p2.x;
		var y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * pc.y + t * t * p2.y;
		
		return new Vec2D(x, y);
	},

	// http://microbians.com/math/Gabriel_Suchowolski_Quadratic_bezier_offsetting_with_selective_subdivision.pdf
	// http://www.math.vanderbilt.edu/~schectex/courses/cubic/
	getNearestPoint: function (p1, pc, p2) {
		var v0 = pc.sub(p1);
		var v1 = p2.sub(pc);

		var a = v1.sub(v0).dot(v1.sub(v0));
		var b = 3 * (v1.dot(v0) - v0.dot(v0));
		var c = 3 * v0.dot(v0) - v1.dot(v0);
		var d = -1 * v0.dot(v0);

		var p = -b / (3 * a);
		var q = p * p * p + (b * c - 3 * a * d) / (6 * a * a);
		var r = c / (3 * a);

		var s = Math.sqrt(q * q + Math.pow(r - p * p, 3));
		var t = MathUtils.cbrt(q + s) + MathUtils.cbrt(q - s) + p;

		return t;
	},

	// http://stackoverflow.com/questions/12810765/calculating-cubic-root-for-negative-number
	cbrt: function (x) {
		var sign = x === 0 ? 0 : x > 0 ? 1 : -1;
		return sign * Math.pow(Math.abs(x), 1/3);
	}
}

init();