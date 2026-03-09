import { useCallback, useMemo, useState } from 'react'

import HashiGrid from './components/HashiGrid.tsx'
import type { HashiNodeData, PlacedBridge } from './types.ts'
import { type PuzzleData, parsePuzzle } from './utils/puzzle-encoding.ts'
import usePuzzleInput from './utils/usePuzzleInput.ts'

type GameProps = {
    puzzles: PuzzleData[]
    hasCustomPuzzle: boolean
    stdout: boolean
}

// Compares two bridges for equality, treating bridges in either direction as equivalent.
// A bridge from A→B is considered equal to a bridge from B→A.
function bridgesEqual(a: PlacedBridge, b: PlacedBridge): boolean {
    return (
        (a.from.row === b.from.row &&
            a.from.col === b.from.col &&
            a.to.row === b.to.row &&
            a.to.col === b.to.col) ||
        (a.from.row === b.to.row &&
            a.from.col === b.to.col &&
            a.to.row === b.from.row &&
            a.to.col === b.from.col)
    )
}

// Toggles a bridge: removes it if it already exists, otherwise adds it.
// Returns true if bridge was erased, false if it was added.
function toggleBridge(
    bridges: PlacedBridge[],
    bridge: PlacedBridge
): { bridges: PlacedBridge[]; erased: boolean } {
    const exists = bridges.some(b => bridgesEqual(b, bridge))
    if (exists) {
        return { bridges: bridges.filter(b => !bridgesEqual(b, bridge)), erased: true }
    }
    return { bridges: [...bridges, bridge], erased: false }
}

// Merges user-placed bridges with the original puzzle rows.
// Creates a new grid with both original bridges (from solution) and user-drawn bridges.
// This preserves the original puzzle state for undo/reset functionality.
function mergeBridges(originalRows: HashiNodeData[][], bridges: PlacedBridge[]): HashiNodeData[][] {
    // Deep clone the rows
    const rows = originalRows.map(row => row.map(cell => ({ ...cell })))

    // Apply each bridge
    for (const bridge of bridges) {
        const { from, to } = bridge

        if (from.row === to.row) {
            // Horizontal bridge
            const row = rows[from.row]
            if (!row) continue
            const minCol = Math.min(from.col, to.col)
            const maxCol = Math.max(from.col, to.col)

            // Set lineRight on the left node
            if (minCol >= 0 && minCol < row.length) {
                const cell = row[minCol]
                if (cell) cell.lineRight = 1
            }
            // Set lineLeft on the right node
            if (maxCol >= 0 && maxCol < row.length) {
                const cell = row[maxCol]
                if (cell) cell.lineLeft = 1
            }
            // Fill in bridge cells
            for (let c = minCol + 1; c < maxCol; c++) {
                if (c >= 0 && c < row.length) {
                    const cell = row[c]
                    if (cell) cell.value = '-'
                }
            }
        } else if (from.col === to.col) {
            // Vertical bridge
            const minRow = Math.min(from.row, to.row)
            const maxRow = Math.max(from.row, to.row)

            // Set lineDown on the top node
            const topNode = rows[minRow]?.[from.col]
            if (topNode) topNode.lineDown = 1

            // Set lineUp on the bottom node
            const bottomNode = rows[maxRow]?.[from.col]
            if (bottomNode) bottomNode.lineUp = 1

            // Fill in bridge cells
            for (let r = minRow + 1; r < maxRow; r++) {
                if (r >= 0 && r < rows.length) {
                    const rowNode = rows[r]?.[from.col]
                    if (rowNode) rowNode.value = '|'
                }
            }
        }
    }

    return rows
}

export default function Game({ puzzles, hasCustomPuzzle, stdout }: GameProps) {
    const [puzzleIndex, setPuzzleIndex] = useState(0)
    const [showSolution, setShowSolution] = useState(false)
    const [userBridges, setUserBridges] = useState<PlacedBridge[]>([])

    const handlePrev = useCallback(() => {
        setPuzzleIndex(i => i - 1)
        setShowSolution(false)
    }, [])
    const handleNext = useCallback(() => {
        setPuzzleIndex(i => i + 1)
        setShowSolution(false)
    }, [])
    const handleToggleSolution = useCallback(() => {
        setShowSolution(s => !s)
    }, [])
    const handleBridgePlaced = useCallback(
        (bridge: PlacedBridge) => {
            const result = toggleBridge(userBridges, bridge)
            setUserBridges(result.bridges)
            return result.erased
        },
        [userBridges]
    )

    const puzzle = puzzles[puzzleIndex]
    if (!puzzle) throw new Error('HashiGrid: no puzzle found')

    const encoding = showSolution && puzzle.solution ? puzzle.solution : puzzle.encoding
    const dimensions = encoding.split(':')[0] ?? '5x5'
    const numNodes = Number(dimensions.split('x')[0]) || 5

    const originalRows = useMemo(() => parsePuzzle(encoding), [encoding])

    const rows = useMemo(() => mergeBridges(originalRows, userBridges), [originalRows, userBridges])

    // Compute min and max numbers in the puzzle
    const { minNumber, maxNumber } = useMemo(() => {
        let min = 9
        let max = 1
        for (const row of rows) {
            for (const node of row) {
                if (typeof node.value === 'number') {
                    if (node.value < min) min = node.value
                    if (node.value > max) max = node.value
                }
            }
        }
        return { minNumber: min, maxNumber: max }
    }, [rows])

    const canUseInput = Boolean(process.stdin.isTTY) && !stdout
    const { selectionState } = canUseInput
        ? usePuzzleInput({
              puzzleIndex,
              puzzlesLength: puzzles.length,
              rows: originalRows,
              showSolution,
              onPrev: handlePrev,
              onNext: handleNext,
              onToggleSolution: handleToggleSolution,
              onBridgePlaced: handleBridgePlaced,
          })
        : { selectionState: undefined }

    return (
        <HashiGrid
            numNodes={numNodes}
            rows={rows}
            showInstructions={!stdout}
            puzzleIndex={puzzleIndex}
            puzzle={encoding}
            isCustomPuzzle={hasCustomPuzzle && puzzleIndex === 0}
            hasSolution={!!puzzle.solution}
            showSolution={showSolution}
            selectionState={selectionState}
            minNumber={minNumber}
            maxNumber={maxNumber}
        />
    )
}
