import { useInput } from 'ink'

export type UsePuzzleInputProps = {
    onInput: (input: string, key: { escape?: boolean }) => void
}

export default function usePuzzleInput({ onInput }: UsePuzzleInputProps) {
    useInput((input, key) => {
        onInput(input, { escape: key.escape })
    })
}
