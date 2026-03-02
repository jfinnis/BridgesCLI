import { Box, Text } from 'ink'
import type React from 'react'

import type { HashiNodeData } from '../types.ts'
import { NODE_WIDTH, OUTER_PADDING, SPACE_BETWEEN } from './HashiGrid.tsx'

export type HashiNodeOptions = {
    highlight?: boolean
    label?: string
}

type HashiRowProps = {
    nodes: HashiNodeData[]
    nodeOptions?: HashiNodeOptions[]
}

const TOP_ROW = 0
const MIDDLE_ROW = 1
const BOTTOM_ROW = 2
const ROW_HEIGHT = 3

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
    options?: HashiNodeOptions
): React.ReactNode {
    const { highlight, label } = options ?? {}

    // Horizontal line
    if (node.value === '-') {
        return line === MIDDLE_ROW ? '─────' : ' '.repeat(NODE_WIDTH)
    }

    // Double horizontal line
    if (node.value === '=') {
        return line === MIDDLE_ROW ? '═════' : ' '.repeat(NODE_WIDTH)
    }

    // Vertical line
    if (node.value === '|') {
        return '  │  '
    }

    // Double vertical line
    if (node.value === '#') {
        return '  ║  '
    }

    // Node with value to render
    if (node.value !== ' ') {
        if (line === TOP_ROW) {
            const up = node.lineUp === 2 ? '╨' : node.lineUp === 1 ? '┴' : '─'
            const border = `╭─${up}─╮`
            if (label) {
                return (
                    <Text>
                        {border.slice(0, 2)}
                        <Text bold>{label}</Text>
                        {border.slice(3)}
                    </Text>
                )
            }
            return border
        } else if (line === MIDDLE_ROW) {
            const left = node.lineLeft === 2 ? '╡' : node.lineLeft === 1 ? '┤' : '│'
            const right = node.lineRight === 2 ? '╞' : node.lineRight === 1 ? '├' : '│'
            if (highlight) {
                return `${left} \x1b[1m${node.value}\x1b[22m ${right}`
            }
            return `${left} ${node.value} ${right}`
        } else if (line === BOTTOM_ROW) {
            const down = node.lineDown === 2 ? '╥' : node.lineDown === 1 ? '┬' : '─'
            return `╰─${down}─╯`
        }
    }

    // Empty node
    return ' '.repeat(NODE_WIDTH)
}

export default function HashiRow({ nodes, nodeOptions = [] }: HashiRowProps) {
    // Each row consists of multiple lines of terminal output
    const lines: React.ReactNode[] = []
    for (let line = 0; line < ROW_HEIGHT; line++) {
        const rowItems: React.ReactNode[] = []

        // Render each node into the terminal line output
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            const options = nodeOptions[i]

            if (!node) {
                rowItems.push(' '.repeat(NODE_WIDTH))
                continue
            }

            rowItems.push(constructNode(node, line as 0 | 1 | 2, options))

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
