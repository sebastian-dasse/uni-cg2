/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: circle
 *
 * A Circle knows how to draw itself into a specified 2D context,
 * can tell whether a certain mouse position "hits" the object,
 * and implements the function createDraggers() to create a set of
 * draggers to manipulate itself.
 *
 */


/* requireJS module definition */
define(["util", "vec2", "scene", "point_dragger"], 
       (function(Util,vec2,Scene,PointDragger) {
       
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

    var Circle = function(center, radius, lineStyle) {

        console.log("creating circle at [" + 
                    center[0] + "," + center[1] + "] with radius " +
                    radius + ".");
        
        // draw style for drawing the circle
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };

        // initial values in case either point is undefined
        this.center = center || [50,50];
        radius = radius || 50;
        var orbitPoint = [center[0] + radius , center[1]];
        this.radiusVec = vec2.sub(orbitPoint, center);
        
    };

    Circle.prototype.getRadius = function() {
        return Math.floor(vec2.length(this.radiusVec));
    }

    Circle.prototype.setRadius = function(radius) {
        this.radiusVec = vec2.mult(this.radiusVec, radius / this.getRadius());
    }

    // draw this circle into the provided 2D rendering context
    Circle.prototype.draw = function(context) {

        // draw actual circle
        context.beginPath();
        context.arc(this.center[0], this.center[1], this.getRadius(), 0, 2*Math.PI);
        
        // set drawing style
        context.lineWidth = this.lineStyle.width;
        context.strokeStyle = this.lineStyle.color;
        
        // actually start drawing
        context.stroke(); 
        
    };

    // test whether the mouse position is on this circle
    Circle.prototype.isHit = function(context,pos) {

        // distance of the point from the circle
        var d = Math.abs(vec2.length(vec2.sub(pos, this.center)) - this.getRadius());

        // allow 3 pixels extra "sensitivity"
        return d<=(this.lineStyle.width/2)+3;
        
    };
    
    // return list of draggers to manipulate this line
    Circle.prototype.createDraggers = function() {
    


        // TODO: Dok it! >>> in anderes Modulverschieben !!! >> wird nicht verwendet ???
        var rotation = function(radians, s) {
            return [Math.abs(s * Math.sin(radians)), Math.abs(s * Math.cos(radians))];
        };

        // TODO: Dok it! >>> in anderes Modulverschieben !!! >>
        var angleBetween = function(v0, v1) {
            return Math.acos(vec2.dot(v0, v1) / (vec2.length(v0) * vec2.length(v1)) );
        };

        

        var draggerStyle = { radius:4, color: this.lineStyle.color, width:0, fill:true };
        var draggers = [];

        // create closure and callbacks for dragger
        var _circle = this;
        var getCenter = function() { return _circle.center; };
        var getOrbitPt = function() { return vec2.add(_circle.center, _circle.radiusVec); };
        var setCenter = function(dragEvent) { _circle.center = dragEvent.position; };
        var setOrbitPt = function(dragEvent) { _circle.radiusVec = vec2.sub(dragEvent.position, _circle.center); };
        draggers.push( new PointDragger(getCenter, setCenter, draggerStyle) );
        draggers.push( new PointDragger(getOrbitPt, setOrbitPt, draggerStyle) );
        
        return draggers;
        
    };
    
    // this module only exports the constructor for Circle objects
    return Circle;

})); // define

    
