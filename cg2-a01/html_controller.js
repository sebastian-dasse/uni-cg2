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
define(["jquery", "straight_line", "circle", "parametric_curve", "bezier_curve", "bezier_curve2"], 
       (function($, StraightLine, Circle, ParametricCurve, BezierCurve, BezierCurve2) {

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
            var t_min = $("#inputTMin").val();
            var t_max = $("#inputTMax").val();
            var segments = $("#inputSegments").val();

            var parametricCurve = new ParametricCurve(scene, x, y, t_min, t_max, segments, style);
            scene.addObjects([parametricCurve]);

            sceneController.deselect();
            sceneController.select(parametricCurve);
        }));

        /*
         * TODO: Dok it!
         */
        $("#btnNewBezierCurve").click( (function() {

            // var style = {
            //     width: Math.floor(Math.random()*3)+1, 
            //     color: randomColor()
            // };

            // var segments = $("#inputSegments").val();

            // var bezierCurve = new BezierCurve(scene, segments, style);
            var bezierCurve = new BezierCurve(scene);
            scene.addObjects([bezierCurve]);

            sceneController.deselect();
            sceneController.select(bezierCurve);
        }));

        /*
         * TODO: Dok it!
         */
        $("#btnNewBezierCurve2").click( (function() {

            // var style = {
            //     width: Math.floor(Math.random()*3)+1, 
            //     color: randomColor()
            // };

            // var bezierCurve = new BezierCurve2(scene, points, depth, delta, style);
            // var bezierCurve2 = new BezierCurve2(scene, [], 0, 1, {});
            var bezierCurve2 = new BezierCurve2(scene, [], 4, 2);
            scene.addObjects([bezierCurve2]);

            sceneController.deselect();
            sceneController.select(bezierCurve2);
        }));

        /*
         * TODO: Dok it!
         */
        $("#inputLineColor").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; }

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
            if (!obj) { return; }

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

        /*
         * TODO: Dok it!
         */
        $("#inputX").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; }
            
            obj.setX && obj.setX($("#inputX").val());
            sceneController.select(obj);
        });
        
        /*
         * TODO: Dok it!
         */
        $("#inputY").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; }
            
            obj.setY && obj.setY($("#inputY").val());
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputTMin").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; }

            var newVal = parseFloat($("#inputTMin").val());
            if (obj.setTMin && !isNaN(newVal)) {
                obj.setTMin(newVal);
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputTMax").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; };

            var newVal = parseFloat($("#inputTMax").val());
            if (obj.setTMax && !isNaN(newVal)) {
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
            if (obj.setSegments && 1 <= newVal && newVal <= ParametricCurve.MAX_SEGMENTS) {
                obj.setSegments(newVal);
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputDepth").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; };

            var newVal = parseInt($("#inputDepth").val());
            if (obj.setDepth && (0 <= newVal) && newVal <= 10) { // TODO: "Konstante" einführen
                obj.setDepth(newVal);
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputDelta").change(function(evt) {
            var obj = sceneController.getSelectedObject();
            if (!obj) { return; };

            var newVal = parseFloat($("#inputDelta").val());
            if (obj.setDelta && 1 <= newVal && newVal <= 180) { // TODO: "Konstante" einführen
                obj.setDelta(newVal);
            }
            sceneController.select(obj);
        });

        /*
         * TODO: Dok it!
         */
        $("#inputTickMarks").change(function(evt) {
            scene.ticksOn = !scene.ticksOn;
            
            var obj = sceneController.getSelectedObject();
            obj && sceneController.select(obj);
        });

        // TODO: Dok it! >>>>>>>>>
        var showParams = function() {
            return function() {
                var obj = sceneController.getSelectedObject();
                var style = obj.lineStyle;

                $("#inputLineColor").val(style.color);
                $("#inputLineWidth").val(style.width);

                if (obj instanceof Circle) {
                    $("#inputAreaRadius").show();
                    $("#inputRadius").val(obj.getRadius());
                    // sceneController.scene.draw(context);
                } else {
                    $("#inputAreaRadius").hide();
                }

                if (obj instanceof ParametricCurve || obj instanceof BezierCurve) {
                    $("#inputAreaParametricCurve").show();
                    $("#inputX").val(obj.x_formula);
                    $("#inputY").val(obj.y_formula);
                    $("#inputTMin").val(obj.t_min);
                    $("#inputTMax").val(obj.t_max);
                    $("#inputSegments").val(obj.segments);
                } else {
                    $("#inputAreaParametricCurve").hide();
                }

                if (obj instanceof BezierCurve2) {
                    $("#inputAreaBezierCurve2").show();
                    $("#inputDepth").val(obj.depth);
                    $("#inputDelta").val(obj.delta);
                } else {
                    $("#inputAreaBezierCurve2").hide();
                }
            };
        };

        // TODO: Dok it!
        sceneController.onSelection(showParams());
        sceneController.onObjChange(showParams());
        

    };

    // return the constructor function 
    return HtmlController;


})); // require 



            
