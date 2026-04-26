import { useCallback, useRef, useState } from 'react'

import type { HashiNodeData } from '../types.ts'
import { areAllNodesFilled, isConnected } from '../utils/bridges.ts'
import { mergeBridges, toggleBridge } from './bridgeOperations.ts'
import { getInitialSelectionState, transition } from './stateMachine.ts'
import type { Grid, PlacedBridge, SelectionState } from './types.ts'

export type UseGameStateProps = {
    puzzleIndex: number
    puzzlesLength: number
    originalRows: HashiNodeData[][]
    onPrev: () => void
    onNext: () => void
    onToggleSolution?: () => void
    onQuit: () => void
}

export type UseGameStateReturn = {
    selectionState: SelectionState
    userBridges: PlacedBridge[]
    rows: HashiNodeData[][]
    solutionReached: boolean
    gridNotConnected: boolean
    handleInput: (input: string, key: { escape?: boolean }) => void
    resetSolutionReached: () => void
    resetBridges: () => void
}

export function useGameState({
    puzzleIndex,
    puzzlesLength,
    originalRows,
    onPrev,
    onNext,
    onToggleSolution,
    onQuit,
}: UseGameStateProps): UseGameStateReturn {
    const [userBridges, setUserBridges] = useState<PlacedBridge[]>([])
    const [solutionReached, setSolutionReached] = useState(false)
    const [gridNotConnected, setGridNotConnected] = useState(false)

    const [selectionState, setSelectionState] = useState<SelectionState>(getInitialSelectionState())

    const selectionStateRef = useRef(selectionState)
    selectionStateRef.current = selectionState

    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    // Signals that the solution was just reached in this input cycle, skipping the normal post-bridge delay
    const solutionJustReachedRef = useRef(false)

    const resetSelection = useCallback(() => {
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current)
            resetTimeoutRef.current = null
        }
        solutionJustReachedRef.current = false
        setSelectionState(getInitialSelectionState())
    }, [])

    const clearResetTimeout = useCallback(() => {
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current)
            resetTimeoutRef.current = null
        }
    }, [])

    const mergedRows = useCallback(() => {
        return mergeBridges(originalRows, userBridges)
    }, [originalRows, userBridges])

    const handleBridgePlaced = useCallback(
        (bridge: PlacedBridge) => {
            const result = toggleBridge(userBridges, bridge)
            setUserBridges(result.bridges)

            const merged = mergeBridges(originalRows, result.bridges)
            const allFilled = areAllNodesFilled(merged)
            const connected = isConnected(merged)
            const reached = allFilled && connected
            setSolutionReached(reached)
            setGridNotConnected(allFilled && !connected)
            solutionJustReachedRef.current = reached

            return result.erased
        },
        [userBridges, originalRows]
    )

    const handleInput = useCallback(
        (input: string, key: { escape?: boolean }) => {
            // When solution is reached, only allow navigation, quit, and toggle-solution
            if (solutionReached) {
                const allowedInputs = ['p', 'n', 'q', 's']
                if (!allowedInputs.includes(input.toLowerCase())) {
                    return
                }
            }

            const currentState = selectionStateRef.current
            const grid = mergedRows() as Grid

            const result = transition(
                currentState,
                input,
                key,
                grid,
                puzzleIndex,
                puzzlesLength,
                true,
                handleBridgePlaced
            )

            if (result.action.type === 'quit') {
                onQuit()
                return
            }

            if (result.action.type === 'navigate') {
                if (result.action.direction === 'next') {
                    onNext()
                } else {
                    onPrev()
                }
                setSolutionReached(false)
                setGridNotConnected(false)
                resetSelection()
                return
            }

            if (result.action.type === 'toggle-solution') {
                onToggleSolution?.()
                return
            }

            if (
                result.action.type === 'select-direction' &&
                (result.nextState.mode === 'selected' || result.nextState.mode === 'invalid')
            ) {
                clearResetTimeout()
                if (solutionJustReachedRef.current) {
                    // Solution reached, reset immediately
                    solutionJustReachedRef.current = false
                    resetSelection()
                    return
                } else {
                    resetTimeoutRef.current = setTimeout(resetSelection, 1_500)
                }
            }

            setSelectionState(result.nextState)
        },
        [
            mergedRows,
            handleBridgePlaced,
            onPrev,
            onNext,
            onToggleSolution,
            onQuit,
            resetSelection,
            clearResetTimeout,
            puzzleIndex,
            puzzlesLength,
        ]
    )

    const resetSolutionReached = useCallback(() => {
        setSolutionReached(false)
    }, [])

    const resetBridges = useCallback(() => {
        setUserBridges([])
    }, [])

    return {
        selectionState,
        userBridges,
        rows: mergedRows(),
        solutionReached,
        gridNotConnected,
        handleInput,
        resetSolutionReached,
        resetBridges,
    }
}
