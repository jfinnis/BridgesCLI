import { Box } from 'ink'
import { useCallback, useMemo, useState } from 'react'
import Controls from './components/Controls.tsx'
import GameBoard from './components/GameBoard.tsx'
import Messages from './components/Messages.tsx'
import type { PuzzleState } from './components/PuzzleProgress.tsx'
import PuzzleProgress from './components/PuzzleProgress.tsx'
import Status from './components/Status.tsx'
import Title from './components/Title.tsx'
import { useGameState } from './gameState/index.ts'
import { type PuzzleData, parsePuzzle } from './utils/puzzle-encoding.ts'
import usePuzzleInput from './utils/usePuzzleInput.ts'

type GameProps = {
    puzzles: PuzzleData[]
    hasCustomPuzzle: boolean
    enableSolutions: boolean
    puzzleStates?: PuzzleState[]
}

export default function Game({
    puzzles,
    hasCustomPuzzle,
    enableSolutions,
    puzzleStates,
}: GameProps) {
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
    if (!puzzle) throw new Error('Bridges: no puzzle found')

    const encoding = showSolution && puzzle.solution ? puzzle.solution : puzzle.encoding
    const dimensions = encoding.split(':')[0] ?? '5x5'
    const numNodes = Number(dimensions.split('x')[0]) || 5

    const originalRows = useMemo(() => parsePuzzle(encoding), [encoding])

    const canUseInput = Boolean(process.stdin.isTTY)

    const {
        selectionState,
        rows,
        solutionReached,
        gridNotConnected,
        handleInput,
        resetSolutionReached,
        resetBridges,
    } = canUseInput
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
              resetSolutionReached: () => {},
              resetBridges: () => {},
          }

    const handleKeyInput = useCallback(
        (input: string, key: { escape?: boolean }) => {
            if (input === 's' && enableSolutions) {
                setShowSolution(s => !s)
                return
            }
            if (input === 'p') {
                resetSolutionReached()
                resetBridges()
                setPuzzleIndex(i => Math.max(0, i - 1))
                setShowSolution(false)
                return
            }
            if (input === 'n') {
                resetSolutionReached()
                resetBridges()
                setPuzzleIndex(i => Math.min(puzzles.length - 1, i + 1))
                setShowSolution(false)
                return
            }
            handleInput(input, key)
        },
        [handleInput, enableSolutions, puzzles.length, resetSolutionReached, resetBridges]
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
        <Box flexDirection="row">
            <Box flexDirection="column" marginRight={3}>
                <Title
                    puzzleIndex={puzzleIndex}
                    puzzle={encoding}
                    isCustomPuzzle={hasCustomPuzzle && puzzleIndex === 0}
                />
                {puzzleStates ? <PuzzleProgress states={puzzleStates} columns={5} /> : null}
                <Controls
                    hasSolution={!!puzzle.solution}
                    enableSolutions={enableSolutions}
                    selectionState={selectionState}
                />
            </Box>
            <Box flexDirection="column">
                <Status
                    showSolution={showSolution}
                    selectionState={selectionState}
                    minNumber={minNumber}
                    maxNumber={maxNumber}
                />
                <GameBoard
                    numNodes={numNodes}
                    rows={rows}
                    showSolution={showSolution}
                    selectionState={selectionState}
                />
                <Messages solutionReached={solutionReached} gridNotConnected={gridNotConnected} />
            </Box>
        </Box>
    )
}
