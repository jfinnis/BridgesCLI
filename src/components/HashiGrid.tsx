import { Box } from 'ink'

import type { HashiNodeData, SelectionState } from '../types.ts'
import {
    NODE_WIDTH,
    OUTER_PADDING,
    ROW_HEIGHT,
    SPACE_BETWEEN,
    validateGrid,
} from '../utils/bridges.ts'
import HashiRow from './HashiRow.tsx'
import Header from './Header.tsx'
import Messages from './Messages.tsx'

type HashiGridProps = {
    /** The full data structure needed to render the grid. Height of the grid is determined
     * by the number of rows here. */
    rows: HashiNodeData[][]
    /** Number of nodes in a row. */
    numNodes: number
    /** Show quit instructions */
    showInstructions?: boolean
    /** Current puzzle index for display */
    puzzleIndex?: number
    /** Current puzzle string for display */
    puzzle?: string
    /** Whether this is a custom puzzle */
    isCustomPuzzle?: boolean
    /** Whether this puzzle has a solution available */
    hasSolution?: boolean
    /** Whether to show the solution */
    showSolution?: boolean
    /** Current selection state for highlighting */
    selectionState?: SelectionState
    /** Minimum number value in the puzzle */
    minNumber?: number
    /** Maximum number value in the puzzle */
    maxNumber?: number
}

export default function HashiGrid({
    rows,
    numNodes,
    showInstructions = false,
    puzzleIndex = 0,
    puzzle = '',
    isCustomPuzzle = false,
    hasSolution = false,
    showSolution = false,
    selectionState,
    minNumber,
    maxNumber,
}: HashiGridProps) {
    validateGrid({ rows, numNodes })

    const height = rows.length * ROW_HEIGHT + 2
    const borderWidth = 2
    const outerPadding = 2 * OUTER_PADDING
    const innerPadding = (numNodes - 1) * SPACE_BETWEEN
    const nodesWidth = numNodes * NODE_WIDTH
    const width = borderWidth + outerPadding + innerPadding + nodesWidth

    return (
        <Box flexDirection="column">
            <Header
                puzzleIndex={puzzleIndex}
                puzzle={puzzle}
                isCustomPuzzle={isCustomPuzzle}
                showSolution={showSolution}
                selectionState={selectionState}
                minNumber={minNumber}
                maxNumber={maxNumber}
            />
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
                        highlightedNode={selectionState?.selectedNumber ?? undefined}
                    />
                ))}
            </Box>
            {showInstructions ? (
                <Messages hasSolution={hasSolution} selectionState={selectionState} />
            ) : null}
        </Box>
    )
}
