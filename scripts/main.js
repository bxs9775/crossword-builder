//handles the main section of the code
"use strict";

//Sets up an app for the project
var app = app || {};

app.main = {
    ///-----fields-----////
    SPECIAL_CHARS: Object.freeze({
        EMPTY: ".",
        BLACK: "*"
    }),
    words: [],
    dictionary: undefined,
    
    
    ///-----other files-----////
    dictionaries: undefined, //Handled by loader.js
    
    ///-----constructor functions-----///
    word: function(pattern,startLoc,length,across){
        this.pattern = pattern;
        this.loc = startLoc;
        this.across = across;
        this.possibleWords = [];
        this.numPossible = 0;
        
        //update methods
        this.updateWords = function(){
            /*implementation needed*/
            this.possibleWords = dictionary.match(pattern+"\i");
            this.numPossible = this.possibleWords.length;
        };
        this.changeLetter = function(letter,index){
            this.pattern[index] = letter;
            this.updateWords();
        };
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
    grid: function(rows, cols, grid){
        this.rows = rows;
        this.cols = cols;
        this.grid = grid//[];
        this.html = document.createElement("table");
        for(var i = 0; i < rows; i++){
            //var gridRow = [];
            var htmlRow = document.createElement("tr");
            for(var j = 0; j < cols; j++){
                //var newSpot = new this.spot();
                //gridRow.push(newSpot);
                var cell = document.createElement("td");
                cell.textContent = this.SPECIAL_CHARS.EMPTY;;
                htmlRow.appendChild(cell);
            }
            //this.grid.push(gridRow);
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
                    if(grid[i][j] == this.SPECIAL_CHARS.BLACK){
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
                    if(grid[j][i] == this.SPECIAL_CHARS.BLACK){
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
        
        //other methods
        this.addWord = function(word,listIndex){
            var y = word.loc.y, x = word.loc.x;
            for(var i = 0; i < word.length; i++){
                grid[y][x].setWord(listIndex,i,word.across);
                if(word.across){
                    x++;
                }else{
                    y++;
                }
            }
        }
    },
    
    ///-----control functions-----///
    setup: function(){
        
    },
    
    ///-----helper methods-----///
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