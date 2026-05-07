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
    hasCustomPuzzle: boolean
    enableSolutions: boolean
}

export default function Game({ puzzles, hasCustomPuzzle, enableSolutions }: GameProps) {
    const [puzzleIndex, setPuzzleIndex] = useState(0)
    const [showSolution, setShowSolution] = useState(false)

    // Progress only tracks sample puzzles (exclude custom puzzle if present)
    const sampleOffset = hasCustomPuzzle ? 1 : 0
    const sampleCount = puzzles.length - sampleOffset

    // Initialize puzzle states: first sample puzzle is in-progress, rest are not-started
    const [puzzleStates, setPuzzleStates] = useState<PuzzleState[]>(() =>
        Array(sampleCount)
            .fill('not-started')
            .map((_, i) => (i === 0 ? 'in-progress' : 'not-started'))
    )

    // Track which puzzle was last solved to detect first-time solves
    const [lastSolvedPuzzle, setLastSolvedPuzzle] = useState<number | null>(null)

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

    // Map puzzleIndex to progress index (excluding custom puzzle)
    const isSamplePuzzle = puzzleIndex >= sampleOffset
    const progressIndex = isSamplePuzzle ? puzzleIndex - sampleOffset : -1

    // Compute read-only state: solved puzzles are read-only
    const isReadOnly = progressIndex >= 0 && puzzleStates[progressIndex] === 'solved'

    // Compute navigation permissions
    const canGoPrevious = puzzleIndex > 0
    const canGoNext =
        puzzleIndex < puzzles.length - 1 &&
        (progressIndex < 0 ||
            puzzleStates[progressIndex + 1] !== 'not-started' ||
            puzzleStates[progressIndex] === 'solved')

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

    // Update progress when puzzle is solved
    useEffect(() => {
        if (solutionReached && progressIndex >= 0) {
            setPuzzleStates(current => {
                // Only act if this puzzle is currently in-progress
                if (current[progressIndex] !== 'in-progress') return current
                const next = [...current]
                // Mark current puzzle as solved
                next[progressIndex] = 'solved'
                return next
            })
            setLastSolvedPuzzle(puzzleIndex)
        }
    }, [solutionReached, progressIndex, puzzleIndex])

    // Reset lastSolvedPuzzle when navigating away from a solved puzzle
    useEffect(() => {
        if (progressIndex < 0) {
            setLastSolvedPuzzle(null)
            return
        }
        if (puzzleStates[progressIndex] !== 'solved' || lastSolvedPuzzle !== puzzleIndex) {
            setLastSolvedPuzzle(null)
        }
    }, [puzzleIndex, progressIndex, puzzleStates, lastSolvedPuzzle])

    // Determine message to show
    const isJustSolved = solutionReached && lastSolvedPuzzle === puzzleIndex
    const isPuzzleCompleted =
        progressIndex >= 0 && puzzleStates[progressIndex] === 'solved' && !isJustSolved

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
                if (canGoNext) {
                    resetSolutionReached()
                    resetBridges()
                    const newIndex = Math.min(puzzles.length - 1, puzzleIndex + 1)
                    // Update puzzle states: mark current as solved if needed, mark new as in-progress
                    const currentProgressIndex =
                        puzzleIndex >= sampleOffset ? puzzleIndex - sampleOffset : -1
                    const newProgressIndex = newIndex >= sampleOffset ? newIndex - sampleOffset : -1
                    if (currentProgressIndex >= 0 || newProgressIndex >= 0) {
                        setPuzzleStates(current => {
                            const next = [...current]
                            // If current puzzle is in-progress and not solved, keep it as-is
                            // If navigating away from an unsolved puzzle, it stays in-progress in the array
                            // but we'll rely on only showing one as "active" - actually let's just
                            // allow the new one to become in-progress
                            if (newProgressIndex >= 0 && next[newProgressIndex] === 'not-started') {
                                next[newProgressIndex] = 'in-progress'
                            }
                            return next
                        })
                    }
                    setPuzzleIndex(newIndex)
                    setShowSolution(false)
                }
                return
            }
            // Ignore bridge-related input on solved puzzles, but allow quit
            if (isReadOnly && input !== 'q') {
                return
            }
            handleInput(input, key)
        },
        [
            handleInput,
            enableSolutions,
            puzzles.length,
            resetSolutionReached,
            resetBridges,
            isReadOnly,
            canGoNext,
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
                <Title
                    puzzleIndex={puzzleIndex}
                    puzzle={encoding}
                    isCustomPuzzle={hasCustomPuzzle && puzzleIndex === 0}
                />
                <PuzzleProgress states={puzzleStates} columns={5} />
                <Controls
                    hasSolution={!!puzzle.solution}
                    enableSolutions={enableSolutions}
                    selectionState={selectionState}
                    canGoNext={canGoNext}
                    canGoPrevious={canGoPrevious}
                />
            </Box>
            <Box flexDirection="column">
                <Status
                    showSolution={showSolution}
                    selectionState={selectionState}
                    minNumber={minNumber}
                    maxNumber={maxNumber}
                    solutionReached={solutionReached}
                />
                <GameBoard
                    numNodes={numNodes}
                    rows={rows}
                    showSolution={showSolution}
                    selectionState={selectionState}
                />
                <Messages
                    gridNotConnected={gridNotConnected}
                    isJustSolved={isJustSolved}
                    isPuzzleCompleted={isPuzzleCompleted}
                />
            </Box>
        </Box>
    )
}
