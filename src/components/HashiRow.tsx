import { Box, Text } from 'ink'
import type React from 'react'

import type { HashiNodeData, HashiNodeDisplayMode } from '../types.ts'
import { NODE_WIDTH, OUTER_PADDING, SPACE_BETWEEN } from './HashiGrid.tsx'

const TOP_ROW = 0
const MIDDLE_ROW = 1
const BOTTOM_ROW = 2
const ROW_HEIGHT = 3

/**
 * Determines the display mode for a node based on the highlighted node value.
 */
function getDisplayMode(node: HashiNodeData, highlightedNode?: number): HashiNodeDisplayMode {
    if (highlightedNode === undefined) {
        return 'normal'
    }
    if (typeof node.value === 'number' && node.value === highlightedNode) {
        return 'highlight'
    }

    // Bridge values are strings, so they can never match a number highlightedNode
    return 'dim'
}

export { getDisplayMode }

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
    displayMode: HashiNodeDisplayMode = 'normal'
): React.ReactNode {
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
            const border = `╭─${up}─╮`
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

type HashiRowProps = {
    nodes: HashiNodeData[]
    highlightedNode?: number
}

export default function HashiRow({ nodes, highlightedNode }: HashiRowProps) {
    // Each row consists of multiple lines of terminal output
    const lines: React.ReactNode[] = []
    for (let line = 0; line < ROW_HEIGHT; line++) {
        const rowItems: React.ReactNode[] = []

        // Render each node into the terminal line output
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]

            if (!node) {
                rowItems.push(' '.repeat(NODE_WIDTH))
                continue
            }

            const displayMode = getDisplayMode(node, highlightedNode)
            rowItems.push(constructNode(node, line as 0 | 1 | 2, displayMode))

            // Add space between columns except the last
            if (i < nodes.length - 1) {
                rowItems.push(' '.repeat(SPACE_BETWEEN))
            }
        }

        const rowStr = (
            <>
                {' '.repeat(OUTER_PADDING)}
                {rowItems}
                {' '.repeat(OUTER_PADDING)}
            </>
        )
        lines.push(<Text key={line}>{rowStr}</Text>)
    }

    return <Box flexDirection="column">{lines}</Box>
}
