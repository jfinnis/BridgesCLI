import { useApp, useInput } from 'ink'
import { useRef } from 'react'

export default function usePuzzleInput(
    puzzleIndex: number,
    puzzlesLength: number,
    onPrev: () => void,
    onNext: () => void,
    onToggleSolution: () => void
) {
    const { exit } = useApp()
    const puzzleIndexRef = useRef(puzzleIndex)
    puzzleIndexRef.current = puzzleIndex

    useInput(input => {
        if (input === 'q') {
            exit()
        }

        if (input === 'n' && puzzleIndexRef.current + 1 < puzzlesLength) {
            onNext()
        }

        if (input === 'p' && puzzleIndexRef.current - 1 >= 0) {
            onPrev()
        }

        if (input === 's') {
            onToggleSolution()
        }
    })
}
