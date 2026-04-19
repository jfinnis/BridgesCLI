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
 * Check if the puzzle is solved - all numbered nodes have the correct number of bridges
 * and all nodes form a connected graph.
 */
export function checkSolution(rows: HashiNodeData[][]): boolean {
    for (const row of rows) {
        for (const node of row) {
            const state = getNodeFilledState(node)
            if (state !== null && state !== 'valid') {
                return false
            }
        }
    }

    if (!isGraphConnected(rows)) {
        return false
    }

    return true
}

/**
 * Check if all numbered nodes have the correct number of bridges (regardless of connectivity).
 */
export function areAllNodesFilled(rows: HashiNodeData[][]): boolean {
    for (const row of rows) {
        for (const node of row) {
            const state = getNodeFilledState(node)
            if (state !== null && state !== 'valid') {
                return false
            }
        }
    }
    return true
}

/**
 * Check if the graph is connected (regardless of whether nodes have correct bridge counts).
 */
export function isConnected(rows: HashiNodeData[][]): boolean {
    return isGraphConnected(rows)
}

/**
 * Check if all numbered nodes form a connected graph using BFS.
 */
function isGraphConnected(rows: HashiNodeData[][]): boolean {
    const numRows = rows.length
    if (numRows === 0) return true
    const numCols = rows[0].length

    const numberedNodes: [number, number][] = []
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (typeof rows[r][c].value === 'number') {
                numberedNodes.push([r, c])
            }
        }
    }

    if (numberedNodes.length === 0) return true

    const visited = new Set<string>()
    const queue: [number, number][] = [[numberedNodes[0][0], numberedNodes[0][1]]]
    visited.add(`${numberedNodes[0][0]},${numberedNodes[0][1]}`)

    while (queue.length > 0) {
        const next = queue.shift()
        if (!next) continue
        const [r, c] = next
        const node = rows[r]?.[c]
        if (!node) continue

        if (node.lineRight === 1 || node.lineRight === 2) {
            const dest = findNextNumberedNode(rows, r, c, 0, 1)
            if (dest) {
                const key = `${dest[0]},${dest[1]}`
                if (!visited.has(key)) {
                    visited.add(key)
                    queue.push(dest)
                }
            }
        }

        if (node.lineLeft === 1 || node.lineLeft === 2) {
            const dest = findNextNumberedNode(rows, r, c, 0, -1)
            if (dest) {
                const key = `${dest[0]},${dest[1]}`
                if (!visited.has(key)) {
                    visited.add(key)
                    queue.push(dest)
                }
            }
        }

        if (node.lineDown === 1 || node.lineDown === 2) {
            const dest = findNextNumberedNode(rows, r, c, 1, 0)
            if (dest) {
                const key = `${dest[0]},${dest[1]}`
                if (!visited.has(key)) {
                    visited.add(key)
                    queue.push(dest)
                }
            }
        }

        if (node.lineUp === 1 || node.lineUp === 2) {
            const dest = findNextNumberedNode(rows, r, c, -1, 0)
            if (dest) {
                const key = `${dest[0]},${dest[1]}`
                if (!visited.has(key)) {
                    visited.add(key)
                    queue.push(dest)
                }
            }
        }
    }

    return visited.size === numberedNodes.length
}

function findNextNumberedNode(
    rows: HashiNodeData[][],
    startR: number,
    startC: number,
    dRow: number,
    dCol: number
): [number, number] | null {
    const numRows = rows.length
    const numCols = rows[0].length
    let r = startR + dRow
    let c = startC + dCol

    while (r >= 0 && r < numRows && c >= 0 && c < numCols) {
        if (typeof rows[r][c].value === 'number') {
            return [r, c]
        }
        r += dRow
        c += dCol
    }

    return null
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
    validationState?: NodeFilledState | null,
    showSolution?: boolean
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

    const colorReset = '\x1b[39m'
    const colorPrefix = displayMode === 'dim' ? '' : getColorPrefix()
    const useColor = colorPrefix !== ''

    // Horizontal line
    if (node.value === '-') {
        if (displayMode === 'dim') {
            return line === MIDDLE_ROW ? `\x1b[2m─────\x1b[22m` : ' '.repeat(NODE_WIDTH)
        }
        const content = line === MIDDLE_ROW ? '─────' : ' '.repeat(NODE_WIDTH)
        if (showSolution) {
            return `\x1b[32m${content}\x1b[39m`
        }
        return useColor ? `${getColorPrefix()}${content}${colorReset}` : content
    }

    // Double horizontal line
    if (node.value === '=') {
        if (displayMode === 'dim') {
            return line === MIDDLE_ROW ? `\x1b[2m═════\x1b[22m` : ' '.repeat(NODE_WIDTH)
        }
        const content = line === MIDDLE_ROW ? '═════' : ' '.repeat(NODE_WIDTH)
        if (showSolution) {
            return `\x1b[32m${content}\x1b[39m`
        }
        return useColor ? `${getColorPrefix()}${content}${colorReset}` : content
    }

    // Vertical line
    if (node.value === '|') {
        if (displayMode === 'dim') {
            return `\x1b[2m  │  \x1b[22m`
        }
        const content = '  │  '
        if (showSolution) {
            return `\x1b[32m${content}\x1b[39m`
        }
        return useColor ? `${getColorPrefix()}${content}${colorReset}` : content
    }

    // Double vertical line
    if (node.value === '#') {
        if (displayMode === 'dim') {
            return `\x1b[2m  ║  \x1b[22m`
        }
        const content = '  ║  '
        if (showSolution) {
            return `\x1b[32m${content}\x1b[39m`
        }
        return useColor ? `${getColorPrefix()}${content}${colorReset}` : content
    }

    // Node with value to render
    if (node.value !== ' ') {
        if (line === TOP_ROW) {
            const up = node.lineUp === 2 ? '╨' : node.lineUp === 1 ? '┴' : '─'
            const label = disambiguationLabel ? disambiguationLabel : '─'
            const border = `╭${label}${up}─╮`
            if (displayMode === 'highlight') {
                const highlighted = `\x1b[1m${border}\x1b[22m`
                if (validationState === 'valid' || validationState === 'invalid') {
                    return `${getColorPrefix()}${highlighted}${colorReset}`
                }
                return highlighted
            }
            if (displayMode === 'dim') {
                const dimmedBorder = `\x1b[2m${border}\x1b[22m`
                if (validationState === 'valid' || validationState === 'invalid') {
                    return `${getColorPrefix()}${dimmedBorder}${colorReset}`
                }
                return dimmedBorder
            }
            return useColor ? `${getColorPrefix()}${border}${colorReset}` : border
        } else if (line === MIDDLE_ROW) {
            const left = node.lineLeft === 2 ? '╡' : node.lineLeft === 1 ? '┤' : '│'
            const right = node.lineRight === 2 ? '╞' : node.lineRight === 1 ? '├' : '│'
            const content = `${left} ${node.value} ${right}`
            if (displayMode === 'highlight') {
                const highlighted = `\x1b[1m${content}\x1b[22m`
                if (validationState === 'valid' || validationState === 'invalid') {
                    return `${getColorPrefix()}${highlighted}${colorReset}`
                }
                return highlighted
            }
            if (displayMode === 'dim') {
                const dimmedContent = `\x1b[2m${content}\x1b[22m`
                if (validationState === 'valid' || validationState === 'invalid') {
                    return `${getColorPrefix()}${dimmedContent}${colorReset}`
                }
                return dimmedContent
            }
            return useColor ? `${getColorPrefix()}${content}${colorReset}` : content
        } else if (line === BOTTOM_ROW) {
            const down = node.lineDown === 2 ? '╥' : node.lineDown === 1 ? '┬' : '─'
            const border = `╰─${down}─╯`
            if (displayMode === 'highlight') {
                const highlighted = `\x1b[1m${border}\x1b[22m`
                if (validationState === 'valid' || validationState === 'invalid') {
                    return `${getColorPrefix()}${highlighted}${colorReset}`
                }
                return highlighted
            }
            if (displayMode === 'dim') {
                const dimmedBorder = `\x1b[2m${border}\x1b[22m`
                if (validationState === 'valid' || validationState === 'invalid') {
                    return `${getColorPrefix()}${dimmedBorder}${colorReset}`
                }
                return dimmedBorder
            }
            return useColor ? `${getColorPrefix()}${border}${colorReset}` : border
        }
    }

    // Empty node
    return ' '.repeat(NODE_WIDTH)
}
