import { Box, Text } from 'ink'

import type { SelectionState } from '../types.ts'

type HeaderProps = {
    puzzleIndex: number
    puzzle: string
    isCustomPuzzle?: boolean
    showSolution?: boolean
    selectionState?: SelectionState
    minNumber?: number
    maxNumber?: number
}

const directionNames: Record<string, string> = {
    h: 'left',
    j: 'down',
    k: 'up',
    l: 'right',
}

export default function Header({
    puzzleIndex,
    puzzle,
    isCustomPuzzle = false,
    showSolution = false,
    selectionState,
    minNumber,
    maxNumber,
}: HeaderProps) {
    const title = isCustomPuzzle
        ? `Bridges: Puzzle - ${puzzle}`
        : `Bridges: Puzzle #${puzzleIndex + 1}`

    let statusText = ''
    if (selectionState) {
        const { mode, selectedNumber, direction } = selectionState
        if (mode === 'selecting-node' && selectedNumber !== null) {
            statusText = 'Select direction with h/j/k/l (left/down/up/right, <shift> = double line)'
        } else if (mode === 'disambiguation' && selectedNumber !== null) {
            statusText = 'Press label shown to select that node'
        } else if (mode === 'selected' && selectedNumber !== null && direction) {
            const lineType = direction === 'h' || direction === 'l' ? 'horizontal' : 'vertical'
            statusText = `Drew ${lineType} bridge`
        } else if (mode === 'invalid' && selectedNumber !== null && direction) {
            statusText = `Cannot draw bridge ${directionNames[direction]} from node`
        }
    }

    const idleMessage = showSolution
        ? 'Viewing solution (press s to return to puzzle)'
        : minNumber !== undefined && maxNumber !== undefined
          ? `Type a number [${minNumber}-${maxNumber}] to select a node`
          : 'Type a number to select a node'

    return (
        <Box flexDirection="column" marginBottom={1}>
            <Text bold>{title}</Text>
            {statusText ? (
                <Text dimColor>• {statusText}</Text>
            ) : (
                <Text dimColor>• {idleMessage}</Text>
            )}
        </Box>
    )
}
