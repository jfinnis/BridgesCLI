import { describe, expect, it } from 'vitest'

import { parsePuzzle } from '../parsePuzzle.ts'

describe('parsePuzzle', () => {
    it('parses a simple 3x3 puzzle with one node per row', () => {
        const result = parsePuzzle('3x3:a1a.a1a.a1a')
        expect(result).toEqual([
            [{ position: 1, value: 1 }],
            [{ position: 1, value: 1 }],
            [{ position: 1, value: 1 }],
        ])
    })

    it('parses a 3x3 puzzle with a blank row', () => {
        const result = parsePuzzle('3x3:1a1.c.1a1')
        expect(result).toEqual([
            [
                { position: 0, value: 1 },
                { position: 2, value: 1 },
            ],
            [],
            [
                { position: 0, value: 1 },
                { position: 2, value: 1 },
            ],
        ])
    })

    it('parses a 3x3 puzzle with a filled row', () => {
        const result = parsePuzzle('3x3:111.c.111')
        expect(result).toEqual([
            [
                { position: 0, value: 1 },
                { position: 1, value: 1 },
                { position: 2, value: 1 },
            ],
            [],
            [
                { position: 0, value: 1 },
                { position: 1, value: 1 },
                { position: 2, value: 1 },
            ],
        ])
    })

    it('parses a 7x7 puzzle', () => {
        const result = parsePuzzle('7x7:4a3a3a3.a2c4a.3b3b3.g.2b8a4a.d1a3.a1a4a1a')
        expect(result).toEqual([
            [
                { position: 0, value: 4 },
                { position: 2, value: 3 },
                { position: 4, value: 3 },
                { position: 6, value: 3 },
            ],
            [
                { position: 1, value: 2 },
                { position: 5, value: 4 },
            ],
            [
                { position: 0, value: 3 },
                { position: 3, value: 3 },
                { position: 6, value: 3 },
            ],
            [],
            [
                { position: 0, value: 2 },
                { position: 3, value: 8 },
                { position: 5, value: 4 },
            ],
            [
                { position: 4, value: 1 },
                { position: 6, value: 3 },
            ],
            [
                { position: 1, value: 1 },
                { position: 3, value: 4 },
                { position: 5, value: 1 },
            ],
        ])
    })
})
