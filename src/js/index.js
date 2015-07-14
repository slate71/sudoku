'use strict';

var R = require('ramda');
var Sudoku = require('./sudokuEngine/SudokuEngine.js');

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

function init(config) {
	var _config = R.merge(defaultConfig, config);
	var sudoku = new Sudoku(_config);

	return {
 		render: function() {
 			return document.getElementById('container').appendChild(sudoku.createSudokuBoard());
 		},
		
		reset: function() {
			document.querySelector('.sudoku-board').classList.remove('valid-matrix');
			return sudoku.resetGame();
		},
		
		validate: function() {},
		
		solve: function() {
			var isValid;
			var startTime;
			var endTime; 
			var elapsed; 
			var gameResults;
			var table;
            
			// Make sure the board is valid first
            if ( !sudoku.validateMatrix() ) {
                return false;
            }

            // Reset counters
            sudoku.recursionCounter = 0;
            sudoku.backtrackCounter = 0;

            // Check start time
            startTime = Date.now();

            // Solve the game
            isValid = sudoku.solveGame( 0, 0 );

            // Get solving end time
            endTime = Date.now();

            // Visual indication of whether the game was solved
            document.querySelector('.sudoku-board').classList.toggle('valid-matrix', isValid );
            if ( isValid ) {
                var inputs = document.querySelector('.sudoku-board').getElementsByTagName('input');
                R.forEach(function(input) {
                	input.setAttribute( 'disabled', 'disabled' );
                }, inputs);
            }

            // Display elapsed time
            if ( sudoku.config.show_solver_timer ) {
                elapsed = endTime - startTime;
                window.console.log( 'Solver elapsed time: ' + elapsed + 'ms' );
            }
            // Display number of reursions and backtracks
            if ( sudoku.config.show_recursion_counter ) {
                window.console.log( 'Solver recursions: ' + sudoku.recursionCounter );
                window.console.log( 'Solver backtracks: ' + sudoku.backtrackCounter );
            }
		},
	}
}

init().render();
document.querySelector('.js-reset-game').onclick = init().reset;
document.querySelector('.js-solve-game').onclick = init().solve;
document.querySelector('.js-validate-game').onclick = init().validate;
