import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import HashiGrid from '../HashiGrid.tsx'

describe('HashiGrid', () => {
    it('renders multiple rows', () => {
        const { lastFrame } = render(
            <HashiGrid
                numNodes={5}
                rows={[
                    [
                        { position: 0, value: 3 },
                        { position: 2, value: 2 },
                    ],
                    [
                        { position: 1, value: 1 },
                        { position: 2, value: 3 },
                        { position: 3, value: 2 },
                    ],
                    [
                        { position: 3, value: 1 },
                        { position: 4, value: 1 },
                    ],
                    [
                        { position: 0, value: 4 },
                        { position: 4, value: 3 },
                    ],
                ]}
            />
        )

        expect(lastFrame()).toEqual(
            `Sample Puzzle #1

┌───────────────────────────┐
│ ╭───╮     ╭───╮           │
│ │ 3 │     │ 2 │           │
│ ╰───╯     ╰───╯           │
│      ╭───╮╭───╮╭───╮      │
│      │ 1 ││ 3 ││ 2 │      │
│      ╰───╯╰───╯╰───╯      │
│                ╭───╮╭───╮ │
│                │ 1 ││ 1 │ │
│                ╰───╯╰───╯ │
│ ╭───╮               ╭───╮ │
│ │ 4 │               │ 3 │ │
│ ╰───╯               ╰───╯ │
└───────────────────────────┘`
        )
    })

    describe('grid data validation', () => {
        it('throws if node position is greater than the max row length', () => {
            const { lastFrame } = render(
                <HashiGrid numNodes={3} rows={[[{ position: 5, value: 1 }]]} />
            )
            expect(lastFrame()).toContain('position 5 is invalid')
        })

        it('throws if node position is less than 0', () => {
            const { lastFrame } = render(
                <HashiGrid numNodes={3} rows={[[{ position: -1, value: 1 }]]} />
            )
            expect(lastFrame()).toContain('position -1 is invalid')
        })
    })
})
