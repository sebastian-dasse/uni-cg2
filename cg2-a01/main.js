/*
 *
 * Module main: CG2 Aufgabe 1, Winter 2013/2014
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 */


/* 
 *  RequireJS alias/path configuration (http://requirejs.org/)
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
        "gl-matrix": "../lib/gl-matrix-1.3.7"

    }
});


/*
 * The function defined below is the "main" function,
 * it will be called once all prerequisites listed in the
 * define() statement are loaded.
 *
 */

/* requireJS module definition */
define(["jquery", "gl-matrix", "util", 
        "scene", "scene_controller", "html_controller", "circle", "parametric_curve"], 
       (function($, glmatrix, util,
                    Scene, SceneController, HtmlController, Circle, ParametricCurve) {

    "use strict";
    

    /*
     * main program, to be called once the document has loaded 
     * and the DOM has been constructed
     * 
     */

    $(document).ready( (function() {

        console.log("document ready - starting!");

        // get the canvas element to be used for drawing
        var canvas=$("#drawing_area").get(0);
        if(!canvas) { 
            throw new util.RuntimeError("drawing_area not found", this); 
        }

        // get 2D rendering context for canvas element
        var context=canvas.getContext("2d");
        if(!context) {
            throw new util.RuntimeError("could not create 2D rendering context", this);
        }
        
        // create scene with background color
        var scene = new Scene("#FFFFFF");
        
        // create SceneController to process and map events
        var sceneController = new SceneController(context,scene); 
        
        // callbacks for the various HTML elements (buttons, ...)
        var htmlController = new HtmlController(context,scene,sceneController); 
        
        // draw scene initially
        scene.draw(context);

        // TODO: Dok it! >>>>>>>>>
        var showParams = function() {
            return function() {
                var obj = sceneController.getSelectedObject();
                var style = obj.lineStyle;

                $("#inputLineColor").val(style.color);
                $("#inputLineWidth").val(style.width);

                if (obj.getRadius) {
                    $("#inputAreaRadius").show();
                    $("#inputRadius").val(obj.getRadius());
                    sceneController.scene.draw(context);
                } else {
                    $("#inputAreaRadius").hide();
                }

                if (obj.x_formula) {
                    $("#inputX").val(obj.x_formula);
                }
                if (obj.y_formula) {
                    $("#inputY").val(obj.y_formula);
                }
                if (obj.t_min !== undefined) {
                    $("#inputTMin").val(obj.t_min);
                }
                if (obj.t_max !== undefined) {
                    $("#inputTMax").val(obj.t_max);
                }
                if (obj.segments) {
                    $("#inputSegments").val(obj.segments);
                }

            };
        };

        // TODO: Dok it!
        sceneController.onSelection(showParams());
        sceneController.onObjChange(showParams());

        /*
         * TODO: Dok it!
         */
        $("#inputAreaRadius").hide();

        
    })); // $(document).ready()

})); // define module
        

