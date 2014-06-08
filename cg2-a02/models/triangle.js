/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Triangle
 *
 * The Triangle lies in the X-Y plane and consists of three vertices:
 *
 *                     C 
 *    y                .
 *    |               / \
 *    |              /   \
 *    |             /     \    
 *    0-----x      /       \   
 *   /            /         \  
 *  /            /           \ 
 * z            .-------------.  
 *              A             B
 *
 * *
 */


/* requireJS module definition */
define(["vbo"], 
       (function(vbo) {
       
    "use strict";
    
    // constructor, takes WebGL context object as argument
    var Triangle = function(gl, config) {
        
        // read the configuration parameters
        config = config || {};
        this.drawStyle = config.drawStyle || "faces";

        // generate vertex coordinates and store in an array
        var coords = [ -0.5, -0.5,  0,  // coordinates of A
                        0.5, -0.5,  0,  // coordinates of B
                          0,  0.5,  0   // coordinates of C
                     ];

        // create vertex buffer object (VBO) for the coordinates
        this.coordsBuffer = new vbo.Attribute(gl, { "numComponents": 3,
                                                    "dataType": gl.FLOAT,
                                                    "data": coords 
                                                  } );

        // generate vertex colors and store in an array
        var colors = [ 1, 0, 0, 1,      // color of A
                       0, 1, 0, 1,      // color of B
                       0, 0, 1, 1       // color of C
                     ];

        // create vertex buffer object (VBO) for the colors
        this.colorsBuffer = new vbo.Attribute(gl, { "numComponents": 4,
                                                    "dataType": gl.FLOAT,
                                                    "data": colors 
                                                  } );

        var lines = [0, 1, 
                     1, 2, 
                     2, 0];

        // create vertex buffer object (VBO) for the lines
        this.linesBuffer = new vbo.Indices(gl, { "indices": lines });

    };

    // draw method: activate buffers and issue WebGL draw() method
    Triangle.prototype.draw = function(gl,program) {

        // bind the attribute buffers
        program.use();
        this.coordsBuffer.bind(gl, program, "vertexPosition");
        this.colorsBuffer.bind(gl, program, "vertexColor");
        
        // draw the vertices as specified in the drawStyle
        switch (this.drawStyle) {
        case "points":
            gl.drawArrays(gl.POINTS, 0, this.coordsBuffer.numVertices()); 
            break;
        case "faces":
            gl.drawArrays(gl.TRIANGLES, 0, this.coordsBuffer.numVertices()); 
            break;
        case "lines":
            this.linesBuffer.bind(gl);
            gl.drawElements(gl.LINES, this.linesBuffer.numIndices(), gl.UNSIGNED_SHORT, 0); 
            break;
        default:
            window.console.log("Triangle: draw style " + this.drawStyle + " not implemented.");
            break;
        }

    };
        
    // this module only returns the constructor function    
    return Triangle;

})); // define

    
