import { Box } from 'ink'
import type { HashiNodeData } from '../types.ts'
import HashiRow from './HashiRow.tsx'

export const ROW_HEIGHT = 3
export const NODE_WIDTH = 5
export const SPACE_BETWEEN = 0
export const OUTER_PADDING = 1

type HashiGridProps = {
    /** The full data structure needed to render the grid. Hiehgt of the grid is determined
     * by the number of rows here. */
    rows: HashiNodeData[][]
    /** Number of nodes in a row. */
    numNodes: number
}

/**
 * Ensure the grid data is consistent with a valid Hashiwokakero puzzle.
 */
export function validateGrid({ rows, numNodes }: HashiGridProps): void {
    if (!rows || rows.length === 0) {
        throw new Error('HashiGrid: empty data supplied')
    }

    let rowCount = 0
    for (const nodes of rows) {
        const prefix = `HashiGrid row ${rowCount}: `
        for (const node of nodes) {
            // Invalid node position
            if (node.position < 0 || node.position >= numNodes) {
                throw new Error(`${prefix}node position ${node.position} is invalid`)
            }

            // There should always be a space between nodes.
            const lastPosition = -999
            if (node.position === lastPosition + 1) {
                throw new Error(`${prefix}nodes ${lastPosition} and ${node.position} are adjacent`)
            }
        }
        rowCount++
    }
}

export default function HashiGrid({ rows, numNodes }: HashiGridProps) {
    validateGrid({ rows, numNodes })

    // Constrain the box tightly around the space needed for the grid.
    const height = rows.length * ROW_HEIGHT + 2
    const borderWidth = 2
    const outerPadding = 2 * OUTER_PADDING
    const innerPadding = (numNodes - 1) * SPACE_BETWEEN
    const nodesWidth = numNodes * NODE_WIDTH
    const width = borderWidth + outerPadding + innerPadding + nodesWidth

    return (
        <Box
            borderStyle="single"
            borderColor="white"
            width={width}
            height={height}
            flexDirection="column"
        >
            {rows.map((nodes, i) => (
                <HashiRow key={i} maxNodes={numNodes} nodes={nodes} />
            ))}
        </Box>
    )
}
