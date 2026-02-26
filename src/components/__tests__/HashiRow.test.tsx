import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import type { HashiNodeData } from '../../types.ts'
import HashiRow, { constructNode } from '../HashiRow.tsx'

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
    })

    describe('vertical line node', () => {
        it('renders a vertical line in the center', () => {
            const node: HashiNodeData = { value: '|' }
            expect(constructNode(node, 0)).toEqual('  │  ')
            expect(constructNode(node, 1)).toEqual('  │  ')
            expect(constructNode(node, 2)).toEqual('  │  ')
        })
    })

    describe('node with value', () => {
        describe('TOP_ROW', () => {
            it('renders top border', () => {
                const node: HashiNodeData = { value: 5 }
                expect(constructNode(node, 0)).toEqual('╭───╮')
            })

            it('renders border with vertical line up', () => {
                const node: HashiNodeData = { value: 5, lineUp: true }
                expect(constructNode(node, 0)).toEqual('╭─┴─╮')
            })
        })

        describe('MIDDLE_ROW', () => {
            it('renders middle row - value with vertical borders', () => {
                const node: HashiNodeData = { value: 5 }
                expect(constructNode(node, 1)).toEqual('│ 5 │')
            })

            it('renders value with horizontal line on left', () => {
                const node: HashiNodeData = { value: 5, lineLeft: true }
                expect(constructNode(node, 1)).toEqual('┤ 5 │')
            })

            it('renders value with horizontal line on right', () => {
                const node: HashiNodeData = { value: 5, lineRight: true }
                expect(constructNode(node, 1)).toEqual('│ 5 ├')
            })

            it('renders value with horizontal lines on both sides', () => {
                const node: HashiNodeData = { value: 5, lineLeft: true, lineRight: true }
                expect(constructNode(node, 1)).toEqual('┤ 5 ├')
            })
        })

        describe('BOTTOM_ROW', () => {
            it('renders bottom border without lines', () => {
                const node: HashiNodeData = { value: 5 }
                expect(constructNode(node, 2)).toEqual('╰───╯')
            })

            it('renders border with vertical line down', () => {
                const node: HashiNodeData = { value: 5, lineDown: true }
                expect(constructNode(node, 2)).toEqual('╰─┬─╯')
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
                nodes={[
                    { value: 1, lineRight: true },
                    { value: '-' },
                    { value: 3, lineLeft: true },
                ]}
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
})
