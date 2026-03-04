import type { HashiNodeData, HashiNodeDisplayMode } from '../types.ts'

export const ROW_HEIGHT = 3
export const NODE_WIDTH = 5
export const SPACE_BETWEEN = 0
export const OUTER_PADDING = 1

export const TOP_ROW = 0
export const MIDDLE_ROW = 1
export const BOTTOM_ROW = 2

export type HashiGridValidationProps = {
    rows: HashiNodeData[][]
    numNodes: number
}

/**
 * Ensure the grid data is consistent with a valid Hashiwokakero puzzle.
 */
export function validateGrid({ rows, numNodes }: HashiGridValidationProps): void {
    if (!rows || rows.length === 0) {
        throw new Error('HashiGrid: empty data supplied')
    }

    let rowCount = 0
    for (const nodes of rows) {
        const prefix = `HashiGrid row ${rowCount}: `

        if (nodes.length !== numNodes) {
            throw new Error(`${prefix}expected ${numNodes} nodes, got ${nodes.length}`)
        }

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if (!node) {
                throw new Error(`${prefix}node at position ${i} is undefined`)
            }
            if (
                typeof node.value !== 'number' &&
                node.value !== '-' &&
                node.value !== '=' &&
                node.value !== ' ' &&
                node.value !== '#' &&
                node.value !== '|'
            ) {
                throw new Error(`${prefix}node at position ${i} has invalid value: ${node.value}`)
            }
        }
        rowCount++
    }
}

/**
 * Determines the display mode for a node based on the highlighted node value.
 */
export function getDisplayMode(
    node: HashiNodeData,
    highlightedNode?: number,
    row?: number,
    col?: number,
    selectedNode?: { row: number; col: number } | null,
    mode?: string
): HashiNodeDisplayMode {
    // In selecting-node, selected, or invalid mode, highlight only the specific selected node
    if (
        (mode === 'selecting-node' || mode === 'selected' || mode === 'invalid') &&
        selectedNode &&
        row !== undefined &&
        col !== undefined
    ) {
        if (row === selectedNode.row && col === selectedNode.col) {
            return 'highlight'
        }
        return 'dim'
    }

    if (highlightedNode === undefined) {
        return 'normal'
    }
    if (typeof node.value === 'number' && node.value === highlightedNode) {
        return 'highlight'
    }

    // Bridge values are strings, so they can never match a number highlightedNode
    return 'dim'
}

/**
 * Build the HashiGrid node with its value and borders. Options:
 *   - node with a value (always 1 digit)
 *   - empty node - render just spaces
 *   - horizontal line - single and double
 *   - vertical line - single and double
 */
export function constructNode(
    node: HashiNodeData,
    line: 0 | 1 | 2,
    displayMode: HashiNodeDisplayMode = 'normal',
    disambiguationLabel?: string
): string {
    // Horizontal line
    if (node.value === '-') {
        if (displayMode === 'dim') {
            return line === MIDDLE_ROW ? `\x1b[2m─────\x1b[22m` : ' '.repeat(NODE_WIDTH)
        }
        return line === MIDDLE_ROW ? '─────' : ' '.repeat(NODE_WIDTH)
    }

    // Double horizontal line
    if (node.value === '=') {
        if (displayMode === 'dim') {
            return line === MIDDLE_ROW ? `\x1b[2m═════\x1b[22m` : ' '.repeat(NODE_WIDTH)
        }
        return line === MIDDLE_ROW ? '═════' : ' '.repeat(NODE_WIDTH)
    }

    // Vertical line
    if (node.value === '|') {
        if (displayMode === 'dim') {
            return `\x1b[2m  │  \x1b[22m`
        }
        return '  │  '
    }

    // Double vertical line
    if (node.value === '#') {
        if (displayMode === 'dim') {
            return `\x1b[2m  ║  \x1b[22m`
        }
        return '  ║  '
    }

    // Node with value to render
    if (node.value !== ' ') {
        if (line === TOP_ROW) {
            const up = node.lineUp === 2 ? '╨' : node.lineUp === 1 ? '┴' : '─'
            const label = disambiguationLabel ? disambiguationLabel : '─'
            const border = `╭${label}${up}─╮`
            if (displayMode === 'highlight') {
                return `\x1b[1m${border}\x1b[22m`
            }
            if (displayMode === 'dim') {
                return `\x1b[2m${border}\x1b[22m`
            }
            return border
        } else if (line === MIDDLE_ROW) {
            const left = node.lineLeft === 2 ? '╡' : node.lineLeft === 1 ? '┤' : '│'
            const right = node.lineRight === 2 ? '╞' : node.lineRight === 1 ? '├' : '│'
            if (displayMode === 'highlight') {
                return `\x1b[1m${left} ${node.value} ${right}\x1b[22m`
            }
            if (displayMode === 'dim') {
                return `\x1b[2m${left} ${node.value} ${right}\x1b[22m`
            }
            return `${left} ${node.value} ${right}`
        } else if (line === BOTTOM_ROW) {
            const down = node.lineDown === 2 ? '╥' : node.lineDown === 1 ? '┬' : '─'
            const border = `╰─${down}─╯`
            if (displayMode === 'highlight') {
                return `\x1b[1m${border}\x1b[22m`
            }
            if (displayMode === 'dim') {
                return `\x1b[2m${border}\x1b[22m`
            }
            return border
        }
    }

    // Empty node
    return ' '.repeat(NODE_WIDTH)
}
