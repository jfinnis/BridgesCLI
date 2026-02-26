import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import HashiGrid from '../HashiGrid.tsx'

describe('HashiGrid', () => {
    it('renders multiple rows', () => {
        const { lastFrame } = render(
            <HashiGrid
                numNodes={5}
                rows={[
                    [{ value: 3 }, { value: ' ' }, { value: 2 }, { value: ' ' }, { value: ' ' }],
                    [{ value: ' ' }, { value: 1 }, { value: 3 }, { value: 2 }, { value: ' ' }],
                    [{ value: ' ' }, { value: ' ' }, { value: ' ' }, { value: 1 }, { value: 1 }],
                    [{ value: 4 }, { value: ' ' }, { value: ' ' }, { value: ' ' }, { value: 3 }],
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
        it('throws if row length does not match numNodes', () => {
            const { lastFrame } = render(
                <HashiGrid numNodes={3} rows={[[{ value: 1 }, { value: ' ' }]]} />
            )
            expect(lastFrame()).toContain('expected 3 nodes, got 2')
        })

        it('throws if node value is invalid', () => {
            const { lastFrame } = render(
                <HashiGrid numNodes={1} rows={[[{ value: 'invalid' } as never]]} />
            )
            expect(lastFrame()).toContain('invalid value')
        })
    })
})
