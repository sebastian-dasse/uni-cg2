/*
 *
 * Module scene: Computergrafik 2, Aufgabe 2
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 */


/* requireJS module definition */
define(["gl-matrix", "program", "shaders", "models/band", "models/triangle", "models/cube",
        "models/parametric", "models/robot"], 
       (function(glmatrix, Program, shaders, Band, Triangle, Cube, ParametricSurface, Robot ) {

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
        this.programs.uniColor = new Program(gl, 
                                             shaders.getVertexShader("unicolor"), 
                                             shaders.getFragmentShader("unicolor") );

        
        
        // create some objects to be drawn in this scene

        this.triangle  = new Triangle(gl);
        // this.triangle  = new Triangle(gl, { "drawStyle": "lines" });
        this.cube      = new Cube(gl);
        // this.cube      = new Cube(gl, { "drawStyle": "faces" });
        this.bandSolid  = new Band(gl, {height: 0.4, drawStyle: "faces"});
        this.bandWiref  = new Band(gl, {height: 0.4, drawStyle: "lines"});

        //-- ellipsoid --
        var ellipsoidPositionFunc = function(u,v) {
            return [ 0.5 * Math.sin(u) * Math.cos(v),
                     0.3 * Math.sin(u) * Math.sin(v),
                     0.9 * Math.cos(u) ];
        };
        // var ellipsoidPositionFunc = function(u,v) {
        //     return [ 0.9 * Math.sin(u) * Math.cos(v),
        //              0.9 * Math.sin(u) * Math.sin(v),
        //              0.9 * Math.cos(u) ];
        // }; // sphere
        // var ellipsoidPositionFunc = function(u,v) {
        //     return [ 0.1 * u,
        //              0.1 * v,
        //              0.5 ];
        // }; // grid
        var ellipsoidConfig = {
            "uMin": -Math.PI, 
            "uMax":  Math.PI, 
            "vMin": -Math.PI/2,
            "vMax":  Math.PI/2,
            "uSegments": 40,
            "vSegments": 20,
            // "uSegments": 4,
            // "vSegments": 2, 
            // "drawStyle": "faces"
        };
        ellipsoidConfig.drawStyle = "faces";
        this.ellipsoidSolid = new ParametricSurface(gl, ellipsoidPositionFunc, ellipsoidConfig);
        ellipsoidConfig.drawStyle = "lines";
        this.ellipsoidWiref = new ParametricSurface(gl, ellipsoidPositionFunc, ellipsoidConfig);

        //-- pillow -
        var pillowPositionFunc = function(u,v) {
            var pillowWidth = 0.5;
            return [ 0.3 * Math.cos(u),
                     0.3 * Math.cos(v),
                     0.3 * pillowWidth * Math.sin(u)*Math.sin(v) ];
        };
        var pillowConfig = {
            "uMin":  0, 
            "uMax":  Math.PI, 
            "vMin": -Math.PI,
            "vMax":  Math.PI,
            "uSegments": 40,
            "vSegments": 20
        };
        pillowConfig.drawStyle = "faces";
        this.pillowSolid = new ParametricSurface(gl, pillowPositionFunc, pillowConfig);
        pillowConfig.drawStyle = "lines";
        this.pillowWiref = new ParametricSurface(gl, pillowPositionFunc, pillowConfig);

        //-- torus --
        var torusPositionFunc = function(u,v) {
            var r0 = 0.5;  // the main radius of the torus
            var r1 = r0/2; // the thickness of the torus
            return [ 1 * (r0 + r1 * Math.cos(v)) * Math.cos(u),
                     1 * (r0 + r1 * Math.cos(v)) * Math.sin(u),
                     1 * r1 * Math.sin(v) ];
        };
        var torusConfig = {
            "uMin": -Math.PI, 
            "uMax":  Math.PI, 
            "vMin": -Math.PI,
            "vMax":  Math.PI, 
            "uSegments": 40,
            "vSegments": 20
        };
        torusConfig.drawStyle = "faces";
        this.torusSolid = new ParametricSurface(gl, torusPositionFunc, torusConfig);
        torusConfig.drawStyle = "lines";
        this.torusWiref = new ParametricSurface(gl, torusPositionFunc, torusConfig);

        //-- monkey saddle --
        var monkeySaddlePositionFunc = function(u,v) {
            return [ 0.5 * u,
                     0.5 * v,
                     0.5 * (u*u*u - 3*u*v*v) ];
        };
        var monkeySaddleConfig = {
            "uMin": -1, 
            "uMax":  1, 
            "vMin": -1,
            "vMax":  1,
            "uSegments": 40,
            "vSegments": 20
        };
        monkeySaddleConfig.drawStyle = "faces";
        this.monkeySaddleSolid = new ParametricSurface(gl, monkeySaddlePositionFunc, monkeySaddleConfig);
        monkeySaddleConfig.drawStyle = "lines";
        this.monkeySaddleWiref = new ParametricSurface(gl, monkeySaddlePositionFunc, monkeySaddleConfig);

        //-- wellenkugel --
        var wellenkugelPositionFunc = function(u,v) {
            return [ 0.05 * u * Math.cos(Math.cos(u)) * Math.cos(v),
                     0.05 * u * Math.cos(Math.cos(u)) * Math.sin(v),
                     0.05 * u * Math.sin(Math.cos(u)) ];
        };
        var wellenkugelConfig = {
            "uMin": 0, 
            "uMax": 14.5, 
            "vMin": 0,
            "vMax": Math.PI,
            "uSegments": 100,
            "vSegments": 50
        };
        wellenkugelConfig.drawStyle = "faces";
        this.wellenkugelSolid = new ParametricSurface(gl, wellenkugelPositionFunc, wellenkugelConfig);
        wellenkugelConfig.drawStyle = "lines";
        this.wellenkugelWiref = new ParametricSurface(gl, wellenkugelPositionFunc, wellenkugelConfig);

        //-- tranguloid trefoil -
        var tranguloidTrefoilPositionFunc = function(u,v) {
            return [ 0.2 * 2 * Math.sin(3 * u) / (2 + Math.cos(v)),
                     0.2 * 2 * (Math.sin(u) + 2 * Math.sin(2 * u)) / (2 + Math.cos(v + 2 * Math.PI/3)),
                     0.2 * (Math.cos(u) - 2 * Math.cos(2 * u)) * (2 + Math.cos(v)) * (2 * Math.cos(v + 2 * Math.PI/3)) / 4 ];
        };
        var tranguloidTrefoilConfig = {
            "uMin": -Math.PI, 
            "uMax":  Math.PI, 
            "vMin": -Math.PI,
            "vMax":  Math.PI,
            "uSegments": 200,
            "vSegments": 100
        };
        tranguloidTrefoilConfig.drawStyle = "faces";
        this.tranguloidTrefoilSolid = new ParametricSurface(gl, tranguloidTrefoilPositionFunc, tranguloidTrefoilConfig);
        tranguloidTrefoilConfig.drawStyle = "lines";
        this.tranguloidTrefoilWiref = new ParametricSurface(gl, tranguloidTrefoilPositionFunc, tranguloidTrefoilConfig);
        
        //-- schnecke --
        var schneckePositionFunc = function(u,v) {
            var a = 2.4;
            var b = 3.2;
            var h = Math.pow(Math.E, u / (6 * Math.PI));
            return [ 0.15 * a * (1 - h) * Math.cos(u) * Math.cos( 0.5 * v) * Math.cos(0.5 * v),
                     0.15 * (1 - Math.pow(Math.E, u / (b * Math.PI)) - Math.sin(v) + h * Math.sin(v))     + 0.5,
                     0.15 * a * (-1 + h) * Math.sin(u) * Math.cos(0.5 * v) * Math.cos(0.5 * v) ];
        };
        var schneckeConfig = {
            "uMin": 0.0001, 
            "uMax": 6 * Math.PI, 
            "vMin": 0,
            "vMax": Math.PI,
            "uSegments": 100,
            "vSegments": 50
        };
        schneckeConfig.drawStyle = "faces";
        this.schneckeSolid = new ParametricSurface(gl, schneckePositionFunc, schneckeConfig);
        schneckeConfig.drawStyle = "lines";
        this.schneckeWiref = new ParametricSurface(gl, schneckePositionFunc, schneckeConfig);

        //-- robot --
        this.robot = new Robot(gl, this.programs);


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
                             "Show Wiref Band": false,
                             "Show Solid Ellipsoid": false, 
                             "Show Wiref Ellipsoid": false, 
                             "Show Pillow": false, 
                             "Show Torus": false, 
                             "Show Monkey Saddle": false, 
                             "Show Wellenkugel": false, 
                             "Show Tranguloid Trefoil": false, 
                             "Show Schnecke": false, 
                             "Show Robot": true
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


        // set the uniform variables for all used programs
        for(var p in this.programs) {
            this.programs[p].use();
            this.programs[p].setUniform("projectionMatrix", "mat4", projection);
            this.programs[p].setUniform("modelViewMatrix", "mat4", this.transformation);
            this.programs[p].setUniform("uniColor", "vec4", [0, 0, 0, 1]); // set uniColor to black
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
        if(this.drawOptions["Show Wiref Band"]) { 
            this.bandWiref.draw(gl, this.programs.uniColor);
        }
        if(this.drawOptions["Show Solid Ellipsoid"]) { 
            this.ellipsoidSolid.draw(gl, this.programs.red);
        }
        if(this.drawOptions["Show Wiref Ellipsoid"]) { 
            this.ellipsoidWiref.draw(gl, this.programs.uniColor);
        }        
        if(this.drawOptions["Show Pillow"]) { 
            this.pillowSolid.draw(gl, this.programs.red);
            this.pillowWiref.draw(gl, this.programs.uniColor);
        }
        if(this.drawOptions["Show Torus"]) { 
            this.torusSolid.draw(gl, this.programs.red);
            this.torusWiref.draw(gl, this.programs.uniColor);
        }
        if(this.drawOptions["Show Monkey Saddle"]) { 
            this.monkeySaddleSolid.draw(gl, this.programs.red);
            this.monkeySaddleWiref.draw(gl, this.programs.uniColor);
        }
        if(this.drawOptions["Show Wellenkugel"]) { 
            this.wellenkugelSolid.draw(gl, this.programs.red);
            this.wellenkugelWiref.draw(gl, this.programs.uniColor);
        }
        if(this.drawOptions["Show Tranguloid Trefoil"]) { 
            this.tranguloidTrefoilSolid.draw(gl, this.programs.red);
            this.tranguloidTrefoilWiref.draw(gl, this.programs.uniColor);
        }
        if(this.drawOptions["Show Schnecke"]) { 
            this.schneckeSolid.draw(gl, this.programs.red);
            this.schneckeWiref.draw(gl, this.programs.uniColor);
        }
        if(this.drawOptions["Show Robot"]) { 
            this.robot.draw(gl, undefined, this.transformation);
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
            case "worldX": 
                mat4.rotate(this.transformation, angle, [1,0,0]);
                break;
            case "worldY": 
                mat4.rotate(this.transformation, angle, [0,1,0]);
                break;
            case "worldZ": 
                mat4.rotate(this.transformation, angle, [0,0,1]);
                break;
            case "worldScale": 
                var s = 1 + angle;
                mat4.scale(this.transformation, [s, s, s]);
                break;
            case "armUpperRX": 
            case "armUpperRZ": 
            case "armLowerRX": 
            case "handRY": 
            case "handRGrab": 
            case "armUpperLX": 
            case "armUpperLZ": 
            case "armLowerLX": 
            case "handLY": 
            case "handLGrab": 
            case "headY": 
            case "eyesZ": 
            case "eyesScaleZ": 
                this.robot.rotate(rotationAxis, angle);
                break;
            case "resetWorld": 
                this.transformation = mat4.create(this.cameraTransformation);
                break;
            case "resetRobot": 
                this.robot = new Robot(this.gl, this.programs);
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
        

