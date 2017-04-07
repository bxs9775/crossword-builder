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
    list: [],
    finalList: undefined,
    filesToLoad: -1,
    filesLoaded: -1,
    //loaded: false,
    
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
            app.dictionaries.loadOptions(response);
        };
        
        var listURL = "lists/dictionaryList.txt";
        
        //open request
        xhr.open("GET",listURL,true);
        
        //set headers - mostly in case I run this on banjo
        xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2010 00:00:00 GMT");
        
        //send request
        xhr.send();
    },
    
    loadOptions: function(string){
        var dictArr = string.split("\n");
        
        for(var i = 0; i < dictArr.length;i++){
            var entry = dictArr[i].split(",");
            var valid = (entry[1][0]=="t");
            var listItem = new this.dictEntry(entry[0],valid);
            /*
            var listItem = Object.freeze({
                name: entry[0],
                isUsed: valid
            });
            */
            this.dictList.push(listItem);
            
            //create checkbox
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = valid;
            checkbox.onchange = this.createCheckFunction(i);
            
            //create label
            var span = document.createElement("span");
            span.textContent = entry[0];
            var label = document.createElement("label");
            label.appendChild(checkbox);
            label.appendChild(span);
            
            //append label to dict List
            this.dictElement.appendChild(label);
        }
    },
    
    //returns the lists used in the crossword
    loadLists: function(){
        
        this.list = [];
        this.filesToLoad = 0;
        for(var i = 0; i < this.dictList.length; i++){
            if(this.dictList[i].isUsed){
                this.filesToLoad++;
            }
        }
        
        if(this.filesToLoad === 0){
            //this.loaded = true;
            return;
        }
        
        this.filesLoaded = 0;
        
        for(var i = 0; i < this.dictList.length; i++){
            var dict = this.dictList[i];
            if(dict.isUsed){
                var xhr = new XMLHttpRequest();
                xhr.onload = function(){
                    var response = xhr.responseText;
                    var currList = response.split("\n");
                    
                    //Will this cause race conditions?
                    app.dictionaries.list = app.dictionaries.list.concat(currList);
                    app.dictionaries.filesLoaded++;
                    //console.log(app.dictionaries.filesLoaded);
                    
                    if(app.dictionaries.filesToLoad === app.dictionaries.filesLoaded){
                        app.dictionaries.finalList = app.dictionaries.resolveList(app.dictionaries.list);
                        //this.loaded = true;
                        app.dictionaries.filesToLoad = -1;
                        app.dictionaries.filesLoaded = -1;
                        app.main.setDictionary(app.dictionaries.finalList);
                    }
                };
                
                var listURL = "lists/"+dict.name;
                //console.log(listURL);
                
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
            app.dictionaries.dictList[i].isUsed = e.target.checked;
        };
    },
    
    resolveList(list){
        if(list.length > 1){
            list = this.uniqueList(list);
        }
        //console.dir(list);
        return list.join("\n");
    },
    
    //takes an array and returns all unique values
    uniqueList: function(list){
        var tempList = [];
        for(var i = 0; i < list.length;i++){
            if(!(tempList.includes(list[i]))){
                tempList.push(list[i]);
            }
        }
        return tempList;
    }
};