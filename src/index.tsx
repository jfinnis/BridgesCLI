#!/usr/bin/env -S bun run

import { Command } from 'commander'
import { readFileSync } from 'fs'
import { render } from 'ink'
import { resolve } from 'path'

import Game from './Game.tsx'
import { type PuzzleData, samplePuzzles } from './utils/samplePuzzles.ts'

const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'))

type CliOptions = {
    stdout: boolean
    puzzle: string | undefined
}

const program = new Command()

program
    .name('bridges')
    .description('Bridges (Hashiwokakero) puzzle game')
    .version(packageJson.version, '-v, --version')
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
