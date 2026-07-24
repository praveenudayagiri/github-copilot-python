# Flask Sudoku

A responsive Flask-based Sudoku game with multiple difficulty levels, unique-solution puzzle generation, real-time conflict highlighting, hints, a timer, and a local leaderboard. The project combines a Python backend with a browser-based interface for a complete single-player experience.

## Overview

This application lets players start a new puzzle, enter values into the 9x9 grid, check their work, request hints, and track their completion time. The game is designed to be played directly in a web browser and to keep the experience accessible on desktop and mobile screens.

## Implemented features

- Easy, Medium, and Hard difficulty levels
- Puzzles generated from a complete valid board and validated to have exactly one solution
- Locked prefilled cells that cannot be edited
- Real-time highlighting of duplicate values within the same row, column, or 3×3 box
- A Check Solution button that highlights incorrect entries
- A Hint button that fills one valid empty cell and increments the hint counter
- A timer that starts when a new game begins and stops when the puzzle is solved
- A Top 10 leaderboard stored in browser local storage
- Light and dark themes with persistence across reloads
- Alternating colours for each 3×3 box to make the board easier to scan


## Technology stack

- Python
- Flask
- HTML, CSS, and JavaScript
- pytest

## Project folder structure

```text
.github/
README.md
Screenshots/
starter/
  app.py
  sudoku_logic.py
  requirements.txt
  static/
    main.js
    styles.css
  templates/
    index.html
  tests/
    test_app.py
    test_sudoku_logic.py
```

## Windows installation

1. Open PowerShell in the repository root.
2. Change into the starter directory:

```powershell
cd starter
```

3. Create the virtual environment inside starter:

```powershell
python -m venv .venv
```

4. Activate the virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks the activation script, run the following command once for the current session:

```powershell
Set-ExecutionPolicy -Scope Process RemoteSigned
```

5. Install the Python dependencies from the current starter directory:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

6. Start the Flask application:

```powershell
python app.py
```

7. Open http://127.0.0.1:5000 in your browser.

## Virtual environment setup

The virtual environment is created inside starter/.venv.

## Dependency installation

The required packages are listed in [starter/requirements.txt](starter/requirements.txt):

- Flask
- pytest

## How to run the Flask app

From the repository root, run:

```powershell
cd starter
python app.py
```

The app will start in development mode and serve the game at http://127.0.0.1:5000.

## How to run pytest

From the repository root:

```powershell
cd starter
.\.venv\Scripts\Activate.ps1
python -m pytest -q
```

## Current test summary

The current pytest suite covers:

- Flask route behaviour in [starter/tests/test_app.py](starter/tests/test_app.py)
- Sudoku generation, solving, uniqueness checks, hints, and validation helpers in [starter/tests/test_sudoku_logic.py](starter/tests/test_sudoku_logic.py)

No coverage percentage is reported in the repository, so this README does not claim one.

## Gameplay details

### Difficulty levels and clue counts

- Easy = 40 clues
- Medium = 35 clues
- Hard = 25 clues

### Unique-solution generation

Each generated puzzle is created from a completed valid board and checked so that the resulting puzzle has exactly one solution.

### Conflict highlighting

Values that conflict with the same row, column, or 3×3 box are highlighted in real time while the player enters them.

### Hint behavior

The Hint button fills one valid empty cell, locks that cell, and increases the hint counter. Hints are not allowed once the puzzle is already complete.

### Timer

The timer starts when a new game begins and stops when the puzzle is solved correctly.

### Top 10 leaderboard

When a player completes a puzzle, they can enter a name and save their result to the Top 10 leaderboard. The leaderboard is stored in the browser's local storage and includes:

- player name
- completion time
- difficulty
- hints used

Scores are sorted by shortest completion time, and only the fastest 10 results are retained.

## Visual design details

- Alternating colours are applied to each 3×3 box for easier visual scanning.
- The app supports a persistent dark and light theme that is saved in browser storage.

## How to play

1. Open the app in your browser.
2. Choose a difficulty level from the dropdown.
3. Start a new game.
4. Enter numbers into the empty cells.
5. Use Check Solution to review incorrect entries.
6. Use Hint if you need help.
7. Complete the puzzle to stop the timer and save your result to the leaderboard.

## Screenshots

The repository currently contains prompt and evidence images in [Screenshots](Screenshots). These are not all gameplay screenshots of the final UI.

### Copilot evidence screenshots

- [Screenshots/copilot_alternating_boxes_prompt_1.png](Screenshots/copilot_alternating_boxes_prompt_1.png)
- [Screenshots/copilot_alternating_boxes_prompt_2.png](Screenshots/copilot_alternating_boxes_prompt_2.png)
- [Screenshots/copilot_alternating_boxes_prompt_3.png](Screenshots/copilot_alternating_boxes_prompt_3.png)
- [Screenshots/copilot_rejected_incomplete_difficulty_change.png](Screenshots/copilot_rejected_incomplete_difficulty_change.png)
- [Screenshots/copilot_testing_framework_prompt.png](Screenshots/copilot_testing_framework_prompt.png)
- [Screenshots/copilot_top10_local_storage_prompt_1.png](Screenshots/copilot_top10_local_storage_prompt_1.png)
- [Screenshots/copilot_top10_local_storage_prompt_2.png](Screenshots/copilot_top10_local_storage_prompt_2.png)
- [Screenshots/copilot_top10_local_storage_prompt_3.png](Screenshots/copilot_top10_local_storage_prompt_3.png)
- [Screenshots/copilot_top10_local_storage_prompt_4.png](Screenshots/copilot_top10_local_storage_prompt_4.png)
- [Screenshots/copilot_unique_solution_prompt_1.png](Screenshots/copilot_unique_solution_prompt_1.png)
- [Screenshots/copilot_unique_solution_prompt_2.png](Screenshots/copilot_unique_solution_prompt_2.png)

### Application screenshots

No dedicated application screenshots are currently stored in [Screenshots](Screenshots). The folder currently contains Copilot-related evidence images rather than gameplay captures.

## Known limitations

- Leaderboard data is stored only in the browser's local storage, so it is not shared across devices or users.
- The Hint button fills the first available empty cell rather than letting the player choose a specific cell.
- The project does not include server-side persistence, authentication, or deployment configuration.

## Future improvements

Possible next steps include:

- Adding a server-backed leaderboard
- Improving puzzle generation controls and difficulty tuning
- Adding undo and redo support
- Adding more keyboard shortcuts and polish for accessibility
