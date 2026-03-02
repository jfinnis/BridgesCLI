import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import type { HashiNodeData } from '../../types.ts'
import HashiRow, { constructNode, getDisplayMode } from '../HashiRow.tsx'

describe('getDisplayMode()', () => {
    it('returns normal when highlightedNode is undefined', () => {
        const node: HashiNodeData = { value: 1 }
        expect(getDisplayMode(node, undefined)).toBe('normal')
    })

    it('returns highlight when node value matches highlightedNode', () => {
        const node: HashiNodeData = { value: 2 }
        expect(getDisplayMode(node, 2)).toBe('highlight')
    })

    it('returns dim when node value does not match highlightedNode', () => {
        const node: HashiNodeData = { value: 1 }
        expect(getDisplayMode(node, 2)).toBe('dim')
    })

    it('returns dim for bridge nodes when highlightedNode is set', () => {
        expect(getDisplayMode({ value: '-' }, 2)).toBe('dim')
        expect(getDisplayMode({ value: '|' }, 2)).toBe('dim')
        expect(getDisplayMode({ value: '#' }, 2)).toBe('dim')
    })

    it('returns highlight for bridge nodes that are the highlighted value', () => {
        expect(getDisplayMode({ value: '-' }, 2)).toBe('dim')
    })
})

describe('constructNode()', () => {
    describe('empty node', () => {
        it('renders space value with no lines', () => {
            const node: HashiNodeData = { value: ' ' }
            expect(constructNode(node, 0)).toEqual('     ')
            expect(constructNode(node, 1)).toEqual('     ')
            expect(constructNode(node, 2)).toEqual('     ')
        })
    })

    describe('horizontal line node', () => {
        it('renders a horizontal line in the middle', () => {
            const node: HashiNodeData = { value: '-' }
            expect(constructNode(node, 0)).toEqual('     ')
            expect(constructNode(node, 1)).toEqual('─────')
            expect(constructNode(node, 2)).toEqual('     ')
        })

        it('renders a double horizontal line in the middle', () => {
            const node: HashiNodeData = { value: '=' }
            expect(constructNode(node, 0)).toEqual('     ')
            expect(constructNode(node, 1)).toEqual('═════')
            expect(constructNode(node, 2)).toEqual('     ')
        })
    })

    describe('vertical line node', () => {
        it('renders a vertical line in the center', () => {
            const node: HashiNodeData = { value: '|' }
            expect(constructNode(node, 0)).toEqual('  │  ')
            expect(constructNode(node, 1)).toEqual('  │  ')
            expect(constructNode(node, 2)).toEqual('  │  ')
        })

        it('renders a double vertical line in the center', () => {
            const node: HashiNodeData = { value: '#' }
            expect(constructNode(node, 0)).toEqual('  ║  ')
            expect(constructNode(node, 1)).toEqual('  ║  ')
            expect(constructNode(node, 2)).toEqual('  ║  ')
        })
    })

    describe('node with value', () => {
        describe('TOP_ROW', () => {
            it('renders top border', () => {
                const node: HashiNodeData = { value: 5 }
                expect(constructNode(node, 0)).toEqual('╭───╮')
            })

            it('renders border with vertical line up', () => {
                const node: HashiNodeData = { value: 5, lineUp: 1 }
                expect(constructNode(node, 0)).toEqual('╭─┴─╮')
            })

            it('renders border with double vertical line up', () => {
                const node: HashiNodeData = { value: 5, lineUp: 2 }
                expect(constructNode(node, 0)).toEqual('╭─╨─╮')
            })
        })

        describe('MIDDLE_ROW', () => {
            it('renders middle row - value with vertical borders', () => {
                const node: HashiNodeData = { value: 5 }
                expect(constructNode(node, 1)).toEqual('│ 5 │')
            })

            it('renders value with horizontal line on left', () => {
                const node: HashiNodeData = { value: 5, lineLeft: 1 }
                expect(constructNode(node, 1)).toEqual('┤ 5 │')
            })

            it('renders value with horizontal line on right', () => {
                const node: HashiNodeData = { value: 5, lineRight: 1 }
                expect(constructNode(node, 1)).toEqual('│ 5 ├')
            })

            it('renders value with horizontal lines on both sides', () => {
                const node: HashiNodeData = { value: 5, lineLeft: 1, lineRight: 1 }
                expect(constructNode(node, 1)).toEqual('┤ 5 ├')
            })

            it('renders value with double horizontal lines on both sides', () => {
                const node: HashiNodeData = { value: 5, lineLeft: 2, lineRight: 2 }
                expect(constructNode(node, 1)).toEqual('╡ 5 ╞')
            })
        })

        describe('BOTTOM_ROW', () => {
            it('renders bottom border without lines', () => {
                const node: HashiNodeData = { value: 5 }
                expect(constructNode(node, 2)).toEqual('╰───╯')
            })

            it('renders border with vertical line down', () => {
                const node: HashiNodeData = { value: 5, lineDown: 1 }
                expect(constructNode(node, 2)).toEqual('╰─┬─╯')
            })

            it('renders border with double vertical line down', () => {
                const node: HashiNodeData = { value: 5, lineDown: 2 }
                expect(constructNode(node, 2)).toEqual('╰─╥─╯')
            })
        })
    })
})

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

    describe('highlightedNode', () => {
        it('renders highlighted node with bold when value matches', () => {
            const { lastFrame } = render(<HashiRow nodes={[{ value: 1 }]} highlightedNode={1} />)
            expect(lastFrame()).toEqual(
                ` \u001b[1m╭───╮\u001b[22m
 \u001b[1m│ 1 │\u001b[22m
 \u001b[1m╰───╯\u001b[22m`
            )
        })

        it('renders dimmed node when value does not match', () => {
            const { lastFrame } = render(<HashiRow nodes={[{ value: 1 }]} highlightedNode={2} />)
            expect(lastFrame()).toEqual(
                ` \u001b[2m╭───╮\u001b[22m
 \u001b[2m│ 1 │\u001b[22m
 \u001b[2m╰───╯\u001b[22m`
            )
        })

        it('renders multiple nodes with one highlighted and others dimmed', () => {
            const { lastFrame } = render(
                <HashiRow nodes={[{ value: 1 }, { value: 2 }, { value: 3 }]} highlightedNode={2} />
            )
            expect(lastFrame()).toEqual(
                ` \u001b[2m╭───╮\u001b[22m\u001b[1m╭───╮\u001b[22m\u001b[2m╭───╮\u001b[22m
 \u001b[2m│ 1 │\u001b[22m\u001b[1m│ 2 │\u001b[22m\u001b[2m│ 3 │\u001b[22m
 \u001b[2m╰───╯\u001b[22m\u001b[1m╰───╯\u001b[22m\u001b[2m╰───╯\u001b[22m`
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
