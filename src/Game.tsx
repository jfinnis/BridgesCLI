import { Box } from 'ink'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
    isSinglePuzzleMode?: boolean
}

export default function Game({ puzzles, isSinglePuzzleMode = false }: GameProps) {
    const [puzzleIndex, setPuzzleIndex] = useState(0)

    // Puzzle progress tracking (not used in single-puzzle mode)
    const sampleCount = puzzles.length

    const [puzzleStates, setPuzzleStates] = useState<PuzzleState[]>(() =>
        Array(sampleCount)
            .fill('not-started')
            .map((_, i) => (i === 0 ? 'in-progress' : 'not-started'))
    )

    const allSolved = useMemo(() => puzzleStates.every(state => state === 'solved'), [puzzleStates])

    const [lastSolvedPuzzle, setLastSolvedPuzzle] = useState<number | null>(null)

    const handlePrev = useCallback(() => {
        setPuzzleIndex(current => Math.max(0, current - 1))
    }, [])

    const handleNext = useCallback(() => {
        setPuzzleIndex(current => Math.min(puzzles.length - 1, current + 1))
    }, [])

    const puzzle = puzzles[puzzleIndex]
    if (!puzzle) throw new Error('Bridges: no puzzle found')

    const encoding = puzzle.encoding
    const dimensions = encoding.split(':')[0] ?? '5x5'
    const numNodes = Number(dimensions.split('x')[0]) || 5

    const originalRows = useMemo(() => parsePuzzle(encoding), [encoding])

    const canUseInput = Boolean(process.stdin.isTTY)

    const isReadOnly = puzzleStates[puzzleIndex] === 'solved'

    const canGoPrevious = puzzleIndex > 0
    const canGoNext =
        puzzleIndex < puzzles.length - 1 &&
        (puzzleStates[puzzleIndex] === 'solved' || puzzleStates[puzzleIndex + 1] !== 'not-started')

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
              onPrev: isSinglePuzzleMode ? () => {} : handlePrev,
              onNext: isSinglePuzzleMode ? () => {} : handleNext,
              onQuit: () => process.exit(0),
              isReadOnly,
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

    useEffect(() => {
        if (solutionReached && puzzleIndex < puzzles.length) {
            setPuzzleStates(current => {
                if (current[puzzleIndex] !== 'in-progress') return current
                const next = [...current]
                next[puzzleIndex] = 'solved'
                return next
            })
            setLastSolvedPuzzle(puzzleIndex)
        }
    }, [solutionReached, puzzleIndex, puzzles.length])

    useEffect(() => {
        if (puzzleStates[puzzleIndex] !== 'solved' || lastSolvedPuzzle !== puzzleIndex) {
            setLastSolvedPuzzle(null)
        }
    }, [puzzleIndex, puzzleStates, lastSolvedPuzzle])

    const isJustSolved = solutionReached && lastSolvedPuzzle === puzzleIndex
    const isPuzzleCompleted =
        puzzleStates[puzzleIndex] === 'solved' && !isJustSolved && !isSinglePuzzleMode

    const handleKeyInput = useCallback(
        (input: string, key: { escape?: boolean }) => {
            if (isSinglePuzzleMode) {
                handleInput(input, key)
                return
            }
            if (input === 'p') {
                resetSolutionReached()
                resetBridges()
                setPuzzleIndex(i => Math.max(0, i - 1))
                return
            }
            if (input === 'n') {
                if (canGoNext) {
                    resetSolutionReached()
                    resetBridges()
                    const newIndex = Math.min(puzzles.length - 1, puzzleIndex + 1)
                    setPuzzleStates(current => {
                        const next = [...current]
                        if (newIndex < next.length && next[newIndex] === 'not-started') {
                            next[newIndex] = 'in-progress'
                        }
                        return next
                    })
                    setPuzzleIndex(newIndex)
                }
                return
            }
            if (isReadOnly && input !== 'q') {
                return
            }
            handleInput(input, key)
        },
        [
            handleInput,
            puzzles.length,
            resetSolutionReached,
            resetBridges,
            isReadOnly,
            canGoNext,
            isSinglePuzzleMode,
        ]
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
                <Title puzzleIndex={puzzleIndex} isSinglePuzzleMode={isSinglePuzzleMode} />
                {!isSinglePuzzleMode && <PuzzleProgress states={puzzleStates} columns={5} />}
                <Controls
                    selectionState={selectionState}
                    canGoNext={canGoNext && !isSinglePuzzleMode}
                    canGoPrevious={canGoPrevious && !isSinglePuzzleMode}
                />
            </Box>
            <Box flexDirection="column">
                <Status
                    selectionState={selectionState}
                    minNumber={minNumber}
                    maxNumber={maxNumber}
                />
                <GameBoard numNodes={numNodes} rows={rows} selectionState={selectionState} />
                <Messages
                    gridNotConnected={gridNotConnected}
                    isJustSolved={isJustSolved}
                    isPuzzleCompleted={isPuzzleCompleted}
                    allSolved={isSinglePuzzleMode ? false : allSolved}
                />
            </Box>
        </Box>
    )
}
