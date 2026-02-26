import { describe, expect, it } from 'vitest'

import { parsePuzzle } from '../parsePuzzle.ts'

describe('parsePuzzle', () => {
    describe('encodings without the solution (bridges)', () => {
        it('parses a simple 3x3 puzzle with one node per row', () => {
            const result = parsePuzzle('3x3:a1a.a1a.a1a')
            expect(result).toEqual([
                [{ value: ' ' }, { value: 1 }, { value: ' ' }],
                [{ value: ' ' }, { value: 1 }, { value: ' ' }],
                [{ value: ' ' }, { value: 1 }, { value: ' ' }],
            ])
        })

        it('parses a 3x3 puzzle with a blank row', () => {
            const result = parsePuzzle('3x3:1a1.c.1a1')
            expect(result).toEqual([
                [{ value: 1 }, { value: ' ' }, { value: 1 }],
                [{ value: ' ' }, { value: ' ' }, { value: ' ' }],
                [{ value: 1 }, { value: ' ' }, { value: 1 }],
            ])
        })

        it('parses a 3x3 puzzle with a filled row', () => {
            const result = parsePuzzle('3x3:111.c.111')
            expect(result).toEqual([
                [{ value: 1 }, { value: 1 }, { value: 1 }],
                [{ value: ' ' }, { value: ' ' }, { value: ' ' }],
                [{ value: 1 }, { value: 1 }, { value: 1 }],
            ])
        })

        it('parses a 7x7 puzzle', () => {
            const result = parsePuzzle('7x7:4a3a3a3.a2c4a.3b3b3.g.2b8a4a.d1a3.a1a4a1a')
            expect(result).toEqual([
                [
                    { value: 4 },
                    { value: ' ' },
                    { value: 3 },
                    { value: ' ' },
                    { value: 3 },
                    { value: ' ' },
                    { value: 3 },
                ],
                [
                    { value: ' ' },
                    { value: 2 },
                    { value: ' ' },
                    { value: ' ' },
                    { value: ' ' },
                    { value: 4 },
                    { value: ' ' },
                ],
                [
                    { value: 3 },
                    { value: ' ' },
                    { value: ' ' },
                    { value: 3 },
                    { value: ' ' },
                    { value: ' ' },
                    { value: 3 },
                ],
                [
                    { value: ' ' },
                    { value: ' ' },
                    { value: ' ' },
                    { value: ' ' },
                    { value: ' ' },
                    { value: ' ' },
                    { value: ' ' },
                ],
                [
                    { value: 2 },
                    { value: ' ' },
                    { value: ' ' },
                    { value: 8 },
                    { value: ' ' },
                    { value: 4 },
                    { value: ' ' },
                ],
                [
                    { value: ' ' },
                    { value: ' ' },
                    { value: ' ' },
                    { value: ' ' },
                    { value: 1 },
                    { value: ' ' },
                    { value: 3 },
                ],
                [
                    { value: ' ' },
                    { value: 1 },
                    { value: ' ' },
                    { value: 4 },
                    { value: ' ' },
                    { value: 1 },
                    { value: ' ' },
                ],
            ])
        })
    })

    describe('encodings with solutions (bridges)', () => {
        it('parses a puzzle with a double horizontal bridge', () => {
            const result = parsePuzzle('5x1:2=b2')
            expect(result).toEqual([
                [
                    { value: 2, lineRight: 2 },
                    { value: '=' },
                    { value: '=' },
                    { value: '=' },
                    { value: 2, lineLeft: 2 },
                ],
            ])
        })

        it('parses a puzzle with a single horizontal bridge', () => {
            const result = parsePuzzle('5x1:a2-a2')
            expect(result).toEqual([
                [
                    { value: ' ' },
                    { value: 2, lineRight: 1 },
                    { value: '-' },
                    { value: '-' },
                    { value: 2, lineLeft: 1 },
                ],
            ])
        })

        it('parses a puzzle with a vertical bridge between nodes', () => {
            const result = parsePuzzle('2x3:a1.a|.a1')
            expect(result).toEqual([
                [{ value: ' ' }, { value: 1, lineDown: 1 }],
                [{ value: ' ' }, { value: '|' }],
                [{ value: ' ' }, { value: 1, lineUp: 1 }],
            ])
        })

        it('parses a puzzle with a double vertical bridge between nodes', () => {
            const result = parsePuzzle('3x2:1#1.11a')
            expect(result).toEqual([
                [{ value: 1 }, { value: '#' }, { value: 1 }],
                [{ value: 1 }, { value: 1, lineUp: 2 }, { value: ' ' }],
            ])
        })

        it('parses a puzzle with vertical line followed by space', () => {
            const result = parsePuzzle('4x2:1|b.11b')
            expect(result).toEqual([
                [{ value: 1 }, { value: '|' }, { value: ' ' }, { value: ' ' }],
                [{ value: 1 }, { value: 1, lineUp: 1 }, { value: ' ' }, { value: ' ' }],
            ])
        })

        it('parses a puzzle with two connected bridges in one row', () => {
            const result = parsePuzzle('5x1:2=3-1')
            expect(result).toEqual([
                [
                    { value: 2, lineRight: 2 },
                    { value: '=' },
                    { value: 3, lineLeft: 2, lineRight: 1 },
                    { value: '-' },
                    { value: 1, lineLeft: 1 },
                ],
            ])
        })
    })
})
