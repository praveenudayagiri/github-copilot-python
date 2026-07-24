from flask import Flask, render_template, jsonify, request
import copy
import sudoku_logic

app = Flask(__name__)

DIFFICULTY_TO_CLUES = {
    'easy': 40,
    'medium': 35,
    'hard': 25,
}

# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None,
    'difficulty': 'medium',
    'clues': 35,
    'board': None,
    'hints_used': 0,
}


def normalize_difficulty(difficulty):
    if difficulty is None:
        return 'medium'
    normalized = str(difficulty).strip().lower()
    if normalized in DIFFICULTY_TO_CLUES:
        return normalized
    return 'medium'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/new')
def new_game():
    difficulty = normalize_difficulty(request.args.get('difficulty'))
    clues = DIFFICULTY_TO_CLUES[difficulty]
    puzzle, solution = sudoku_logic.generate_puzzle(clues)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    CURRENT['difficulty'] = difficulty
    CURRENT['clues'] = clues
    CURRENT['board'] = copy.deepcopy(puzzle)
    CURRENT['hints_used'] = 0
    return jsonify({'puzzle': puzzle, 'difficulty': difficulty, 'clues': clues})


@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json or {}
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    if board is None:
        return jsonify({'error': 'No board supplied'}), 400
    CURRENT['board'] = copy.deepcopy(board)
    incorrect = []
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return jsonify({'incorrect': incorrect})


@app.route('/hint', methods=['POST'])
def hint_solution():
    data = request.json or {}
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    if board is None:
        return jsonify({'error': 'No board supplied'}), 400

    CURRENT['board'] = copy.deepcopy(board)
    if sudoku_logic.is_complete_board(board, solution):
        return jsonify({'message': 'Puzzle is already completed.'}), 400

    hint = sudoku_logic.get_hint(board, solution)
    if hint is None:
        return jsonify({'message': 'No empty cells remain.'}), 400

    row, col, value = hint
    if board[row][col] != 0:
        return jsonify({'message': 'No empty cells remain.'}), 400

    board[row][col] = value
    CURRENT['board'] = copy.deepcopy(board)
    CURRENT['puzzle'] = copy.deepcopy(board)
    CURRENT['hints_used'] += 1
    return jsonify({'row': row, 'col': col, 'value': value, 'hint_count': CURRENT['hints_used']})


if __name__ == '__main__':
    app.run(debug=True)