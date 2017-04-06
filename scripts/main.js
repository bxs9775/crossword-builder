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
    words: [],
    dictionary: undefined,
    startingGrid: undefined,
    
    ///-----other files-----////
    dictionaries: undefined, //Handled by loader.js
    
    ///-----constructor functions-----///
    word: function(pattern,startLoc,length,across){
        this.pattern = pattern;
        this.loc = startLoc;
        this.length = length;
        this.across = across;
        this.possibleWords = [];
        this.numPossible = 0;
        
        //update methods
        this.updateWords = function(){
            /*implementation needed*/
            this.possibleWords = dictionary.match("^"+pattern+"$\i");
            this.numPossible = this.possibleWords.length;
        };
        this.changeLetter = function(letter,index){
            this.pattern[index] = letter;
        };
        this.copy = function(){
            return (new word(this.pattern,this.loc,this.length,this.across));
        }
    },
    spot: function(){
        this.letter = this.SPECIAL_CHARS.EMPTY;
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
        this.addLetter = function(letter){
            if(this.acrossWord != -1 && this.acrossIndex != -1){
                this.words[this.arossWord].changeLetter(letter,this.acrossIndex);
            }
            if(this.downWord != -1 && this.downIndex != -1){
                this.words[this.downWord].changeLetter(letter,this.downIndex);
            }
        };
    },
    grid: function(rows, cols, array){
        this.rows = rows;
        this.cols = cols;
        this.array = array//[];
        this.html = document.createElement("table");
        for(var i = 0; i < rows; i++){
            var htmlRow = document.createElement("tr");
            for(var j = 0; j < cols; j++){
                var cell = document.createElement("td");
                if(array[i][j] == app.main.SPECIAL_CHARS.BLACK){
                    cell.style.backgroundColor = "black";
                }else if(array[i][j] != app.main.SPECIAL_CHARS.EMPTY){
                    cell.textContent = array[i][j];
                }
                htmlRow.appendChild(cell);
            }
            this.html.appendChild(htmlRow);
        }
        //setup functions
        /*this.fillGrid = function(grid){
            
        };*/
        this.createWordList = function(){
            var listIndex = 0;
            //find across words
            for(var i = 1; i <= this.rows;i++){
                var start = 0;
                var length = 0;
                var pattern = "";
                for(var j = 0; j < this.cols;j++){
                    if(array[i][j] == this.SPECIAL_CHARS.BLACK){
                       if(length > 0){
                           var loc = {
                               x: start,
                               y: i
                           };
                           var word = new this.word(pattern,loc,length,true);
                           this.addWord(word,listIndex);
                           listIndex++;
                           length = 0;
                           pattern = "";
                       }
                        start = j+1;
                    }else{
                        length++;
                        pattern += this.SPECIAL_CHARS.EMPTY;
                    }
                }
            }
            //find down words
            for(var i = 0; i < this.rows;i++){
                var start = 0;
                var length = 0;
                var pattern = "";
                for(var j = 0; j < this.cols;j++){
                    if(array[j][i] == this.SPECIAL_CHARS.BLACK){
                       if(length > 0){
                           var loc = {
                               x: i,
                               y: start
                           };
                           var word = new this.word(pattern,loc,length,true);
                           this.addWord(word,listIndex);
                           listIndex++;
                           length = 0;
                           pattern = "";
                       }
                        start = j+1;
                    }else{
                        length++;
                        pattern += this.SPECIAL_CHARS.EMPTY;
                    }
                }
            }
        };
        
        this.addWord = function(word,listIndex){
            word.updateWords();
            var y = word.loc.y, x = word.loc.x;
            for(var i = 0; i < word.length; i++){
                array[y][x].setWord(listIndex,i,word.across);
                if(word.across){
                    x++;
                }else{
                    y++;
                }
            }
        };
        //other methods
        this.fillWord = function(word,text){
            var x = word.loc.x, y = word.loc.y;
            for(var i = 0; i < word.length;i++){
                grid[x][y].addLetter(text[i]);
                if(word.across){
                    x++;
                }else{
                    y++;
                }
            }
        }
        
        this.changeLetter = function(letter,x,y){
            array[y][x].addLetter(letter);
            html[y][x].textContent = letter;
        };
        
        this.copy = function(){
            return new this.grid(this.rows,this.cols,this.array);
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
        setGridHTML(grid);
        
        var nextWord = this.getMostRestrainedWord();
        var wordList = nextWord.possibleWords;
        
        for(var i = 0; i < wordList.length; i++){
            grid.fillWord(nextWord,wordlist[i]);
            if(this.crosswordFilled){
                return true;
            }
            var gridCpy = grid.copy();
            var wordsCpy = word.copy();
            var result = this.solveStep(gridCpy,wordsCpy);
            if(result){
                return true;
            }
        }
        
        return false;
    },
    
    crosswordFilled: function(grid){
        for(var i = 0; i < grid.rows; i++){
            for(var j = 0; j < grid.cols; j++){
                if(grid[i][j].letter == this.SPECIAL_CHARS.EMPTY){
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
                gridRow.push(gridRows[i][j]);
            }
            grid.push(gridRow);
        }
        this.startingGrid = new app.main.grid(rows,cols,grid);
        
        this.setGridHTML(app.main.startingGrid);
    },
    
    setDictionary: function(dict){
        console.log("setting dict");
        this.dictionary = dict;
        console.dir(this.dictionary);
    },
    
    setGridHTML: function(grid){
        if(this.gridElement.hasChildNodes()){
            var child = this.gridElement.firstChild;
            this.gridElement.removeChild(child);
        }
        this.gridElement.appendChild(grid.html);
    },
    
    getMostRestrainedWord: function(){
        var max = Number.MAX_SAFE_INTEGER;
        var lowest = Number.MAX_SAFE_INTEGER;
        var word = undefined;
        for(var i = 0; i < words.length;i++){
            var length = words[i].numPossible;
            if(length < lowest || (length === lowest && length === max)){
                word = words[i];
                lowest = length;
            }
        }
        return word;
    }
};