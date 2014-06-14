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
            "uSegments": 10, 
            "vSegments":  5
        };
        ellipoidConfig.drawStyle = "faces";
        var ellipsoidSolid = new ParametricSurface(gl, ellipsoidPositionFunc, ellipoidConfig);
        ellipoidConfig.drawStyle = "lines";
        var ellipsoidWiref = new ParametricSurface(gl, ellipsoidPositionFunc, ellipoidConfig);

        var torusConfig = {
            "uMin": -Math.PI, 
            "uMax":  Math.PI, 
            "vMin": -Math.PI,
            "vMax":  Math.PI, 
            "uSegments": 20,
            "vSegments": 10
        };
        var torusPositionFunc = function(u,v) {
            var r0 = 0.5;  // the main radius of the torus
            var r1 = r0/2; // the thickness of the torus
            return [ 1 * (r0 + r1 * Math.cos(v)) * Math.cos(u),
                     1 * (r0 + r1 * Math.cos(v)) * Math.sin(u),
                     1 * r1 * Math.sin(v) ];
        };
        torusConfig.drawStyle = "faces";
        var torusSolid = new ParametricSurface(gl, torusPositionFunc, torusConfig);
        torusConfig.drawStyle = "lines";
        var torusWiref = new ParametricSurface(gl, torusPositionFunc, torusConfig);

        var trangTrefPositionFunc = function(u,v) {
            return [ 0.2 * 2 * Math.sin(3 * u) / (2 + Math.cos(v)),
                     0.2 * 2 * (Math.sin(u) + 2 * Math.sin(2 * u)) / (2 + Math.cos(v + 2 * Math.PI/3)),
                     0.2 * (Math.cos(u) - 2 * Math.cos(2 * u)) * (2 + Math.cos(v)) * (2 * Math.cos(v + 2 * Math.PI/3)) / 4 ];
        };
        var trangTrefConfig = {
            "uMin": -Math.PI, 
            "uMax":  Math.PI, 
            "vMin": -Math.PI,
            "vMax":  Math.PI,
            "uSegments":  75,
            "vSegments":  50
        };
        trangTrefConfig.drawStyle = "faces";
        var trangTrefSolid = new ParametricSurface(gl, trangTrefPositionFunc, trangTrefConfig);
        trangTrefConfig.drawStyle = "lines";
        var trangTrefWiref = new ParametricSurface(gl, trangTrefPositionFunc, trangTrefConfig);
        


        //-- dimensions for the parts of the robot ------------
        var s = 1; // the scale of the entire robot
        var torsoSize = [0.6*s, 1.0*s, 0.4*s];
        var neckSize = [torsoSize[0]*0.45, torsoSize[1]*0.05, torsoSize[2]*0.9];
        var headSize = [torsoSize[0]*0.6, torsoSize[1]*0.35, torsoSize[2]];
        var eyeOuterSize = [0.35*headSize[1], 0.35*headSize[1], headSize[0]/10];
        var eyeInnerSize = [0.6*eyeOuterSize[0], 0.6*eyeOuterSize[0], 0.6*eyeOuterSize[0]];
        var shoulderSize = [torsoSize[0]/3, torsoSize[0]/3, torsoSize[0]/3];
        var armUpperSize = [1.2*shoulderSize[0], torsoSize[1]/2, 1.2*shoulderSize[0]];
        var elbowSize = [shoulderSize[0], shoulderSize[1], shoulderSize[2]];
        var armLowerSize = [0.9*armUpperSize[0], 0.9*armUpperSize[1], 0.9*armUpperSize[0]];
        this.wristSize = [elbowSize[0], elbowSize[1], elbowSize[2]];
        var fingerSize = [this.wristSize[1]/4, this.wristSize[0], this.wristSize[2]];
        var hatSize = [5*headSize[2], headSize[1], headSize[2]];



        //-- skeleton for the robot ------------
        this.hat = new SceneNode("hat");
        // mat4.translate(this.hat.transform(), [0, headSize[1]/2 + hatSize[1]/2, 0]);
        mat4.translate(this.hat.transform(), [0, headSize[1]/2, 0]);

        this.eyeInnerL = new SceneNode("eye inner left");
        mat4.translate(this.eyeInnerL.transform(), [0, 0, -eyeOuterSize[2]/2]);

        this.eyeOuterL = new SceneNode("eye outer left");
        mat4.translate(this.eyeOuterL.transform(), [ +headSize[2]/4, headSize[1]/6, headSize[0]/2 + eyeOuterSize[2]/2]);
        this.eyeOuterL.add(this.eyeInnerL);

        this.eyeInnerR = new SceneNode("eye inner right");
        mat4.translate(this.eyeInnerR.transform(), [0, 0, -eyeOuterSize[2]/2]);

        this.eyeOuterR = new SceneNode("eye outer right");
        mat4.translate(this.eyeOuterR.transform(), [ -headSize[2]/4, headSize[1]/6, headSize[0]/2 + eyeOuterSize[2]/2]);
        this.eyeOuterR.add(this.eyeInnerR);

        this.head = new SceneNode("head");
        mat4.translate(this.head.transform(), [0, neckSize[1]/2+headSize[1]/2, 0]);
        this.head.add(this.eyeOuterR);
        this.head.add(this.eyeOuterL);
        this.head.add(this.hat);

        this.neck = new SceneNode("neck");
        mat4.translate(this.neck.transform(), [0, torsoSize[1]/2+neckSize[1]/2, 0]);
        // mat4.rotate(this.neck.transform(), 0.1 * Math.PI, [0, 1, 0]); // turn the neck with the head slightly to the left
        this.neck.add(this.head);


        this.finger1R = new SceneNode("finger 1 right");
        mat4.translate(this.finger1R.transform(), [ -this.wristSize[0]/2 + fingerSize[0]/2, -fingerSize[1]/2, 0]);

        this.finger2R = new SceneNode("finger 2 right");
        mat4.translate(this.finger2R.transform(), [ +this.wristSize[0]/2 - fingerSize[0]/2, -fingerSize[1]/2, 0]);
        
        this.wristR = new SceneNode("wrist right");
        mat4.translate(this.wristR.transform(), [ 0, -armLowerSize[1]/2, 0]);
        this.wristR.add(this.finger1R);
        this.wristR.add(this.finger2R);
// 
        this.armLowerR = new SceneNode("arm lower right");
        mat4.translate(this.armLowerR.transform(), [ 0, -armLowerSize[1]/2, 0]);
        this.armLowerR.add(this.wristR);
        
        this.elbowR = new SceneNode("elbow right");
        mat4.translate(this.elbowR.transform(), [ 0, -armUpperSize[1]/2, 0]);
        this.elbowR.add(this.armLowerR);
        
        this.armUpperR = new SceneNode("arm upper right");
        mat4.translate(this.armUpperR.transform(), [ 0, -armUpperSize[1]/2, 0]);
        this.armUpperR.add(this.elbowR);

        this.armR = new SceneNode("arm right");
        mat4.translate(this.armR.transform(), [ -shoulderSize[0]/2, 0, 0]);
        this.armR.add(this.armUpperR);

        this.shoulderR = new SceneNode("shoulder right");
        mat4.translate(this.shoulderR.transform(), [ -(torsoSize[0]/2 + shoulderSize[1]/2), 0.375*torsoSize[1], 0]);
        this.shoulderR.add(this.armR);


        this.torso = new SceneNode("torso");
        mat4.translate(this.torso.transform(), [ 0, -0.2*torsoSize[1], 0]);
        // mat4.scale(this.torso.transform(), [0.5, 0.5, 0.5]); // scale the whole robot <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        // mat4.scale(this.torso.transform(), [1.2, 1.2, 1.2]); // scale the whole robot
        this.torso.add(this.neck);
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
        // headSkin.add(cube, programs.vertexColor);
        headSkin.add(ellipsoidSolid, programs.red);
        // headSkin.add(ellipsoidWiref, programs.black);
        mat4.rotate(headSkin.transform(), 0.5 * Math.PI, [0, 1, 0]);
        mat4.scale(headSkin.transform(), headSize);

        var eyeOuterSkin = new SceneNode("eye outer");
        eyeOuterSkin.add(bandSolid, programs.red);
        eyeOuterSkin.add(bandWiref, programs.black);
        mat4.scale(eyeOuterSkin.transform(), eyeOuterSize);
        mat4.rotate(eyeOuterSkin.transform(), Math.PI/2, [1, 0, 0]);

        var eyeInnerSkin = new SceneNode("eye inner");
        eyeInnerSkin.add(ellipsoidSolid, programs.red);
        eyeInnerSkin.add(ellipsoidWiref, programs.black);
        mat4.scale(eyeInnerSkin.transform(), eyeInnerSize);
        // mat4.rotate(eyeInnerSkin.transform(), Math.PI/2, [1, 0, 0]);

        var shoulderSkin = new SceneNode("shoulder skin");
        shoulderSkin.add(bandSolid, programs.black);
        shoulderSkin.add(bandWiref, programs.red);
        mat4.rotate(shoulderSkin.transform(), 0.5 * Math.PI, [0, 0, 1]);
        mat4.scale(shoulderSkin.transform(), shoulderSize);

        var armUpperSkin = new SceneNode("arm upper skin");
        armUpperSkin.add(ellipsoidSolid, programs.black);
        armUpperSkin.add(ellipsoidWiref, programs.red);
        // armUpperSkin.add(cube, programs.vertexColor);
        mat4.scale(armUpperSkin.transform(), armUpperSize);
        mat4.rotate(armUpperSkin.transform(), 0.5 * Math.PI, [1, 0, 0]);

        var armJointSkin = new SceneNode("arm joint skin"); // used by multiple skeleton nodes  
        armJointSkin.add(ellipsoidSolid, programs.red);
        armJointSkin.add(ellipsoidWiref, programs.black);
        mat4.rotate(armJointSkin.transform(), 0.5 * Math.PI, [0, 1, 0]);
        mat4.scale(armJointSkin.transform(), elbowSize);

        var armLowerSkin = new SceneNode("arm lower skin");
        armLowerSkin.add(ellipsoidSolid, programs.black);
        armLowerSkin.add(ellipsoidWiref, programs.red);
        // armLowerSkin.add(cube, programs.vertexColor);
        mat4.scale(armLowerSkin.transform(), armLowerSize);
        mat4.rotate(armLowerSkin.transform(), 0.5 * Math.PI, [1, 0, 0]);

        var wristSkin = new SceneNode("wrist skin");
        wristSkin.add(torusSolid, programs.red);
        wristSkin.add(torusWiref, programs.black);
        // wristSkin.add(cube, programs.vertexColor);
        mat4.scale(wristSkin.transform(), this.wristSize);
        mat4.rotate(wristSkin.transform(), 0.5 * Math.PI, [1, 0, 0]);

        var fingerSkin = new SceneNode("finger skin");
        // fingerSkin.add(torusSolid, programs.red);
        // fingerSkin.add(torusWiref, programs.black);
        fingerSkin.add(cube, programs.vertexColor);
        mat4.scale(fingerSkin.transform(), fingerSize);
        mat4.rotate(fingerSkin.transform(), 0.5 * Math.PI, [1, 0, 0]);
        mat4.rotate(fingerSkin.transform(), 0.5 * Math.PI, [0, 1, 0]);

        var hatSkin = new SceneNode("hat skin");
        hatSkin.add(trangTrefSolid, programs.red);
        hatSkin.add(trangTrefWiref, programs.black);
        // hatSkin.add(cube, programs.vertexColor);
        mat4.scale(hatSkin.transform(), hatSize);
        // mat4.rotate(hatSkin.transform(), 0.5 * Math.PI, [1, 0, 0]);
        // mat4.rotate(hatSkin.transform(), 0.5 * Math.PI, [1, 0, 0]);



        //-- attach skins to skeleton ------------
        this.torso.add(torsoSkin);
        this.neck.add(neckSkin);
        this.head.add(headSkin);
        this.eyeOuterR.add(eyeOuterSkin);
        this.eyeInnerR.add(eyeInnerSkin);
        this.eyeOuterL.add(eyeOuterSkin);
        this.eyeInnerL.add(eyeInnerSkin);
        this.shoulderR.add(shoulderSkin);
        this.armR.add(armJointSkin);
        this.armUpperR.add(armUpperSkin);
        this.elbowR.add(armJointSkin);
        this.armLowerR.add(armLowerSkin);
        this.wristR.add(wristSkin);
        this.finger1R.add(fingerSkin);
        this.finger2R.add(fingerSkin);
        this.hat.add(hatSkin);

    };

    // draw method: activate buffers and issue WebGL draw() method
    Robot.prototype.draw = function(gl, program, transformation) {

        // delegate draw to the scene nodes


        this.torso.draw(gl, program, transformation);
    };

    Robot.prototype.rotate = function(cmd, angle) {

        // delegate draw to the scene nodes

        switch(cmd) {
            case "armUpperRX":
                mat4.rotate(this.shoulderR.transform(), angle, [1, 0, 0]);
                break;
            case "armUpperRZ":
                mat4.rotate(this.armR.transform(), angle, [0, 0, 1]);
                break;
            case "armLowerRX":
                mat4.rotate(this.elbowR.transform(), angle, [1, 0, 0]);
                break;
            case "handR":
                mat4.rotate(this.finger1R.transform(),  angle, [0, 0, 1]);
                mat4.rotate(this.finger2R.transform(), -angle, [0, 0, 1]);
                mat4.translate(this.finger1R.transform(), [  angle*this.wristSize[0]/2, 0, 0]);
                mat4.translate(this.finger2R.transform(), [ -angle*this.wristSize[0]/2, 0, 0]);
                break;
            case "headY":
                mat4.rotate(this.neck.transform(), angle/2, [0, 1, 0]);
                mat4.rotate(this.head.transform(), angle/2, [0, 1, 0]);
                break;
            case "eyesZ":
                mat4.rotate(this.eyeOuterR.transform(),  angle, [0, 0, 1]);
                mat4.rotate(this.eyeOuterL.transform(), -angle, [0, 0, 1]);
                break;
            default:
                console.log("rotation " + cmd + " not implemented.");
                break;
        };
    };
        
    // this module only returns the constructor function    
    return Robot;

})); // define

    
