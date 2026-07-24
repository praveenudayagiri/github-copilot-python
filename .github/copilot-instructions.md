# GitHub Copilot Instructions for the Sudoku Project

## Project Goal

Refactor the existing Python Flask Sudoku application into a modern, responsive, accessible, and maintainable Sudoku game.

The completed application must include:

- Easy, Medium, and Hard difficulty levels
- Sudoku puzzles with exactly one unique solution
- Locked prefilled cells
- Real-time conflict highlighting
- A Check button
- A Hint button
- A timer
- A Top 10 fastest-times leaderboard
- Browser local storage for leaderboard data
- Light and dark modes
- Responsive desktop and mobile layouts
- Automated tests

## Python Standards

- Use Python 3.12-compatible code.
- Follow PEP 8 conventions.
- Use descriptive function and variable names.
- Keep functions small and focused on one responsibility.
- Add docstrings to important classes and functions.
- Avoid duplicated logic.
- Use type hints where practical.
- Handle errors consistently.
- Do not silently ignore exceptions.

## Flask Structure

- Keep Flask routes simple.
- Move Sudoku generation, solving, validation, and uniqueness logic into reusable Python functions or modules.
- Keep frontend files inside the templates and static directories.
- Do not place all application logic inside app.py.

## Sudoku Requirements

- Every generated puzzle must have one valid completed solution.
- Every generated puzzle must have exactly one unique solution.
- Easy puzzles should contain more prefilled cells than Medium puzzles.
- Medium puzzles should contain more prefilled cells than Hard puzzles.
- Prefilled cells must not be editable.
- A move is invalid when the same number appears in the same row, column, or 3x3 box.
- Invalid and conflicting entries must receive visible feedback.
- Completing the puzzle correctly must trigger a congratulatory message.

## Hint and Check Features

- The Check button must identify incorrect user entries.
- The Hint button must fill one valid empty cell.
- A hinted cell must become locked.
- The number of hints used must be tracked.
- Do not allow hints after the game is completed.

## Timer and Leaderboard

- Start the timer when a new game begins.
- Reset the timer for every new game.
- Stop the timer when the puzzle is completed.
- Store completed scores in browser local storage.
- Each score must include:
  - player name
  - completion time
  - difficulty
  - hints used
- Sort scores by fastest completion time.
- Keep and display only the fastest 10 scores.

## Frontend Standards

- Use semantic HTML.
- Use plain CSS and JavaScript unless an existing dependency is necessary.
- Use clear labels for controls.
- Ensure buttons and inputs can be used with a keyboard.
- Include visible keyboard focus styles.
- Maintain readable colour contrast in light and dark modes.
- Ensure text and controls remain visible on mobile and desktop.
- Use CSS variables for theme colours where practical.
- Avoid layout shifts when validation colours appear.

## Sudoku Grid Styling

- Display the board as a 9x9 grid.
- Use stronger borders between the 3x3 boxes.
- Alternate the background colour of the 3x3 boxes.
- Preserve a consistent cell size.
- Make the grid responsive on small screens.
- Use separate visual styles for:
  - prefilled cells
  - editable cells
  - incorrect cells
  - conflicting cells
  - hinted cells

## Testing Standards

- Use pytest.
- Add tests for:
  - Sudoku generation
  - Sudoku solving
  - unique-solution validation
  - row validation
  - column validation
  - 3x3 box validation
  - difficulty settings
  - hint behaviour
  - Flask routes where appropriate
- Tests must be deterministic where possible.
- Do not weaken or remove tests simply to make them pass.

## Copilot Behaviour

- Explain significant changes before making them.
- Do not rewrite unrelated working code.
- Suggest small, reviewable changes.
- Preserve existing working behaviour unless the rubric requires a change.
- Mention security, accessibility, or correctness concerns when relevant.
- Do not claim a puzzle is unique unless the code counts possible solutions.
- Ask for clarification when a requirement is genuinely ambiguous.