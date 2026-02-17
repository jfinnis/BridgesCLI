import { Command } from 'commander'
import { render } from 'ink'

import App from './App.tsx'
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

let puzzleIndex = 0
const puzzles = [options.puzzle, ...samplePuzzles]

if (options.stdout) {
    const instance = render(<App stdout={true} puzzle={puzzles[0] || ''} />)
    instance.unmount()
} else {
    const instance = render(<App stdout={false} puzzle={puzzles[0] || ''} />)

    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    // Interactive mode commands
    process.stdin.on('data', (key: string) => {
        // Quit
        if (key === 'q') {
            instance.unmount()
            process.exit(0)
        }

        // Next puzzle
        if (key === 'n') {
            if (puzzleIndex + 1 < puzzles.length) {
                puzzleIndex++
                instance.rerender(<App stdout={false} puzzle={puzzles[puzzleIndex] || ''} />)
            }
        }

        // Prev puzzle
        if (key === 'p') {
            if (puzzleIndex - 1 >= 0) {
                puzzleIndex--
                instance.rerender(<App stdout={false} puzzle={puzzles[puzzleIndex] || ''} />)
            }
        }
    })
}
