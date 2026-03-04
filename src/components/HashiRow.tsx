import { Box, Text } from 'ink'
import type React from 'react'

import type { HashiNodeData, SelectionState } from '../types.ts'
import {
    constructNode,
    getDisplayMode,
    NODE_WIDTH,
    OUTER_PADDING,
    ROW_HEIGHT,
    SPACE_BETWEEN,
} from '../utils/bridges.ts'

type HashiRowProps = {
    nodes: HashiNodeData[]
    highlightedNode?: number
    rowIndex: number
    selectionState?: SelectionState
}

export default function HashiRow({
    nodes,
    highlightedNode,
    rowIndex,
    selectionState,
}: HashiRowProps) {
    // Each row consists of multiple lines of terminal output
    const lines: React.ReactNode[] = []

    // Build a map of col index to disambiguation label for this row
    const disambiguationMap: Record<number, string> = {}
    if (selectionState?.mode === 'disambiguation' && selectionState.matchingNodes) {
        for (let i = 0; i < selectionState.matchingNodes.length; i++) {
            const match = selectionState.matchingNodes[i]
            const label = selectionState.disambiguationLabels[i]
            if (match && match.row === rowIndex) {
                disambiguationMap[match.col] = label ?? ''
            }
        }
    }

    for (let line = 0; line < ROW_HEIGHT; line++) {
        const rowItems: React.ReactNode[] = []

        // Render each node into the terminal line output
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]

            if (!node) {
                rowItems.push(' '.repeat(NODE_WIDTH))
                continue
            }

            const displayMode = getDisplayMode(
                node,
                highlightedNode,
                rowIndex,
                i,
                selectionState?.selectedNode ?? null,
                selectionState?.mode
            )
            const label = disambiguationMap[i]
            rowItems.push(constructNode(node, line as 0 | 1 | 2, displayMode, label))

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
