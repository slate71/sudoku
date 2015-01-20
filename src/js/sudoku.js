/**
 * A modular performant JavaScript pattern.
 * Beginning with the initial Anonymous Closure. 
 * All code that runs inside the function lives in a
 * closure, providing privacy and state for the lifetime of the app.
 * 
 * @dependencies jQuery, Ramdajs.
 * @param {imports} Global imports. Keeps things clear and fast. Provides access to our libraries' global variable.
 */
var SUDOKU = ( function($, R) {

    var _instance, _game, 
        defaultConfig = {
            // If set to true, will validate the numbers as they're entered.
            'validate_on_insert': true,
            'show_solver_timer': true,
            'show_recursion_counter': true,
            'solver_shuffle_numbers': true
        },
        paused = false, 
        counter = 0;

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

                gameResults = R.values( _game.matrix.row );
                $table = $('#container');
                R.forEach.idx( function( result, row ) {
                    R.forEach.idx( function( val, col ) {
                        return $table
                                 .find('input[data-row="'+row+'"][data-col="'+col+'"]')
                                 .val( val );
                    }, result );
                }, gameResults);

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
        this.$cellMatrix = {};
        this.matrix = {};
        this.validation = {};

        this.resetValidationMatrices();
        return this;
    }

    Game.prototype = {
        /**
         * Builds GUI.
         * @return {jQuery} 9x9 table grid.
         */
        buildGUI: function() {

            var _this   = this,
                columns = ['', '', '', '', '', '', '', '', ''], 
                rows    = ['', '', '', '', '', '', '', '', ''],
                $table  = $( '<table>' ).addClass('sudoku-board');

            function buildInput(col) {
                var $input       = $( '<input>' ),
                    handleKeyUp  = $.proxy( _this.onKeyUp, _this ),
                    attributes   = {  'maxlength': '1', 'data-col': col };
                
                return $input.attr(attributes).on('keyup', handleKeyUp);
            }

            function buildCol(col) {
                return columns[col] = $('<td>').append( buildInput( col ) );
            }

            function buildRow(row) {
                _this.$cellMatrix[row] = {};
                R.times( function(col) { return _this.$cellMatrix[row][col] = buildInput( col ); }, 9 );
                return rows[row] = $('<tr>').append( R.times( buildCol, 9 ) );
            }

            function addSection(input){
                if( (Math.floor($( input ).data('col')/3) + Math.floor($( input ).data('row')/3)) % 2 === 0 ) {
                    return $( input ).addClass('sect1');
                } else {
                    return $( input ).addClass('sect2');
                }
            }

            function addAttributes(row, idx) {
                R.times(function(col) { 
                    _this.$cellMatrix[idx][col].attr('data-row', idx );
                }, 9 );
                return row.find( 'input' ).attr( 'data-row', idx ) &&
                       R.forEach( addSection, row.find('input'));
            }
            
            function buildTable() {
                R.times(buildRow, 9);
                R.forEach.idx( addAttributes, rows );
                return $table.append( rows );
            }

            // Return the GUI table
            return $('#container').append( buildTable );
        },

        /**
         * Handle key up events
         */
        onKeyUp: function( e ) {
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
         },

        /**
         * Reset the board and the game parameters
         */
        resetGame: function() {
            this.resetValidationMatrices();

            R.forEach(function(input) {
                if ( !$( input ).hasClass( 'sudoku-clues' ) ) {
                    return $( input ).val( '' );
                }
            }, $( '.sudoku-board' ).find( 'input' ) );

            $( '.sudoku-container input' ).removeAttr( 'disabled' );
            $( '.sudoku-container' ).removeClass( 'valid-matrix' );
        },

        /**
         * Reset and rebuild the validation matrices
         */
        resetValidationMatrices: function() {
            var _this = this;

            this.matrix = { 'row': {}, 'col': {}, 'sect': {} };
            this.validation = { 'row': {}, 'col': {}, 'sect': {} };

            // Build the row/col matrix and validation arrays
            R.times( function(idx) { 
                _this.matrix.row[idx] = ['', '', '', '', '', '', '', '', ''];
                _this.matrix.col[idx] = ['', '', '', '', '', '', '', '', ''];
                _this.validation.row[idx] = [];
                _this.validation.col[idx] = [];
            }, 9 );

            R.times( function(row) { 
                _this.matrix.sect[row] = []; 
                _this.validation.sect[row] = {};
            }, 3 );

            R.mapObj( function(row) { 
                R.times( function(col) { 
                    return row[col] = ['', '', '', '', '', '', '', '', '']; 
                }, 3);
            }, _this.matrix.sect );

            R.mapObj( function(row) {
                R.times( function(col) {
                    return row[col] = [];
                }, 3);
            }, _this.validation.sect );
        },

         /**
          * Validate Number
          */
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
            var _this = this, row, col, isValid, hasError = false,
                $input = $('.sudoku-board').find('input[data-row="'+row+'"][data-col="'+col+'"]');

            // Check if each value in matrix is valid.
            R.forEach.idx( function( key, row ) {
                R.forEach.idx( function( val, col ) {
                    isValid = _this.validateNumber( val, row, col, val );
                    $input.toggleClass( 'sudoku-input-error', !isValid );
                    if( !isValid ) {
                        hasError = true;
                    }
                }, _this.matrix.row[key] );
            }, R.keys(_this.matrix.row) );
                        
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
                sqRow = $nextSquare.data( 'row' );
                sqCol = $nextSquare.data( 'col' );
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
                    //$('#container').find('input[data-row="'+sqRow+'"][data-col="'+sqCol+'"]').val( cval );
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

                        // Remove value from input
                        this.$cellMatrix[sqRow][sqCol].val( '' );
                        //$('#container').find('input[data-row="'+sqRow+'"][data-col="'+sqCol+'"]').val( '' );
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
            var walkingRow, walkingCol, closestEmptySquare,
                _this = this;

            R.times( function( n ) {
                walkingRow = Math.floor( n / 9 );
                walkingCol = n % 9;
                if ( _this.matrix.row[walkingRow][walkingCol] === '' ) {
                    closestEmptySquare = _this.$cellMatrix[walkingRow][walkingCol];
                }
            }, 81 );

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

            // @return {array} containing the values 1 through 9
            legalNums = R.times( function( n ) { return n + 1; }, 9 );

            // Check existing numbers in col
            for ( i = 0; i < 9; i++ ) {
                val = Number( this.matrix.col[col][i] );
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
