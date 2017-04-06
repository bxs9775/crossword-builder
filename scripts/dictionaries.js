//Handles loading dictionaries
"use strict";

var app = app || {};

app.dictionaries = {
    
    ///-----function constructors-----///
    dictElement: undefined,
    dictList: [],
    dictEntry: function(name,isUsed){
        this.name = name;
        this.isUsed = isUsed;
    },
    finalList: undefined,
    threads: 0,
    
    ///-----control functions-----///
    setup: function(){
        this.dictElement = document.querySelector("#listOptions");
        while(this.dictElement.hasChildNodes()){
            var child = this.dictElement.firstChild;
            this.dictElement.removeChild(child);
        }
        
        var xhr = new XMLHttpRequest();
        xhr.onload = function(){
            var response = xhr.responseText;
            var dictArr = response.split("\n");
            
            for(var i = 0; i < dictArr.length;i++){
                var entry = dictArr[i].split(",");
                var valid = (entry[1][0]=="t");
                app.dictionaries.dictList.push(new app.dictionaries.dictEntry(entry[0],valid));
                
                //create checkbox
                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = valid;
                checkbox.onchange = app.dictionaries.createCheckFunction(i);
                
                //create label
                var span = document.createElement("span");
                span.textContent = entry[0];
                var label = document.createElement("label");
                label.appendChild(checkbox);
                label.appendChild(span);
                
                //append label to dict List
                app.dictionaries.dictElement.appendChild(label);
            }
        };
        
        var listURL = "lists/dictionaryList.txt";
        
        //open request
        xhr.open("GET",listURL,true);
        
        //set headers - mostly in case I run this on banjo
        xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2010 00:00:00 GMT");
        
        //send request
        xhr.send();
    },
    
    //returns the lists used in the crossword
    loadLists: function(){
        var list = [];
        this.threads = 0;
        for(var i = 0; i < this.dictList.lenght; i++){
            var dict = this.dictList[i];
            if(dict.isUsed){
                this.threads++;
                var xhr = new XMLHttpRequest();
                xhr.onload = function(){
                    var response = xhr.responseText;
                    var currList = response.split("\n");
                    
                    //Will this cause race conditions?
                    list.concat(currList);
                    this.threads--;
                    
                    if(this.threads < 1){
                        this.finalList = app.dictionaries.resolveList(list);
                    }
                };
                
                var listURL = "lists/"+dict.name;
                
                //open request
                xhr.open("GET",listURL,true);
                
                //send request
                xhr.send();
            }
        }
    },
    
    ///-----Helper functions-----///
    //creates a function for a checkbox
    createCheckFunction: function(i){
        return function(e){
            app.dictionaries.dictList[i].isUsed = e.target.value;
        };
    },
    
    resolveList(list){
        if(list.length > 1){
            list = this.uniqueList(list);
        }
        return list.join("\n");
    },
    
    //takes an array and returns all unique values
    uniqueList: function(list){
        var tempList = [];
        for(var i = 0; i < list.length;i++){
            if(!tempList.contains(list[i])){
                tempList.push(list[i]);
            }
        }
        return tempList;
    }
};