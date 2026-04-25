import { useCallback, useMemo, useState } from 'react'

import HashiGrid from './components/HashiGrid.tsx'
import { useGameState } from './gameState/index.ts'
import { type PuzzleData, parsePuzzle } from './utils/puzzle-encoding.ts'
import usePuzzleInput from './utils/usePuzzleInput.ts'

type GameProps = {
    puzzles: PuzzleData[]
    hasCustomPuzzle: boolean
    enableSolutions: boolean
}

export default function Game({ puzzles, hasCustomPuzzle, enableSolutions }: GameProps) {
    const [puzzleIndex, setPuzzleIndex] = useState(0)
    const [showSolution, setShowSolution] = useState(false)

    const handlePrev = useCallback(() => {
        setPuzzleIndex(current => Math.max(0, current - 1))
        setShowSolution(false)
    }, [])

    const handleNext = useCallback(() => {
        setPuzzleIndex(current => Math.min(puzzles.length - 1, current + 1))
        setShowSolution(false)
    }, [])

    const handleToggleSolution = useCallback(() => {
        setShowSolution(s => !s)
    }, [])

    const puzzle = puzzles[puzzleIndex]
    if (!puzzle) throw new Error('HashiGrid: no puzzle found')

    const encoding = showSolution && puzzle.solution ? puzzle.solution : puzzle.encoding
    const dimensions = encoding.split(':')[0] ?? '5x5'
    const numNodes = Number(dimensions.split('x')[0]) || 5

    const originalRows = useMemo(() => parsePuzzle(encoding), [encoding])

    const canUseInput = Boolean(process.stdin.isTTY)

    const { selectionState, rows, solutionReached, gridNotConnected, handleInput } = canUseInput
        ? useGameState({
              puzzleIndex,
              puzzlesLength: puzzles.length,
              originalRows,
              onPrev: handlePrev,
              onNext: handleNext,
              onToggleSolution: handleToggleSolution,
              onQuit: () => process.exit(0),
          })
        : {
              selectionState: undefined,
              rows: originalRows,
              solutionReached: false,
              gridNotConnected: false,
              handleInput: () => {},
          }

    const handleKeyInput = useCallback(
        (input: string, key: { escape?: boolean }) => {
            if (input === 's' && enableSolutions) {
                setShowSolution(s => !s)
                return
            }
            if (input === 'p') {
                setPuzzleIndex(i => Math.max(0, i - 1))
                setShowSolution(false)
                return
            }
            if (input === 'n') {
                setPuzzleIndex(i => Math.min(puzzles.length - 1, i + 1))
                setShowSolution(false)
                return
            }
            handleInput(input, key)
        },
        [handleInput, enableSolutions, puzzles.length]
    )

    if (canUseInput) {
        usePuzzleInput({ onInput: handleKeyInput })
    }

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

    return (
        <HashiGrid
            numNodes={numNodes}
            rows={rows}
            showInstructions={true}
            puzzleIndex={puzzleIndex}
            puzzle={encoding}
            isCustomPuzzle={hasCustomPuzzle && puzzleIndex === 0}
            hasSolution={!!puzzle.solution}
            showSolution={showSolution}
            enableSolutions={enableSolutions}
            selectionState={selectionState}
            minNumber={minNumber}
            maxNumber={maxNumber}
            solutionReached={solutionReached}
            gridNotConnected={gridNotConnected}
        />
    )
}
