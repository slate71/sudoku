var R = require('ramda');
var Sudoku = require('./Sudoku');

var defaultConfig = {
	'validate_on_insert': true,
    'show_solver_timer': true,
    'show_recursion_counter': true,
    'solver_shuffle_numbers': true
};

module.exports = function init(config) {
	var _config = R.merge(defaultConfig, config);
	var sudoku = new Sudoku( _config );
	var paused = false;
	var counter = 0;
	
	return {
		props: sudoku,

		reset: function() {
			var inputs = [].slice.call(document.querySelectorAll('input'));
			R.forEach(function(input) { input.value = '' }, inputs);
			sudoku.resetMatrices();
		},

		solve: function(values) {
			var isValid, startTime, endTime, elapsed, gameResults, table;

			if ( !sudoku.validateMatrix() ) {
                return false;
            }

            sudoku.recursionCounter = 0;
            sudoku.backtrackCounter = 0;

            startTime = Date.now();

            isValid = sudoku.solveGame(0, 0, document.querySelectorAll('input'));

            endTime = Date.now();
            elapsed = endTime - startTime;

			console.log('Solver elapsed time: ' + elapsed + 'ms');
			console.log('Solver recursions: ' + sudoku.recursionCounter);
            console.log('Solver backtracks: ' + sudoku.backtrackCounter);
            console.log(sudoku.matrix);
		},

		validate: function() {
			var isValid = sudoku.validateMatrix();
			console.log(isValid);
		}
	};
};
