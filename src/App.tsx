import HashiGrid from './components/HashiGrid.tsx'
import { parsePuzzle } from './utils/parsePuzzle.ts'

export type AppProps = {
    stdout: boolean
    puzzle: string
}

export default function App({ stdout, puzzle }: AppProps) {
    const dimensions = puzzle.split(':')[0] ?? '5x5'
    const numNodes = Number(dimensions.split('x')[1]) || 5

    return <HashiGrid numNodes={numNodes} rows={parsePuzzle(puzzle)} showInstructions={!stdout} />
}
