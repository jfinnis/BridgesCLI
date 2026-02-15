import { Box, Text } from 'ink'
import type { HashiNodeData } from '../types.ts'
import { NODE_WIDTH, OUTER_PADDING, ROW_HEIGHT, SPACE_BETWEEN } from './HashiGrid.tsx'

type HashiRowProps = {
    /** Max number of nodes in this row */
    maxNodes: number
    nodes: HashiNodeData[]
}

export default function HashiRow({ maxNodes, nodes }: HashiRowProps) {
    const slots: (number | null)[] = Array(maxNodes).fill(null)
    for (const node of nodes) {
        if (node.position >= 0 && node.position < maxNodes) {
            slots[node.position] = node.value
        }
    }

    // Each row represents multiple rows of actual terminal output.
    const lines: string[] = []
    for (let line = 0; line < ROW_HEIGHT; line++) {
        let rowStr = ' '.repeat(OUTER_PADDING)
        for (let i = 0; i < slots.length; i++) {
            if (slots[i] === null) {
                // If not printing a node, put empty space
                rowStr += ' '.repeat(NODE_WIDTH)
            } else {
                // Print the node
                if (line === 0) {
                    rowStr += '╭───╮'
                } else if (line === 1) {
                    rowStr += `│ ${slots[i]} │`
                } else if (line === 2) {
                    rowStr += '╰───╯'
                }
            }

            if (i < slots.length - 1) {
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
