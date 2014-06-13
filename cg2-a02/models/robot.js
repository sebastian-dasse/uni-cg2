/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Robot
 *
 * The Robot ...
 * *
 */


/* requireJS module definition */
define(["scene_node", "gl-matrix", "models/band", "models/cube", "models/parametric", "models/triangle"], 
       (function(SceneNode, glmatrix, Band, Cube, ParametricSurface, Triangle) {
       
    "use strict";
    
    // constructor, takes WebGL context object as argument
    var Robot = function(gl, programs, config) {
        
        // read the configuration parameters
        config = config || {};
        // this.drawStyle = config.drawStyle || "faces";

        if (!programs) console.log("no programs");
        if (!programs.red) console.log("no programs.red");
        if (!programs.vertexColor) console.log("no programs.vertexColor");
        if (!programs.black) console.log("no programs.black");


        // components for the robot
        var triangle = new Triangle(gl);
        var cube = new Cube(gl);
        var band = new Band(gl);
        var bandSolid  = new Band(gl, {radius: 0.5, height: 1, drawStyle: "faces"});
        var bandWiref  = new Band(gl, {radius: 0.5, height: 1, drawStyle: "lines"});
        
        var ellipsoidPositionFunc = function(u,v) {
            return [ 0.5 * Math.sin(u) * Math.cos(v),
                     0.3 * Math.sin(u) * Math.sin(v),
                     0.9 * Math.cos(u) ];
        };
        var ellipoidConfig = {
            "uMin": -Math.PI, 
            "uMax":  Math.PI, 
            "vMin": -Math.PI/2, 
            "vMax":  Math.PI/2, 
            "uSegments": 40, 
            "vSegments": 20
        };
        ellipoidConfig.drawStyle = "faces";
        this.ellipsoidSolid = new ParametricSurface(gl, ellipsoidPositionFunc, ellipoidConfig);
        ellipoidConfig.drawStyle = "lines";
        this.ellipsoidWiref = new ParametricSurface(gl, ellipsoidPositionFunc, ellipoidConfig);
        

        // dimensions for the parts of the robot
        var s = 1; // the scale of the entire robot
        var torsoSize = [0.6*s, 1.0*s, 0.4*s];
        var headSize = [torsoSize[0]/2, torsoSize[1]*0.35, torsoSize[2]];
        var shoulderSize = [torsoSize[0]/4, torsoSize[0]/4, torsoSize[0]/4];
        var eyeOutsideSize = [];
        var eyeInsideSize = [];
        var neckSize = [];
        var armUpperSize = [];
        var armLowerSize = [];
        var elbowSize = [];
        var wristSize = [];
        var finger1Size = [];
        var finger2Size = [];

        // skeleton for the robot
        this.eyeOutside = new SceneNode("eye outside");
        this.eyeInside = new SceneNode("eye inside");
        this.neck = new SceneNode("neck");
        this.armUpper = new SceneNode("arm upper");
        this.armLower = new SceneNode("arm lower");
        this.elbow = new SceneNode("elbow");
        this.wrist = new SceneNode("wrist");
        this.finger1 = new SceneNode("finger1");
        this.finger2 = new SceneNode("finger2");


        this.shoulder = new SceneNode("shoulder");
        mat4.translate(this.shoulder.transform(), [ -1*(torsoSize[0]/2 + shoulderSize[1]/2), torsoSize[1]/3, 0]);

        this.head = new SceneNode("head");
        mat4.translate(this.head.transform(), [0, torsoSize[1]/2+headSize[1]/2, 0]);

        this.torso = new SceneNode("torso");
        this.torso.add(this.head);
        this.torso.add(this.shoulder);

        // skins for the robot
        var torsoSkin = new SceneNode("torso skin");
        torsoSkin.add(cube, programs.vertexColor);
        mat4.scale(torsoSkin.transform(), torsoSize);
        
        var headSkin = new SceneNode("head skin");
        headSkin.add(cube, programs.vertexColor);
        mat4.rotate(headSkin.transform(), 0.6 * Math.PI, [0, 1, 0]);
        mat4.scale(headSkin.transform(), headSize);

        var shoulderSkin = new SceneNode("shoulder skin");
        shoulderSkin.add(bandSolid, programs.red);
        shoulderSkin.add(bandWiref, programs.black);
        mat4.rotate(shoulderSkin.transform(), 0.5 * Math.PI, [0, 0, 1]);
        mat4.scale(shoulderSkin.transform(), shoulderSize);

        // attach skins to skeleton
        this.torso.add(torsoSkin);
        this.head.add(headSkin);
        this.shoulder.add(shoulderSkin);

    };

    // draw method: activate buffers and issue WebGL draw() method
    Robot.prototype.draw = function(gl, program, transformation) {

        // delegate draw to the scene nodes


        this.torso.draw(gl, program, transformation);
    };
        
    // this module only returns the constructor function    
    return Robot;

})); // define

    
