/*
  *
 * Module scene: Computergrafik 2, Aufgabe 2
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 */


/* requireJS module definition */
define(["gl-matrix", "program", "shaders", "models/band", "models/triangle", "models/cube",
        "models/parametric"], 
       (function(glmatrix, Program, shaders, Band, Triangle, Cube, ParametricSurface ) {

    "use strict";
    
    // simple scene: create some scene objects in the constructor, and
    // draw them in the draw() method
    var Scene = function(gl) {

        // store the WebGL rendering context 
        this.gl = gl;  
            
        // create all required GPU programs from vertex and fragment shaders
        this.programs = {};
        this.programs.red = new Program(gl, 
                                        shaders.getVertexShader("red"), 
                                        shaders.getFragmentShader("red") );
        this.programs.vertexColor = new Program(gl, 
                                                shaders.getVertexShader("vertex_color"), 
                                                shaders.getFragmentShader("vertex_color") );
        this.programs.black = new Program(gl, 
                                          shaders.getVertexShader("unicolor"), 
                                          shaders.getFragmentShader("unicolor") );

        
        // create some objects to be drawn in this scene
        this.triangle  = new Triangle(gl);
        // this.triangle  = new Triangle(gl, { "drawStyle": "lines" });
        this.cube      = new Cube(gl);
        // this.cube      = new Cube(gl, { "drawStyle": "faces" });
        this.bandSolid  = new Band(gl, {height: 0.4, drawStyle: "faces"});
        this.bandWiref  = new Band(gl, {height: 0.4, drawStyle: "lines"});

        // create a parametric surface to be drawn in this scene
        var positionFunc = function(u,v) {
            return [ 0.5 * Math.sin(u) * Math.cos(v),
                     0.3 * Math.sin(u) * Math.sin(v),
                     0.9 * Math.cos(u) ];
        }; // ellipsoid
        // var positionFunc = function(u,v) {
        //     return [ 0.9 * Math.sin(u) * Math.cos(v),
        //              0.9 * Math.sin(u) * Math.sin(v),
        //              0.9 * Math.cos(u) ];
        // }; // sphere
        // var positionFunc = function(u,v) {
        //     return [ 0.1 * u,
        //              0.1 * v,
        //              0.5 ];
        // }; // grid
        var config = {
            "uMin": -Math.PI, 
            "uMax":  Math.PI, 
            "vMin": -Math.PI/2, // -Math.PI / 2  <-- besser ???
            "vMax":  Math.PI/2, //  Math.PI / 2  <-- besser ???
            "uSegments": 40,
            "vSegments": 20,
            // "uSegments": 4,
            // "vSegments": 2, 
            "drawStyle": "faces"
        };
        this.ellipsoidSolid = new ParametricSurface(gl, positionFunc, config);
        config.drawStyle = "lines";
        this.ellipsoidWiref = new ParametricSurface(gl, positionFunc, config);

        // initial position of the camera
        this.cameraTransformation = mat4.lookAt([0,0.5,3], [0,0,0], [0,1,0]);

        // transformation of the scene, to be changed by animation
        this.transformation = mat4.create(this.cameraTransformation);

        // the scene has an attribute "drawOptions" that is used by 
        // the HtmlController. Each attribute in this.drawOptions 
        // automatically generates a corresponding checkbox in the UI.
        this.drawOptions = { "Perspective Projection": false, 
                             "Show Triangle": false,
                             "Show Cube": false,
                             "Show Solid Band": false,
                             "Show Wireframe Band": false,
                             "Show Solid Ellipsoid": true, 
                             "Show Wireframe Ellipsoid": true
                             };                       
    };

    // the scene's draw method draws whatever the scene wants to draw
    Scene.prototype.draw = function() {
        
        // just a shortcut
        var gl = this.gl;

        // prevent Z fighting
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0);


        // set up the projection matrix, depending on the canvas size
        var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
        var projection = this.drawOptions["Perspective Projection"] ?
                             mat4.perspective(45, aspectRatio, 0.01, 100) : 
                             mat4.ortho(-aspectRatio, aspectRatio, -1,1, 0.01, 100);


        var uniColorBlack = [0, 0, 0, 1];

        // set the uniform variables for all used programs
        for(var p in this.programs) {
            this.programs[p].use();
            this.programs[p].setUniform("projectionMatrix", "mat4", projection);
            this.programs[p].setUniform("modelViewMatrix", "mat4", this.transformation);
            this.programs[p].setUniform("uniColor", "vec4", uniColorBlack);
        }
        
        // clear color and depth buffers
        gl.clearColor(0.7, 0.7, 0.7, 1.0); 
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
            
        // set up depth test to discard occluded fragments
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);  
                
        // draw the scene objects
        if(this.drawOptions["Show Triangle"]) {    
            // this.triangle.draw(gl, this.programs.red);
            this.triangle.draw(gl, this.programs.vertexColor);
        }
        if(this.drawOptions["Show Cube"]) {    
            // this.cube.draw(gl, this.programs.red);
            this.cube.draw(gl, this.programs.vertexColor);
        }
        if(this.drawOptions["Show Solid Band"]) { 
            this.bandSolid.draw(gl, this.programs.red);
        }
        if(this.drawOptions["Show Wireframe Band"]) { 
            this.bandWiref.draw(gl, this.programs.black);
        }
        if(this.drawOptions["Show Solid Ellipsoid"]) { 
            this.ellipsoidSolid.draw(gl, this.programs.red);
        }
        if(this.drawOptions["Show Wireframe Ellipsoid"]) { 
            this.ellipsoidWiref.draw(gl, this.programs.black);
        }
    };

    // the scene's rotate method is called from HtmlController, when certain
    // keyboard keys are pressed. Try Y and Shift-Y, for example.
    Scene.prototype.rotate = function(rotationAxis, angle) {

        // window.console.log("rotating around " + rotationAxis + " by " + angle + " degrees." );

        // degrees to radians
        angle = angle*Math.PI/180;
        
        // manipulate the corresponding matrix, depending on the name of the joint
        switch(rotationAxis) {
            case "worldY": 
                mat4.rotate(this.transformation, angle, [0,1,0]);
                break;
            case "worldX": 
                mat4.rotate(this.transformation, angle, [1,0,0]);
                break;
            default:
                window.console.log("axis " + rotationAxis + " not implemented.");
            break;
        };

        // redraw the scene
        this.draw();
    }

    return Scene;            
    
})); // define module
        

