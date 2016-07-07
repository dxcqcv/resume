webpackJsonp([0,1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var bb = 5;
	var Greeter = (function () {
	    function Greeter(greeting) {
	        this.greeting = greeting;
	    }
	    Greeter.prototype.greet = function () {
	        return "<h1>" + this.greeting + "</h1>";
	    };
	    return Greeter;
	}());
	;
	var greeter = new Greeter("Hello, world!");
	//document.body.innerHTML = greeter.greet();
	var s = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
]);
//# sourceMappingURL=index.js.map