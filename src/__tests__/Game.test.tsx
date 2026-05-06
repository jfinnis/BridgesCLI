import { setTimeout } from 'node:timers/promises'
import { render } from 'ink-testing-library'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Game from '../Game.tsx'
import { type PuzzleData, samplePuzzles } from '../utils/puzzle-encoding.ts'

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

    describe('game controls - toggle solution', () => {
        it('pressing s toggles the solution on and off', async () => {
            const puzzle = samplePuzzles[0] as PuzzleData
            const puzzles = Array(5).fill(puzzle)
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={true} />
            )

            const frame = lastFrame()
            expect(frame).toContain('Bridges: Puzzle #1')
            expect(frame).toContain('• Type a number [1-8] to select a node')
            expect(frame).toContain('s: Show solution')
            // We don't match any bridge patterns
            expect(frame).not.toMatch('╞')
            expect(frame).not.toMatch('╡')

            // Now toggle the solution on
            stdin.write('s')
            await setTimeout(5)
            const frame2 = lastFrame()
            expect(frame2).toContain('Viewing solution (press s to return to puzzle)')
            // Check for green ANSI code and bridge pattern
            expect(frame2).toMatch(/╞.+╡/)

            // And toggle it off again
            stdin.write('s')
            await setTimeout(5)
            const frame3 = lastFrame()
            expect(frame3).toContain('• Type a number [1-8] to select a node')
            expect(frame).not.toMatch('╞')
            expect(frame).not.toMatch('╡')
        })
    })

    describe('game controls - next/previous', () => {
        it('navigates to next puzzle with n key when interactive', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={TEST_PUZZLES_5} hasCustomPuzzle={false} enableSolutions={false} />
            )

            expect(lastFrame()).toContain('Bridges: Puzzle #1')

            stdin.write('n')
            await setTimeout(5)
            expect(lastFrame()).toContain('Bridges: Puzzle #2')
        })

        it('navigates to previous puzzle with p key when interactive', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={TEST_PUZZLES_5} hasCustomPuzzle={false} enableSolutions={false} />
            )

            stdin.write('n')
            await setTimeout(5)
            expect(lastFrame()).toContain('Bridges: Puzzle #2')

            stdin.write('p')
            await setTimeout(5)
            expect(lastFrame()).toContain('Bridges: Puzzle #1')
        })

        it('does not navigate past last puzzle', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={TEST_PUZZLES_5} hasCustomPuzzle={false} enableSolutions={false} />
            )

            // Navigate to last puzzle (index 4)
            stdin.write('n')
            await setTimeout(5)
            stdin.write('n')
            await setTimeout(5)
            stdin.write('n')
            await setTimeout(5)
            stdin.write('n')
            await setTimeout(5)

            // Try to go past last puzzle
            stdin.write('n')
            await setTimeout(5)

            // Should still be on last puzzle
            expect(lastFrame()).toContain('Bridges: Puzzle #5')
        })

        it('does not navigate before first puzzle', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={TEST_PUZZLES_5} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const { stdin, lastFrame } = render(
                <Game puzzles={puzzles} hasCustomPuzzle={false} enableSolutions={false} />
            )

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
            const exitMock = vi.fn()
            vi.spyOn(process, 'exit').mockImplementation(exitMock as any)

            const { stdin } = render(
                <Game puzzles={TEST_PUZZLES_5} hasCustomPuzzle={false} enableSolutions={false} />
            )

            stdin.write('q')
            await setTimeout(5)

            expect(exitMock).toHaveBeenCalledWith(0)
        })
    })
})
