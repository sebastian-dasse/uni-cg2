/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: ParametricSurface
 *
 * This function creates an object to draw any parametric surface.
 *
 */


/* requireJS module definition */
define(["vbo"], 
       (function(vbo) {
       
    "use strict";
    
    /* constructor for Parametric Surface objects
     * gl:  WebGL context object
     * posFunc: function taking two arguments (u,v) and returning coordinates [x,y,z]
     * config: configuration object defining attributes uMin, uMax, vMin, vMax, 
     *         and drawStyle (i.e. "points", "wireframe", or "surface")
     */ 
    var ParametricSurface = function(gl, posFunc, config) {

        // window.console.log("ParametricSurface() constructor not implemented yet.")

        // read the configuration parameters
        config = config || {};
        var uMin       = config.uMin   || -Math.PI;
        var uMax       = config.uMax   ||  Math.PI;
        var vMin       = config.vMin   || -Math.PI;
        var vMax       = config.vMax   ||  Math.PI;
        var uSegments  = config.uSegments || 40;
        var vSegments  = config.vSegments || 20;
        this.drawStyle = config.drawStyle || "points";
        
        window.console.log("Creating a ParametricSurface with uMin=" + uMin + ", uMax=" + uMax + 
                                                           ", vMin=" + vMin + ", vMax=" + vMax + 
                                                           ", uSegments=" + uSegments + 
                                                           ", vSegments=" + vSegments); 

        // generate vertex coordinates and store in an array
        var coords = [];
        var uDelta = (uMax - uMin) / uSegments;
        var vDelta = (vMax - vMin) / vSegments;
        for(var i = 0; i <= uSegments; i++) {
            var u = uMin + i * uDelta;
            for(var j = 0; j <= vSegments; j++) {
                var v = vMin + j * vDelta;
                var pos = posFunc(u, v);

                // add a point for each position on the surface
                // IMPORTANT: push each float value separately!
                coords.push(pos[0], pos[1], pos[2]);
            }
        }
        console.log("coords.length: " + coords.length);
        
        // create vertex buffer object (VBO) for the coordinates
        this.coordsBuffer = new vbo.Attribute(gl, { "numComponents": 3,
                                                    "dataType": gl.FLOAT,
                                                    "data": coords 
                                                  } );
        
        var triangles = [];
        // for (var i = 0; i < this.numVertices; i += 4) {
        for(var i = 0; i < uSegments; i++) {
            for(var j = 0; j < vSegments; j++) {
                
                var k = i * (vSegments + 1) + j;
                triangles.push(k + 0, k +             1, k + vSegments + 1, 
                               k + 1, k + vSegments + 2, k + vSegments + 1); 
            }
        }

        // create vertex buffer object (VBO) for the indices for the triangles
        this.trianglesBuffer = new vbo.Indices(gl, { "indices": triangles } );

        console.log(this.coordsBuffer.numVertices());
        console.log(this.trianglesBuffer.numIndices());
        console.log(triangles);
        // console.log(this.trianglesBuffer[this.trianglesBuffer.numIndices()]);

        // var lines = [];
        // for(var i = 0; i <= 3*uSegments; i += 3) {
        //     for(var j = 0; j <= 3*vSegments; j += 3) {

        //         var p0 = this.coordsBuffer()

        //         // add a point for each position on the surface
        //         // IMPORTANT: push each float value separately!
        //         lines.push(pos[0], pos[1], pos[2]);
        //     }
        // }

        // // create vertex buffer object (VBO) for the indices for the lines
        // this.linesBuffer = new vbo.Indices(gl, { "indices": lines } );

    };  

    // draw method: activate buffers and issue WebGL draw() method
    ParametricSurface.prototype.draw = function(gl,program) {
    
        // window.console.log("ParametricSurface.draw() not implemented yet.")

        // bind the attribute buffers
        program.use();
        this.coordsBuffer.bind(gl, program, "vertexPosition");
 
        // draw the vertices as points
        switch (this.drawStyle) {
        case "points":
            gl.drawArrays(gl.POINTS, 0, this.coordsBuffer.numVertices()); 
            break;
        case "faces":

            // gl.drawArrays(gl.POINTS, 0, this.coordsBuffer.numVertices()); 

            this.trianglesBuffer.bind(gl);
            gl.drawElements(gl.TRIANGLES, this.trianglesBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
            // gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0);
            window.console.log("DRAW FACES DONE");
            break;
        case "lines":
            window.console.log("ParametricSurface: draw style " + this.drawStyle + " not implemented.");
            // this.linesBuffer.bind(gl);
            // gl.drawElements(gl.LINES, this.trianglesBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
            break;
        default:
            window.console.log("ParametricSurface: draw style " + this.drawStyle + " not implemented.");
        }
    };
        
    // this module only returns the Band constructor function    
    return ParametricSurface;

})); // define

    
