import { setTimeout } from 'node:timers/promises'
import { render } from 'ink-testing-library'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Game from '../Game.tsx'

const TEST_PUZZLE = { encoding: '3x3:1a1.c.2a2' }
const TEST_PUZZLE_2 = { encoding: '3x3:3a3.c.1a1' }
const SMALL_PUZZLE_3X3 = { encoding: '3x3:2a3.c.1a2' }

// Create 5 identical puzzles for tests (divisible by 5 for PuzzleProgress)
const TEST_PUZZLES_5 = [TEST_PUZZLE, TEST_PUZZLE_2, SMALL_PUZZLE_3X3, TEST_PUZZLE, TEST_PUZZLE_2]

describe('Game', () => {
    beforeEach(() => {
        Object.defineProperty(process.stdin, 'isTTY', {
            get: () => true,
            configurable: true,
        })
    })

    describe('game controls - next/previous', () => {
        it('does not navigate to next puzzle with n key when current puzzle not solved', async () => {
            const { stdin, lastFrame } = render(<Game puzzles={TEST_PUZZLES_5} />)

            expect(lastFrame()).toContain('Bridges: Puzzle #1')

            stdin.write('n')
            await setTimeout(5)
            // Should still be on puzzle #1 because it's not solved
            expect(lastFrame()).toContain('Bridges: Puzzle #1')
        })

        it('navigates to next puzzle with n key after solving current puzzle', async () => {
            const puzzle = { encoding: '3x3:2a1.c.2a1' }
            const puzzles = Array(5).fill(puzzle)
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            // Solve puzzle 1
            stdin.write('2')
            await setTimeout(10)
            stdin.write('a')
            await setTimeout(10)
            stdin.write('l')
            await setTimeout(10)

            stdin.write('2')
            await setTimeout(10)
            stdin.write('b')
            await setTimeout(10)
            stdin.write('l')
            await setTimeout(10)

            stdin.write('2')
            await setTimeout(10)
            stdin.write('a')
            await setTimeout(10)
            stdin.write('j')
            await setTimeout(100)

            expect(lastFrame()).toContain('Congratulations! Puzzle solved!')

            // Now navigate to puzzle 2 - it should become in-progress
            stdin.write('n')
            await setTimeout(100)

            expect(lastFrame()).toContain('Bridges: Puzzle #2')
        })

        it('navigates to previous puzzle with p key when interactive', async () => {
            const { stdin, lastFrame } = render(<Game puzzles={TEST_PUZZLES_5} />)

            // 'p' should work to go back (even from puzzle #1, it stays at #1)
            stdin.write('p')
            await setTimeout(5)
            expect(lastFrame()).toContain('Bridges: Puzzle #1')
        })

        it('does not navigate past last puzzle', async () => {
            const puzzle = { encoding: '3x3:2a1.c.2a1' }
            const puzzles = Array(5).fill(puzzle)
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            // Navigate to last puzzle (puzzle 5) by solving each puzzle and pressing 'n'
            for (let i = 0; i < 4; i++) {
                // Solve the current puzzle
                stdin.write('2')
                await setTimeout(5)
                stdin.write('a')
                await setTimeout(5)
                stdin.write('l')
                await setTimeout(5)

                stdin.write('2')
                await setTimeout(5)
                stdin.write('b')
                await setTimeout(5)
                stdin.write('l')
                await setTimeout(5)

                stdin.write('2')
                await setTimeout(5)
                stdin.write('a')
                await setTimeout(5)
                stdin.write('j')
                await setTimeout(50)

                expect(lastFrame()).toContain('Congratulations! Puzzle solved!')

                // Navigate to next puzzle (marks it as in-progress)
                stdin.write('n')
                await setTimeout(50)
            }

            expect(lastFrame()).toContain('Bridges: Puzzle #5')

            // Try to go past last puzzle
            stdin.write('n')
            await setTimeout(50)

            // Should still be on last puzzle
            expect(lastFrame()).toContain('Bridges: Puzzle #5')
        })

        it('does not navigate before first puzzle', async () => {
            const { stdin, lastFrame } = render(<Game puzzles={TEST_PUZZLES_5} />)

            stdin.write('p')
            await setTimeout(5)
            expect(lastFrame()).toContain('Bridges: Puzzle #1')
        })
    })

    describe('game controls - node selection', () => {
        it('selects node immediately when there is only one of that number', async () => {
            const puzzles = [
                SMALL_PUZZLE_3X3,
                TEST_PUZZLE,
                TEST_PUZZLE_2,
                TEST_PUZZLE,
                TEST_PUZZLE_2,
            ]
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('3')
            await setTimeout(5)
            expect(lastFrame()).toContain('Select direction with h/j/k/l')
            expect(lastFrame()).not.toContain('╭a──╮')
        })

        it('shows disambiguation labels when multiple nodes have the same number', async () => {
            const puzzles = [
                SMALL_PUZZLE_3X3,
                TEST_PUZZLE,
                TEST_PUZZLE_2,
                TEST_PUZZLE,
                TEST_PUZZLE_2,
            ]
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('2')
            await setTimeout(5)
            expect(lastFrame()).toContain('Press label shown to select that node')
            expect(lastFrame()).toContain('╭a──╮')
            expect(lastFrame()).toContain('╭b──╮')
        })

        it('selects a specific node when disambiguation label is pressed', async () => {
            const puzzles = [
                SMALL_PUZZLE_3X3,
                TEST_PUZZLE,
                TEST_PUZZLE_2,
                TEST_PUZZLE,
                TEST_PUZZLE_2,
            ]
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('1')
            await setTimeout(5)
            stdin.write('b')
            await setTimeout(5)
            expect(lastFrame()).toContain('Select direction with h/j/k/l')
        })

        it('draws a bridge when a valid direction is selected', async () => {
            const puzzles = [
                SMALL_PUZZLE_3X3,
                TEST_PUZZLE,
                TEST_PUZZLE_2,
                TEST_PUZZLE,
                TEST_PUZZLE_2,
            ]
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('1')
            await setTimeout(5)
            stdin.write('b')
            await setTimeout(5)
            stdin.write('l')
            await setTimeout(5)
            expect(lastFrame()).toContain('Drew horizontal bridge')
        })

        it('shows an invalid message for a bad bridge direction off the grid', async () => {
            const puzzles = [
                SMALL_PUZZLE_3X3,
                TEST_PUZZLE,
                TEST_PUZZLE_2,
                TEST_PUZZLE,
                TEST_PUZZLE_2,
            ]
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('1')
            await setTimeout(5)
            stdin.write('b')
            await setTimeout(5)
            stdin.write('h')
            await setTimeout(5)
            expect(lastFrame()).toContain('Cannot draw bridge left from node')
        })
    })

    describe('game controls - drawing each kind of bridge', () => {
        it('draws horizontal bridge', async () => {
            const puzzleWithEachBridge = { encoding: '3x3:2a3.c.3a4' }
            const puzzles = Array(5).fill(puzzleWithEachBridge)
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('3')
            await setTimeout(5)
            stdin.write('a')
            await setTimeout(5)
            stdin.write('h')
            await setTimeout(5)
            expect(lastFrame()).toContain('Drew horizontal bridge')
            expect(lastFrame()).toMatch(/├.+┤/)
        })

        it('draws a vertical bridge', async () => {
            const puzzleWithEachBridge = { encoding: '3x3:2a3.c.3a4' }
            const puzzles = Array(5).fill(puzzleWithEachBridge)
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('2')
            await setTimeout(5)
            stdin.write('j')
            await setTimeout(5)
            expect(lastFrame()).toContain('Drew vertical bridge')
            expect(lastFrame()).toMatch(/╰.+┬.+╯/)
        })

        it('draws a double horizontal bridge', async () => {
            const puzzleWithEachBridge = { encoding: '3x3:3a4.c.2a4' }
            const puzzles = Array(5).fill(puzzleWithEachBridge)
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('3')
            await setTimeout(5)
            stdin.write('L')
            await setTimeout(5)
            expect(lastFrame()).toContain('Drew double horizontal bridge')
            expect(lastFrame()).toMatch(/╞.+╡/)
        })

        it('draws a double vertical bridge', async () => {
            const puzzleWithEachBridge = { encoding: '3x3:3a2.c.4a2' }
            const puzzles = Array(5).fill(puzzleWithEachBridge)
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('3')
            await setTimeout(5)
            stdin.write('J')
            await setTimeout(5)
            expect(lastFrame()).toContain('Drew double vertical bridge')
            expect(lastFrame()).toMatch(/╰.+╥.+╯/)
        })

        it('erases a bridge', async () => {
            const puzzleWithBridge = { encoding: '3x3:2a1.b.2a1' }
            const puzzles = Array(5).fill(puzzleWithBridge)
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('2')
            await setTimeout(5)
            stdin.write('a')
            await setTimeout(5)
            stdin.write('l')
            await setTimeout(5)
            expect(lastFrame()).toContain('Drew horizontal bridge')

            stdin.write('2')
            await setTimeout(5)
            stdin.write('a')
            await setTimeout(5)
            stdin.write('l')
            await setTimeout(5)
            expect(lastFrame()).toContain('Erased bridge')
        })
    })

    describe('game controls - solving puzzles', () => {
        it('detects a valid solution', async () => {
            const puzzle = { encoding: '3x3:2a1.c.2a1' }
            const puzzles = Array(5).fill(puzzle)
            const { stdin, lastFrame } = render(<Game puzzles={puzzles} />)

            stdin.write('2')
            await setTimeout(5)
            stdin.write('a')
            await setTimeout(5)
            stdin.write('l')
            await setTimeout(5)

            stdin.write('2')
            await setTimeout(5)
            stdin.write('b')
            await setTimeout(5)
            stdin.write('l')
            await setTimeout(5)

            stdin.write('2')
            await setTimeout(5)
            stdin.write('a')
            await setTimeout(5)
            stdin.write('j')
            await setTimeout(50)

            expect(lastFrame()).toContain('Congratulations! Puzzle solved!')
        })
    })

    describe('game controls - quit', () => {
        it('quits when q is pressed', async () => {
            const exitMock = vi.fn<(code?: string | number | null | undefined) => never>()
            vi.spyOn(process, 'exit').mockImplementation(exitMock)

            const { stdin } = render(<Game puzzles={TEST_PUZZLES_5} />)

            stdin.write('q')
            await setTimeout(5)

            expect(exitMock).toHaveBeenCalledWith(0)
        })
    })
})
