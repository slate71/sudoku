/**
 * Here we build an initial game when the document is ready.
 * First we get an instance of the board and then render the clues.
 * With more time I would have build a generator instead of rendering each
 * clue with a switch statment. 
 *
 * Configs can also be passed into the instance method.  
 * See default configs in sudoku.js file.
 */

$(function() {
    // Configs can be passed in here to over ride defaults.
    SUDOKU.getInstance().getNewBoard();
    $inputs = $('input');
    R.forEach.idx( function(n, idx) {
        switch(idx) {
            case 0:
                $(n).val(5).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 1:
                $(n).val(3).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 4:
                $(n).val(7).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 9:
                $(n).val(6).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 9 + 3:
                $(n).val(1).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 9 + 4:
                $(n).val(9).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 9 + 5:
                $(n).val(5).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 18 + 1:
                $(n).val(9).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 18 + 2:
                $(n).val(8).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 18 + 7:
                $(n).val(6).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 27:
                $(n).val(8).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 27 + 4:
                $(n).val(6).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 27 + 8:
                $(n).val(3).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 36:
                $(n).val(4).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 36 + 3:
                $(n).val(8).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 36 + 5:
                $(n).val(3).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 36 + 8:
                $(n).val(1).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 45:
                $(n).val(7).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 45 + 4:
                $(n).val(2).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 45 + 8:
                $(n).val(6).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 54 + 1:
                $(n).val(6).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 54 + 6:
                $(n).val(2).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 54 + 7:
                $(n).val(8).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 63 + 3:
                $(n).val(4).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 63 + 4:
                $(n).val(1).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 63 + 5:
                $(n).val(9).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 63 + 8:
                $(n).val(5).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 72 + 4:
                $(n).val(8).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 72 + 7:
                $(n).val(7).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
            case 72 + 8:
                $(n).val(9).trigger('keyup');
                $(n).attr('disabled', 'disabled').addClass( 'sudoku-clues' );
                break;
        }
    }, $inputs );
});
