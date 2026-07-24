import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sudoku_logic import (
    SIZE,
    create_empty_board,
    deep_copy,
    generate_puzzle,
    is_safe,
)


def test_create_empty_board_returns_9x9_zero_board():
    board = create_empty_board()

    assert len(board) == SIZE
    assert all(len(row) == SIZE for row in board)
    assert all(value == 0 for row in board for value in row)


def test_deep_copy_returns_independent_copy():
    board = create_empty_board()
    board[0][0] = 5

    copy_board = deep_copy(board)
    copy_board[0][0] = 1

    assert board[0][0] == 5


def test_is_safe_detects_valid_and_invalid_moves():
    board = create_empty_board()

    assert is_safe(board, 0, 0, 5) is True

    board[0][0] = 5
    assert is_safe(board, 0, 1, 5) is False


def test_generate_puzzle_returns_puzzle_and_solution():
    puzzle, solution = generate_puzzle(clues=35)

    assert len(puzzle) == SIZE
    assert len(solution) == SIZE
    assert all(len(row) == SIZE for row in puzzle)
    assert all(len(row) == SIZE for row in solution)
    assert any(cell == 0 for row in puzzle for cell in row)
    assert all(cell != 0 for row in solution for cell in row)
