import { setTimeout } from 'node:timers/promises'
import { render } from 'ink-testing-library'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Game from '../Game.tsx'

const TEST_PUZZLE = '3x3:1a1.c.2a2'
const TEST_PUZZLE_2 = '3x3:3a3.c.1a1'

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

    describe('game controls', () => {
        it('navigates to next puzzle with n key when interactive', async () => {
            const { stdin, lastFrame } = render(
                <Game
                    puzzles={[TEST_PUZZLE, TEST_PUZZLE_2]}
                    hasCustomPuzzle={false}
                    stdout={false}
                />
            )

            expect(lastFrame()).toEqual(`Sample Puzzle #1

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
q: Quit`)

            stdin.write('n')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Sample Puzzle #2

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
            expect(lastFrame()).toEqual(`Sample Puzzle #2

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
q: Quit`)

            stdin.write('p')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Sample Puzzle #1

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
q: Quit`)
        })

        it('does not navigate past last puzzle', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={[TEST_PUZZLE]} hasCustomPuzzle={false} stdout={false} />
            )

            stdin.write('n')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Sample Puzzle #1

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
q: Quit`)
        })

        it('does not navigate before first puzzle', async () => {
            const { stdin, lastFrame } = render(
                <Game puzzles={[TEST_PUZZLE]} hasCustomPuzzle={false} stdout={false} />
            )

            stdin.write('p')
            await setTimeout(5)
            expect(lastFrame()).toEqual(`Sample Puzzle #1

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
q: Quit`)
        })
    })
})
