/**
 * A modular performant JavaScript pattern.
 * Beginning with the initial Anonymous Closure. 
 * All code that runs inside the function lives in a
 * closure, providing privacy and state for the lifetime of our app.
 *
 * @param {imports} Global imports. Keeps things clear and fast. Proivdes access to our libraries' global variable.
 */
var SUDOKU = (function($, R){

	var _instance, _game, defaultConfig, paused, counter;

	function init( config ) {
		_game = new Game();
		_game.buildGUI();
		return {
			// public methods
		}
	}

	function Game(){}

	Game.prototype = {

		buildGUI: function() {

			var columns = new Array(9), 
				rows = new Array(9),
				$table = $('<table>');

			var addColumnTo = function(column, idx) {

				var $input = $( '<input>' )
						.attr({ 'maxlength': '1',
								'data-col': idx })
						.on('keyup', function(){ console.log("Whoo!")});

				return columns[idx] = $( '<td>' ).append( $input ); 
			};

			var addRowTo = function(row, idx) {
				
				rows[idx] = $( '<tr>' );
				R.forEach.idx( addColumnTo, columns );
				rows[idx].append( columns );

				return $table.append( rows );
			};

			R.forEach.idx(addRowTo, rows);

			var addAttrTo = function(row, idx) {
				
				row.find('input').attr('data-row', idx);
				
				R.forEach(function(input){ 
					if( (Math.floor($(input).data('col')/3) + Math.floor($(input).data('row')/3)) % 2 === 0 ) {
						$(input).addClass('sect1');
					} else {
						$(input).addClass('sect2');
					}
				}, row.find('input')); 
				 
				return
			};

			R.map.idx(addAttrTo, rows);

			// Return the GUI table
			return $('#container').append( $table );
		}

	};
	
	/*var n = 3;
	var _grid = new Array(n*n);
	for (var i = n*n - 1; i >= 0; i--) {
		_grid[i] = new Array(n*n);
	};

	for (var i = n*n - 1; i >= 0; i--) {
		for (var j = n*n - 1; j >= 0; j--) {
			_grid[i][j] = (i*n + i/n + j) % (n*n) + 1;
		};
	};*/

	
	return {
		getInstance: function( config ) {
			if ( !_instance ) {
				_instance = init( config );
			}
			return _instance;
		}
	}

}(jQuery, R));

//
SUDOKU.getInstance();
