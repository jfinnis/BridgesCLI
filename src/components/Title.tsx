import { Text } from 'ink'

type TitleProps = {
    puzzleIndex: number
    puzzle: string
    isCustomPuzzle?: boolean
    isQuickMode?: boolean
}

export default function Title({
    puzzleIndex,
    puzzle,
    isCustomPuzzle = false,
    isQuickMode = false,
}: TitleProps) {
    const title = isCustomPuzzle
        ? `Bridges: Puzzle - ${puzzle}`
        : isQuickMode
          ? `Bridges: Quick Mode #${puzzleIndex + 1}`
          : `Bridges: Puzzle #${puzzleIndex + 1}`

    return <Text bold>{title}</Text>
}
