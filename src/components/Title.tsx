import { Text } from 'ink'

type TitleProps = {
    puzzleIndex: number
    puzzle: string
    isCustomPuzzle?: boolean
}

export default function Title({ puzzleIndex, puzzle, isCustomPuzzle = false }: TitleProps) {
    const title = isCustomPuzzle
        ? `Bridges: Puzzle - ${puzzle}`
        : `Bridges: Puzzle #${puzzleIndex + 1}`

    return <Text bold>{title}</Text>
}
