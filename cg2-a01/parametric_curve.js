/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: parametric_curve
 *
 * A Parametric curve knows how to draw itself into a specified 2D context
 * and can tell whether a certain mouse position "hits" the object.
 * The function createDraggers() returns an empty list.
 *
 */


/* requireJS module definition */
define(["util", "vec2", "scene", "point_dragger", "straight_line"], 
       (function(Util,vec2,Scene,PointDragger, StraightLine) {
       
    "use strict";

    /**
     *  A parametric curve is defined through two formulas, a value range and the number of 
     *  segments that is used for the approximation. It cannot be dragged around.
     *  Parameters:
     *  - x_formula and y_formula: strings representing the formulas for the x and the y component
     *  - t_min and t_max: the minimum value and the maximum value for the parameter t
     *  - segments: the number of segments
     *  - p: an array representing the list of all points on this curve that are used for the approximation
     *  - lineStyle: object defining width and color attributes for line drawing, 
     *       begin of the form { width: 2, color: "#00FF00" }
     */ 

    var ParametricCurve = function(x_formula, y_formula, t_min, t_max, segments, lineStyle) {
        
        // draw style for drawing the circle
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };
        
        this.x_formula = x_formula || "100*t";
        this.y_formula = y_formula || "200+100*Math.sin(t)";
        this.t_min = t_min || 0;
        this.t_max = t_max || 2 * Math.PI;
        this.segments = segments || 20;

        // the points for the approximated parametric curve
        this.p = [];
        
        // calculate the points for the curve
        this.update();
        
        console.log("creating parametric curve [x: " + x_formula + ", y: " + y_formula + ", t_min: " + t_min + ", t_max: " + t_max + ", segments: " + segments + "].");
    };

    /* the maximum number of segments */
    ParametricCurve.MAX_SEGMENTS = 5000;

    // calculate the x value for the given t
    ParametricCurve.prototype.x = function(t) { return eval(this.x_formula); };

    // calculate the y value for the given t
    ParametricCurve.prototype.y = function(t) { return eval(this.y_formula); };

    // calculate all points for this curve
    ParametricCurve.prototype.update = function() {
        this.p = [];
        var delta = (this.t_max - this.t_min) / this.segments;
        for (var i = 0; i <= this.segments; i++) {
            var t = this.t_min + i * delta;
            this.p.push([this.x(t), this.y(t)]);
        }
    };

    // set the formula for the x component
    ParametricCurve.prototype.setX = function(x_formula) {
        this.x_formula = x_formula;
        this.update();
    };

    // set the formula for the y component
    ParametricCurve.prototype.setY = function(y_formula) {
        this.y_formula = y_formula;
        this.update();
    };

    // set the minimum for t
    ParametricCurve.prototype.setTMin = function(t_min) {
        this.t_min = t_min;
        this.update();
    };

    // set the maximum for t
    ParametricCurve.prototype.setTMax = function(t_max) {
        this.t_max = t_max;
        this.update();
    };

    // set the number of segments
    ParametricCurve.prototype.setSegments = function(segments) {
        this.segments = segments;
        this.update();
    };

    // draw this circle into the provided 2D rendering context
    ParametricCurve.prototype.draw = function(context) {

        // draw curve
        context.beginPath();
        context.moveTo(this.p[0][0], this.p[0][1]);
        for (var i = 1; i <= this.segments; i++) {
            context.lineTo(this.p[i][0], this.p[i][1]);
        }
        
        // set drawing style
        context.lineWidth = this.lineStyle.width;
        context.strokeStyle = this.lineStyle.color;
        
        // actually start drawing
        context.stroke();
    };

    // test whether the mouse position is on this parametric curve
    ParametricCurve.prototype.isHit = function(context,pos) {
        for (var i = 0; i < this.segments; i++) {
            var line = new StraightLine(this.p[i], this.p[i+1], this.lineStyle);
            if (line.isHit(context, pos)) {
                return true;
            }
        }
        return false;
    };
    
    // no draggers to manipulate this parametric curve
    ParametricCurve.prototype.createDraggers = function() {
        return [];
    };
    
    return ParametricCurve;

})); // define

    
