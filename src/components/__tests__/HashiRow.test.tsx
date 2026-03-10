import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'
import HashiRow from '../../components/HashiRow.tsx'
import type { SelectionState } from '../../types.ts'

describe('HashiRow component', () => {
    it('renders three nodes', () => {
        const { lastFrame } = render(
            <HashiRow nodes={[{ value: 1 }, { value: 2 }, { value: 3 }]} rowIndex={0} />
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
                rowIndex={0}
            />
        )
        expect(lastFrame()).toEqual(` \x1b[32m╭───╮\x1b[39m     ╭───╮
 \x1b[32m│ 1 ├\x1b[39m─────┤ 3 │
 \x1b[32m╰───╯\x1b[39m     ╰───╯`)
    })

    it('renders a vertical node', () => {
        const { lastFrame } = render(
            <HashiRow nodes={[{ value: 1 }, { value: '|' }, { value: 3 }]} rowIndex={0} />
        )
        expect(lastFrame()).toEqual(` ╭───╮  │  ╭───╮
 │ 1 │  │  │ 3 │
 ╰───╯  │  ╰───╯`)
    })

    it('renders empty positions as spaces', () => {
        const { lastFrame } = render(
            <HashiRow nodes={[{ value: 1 }, { value: ' ' }, { value: 3 }]} rowIndex={0} />
        )
        expect(lastFrame()).toEqual(
            ` ╭───╮     ╭───╮
 │ 1 │     │ 3 │
 ╰───╯     ╰───╯`
        )
    })

    describe('highlighted nodes', () => {
        it('renders highlighted node with bold when value matches', () => {
            const { lastFrame } = render(
                <HashiRow nodes={[{ value: 1 }]} rowIndex={0} highlightedNode={1} />
            )
            expect(lastFrame()).toEqual(
                ` \x1b[1m╭───╮\x1b[22m
 \x1b[1m│ 1 │\x1b[22m
 \x1b[1m╰───╯\x1b[22m`
            )
        })

        it('renders dimmed node when value does not match', () => {
            const { lastFrame } = render(
                <HashiRow nodes={[{ value: 1 }]} rowIndex={0} highlightedNode={2} />
            )
            expect(lastFrame()).toEqual(
                ` \x1b[2m╭───╮\x1b[22m
 \x1b[2m│ 1 │\x1b[22m
 \x1b[2m╰───╯\x1b[22m`
            )
        })

        it('renders multiple nodes with one highlighted and others dimmed', () => {
            const { lastFrame } = render(
                <HashiRow
                    nodes={[{ value: 1 }, { value: 2 }, { value: 3 }]}
                    rowIndex={0}
                    highlightedNode={2}
                />
            )
            expect(lastFrame()).toEqual(
                ` \x1b[2m╭───╮\x1b[22m\x1b[1m╭───╮\x1b[22m\x1b[2m╭───╮\x1b[22m
 \x1b[2m│ 1 │\x1b[22m\x1b[1m│ 2 │\x1b[22m\x1b[2m│ 3 │\x1b[22m
 \x1b[2m╰───╯\x1b[22m\x1b[1m╰───╯\x1b[22m\x1b[2m╰───╯\x1b[22m`
            )
        })

        it('renders normal when highlightedNode is undefined', () => {
            const { lastFrame } = render(<HashiRow nodes={[{ value: 1 }]} rowIndex={0} />)
            expect(lastFrame()).toEqual(
                ` ╭───╮
 │ 1 │
 ╰───╯`
            )
        })

        it('highlights only specific node in selecting-node mode', () => {
            const selectionState: SelectionState = {
                mode: 'selecting-node',
                selectedNumber: 1,
                direction: null,
                matchingNodes: [{ row: 0, col: 1 }],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 1 },
            }
            const { lastFrame } = render(
                <HashiRow
                    nodes={[{ value: 1 }, { value: 1 }, { value: 1 }]}
                    rowIndex={0}
                    selectionState={selectionState}
                />
            )
            expect(lastFrame()).toEqual(
                ` \x1b[2m╭───╮\x1b[22m\x1b[1m╭───╮\x1b[22m\x1b[2m╭───╮\x1b[22m
 \x1b[2m│ 1 │\x1b[22m\x1b[1m│ 1 │\x1b[22m\x1b[2m│ 1 │\x1b[22m
 \x1b[2m╰───╯\x1b[22m\x1b[1m╰───╯\x1b[22m\x1b[2m╰───╯\x1b[22m`
            )
        })

        it('dims non-selected nodes in invalid mode but keeps selected highlighted', () => {
            const selectionState: SelectionState = {
                mode: 'invalid',
                selectedNumber: 1,
                direction: 'h',
                matchingNodes: [{ row: 0, col: 1 }],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 1 },
            }
            const { lastFrame } = render(
                <HashiRow
                    nodes={[{ value: 1 }, { value: 1 }, { value: 1 }]}
                    rowIndex={0}
                    selectionState={selectionState}
                />
            )
            expect(lastFrame()).toEqual(
                ` \x1b[2m╭───╮\x1b[22m\x1b[1m╭───╮\x1b[22m\x1b[2m╭───╮\x1b[22m
 \x1b[2m│ 1 │\x1b[22m\x1b[1m│ 1 │\x1b[22m\x1b[2m│ 1 │\x1b[22m
 \x1b[2m╰───╯\x1b[22m\x1b[1m╰───╯\x1b[22m\x1b[2m╰───╯\x1b[22m`
            )
        })
    })
})
