import { useApp, useInput } from 'ink'

export default function usePuzzleInput(
    puzzleIndex: number,
    puzzlesLength: number,
    onPrev: () => void,
    onNext: () => void
) {
    const { exit } = useApp()

    useInput(input => {
        if (input === 'q') {
            exit()
        }

        if (input === 'n' && puzzleIndex + 1 < puzzlesLength) {
            onNext()
        }

        if (input === 'p' && puzzleIndex - 1 >= 0) {
            onPrev()
        }
    })
}

