# AGENTS.md

This is a CLI renderer for Hashiwokakero (Bridges) puzzles. It renders a grid of numbered islands in a terminal using Ink (React for CLI).

## Commands

- `bun start` - Run the puzzle (interactive mode)
- `bun start --puzzle <encoding>` - Run with a specific puzzle encoding
- `bun run test` - Run unit tests
- `bun run typecheck` - typescript typechecker
- `bun run lint` - Lint and format

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

