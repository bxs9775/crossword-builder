//handles the main section of the code
"use strict";

//Sets up an app for the project
var app = app || {};

app.main = {
    ///-----fields-----////
    //html
    fileText: undefined,
    gridElement: undefined,
    setupElement: undefined,
    creatorElement: undefined,
    //grid
    SPECIAL_CHARS: Object.freeze({
        EMPTY: ".",
        BLACK: "*"
    }),
    dictionary: undefined,
    startingGrid: undefined,
    words: [],
    
    ///-----other files-----////
    dictionaries: undefined, //Handled by loader.js
    
    ///-----constructor functions-----///   
    //function constructor for a word in the crossword
    //params:
    //  pattern - the word or unfilled pattern used in a regex search
    //  startLoc - the x and y cooridinates of the first space occupied by the word in the grid
    //  length - how long the word is
    //  across - true if the word is an across word, false if the word is down
    //  visited - has this word been visited
    word: function(pattern,startLoc,length,across,visited=false){
        this.pattern = pattern;
        this.loc = startLoc;
        this.length = length;
        this.across = across;
        this.possibleWords = [];
        this.numPossible = 0;
        this.visited = visited;
        
        //update methods
        this.updateWords = function(){
            /*implementation needed*/
            var regExp = new RegExp("^"+pattern+"$","igm");
            this.possibleWords = app.main.dictionary.match(regExp);
            if(this.possibleWords != null){
                this.numPossible = this.possibleWords.length;
            }else{
                this.numPossible = 0;
            }
        };
        this.changeLetter = function(letter,index){
            this.pattern = this.pattern.substr(0,index)+letter+this.pattern.substr(index+1);
        };
        this.copy = function(){
            return Object.seal(new app.main.word(this.pattern,this.loc,this.length,this.across,this.filled));
        }
    },
    spot: function(letter){
        this.letter = letter;
        this.acrossWord = -1;
        this.acrossIndex = -1;
        this.downWord = -1;
        this.downIndex = -1;
        
        //update methods
        this.setWord = function(word,index,across){
            if(across){
                this.acrossWord = word;
                this.acrossIndex = index;
            } else {
                this.downWord = word;
                this.downIndex = index;
            }
        };
        this.addLetter = function(letter,wordlist){
            if(this.acrossWord != -1 && this.acrossIndex != -1){
                wordlist[this.acrossWord].changeLetter(letter,this.acrossIndex);
            }
            if(this.downWord != -1 && this.downIndex != -1){
                wordlist[this.downWord].changeLetter(letter,this.downIndex);
            }
        };
    },
    grid: function(rows, cols, array, wordlist=app.main.words){
        this.rows = rows;
        this.cols = cols;
        this.array = array;//[];
        this.wordlist = wordlist;
        this.html = document.createElement("table");
        for(var i = 0; i < rows; i++){
            //var arrayRow = array;
            var htmlRow = document.createElement("tr");
            for(var j = 0; j < cols; j++){
                var cell = document.createElement("td");
                if(array[i][j].letter == app.main.SPECIAL_CHARS.BLACK){
                    cell.style.backgroundColor = "black";
                }else if(array[i][j].letter != app.main.SPECIAL_CHARS.EMPTY){
                    cell.textContent = array[i][j].letter;
                }
                htmlRow.appendChild(cell);
            }
            //this.array.push(arrayRow);
            this.html.appendChild(htmlRow);
        }
        //setup functions
        /*this.fillGrid = function(grid){
            
        };*/
        this.createWordList = function(){
            var listIndex = 0;
            //find across words
            for(var i = 0; i < this.rows;i++){
                var start = 0;
                var length = 0;
                var pattern = "";
                for(var j = 0; j < this.cols;j++){
                    var letter = this.array[i][j].letter;
                    if(letter == app.main.SPECIAL_CHARS.BLACK){
                       if(length > 0){
                           var loc = {
                               x: start,
                               y: i
                           };
                           var word = Object.seal(new app.main.word(pattern,loc,length,true));
                           this.addWord(word,listIndex);
                           listIndex++;
                           length = 0;
                           pattern = "";
                           this.wordlist.push(word);
                       }
                        start = j+1;
                    }else{
                        length++;
                        pattern += letter;
                    }
                }
                
                if(length > 0){
                    var loc = {
                        x: start,
                        y: i
                    };
                    var word = Object.seal(new app.main.word(pattern,loc,length,true));
                    this.addWord(word,listIndex);
                    this.wordlist.push(word);
                }
            }
            //find down words
            for(var i = 0; i < this.rows;i++){
                var start = 0;
                var length = 0;
                var pattern = "";
                for(var j = 0; j < this.cols;j++){
                    var letter = this.array[i][j].letter;
                    if(letter == app.main.SPECIAL_CHARS.BLACK){
                       if(length > 0){
                           var loc = {
                               x: i,
                               y: start
                           };
                           var word = Object.seal(new app.main.word(pattern,loc,length,false));
                           this.addWord(word,listIndex);
                           listIndex++;
                           length = 0;
                           pattern = "";
                           app.main.words.push(word);
                       }
                        start = j+1;
                    }else{
                        length++;
                        pattern += letter;
                    }
                }
                if(length > 0){
                    var loc = {
                        x: i,
                        y: start
                    };
                    var word = Object.seal(new app.main.word(pattern,loc,length,false));
                    this.addWord(word,listIndex);
                    app.main.words.push(word);
                }
            }
        };
        
        this.addWord = function(word,listIndex){
            var y = word.loc.y, x = word.loc.x;
            for(var i = 0; i < word.length; i++){
                this.array[y][x].setWord(listIndex,i,word.across);
                if(word.across){
                    x++;
                }else{
                    y++;
                }
            }
        };
        
        this.updateAll = function(){
            for(var i = 0; i < this.wordlist.length;i++){
                this.wordlist[i].updateWords();
            }
        };
        
        //other methods
        this.fillWord = function(word,text){
            var x = word.loc.x, y = word.loc.y;
            for(var i = 0; i < word.length;i++){
                this.array[y][x].addLetter(text[i],this.wordlist);
                this.html.children[y].children[x].textContent = text[i];
                if(word.across){
                    x++;
                }else{
                    y++;
                }
            }
        }
        
        this.changeLetter = function(letter,x,y){
            array[y][x].addLetter(letter,this.wordlist);
            html[y][x].textContent = letter;
        };
        
        this.copy = function(wordlist=this.wordlist){
            return Object.seal(new app.main.grid(this.rows,this.cols,this.array,wordlist));
        }
    },

    
    ///-----control functions-----///
    setup: function(){
        this.gridElement = document.querySelector("#gridElement");
        this.setupElement = document.querySelector("#setup");
        this.creatorElement = document.querySelector("#creationApp");
        this.fileText = document.querySelector("#fileText");
        
        document.querySelector("#loadButton").onclick = function(){
            var file = this.fileText.value;
            if(file != ""){
                this.setupElement.style.display = "none";
                this.creatorElement.style.display = "block";
                
                var gridURL = "grids\\" + file + ".txt";
                
                var xhr = new XMLHttpRequest();
                
                xhr.onload = function(){
                    app.main.parseGrid(xhr.responseText);
                }
                
                xhr.open("GET",gridURL,true);
                
                xhr.send();
            }
        }.bind(this);
    },
    
    solveStep: function(grid,words){
        this.setGridHTML(grid);
        
        var nextIndex = this.getMostRestrainedWord(words);
        var nextWord = words[nextIndex];
        if(nextWord == undefined){
            return undefined;
        }
        var wordList = nextWord.possibleWords;
        words[nextIndex].visited = true;
        
        for(var i = 0; i < wordList.length; i++){
            grid.fillWord(nextWord,wordList[i]);
            if(this.crosswordFilled(grid)){
                return grid;
            }
            
            var wordsCpy = this.copyWordsArray(words);
            var gridCpy = grid.copy(wordsCpy);
            gridCpy.updateAll();
            var result = this.solveStep(gridCpy,wordsCpy);
            if(result != undefined){
                return result;
            }
        }
        
        return undefined;
    },
    
    crosswordFilled: function(grid){
        for(var i = 0; i < grid.rows; i++){
            for(var j = 0; j < grid.cols; j++){
                if(grid.array[i][j].letter == this.SPECIAL_CHARS.EMPTY){
                    return false;
                }
            }
        }
        return true;
    },
    
    ///-----helper methods-----///
    copyWordsArray(array){
        var newArray = [];
        for(var i = 0; i < array.length;i++){
            newArray.push(array[i].copy());
        }
        return newArray;
    },
    
    parseGrid: function(string){
        app.dictionaries.loadLists();
        
        var gridRows = string.split("\n");
        var dimensions = gridRows[0].split(",");
        var rows = parseInt(dimensions[0]);
        var cols = parseInt(dimensions[1]);
        var grid = [];
        for(var i = 1; i <= rows; i++){
            var gridRow = [];
            for(var j = 0; j < cols; j++){
                var newSpot = Object.seal(new this.spot(gridRows[i][j]));
                gridRow.push(newSpot);
            }
            grid.push(gridRow);
        }
        
        this.startingGrid = Object.seal(new app.main.grid(rows,cols,grid,this.words));
    },
    
    setDictionary: function(dict){
        //console.log("setting dict");
        this.dictionary = dict;
        this.startingGrid.createWordList();
        //console.dir(this.dictionary);
        
        this.setGridHTML(this.startingGrid);
        
        var wordsCpy = this.copyWordsArray(this.words);
        var gridCpy = this.startingGrid.copy(wordsCpy);
        gridCpy.updateAll();
        var result = this.solveStep(gridCpy,wordsCpy);
        if(result != undefined){
            this.setGridHTML(result);
        }
    },
    
    setGridHTML: function(grid){
        while(this.gridElement.hasChildNodes()){
            var child = this.gridElement.firstChild;
            this.gridElement.removeChild(child);
        }
        this.gridElement.appendChild(grid.html);
    },
    
    getMostRestrainedWord: function(words){
        var max = Number.MAX_SAFE_INTEGER;
        var lowest = Number.MAX_SAFE_INTEGER;
        var wordInd = undefined;
        for(var i = 0; i < words.length;i++){
            var length = words[i].numPossible;
            //Would quit if we expected the program to fill the whole grid by itself
            //But continuing allows the solver to fill in most of the grid even if there are sections the user must fill in themselves
            if(words[i].visited || length == 0){
                continue;
            }
            if(length < lowest || (length === lowest && length === max)){
                wordInd = i;
                lowest = length;
            }
        }
        return wordInd;
    }
};