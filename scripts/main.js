//Game constructor providing variable tracking and game logic per game.
class TicTacToe {
    constructor() {
        //create board, 0 means empty
        this.board = Array(9).fill(0);
        //array to keep track of moves for draw and minmax recursion
        this.moves = [];
        //initialize win & draw conditions
        this.isWin = this.isDraw = false;
    }

    //returns 1 or 2 to decide who is playing
    get turn() { // returns 1 or 2
        return 1 + this.moves.length % 2;
    }

    //return array of indexes of available moves
    get validMoves() {
        return [...this.board.keys()].filter(i => !this.board[i])
    }

    //play a move (move is an index on the board)
    play(move) {
        //if board index is not empty (0) or game is in win condition, invalid move
        if (this.board[move] !== 0 || this.isWin) {
            return false;
         }
         //plays a 1 or 2 on the board (representing X or O)
        this.board[move] = this.turn;
        this.moves.push(move);
        //checks the board and updates the game state if needed
        // Use regular expression to detect any 3-in-a-row
        this.isWin = /^(?:...)*([12])\1\1|^.?.?([12])..\2..\2|^([12])...\3...\3|^..([12]).\4.\4/.test(this.board.join(""));
        this.isDraw = !this.isWin && this.moves.length === this.board.length;
        return true;
    }

    //undoes the played turn during minmax recursion so board condition is accurate as
    //board travels recursively up 
    takeBack() {
        //cannot undo moves if there are no moves to undo
        if (this.moves.length === 0) {
            return false;
        }
        //last move is removed and board is placed back with a blank
        this.board[this.moves.pop()] = 0;
        //resets win and draw conditions because going recursively backwards means that
        //the game is not in a terminal condition anymore
        this.isWin = this.isDraw = false;
        return true;
    }

    //minmax algorithm
    minimax() {
        if (this.isWin) {
            return { value: -10 }
        };
        if (this.isDraw) {
            return { value: 0 };
        };
        let best = { value: -Infinity };
        for (let move of this.validMoves) {
            this.play(move);
            let {value} = this.minimax();
            this.takeBack();
            // Reduce magnitude of value (so shorter paths to wins are prioritised) and negate it
            value = value ? (Math.abs(value) - 1) * Math.sign(-value) : 0;
            // keep track of equally valued moves
            if (value >= best.value) {
                if (value > best.value) {
                    best = { value, moves: [] }
                };
                best.moves.push(move); 
            }
        }
        return best;
    }

    // Pick a random move when there are choices:
    goodMove() {
        let {moves} = this.minimax();
        return moves[Math.floor(Math.random() * moves.length)];
    }
}

//main game function that plays the game using the game object and manipulates the DOM
(function main() {
    //cache DOM elements
    const table = document.querySelector("#game");
    const btnNewGame = document.querySelector("#newgame");
    const btnCpuMove = document.querySelector("#cpumove");
    const messageArea = document.querySelector("#message");
    let game, human;

    //renders the game and messages depending on game state
    function render() {
        let tiles = Array.from(document.getElementsByTagName('td'));
        game.board.forEach((cell, i) => table.rows[Math.floor(i / 3)].cells[i % 3].className = "NXO"[cell]);
        messageArea.textContent = game.isWin ? (human == 1 ? "O has won! Press NEW GAME to play again." : "X has won! Press NEW GAME to play again.")
                                : game.isDraw ? "Draw! No one wins. Press NEW GAME to play again."
                                : game.turn == human ? "Your turn" 
                                : "AI is preparing move...";
        //changes tiles from reacting to mouse events when game is terminal
        if (game.isWin || game.isDraw) {
            for (let i = 0; i < game.board.length; i++) {
                if (game.board[i] === 0) {
                    tiles[i].classList.remove('N');
                    tiles[i].classList.add('I');
                }
            }
        }
    }

    //actions for when the ai is taking a turn
    //goes through minmax algorithm to decide on a good index to played
    //added delay so that timing for cpu reply is consistent
    function aiMove() {
        if (game.isWin || game.isDraw) {
            return;
        }; 
        human = 3 - game.turn;
        render();
        setTimeout(() => {
            game.play(game.goodMove());
            render();
        }, 500);
    }

    //when a click happens, play on index clicked, render, and follow up with ai move
    //trigger for event listener
    // ignore click when not human turn, or when invalid move
    function humanMove(i) {
        if (game.turn !== human || !game.play(i)) {
            return
        };
        render();
        aiMove();
    }

    //creates a new game and rerenders
    function newGame() {
        game = new TicTacToe();
        human = 1;
        render(); 
    }

    table.addEventListener("click", e => humanMove(e.target.cellIndex + 3 * e.target.parentNode.rowIndex));
    btnNewGame.addEventListener("click", newGame);
    btnCpuMove.addEventListener("click", aiMove);
    newGame();
})();