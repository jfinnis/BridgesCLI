import { Command } from 'commander'
import { render } from 'ink'

import HashiGrid from './components/HashiGrid.tsx'
import { parsePuzzle } from './utils/parsePuzzle.ts'
import { samplePuzzles } from './utils/samplePuzzles.ts'

type CliOptions = {
    stdout: boolean
    puzzle: string | undefined
}

const program = new Command()

program
    .name('hashi')
    .description('Hashi puzzle game')
    .option('-s, --stdout', 'Output to stdout and exit (for testing)')
    .option('-p, --puzzle <puzzle>', 'Puzzle shorthand encoding')
    .parse(process.argv)

const options = program.opts<CliOptions>()

function App() {
    const puzzle = options.puzzle ?? (samplePuzzles[0] || '')
    const dimensions = puzzle.split(':')[0] ?? '5x5'
    const numNodes = Number(dimensions.split('x')[1]) || 5
    console.log(`rendering puzzle ${numNodes} width`)

    return <HashiGrid numNodes={numNodes} rows={parsePuzzle(puzzle)} />
}

if (options.stdout) {
    const instance = render(<App />)
    instance.unmount()
} else {
    render(<App />)
}
