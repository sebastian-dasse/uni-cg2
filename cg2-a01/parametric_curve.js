/*
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
     *  - segments: the number of segments used for the approximated curve
     *  - scene: the scene, which knows whether or not tick marks should be drawn
     *  - lineStyle: object defining width and color attributes for line drawing, 
     *       begin of the form { width: 2, color: "#00FF00" }
     */ 

    var ParametricCurve = function(x_formula, y_formula, t_min, t_max, segments, scene, lineStyle) {
        
        // draw style for drawing the circle
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };
        
        this.x_formula = isValidFormula(x_formula) && x_formula || "100*t";
        this.y_formula = isValidFormula(y_formula) && y_formula || "200+100*Math.sin(t)";
        this.t_min = t_min || 0;
        this.t_max = t_max || 2 * Math.PI;
        this.segments = segments || 20;
        this.scene = scene;
        this.p = [];    // the points for the approximated parametric curve
        
        // the lines for the approximated parametric curve - only used for isHit(), because drawing individual lines does not look so good
        this.lines = [];
        
        // calculate the points for the curve
        this.calculate();
        
        // console.log("creating parametric curve from [" + 
        //             this.p[0][0] + "," + this.p[0][1] + "] to [" +
        //             this.p[this.p.length-1][0] + "," + this.p[this.p.length-1][1] + "].");
    };

    // calculate the x value for the given t
    ParametricCurve.prototype.x = function(t) { return eval(this.x_formula); };

    // calculate the y value for the given t
    ParametricCurve.prototype.y = function(t) { return eval(this.y_formula); };

    // calculate all points for this curve
    ParametricCurve.prototype.calculate = function() {
        this.p = [];
        this.lines = [];
        var delta = (this.t_max - this.t_min) / this.segments;
        
        var p0 = [this.x(this.t_min), this.y(this.t_min)];
        this.p.push(p0);
        for (var i = 1; i <= this.segments; i++) {
            var t = this.t_min + i * delta;
            var p1 = [this.x(t), this.y(t)];
            this.p.push(p1);
            this.lines.push( new StraightLine(p0, p1, this.lineStyle) );
            p0 = p1;
        }
    };

    // set the formula for the x component
    ParametricCurve.prototype.setX = function(x_formula) {
        if (isValidFormula(x_formula)) {
            this.x_formula = x_formula;
        }
        this.calculate();
    };

    // set the formula for the y component
    ParametricCurve.prototype.setY = function(y_formula) {
        if (isValidFormula(y_formula)) {
            this.y_formula = y_formula;
        }
        this.calculate();
    };

    // set the minimum for t
    ParametricCurve.prototype.setTMin = function(t_min) {
        this.t_min = t_min;
        this.calculate();
    };

    // set the maximum for t
    ParametricCurve.prototype.setTMax = function(t_max) {
        this.t_max = t_max;
        this.calculate();
    };

    // set the number of segments
    ParametricCurve.prototype.setSegments = function(segments) {
        this.segments = segments;
        this.calculate();
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

        if (this.scene.ticksOn) {
            this.drawTicks(context);
        }
    };

    // draw tick marks for all points where the curve is being evaluated
    ParametricCurve.prototype.drawTicks = function(context) {
        var n = this.segments;
        var p = this.p;

        // first tick
        drawTick(context, p[0], vec2.sub(p[1], p[0]));

        // ticks from p[1] to p[n-1]
        for (var i = 1; i < n; i++) {
            drawTick(context, p[i], vec2.sub(p[i+1], p[i-1]));
        }

        // last tick
        drawTick(context, p[n], vec2.sub(p[n], p[n-1]));
    };

    // test whether the mouse position is on this parametric curve
    ParametricCurve.prototype.isHit = function(context,pos) {
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].isHit(context, pos)) {
                return true;
            }
        }
        return false;
    };
    
    // no draggers to manipulate this parametric curve
    ParametricCurve.prototype.createDraggers = function() {
        return [];
    };

    // checks formula given as a string for validity, i.e. that it can be evaluated to finite numbers
    var isValidFormula = function(formula) {
        if (!formula) { return false; }
        try {
            var t = 1;
            if (!isFinite(eval(formula))) {
                throw new Error();
            }
        } catch(err) {
            console.log("\'" + formula + "\' is not a valid formula");
            return false;
        }
        return true;
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
    
    return ParametricCurve;

})); // define

    
