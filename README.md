## Sudoku Rules
- The board is comprised of a 9×9 matrix, divided into 9 sub sections
- Each square can have a number from 1 to 9
- Numbers must be unique per row
- Numbers must be unique per column
- Numbers must be unique per section

## Structure of the Application

### Project Directory
The project directory has a fairly straight forward structure.  In the root directory we have the working src directory, the dist directory with built and distributable files, node_modules, and root files for managing the project.  The index.html file contains the markup serving as the entry point into the application.

### App Structure

#### The JavaScripts

The js src directory contains the files that comprise and load the app, as well as, the vendor folder which contains the two libraries used to build the app (jQuery and Ramdajs).  jQuery was used for ease of traversing the DOM and aiding with any cross browser issues that might be lurking in vanilla JS.  Ramdajs was used as the functional programming library for the app.  Gulp was used as the build tool and Jade was used as the template engine. More info on why I chose the libraries to follow.

The source for the sudoku app is in the src/js/sudoku.js file. In a nut shell, it declares the SUDOKU game module that returns the public methods for initiating/controlling the game.  
Calling SUDOKU.getinstance() returns the following public methods:

##### getNewBoard
- This method calls the private _game.buildGUI() which renders a game board to the DOM.  

##### reset
- Reset will remove all of the user entered values from the Sudoku grid.  

##### validate
- Validate will check for invalid values and set a valid matrix class on the board if all looks  good.  This class should be used to render a visual cue to the user that all values are valid but I ran out of time before finishing that part of the UI.  

- The board will check each value as it is entered (with the keyup event) and the value's cell will turn pink if it's invalid.  This option can be turned off when the validate_on_insert is set to false.  When turned off, the validate method lets the user control when they want to check the validity of their solution using the validate board button.  

##### solve
- The solve method is the brains of the app.  It uses a backtracking algorithm to recursively check each empty square against it's available legal values, and continues doing so until all squares have been assigned a legal value.  If it exhausts its list of legal values for a particular square, it will backtrack and keep trying different values on previous cells until all empty squares are filled.

#### Psuedo Code
	solve
		check isMatrixIsValid =>
		solveGame starting from first square =>

	isMatrixValid =>
		go over every cell and validateNumber =>

	validateNumber =>
		compare number against relative row, col, and section
		if number already exists
			return false
		else 
			return true

	solveGame =>
		findClosestEmptySquare =>
		if none
			return true
		else
			get coordinates of closestEmpty Square
		get sect of closestEmpty Square
		getLegalValauesForSquare =>
		forEach legalValue trylegalvalues =>
			insert cval
			if game is solved
				return true
			else
				remove cval
		no legal values worked, return false and backtrack

	findClosestEmptySquare =>
		from the beginning find coordinates of closestEmpty Square
		return closestEmptySquare

	getLegalValuesForSquare
		legalValues = array 1 thru 9
		given coordinates of emptySquare
			remove vales in relative row, column and section from legalValues
		shuffle legalValues
		return legalValues

### The CSS
Sass was used as the preprocessor.  Working files are in the src/scss directory.  Gulp is used to listen to and compile the scss files to css.  When gulp watch is running, it watches the files in the scss/ folder and scss/includes/ folder for changes.  The files in includes/ breakdown the style for the GUI into settings, base, components, and states.  These files are then imported into the style.scss folder that gulp uses to render the dist/style.css file.

## Technologies

#### Gulp
Decided to use Gulp as the build system mainly because I hadn't used it before. I've been entrenched in Grunt and saw this as a good opportunity to see what all the noise was about. At first blush, I find the differences negligible (for a small project) but do enjoy the "code over configuration" style of Gulp. The streaming is cool, too.  However if I had more time, I'd try foregoing both and using NPM exclusively before coming to a final conclusion. Plus, I imagine there's more to come in the world of build tools. For now, this tool is set up, it works, let's press on!

[ Why we should stop using Grunt ](http://blog.keithcirkel.co.uk/why-we-should-stop-using-grunt/)  
[ How to use npm as a build tool ](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/)

#### JavaScript Libraries
- jQuery - jQuery was used as a go to standard. I'm familiar with it and it gets the job done.
- Ramdajs - Ramdajs was used to make things more functional and simple.  I definitely thinks this cold be taken further with the app. My overall goal would be an app that reads easily from top to bottom without much if any nesting or callbacks.  There are other libraries that can help to accomplish this (i.e. built in array prototypes, or Lodash) but for reasons on why to use Ramda, see references:

[ The Goals of Ramda](http://ramdajs.com/docs/)  
[ Why Ramda ](http://fr.umio.us/why-ramda/)


#### CSS Preprocessor
- SASS - Sass is awesome. I used because I know it.

#### Template
- Jade - Jade is cool, too.  First time using it, wanted to try it out.

## Trade Offs
If one of the requirements was not to use a framework, I may have tried using Reactjs. Though it wasn't necessary for the project.  

The biggest trade off was, with more time, I would have written the app in a pure a functional programming style as possible.  Functional programming allows for really elegant and easy to reason about code.  

I also would have like a little more time to work out the game generator.  I was able to get the solver worked out but the generator didn't quite make it in.  Currently, you can generate a new game by pressing the reset button, followed by the solve button, and then the reset button again to generate a new board.  Granted all of the clues will be in the same squares but the solution will be different.  With more time I would have created a process that would generate a new board with different clues.  

I'd also spend a bit more time on commenting and documentation. I'm rushing this README file and I would like to have broken down the app into example code snippets to demonstrate how the app is composed.

I'd do more testing and working out of bugs.  It's works but it's got kinks.

I might also look at the matrices used to validate and cache value inputs.  There are 3 sepearte matrixes used in the app, one for cacheing, one for validating, and one to store the DOM input nodes.  I don't think it needs all 3. But, I'd have to work through that.

#### References
Much props to Moriel and her post on [ designing a sudoku puzzle ](http://moriel.smarterthanthat.com/tips/javascript-sudoku-backtracking-algorithm/)  
An article on Medium about [ Recursion ](https://medium.com/functional-javascript/recursion-282a6abbf3c5)  
Wikipedia: [ Sudoku ](http://en.wikipedia.org/wiki/Sudoku), [ Backtracking ](https://en.wikipedia.org/wiki/Backtracking)  
And, [ StackoverfLow ](http://stackoverflow.com/questions/18168503/recursively-solving-a-sudoku-puzzle-using-backtracking-theoretically)

