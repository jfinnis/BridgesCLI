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

const puzzle = options.puzzle ?? (samplePuzzles[0] || '')

// 
if (options.stdout) {
    const instance = render(<App stdout={true} puzzle={puzzle} />)
    instance.unmount()
} else {
    const instance = render(<App stdout={false} puzzle={puzzle} />)

    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    process.stdin.on('data', (key: string) => {
        if (key === 'q') {
            instance.unmount()
            process.exit(0)
        }
    })
}
