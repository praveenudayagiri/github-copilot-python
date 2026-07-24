import copy
import random

SIZE = 9
EMPTY = 0

def deep_copy(board):
    return copy.deepcopy(board)

def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def count_solutions(board, limit=2):
    """
    Counts the number of solutions for a Sudoku board.
    Stops counting once more than one solution is found (for efficiency).
    
    Args:
        board: The Sudoku board to analyze
        limit: Stop counting at this many solutions (default 2)
    
    Returns:
        The number of solutions, capped at the limit value
    """
    # Use a copy to avoid modifying the original board
    board_copy = deep_copy(board)
    solutions = [0]  # Use list to allow modification in nested function
    
    def backtrack():
        # If we've found enough solutions, stop searching
        if solutions[0] >= limit:
            return
        
        # Find the next empty cell
        for row in range(SIZE):
            for col in range(SIZE):
                if board_copy[row][col] == EMPTY:
                    for num in range(1, SIZE + 1):
                        if is_safe(board_copy, row, col, num):
                            board_copy[row][col] = num
                            backtrack()
                            board_copy[row][col] = EMPTY
                    return
        
        # No empty cells found - we have a complete solution
        solutions[0] += 1
    
    backtrack()
    return solutions[0]

def remove_cells(board, clues):
    """
    Removes cells from a completed board to create a puzzle with exactly one solution.
    
    Only removes a cell if the resulting puzzle still has exactly one solution.
    
    Args:
        board: A completed Sudoku board to remove cells from
        clues: The target number of clues (filled cells) to keep
    """
    removed = 0
    target_removals = SIZE * SIZE - clues
    
    while removed < target_removals:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        
        if board[row][col] != EMPTY:
            cell_value = board[row][col]
            board[row][col] = EMPTY
            
            # Check if the puzzle still has exactly one solution
            if count_solutions(board) == 1:
                removed += 1
            else:
                # Restore the cell if removing it creates multiple or no solutions
                board[row][col] = cell_value

def generate_puzzle(clues=35):
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution
