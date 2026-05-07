import { Box, Text } from 'ink'
import type React from 'react'
import type { SelectionState } from '../gameState/types.ts'
import type { HashiNodeData } from '../types.ts'
import {
    constructNode,
    getDisplayMode,
    getNodeFilledState,
    type HashiCell,
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

    const cells = nodes.map((node, i) => {
        if (!node || node.value === ' ') {
            const emptyLine = ' '.repeat(NODE_WIDTH)
            return {
                lines: [emptyLine, emptyLine, emptyLine] as [string, string, string],
                width: NODE_WIDTH,
            } as HashiCell
        }

        const displayMode = getDisplayMode(
            node,
            highlightedNode,
            rowIndex,
            i,
            selectionState?.selectedNode ?? null,
            selectionState?.mode
        )
        const label = disambiguationMap[i] as string | undefined
        const filledState = getNodeFilledState(node)
        return constructNode(node, displayMode, label, filledState)
    })

    const lines: React.ReactNode[] = []
    for (let lineIdx = 0; lineIdx < ROW_HEIGHT; lineIdx++) {
        const lineParts: string[] = [' '.repeat(OUTER_PADDING)]
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i]
            if (!cell) continue
            lineParts.push(cell.lines[lineIdx as 0 | 1 | 2])
            if (i < cells.length - 1) {
                lineParts.push(' '.repeat(SPACE_BETWEEN))
            }
        }
        lineParts.push(' '.repeat(OUTER_PADDING))
        lines.push(<Text key={lineIdx}>{lineParts.join('')}</Text>)
    }

    return <Box flexDirection="column">{lines}</Box>
}
