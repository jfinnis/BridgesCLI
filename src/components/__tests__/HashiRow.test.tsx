import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import HashiRow from '../../components/HashiRow.tsx'

describe('HashiRow component', () => {
    it('renders three nodes', () => {
        const { lastFrame } = render(
            <HashiRow nodes={[{ value: 1 }, { value: 2 }, { value: 3 }]} />
        )
        expect(lastFrame()).toEqual(
            ` ╭───╮╭───╮╭───╮
 │ 1 ││ 2 ││ 3 │
 ╰───╯╰───╯╰───╯`
        )
    })

    it('renders nodes connected horizontally', () => {
        const { lastFrame } = render(
            <HashiRow
                nodes={[{ value: 1, lineRight: 1 }, { value: '-' }, { value: 3, lineLeft: 1 }]}
            />
        )
        expect(lastFrame()).toEqual(` ╭───╮     ╭───╮
 │ 1 ├─────┤ 3 │
 ╰───╯     ╰───╯`)
    })

    it('renders a vertical node', () => {
        const { lastFrame } = render(
            <HashiRow nodes={[{ value: 1 }, { value: '|' }, { value: 3 }]} />
        )
        expect(lastFrame()).toEqual(` ╭───╮  │  ╭───╮
 │ 1 │  │  │ 3 │
 ╰───╯  │  ╰───╯`)
    })

    it('renders empty positions as spaces', () => {
        const { lastFrame } = render(
            <HashiRow nodes={[{ value: 1 }, { value: ' ' }, { value: 3 }]} />
        )
        expect(lastFrame()).toEqual(
            ` ╭───╮     ╭───╮
 │ 1 │     │ 3 │
 ╰───╯     ╰───╯`
        )
    })

    describe('highlighted nodes', () => {
        it('renders highlighted node with bold when value matches', () => {
            const { lastFrame } = render(<HashiRow nodes={[{ value: 1 }]} highlightedNode={1} />)
            expect(lastFrame()).toEqual(
                ` \x1b[1m╭───╮\x1b[22m
 \x1b[1m│ 1 │\x1b[22m
 \x1b[1m╰───╯\x1b[22m`
            )
        })

        it('renders dimmed node when value does not match', () => {
            const { lastFrame } = render(<HashiRow nodes={[{ value: 1 }]} highlightedNode={2} />)
            expect(lastFrame()).toEqual(
                ` \x1b[2m╭───╮\x1b[22m
 \x1b[2m│ 1 │\x1b[22m
 \x1b[2m╰───╯\x1b[22m`
            )
        })

        it('renders multiple nodes with one highlighted and others dimmed', () => {
            const { lastFrame } = render(
                <HashiRow nodes={[{ value: 1 }, { value: 2 }, { value: 3 }]} highlightedNode={2} />
            )
            expect(lastFrame()).toEqual(
                ` \x1b[2m╭───╮\x1b[22m\x1b[1m╭───╮\x1b[22m\x1b[2m╭───╮\x1b[22m
 \x1b[2m│ 1 │\x1b[22m\x1b[1m│ 2 │\x1b[22m\x1b[2m│ 3 │\x1b[22m
 \x1b[2m╰───╯\x1b[22m\x1b[1m╰───╯\x1b[22m\x1b[2m╰───╯\x1b[22m`
            )
        })

        it('renders normal when highlightedNode is undefined', () => {
            const { lastFrame } = render(<HashiRow nodes={[{ value: 1 }]} />)
            expect(lastFrame()).toEqual(
                ` ╭───╮
 │ 1 │
 ╰───╯`
            )
        })
    })
})
