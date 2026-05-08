# BridgesCLI

A terminal-based Bridges (Hashiwokakero) puzzle game built with React and [Ink](https://github.com/vadimdemedes/ink).

## What is Bridges?

Bridges (also known as Hashiwokakero) is a logic puzzle where you connect numbered islands with bridges. Each island displays a number indicating exactly how many bridges must connect to it. Bridges can be single or double, and must run horizontally or vertically between islands without crossing.

![Demo](docs/readme-demo-1.png)

## Installation
```bash
# Install globally with bun
bun install -g bridges-cli

# Or clone and run locally
git clone https://github.com/jfinnis/bridgesCLI.git
cd bridgesCLI
bun install

# Run the game
bridges
```

## Gameplay


| Key | Action |
|-----|--------|
| `1-8` | Select a node by its value |
| `a-z` | Disambiguate when multiple nodes share the same value |
| `h/j/k/l` | Draw single bridge (left/down/up/right) |
| `H/J/K/L` | Draw double bridge (left/down/up/right) |
| `n` | Next puzzle (when current is solved) |
| `p` | Previous puzzle |
| `q` | Quit game |


Future puzzles are locked until you complete the current one. You can navigate back to previous puzzles at any time.
Exiting the program will lose your current progress.

### Puzzle Encoding Format
```bash
# Run with custom puzzle encoding
bridges --puzzle "WIDTHxHEIGHT:row1.row2.row3..."
```

**Node encoding:**
- Digits (`1-8`): Island with that value
- Letters (`a-z`): Empty spaces (`a`=1 space, `b`=2 spaces, etc.)

**Bridge encoding (optional):**
- `-`: Single horizontal bridge
- `=`: Double horizontal bridge
- `|`: Single vertical bridge
- `#`: Double vertical bridge

**Example:**
```
3x3:1a2.c.1a2
```
This creates a 3x3 grid with islands of value 1 at top/bottom left corners and islands of value 2 at top/bottom right corners.

## Development
```bash
# Run the game locally
bun start

# Run tests
bun run test

# Type checking
bun run typecheck

# Lint and format
bun run lint
```
