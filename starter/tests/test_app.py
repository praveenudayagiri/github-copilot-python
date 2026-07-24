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


def test_hint_route_returns_hint_and_updates_board():
    app_module.CURRENT["solution"] = [[(row * 3 + row // 3 + col) % 9 + 1 for col in range(9)] for row in range(9)]
    app_module.CURRENT["puzzle"] = [[0 for _ in range(9)] for _ in range(9)]
    app_module.CURRENT["hints_used"] = 0

    client = app.test_client()
    board = [[0 for _ in range(9)] for _ in range(9)]
    response = client.post("/hint", json={"board": board})

    assert response.status_code == 200
    data = response.get_json()
    assert data["row"] == 0
    assert data["col"] == 0
    assert data["value"] == 1
    assert data["hint_count"] == 1


def test_hint_count_increments_on_successive_hints():
    app_module.CURRENT["solution"] = [[(row * 3 + row // 3 + col) % 9 + 1 for col in range(9)] for row in range(9)]
    app_module.CURRENT["puzzle"] = [[0 for _ in range(9)] for _ in range(9)]
    app_module.CURRENT["hints_used"] = 0

    client = app.test_client()
    board = [[0 for _ in range(9)] for _ in range(9)]
    first_response = client.post("/hint", json={"board": board})
    second_response = client.post("/hint", json={"board": board})

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert first_response.get_json()["hint_count"] == 1
    assert second_response.get_json()["hint_count"] == 2


def test_hint_route_returns_message_when_no_empty_cells_remain():
    app_module.CURRENT["solution"] = [[(row * 3 + row // 3 + col) % 9 + 1 for col in range(9)] for row in range(9)]
    app_module.CURRENT["puzzle"] = [[0 for _ in range(9)] for _ in range(9)]
    app_module.CURRENT["hints_used"] = 0

    client = app.test_client()
    board = [[1 for _ in range(9)] for _ in range(9)]
    response = client.post("/hint", json={"board": board})

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "No empty cells remain."
    assert app_module.CURRENT["hints_used"] == 0


def test_hint_route_disallows_hints_for_completed_game():
    app_module.CURRENT["solution"] = [[(row * 3 + row // 3 + col) % 9 + 1 for col in range(9)] for row in range(9)]
    app_module.CURRENT["puzzle"] = [[0 for _ in range(9)] for _ in range(9)]
    app_module.CURRENT["hints_used"] = 0

    client = app.test_client()
    response = client.post("/hint", json={"board": app_module.CURRENT["solution"]})

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "Puzzle is already completed."
    assert app_module.CURRENT["hints_used"] == 0
