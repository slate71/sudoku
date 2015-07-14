var SUDOKU = ( function($, R) {

    var defaultConfig = {
            // If set to true, will validate the numbers as they're entered.
            'validate_on_insert': true,
            'show_solver_timer': true,
            'show_recursion_counter': true,
            'solver_shuffle_numbers': true
        };
    var paused = false;
    var counter = 0;
    var _instance;
    var _game;

    function init( config ) {
        conf = $.extend({}, defaultConfig, config);
        _game = new Game( conf );

        return {
            // public methods
            getNewBoard: function() {
                return _game.buildGUI();
            },
            reset: function() {
                return _game.resetGame();
            },
            validate: function() {
                var isValid;

                isValid = _game.validateMatrix();
                $( '.sudoku-board' ).toggleClass( 'valid-matrix', isValid );
            },
            solve: function() {
                var isValid, starttime, endtime, elapsed, gameResults, $table;
                // Make sure the board is valid first
                if ( !_game.validateMatrix() ) {
                    return false;
                }
                // Reset counters
                _game.recursionCounter = 0;
                _game.backtrackCounter = 0;

                // Check start time
                starttime = Date.now();

                // Solve the game
                isValid = _game.solveGame( 0, 0 );

                // Get solving end time
                endtime = Date.now();

                // Visual indication of whether the game was solved
                $( '.sudoku-container' ).toggleClass( 'valid-matrix', isValid );
                if ( isValid ) {
                    $( '.valid-matrix input' ).attr( 'disabled', 'disabled' );
                }

                // Display elapsed time
                if ( _game.config.show_solver_timer ) {
                    elapsed = endtime - starttime;
                    window.console.log( 'Solver elapsed time: ' + elapsed + 'ms' );
                }
                // Display number of reursions and backtracks
                if ( _game.config.show_recursion_counter ) {
                    window.console.log( 'Solver recursions: ' + _game.recursionCounter );
                    window.console.log( 'Solver backtracks: ' + _game.backtrackCounter );
                }
            }
        };
    }

    function Game( config ){
        this.config = config;

        this.recursionCounter = 0;
        this.matrix = {}; // A matrix for the game solution.
        this.validation = {}; // A matrix for storing the remaining legal values.

        this.resetMatrices();
        return this;
    }

    Game.prototype = {

        buildGUI: function() {

            var _this = this,
                $td, $tr,
                $table = $( '<table>' ).addClass('sudoku-board');

            // Returns a single input field with attributes and a key up listener.
            // We'll use this to build the input fields of the Sudoku board.
            function buildInput(colID) {
                var $input       = $( '<input>' ),
                    handleKeyUp  = $.proxy( _this.onKeyUp, _this ),
                    attributes   = {  'maxlength': '1', 'data-col': colID };
                
                return $input.attr(attributes).on('keyup', handleKeyUp);
            }

            // Returns a single jQuery td elment containing an input field.
            // We'll use this to build the columns in each row.
            function buildCol(colID) {
                return $('<td>').append( buildInput(colID) );
            }

            // Returns a jQuery tr element containing 9 td elements with input fields.
            // We'll use this to build the rows of the table.
            function buildRow() {
                $tr = $('<tr>');

                R.times( function(colID) {
                    return $tr.append( buildCol(colID) );
                }, 9 );

                return $tr;
            }
            
            // Add a class to each input field, identifying which section style it is in.
            // There are only two section styles. This helps help identify sections visually in 
            // the GUI.
            function addSection(input){
                if( (Math.floor($( input ).data('col')/3) + Math.floor($( input ).data('row')/3)) % 2 === 0 ) {
                    return $( input ).addClass('sect1');
                } else {
                    return $( input ).addClass('sect2');
                }
            }

            // Add the row ID data attribute and section style to each input field.
            function addAttributes(row, rowID) {
                return row.find( 'input' ).attr( 'data-row', rowID ) &&
                       R.forEach( addSection, row.find('input'));
            }
            
            // Build the table.  This returns a table with 9 rows and 9 columns.
            // Thus there are 81 cells.  Each cell has an input field with its
            // coresponding attributes.
            function theTable() {
                var nineRows = R.times(buildRow, 9);

                R.forEach.idx( function( row, rowID ) {
                    return addAttributes( row, rowID );
                }, nineRows );

                return $table.append( nineRows );
            }

            // Render the GUI table to the DOM.
            // Note: might be interesting to return a virtual table instead,
            // for greater flexibility of when it is rendered to the DOM.
            return $('#container').append( theTable );
        },

        onKeyUp: function(e) {
            var isValid, sectRow, sectCol, sectIndex,
                val = $( e.currentTarget ).val(),
                row = $( e.currentTarget ).data('row'),
                col = $( e.currentTarget ).data('col'),
                sect = $( e.currentTarget ).data('sect_idx');

            // If validate_on_insert is set to true, validate on key up.
            // Otherwise, we'll validate at the end of the game.
            if( this.config.validate_on_insert ) {
                isValid = this.validateNumber( val, row, col, this.matrix.row[row][col] );
                // Indicate error.
                $( e.currentTarget ).toggleClass( 'sudoku-input-error', !isValid );
            }

            // Calculate section identifiers
            sectRow = Math.floor( row / 3 );
            sectCol = Math.floor( col / 3 );
            sectIndex = ( row % 3 ) * 3 + ( col % 3 );

            // Cache value in matrix
            this.matrix.row[row][col] = val;
            this.matrix.col[col][row] = val;
            this.matrix.sect[sectRow][sectCol][sectIndex] = val;

            // Cache Game Board
            this.$inputCache = $('.sudoku-board').find('input');
        },

        resetGame: function() {
            this.resetMatrices();
            this.resetInputFields();
            $( '.sudoku-board' ).removeClass( 'valid-matrix' );
        },

        resetMatrices: function() {
            var _this = this;
            
            this.matrix = { col: {}, row: {}, sect: {} };
            this.validation = { col: {}, row: {}, sect: {} };
            
            R.times( function( n ) { 
                _this.matrix.col[n] = R.repeatN( '', 9 );
                _this.matrix.row[n] = R.repeatN( '', 9 );
                _this.validation.col[n] = [];
                _this.validation.row[n] = [];
            }, 9 );
            
            R.times( function( row ) {
                _this.matrix.sect[row] = {};
                _this.validation.sect[row] = {};

                R.times( function( col ) {
                    _this.matrix.sect[row][col] = R.repeatN( '', 9 );
                    _this.validation.sect[row][col] = [];
                }, 3 );
            }, 3 );

            console.log( _this.matrix );
            console.log( _this.validation );
        },

        resetInputFields: function() {
            var $inputs = $( '.sudoku-board' ).find( 'input' );

            R.forEach( function(input) {
                if ( !$( input ).hasClass( 'sudoku-clues' ) ) {
                    return $( input ).val( '' );
                }
            },  $inputs );
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
                $input = $('.sudoku-board').find('input[data-row="'+rowID+'"][data-col="'+colID+'"]');

            // Validate each value cached in the matrix row.
            R.forEach.idx( function( row, rowID ) { 
                R.forEach.idx( function( val, colID ) {
                    isValid = _this.validateNumber( val, rowID, colID, val );
                    $input.toggleClass( 'sudoku-input-error', !isValid );
                    if( !isValid ) {
                        hasError = true;
                    }
                }, row ); 
            }, _this.matrix.row );
                        
            return !hasError;
        },

        /**
         * A recursive 'backtrack' solver for the
         * game. Algorithm is based on the StackOverflow answer
         * http://stackoverflow.com/questions/18168503/recursively-solving-a-sudoku-puzzle-using-backtracking-theoretically
         */
        solveGame: function( row, col ) {
            var _this = this, cval, sqRow, sqCol, $nextSquare, legalValues,
                sectRow, sectCol, secIndex;

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

        /**
         * Find closest empty square relative to the given cell.
         *
         * @param {Number} row Row id
         * @param {Number} col Column id
         * @returns {jQuery} Input element of the closest empty
         *  square
         */
        findClosestEmptySquare: function( row, col ) {
            var startingSquare, remainingSquares, emptySquares, closestEmptySquare;

            // Returns the index of the cell passed into the function.
            startingSquare = col + 9 * row;

            // Return an array of cells starting from row, col coordinates
            // to the end of the board.
            remainingSquares = R.slice( startingSquare, 82 )( $('input') );

            // Filter the empty cells.
            emptySquares = R.filter.idx( function( cell, idx, list ) {
                return $( cell ).val() === '';
            }, remainingSquares );

            // Return the closestEmptySquare
            closestEmptySquare = R.head( emptySquares );

            return closestEmptySquare;
        },

        /**
         * Find the available legal numbers for the square in the
         * given row and column.
         *
         * @param {Number} row Row id
         * @param {Number} col Column id
         * @returns {Array} An array of available numbers
         */
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

    /**
     * Get a random integer within a range
     *
     * @param {Number} min Minimum number
     * @param {Number} max Maximum range
     * @returns {Number} Random number within the range (Inclusive)
     */
    function getRandomInt(min, max) {
        return Math.floor( Math.random() * ( max + 1 ) ) + min;
    }
    
    return {
        getInstance: function( config ) {
            if ( !_instance ) {
                _instance = init( config );
            }
            return _instance;
        }
    };
}(jQuery, R));
