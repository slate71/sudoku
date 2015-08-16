'use strict';

var R = require('ramda');

function Sudoku(config) {
    this.config = config;
    this.recursionCounter = 0;
    this.matrix = {};
    this.validation = {};
    this.inputCache;

    this.resetMatrices();
    return this;
}

Sudoku.prototype = {
    resetMatrices: function resetMatrices() {
        this.matrix = {col: [], row: [], sect: []};
        this.validation = {col: [], row: [], sect: []};

        function colsAndRows(n) {
            this.matrix.col[n] = R.repeat('', 9);
            this.matrix.row[n] = R.repeat('', 9);
            this.validation.col[n] = [];
            this.validation.row[n] = [];
        }

        function sectCol(c) {
            var r = arguments[1];
            this.matrix.sect[c][r] = R.repeat('', 9);
            this.validation.sect[c][r] = [];
        }

        function sectRow(r) {
            this.matrix.sect[r] = [];
            this.validation.sect[r] = [];
            R.times(sectCol.bind(this, r), 3);
        }

        R.times(colsAndRows.bind(this), 9);
        R.times(sectRow.bind(this), 3);
    },

    validateNumber: function validateNumber(val, row, col, prevVal) {
        var isValid = true;
        var sectRow = Math.floor(row/3);
        var sectCol = Math.floor(col/3);
        var vRow = this.validation.row[row];
        var vCol = this.validation.col[col];
        var vSect = this.validation.sect[sectRow][sectCol];
        var isValidVal = (!isNaN(val) && val > 0 && val <= 9);
        var hasPeer = (R.contains(val)(vRow) || R.contains(val)(vCol) || R.contains(val)(vSect));

        prevVal = prevVal || '';
        // Remove prevVal from validation matrix if it exists.
        if (vRow.indexOf(prevVal) > -1) {
            vRow.splice(vRow.indexOf(prevVal), 1);
        } 
        if (vCol.indexOf(prevVal) > -1) {
            vCol.splice(vCol.indexOf(prevVal), 1);
        }
        if (vSect.indexOf(prevVal) > -1) {
            vSect.splice(vSect.indexOf(prevVal), 1);
        }

        if (val !== '') {
            if (isValidVal) {
                if (hasPeer) {
                    isValid = false;
                } else {
                    isValid = true;
                }
            } else {
                isValid = false;
            }
            // Add val to validation matrix whether it's valid or not.
            vRow.push(val);
            vCol.push(val);
            vSect.push(val);
        }

        return isValid;
    },

    validateMatrix: function validateMatrix() {
        var matrix = R.flatten(this.matrix.row);
        var hasError = false;
        var isValid = true;
        var col = 0;

        function validate(val, idx) {
            var row = Math.floor(idx/9);

            hasError = !this.validateNumber(val, row, col, val);
            if (hasError === true) { isValid = false };

            (col === 8) ? col = 0 : col++;
        }
        
        R.forEachIndexed(validate.bind(this), matrix);

        return isValid;
    },

    findClosestEmptySquare: function findClosestEmptySquare(row, col, squares) {
        // Index of the starting square
        var startingSquare = parseInt(row) * 9 + parseInt(col);

        // Array of remainingSquares
        var remainingSquares = Array.prototype.slice.call(squares, startingSquare, 82);

        // Find closest empty square
        var closestEmptySquare = R.find(emptySquare)(remainingSquares);

        function emptySquare(square) {
            return square.value === '';
        }

        return closestEmptySquare;
    },

    findLegalValuesForSquare: function findLegalValuesForSquare(row, col) {
        var sectRow = Math.floor( row / 3 );
        var sectCol = Math.floor( col / 3 );
        
        // An array of numbers from 1 to 9.
        var legalNums = R.range(1,10);
        
        function checkCol(value) {
            return this.matrix.col[col].indexOf(value) === -1;
        }

        function checkRow(value) {
            return this.matrix.row[row].indexOf(value) === -1;
        }

        function checkSect(value) {
            return this.matrix.sect[sectRow][sectCol].indexOf(value) === -1;
        }

        function shuffle() {
            return 0.5 - Math.random();
        }

        legalNums = R.filter(checkCol.bind(this), legalNums);
        legalNums = R.filter(checkRow.bind(this), legalNums);
        legalNums = R.filter(checkSect.bind(this), legalNums);
        legalNums.forEach(function(val, idx, list) {
            legalNums = legalNums.sort(shuffle);
        });

        return legalNums;
    },

    solveGame: function solveGame(row, col, squares) {
        var sqRow, sqCol, legalValues, cVal, sectRow, sectCol, sectIndex;
        var nextSquare = this.findClosestEmptySquare(row, col, squares);
        this.recursionCounter++;

        if (!nextSquare) {
            // We've reached the end of the board.
            return true;
        } else {
            sqRow = nextSquare.getAttribute('data-row');
            sqCol = nextSquare.getAttribute('data-col');

            legalValues = this.findLegalValuesForSquare(sqRow, sqCol);

            sectRow = Math.floor(sqRow / 3);
            sectCol = Math.floor(sqCol / 3);
            sectIndex = (sqRow % 3) * 3 + (sqCol % 3);

            for (var i = 0; i < legalValues.length; i++) {
                cVal = legalValues[i];
            
                nextSquare.value = cVal;
                this.matrix.row[sqRow][sqCol] = cVal;
                this.matrix.col[sqCol][sqRow] = cVal;
                this.matrix.sect[sectRow][sectCol][sectIndex] = cVal;

                if(this.solveGame(sqRow, sqCol, squares)) {
                    return true;
                } else {
                    nextSquare.value = '';
                    this.matrix.row[sqRow][sqCol] = '';
                    this.matrix.col[sqCol][sqRow] = '';
                    this.matrix.sect[sectRow][sectCol][sectIndex] = '';
                    this.backtrackCounter++;
                }
            }
        }

        return false;
    }
};

module.exports = Sudoku;
