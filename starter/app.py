from flask import Flask, render_template, jsonify, request
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
    return jsonify({'puzzle': puzzle, 'difficulty': difficulty, 'clues': clues})


@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    incorrect = []
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return jsonify({'incorrect': incorrect})


if __name__ == '__main__':
    app.run(debug=True)