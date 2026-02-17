import { useCallback, useState } from 'react'

import HashiGrid from './components/HashiGrid.tsx'
import { parsePuzzle } from './utils/parsePuzzle.ts'
import usePuzzleInput from './utils/usePuzzleInput.ts'

type GameProps = {
    puzzles: string[]
    hasCustomPuzzle: boolean
    stdout: boolean
}

export default function Game({ puzzles, hasCustomPuzzle, stdout }: GameProps) {
    const [puzzleIndex, setPuzzleIndex] = useState(0)

    const handlePrev = useCallback(() => setPuzzleIndex(i => i - 1), [])
    const handleNext = useCallback(() => setPuzzleIndex(i => i + 1), [])

    const canUseInput = Boolean(process.stdin.isTTY && !stdout)

    if (canUseInput) {
        usePuzzleInput(puzzleIndex, puzzles.length, handlePrev, handleNext)
    }

    const puzzle = puzzles[puzzleIndex] || ''
    const dimensions = puzzle.split(':')[0] ?? '5x5'
    const numNodes = Number(dimensions.split('x')[1]) || 5

    return (
        <HashiGrid
            numNodes={numNodes}
            rows={parsePuzzle(puzzle)}
            showInstructions={!stdout}
            puzzleIndex={puzzleIndex}
            puzzle={puzzle}
            isCustomPuzzle={hasCustomPuzzle && puzzleIndex === 0}
        />
    )
}
