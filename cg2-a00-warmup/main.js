
/*
 * This is main.js which is referenced directly from within
 * a <script> node in index.html
 */

// "use strict" means that some strange JavaScript things are forbidden
"use strict";

// this shall be the function that generates a new phone book object
var makePath = function(separator) {    
    var str = "";
    if (separator === undefined) {
            separator = "";
    }

    var f = function(point) {
        if (point === undefined) {
            return str;
        }
        if (str !== "") {
            str += separator;
        }
        str += point;
    };
    return f;
};

// the main() function is called when the HTML document is loaded
var main = function() {

	// create a path, add a few points on the path, and print it
	var path1 = makePath(", ");
    path1("A");
    path1("B");
    path1("C");

    var path2 = makePath("/");
    path2("usr");
    path2("local");
    path2("bin");

    var path3 = makePath(" --> ");
	path3("Berlin");
    path3("Prag");
    path3("Wien");
    
    window.console.log("path 1 is " + path1() );
    window.console.log("path 2 is " + path2() );
	window.console.log("path 2 is " + path3() );
};
