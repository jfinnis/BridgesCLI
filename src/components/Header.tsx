import { Box, Text } from 'ink'

type HeaderProps = {
    puzzleIndex: number
    puzzle: string
    isCustomPuzzle?: boolean
}

export default function Header({ puzzleIndex, puzzle, isCustomPuzzle = false }: HeaderProps) {
    const title = isCustomPuzzle ? `Custom Puzzle - ${puzzle}` : `Sample Puzzle #${puzzleIndex + 1}`

    return (
        <Box marginBottom={1}>
            <Text bold>{title}</Text>
        </Box>
    )
}
