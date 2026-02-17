import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import Game from '../Game.tsx'

const TEST_PUZZLE = '7x7:4a3a3a3.a2c4a.3b3b3.g.2b8a4a.d1a3.a1a4a1a'

describe('Game', () => {
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
