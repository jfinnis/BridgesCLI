import type { HashiNodeData, HashiNodeDisplayMode } from '../types.ts'

export type NodeFilledState = 'valid' | 'invalid' | 'incomplete'

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
 * Ensure the grid data is consistent with a valid Bridges puzzle.
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
 * Determines if a node has the correct number of bridges, too many, or too few.
 */
export function getNodeFilledState(node: HashiNodeData): NodeFilledState | null {
    if (typeof node.value !== 'number') {
        return null
    }

    const bridges =
        (node.lineUp ?? 0) + (node.lineDown ?? 0) + (node.lineLeft ?? 0) + (node.lineRight ?? 0)

    if (bridges === node.value) {
        return 'valid'
    }
    if (bridges > node.value) {
        return 'invalid'
    }
    return 'incomplete'
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
    disambiguationLabel?: string,
    validationState?: NodeFilledState | null
): string {
    // Determine color prefix based on validation state
    const getColorPrefix = (): string => {
        if (validationState === 'valid') {
            return '\x1b[32m' // green
        }
        if (validationState === 'invalid') {
            return '\x1b[31m' // red
        }
        return ''
    }

    const colorReset = '\x1b[0m'
    const colorPrefix = displayMode === 'dim' ? '' : getColorPrefix()
    const useColor = colorPrefix !== ''

    // Horizontal line
    if (node.value === '-') {
        if (displayMode === 'dim') {
            return line === MIDDLE_ROW ? `\x1b[2m─────\x1b[22m` : ' '.repeat(NODE_WIDTH)
        }
        const content = line === MIDDLE_ROW ? '─────' : ' '.repeat(NODE_WIDTH)
        return useColor ? `${colorPrefix}${content}${colorReset}` : content
    }

    // Double horizontal line
    if (node.value === '=') {
        if (displayMode === 'dim') {
            return line === MIDDLE_ROW ? `\x1b[2m═════\x1b[22m` : ' '.repeat(NODE_WIDTH)
        }
        const content = line === MIDDLE_ROW ? '═════' : ' '.repeat(NODE_WIDTH)
        return useColor ? `${colorPrefix}${content}${colorReset}` : content
    }

    // Vertical line
    if (node.value === '|') {
        if (displayMode === 'dim') {
            return `\x1b[2m  │  \x1b[22m`
        }
        const content = '  │  '
        return useColor ? `${colorPrefix}${content}${colorReset}` : content
    }

    // Double vertical line
    if (node.value === '#') {
        if (displayMode === 'dim') {
            return `\x1b[2m  ║  \x1b[22m`
        }
        const content = '  ║  '
        return useColor ? `${colorPrefix}${content}${colorReset}` : content
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
                const dimmedBorder = `\x1b[2m${border}\x1b[22m`
                if (validationState === 'valid' || validationState === 'invalid') {
                    return `${colorPrefix}${dimmedBorder}${colorReset}`
                }
                return dimmedBorder
            }
            return useColor ? `${colorPrefix}${border}${colorReset}` : border
        } else if (line === MIDDLE_ROW) {
            const left = node.lineLeft === 2 ? '╡' : node.lineLeft === 1 ? '┤' : '│'
            const right = node.lineRight === 2 ? '╞' : node.lineRight === 1 ? '├' : '│'
            const content = `${left} ${node.value} ${right}`
            if (displayMode === 'highlight') {
                return `\x1b[1m${content}\x1b[22m`
            }
            if (displayMode === 'dim') {
                const dimmedContent = `\x1b[2m${content}\x1b[22m`
                if (validationState === 'valid' || validationState === 'invalid') {
                    return `${colorPrefix}${dimmedContent}${colorReset}`
                }
                return dimmedContent
            }
            return useColor ? `${colorPrefix}${content}${colorReset}` : content
        } else if (line === BOTTOM_ROW) {
            const down = node.lineDown === 2 ? '╥' : node.lineDown === 1 ? '┬' : '─'
            const border = `╰─${down}─╯`
            if (displayMode === 'highlight') {
                return `\x1b[1m${border}\x1b[22m`
            }
            if (displayMode === 'dim') {
                const dimmedBorder = `\x1b[2m${border}\x1b[22m`
                if (validationState === 'valid' || validationState === 'invalid') {
                    return `${colorPrefix}${dimmedBorder}${colorReset}`
                }
                return dimmedBorder
            }
            return useColor ? `${colorPrefix}${border}${colorReset}` : border
        }
    }

    // Empty node
    return ' '.repeat(NODE_WIDTH)
}
