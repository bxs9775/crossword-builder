//loads in modules
"use strict";

var app = app || {};

//sets up project using an IIFE
(function(){
    window.onload = function init(){
        //sets up dictionaries
        app.dictionaries.setup();
        Object.seal(app.dictionaries);
        app.main.dictionaries = app.dictionaries;
        
        //sets up main
        app.main.setup();
        Object.seal(app.main);
        
        //Seals the app
        Object.seal(app);
    };
} ());