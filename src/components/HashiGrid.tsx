import { Box } from 'ink'

import type { HashiNodeData } from '../types.ts'
import HashiRow from './HashiRow.tsx'
import Header from './Header.tsx'
import Messages from './Messages.tsx'

export const ROW_HEIGHT = 3
export const NODE_WIDTH = 5
export const SPACE_BETWEEN = 0
export const OUTER_PADDING = 1

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

export default function HashiGrid({
    rows,
    numNodes,
    showInstructions = false,
    puzzleIndex = 0,
    puzzle = '',
    isCustomPuzzle = false,
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
            <Header puzzleIndex={puzzleIndex} puzzle={puzzle} isCustomPuzzle={isCustomPuzzle} />
            <Box
                borderStyle="single"
                borderColor="white"
                width={width}
                height={height}
                flexDirection="column"
            >
                {rows.map((nodes, i) => (
                    <HashiRow key={i} nodes={nodes} />
                ))}
            </Box>
            {showInstructions ? <Messages /> : null}
        </Box>
    )
}
