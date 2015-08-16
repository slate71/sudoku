var R = require('ramda');

function buildInput(rowID, colID) {
    var input, isSect1;
    
    input = document.createElement('input');
    input.setAttribute('maxlength', '1');
    input.setAttribute('data-row', rowID);
    input.setAttribute('data-col', colID);

    isSect1 = (Math.floor(input.getAttribute('data-col')/3) +
               Math.floor(input.getAttribute('data-row')/3)) % 2 === 0;

    if( isSect1 ) {
        input.setAttribute('data-sect', '1');
        input.classList.add('sect1');
    } else {
        input.setAttribute('data-sect', '2');
        input.classList.add('sect2');
    }

    return input;
}

function buildCol(rowID, colID) {
    var col = document.createElement('td');
        col.appendChild(buildInput(rowID, colID));

    return col;
}

function buildRow(rowID) {
    var row = document.createElement('tr');

    function addCol(colID) {
        return row.appendChild(buildCol(rowID, colID));
    }

    R.times(addCol, 9);

    return row;
}

function buildTable() {
    var table = document.createElement('table');
        table.classList.add('sudoku-board');

    R.times(function(rowID) {
        table.appendChild(buildRow(rowID));
    }, 9);

    return table;
}

module.exports = buildTable();
