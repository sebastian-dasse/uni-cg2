/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: bezier_curve2
 *
 * A Bezier curve knows how to draw itself into a specified 2D context
 * and can tell whether a certain mouse position "hits" the object,
 * and implements the function createDraggers() to create a set of
 * draggers to manipulate itself.
 *
 */


/* requireJS module definition */
define(["util", "vec2", "scene", "point_dragger", "parametric_curve", "polygon_dragger", "straight_line"], 
       (function(Util,vec2,Scene,PointDragger, ParametricCurve, PolygonDragger, StraightLine) {
       
    "use strict";

    /**
     *  A Bezier curve can be dragged around by its four control points.
     *  Parameters:
     *  - p0, p1, p2 and p3: array objects representing [x,y] coordinates of the four control points
     *  - x_formula and y_formula: strings representing the formulas for the x and the y component
     *  - t_min and t_max: the minimum value and the maximum value for the parameter t
     *  - segments: the number of segments
     *  - lineStyle: object defining width and color attributes for line drawing, 
     *       begin of the form { width: 2, color: "#00FF00" }
     */ 

    // define Bernstein polynomials
    var b0 = "(1-t)*(1-t)*(1-t)";
    var b1 = "3*(1-t)*(1-t)*t";
    var b2 = "3*(1-t)*t*t";
    var b3 = "t*t*t";

    // var BezierCurve2 = function(p0, p1, p2, p3, segments, lineStyle) {
    var BezierCurve2 = function(scene, points, depth, delta, lineStyle) {
        
        // draw style for drawing the circle
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };

        this.scene = scene;

        // the control points
        this.p0 = points[0] || [-1 *200 + 250,  0 *100 + 200];
        this.p1 = points[1] || [ 0 *200 + 250,  1 *100 + 200];
        this.p2 = points[2] || [ 0 *200 + 250, -1 *100 + 200];
        this.p3 = points[3] || [ 1 *200 + 250,  0 *100 + 200];
        // this.p0 = points[0];
        // this.p1 = points[1];
        // this.p2 = points[2];
        // this.p3 = points[3];

        this.curves = [];   // 

        // the lines for the approximated parametric curve - only used for isHit(), because drawing individual lines does not look so good
        this.lines = [];
        
        this.depth = depth; //
        // this.delta = delta || 20; //
        this.delta = 20; //

        this.calculate();
        
        // console.log("creating bezier curve 2 from [" + 
        //             this.p0[0] + "," + this.p0[1] + "] to [" +
        //             this.p3[0] + "," + this.p3[1] + "].");
    };

    // calculate the formula and all points for this curve
    BezierCurve2.prototype.calculate = function() {
        this.curves = [];
        this.lines = [];

        console.log( angleBetween(this.p0, this.p1, this.p2) );
        console.log( angleBetween(this.p1, this.p2, this.p3) );

        if (this.depth > 0 
            // || 
            // angleBetween(this.p0, this.p1, this.p2) > this.delta ||
            // angleBetween(this.p1, this.p2, this.p3) > this.delta 
            ) {
            
            var t = 0.5;

            var a0 = interpolate(this.p0, this.p1, t);
            var a1 = interpolate(this.p1, this.p2, t);
            var a2 = interpolate(this.p2, this.p3, t);

            var b0 = interpolate(a0, a1, t);
            var b1 = interpolate(a1, a2, t);
            
            var c0 = interpolate(b0, b1, t);
            
            this.curves.push( new BezierCurve2(this.scene, [this.p0, a0, b0, c0], this.depth - 1, this.delta, this.lineStyle) );
            this.curves.push( new BezierCurve2(this.scene, [c0, b1, a2, this.p3], this.depth - 1, this.delta, this.lineStyle) );
        } else {
            this.lines.push( new StraightLine(this.p0, this.p1, this.lineStyle) );
            this.lines.push( new StraightLine(this.p1, this.p2, this.lineStyle) );
            this.lines.push( new StraightLine(this.p2, this.p3, this.lineStyle) );
        }
    }

    // set the control point p0
    BezierCurve2.prototype.setP0 = function(p0) {
        this.p0 = p0;
        this.calculate();
    }

    // set the control point p2
    BezierCurve2.prototype.setP1 = function(p1) {
        this.p1 = p1;
        this.calculate();
    }

    // set the control point p2
    BezierCurve2.prototype.setP2 = function(p2) {
        this.p2 = p2;
        this.calculate();
    }

    // set the control point p3
    BezierCurve2.prototype.setP3 = function(p3) {
        this.p3 = p3;
        this.calculate();
    }

    // set the depth for the subdivision for de Casteljau's algorithm
    BezierCurve2.prototype.setDepth = function(depth) {
        this.depth = depth;
        this.calculate();
    }

    // set the maximum deviation for the subdivision for de Casteljau's algorithm
    BezierCurve2.prototype.setDelta = function(delta) {
        this.delta = delta;
        this.calculate();
    }

    // draw this circle into the provided 2D rendering context
    BezierCurve2.prototype.draw = function(context) {
        
        if (this.curves.length === 0) {

            // draw curve
            context.beginPath();
            context.moveTo(this.p0[0], this.p0[1]);
            context.lineTo(this.p1[0], this.p1[1]);
            context.lineTo(this.p2[0], this.p2[1]);
            context.lineTo(this.p3[0], this.p3[1]);
            
            // set drawing style
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;
            
            // actually start drawing
            context.stroke();

            if (this.scene.ticksOn) {
                this.drawTicks(context);
            }
        } else {
            this.curves[0].draw(context);
            this.curves[1].draw(context);
        }
    };

    // draw tick marks for all points where the curve is being evaluated
    BezierCurve2.prototype.drawTicks = function(context) {
        drawTick(context, this.p0, vec2.sub(this.p1, this.p0));
        drawTick(context, this.p1, vec2.sub(this.p2, this.p0));
        drawTick(context, this.p2, vec2.sub(this.p3, this.p1));
        drawTick(context, this.p3, vec2.sub(this.p3, this.p2));
    };

    // test whether the mouse position is on this parametric curve
    BezierCurve2.prototype.isHit = function(context,pos) {
        if (this.curves.length === 0) {
            return this.lines[0].isHit(context, pos) || 
                   this.lines[1].isHit(context, pos) || 
                   this.lines[2].isHit(context, pos);
        } else {
            return this.curves[0].isHit(context, pos) || 
                   this.curves[1].isHit(context, pos);
        }
        return true;
    };
    
    // return list of draggers to manipulate this bezier curve
    BezierCurve2.prototype.createDraggers = function() {

        var draggerStyle = { radius:4, color: this.lineStyle.color, width:0, fill:true }
        var draggerStyle2 = { radius:4, color: this.lineStyle.color, width:0, fill:false }
        var draggers = [];
        
        // create closure and callbacks for dragger
        var _curve = this;
        var getP0 = function() { return _curve.p0; };
        var getP1 = function() { return _curve.p1; };
        var getP2 = function() { return _curve.p2; };
        var getP3 = function() { return _curve.p3; };
        var setP0 = function(dragEvent) { _curve.setP0(dragEvent.position); };
        var setP1 = function(dragEvent) { _curve.setP1(dragEvent.position); };
        var setP2 = function(dragEvent) { _curve.setP2(dragEvent.position); };
        var setP3 = function(dragEvent) { _curve.setP3(dragEvent.position); };
        
        draggers.push( new PolygonDragger([getP0, getP1, getP2, getP3]) );

        draggers.push( new PointDragger(getP0, setP0, draggerStyle) );
        draggers.push( new PointDragger(getP1, setP1, draggerStyle2) );
        draggers.push( new PointDragger(getP2, setP2, draggerStyle2) );
        draggers.push( new PointDragger(getP3, setP3, draggerStyle) );

        
        return draggers;
    };
    
    // return a point as result of linear interpolation between p0 and p1 by t
    var interpolate = function(p0, p1, t) {
        return vec2.add( vec2.mult(p0, 1-t), vec2.mult(p1, t));
    };

    // draw one single tick through the given point, orthogonal to the given tagent
    var drawTick = function(context, p, tangent) {
        var TICK_SIZE = 5;
        var tick = vec2.mult(vec2.normalized(vec2.normalTo(tangent)), TICK_SIZE);
        var tp0 = vec2.add(p, tick);
        var tp1 = vec2.add(p, vec2.mult(tick, -1));

        context.beginPath();
        context.moveTo(tp0[0], tp0[1]);
        context.lineTo(tp1[0], tp1[1]);
        
        context.lineWidth = 1;
        context.strokeStyle = "#999999";
        context.stroke();
    };

    // return the angle in degrees between the given points; if two points are equal, 0 is returned
    var angleBetween = function(p0, p1, p2) {
        var v0 = vec2.sub(p0, p1);
        var v1 = vec2.sub(p2, p1);
        var len = vec2.length(v0) * vec2.length(v1);
        return (len === 0) ? 0 : Math.acos( vec2.dot(v0, v1) / len ) * 180 / Math.PI;
    };

    return BezierCurve2;

})); // define

    
    