import { Box } from 'ink'
import type { SelectionState } from '../gameState/types.ts'
import type { HashiNodeData } from '../types.ts'
import {
    NODE_WIDTH,
    OUTER_PADDING,
    ROW_HEIGHT,
    SPACE_BETWEEN,
    validateGrid,
} from '../utils/bridges.ts'
import HashiRow from './HashiRow.tsx'

type GameBoardProps = {
    rows: HashiNodeData[][]
    numNodes: number
    selectionState?: SelectionState
}

export default function GameBoard({ rows, numNodes, selectionState }: GameBoardProps) {
    validateGrid({ rows, numNodes })

    const height = rows.length * ROW_HEIGHT + 2
    const borderWidth = 2
    const outerPadding = 2 * OUTER_PADDING
    const innerPadding = (numNodes - 1) * SPACE_BETWEEN
    const nodesWidth = numNodes * NODE_WIDTH
    const width = borderWidth + outerPadding + innerPadding + nodesWidth

    return (
        <Box flexDirection="column">
            <Box
                borderStyle="single"
                borderColor="white"
                width={width}
                height={height}
                flexDirection="column"
            >
                {rows.map((nodes, i) => (
                    <HashiRow
                        key={i}
                        nodes={nodes}
                        rowIndex={i}
                        highlightedNode={selectionState?.selectedNumber ?? undefined}
                        selectionState={selectionState}
                    />
                ))}
            </Box>
        </Box>
    )
}
