'use strict';

var gui = require('./gui');
var init = require('./init');
var game = init();

function $() { 
    var query = Array.prototype.join.call(arguments, ',');
    return document.querySelector(query); 
}

function handleInputKeyUp(e) {
    var val, row, col, sect, isValid, sectRow, sectCol, sectIndex;

    val = +e.target.value;
    row = e.target.getAttribute('data-row');
    col = e.target.getAttribute('data-col');
    sect = e.target.getAttribute('data-sect');

    // calculate section identifiers
    sectRow = Math.floor( row / 3 );
    sectCol = Math.floor( col / 3 );
    sectIndex = ( row % 3 ) * 3 + ( col % 3 );

    game.props.matrix.row[row][col] = val;
    game.props.matrix.col[col][row] = val;
    game.props.matrix.sect[sectRow][sectCol][sectIndex] = val;
}

function handleButtonClick(e) {
    if (e.target.className == 'js-reset-game') {
        game.reset();
    } else if (e.target.className == 'js-solve-game') {
        console.log('Solver Clicked');

        [].slice.call(document.querySelectorAll('input')).forEach(function(input) {
            var value = +input.value;

            if (value > 0) {
                var sqRow = input.getAttribute('data-row');
                var sqCol = input.getAttribute('data-col');

                var sectRow = Math.floor(sqRow / 3);
                var sectCol = Math.floor(sqCol / 3);
                var sectIndex = (sqRow % 3) * 3 + (sqCol % 3);

                game.props.matrix.row[sqRow][sqCol] = value;
                game.props.matrix.col[sqCol][sqRow] = value;
                game.props.matrix.sect[sectRow][sectCol][sectIndex] = value;
            }
        });

        game.solve();
    } else if (e.target.className == 'js-validate-game') {
        game.validate();
    }
}

$('#container').appendChild(gui);
$('.sudoku-board').addEventListener('keyup', handleInputKeyUp);
$('#buttons').addEventListener('click', handleButtonClick);

var input = document.querySelectorAll('input');
var g = ",,2,,6,,8,,,,,,5,,2,,,,3,,5,,,8,,,,,6,,4,,1,,7,,7,,,,,6,,,9,,5,,8,,7,,3,,8,,6,,,3,,,,,,,7,,4,,,,,,1,,8,,9,,";
    g = g.split(',');
    g.forEach(function(i, idx) { 
        if (i != '') input[idx].value = i; 
    });
