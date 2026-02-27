import { Box, Text } from 'ink'

type HeaderProps = {
    puzzleIndex: number
    puzzle: string
    isCustomPuzzle?: boolean
    showSolution?: boolean
}

export default function Header({
    puzzleIndex,
    puzzle,
    isCustomPuzzle = false,
    showSolution = false,
}: HeaderProps) {
    const title = isCustomPuzzle
        ? `Bridges: Puzzle - ${puzzle}`
        : `Bridges: Puzzle #${puzzleIndex + 1}${showSolution ? ' (Solution)' : ''}`

    return (
        <Box marginBottom={1}>
            <Text bold>{title}</Text>
        </Box>
    )
}
