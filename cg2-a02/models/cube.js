/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Cube
 *
 * The Cube is centered in the origin, all sides are axis-aligned, 
 * and each edge has length 1. 
 *
 *                   H              G
 *                   .--------------.
 *                  /              /|
 *                 / |            / |
 *                /              /  |
 *              D/   |         C/   |
 *    y         .--------------.    |
 *    |         |    |         |    |
 *    |         |    .- - - - -|----.
 *    |         |    E         |   /F
 *    0-----x   |  /           |  /
 *   /          |              | /
 *  /           |/             |/
 * z            .--------------.  
 *              A              B
 *
 *
 * We use a right-handed coordinate system with Z pointing towards the 
 * viewer. For example, vertex A (front bottom left) has the coordinates  
 * ( x = -0.5, y = -0.5, z = 0.5 ) . 
 *
 * The cube only consists of eight different vertex positions; however 
 * for various reasons (e.g. different normal directions) these vertices
 * are "cloned" for each face of the cube. There will be 3 instances
 * of each vertex, since each vertex belongs to three different faces.
 *
 */


/* requireJS module definition */
define(["vbo"], 
       (function(vbo) {
       
    "use strict";
    
    // constructor, takes WebGL context object as argument
    var Cube = function(gl, config) {
        
        window.console.log("Creating a unit Cube."); 

        // read the configuration parameters
        config = config || {};
        this.drawStyle = config.drawStyle || "faces";
    
        // generate points and store in an array
        var coords = [ 
                       // front
                       -0.5, -0.5,  0.5,  // A: index 0
                        0.5, -0.5,  0.5,  // B: index 1
                        0.5,  0.5,  0.5,  // C: index 2
                       -0.5,  0.5,  0.5,  // D: index 3
                       
                       // back
                       -0.5, -0.5, -0.5,  // E: index 4
                        0.5, -0.5, -0.5,  // F: index 5
                        0.5,  0.5, -0.5,  // G: index 6
                       -0.5,  0.5, -0.5,  // H: index 7
                       
                       // left
                       -0.5, -0.5,  0.5,  // A': index 8
                       -0.5,  0.5,  0.5,  // D': index 9
                       -0.5,  0.5, -0.5,  // H': index 10
                       -0.5, -0.5, -0.5,  // E': index 11
                       
                       // right
                        0.5, -0.5,  0.5,  // B': index 12
                        0.5, -0.5, -0.5,  // F': index 13
                        0.5,  0.5, -0.5,  // G': index 14
                        0.5,  0.5,  0.5,  // C': index 15
                       
                       // top
                       -0.5,  0.5,  0.5,  // D'': index 16
                        0.5,  0.5,  0.5,  // C'': index 17
                        0.5,  0.5, -0.5,  // G'': index 18
                       -0.5,  0.5, -0.5,  // H'': index 19

                       // bottom
                       -0.5, -0.5,  0.5,  // A'': index 20
                       -0.5, -0.5, -0.5,  // E'': index 21
                        0.5, -0.5, -0.5,  // F'': index 22
                        0.5, -0.5,  0.5   // B'': index 23
                     ];
                                          
        // there are 3 floats per vertex, so...
        this.numVertices = coords.length / 3;
        
        // create vertex buffer object (VBO) for the coordinates
        this.coordsBuffer = new vbo.Attribute(gl, { "numComponents": 3,
                                                    "dataType": gl.FLOAT,
                                                    "data": coords 
                                                  } );

        var triangles = [];
        for (var i = 0; i < this.numVertices; i += 4) {
            triangles.push(i, i + 1, i + 2,  
                           i, i + 2, i + 3);
        }

        // create vertex buffer object (VBO) for the indices
        this.trianglesBuffer = new vbo.Indices(gl, { "indices": triangles } );

        var colors = [];
        for (var i = 0; i < 8; i++) {
            colors.push(1, 0, 0, 1);
        }
        for (var i = 0; i < 8; i++) {
            colors.push(0, 1, 0, 1);
        }
        for (var i = 0; i < 8; i++) {
            colors.push(0, 0, 1, 1);
        }

        // create vertex buffer object (VBO) for the colors
        this.colorsBuffer = new vbo.Attribute(gl, { "numComponents": 4,
                                                    "dataType": gl.FLOAT,
                                                    "data": colors 
                                                  } );
        
        var lines = [0, 1,  1, 2,  2, 3,  3, 0, 
                     4, 5,  5, 6,  6, 7,  7, 4, 
                     0, 4,  1, 5,  2, 6,  3, 7];

        // create vertex buffer object (VBO) for the lines
        this.linesBuffer = new vbo.Indices(gl, { "indices": lines });

    };

    // draw method: activate buffers and issue WebGL draw() method
    Cube.prototype.draw = function(gl,program) {
    
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
            this.trianglesBuffer.bind(gl);
            gl.drawElements(gl.TRIANGLES, this.trianglesBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
            break;
        case "lines":
            this.linesBuffer.bind(gl);
            gl.drawElements(gl.LINES, this.linesBuffer.numIndices(), gl.UNSIGNED_SHORT, 0); 
            break;
        default:
            window.console.log("Cube: draw style " + this.drawStyle + " not implemented.");
            break;
        }
         
    };
        
    // this module only returns the constructor function    
    return Cube;

})); // define

    
