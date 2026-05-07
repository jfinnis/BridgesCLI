#!/usr/bin/env -S bun run

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Command } from 'commander'
import { render } from 'ink'

import Game from './Game.tsx'
import { type PuzzleData, samplePuzzles } from './utils/puzzle-encoding.ts'

const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'))

type CliOptions = {
    puzzle: string | undefined
}

const program = new Command()

program
    .name('bridges')
    .description('Bridges (Hashiwokakero) puzzle game')
    .version(packageJson.version, '-v, --version')
    .option(
        '-p, --puzzle <puzzle>',
        `Puzzle shorthand encoding
  Format: "WIDTHxHEIGHT:row1.row2.row3..."

  Node encoding:
    - Digits (1-8): island with that value
    - Letters (a-z): space between islands (b=2, etc.)

  Bridge encoding (optional):
    - "-": single horizontal bridge
    - "=": double horizontal bridge
    - "|": single vertical bridge
    - "#": double vertical bridge

  Example (3x3 with corner islands):
    --puzzle "3x3:1a2.c.1a2"`
    )
    .parse(process.argv)

const options = program.opts<CliOptions>()

let puzzles: PuzzleData[] = samplePuzzles
let hasCustomPuzzle = false
if (options.puzzle) {
    hasCustomPuzzle = true
    puzzles = [{ encoding: options.puzzle }, ...samplePuzzles]
}

render(<Game puzzles={puzzles} hasCustomPuzzle={hasCustomPuzzle} />)
