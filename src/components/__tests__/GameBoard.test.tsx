import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import GameBoard from '../GameBoard.tsx'

/**
 * Note on ANSI sequences:
 * \x1b[1m - bold (selected node)
 * \x1b[2m - dim (inactive/unselected nodes)
 * \x1b[22m - normal (turns off bold/dim)
 * \x1b[31m - red (error - too many bridges)
 * \x1b[32m - green (success - correct number of bridges)
 * \x1b[39m - reset all (default foreground + bold/dim off)
 */
describe('GameBoard', () => {
    it('renders basic grid', () => {
        const { lastFrame } = render(
            <GameBoard
                numNodes={3}
                rows={[
                    [{ value: 2 }, { value: ' ' }, { value: 2 }],
                    [{ value: ' ' }, { value: 1 }, { value: ' ' }],
                    [{ value: 2 }, { value: ' ' }, { value: 2 }],
                ]}
            />
        )

        expect(lastFrame()).toEqual(`┌─────────────────┐
│ ╭───╮     ╭───╮ │
│ │ 2 │     │ 2 │ │
│ ╰───╯     ╰───╯ │
│      ╭───╮      │
│      │ 1 │      │
│      ╰───╯      │
│ ╭───╮     ╭───╮ │
│ │ 2 │     │ 2 │ │
│ ╰───╯     ╰───╯ │
└─────────────────┘`)
    })

    describe('bridges', () => {
        it('renders horizontal bridge', () => {
            const { lastFrame } = render(
                <GameBoard
                    numNodes={2}
                    rows={[
                        [
                            { value: 2, lineRight: 1 },
                            { value: 2, lineLeft: 1 },
                        ],
                    ]}
                />
            )

            expect(lastFrame()).toEqual(`┌────────────┐
│ ╭───╮╭───╮ │
│ │ 2 ├┤ 2 │ │
│ ╰───╯╰───╯ │
└────────────┘`)
        })

        it('renders vertical bridge', () => {
            const { lastFrame } = render(
                <GameBoard
                    numNodes={1}
                    rows={[[{ value: 2, lineDown: 1 }], [{ value: 2, lineUp: 1 }]]}
                />
            )

            expect(lastFrame()).toEqual(`┌───────┐
│ ╭───╮ │
│ │ 2 │ │
│ ╰─┬─╯ │
│ ╭─┴─╮ │
│ │ 2 │ │
│ ╰───╯ │
└───────┘`)
        })

        it('renders double horizontal bridge', () => {
            const { lastFrame } = render(
                <GameBoard
                    numNodes={2}
                    rows={[
                        [
                            { value: 3, lineRight: 2 },
                            { value: 3, lineLeft: 2 },
                        ],
                    ]}
                />
            )

            expect(lastFrame()).toEqual(`┌────────────┐
│ ╭───╮╭───╮ │
│ │ 3 ╞╡ 3 │ │
│ ╰───╯╰───╯ │
└────────────┘`)
        })

        it('renders double vertical bridge', () => {
            const { lastFrame } = render(
                <GameBoard
                    numNodes={1}
                    rows={[[{ value: 3, lineDown: 2 }], [{ value: 3, lineUp: 2 }]]}
                />
            )

            expect(lastFrame()).toEqual(`┌───────┐
│ ╭───╮ │
│ │ 3 │ │
│ ╰─╥─╯ │
│ ╭─╨─╮ │
│ │ 3 │ │
│ ╰───╯ │
└───────┘`)
        })

        it('renders bridge cells between nodes', () => {
            const { lastFrame } = render(
                <GameBoard
                    numNodes={3}
                    rows={[
                        [
                            { value: 2, lineRight: 1 },
                            { value: '-', lineLeft: 1, lineRight: 1 },
                            { value: 2, lineLeft: 1 },
                        ],
                    ]}
                />
            )

            expect(lastFrame()).toEqual(`┌─────────────────┐
│ ╭───╮     ╭───╮ │
│ │ 2 ├─────┤ 2 │ │
│ ╰───╯     ╰───╯ │
└─────────────────┘`)
        })
    })

    describe('highlights', () => {
        it('dims unselected nodes when a number is selected', () => {
            const { lastFrame } = render(
                <GameBoard
                    numNodes={2}
                    rows={[
                        [{ value: 1 }, { value: 1 }],
                        [{ value: 2 }, { value: 2 }],
                    ]}
                    selectionState={{
                        mode: 'selecting-node',
                        selectedNumber: 1,
                        direction: null,
                        matchingNodes: [],
                        disambiguationLabels: [],
                        selectedNode: { row: 0, col: 0 },
                    }}
                />
            )

            expect(lastFrame()).toEqual(`┌────────────┐
│ \x1b[1m╭───╮\x1b[22m\x1b[2m╭───╮\x1b[22m │
│ \x1b[1m│ 1 │\x1b[22m\x1b[2m│ 1 │\x1b[22m │
│ \x1b[1m╰───╯\x1b[22m\x1b[2m╰───╯\x1b[22m │
│ \x1b[2m╭───╮╭───╮\x1b[22m │
│ \x1b[2m│ 2 ││ 2 │\x1b[22m │
│ \x1b[2m╰───╯╰───╯\x1b[22m │
└────────────┘`)
        })

        it('highlights selected node with bold', () => {
            const { lastFrame } = render(
                <GameBoard
                    numNodes={2}
                    rows={[[{ value: 1 }, { value: 2 }]]}
                    selectionState={{
                        mode: 'selected',
                        selectedNumber: 1,
                        direction: 'l',
                        matchingNodes: [],
                        disambiguationLabels: [],
                        selectedNode: { row: 0, col: 0 },
                    }}
                />
            )

            expect(lastFrame()).toEqual(`┌────────────┐
│ \x1b[1m╭───╮\x1b[22m\x1b[2m╭───╮\x1b[22m │
│ \x1b[1m│ 1 │\x1b[22m\x1b[2m│ 2 │\x1b[22m │
│ \x1b[1m╰───╯\x1b[22m\x1b[2m╰───╯\x1b[22m │
└────────────┘`)
        })
    })

    describe('solution mode coloring', () => {
        it('renders nodes in solution mode', () => {
            const { lastFrame } = render(
                <GameBoard
                    numNodes={2}
                    rows={[
                        [
                            { value: 2, lineRight: 2 },
                            { value: 2, lineLeft: 2 },
                        ],
                    ]}
                    showSolution={true}
                />
            )

            // Solution mode renders with green coloring on valid nodes
            expect(lastFrame()).toContain('\x1b[32m')
        })
    })

    describe('disambiguation labels', () => {
        it('shows disambiguation labels for multiple nodes with same number', () => {
            const { lastFrame } = render(
                <GameBoard
                    numNodes={2}
                    rows={[
                        [{ value: 1 }, { value: ' ' }],
                        [{ value: 1 }, { value: ' ' }],
                    ]}
                    selectionState={{
                        mode: 'disambiguation',
                        selectedNumber: 1,
                        direction: null,
                        matchingNodes: [
                            { row: 0, col: 0 },
                            { row: 1, col: 0 },
                        ],
                        disambiguationLabels: ['a', 'b'],
                        selectedNode: null,
                    }}
                />
            )

            expect(lastFrame()).toEqual(`┌────────────┐
│ \x1b[1m╭a──╮\x1b[22m      │
│ \x1b[1m│ 1 │\x1b[22m      │
│ \x1b[1m╰───╯\x1b[22m      │
│ \x1b[1m╭b──╮\x1b[22m      │
│ \x1b[1m│ 1 │\x1b[22m      │
│ \x1b[1m╰───╯\x1b[22m      │
└────────────┘`)
        })
    })
})
