import { Text } from 'ink'

type TitleProps = {
    puzzleIndex: number
    isSinglePuzzleMode?: boolean
}

export default function Title({ puzzleIndex, isSinglePuzzleMode = false }: TitleProps) {
    const title = isSinglePuzzleMode
        ? `Bridges: Custom Puzzle`
        : `Bridges: Puzzle #${puzzleIndex + 1}`

    return <Text bold>{title}</Text>
}
