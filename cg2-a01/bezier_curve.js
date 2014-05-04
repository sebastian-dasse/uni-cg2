/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: bezier_curve
 *
 * A Bezier curve knows how to draw itself into a specified 2D context
 * and can tell whether a certain mouse position "hits" the object,
 * and implements the function createDraggers() to create a set of
 * draggers to manipulate itself.
 *
 */


/* requireJS module definition */
define(["util", "vec2", "scene", "point_dragger", "parametric_curve", "polygon_dragger"], 
       (function(Util,vec2,Scene,PointDragger, ParametricCurve, PolygonDragger) {
       
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

    // var BezierCurve = function(p0, p1, p2, p3, segments, lineStyle) {
    var BezierCurve = function(scene, segments, lineStyle) {
        
        // draw style for drawing the circle
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };
        
        this.segments = segments || 20;

        // the control points
        this.p0 = [-1 *200 + 250,  0 *100 + 200];
        this.p1 = [ 0 *200 + 250,  1 *100 + 200];
        this.p2 = [ 0 *200 + 250, -1 *100 + 200];
        this.p3 = [ 1 *200 + 250,  0 *100 + 200];

        this.scene = scene;
        this.x_formula;
        this.y_formula;

        // default range is [0, 1]
        this.t_min = 0;
        this.t_max = 1;

        this.update();
        
        console.log("creating bezier curve [segments: " + this.segments + "].");
    };

    // calculate the formula and all points for this curve
    BezierCurve.prototype.update = function() {
        this.x_formula = b0 + "*" + this.p0[0] + " + " + 
                         b1 + "*" + this.p1[0] + " + " + 
                         b2 + "*" + this.p2[0] + " + " + 
                         b3 + "*" + this.p3[0];
        this.y_formula = b0 + "*" + this.p0[1] + " + " + 
                         b1 + "*" + this.p1[1] + " + " + 
                         b2 + "*" + this.p2[1] + " + " + 
                         b3 + "*" + this.p3[1];
        
        // this.curve = new ParametricCurve(this.scene, this.x_formula, this.y_formula, 0, 1, this.segments, this.lineStyle);
        this.curve = new ParametricCurve(this.scene, this.x_formula, this.y_formula, this.t_min, this.t_max, this.segments, this.lineStyle);
    }

    // set the control point p0
    BezierCurve.prototype.setP0 = function(p0) {
        this.p0 = p0;
        this.update();
    }

    // set the control point p2
    BezierCurve.prototype.setP1 = function(p1) {
        this.p1 = p1;
        this.update();
    }

    // set the control point p2
    BezierCurve.prototype.setP2 = function(p2) {
        this.p2 = p2;
        this.update();
    }

    // set the control point p3
    BezierCurve.prototype.setP3 = function(p3) {
        this.p3 = p3;
        this.update();
    }

    // set the minimum for t
    BezierCurve.prototype.setTMin = function(t_min) {
        this.t_min = t_min;
        this.update();
    };

    // set the maximum for t
    BezierCurve.prototype.setTMax = function(t_max) {
        this.t_max = t_max;
        this.update();
    };

    // 
    BezierCurve.prototype.setSegments = function(segments) {
        this.segments = segments;
        // this.calculatePoints();
        this.curve.setSegments(segments);
        this.update();
    };

    // turn the tick marks on or off
    // BezierCurve.prototype.toggleTicks = function() {
    //     this.curve.toggleTicks();
    // };

    // draw this circle into the provided 2D rendering context
    BezierCurve.prototype.draw = function(context) {
        this.curve.draw(context);
    };

    // test whether the mouse position is on this parametric curve
    BezierCurve.prototype.isHit = function(context,pos) {
        return this.curve.isHit(context, pos);
    };
    
    // return list of draggers to manipulate this bezier curve
    BezierCurve.prototype.createDraggers = function() {
        
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
        
        draggers.push( new PolygonDragger(getP0, getP1, getP2, getP3) );

        draggers.push( new PointDragger(getP0, setP0, draggerStyle) );
        draggers.push( new PointDragger(getP1, setP1, draggerStyle2) );
        draggers.push( new PointDragger(getP2, setP2, draggerStyle2) );
        draggers.push( new PointDragger(getP3, setP3, draggerStyle) );

        
        return draggers;
    };
    
    return BezierCurve;

})); // define

    
