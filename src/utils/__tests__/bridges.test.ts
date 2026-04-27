import { describe, expect, it } from 'vitest'
import type { HashiNodeData } from '../../types.ts'
import {
    applyStyles,
    constructNode,
    getBridgeCount,
    getDisplayMode,
    getValidationColor,
    isDoubleHorizontalBridge,
    isDoubleVerticalBridge,
    isHorizontalBridge,
    isNumberedNode,
    isVerticalBridge,
    NODE_WIDTH,
    renderDoubleHorizontalBridge,
    renderDoubleVerticalBridge,
    renderHorizontalBridge,
    renderNumberedNode,
    renderVerticalBridge,
} from '../bridges.ts'

describe('getBridgeCount', () => {
    it('returns 0 for node with no bridges', () => {
        expect(getBridgeCount({ value: 3 })).toBe(0)
    })

    it('counts single bridge in each direction', () => {
        expect(getBridgeCount({ value: 1, lineRight: 1 })).toBe(1)
        expect(getBridgeCount({ value: 1, lineLeft: 1 })).toBe(1)
        expect(getBridgeCount({ value: 1, lineUp: 1 })).toBe(1)
        expect(getBridgeCount({ value: 1, lineDown: 1 })).toBe(1)
    })

    it('counts double bridges', () => {
        expect(getBridgeCount({ value: 2, lineRight: 2 })).toBe(2)
        expect(getBridgeCount({ value: 2, lineLeft: 2 })).toBe(2)
    })

    it('sums multiple bridge directions', () => {
        expect(getBridgeCount({ value: 2, lineLeft: 1, lineRight: 1 })).toBe(2)
        expect(
            getBridgeCount({ value: 4, lineUp: 1, lineDown: 1, lineLeft: 1, lineRight: 1 })
        ).toBe(4)
        expect(
            getBridgeCount({ value: 6, lineUp: 2, lineDown: 2, lineLeft: 1, lineRight: 1 })
        ).toBe(6)
    })

    it('treats undefined as 0', () => {
        expect(getBridgeCount({ value: 1, lineRight: undefined })).toBe(0)
    })
})

describe('getValidationColor', () => {
    it('returns green for valid state', () => {
        expect(getValidationColor('valid')).toBe('\x1b[32m')
    })
    it('returns red for invalid state', () => {
        expect(getValidationColor('invalid')).toBe('\x1b[31m')
    })
    it('returns empty string for incomplete state', () => {
        expect(getValidationColor('incomplete')).toBe('')
    })
    it('returns empty string for undefined', () => {
        expect(getValidationColor(undefined)).toBe('')
    })
    it('returns empty string for null', () => {
        expect(getValidationColor(null)).toBe('')
    })
})

describe('applyStyles', () => {
    const content = 'test'

    it('applies dim style in dim mode', () => {
        const result = applyStyles(content, 'dim')
        expect(result).toContain('\x1b[2mtest\x1b[22m')
        expect(result).toContain('\x1b[39m')
    })

    it('applies bold style in highlight mode', () => {
        const result = applyStyles(content, 'highlight')
        expect(result).toContain('\x1b[1mtest\x1b[22m')
        expect(result).toContain('\x1b[39m')
    })

    it('applies green in normal mode with showSolution', () => {
        // biome-ignore lint/security/noSecrets: ANSI escape codes are not secrets
        expect(applyStyles(content, 'normal', undefined, true)).toBe('\x1b[32mtest\x1b[39m')
    })

    it('applies validation color in normal mode', () => {
        // biome-ignore lint/security/noSecrets: ANSI escape codes are not secrets
        expect(applyStyles(content, 'normal', 'valid')).toBe('\x1b[32mtest\x1b[39m')
        // biome-ignore lint/security/noSecrets: ANSI escape codes are not secrets
        expect(applyStyles(content, 'normal', 'invalid')).toBe('\x1b[31mtest\x1b[39m')
    })

    it('does not apply validation color in dim mode by default', () => {
        const result = applyStyles(content, 'dim', 'valid')
        expect(result).toContain('\x1b[2mtest\x1b[22m')
        expect(result).not.toContain('\x1b[32m')
    })

    it('applies validation color in dim mode when validateInDim is true', () => {
        const result = applyStyles(content, 'dim', 'valid', false, true)
        // biome-ignore lint/security/noSecrets: ANSI escape codes are not secrets
        expect(result).toBe('\x1b[32m\x1b[2mtest\x1b[22m\x1b[39m')
    })
})

describe('Type guards', () => {
    it('isHorizontalBridge', () => {
        expect(isHorizontalBridge({ value: '-' })).toBe(true)
        expect(isHorizontalBridge({ value: '=' })).toBe(false)
        expect(isHorizontalBridge({ value: 3 })).toBe(false)
    })

    // biome-ignore lint/security/noSecrets: Test name false positive
    it('isDoubleHorizontalBridge', () => {
        expect(isDoubleHorizontalBridge({ value: '=' })).toBe(true)
        expect(isDoubleHorizontalBridge({ value: '-' })).toBe(false)
    })

    it('isVerticalBridge', () => {
        expect(isVerticalBridge({ value: '|' })).toBe(true)
        expect(isVerticalBridge({ value: '#' })).toBe(false)
    })

    it('isDoubleVerticalBridge', () => {
        expect(isDoubleVerticalBridge({ value: '#' })).toBe(true)
        expect(isDoubleVerticalBridge({ value: '|' })).toBe(false)
    })

    it('isNumberedNode', () => {
        expect(isNumberedNode({ value: 3 })).toBe(true)
        expect(isNumberedNode({ value: '-' })).toBe(false)
    })
})

describe('renderHorizontalBridge', () => {
    it('returns HashiCell with middle line as bridge', () => {
        const result = renderHorizontalBridge('normal')
        expect(result.lines[0]).toBe(' '.repeat(NODE_WIDTH))
        expect(result.lines[1]).toBe('─────')
        expect(result.lines[2]).toBe(' '.repeat(NODE_WIDTH))
    })

    it('applies dim style to all lines', () => {
        const result = renderHorizontalBridge('dim')
        expect(result.lines[1]).toContain('\x1b[2m─────\x1b[22m')
        expect(result.lines[1]).toContain('\x1b[39m')
    })
})

describe('renderDoubleHorizontalBridge', () => {
    it('returns HashiCell with middle line as double bridge', () => {
        const result = renderDoubleHorizontalBridge('normal')
        expect(result.lines[1]).toBe('═════')
    })
})

describe('renderVerticalBridge', () => {
    it('returns HashiCell with │ in all lines', () => {
        const result = renderVerticalBridge('normal')
        expect(result.lines[0]).toBe('  │  ')
        expect(result.lines[1]).toBe('  │  ')
        expect(result.lines[2]).toBe('  │  ')
    })
})

describe('renderDoubleVerticalBridge', () => {
    it('returns HashiCell with ║ in all lines', () => {
        const result = renderDoubleVerticalBridge('normal')
        expect(result.lines[0]).toBe('  ║  ')
    })
})

describe('renderNumberedNode', () => {
    it('renders correct top border with default label', () => {
        const node = { value: 3, lineUp: 1 as 1 | 2 }
        const result = renderNumberedNode(node as HashiNodeData, 'normal')
        expect(result.lines[0]).toBe('╭─┴─╮')
    })

    it('uses disambiguation label on top line', () => {
        const node = { value: 3, lineUp: 1 as 1 | 2 }
        const result = renderNumberedNode(node as HashiNodeData, 'normal', 'A')
        expect(result.lines[0]).toBe('╭A┴─╮')
    })

    it('renders correct middle line', () => {
        const node = { value: 3, lineLeft: 1 as 1 | 2, lineRight: 1 as 1 | 2 }
        const result = renderNumberedNode(node as HashiNodeData, 'normal')
        expect(result.lines[1]).toBe('┤ 3 ├')
    })

    it('renders correct bottom line', () => {
        const node = { value: 3, lineDown: 2 as 1 | 2 }
        const result = renderNumberedNode(node as HashiNodeData, 'normal')
        expect(result.lines[2]).toBe('╰─╥─╯')
    })
})

describe('constructNode', () => {
    it('renders horizontal bridge as HashiCell', () => {
        const node = { value: '-' as const }
        const result = constructNode(node as HashiNodeData)
        expect(result.lines[1]).toBe('─────')
        expect(result.lines[0]).toBe(' '.repeat(NODE_WIDTH))
    })

    it('renders double horizontal bridge as HashiCell', () => {
        const node = { value: '=' as const }
        const result = constructNode(node as HashiNodeData)
        expect(result.lines[1]).toBe('═════')
    })

    it('renders vertical bridge as HashiCell', () => {
        const node = { value: '|' as const }
        const result = constructNode(node as HashiNodeData)
        expect(result.lines[0]).toBe('  │  ')
    })

    it('renders numbered node as HashiCell', () => {
        const node = { value: 3, lineUp: 1 as 1 | 2 }
        const result = constructNode(node as HashiNodeData)
        expect(result.lines[0]).toBe('╭─┴─╮')
        expect(result.lines[1]).toBe('│ 3 │')
        expect(result.lines[2]).toBe('╰───╯')
    })
})

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
            const node: HashiNodeData = { value: ' ' as const }
            const result = constructNode(node)
            expect(result.lines[0]).toEqual('     ')
            expect(result.lines[1]).toEqual('     ')
            expect(result.lines[2]).toEqual('     ')
        })
    })

    describe('horizontal line node', () => {
        it('renders a horizontal line in the middle', () => {
            const node: HashiNodeData = { value: '-' as const }
            const result = constructNode(node)
            expect(result.lines[0]).toEqual('     ')
            expect(result.lines[1]).toEqual('─────')
            expect(result.lines[2]).toEqual('     ')
        })

        it('renders a double horizontal line in the middle', () => {
            const node: HashiNodeData = { value: '=' as const }
            const result = constructNode(node)
            expect(result.lines[0]).toEqual('     ')
            expect(result.lines[1]).toEqual('═════')
            expect(result.lines[2]).toEqual('     ')
        })
    })

    describe('vertical line node', () => {
        it('renders a vertical line in the center', () => {
            const node: HashiNodeData = { value: '|' as const }
            const result = constructNode(node)
            expect(result.lines[0]).toEqual('  │  ')
            expect(result.lines[1]).toEqual('  │  ')
            expect(result.lines[2]).toEqual('  │  ')
        })

        it('renders a double vertical line in the center', () => {
            const node: HashiNodeData = { value: '#' as const }
            const result = constructNode(node)
            expect(result.lines[0]).toEqual('  ║  ')
            expect(result.lines[1]).toEqual('  ║  ')
            expect(result.lines[2]).toEqual('  ║  ')
        })
    })

    describe('node with value', () => {
        describe('TOP_ROW', () => {
            it('renders top border', () => {
                const node: HashiNodeData = { value: 5 }
                const result = constructNode(node)
                expect(result.lines[0]).toEqual('╭───╮')
            })

            it('renders border with vertical line up', () => {
                const node: HashiNodeData = { value: 5, lineUp: 1 as 1 | 2 }
                const result = constructNode(node)
                expect(result.lines[0]).toEqual('╭─┴─╮')
            })

            it('renders border with double vertical line up', () => {
                const node: HashiNodeData = { value: 5, lineUp: 2 as 1 | 2 }
                const result = constructNode(node)
                expect(result.lines[0]).toEqual('╭─╨─╮')
            })
        })

        describe('MIDDLE_ROW', () => {
            it('renders middle row - value with vertical borders', () => {
                const node: HashiNodeData = { value: 5 }
                const result = constructNode(node)
                expect(result.lines[1]).toEqual('│ 5 │')
            })

            it('renders value with horizontal line on left', () => {
                const node: HashiNodeData = { value: 5, lineLeft: 1 as 1 | 2 }
                const result = constructNode(node)
                expect(result.lines[1]).toEqual('┤ 5 │')
            })

            it('renders value with horizontal line on right', () => {
                const node: HashiNodeData = { value: 5, lineRight: 1 as 1 | 2 }
                const result = constructNode(node)
                expect(result.lines[1]).toEqual('│ 5 ├')
            })

            it('renders value with horizontal lines on both sides', () => {
                const node: HashiNodeData = {
                    value: 5,
                    lineLeft: 1 as 1 | 2,
                    lineRight: 1 as 1 | 2,
                }
                const result = constructNode(node)
                expect(result.lines[1]).toEqual('┤ 5 ├')
            })

            it('renders value with double horizontal lines on both sides', () => {
                const node: HashiNodeData = {
                    value: 5,
                    lineLeft: 2 as 1 | 2,
                    lineRight: 2 as 1 | 2,
                }
                const result = constructNode(node)
                expect(result.lines[1]).toEqual('╡ 5 ╞')
            })
        })

        describe('BOTTOM_ROW', () => {
            it('renders bottom border without lines', () => {
                const node: HashiNodeData = { value: 5 }
                const result = constructNode(node)
                expect(result.lines[2]).toEqual('╰───╯')
            })

            it('renders border with vertical line down', () => {
                const node: HashiNodeData = { value: 5, lineDown: 1 as 1 | 2 }
                const result = constructNode(node)
                expect(result.lines[2]).toEqual('╰─┬─╯')
            })

            it('renders border with double vertical line down', () => {
                const node: HashiNodeData = { value: 5, lineDown: 2 as 1 | 2 }
                const result = constructNode(node)
                expect(result.lines[2]).toEqual('╰─╥─╯')
            })
        })
    })
})
