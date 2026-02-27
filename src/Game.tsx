import { useCallback, useState } from 'react'

import HashiGrid from './components/HashiGrid.tsx'
import { parsePuzzle } from './utils/parsePuzzle.ts'
import type { PuzzleData } from './utils/samplePuzzles.ts'
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

    const canUseInput = Boolean(process.stdin.isTTY) && !stdout
    if (canUseInput) {
        usePuzzleInput(puzzleIndex, puzzles.length, handlePrev, handleNext, handleToggleSolution)
    }

    const puzzle = puzzles[puzzleIndex]
    if (!puzzle) throw new Error('HashiGrid: no puzzle found')

    const encoding = showSolution && puzzle.solution ? puzzle.solution : puzzle.encoding
    const dimensions = encoding.split(':')[0] ?? '5x5'
    const numNodes = Number(dimensions.split('x')[0]) || 5

    return (
        <HashiGrid
            numNodes={numNodes}
            rows={parsePuzzle(encoding)}
            showInstructions={!stdout}
            puzzleIndex={puzzleIndex}
            puzzle={encoding}
            isCustomPuzzle={hasCustomPuzzle && puzzleIndex === 0}
            hasSolution={!!puzzle.solution}
            showSolution={showSolution}
        />
    )
}
