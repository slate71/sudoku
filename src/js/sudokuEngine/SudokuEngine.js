'use strict';

var R = require('ramda');

function Sudoku(config) {
    
    this.config = config;
    this.recursionCounter = 0;
    this.matrix = {};
    this.validation = {};
    this.resetMatrices();

    return this;
}

Sudoku.prototype = {

    // Returns a document fragment containing the sudoku board GUI
    createSudokuBoard: function() {

        var sudokuBoard = document.createDocumentFragment();
        var _handleKeyUp = this.handleKeyUp;

        function createInput(colId) {
            var input = document.createElement('input');

            input.setAttribute('maxLength', '1');
            input.setAttribute('data-col', colId);
            input.onKeyUp = _handleKeyUp;

            return input;
        }
        
        function createCol(colId) {
            var col = document.createElement('td');

            col.appendChild(createInput(colId));

            return col;
        }
        
        function createRow() {
            var row = document.createElement('tr');

            R.times(function(colId) {
                return row.appendChild(createCol(colId));
            }, 9);

            return row;
        }

        function createBoard() {
            var board = document.createElement('table');

            board.className = 'sudoku-board';

            R.times(function(rowId) {
                var row = createRow();
                var inputs = row.getElementsByTagName('input');

                R.forEach(function(input) {
                    input.setAttribute('data-row', rowId);

                    if ((Math.floor(input.dataset.col/3) + Math.floor(input.dataset.row/3)) % 2 === 0 ) {
                        input.classList.add('sect1');
                    } else {
                        input.classList.add('sect2');
                    }

                    return input;
                }, inputs);

                return board.appendChild(row);
            }, 9);

            return board;
        }

        return sudokuBoard.appendChild(createBoard());
    },

    // 
    handleKeyUp: function(e) {
        // if validate on insert is true, validate on key up else validate on game end.
        // calculate section identifiers
        // cache value in matrix
        // cache game board
    },

    resetGame: function() {
        this.resetMatrices();
        this.resetInputFields();
    },

    resetMatrices: function() {
        var _this = this;
            
        this.matrix = { col: {}, row: {}, sect: {} };
        this.validation = { col: {}, row: {}, sect: {} };

         R.times( function( n ) { 
            _this.matrix.col[n] = R.repeat( '', 9 );
            _this.matrix.row[n] = R.repeat( '', 9 );
            _this.validation.col[n] = [];
            _this.validation.row[n] = [];
        }, 9 );
        
        R.times( function( row ) {
            _this.matrix.sect[row] = {};
            _this.validation.sect[row] = {};

            R.times( function( col ) {
                _this.matrix.sect[row][col] = R.repeat( '', 9 );
                _this.validation.sect[row][col] = [];
            }, 3 );
        }, 3 );
    },

    resetInputFields: function() {
        var inputs = document.querySelector('.sudoku-board').getElementsByTagName('input');

        R.forEach(function(input) {
            if (input.classList.contains('sudoku-clues')) {
                return input.value = '';
            }
        }, inputs);
    },

    validateNumber: function(val, rowID, colID, oldNum) {
        var isValid = true;
            sectRow = Math.floor( rowID / 3 );
            sectCol = Math.floor( colID / 3 );
        
        // Remove oldNum from the validation matrices,
        // if it exists in them.
        oldNum = oldNum || '';
        if ( this.validation.row[rowID].indexOf( oldNum ) > -1 ) {
            this.validation.row[rowID].splice(
                this.validation.row[rowID].indexOf( oldNum ), 1
            );
        }
        if ( this.validation.col[colID].indexOf( oldNum ) > -1 ) {
            this.validation.col[colID].splice(
                this.validation.col[colID].indexOf( oldNum ), 1
            );
        }
        if ( this.validation.sect[sectRow][sectCol].indexOf( oldNum ) > -1 ) {
            this.validation.sect[sectRow][sectCol].splice(
                this.validation.sect[sectRow][sectCol].indexOf( oldNum ), 1
            );
        }

        if( val !== '' ) {
            if( $.isNumeric( val ) && val > 0 && val <= 9 ) {
                if( 
                    R.contains( val )( this.validation.row[rowID] ) ||
                    R.contains( val )( this.validation.col[colID] ) ||
                    R.contains( val )( this.validation.sect[sectRow][sectCol] )
                ) {
                    isValid = false; 
                } else {
                    isValid = true;
                }

            }
            this.validation.row[rowID].push( val );
            this.validation.col[colID].push( val );
            this.validation.sect[sectRow][sectCol].push( val );
        }

        return isValid;
    },

    validateMatrix: function() {
        var rowID, colID, isValid,
            _this = this,
            hasError = false,
            input = document.querySelector('.sudoku-board').getElementsByTagName('input[data-row="'+rowID+'"][data-col="'+colID+'"]');

        // Validate each value cached in the matrix row.
        R.forEachIndexed( function( row, rowID ) { 
            R.forEachIndexed( function( val, colID ) {
                isValid = _this.validateNumber( val, rowID, colID, val );
                $input.toggleClass( 'sudoku-input-error', !isValid );
                if( !isValid ) {
                    hasError = true;
                }
            }, row ); 
        }, _this.matrix.row );
                    
        return !hasError;
    },

    solveGame: function( row, col ) {
        var _this = this; 
        var $nextSquare;
        var cval;
        var sqRow;
        var sqCol; 
        var legalValues;
        var sectRow;
        var sectCol;
        var secIndex;

        this.recursionCounter++;
        $nextSquare = this.findClosestEmptySquare( row, col );

        if ( !$nextSquare ) {
            // End of Board
            return true;
        } else {
            $nextSquare = $( $nextSquare );
            sqRow = $nextSquare.data( 'row' ); // returns row id
            sqCol = $nextSquare.data( 'col' ); // return col id
            legalValues = this.findLegalValuesForSquare( sqRow, sqCol );

            // Find the segment id
            sectRow = Math.floor( sqRow / 3 );
            sectCol = Math.floor( sqCol / 3 );
            secIndex = ( sqRow % 3 ) * 3 + ( sqCol % 3 );

            // Try out legal values for this cell
            for ( var i = 0; i < legalValues.length; i++ ) {
                cval = legalValues[i];
                // Update value in input
                $nextSquare.val( cval );
                
                // Update in matrices
                this.matrix.row[sqRow][sqCol] = cval;
                this.matrix.col[sqCol][sqRow] = cval;
                this.matrix.sect[sectRow][sectCol][secIndex] = cval;
                

                // Recursively keep trying
                if ( this.solveGame( sqRow, sqCol ) ) {
                    return true;
                } else {
                    // There was a problem, we should backtrack
                    this.backtrackCounter++;

                    $nextSquare.val( '' );

                    // Remove value from matrices
                    this.matrix.row[sqRow][sqCol] = '';
                    this.matrix.col[sqCol][sqRow] = '';
                    this.matrix.sect[sectRow][sectCol][secIndex] = '';
                }
            }
            // If there was no success with any of the legal
            // numbers, call backtrack recursively backwards
            return false;
        }
    },

    findClosestEmptySquare: function( row, col ) {
        var startingSquare;
        var remainingSquares; 
        var emptySquares;
        var closestEmptySquare;

        // Returns the index of the cell passed into the function.
        startingSquare = col + 9 * row;
        console.log('starting square:' + startingSquare);

        // Return an array of cells starting from row, col coordinates
        // to the end of the board.
        remainingSquares = R.slice( startingSquare, 82 )( [].slice.call(document.getElementsByTagName('input')) );
        console.log('remaining squares:' + remainingSquares);

        // Filter the empty cells.
        emptySquares = R.filterIndexed( function( cell, idx, list ) {
            return cell;
        }, remainingSquares );
        console.log('empty squares:' + emptySquares);

        // Return the closestEmptySquare
        closestEmptySquare = R.head( emptySquares );
        console.log('closest empty square:' + closestEmptySquare);

        return closestEmptySquare;
    },

    findLegalValuesForSquare: function( row, col ) {
        var legalVals, legalNums, val, i,
            sectRow = Math.floor( row / 3 ),
            sectCol = Math.floor( col / 3 );

        // Returns a list of numbers from 1 to 9.
        legalNums = R.range(1, 10);

        // Check existing numbers in col
        for ( i = 0; i < 9; i++ ) {
            try {
                val = Number( this.matrix.col[col][i] );
            } catch( e ) {
                console.log(e instanceof TypeError); // true
                  console.log(e.message);              // "null has no properties"
                  console.log(e.name);                 // "TypeError"
                  console.log(e.fileName);             // "Scratchpad/1"
                  console.log(e.lineNumber);           // 2
                  console.log(e.columnNumber);         // 2
                  console.log(e.stack);  
            }
            if ( val > 0) {
                // Remove from array
                if ( legalNums.indexOf( val ) > -1 ) {
                    legalNums.splice( legalNums.indexOf( val ), 1 );
                }
            }
        }

        // Check existing numbers in row
        for ( i = 0; i < 9; i++ ) {
            val = Number( this.matrix.row[row][i] );
            if ( val > 0 ) {
                // Remove from array
                if ( legalNums.indexOf( val ) > -1 ) {
                    legalNums.splice( legalNums.indexOf( val ), 1 );
                }
            }
        }

        // Check existing numbers in section
        sectRow = Math.floor( row / 3 );
        sectCol = Math.floor( col / 3 );
        for ( i = 0; i < 9; i++ ) {
            val = Number( this.matrix.sect[sectRow][sectCol][i] );
            if ( val > 0 ) {
                // Remove from array
                if ( legalNums.indexOf( val ) > -1 ) {
                    legalNums.splice( legalNums.indexOf( val ), 1 );
                }
            }
        }

        if ( this.config.solver_shuffle_numbers ) {
            // Shuffling the resulting 'legalNums' array will
            // make sure the solver produces different answers
            // for the same scenario. Otherwise, 'legalNums'
            // will be chosen in sequence.
            for ( i = legalNums.length - 1; i > 0; i-- ) {
                var rand = getRandomInt( 0, i );
                temp = legalNums[i];
                legalNums[i] = legalNums[rand];
                legalNums[rand] = temp;
            }
        }

        return legalNums;
    },
};

module.exports = Sudoku;
