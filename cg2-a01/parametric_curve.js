/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: parametric_curve
 *
 * A Circle knows how to draw itself into a specified 2D context,
 * can tell whether a certain mouse position "hits" the object,
 * and implements the function createDraggers() to create a set of
 * draggers to manipulate itself.
 *
 */


/* requireJS module definition */
define(["util", "vec2", "scene", "point_dragger", "straight_line"], 
       (function(Util,vec2,Scene,PointDragger, StraightLine) {
       
    "use strict";

    /** TODO: Dok
     *
     *  A simple circle that can be dragged 
     *  around by its endpoints.
     *  Parameters:
     *  - point0 and point1: array objects representing [x,y] coordinates of start and end point
     *  - lineStyle: object defining width and color attributes for line drawing, 
     *       begin of the form { width: 2, color: "#00FF00" }
     */ 

    var ParametricCurve = function(x_formula, y_formula, t_min, t_max, segments, lineStyle) {

        console.log("creating parametric curve [x: " + x_formula + ", y: " + y_formula + ", t_min: " + t_min + ", t_max: " + t_max + ", segments: " + segments + "].");
        
        // draw style for drawing the circle
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };

        // // exception handling for eval()
        // var tryEval = function(t, formula) {
        //     var res;
        //     try {
        //         res = eval(formula);
        //     } catch(err) {
        //         console.log(err);
        //     }
        //     return res;
        // };

        // this.x = function(t) { return tryEval(t, x_formula); };
        // this.y = function(t) { return tryEval(t, y_formula); };
        
        this.x_formula = x_formula;
        this.y_formula = y_formula;

        this.x = function(t) { return tryEval(t, x_formula); };
        this.y = function(t) { return tryEval(t, y_formula); };

        this.t_min = t_min;
        this.t_max = t_max;
        this.segments = segments;

        // the points for the approximated parametric curve
        this.p = [];
        this.calculatePoints();
    };

    // exception handling for eval()
    var tryEval = function(t, formula) {
        try {
            return eval(formula);
        } catch(err) {
            console.log(err);
        }
    };

    ParametricCurve.prototype.calculatePoints = function() {
        this.p = [];
        var delta = (this.t_max - this.t_min) / this.segments;
        for (var i = 0; i <= this.segments; i++) {
            var t = this.t_min + i * delta;
            this.p.push([this.x(t), this.y(t)]);
        }
    };

    ParametricCurve.prototype.setX = function(x_formula) {
        this.x_formula = x_formula;
        this.x = function(t) { return tryEval(t, x_formula); };
        this.calculatePoints();
    };

    ParametricCurve.prototype.setY = function(y_formula) {
        this.y_formula = y_formula;
        this.y = function(t) { return tryEval(t, y_formula); };
        this.calculatePoints();
    };

    ParametricCurve.prototype.setTMin = function(t_min) {
        this.t_min = t_min;
        this.calculatePoints();
    };

    ParametricCurve.prototype.setTMax = function(t_max) {
        this.t_max = t_max;
        this.calculatePoints();
    };

    ParametricCurve.prototype.setSegments = function(segments) {
        this.segments = segments;
        this.calculatePoints();
    };

    // draw this circle into the provided 2D rendering context
    ParametricCurve.prototype.draw = function(context) {

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

    
