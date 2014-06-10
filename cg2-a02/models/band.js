/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Band
 *
 * The Band is made of two circles using the specified radius.
 * One circle is at y = height/2 and the other is at y = -height/2.
 *
 */


/* requireJS module definition */
define(["vbo"], 
       (function(vbo) {
       
    "use strict";
    
    /* constructor for Band objects
     * gl:  WebGL context object
     * config: configuration object with the following attributes:
     *         radius: radius of the band in X-Z plane)
     *         height: height of the band in Y
     *         segments: number of linear segments for approximating the shape
     *         asWireframe: whether to draw the band as triangles or wireframe
     *                      (not implemented yet)
     */ 
    var Band = function(gl, config) {
    
        // read the configuration parameters
        config = config || {};
        var radius       = config.radius   || 1.0;
        var height       = config.height   || 0.1;
        var segments     = config.segments || 20;
        this.drawStyle   = config.drawStyle || "points";
        
        window.console.log("Creating a Band with radius=" + radius + ", height=" + height + ", segments=" + segments + ", drawStyle=" + this.drawStyle ); 
    
        // generate vertex coordinates and store in an array
        var coords = [];
        for(var i = 0; i <= segments; i++) {
        
            // X and Z coordinates are on a circle around the origin
            var t = (i/segments)*Math.PI*2;
            var x = Math.sin(t) * radius;
            var z = Math.cos(t) * radius;
            // Y coordinates are simply -height/2 and +height/2 
            var y0 = height/2;
            var y1 = -height/2;
            
            // add two points for each position on the circle
            // IMPORTANT: push each float value separately!
            coords.push(x, y0, z);
            coords.push(x, y1, z);
            
        };  
        
        this.numVertices = coords.length / 3;

        // create vertex buffer object (VBO) for the coordinates
        this.coordsBuffer = new vbo.Attribute(gl, { "numComponents": 3,
                                                    "dataType": gl.FLOAT,
                                                    "data": coords 
                                                  } );

        var triangles = [];
        for (var i = 0; i < 2*segments; i++) {
            triangles.push(i, i + 1, i + 2);
        }

        // create vertex buffer object (VBO) for the indices for the triangles
        this.trianglesBuffer = new vbo.Indices(gl, { "indices": triangles } );

        var lines = [];
        for (var i = 0; i < 2*segments; i += 2) {
            lines.push(i    , i + 1, 
                       i    , i + 2, 
                       i + 1, i + 3);
        }

        // create vertex buffer object (VBO) for the indices for the lines
        this.linesBuffer = new vbo.Indices(gl, { "indices": lines } );

    };

    // draw method: activate buffers and issue WebGL draw() method
    Band.prototype.draw = function(gl,program) {
    
        // bind the attribute buffers
        program.use();
        this.coordsBuffer.bind(gl, program, "vertexPosition");
 
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
            window.console.log("Band: draw style " + this.drawStyle + " not implemented.");
            break;
        }
         
    };
        
    // this module only returns the Band constructor function    
    return Band;

})); // define

    
    