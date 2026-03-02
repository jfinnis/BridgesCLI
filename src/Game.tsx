import { useCallback, useMemo, useState } from 'react'

import HashiGrid from './components/HashiGrid.tsx'
import { type PuzzleData, parsePuzzle } from './utils/puzzle-encoding.ts'
import usePuzzleInput from './utils/usePuzzleInput.ts'

type GameProps = {
    puzzles: PuzzleData[]
    hasCustomPuzzle: boolean
    stdout: boolean
}

export default function Game({ puzzles, hasCustomPuzzle, stdout }: GameProps) {
    const [puzzleIndex, setPuzzleIndex] = useState(0)
    const [showSolution, setShowSolution] = useState(false)

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

    const puzzle = puzzles[puzzleIndex]
    if (!puzzle) throw new Error('HashiGrid: no puzzle found')

    const encoding = showSolution && puzzle.solution ? puzzle.solution : puzzle.encoding
    const dimensions = encoding.split(':')[0] ?? '5x5'
    const numNodes = Number(dimensions.split('x')[0]) || 5

    const rows = useMemo(() => parsePuzzle(encoding), [encoding])

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
              rows,
              showSolution,
              onPrev: handlePrev,
              onNext: handleNext,
              onToggleSolution: handleToggleSolution,
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
