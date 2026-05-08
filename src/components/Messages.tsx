import { Box, Text } from 'ink'

type MessagesProps = {
    gridNotConnected?: boolean
    isJustSolved?: boolean
    isPuzzleCompleted?: boolean
    allSolved?: boolean
}

export default function Messages({
    gridNotConnected = false,
    isJustSolved = false,
    isPuzzleCompleted = false,
    allSolved = false,
}: MessagesProps) {
    return (
        <Box flexDirection="column">
            {isJustSolved ? (
                <Text bold color="green">
                    Congratulations! Puzzle solved!
                </Text>
            ) : isPuzzleCompleted ? (
                <Text bold color="green">
                    Puzzle completed
                </Text>
            ) : null}
            {gridNotConnected ? (
                <Text bold color="yellow">
                    Grid is not fully connected
                </Text>
            ) : null}
            {allSolved ? (
                <Text bold color="cyan">
                    🎉 You've solved all the puzzles! 🎉
                </Text>
            ) : null}
        </Box>
    )
}
