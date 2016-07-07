declare var require: any;

const bb = 5;
class Greeter {
    constructor(public greeting: string) { }
    greet() {
        return "<h1>" + this.greeting + "</h1>";
    }
};

var greeter = new Greeter("Hello, world!");
    
//document.body.innerHTML = greeter.greet();

let s = require('../css/index.styl');