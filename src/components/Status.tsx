import { Box, Text } from 'ink'

import type { SelectionState } from '../gameState/types.ts'

type StatusProps = {
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

export default function Status({
    showSolution = false,
    selectionState,
    minNumber,
    maxNumber,
}: StatusProps) {
    let statusText = ''
    if (selectionState) {
        const { mode, selectedNumber, direction, bridgeErased, isDoubleBridge } = selectionState
        if (mode === 'selecting-node' && selectedNumber !== null) {
            statusText = 'Select direction with h/j/k/l (H/J/K/L = double line)'
        } else if (mode === 'disambiguation' && selectedNumber !== null) {
            statusText = 'Press label shown to select that node'
        } else if (mode === 'selected' && selectedNumber !== null && direction) {
            if (bridgeErased) {
                statusText = 'Erased bridge'
            } else {
                const lineType = direction === 'h' || direction === 'l' ? 'horizontal' : 'vertical'
                const bridgeType = isDoubleBridge ? 'double ' : ''
                statusText = `Drew ${bridgeType}${lineType} bridge`
            }
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
        <Box>
            <Text dimColor>• {statusText || idleMessage}</Text>
        </Box>
    )
}
