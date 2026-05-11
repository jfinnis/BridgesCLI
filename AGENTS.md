# AGENTS.md

This is a CLI renderer for Hashiwokakero (Bridges) puzzles. It renders a grid of numbered islands in a terminal using Ink (React for CLI).

## Commands

- `bun start` - Run the puzzle (interactive mode)
- `bun start --puzzle <encoding>` - Run with a specific puzzle encoding
- `bun run test` - Run unit tests
- `bun run typecheck` - typescript typechecker
- `bun run lint` - Lint and format

## Gameplay

### Drawing Bridges
1. **Select nodes**: Press the node's value (1-8) to select a node (e.g., `1` for a node with value 1)
2. **Disambiguation**: If multiple nodes share the same value, press the node's label (a-z) to select the correct one - this step is skipped if only one node matches the selected value
3. **Draw bridge**: Press a direction key (`h` = left, `j` = down, `k` = up, `l` = right) to draw a single bridge, or uppercase (`H`/`J`/`K`/`L`) for double bridges

### Solving Puzzles
- When a puzzle is solved, a "Congratulations! Puzzle solved!" message appears
- Press `n` to navigate to the next puzzle
- Future puzzles are locked until the current puzzle is completed
- When all puzzles are solved, an additional "🎉 You've solved all the puzzles! 🎉" message appears

### Navigation
- Press `p` to go to the previous puzzle (only if not on the first puzzle, and can navigate back to current)
- Press `q` at any time to quit the game

## Command Order

Run `lint` before `typecheck` and `test` to catch style issues first.

## Testing

- Tests use Vitest with `@testing-library/react` patterns via `ink-testing-library`.
- The output is a grid drawn with ascii, and tests often do exact matches. When nodes are
highlighted, they have ANSI codes to appear as bold/dim or red/green. The tests will put
these codes directly in the test expectation around the nodes.

## Code Style

- Run linting before committing - the lint command uses Biome.js
- Add comments to separate code blocks. Don't remove existing comments.
- Add a comment above functions that explain the intention of the function.
- Don't re-export imports - no barrel files
- Do not remove comments from code that have valid information.
- Do not remove unit tests unless they're for functionality that is also removed.

