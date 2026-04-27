import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'
import HashiRow from '../../components/HashiRow.tsx'
import type { SelectionState } from '../../gameState/types.ts'

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
                nodes={[{ value: 2, lineRight: 1 }, { value: '-' }, { value: 3, lineLeft: 1 }]}
                rowIndex={0}
            />
        )
        expect(lastFrame()).toEqual(
            ` ╭───╮     ╭───╮
 │ 2 ├─────┤ 3 │
 ╰───╯     ╰───╯`
        )
    })

    it('renders a vertical node', () => {
        const { lastFrame } = render(
            <HashiRow nodes={[{ value: 1 }, { value: '|' }, { value: 3 }]} rowIndex={0} />
        )
        expect(lastFrame()).toEqual(
            ` ╭───╮  │  ╭───╮
 │ 1 │  │  │ 3 │
 ╰───╯  │  ╰───╯`
        )
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
                ` [1m╭───╮[22m
 [1m│ 1 │[22m
 [1m╰───╯[22m`
            )
        })

        it('renders dimmed node when value does not match', () => {
            const { lastFrame } = render(
                <HashiRow nodes={[{ value: 1 }]} rowIndex={0} highlightedNode={2} />
            )
            expect(lastFrame()).toEqual(
                ` [2m╭───╮[22m
 [2m│ 1 │[22m
 [2m╰───╯[22m`
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
                ` [2m╭───╮[22m[1m╭───╮[22m[2m╭───╮[22m
 [2m│ 1 │[22m[1m│ 2 │[22m[2m│ 3 │[22m
 [2m╰───╯[22m[1m╰───╯[22m[2m╰───╯[22m`
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
                ` [2m╭───╮[22m[1m╭───╮[22m[2m╭───╮[22m
 [2m│ 1 │[22m[1m│ 1 │[22m[2m│ 1 │[22m
 [2m╰───╯[22m[1m╰───╯[22m[2m╰───╯[22m`
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
                ` [2m╭───╮[22m[1m╭───╮[22m[2m╭───╮[22m
 [2m│ 1 │[22m[1m│ 1 │[22m[2m│ 1 │[22m
 [2m╰───╯[22m[1m╰───╯[22m[2m╰───╯[22m`
            )
        })
    })

    describe('validation state colors', () => {
        it('shows green on valid nodes in selected mode', () => {
            const selectionState: SelectionState = {
                mode: 'selected',
                selectedNumber: 1,
                direction: 'h',
                matchingNodes: [{ row: 0, col: 0 }],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 0 },
            }
            const { lastFrame } = render(
                <HashiRow
                    nodes={[{ value: 1, lineRight: 1 }, { value: '-' }, { value: 2, lineLeft: 1 }]}
                    rowIndex={0}
                    selectionState={selectionState}
                />
            )
            expect(lastFrame()).toEqual(
` [32m[1m╭───╮[22m[39m[2m     ╭───╮[22m
 [32m[1m│ 1 ├[22m[39m[2m─────┤ 2 │[22m
 [32m[1m╰───╯[22m[39m[2m     ╰───╯[22m`
            )
        })
    })
})
