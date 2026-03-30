import { Box, Text } from 'ink'

import type { SelectionState } from '../gameState/types.ts'

type MessagesProps = {
    selectionState?: SelectionState
    solutionReached?: boolean
    gridNotConnected?: boolean
}

export default function Messages({
    solutionReached = false,
    gridNotConnected = false,
}: MessagesProps) {
    return (
        <Box flexDirection="column" marginTop={1}>
            {solutionReached ? (
                <Text bold color="green">
                    Congratulations! Puzzle solved!
                </Text>
            ) : null}
            {gridNotConnected ? (
                <Text bold color="yellow">
                    Grid is not fully connected
                </Text>
            ) : null}
        </Box>
    )
}
