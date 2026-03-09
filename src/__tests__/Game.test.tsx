import { setTimeout } from 'node:timers/promises'
import { render } from 'ink-testing-library'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Game from '../Game.tsx'
import { type PuzzleData, samplePuzzles } from '../utils/puzzle-encoding.ts'

const TEST_PUZZLE = { encoding: '3x3:1a1.c.2a2' }
const TEST_PUZZLE_2 = { encoding: '3x3:3a3.c.1a1' }
const SMALL_PUZZLE_3X3 = { encoding: '3x3:2a3.c.1a2' }

describe('Game', () => {
    beforeEach(() => {
        Object.defineProperty(process.stdin, 'isTTY', {
            get: () => true,
            configurable: true,
        })
        vi.spyOn(process.stdin, 'isTTY', 'get').mockReturnValue(true)
    })

    describe('--stdout flag', () => {
        it('does not show instructions when stdout is true', () => {
            const { lastFrame } = render(
                <Game puzzles={[TEST_PUZZLE]} hasCustomPuzzle={false} stdout={true} />
            )
            expect(lastFrame()).not.toContain('Controls:')
        })

        it('shows instructions when stdout is false', () => {
            const { lastFrame } = render(
                <Game puzzles={[TEST_PUZZLE]} hasCustomPuzzle={false} stdout={false} />
            )
            expect(lastFrame()).toContain('Controls:')
        })
    })

    describe('game controls - toggle solution', () => {
        it('pressing s toggles the solution on and off', async () => {
            const { stdin, lastFrame } = render(
                <Game
                    puzzles={[samplePuzzles[0] as PuzzleData]}
                    hasCustomPuzzle={false}
                    stdout={false}
                />
            )

            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Type a number [1-8] to select a node

┌─────────────────────────────────────┐
│ ╭───╮     ╭───╮     ╭───╮     ╭───╮ │
│ │ 4 │     │ 3 │     │ 3 │     │ 3 │ │
│ ╰───╯     ╰───╯     ╰───╯     ╰───╯ │
│      ╭───╮               ╭───╮      │
│      │ 2 │               │ 4 │      │
│      ╰───╯               ╰───╯      │
│ ╭───╮          ╭───╮          ╭───╮ │
│ │ 3 │          │ 3 │          │ 3 │ │
│ ╰───╯          ╰───╯          ╰───╯ │
│                                     │
│                                     │
│                                     │
│ ╭───╮          ╭───╮     ╭───╮      │
│ │ 2 │          │ 8 │     │ 4 │      │
│ ╰───╯          ╰───╯     ╰───╯      │
│                     ╭───╮     ╭───╮ │
│                     │ 1 │     │ 3 │ │
│                     ╰───╯     ╰───╯ │
│      ╭───╮     ╭───╮     ╭───╮      │
│      │ 1 │     │ 4 │     │ 1 │      │
│      ╰───╯     ╰───╯     ╰───╯      │
└─────────────────────────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)

            // Now toggle the solution on
            stdin.write('s')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Viewing solution (press s to return to puzzle)

┌─────────────────────────────────────┐
│ ╭───╮     ╭───╮     ╭───╮     ╭───╮ │
│ │ 4 ╞═════╡ 3 ├─────┤ 3 ╞═════╡ 3 │ │
│ ╰─╥─╯     ╰───╯     ╰───╯     ╰─┬─╯ │
│   ║  ╭───╮               ╭───╮  │   │
│   ║  │ 2 ╞═══════════════╡ 4 │  │   │
│   ║  ╰───╯               ╰─╥─╯  │   │
│ ╭─╨─╮          ╭───╮       ║  ╭─┴─╮ │
│ │ 3 ├──────────┤ 3 │       ║  │ 3 │ │
│ ╰───╯          ╰─╥─╯       ║  ╰─╥─╯ │
│                  ║         ║    ║   │
│                  ║         ║    ║   │
│                  ║         ║    ║   │
│ ╭───╮          ╭─╨─╮     ╭─╨─╮  ║   │
│ │ 2 ╞══════════╡ 8 ╞═════╡ 4 │  ║   │
│ ╰───╯          ╰─╥─╯     ╰───╯  ║   │
│                  ║  ╭───╮     ╭─╨─╮ │
│                  ║  │ 1 ├─────┤ 3 │ │
│                  ║  ╰───╯     ╰───╯ │
│      ╭───╮     ╭─╨─╮     ╭───╮      │
│      │ 1 ├─────┤ 4 ├─────┤ 1 │      │
│      ╰───╯     ╰───╯     ╰───╯      │
└─────────────────────────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)

            // And toggle it off again
            stdin.write('s')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Type a number [1-8] to select a node

┌─────────────────────────────────────┐
│ ╭───╮     ╭───╮     ╭───╮     ╭───╮ │
│ │ 4 │     │ 3 │     │ 3 │     │ 3 │ │
│ ╰───╯     ╰───╯     ╰───╯     ╰───╯ │
│      ╭───╮               ╭───╮      │
│      │ 2 │               │ 4 │      │
│      ╰───╯               ╰───╯      │
│ ╭───╮          ╭───╮          ╭───╮ │
│ │ 3 │          │ 3 │          │ 3 │ │
│ ╰───╯          ╰───╯          ╰───╯ │
│                                     │
│                                     │
│                                     │
│ ╭───╮          ╭───╮     ╭───╮      │
│ │ 2 │          │ 8 │     │ 4 │      │
│ ╰───╯          ╰───╯     ╰───╯      │
│                     ╭───╮     ╭───╮ │
│                     │ 1 │     │ 3 │ │
│                     ╰───╯     ╰───╯ │
│      ╭───╮     ╭───╮     ╭───╮      │
│      │ 1 │     │ 4 │     │ 1 │      │
│      ╰───╯     ╰───╯     ╰───╯      │
└─────────────────────────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)
        })
    })

    describe('game controls - next/previous', () => {
        it('navigates to next puzzle with n key when interactive', async () => {
            const { stdin, lastFrame } = render(
                <Game
                    puzzles={[TEST_PUZZLE, TEST_PUZZLE_2]}
                    hasCustomPuzzle={false}
                    stdout={false}
                />
            )

            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Type a number [1-2] to select a node

┌─────────────────┐
│ ╭───╮     ╭───╮ │
│ │ 1 │     │ 1 │ │
│ ╰───╯     ╰───╯ │
│                 │
│                 │
│                 │
│ ╭───╮     ╭───╮ │
│ │ 2 │     │ 2 │ │
│ ╰───╯     ╰───╯ │
└─────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)

            stdin.write('n')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #2
• Type a number [1-3] to select a node

┌─────────────────┐
│ ╭───╮     ╭───╮ │
│ │ 3 │     │ 3 │ │
│ ╰───╯     ╰───╯ │
│                 │
│                 │
│                 │
│ ╭───╮     ╭───╮ │
│ │ 1 │     │ 1 │ │
│ ╰───╯     ╰───╯ │
└─────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)
        })

        it('navigates to previous puzzle with p key when interactive', async () => {
            const { stdin, lastFrame } = render(
                <Game
                    puzzles={[TEST_PUZZLE, TEST_PUZZLE_2]}
                    hasCustomPuzzle={false}
                    stdout={false}
                />
            )

            stdin.write('n')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #2
• Type a number [1-3] to select a node

┌─────────────────┐
│ ╭───╮     ╭───╮ │
│ │ 3 │     │ 3 │ │
│ ╰───╯     ╰───╯ │
│                 │
│                 │
│                 │
│ ╭───╮     ╭───╮ │
│ │ 1 │     │ 1 │ │
│ ╰───╯     ╰───╯ │
└─────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)

            stdin.write('p')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Type a number [1-2] to select a node

┌─────────────────┐
│ ╭───╮     ╭───╮ │
│ │ 1 │     │ 1 │ │
│ ╰───╯     ╰───╯ │
│                 │
│                 │
│                 │
│ ╭───╮     ╭───╮ │
│ │ 2 │     │ 2 │ │
│ ╰───╯     ╰───╯ │
└─────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)
        })

        it('does not navigate past last puzzle', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={[TEST_PUZZLE]} hasCustomPuzzle={false} stdout={false} />
            )

            stdin.write('n')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Type a number [1-2] to select a node

┌─────────────────┐
│ ╭───╮     ╭───╮ │
│ │ 1 │     │ 1 │ │
│ ╰───╯     ╰───╯ │
│                 │
│                 │
│                 │
│ ╭───╮     ╭───╮ │
│ │ 2 │     │ 2 │ │
│ ╰───╯     ╰───╯ │
└─────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)
        })

        it('does not navigate before first puzzle', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={[TEST_PUZZLE]} hasCustomPuzzle={false} stdout={false} />
            )

            stdin.write('p')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Type a number [1-2] to select a node

┌─────────────────┐
│ ╭───╮     ╭───╮ │
│ │ 1 │     │ 1 │ │
│ ╰───╯     ╰───╯ │
│                 │
│                 │
│                 │
│ ╭───╮     ╭───╮ │
│ │ 2 │     │ 2 │ │
│ ╰───╯     ╰───╯ │
└─────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)
        })
    })

    describe('game controls - node selection', () => {
        it('selects node immediately when there is only one of that number', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={[SMALL_PUZZLE_3X3]} hasCustomPuzzle={false} stdout={false} />
            )

            // Press '3' to select single node of value 3
            stdin.write('3')
            await setTimeout(5)
            expect(lastFrame()).toContain('Select direction with h/j/k/l')
            expect(lastFrame()).not.toContain('╭a──╮')
        })

        it('shows disambiguation labels when multiple nodes have the same number', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={[SMALL_PUZZLE_3X3]} hasCustomPuzzle={false} stdout={false} />
            )

            // Press '2' to select from multiple nodes with value 2
            stdin.write('2')
            await setTimeout(5)
            expect(lastFrame()).toContain('Press label shown to select that node')
            expect(lastFrame()).toContain('╭a──╮')
            expect(lastFrame()).toContain('╭b──╮')
        })

        it('selects a specific node when disambiguation label is pressed', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={[SMALL_PUZZLE_3X3]} hasCustomPuzzle={false} stdout={false} />
            )

            // Press '1' to select from multiple nodes with value 1
            stdin.write('1')
            await setTimeout(5)

            // Press 'a' to select the second node
            stdin.write('b')
            await setTimeout(5)
            expect(lastFrame()).toContain('Select direction with h/j/k/l')
        })

        it('draws a bridge when a valid direction is selected', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={[SMALL_PUZZLE_3X3]} hasCustomPuzzle={false} stdout={false} />
            )

            // Press '1' to enter disambiguation mode
            stdin.write('1')
            await setTimeout(5)

            // Press 'b' to select the second node
            stdin.write('b')
            await setTimeout(5)

            // Press 'l' to draw a bridge to the right
            stdin.write('l')
            await setTimeout(5)
            expect(lastFrame()).toContain('Drew horizontal bridge')
        })

        it('shows an invalid message for a bad bridge direction off the grid', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={[SMALL_PUZZLE_3X3]} hasCustomPuzzle={false} stdout={false} />
            )

            // Press '1' to enter disambiguation mode
            stdin.write('1')
            await setTimeout(5)

            // Press 'b' to select the second node
            stdin.write('b')
            await setTimeout(5)

            // Press 'h' to draw a bridge to the left
            stdin.write('h')
            await setTimeout(5)
            expect(lastFrame()).toContain('Cannot draw bridge left from node')
        })

        it('shows an invalid message for horizontal bridge colliding with bridge', async () => {
            const puzzleWithBarrier = { encoding: '4x3:2a2a.a1|1.b1a' }
            const { stdin, lastFrame } = render(
                <Game puzzles={[puzzleWithBarrier]} hasCustomPuzzle={false} stdout={false} />
            )
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Type a number [1-2] to select a node

┌──────────────────────┐
│ ╭───╮     ╭───╮      │
│ │ 2 │     │ 2 │      │
│ ╰───╯     ╰─┬─╯      │
│      ╭───╮  │  ╭───╮ │
│      │ 1 │  │  │ 1 │ │
│      ╰───╯  │  ╰───╯ │
│           ╭─┴─╮      │
│           │ 1 │      │
│           ╰───╯      │
└──────────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)

            stdin.write('1')
            await setTimeout(5)
            stdin.write('a')
            await setTimeout(5)
            stdin.write('l')
            await setTimeout(5)
            expect(lastFrame()).toContain('Cannot draw bridge right from node')
        })

        it('shows an invalid message for vertical bridge colliding with bridge', async () => {
            const puzzleWithBarrier = { encoding: '4x3:2a2a.a1=1.b1a' }
            const { stdin, lastFrame } = render(
                <Game puzzles={[puzzleWithBarrier]} hasCustomPuzzle={false} stdout={false} />
            )
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Type a number [1-2] to select a node

┌──────────────────────┐
│ ╭───╮     ╭───╮      │
│ │ 2 │     │ 2 │      │
│ ╰───╯     ╰───╯      │
│      ╭───╮     ╭───╮ │
│      │ 1 ╞═════╡ 1 │ │
│      ╰───╯     ╰───╯ │
│           ╭───╮      │
│           │ 1 │      │
│           ╰───╯      │
└──────────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)

            stdin.write('2')
            await setTimeout(5)
            stdin.write('b')
            await setTimeout(5)
            stdin.write('j')
            await setTimeout(5)
            expect(lastFrame()).toContain('Cannot draw bridge down from node')
        })

        it('resets selection when Escape is pressed', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={[SMALL_PUZZLE_3X3]} hasCustomPuzzle={false} stdout={false} />
            )

            stdin.write('2')
            await setTimeout(5)
            expect(lastFrame()).toContain('Press label shown')

            // Note: Escape key handling may not work in test environment
            // Testing that we entered disambiguation mode successfully
            stdin.write('\x1b')
            await setTimeout(5)
            expect(lastFrame()).toContain('Type a number')
        })
    })

    describe('game controls - drawing each kind of bridge', () => {
        it('draws horizontal bridge', async () => {
            const puzzleWithEachBridge = { encoding: '3x3:2a3.c.3a4' }
            const { stdin, lastFrame } = render(
                <Game puzzles={[puzzleWithEachBridge]} hasCustomPuzzle={false} stdout={false} />
            )
            stdin.write('3')
            await setTimeout(5)
            expect(lastFrame()).toContain('Press label shown to select that node')
            stdin.write('a')
            await setTimeout(5)
            expect(lastFrame()).toContain('Select direction with h/j/k/l')
            stdin.write('h')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Drew horizontal bridge

┌─────────────────┐
│ \x1b[2m╭───╮\x1b[22m     \x1b[1m╭───╮\x1b[22m │
│ \x1b[2m│ 2 ├─────\x1b[22m\x1b[1m┤ 3 │\x1b[22m │
│ \x1b[2m╰───╯\x1b[22m     \x1b[1m╰───╯\x1b[22m │
│                 │
│                 │
│                 │
│ \x1b[2m╭───╮\x1b[22m     \x1b[2m╭───╮\x1b[22m │
│ \x1b[2m│ 3 │\x1b[22m     \x1b[2m│ 4 │\x1b[22m │
│ \x1b[2m╰───╯\x1b[22m     \x1b[2m╰───╯\x1b[22m │
└─────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)
        })

        it('draws a vertical bridge', async () => {
            const puzzleWithEachBridge = { encoding: '3x3:2a3.c.3a4' }
            const { stdin, lastFrame } = render(
                <Game puzzles={[puzzleWithEachBridge]} hasCustomPuzzle={false} stdout={false} />
            )
            stdin.write('2')
            await setTimeout(5)
            stdin.write('j')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Drew vertical bridge

┌─────────────────┐
│ \x1b[1m╭───╮\x1b[22m     \x1b[2m╭───╮\x1b[22m │
│ \x1b[1m│ 2 │\x1b[22m     \x1b[2m│ 3 │\x1b[22m │
│ \x1b[1m╰─┬─╯\x1b[22m     \x1b[2m╰───╯\x1b[22m │
│ \x1b[2m  │  \x1b[22m           │
│ \x1b[2m  │  \x1b[22m           │
│ \x1b[2m  │  \x1b[22m           │
│ \x1b[2m╭─┴─╮\x1b[22m     \x1b[2m╭───╮\x1b[22m │
│ \x1b[2m│ 3 │\x1b[22m     \x1b[2m│ 4 │\x1b[22m │
│ \x1b[2m╰───╯\x1b[22m     \x1b[2m╰───╯\x1b[22m │
└─────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)
        })

        it('draws a double horizontal bridge', async () => {
            const puzzleWithEachBridge = { encoding: '3x3:2a3.c.3a4' }
            const { stdin, lastFrame } = render(
                <Game puzzles={[puzzleWithEachBridge]} hasCustomPuzzle={false} stdout={false} />
            )
            stdin.write('3')
            await setTimeout(5)
            expect(lastFrame()).toContain('Press label shown to select that node')
            stdin.write('a')
            await setTimeout(5)
            expect(lastFrame()).toContain('Select direction with h/j/k/l')
            stdin.write('H')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Drew double horizontal bridge

┌─────────────────┐
│ \x1b[2m╭───╮\x1b[22m     \x1b[1m╭───╮\x1b[22m │
│ \x1b[2m│ 2 ╞═════\x1b[22m\x1b[1m╡ 3 │\x1b[22m │
│ \x1b[2m╰───╯\x1b[22m     \x1b[1m╰───╯\x1b[22m │
│                 │
│                 │
│                 │
│ \x1b[2m╭───╮\x1b[22m     \x1b[2m╭───╮\x1b[22m │
│ \x1b[2m│ 3 │\x1b[22m     \x1b[2m│ 4 │\x1b[22m │
│ \x1b[2m╰───╯\x1b[22m     \x1b[2m╰───╯\x1b[22m │
└─────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)
        })

        it('draws a double vertical bridge', async () => {
            const puzzleWithEachBridge = { encoding: '3x3:2a3.c.3a4' }
            const { stdin, lastFrame } = render(
                <Game puzzles={[puzzleWithEachBridge]} hasCustomPuzzle={false} stdout={false} />
            )
            stdin.write('2')
            await setTimeout(5)
            stdin.write('J')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Drew double vertical bridge

┌─────────────────┐
│ \x1b[1m╭───╮\x1b[22m     \x1b[2m╭───╮\x1b[22m │
│ \x1b[1m│ 2 │\x1b[22m     \x1b[2m│ 3 │\x1b[22m │
│ \x1b[1m╰─╥─╯\x1b[22m     \x1b[2m╰───╯\x1b[22m │
│ \x1b[2m  ║  \x1b[22m           │
│ \x1b[2m  ║  \x1b[22m           │
│ \x1b[2m  ║  \x1b[22m           │
│ \x1b[2m╭─╨─╮\x1b[22m     \x1b[2m╭───╮\x1b[22m │
│ \x1b[2m│ 3 │\x1b[22m     \x1b[2m│ 4 │\x1b[22m │
│ \x1b[2m╰───╯\x1b[22m     \x1b[2m╰───╯\x1b[22m │
└─────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)
        })

        it('does not draw a bridge over an existing bridge', async () => {
            const puzzleWithEachBridge = { encoding: '4x3:1a3a.a2#2.3a4a' }
            const { stdin, lastFrame } = render(
                <Game puzzles={[puzzleWithEachBridge]} hasCustomPuzzle={false} stdout={false} />
            )
            expect(lastFrame()).toEqual(`Bridges: Puzzle #1
• Type a number [1-4] to select a node

┌──────────────────────┐
│ ╭───╮     ╭───╮      │
│ │ 1 │     │ 3 │      │
│ ╰───╯     ╰─╥─╯      │
│      ╭───╮  ║  ╭───╮ │
│      │ 2 │  ║  │ 2 │ │
│      ╰───╯  ║  ╰───╯ │
│ ╭───╮     ╭─╨─╮      │
│ │ 3 │     │ 4 │      │
│ ╰───╯     ╰───╯      │
└──────────────────────┘

Controls:
p: Previous puzzle
n: Next puzzle
s: Show solution
q: Quit`)

            stdin.write('2')
            await setTimeout(5)
            stdin.write('a')
            await setTimeout(5)
            stdin.write('l')
            await setTimeout(5)
            expect(lastFrame()).toContain('Cannot draw bridge right from node')
        })

        it('erases a bridge', async () => {
            const puzzleWithEachBridge = { encoding: '3x3:2a3.c.3a4' }
            const { stdin, lastFrame } = render(
                <Game puzzles={[puzzleWithEachBridge]} hasCustomPuzzle={false} stdout={false} />
            )
            stdin.write('3')
            await setTimeout(5)
            stdin.write('a')
            await setTimeout(5)
            stdin.write('h')
            await setTimeout(5)
            expect(lastFrame()).toContain('Drew horizontal bridge')

            stdin.write('3')
            await setTimeout(5)
            stdin.write('a')
            await setTimeout(5)
            stdin.write('h')
            await setTimeout(5)
            expect(lastFrame()).toContain('Erased bridge')

            // Verify the bridge was actually erased (grid shows no bridge)
            expect(lastFrame()).not.toContain('╞═════')
            expect(lastFrame()).not.toContain('═╡')
        })
    })
})
