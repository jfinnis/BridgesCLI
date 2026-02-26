import { Box, Text } from 'ink'
import type { HashiNodeData } from '../types.ts'
import { NODE_WIDTH, OUTER_PADDING, SPACE_BETWEEN } from './HashiGrid.tsx'

type HashiRowProps = {
    nodes: HashiNodeData[]
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
export function constructNode(node: HashiNodeData, line: 0 | 1 | 2): string {
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
            const up = node.lineUp === 2 ? '╩' : node.lineUp === 1 ? '┴' : '─'
            return `╭─${up}─╮`
        } else if (line === MIDDLE_ROW) {
            const left = node.lineLeft === 2 ? '╣' : node.lineLeft === 1 ? '┤' : '│'
            const right = node.lineRight === 2 ? '╠' : node.lineRight === 1 ? '├' : '│'
            return `${left} ${node.value} ${right}`
        } else if (line === BOTTOM_ROW) {
            const down = node.lineDown === 2 ? '╦' : node.lineDown === 1 ? '┬' : '─'
            return `╰─${down}─╯`
        }
    }

    // Empty node
    return ' '.repeat(NODE_WIDTH)
}

export default function HashiRow({ nodes }: HashiRowProps) {
    // Each row consists of multiple lines of terminal output
    const lines: string[] = []
    for (let line = 0; line < ROW_HEIGHT; line++) {
        let rowStr = ' '.repeat(OUTER_PADDING)

        // Render each node into the terminal line output
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if (!node) {
                rowStr += ' '.repeat(NODE_WIDTH)
                continue
            }

            rowStr += constructNode(node, line as 0 | 1 | 2)

            // Add space between columns except the last
            if (i < nodes.length - 1) {
                rowStr += ' '.repeat(SPACE_BETWEEN)
            }
        }
        rowStr += ' '.repeat(OUTER_PADDING)
        lines.push(rowStr)
    }

    return (
        <Box flexDirection="column">
            {lines.map((line, i) => (
                <Text key={i}>{line}</Text>
            ))}
        </Box>
    )
}
