import { useApp, useInput } from 'ink'
import { useCallback, useRef, useState } from 'react'

import type { Direction, PlacedBridge, SelectionState } from '../types.ts'

type UsePuzzleInputProps = {
    puzzleIndex: number
    puzzlesLength: number
    rows: { value: number | '-' | '=' | '#' | ' ' | '|' }[][]
    showSolution: boolean
    onPrev: () => void
    onNext: () => void
    onToggleSolution: () => void
    onBridgePlaced?: (bridge: PlacedBridge) => boolean
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
): { row: number; col: number } | null {
    const rowCount = rows.length
    const firstRow = rows[0]
    if (!firstRow) return null
    const colCount = firstRow.length

    let checkRow = fromRow
    let checkCol = fromCol

    if (direction === 'h') {
        // left
        checkCol = fromCol - 1
        while (checkCol >= 0) {
            const row = rows[fromRow]
            if (!row) return null
            const cell = row[checkCol]
            if (cell) {
                if (cell.value === '|' || cell.value === '#') {
                    // Bridge in the way - invalid
                    return null
                }
                if (typeof cell.value === 'number') {
                    return { row: fromRow, col: checkCol }
                }
            }
            checkCol--
        }
    } else if (direction === 'l') {
        // right
        checkCol = fromCol + 1
        while (checkCol < colCount) {
            const row = rows[fromRow]
            if (!row) return null
            const cell = row[checkCol]
            if (cell) {
                if (cell.value === '|' || cell.value === '#') {
                    // Bridge in the way - invalid
                    return null
                }
                if (typeof cell.value === 'number') {
                    return { row: fromRow, col: checkCol }
                }
            }
            checkCol++
        }
    } else if (direction === 'j') {
        // down
        checkRow = fromRow + 1
        while (checkRow < rowCount) {
            const row = rows[checkRow]
            if (!row) return null
            const cell = row[fromCol]
            if (cell) {
                if (cell.value === '-' || cell.value === '=') {
                    // Bridge in the way - invalid
                    return null
                }
                if (typeof cell.value === 'number') {
                    return { row: checkRow, col: fromCol }
                }
            }
            checkRow++
        }
    } else if (direction === 'k') {
        // up
        checkRow = fromRow - 1
        while (checkRow >= 0) {
            const row = rows[checkRow]
            if (!row) return null
            const cell = row[fromCol]
            if (cell) {
                if (cell.value === '-' || cell.value === '=') {
                    // Bridge in the way - invalid
                    return null
                }
                if (typeof cell.value === 'number') {
                    return { row: checkRow, col: fromCol }
                }
            }
            checkRow--
        }
    }

    return null
}

export default function usePuzzleInput({
    puzzleIndex,
    puzzlesLength,
    rows,
    showSolution,
    onPrev,
    onNext,
    onToggleSolution,
    onBridgePlaced,
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

    useInput((input, key) => {
        // q always quits
        if (input === 'q') {
            exit()
            return
        }

        const currentMode = selectionStateRef.current.mode

        // If not idle, handle selection keys
        if (currentMode !== 'idle') {
            // Esc resets to idle
            if (key.escape) {
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
                    const targetNode = selectedNode
                        ? findNodeInDirection(rows, selectedNode.row, selectedNode.col, direction)
                        : null

                    let erased = false
                    if (targetNode && selectedNode && onBridgePlaced) {
                        // Toggle the bridge (add if not exists, remove if exists)
                        erased = onBridgePlaced({
                            from: selectedNode,
                            to: targetNode,
                        })
                    }

                    // Show selected/invalid state, then reset after 1.5s
                    setSelectionState({
                        ...selectionStateRef.current,
                        mode: targetNode ? 'selected' : 'invalid',
                        direction,
                        bridgeErased: erased,
                    })
                    setTimeout(resetSelection, 1_500)
                }
                return
            }

            // In selected/invalid mode, allow immediate input for next action
            if (currentMode === 'selected' || currentMode === 'invalid') {
                // Allow n/p/s navigation
                if (input === 'n' && puzzleIndexRef.current + 1 < puzzlesLength) {
                    onNext()
                    resetSelection()
                    return
                } else if (input === 'p' && puzzleIndexRef.current - 1 >= 0) {
                    onPrev()
                    resetSelection()
                    return
                } else if (input === 's') {
                    onToggleSolution()
                    resetSelection()
                    return
                }

                // Allow number keys to start a new selection
                if (input >= '1' && input <= '8') {
                    if (showSolutionRef.current) return

                    const num = parseInt(input, 10)
                    const matches = findMatchingNodes(rows, num)
                    if (matches.length > 0) {
                        if (matches.length === 1) {
                            setSelectionState({
                                mode: 'selecting-node',
                                selectedNumber: num,
                                direction: null,
                                matchingNodes: matches,
                                disambiguationLabels: [],
                                selectedNode: matches[0] ?? null,
                            })
                        } else {
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
                    return
                }

                // Allow direction keys to draw another bridge immediately
                if (input === 'h' || input === 'j' || input === 'k' || input === 'l') {
                    // Get the previously selected node to use as starting point
                    const prevNode = selectionStateRef.current.selectedNode
                    if (prevNode) {
                        const direction = input as Direction
                        const targetNode = findNodeInDirection(
                            rows,
                            prevNode.row,
                            prevNode.col,
                            direction
                        )

                        let erased = false
                        if (targetNode && onBridgePlaced) {
                            erased = onBridgePlaced({
                                from: prevNode,
                                to: targetNode,
                            })
                        }

                        setSelectionState({
                            ...selectionStateRef.current,
                            mode: targetNode ? 'selected' : 'invalid',
                            direction,
                            bridgeErased: erased,
                        })
                    }
                    return
                }
            }
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
