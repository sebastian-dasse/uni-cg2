/*
  *
 * Module main: CG2 Aufgabe 2 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 */

requirejs.config({
    paths: {
    
        // jquery library
        "jquery": [
            // try content delivery network location first
            'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
            //If the load via CDN fails, load locally
            '../lib/jquery-1.7.2.min'],
            
        // gl-matrix library
        "gl-matrix": "../lib/gl-matrix-1.3.7",

    }
});


/*
 * The function defined below is the "main" module,
 * it will be called once all prerequisites listed in the
 * define() statement are loaded.
 *
 */

/* requireJS module definition */
define(["jquery", "gl-matrix", "webgl-debug", "animation", "scene", "html_controller"], 
       (function($, glmatrix, WebGLDebugUtils, Animation, Scene, HtmlController ) {

    "use strict";

    /*
     * create an animation that rotates the scene around 
     * the Y axis over time. 
     */
    var makeAnimation = function(scene) {
    
        // create animation to rotate the scene
        var animation = new Animation( (function(t, deltaT) {

            // rotation angle, depending on animation time
            var angle = deltaT/1000 * animation.customSpeed; // in degrees

            // ask the scene to rotate around Y axis
            scene.rotate("worldY", angle); 
                        
            // (re-) draw the scene
            scene.draw();
            
        } )); // end animation callback

        // set an additional attribute that can be controlled from the outside
        animation.customSpeed = 20; 

        return animation;
    
    };

    var makeWebGLContext = function(canvas_name) {
    
        // get the canvas element to be used for drawing
        var canvas=$("#"+canvas_name).get(0);
        if(!canvas) { 
            throw "HTML element with id '"+canvas_name + "' not found"; 
            return null;
        };

        // get WebGL rendering context for canvas element
        var options = {alpha: true, depth: true, antialias:true};
        var gl = canvas.getContext("webgl", options) || 
                 canvas.getContext("experimental-webgl", options);
        if(!gl) {
            throw "could not create WebGL rendering context";
        };
        
        // create a debugging wrapper of the context object
        var throwOnGLError = function(err, funcName, args) {
            throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
        };
        var gl=WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);
        
        return gl;
    };
    
    $(document).ready( (function() {
    
        // create WebGL context object for the named canvas object
        var gl = makeWebGLContext("drawing_area");
                                        
        // create scene, create animation, and draw once
        var scene = new Scene(gl);
        var animation = makeAnimation(scene);
        scene.draw();        

        // mapping from character pressed on the keyboard to 
        // rotation axis and angle
        var keyMap = {
             'x': {axis: "worldX", angle:  5.0}, 
             'X': {axis: "worldX", angle: -5.0}, 
             'y': {axis: "worldY", angle:  5.0}, 
             'Y': {axis: "worldY", angle: -5.0}, 
             'z': {axis: "worldZ", angle:  5.0}, 
             'Z': {axis: "worldZ", angle: -5.0}, 
             'c': {axis: "worldScale", angle:  1}, // "angle" is actually the offset for the scaling
             'C': {axis: "worldScale", angle: -1}, 
             
             'q': {axis: "armUpperRZ", angle: -5.0}, 
             'Q': {axis: "armUpperRZ", angle:  5.0}, 
             'w': {axis: "armUpperRX", angle: -5.0}, 
             'W': {axis: "armUpperRX", angle:  5.0}, 
             'e': {axis: "armLowerRX", angle: -5.0}, 
             'E': {axis: "armLowerRX", angle:  5.0}, 
             'r': {axis: "handRY", angle:  5.0}, 
             'R': {axis: "handRY", angle: -5.0}, 
             't': {axis: "handRGrab", angle:  5.0}, 
             'T': {axis: "handRGrab", angle: -5.0}, 

             'a': {axis: "armUpperLZ", angle:  5.0}, 
             'A': {axis: "armUpperLZ", angle: -5.0}, 
             's': {axis: "armUpperLX", angle: -5.0}, 
             'S': {axis: "armUpperLX", angle:  5.0}, 
             'd': {axis: "armLowerLX", angle: -5.0}, 
             'D': {axis: "armLowerLX", angle:  5.0}, 
             'f': {axis: "handLY", angle: -5.0}, 
             'F': {axis: "handLY", angle:  5.0}, 
             'g': {axis: "handLGrab", angle:  5.0}, 
             'G': {axis: "handLGrab", angle: -5.0}, 

             'h': {axis: "headY", angle:  5.0}, 
             'H': {axis: "headY", angle: -5.0}, 
             'j': {axis: "eyesZ", angle:  5.0}, 
             'J': {axis: "eyesZ", angle: -5.0}, 
             'k': {axis: "eyesScaleZ", angle:  0.2*180/Math.PI},  // "angle" is actually the offset for the scaling
             'K': {axis: "eyesScaleZ", angle: -0.2*180/Math.PI}
        };

        // create HtmlController that takes care of all interaction
        // of HTML elements with the scene and the animation
        var controller = new HtmlController(scene,animation,keyMap); 
        
    })); // $(document).ready()

    
    
})); // define module
        

