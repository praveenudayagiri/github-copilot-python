import sys
from pathlib import Path
from unittest.mock import Mock

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import app as app_module
from app import app


def test_home_route_returns_200():
    client = app.test_client()
    response = client.get("/")

    assert response.status_code == 200


def build_puzzle(clues):
    puzzle = [[0 for _ in range(9)] for _ in range(9)]
    filled = 0
    for row in range(9):
        for col in range(9):
            if filled >= clues:
                break
            puzzle[row][col] = 1
            filled += 1
        if filled >= clues:
            break
    return puzzle


def mock_generate_puzzle(monkeypatch):
    def _generate_puzzle(clues):
        return (build_puzzle(clues), [[1 for _ in range(9)] for _ in range(9)])

    mocked_generate_puzzle = Mock(side_effect=_generate_puzzle)
    monkeypatch.setattr(app_module.sudoku_logic, "generate_puzzle", mocked_generate_puzzle)
    return mocked_generate_puzzle


@pytest.mark.parametrize(("difficulty", "expected_clues"), [
    ("easy", 40),
    ("medium", 35),
    ("hard", 25),
])
def test_new_game_uses_requested_difficulty(monkeypatch, difficulty, expected_clues):
    mocked_generate_puzzle = mock_generate_puzzle(monkeypatch)

    client = app.test_client()
    response = client.get(f"/new?difficulty={difficulty}")

    assert response.status_code == 200
    data = response.get_json()
    assert data["difficulty"] == difficulty
    assert data["clues"] == expected_clues
    assert len(data["puzzle"]) == 9
    assert sum(cell != 0 for row in data["puzzle"] for cell in row) == expected_clues
    mocked_generate_puzzle.assert_called_once_with(expected_clues)


def test_new_game_defaults_to_medium_when_missing_difficulty(monkeypatch):
    mocked_generate_puzzle = mock_generate_puzzle(monkeypatch)

    client = app.test_client()
    response = client.get("/new")

    assert response.status_code == 200
    data = response.get_json()
    assert data["difficulty"] == "medium"
    assert data["clues"] == 35
    assert sum(cell != 0 for row in data["puzzle"] for cell in row) == 35
    mocked_generate_puzzle.assert_called_once_with(35)


def test_new_game_defaults_to_medium_for_invalid_difficulty(monkeypatch):
    mocked_generate_puzzle = mock_generate_puzzle(monkeypatch)

    client = app.test_client()
    response = client.get("/new?difficulty=banana")

    assert response.status_code == 200
    data = response.get_json()
    assert data["difficulty"] == "medium"
    assert data["clues"] == 35
    mocked_generate_puzzle.assert_called_once_with(35)
