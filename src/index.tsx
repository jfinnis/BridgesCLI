import { Command } from 'commander'
import { render } from 'ink'

import Game from './Game.tsx'
import { type PuzzleData, samplePuzzles } from './utils/samplePuzzles.ts'

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

let puzzles: PuzzleData[] = samplePuzzles
let hasCustomPuzzle = false
if (options.puzzle) {
    hasCustomPuzzle = true
    puzzles = [{ encoding: options.puzzle }, ...samplePuzzles]
}

render(
    <Game puzzles={puzzles} hasCustomPuzzle={hasCustomPuzzle} stdout={options.stdout || false} />
)
