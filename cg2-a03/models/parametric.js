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

        // read the configuration parameters
        config = config || {};
        var uMin       = config.uMin   || -Math.PI;
        var uMax       = config.uMax   ||  Math.PI;
        var vMin       = config.vMin   || -Math.PI;
        var vMax       = config.vMax   ||  Math.PI;
        var uSegments  = config.uSegments || 40;
        var vSegments  = config.vSegments || 20;
        this.drawStyle = config.drawStyle || "faces";
        
        window.console.log("Creating a ParametricSurface with uMin=" + uMin + ", uMax=" + uMax + 
                                                           ", vMin=" + vMin + ", vMax=" + vMax + 
                                                           ", uSegments=" + uSegments + 
                                                           ", vSegments=" + vSegments); 

        // generate vertex coordinates and store in an array
        var coords = [];
        var normals = [];
        var texcoords = [];
        var uRange = uMax - uMin;
        var vRange = vMax - vMin;
        var uDelta = uRange / uSegments;
        var vDelta = vRange / vSegments;
        for(var i = 0; i <= uSegments; i++) {
            var u = uMin + i * uDelta;
            for(var j = 0; j <= vSegments; j++) {
                var v = vMin + j * vDelta;

                var pos = posFunc(u, v);
                coords.push(pos[0], pos[1], pos[2]);

                var n = vec3.normalize(pos);
                normals.push(n[0], n[1], n[2]);

                var s = 1 - (u + uMax) / uRange;
                var t = 1 - (v + vMax) / vRange;
                texcoords.push(s, t);

                // TODO
                // colors.push();
            }
        }
        console.log(coords.length);
        console.log(texcoords.length);
        
        // create vertex buffer object (VBO) for the coordinates
        this.coordsBuffer = new vbo.Attribute(gl, { "numComponents": 3,
                                                    "dataType": gl.FLOAT,
                                                    "data": coords 
                                                  } );
        
        // // create vertex buffer object (VBO) for the colors
        // this.colorBuffer = new vbo.Attribute(gl, { "numComponents": 4,
        //                                             "dataType": gl.FLOAT,
        //                                             "data": colors 
        //                                           } );

        // create vertex buffer object (VBO) for the normal vectors
        this.normalBuffer = new vbo.Attribute(gl, { "numComponents": 3,
                                                    "dataType": gl.FLOAT,
                                                    "data": normals 
                                                  } );

        // create vertex buffer object (VBO) for the texture coordinates
        this.texcoordsBuffer = new vbo.Attribute(gl, { "numComponents": 2,
                                                    "dataType": gl.FLOAT,
                                                    "data": texcoords 
                                                  } );

        var triangles = [];
        for (var i = 0; i < uSegments; i++) {
            for (var j = 0; j < vSegments; j++) {
                
                var k = i * (vSegments + 1) + j;
                triangles.push(k    , k + 1            , k + vSegments + 1, 
                               k + 1, k + vSegments + 2, k + vSegments + 1); 
            }
        }

        // create vertex buffer object (VBO) for the indices for the triangles
        this.trianglesBuffer = new vbo.Indices(gl, { "indices": triangles } );

        var lines = [];
        for (var i = 0; i < uSegments; i++) {
            for (var j = 0; j < vSegments; j++) {
                
                var k = i * (vSegments + 1) + j;
                lines.push(k, k + 1, 
                           k, k + vSegments + 1); 
            }
            // line for last row
            lines.push(k + 1, k + vSegments + 2);
        }
        // lines for last column
        var k = uSegments * (vSegments + 1);
        for (var j = 0; j < vSegments; j++) {
            lines.push(k + j, k + j + 1);
        }

        // create vertex buffer object (VBO) for the indices for the lines
        this.linesBuffer = new vbo.Indices(gl, { "indices": lines } );

    }; 

    // draw method: activate buffers and issue WebGL draw() method
    ParametricSurface.prototype.draw = function(gl,material) {

        material.apply();

        // bind the attribute buffers
        var program = material.getProgram();
        this.coordsBuffer.bind(gl, program, "vertexPosition");
        // this.colorBuffer.bind(gl, program, "vertexColor");
        this.normalBuffer.bind(gl, program, "vertexNormal");
        this.texcoordsBuffer.bind(gl, program, "vertexTexCoords");

        // draw the vertices as specified in the drawStyle
        switch (this.drawStyle) {
        case "points":
            gl.drawArrays(gl.POINTS, 0, this.coordsBuffer.numVertices()); 
            break;
        case "faces":
            this.trianglesBuffer.bind(gl);
            gl.drawElements(gl.TRIANGLES, this.trianglesBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
            break;
        case "lines":
            this.linesBuffer.bind(gl);
            gl.drawElements(gl.LINES, this.linesBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
            break;
        default:
            window.console.log("ParametricSurface: draw style " + this.drawStyle + " not implemented.");
            break;
        }
    };
        
    // this module only returns the Band constructor function    
    return ParametricSurface;

})); // define

    
