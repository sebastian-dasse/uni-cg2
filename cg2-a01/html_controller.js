/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: html_controller
 *
 * Defines callback functions for communicating with various 
 * HTML elements on the page, e.g. buttons and parameter fields.
 *
 */

 
/* requireJS module definition */
define(["jquery", "straight_line", "circle", "parametric_curve"], 
       (function($, StraightLine, Circle, ParametricCurve) {

    "use strict"; 
                
    /*
     * define callback functions to react to changes in the HTML page
     * and provide them with a closure defining context and scene
     */
    var HtmlController = function(context,scene,sceneController) {
    
    
        // generate random X coordinate within the canvas
        var randomX = function() { 
            return Math.floor(Math.random()*(context.canvas.width-10))+5; 
        };
            
        // generate random Y coordinate within the canvas
        var randomY = function() { 
            return Math.floor(Math.random()*(context.canvas.height-10))+5; 
        };

        // generate random radius for a given point coordinate within the canvas
        var randomRadius = function(x, y) { 
            
            // TODO: sinnvolle Berechnung überlegen!

            return Math.floor(Math.random()*(context.canvas.height-10) / 2);
        };
            
        // generate random color in hex notation
        var randomColor = function() {

            // convert a byte (0...255) to a 2-digit hex string
            var toHex2 = function(byte) {
                var s = byte.toString(16); // convert to hex string
                if(s.length == 1) s = "0"+s; // pad with leading 0
                return s;
            };
                
            var r = Math.floor(Math.random()*25.9)*10;
            var g = Math.floor(Math.random()*25.9)*10;
            var b = Math.floor(Math.random()*25.9)*10;
                
            // convert to hex notation
            return "#"+toHex2(r)+toHex2(g)+toHex2(b);
        };
        
        /*
         * event handler for "new line button".
         */
        $("#btnNewLine").click( (function() {
        
            // create the actual line and add it to the scene
            var style = { 
                width: Math.floor(Math.random()*3)+1,
                color: randomColor()
            };
                          
            var line = new StraightLine( [randomX(),randomY()], 
                                         [randomX(),randomY()], 
                                         style );
            scene.addObjects([line]);

            // deselect all objects, then select the newly created object
            sceneController.deselect();
            sceneController.select(line); // this will also redraw
                        
        }));

        /*
         * event handler for "new circle button".
         */
        $("#btnNewCircle").click( (function() {
        
            // create the actual circle and add it to the scene
            var style = { 
                width: Math.floor(Math.random()*3)+1,
                color: randomColor()
            };
                          
            var circle = new Circle( [randomX(),randomY()], 
                                     randomRadius(), 
                                     style );
            scene.addObjects([circle]);

            // deselect all objects, then select the newly created object
            sceneController.deselect();
            sceneController.select(circle); // this will also redraw
                        
        }));

        /*
         * TODO: Dok it!
         */
        $("#btnNewParametricCurve").click( (function() {

            var style = {
                width: Math.floor(Math.random()*3)+1, 
                color: randomColor()
            };

            var x = $("#inputX").val();
            var y = $("#inputY").val();
            var t_min = $("#inputMinT").val();
            var t_max = $("#inputMaxT").val();
            var segments = $("#inputSegments").val();

            var parametricCurve = new ParametricCurve(x, y, t_min, t_max, segments, style);
            scene.addObjects([parametricCurve]);

            sceneController.deselect();
            sceneController.select(parametricCurve);
        }));

        /*
         * TODO: Dok it!
         */
        $("#inputLineColor").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; };

            var newColor = evt.currentTarget.value;
            if (obj && newColor.match(/^#[0-9a-f]{6}$/i)) {
                obj.lineStyle.color = newColor;
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputLineWidth").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; };

            var MIN_WIDTH = 1;
            var MAX_WIDTH = 5;

            var newWidth = parseInt(evt.currentTarget.value);
            if (newWidth && MIN_WIDTH <= newWidth && newWidth <= MAX_WIDTH) {
                obj.lineStyle.width = newWidth;
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputRadius").change(function(evt) {
            var obj = sceneController.getSelectedObject();

            var MAX_RADIUS = 250;

            var newRadius = parseInt(evt.currentTarget.value);
            if (newRadius && 1 <= newRadius && newRadius <= MAX_RADIUS) { // context.canvas.width / 2 == 250
                obj.setRadius(newRadius);
            }
            sceneController.select(obj);
        });

        var isValidFormula = function(formula) {
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

        /*
         * TODO: Dok it!
         */
        $("#inputX").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; };

            var newVal = $("#inputX").val();
            if (obj instanceof ParametricCurve && isValidFormula(newVal)) {
                obj.setX(newVal);
            }
            sceneController.select(obj);
        });
        
        /*
         * TODO: Dok it!
         */
        $("#inputY").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; };

            var newVal = $("#inputY").val();
            if (obj && obj instanceof ParametricCurve && isValidFormula(newVal)) {
                obj.setY(newVal);
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputMinT").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; };

            var newVal = parseFloat($("#inputMinT").val());
            if (obj instanceof ParametricCurve && !isNaN(newVal)) {
                obj.setTMin(newVal);
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputMaxT").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; };

            var newVal = parseFloat($("#inputMaxT").val());
            if (obj instanceof ParametricCurve && !isNaN(newVal)) {
                obj.setTMax(newVal);
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputSegments").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; };

            var newVal = parseInt($("#inputSegments").val());
            if (obj instanceof ParametricCurve && 1 <= newVal && newVal <= ParametricCurve.MAX_SEGMENTS) {
                obj.setSegments(newVal);
            }
            sceneController.select(obj);
        });
        
    
    };

    // return the constructor function 
    return HtmlController;


})); // require 



            
