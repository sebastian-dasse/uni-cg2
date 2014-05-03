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

            var parametricCurve = new ParametricCurve( "350+100*Math.sin(t)", "150+100*Math.cos(t)", 0, 5, 20, style);
            scene.addObjects([parametricCurve]);

            sceneController.deselect();
            sceneController.select(parametricCurve);
        }));

        /*
         * TODO: Dok it!
         */
        $("#inputLineColor").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            var newColor = evt.currentTarget.value;

            if (newColor.match(/^#[0-9a-f]{6}$/i)) {
                obj.lineStyle.color = newColor;
            }
            
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputLineWidth").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            var newWidth = parseInt(evt.currentTarget.value);
            var isInRange = newWidth && 1 <= newWidth && newWidth <= 5;

            if (isInRange) {
                obj.lineStyle.width = newWidth;
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputRadius").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            var newRadius = parseInt(evt.currentTarget.value);
            var isInRange = newRadius && 1 <= newRadius && newRadius <= 250; // context.canvas.width / 2 == 250
            
            if (isInRange) {
                obj.setRadius(newRadius);
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputX").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            
            // if (obj && obj.setX) { //                << TODO: FRAGE: was ist die bessere Alternative ???
            if (obj instanceof ParametricCurve) {
                obj.setX($("#inputX").val());
            }
            sceneController.select(obj);
        });
        
        /*
         * TODO: Dok it!
         */
        $("#inputY").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (obj instanceof ParametricCurve) {
                obj.setY($("#inputY").val());
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputMinT").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (obj instanceof ParametricCurve) {
                obj.setTMin($("#inputMinT").val());
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputMaxT").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (obj instanceof ParametricCurve) {
                obj.setTMax($("#inputMaxT").val());
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputSegments").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (obj instanceof ParametricCurve) {
                obj.setSegments($("#inputSegments").val());
            }
            sceneController.select(obj);
        });
        
    
    };

    // return the constructor function 
    return HtmlController;


})); // require 



            
