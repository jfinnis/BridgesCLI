import { describe, expect, it } from 'vitest'
import {
    applyStyles,
    BOTTOM_ROW,
    constructNode,
    getBridgeCount,
    getValidationColor,
    isDoubleHorizontalBridge,
    isDoubleVerticalBridge,
    isHorizontalBridge,
    isNumberedNode,
    isVerticalBridge,
    MIDDLE_ROW,
    NODE_WIDTH,
    renderDoubleHorizontalBridge,
    renderDoubleVerticalBridge,
    renderHorizontalBridge,
    renderNumberedNodeBottom,
    renderNumberedNodeMiddle,
    renderNumberedNodeTop,
    renderVerticalBridge,
    TOP_ROW,
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
        expect(applyStyles(content, 'dim')).toBe('\x1b[2mtest\x1b[22m')
    })

    it('applies bold style in highlight mode', () => {
        expect(applyStyles(content, 'highlight')).toBe('\x1b[1mtest\x1b[22m')
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
        expect(result).toBe('\x1b[2mtest\x1b[22m')
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
    it('returns "─────" for middle row', () => {
        const result = renderHorizontalBridge(MIDDLE_ROW, 'normal')
        expect(result).toBe('─────')
    })

    it('returns spaces for non-middle row', () => {
        const result = renderHorizontalBridge(TOP_ROW, 'normal')
        expect(result).toBe(' '.repeat(NODE_WIDTH))
    })

    it('applies dim style', () => {
        const result = renderHorizontalBridge(MIDDLE_ROW, 'dim')
        expect(result).toBe('\x1b[2m─────\x1b[22m')
    })

    it('applies solution green', () => {
        const result = renderHorizontalBridge(MIDDLE_ROW, 'normal', true)
        // biome-ignore lint/security/noSecrets: ANSI escape codes are not secrets
        expect(result).toBe('\x1b[32m─────\x1b[39m')
    })
})

describe('renderDoubleHorizontalBridge', () => {
    it('returns "═════" for middle row', () => {
        const result = renderDoubleHorizontalBridge(MIDDLE_ROW, 'normal')
        expect(result).toBe('═════')
    })
})

describe('renderVerticalBridge', () => {
    it('returns "  │  "', () => {
        const result = renderVerticalBridge('normal')
        expect(result).toBe('  │  ')
    })
})

describe('renderDoubleVerticalBridge', () => {
    it('returns "  ║  "', () => {
        const result = renderDoubleVerticalBridge('normal')
        expect(result).toBe('  ║  ')
    })
})

describe('renderNumberedNodeTop', () => {
    const node = { value: 3, lineUp: 1 }

    it('renders correct border with default label', () => {
        const result = renderNumberedNodeTop(node, 'normal')
        expect(result).toBe('╭─┴─╮')
    })

    it('uses disambiguation label', () => {
        const result = renderNumberedNodeTop(node, 'normal', 'A')
        expect(result).toBe('╭A┴─╮')
    })

    it('applies highlight style', () => {
        const result = renderNumberedNodeTop(node, 'highlight')
        // biome-ignore lint/security/noSecrets: ANSI escape codes are not secrets
        expect(result).toBe('\x1b[1m╭─┴─╮\x1b[22m')
    })

    it('applies validation color in dim mode', () => {
        const result = renderNumberedNodeTop(node, 'dim', undefined, 'valid')
        // biome-ignore lint/security/noSecrets: ANSI escape codes are not secrets
        expect(result).toBe('\x1b[32m\x1b[2m╭─┴─╮\x1b[22m\x1b[39m')
    })
})

describe('renderNumberedNodeMiddle', () => {
    const node = { value: 3, lineLeft: 1, lineRight: 1 }

    it('renders correct content', () => {
        const result = renderNumberedNodeMiddle(node, 'normal')
        expect(result).toBe('┤ 3 ├')
    })

    it('applies highlight style', () => {
        const result = renderNumberedNodeMiddle(node, 'highlight')
        expect(result).toBe('\x1b[1m┤ 3 ├\x1b[22m')
    })
})

describe('renderNumberedNodeBottom', () => {
    const node = { value: 3, lineDown: 2 }

    it('renders correct border', () => {
        const result = renderNumberedNodeBottom(node, 'normal')
        expect(result).toBe('╰─╥─╯')
    })
})

describe('constructNode', () => {
    it('renders horizontal bridge middle row', () => {
        const node = { value: '-' }
        const result = constructNode(node, MIDDLE_ROW)
        expect(result).toBe('─────')
    })

    it('renders horizontal bridge top row as spaces', () => {
        const node = { value: '-' }
        const result = constructNode(node, TOP_ROW)
        expect(result).toBe(' '.repeat(NODE_WIDTH))
    })

    it('renders double horizontal bridge middle row', () => {
        const node = { value: '=' }
        const result = constructNode(node, MIDDLE_ROW)
        expect(result).toBe('═════')
    })

    it('renders vertical bridge', () => {
        const node = { value: '|' }
        const result = constructNode(node, MIDDLE_ROW)
        expect(result).toBe('  │  ')
    })

    it('renders double vertical bridge', () => {
        const node = { value: '#' }
        const result = constructNode(node, MIDDLE_ROW)
        expect(result).toBe('  ║  ')
    })

    it('renders numbered node top row', () => {
        const node = { value: 3, lineUp: 1 }
        const result = constructNode(node, TOP_ROW)
        expect(result).toBe('╭─┴─╮')
    })

    it('renders numbered node middle row', () => {
        const node = { value: 3, lineLeft: 1, lineRight: 1 }
        const result = constructNode(node, MIDDLE_ROW)
        expect(result).toBe('┤ 3 ├')
    })

    it('renders numbered node bottom row', () => {
        const node = { value: 3, lineDown: 2 }
        const result = constructNode(node, BOTTOM_ROW)
        expect(result).toBe('╰─╥─╯')
    })

    it('renders empty node', () => {
        const node = { value: ' ' }
        const result = constructNode(node, MIDDLE_ROW)
        expect(result).toBe(' '.repeat(NODE_WIDTH))
    })

    it('applies highlight to numbered node', () => {
        const node = { value: 3, lineLeft: 1, lineRight: 1 }
        const result = constructNode(node, MIDDLE_ROW, 'highlight')
        expect(result).toBe('\x1b[1m┤ 3 ├\x1b[22m')
    })

    it('applies dim to horizontal bridge', () => {
        const node = { value: '-' }
        const result = constructNode(node, MIDDLE_ROW, 'dim')
        expect(result).toBe('\x1b[2m─────\x1b[22m')
    })

    it('shows solution green for bridges', () => {
        const node = { value: '-' }
        const result = constructNode(node, MIDDLE_ROW, 'normal', undefined, undefined, true)
        // biome-ignore lint/security/noSecrets: ANSI escape codes are not secrets
        expect(result).toBe('\x1b[32m─────\x1b[39m')
    })
})
