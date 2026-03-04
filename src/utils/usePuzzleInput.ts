import { useApp, useInput } from 'ink'
import { useCallback, useRef, useState } from 'react'

import type { Direction, SelectionState } from '../types.ts'

type UsePuzzleInputProps = {
    puzzleIndex: number
    puzzlesLength: number
    rows: { value: number | '-' | '=' | '#' | ' ' | '|' }[][]
    showSolution: boolean
    onPrev: () => void
    onNext: () => void
    onToggleSolution: () => void
}

function findMatchingNodes(
    rows: { value: number | '-' | '=' | '#' | ' ' | '|' }[][],
    number: number
) {
    const matches: { row: number; col: number }[] = []
    for (let row = 0; row < rows.length; row++) {
        const currentRow = rows[row]
        if (!currentRow) continue
        for (let col = 0; col < currentRow.length; col++) {
            const cell = currentRow[col]
            if (cell && cell.value === number) {
                matches.push({ row, col })
            }
        }
    }
    return matches
}

function generateLabels(count: number): string[] {
    const labels: string[] = []
    for (let i = 0; i < count; i++) {
        labels.push(String.fromCharCode(97 + i)) // a, b, c, ...
    }
    return labels
}

export function findNodeInDirection(
    rows: { value: number | '-' | '=' | '#' | ' ' | '|' }[][],
    fromRow: number,
    fromCol: number,
    direction: Direction
): boolean {
    const rowCount = rows.length
    const firstRow = rows[0]
    if (!firstRow) return false
    const colCount = firstRow.length

    let checkRow = fromRow
    let checkCol = fromCol

    if (direction === 'h') {
        // left
        checkCol = fromCol - 1
        while (checkCol >= 0) {
            const row = rows[fromRow]
            if (!row) return false
            const cell = row[checkCol]
            if (cell && typeof cell.value === 'number') {
                return true
            }
            checkCol--
        }
    } else if (direction === 'l') {
        // right
        checkCol = fromCol + 1
        while (checkCol < colCount) {
            const row = rows[fromRow]
            if (!row) return false
            const cell = row[checkCol]
            if (cell && typeof cell.value === 'number') {
                return true
            }
            checkCol++
        }
    } else if (direction === 'j') {
        // down
        checkRow = fromRow + 1
        while (checkRow < rowCount) {
            const row = rows[checkRow]
            if (!row) return false
            const cell = row[fromCol]
            if (cell && typeof cell.value === 'number') {
                return true
            }
            checkRow++
        }
    } else if (direction === 'k') {
        // up
        checkRow = fromRow - 1
        while (checkRow >= 0) {
            const row = rows[checkRow]
            if (!row) return false
            const cell = row[fromCol]
            if (cell && typeof cell.value === 'number') {
                return true
            }
            checkRow--
        }
    }

    return false
}

export default function usePuzzleInput({
    puzzleIndex,
    puzzlesLength,
    rows,
    showSolution,
    onPrev,
    onNext,
    onToggleSolution,
}: UsePuzzleInputProps) {
    const { exit } = useApp()
    const puzzleIndexRef = useRef(puzzleIndex)
    puzzleIndexRef.current = puzzleIndex

    const showSolutionRef = useRef(showSolution)
    showSolutionRef.current = showSolution

    const [selectionState, setSelectionState] = useState<SelectionState>({
        mode: 'idle',
        selectedNumber: null,
        direction: null,
        matchingNodes: [],
        disambiguationLabels: [],
        selectedNode: null,
    })

    // Use a ref to track mode for synchronous access in input handler
    const selectionStateRef = useRef(selectionState)
    selectionStateRef.current = selectionState

    const resetSelection = useCallback(() => {
        setSelectionState({
            mode: 'idle',
            selectedNumber: null,
            direction: null,
            matchingNodes: [],
            disambiguationLabels: [],
            selectedNode: null,
        })
    }, [])

    useInput(input => {
        // q always quits
        if (input === 'q') {
            exit()
            return
        }

        const currentMode = selectionStateRef.current.mode

        // If not idle, handle selection keys
        if (currentMode !== 'idle') {
            // Esc resets to idle
            if (input === '\u001b') {
                resetSelection()
                return
            }

            // In disambiguation mode, handle a-z
            if (currentMode === 'disambiguation') {
                const labelIndex = input.charCodeAt(0) - 97 // a=0, b=1, ...
                const matches = selectionStateRef.current.matchingNodes
                if (labelIndex >= 0 && labelIndex < matches.length) {
                    // Selected! Now enter selecting-node mode to choose direction
                    setSelectionState({
                        ...selectionStateRef.current,
                        mode: 'selecting-node',
                        disambiguationLabels: [],
                        selectedNode: matches[labelIndex] ?? null,
                    })
                }
                return
            }

            // In selecting-node mode, handle direction keys
            if (
                currentMode === 'selecting-node' &&
                selectionStateRef.current.selectedNumber !== null
            ) {
                if (input === 'h' || input === 'j' || input === 'k' || input === 'l') {
                    const direction = input as Direction
                    const selectedNode = selectionStateRef.current.selectedNode
                    const isValid = selectedNode
                        ? findNodeInDirection(rows, selectedNode.row, selectedNode.col, direction)
                        : false

                    // Selected! Show selected/invalid state briefly then reset
                    setSelectionState({
                        ...selectionStateRef.current,
                        mode: isValid ? 'selected' : 'invalid',
                        direction,
                    })
                    setTimeout(resetSelection, 1_500)
                }
                return
            }

            // Don't allow n/p/s in selection modes
            return
        }

        // Normal mode key handling
        if (input === 'n' && puzzleIndexRef.current + 1 < puzzlesLength) {
            onNext()
        } else if (input === 'p' && puzzleIndexRef.current - 1 >= 0) {
            onPrev()
        } else if (input === 's') {
            onToggleSolution()
        } else if (input >= '1' && input <= '8') {
            if (showSolutionRef.current) return

            // Number pressed - enter selecting-node or disambiguation mode
            const num = parseInt(input, 10)
            const matches = findMatchingNodes(rows, num)
            if (matches.length > 0) {
                if (matches.length === 1) {
                    // Single match - go directly to selecting-node mode
                    setSelectionState({
                        mode: 'selecting-node',
                        selectedNumber: num,
                        direction: null,
                        matchingNodes: matches,
                        disambiguationLabels: [],
                        selectedNode: matches[0] ?? null,
                    })
                } else {
                    // Multiple matches - enter disambiguation mode
                    setSelectionState({
                        mode: 'disambiguation',
                        selectedNumber: num,
                        direction: null,
                        matchingNodes: matches,
                        disambiguationLabels: generateLabels(matches.length),
                        selectedNode: null,
                    })
                }
            }
        }
    })

    return { selectionState, resetSelection }
}
