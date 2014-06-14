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
        var bandSolid  = new Band(gl, {radius: 0.5, height: 1, drawStyle: "faces"});
        var bandWiref  = new Band(gl, {radius: 0.5, height: 1, drawStyle: "lines"});
        
        var ellipsoidPositionFunc = function(u,v) {
            return [ 0.5 * Math.sin(u) * Math.cos(v),
                     0.5 * Math.sin(u) * Math.sin(v),
                     0.5 * Math.cos(u) ];
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
        var ellipsoidSolid = new ParametricSurface(gl, ellipsoidPositionFunc, ellipoidConfig);
        ellipoidConfig.drawStyle = "lines";
        var ellipsoidWiref = new ParametricSurface(gl, ellipsoidPositionFunc, ellipoidConfig);
        

        //-- dimensions for the parts of the robot ------------
        var s = 1; // the scale of the entire robot
        var torsoSize = [0.6*s, 1.0*s, 0.4*s];
        var neckSize = [torsoSize[0]*0.45, torsoSize[1]*0.05, torsoSize[2]*0.9];
        var headSize = [torsoSize[0]*0.6, torsoSize[1]*0.35, torsoSize[2]];
        var shoulderSize = [torsoSize[0]/4, torsoSize[0]/4, torsoSize[0]/4];
        var eyeOutsideSize = [0.35*headSize[1], 0.35*headSize[1], headSize[0]/10];
        var eyeInsideSize = [0.6*eyeOutsideSize[0], 0.6*eyeOutsideSize[0], 0.6*eyeOutsideSize[0]];
        var armUpperSize = [];
        var armLowerSize = [];
        var elbowSize = [];
        var wristSize = [];
        var finger1Size = [];
        var finger2Size = [];

        // // positions for the main parts of the robot
        // var headPos = [0, torsoSize[1]/2+headSize[1]/2, 0];

        //-- skeleton for the robot ------------
        this.armLower = new SceneNode("arm lower");
        this.elbow = new SceneNode("elbow");
        this.wrist = new SceneNode("wrist");
        this.finger1 = new SceneNode("finger1");
        this.finger2 = new SceneNode("finger2");

        
        this.eyeInsideR = new SceneNode("eye inside right");
        mat4.translate(this.eyeInsideR.transform(), [0, 0, -eyeOutsideSize[2]/2]);

        this.eyeOutsideR = new SceneNode("eye outside right");
        mat4.translate(this.eyeOutsideR.transform(), [ -headSize[2]/4, headSize[1]/6, headSize[0]/2 + eyeOutsideSize[2]/2]);
        this.eyeOutsideR.add(this.eyeInsideR);


        // this.armUpperR = new SceneNode("arm upper right");
        // mat4.translate(this.armUpperR.transform(), [ -(torsoSize[0]/2 + shoulderSize[1]/2), torsoSize[1]/3, 0]);

        this.shoulderR = new SceneNode("shoulder right");
        mat4.translate(this.shoulderR.transform(), [ -(torsoSize[0]/2 + shoulderSize[1]/2), torsoSize[1]/3, 0]);

        this.head = new SceneNode("head");
        mat4.translate(this.head.transform(), [0, neckSize[1]/2+headSize[1]/2, 0]);
        this.head.add(this.eyeOutsideR);

        this.neck = new SceneNode("neck");
        mat4.translate(this.neck.transform(), [0, torsoSize[1]/2+neckSize[1]/2, 0]);
        mat4.rotate(this.neck.transform(), 0.1 * Math.PI, [0, 1, 0]); // turn the neck with the head slightly to the left

        this.torso = new SceneNode("torso");
        // mat4.scale(this.torso.transform(), [0.5, 0.5, 0.5]); // scale the whole robot
        // mat4.scale(this.torso.transform(), [1.2, 1.2, 1.2]); // scale the whole robot
        this.torso.add(this.neck);
        this.neck.add(this.head);
        this.torso.add(this.shoulderR);

        //-- skins for the robot ------------
        var torsoSkin = new SceneNode("torso skin");
        torsoSkin.add(cube, programs.vertexColor);
        mat4.scale(torsoSkin.transform(), torsoSize);
        
        var neckSkin = new SceneNode("neck skin");
        neckSkin.add(bandSolid, programs.red);
        neckSkin.add(bandWiref, programs.black);
        mat4.scale(neckSkin.transform(), neckSize);

        var headSkin = new SceneNode("head skin");
        headSkin.add(cube, programs.vertexColor); // >>>>>>>>>>>>>>>>>>>>> TODO: put back in
        mat4.rotate(headSkin.transform(), 0.5 * Math.PI, [0, 1, 0]);
        mat4.scale(headSkin.transform(), headSize);

        var eyeOutsideSkin = new SceneNode("eye outside");
        eyeOutsideSkin.add(bandSolid, programs.red);
        eyeOutsideSkin.add(bandWiref, programs.black);
        mat4.scale(eyeOutsideSkin.transform(), eyeOutsideSize);
        mat4.rotate(eyeOutsideSkin.transform(), Math.PI/2, [1, 0, 0]);

        var eyeInsideSkin = new SceneNode("eye inside");
        eyeInsideSkin.add(ellipsoidSolid, programs.red);
        // eyeInsideSkin.add(ellipsoidWiref, programs.black);
        mat4.scale(eyeInsideSkin.transform(), eyeInsideSize);
        // mat4.rotate(eyeInsideSkin.transform(), Math.PI/2, [1, 0, 0]);

        var shoulderSkinR = new SceneNode("shoulder skin");
        shoulderSkinR.add(bandSolid, programs.black);
        shoulderSkinR.add(bandWiref, programs.red);
        mat4.rotate(shoulderSkinR.transform(), 0.5 * Math.PI, [0, 0, 1]);
        mat4.scale(shoulderSkinR.transform(), shoulderSize);

        //-- attach skins to skeleton ------------
        this.torso.add(torsoSkin);
        this.neck.add(neckSkin);
        this.head.add(headSkin);
        this.eyeOutsideR.add(eyeOutsideSkin);
        this.eyeInsideR.add(eyeInsideSkin);
        this.shoulderR.add(shoulderSkinR);

    };

    // draw method: activate buffers and issue WebGL draw() method
    Robot.prototype.draw = function(gl, program, transformation) {

        // delegate draw to the scene nodes


        this.torso.draw(gl, program, transformation);
    };
        
    // this module only returns the constructor function    
    return Robot;

})); // define

    
