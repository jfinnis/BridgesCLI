import { describe, expect, it } from 'vitest'

import { findNodeInDirection } from '../usePuzzleInput.ts'

describe('findNodeInDirection', () => {
    describe('1x2 grid (horizontal)', () => {
        const grid = [[{ value: 1 }, { value: 2 }]]

        it('finds node to the right', () => {
            expect(findNodeInDirection(grid, 0, 0, 'l')).toEqual({ row: 0, col: 1 })
        })

        it('finds node to the left', () => {
            expect(findNodeInDirection(grid, 0, 1, 'h')).toEqual({ row: 0, col: 0 })
        })

        it('returns null when no node to the right', () => {
            expect(findNodeInDirection(grid, 0, 1, 'l')).toBe(null)
        })

        it('returns null when no node to the left', () => {
            expect(findNodeInDirection(grid, 0, 0, 'h')).toBe(null)
        })

        it('returns null for vertical directions (no rows above/below)', () => {
            expect(findNodeInDirection(grid, 0, 0, 'j')).toBe(null)
            expect(findNodeInDirection(grid, 0, 0, 'k')).toBe(null)
        })
    })

    describe('2x1 grid (vertical)', () => {
        const grid = [[{ value: 1 }], [{ value: 2 }]]

        it('finds node below', () => {
            expect(findNodeInDirection(grid, 0, 0, 'j')).toEqual({ row: 1, col: 0 })
        })

        it('finds node above', () => {
            expect(findNodeInDirection(grid, 1, 0, 'k')).toEqual({ row: 0, col: 0 })
        })

        it('returns null when no node below', () => {
            expect(findNodeInDirection(grid, 1, 0, 'j')).toBe(null)
        })

        it('returns null when no node above', () => {
            expect(findNodeInDirection(grid, 0, 0, 'k')).toBe(null)
        })

        it('returns null for horizontal directions (no cols left/right)', () => {
            expect(findNodeInDirection(grid, 0, 0, 'h')).toBe(null)
            expect(findNodeInDirection(grid, 0, 0, 'l')).toBe(null)
        })
    })

    describe('3x3 grid with empty cells', () => {
        const grid: { value: number | '-' | '=' | '#' | ' ' | '|' }[][] = [
            [{ value: 1 }, { value: ' ' }, { value: 2 }],
            [{ value: ' ' }, { value: '#' }, { value: ' ' }],
            [{ value: 3 }, { value: ' ' }, { value: 4 }],
        ]

        it('finds node across empty cells', () => {
            expect(findNodeInDirection(grid, 0, 0, 'l')).toEqual({ row: 0, col: 2 })
        })

        it('finds node across empty cells (down)', () => {
            expect(findNodeInDirection(grid, 0, 0, 'j')).toEqual({ row: 2, col: 0 })
        })

        it('returns node when blocked by wall (#) but path around exists', () => {
            expect(findNodeInDirection(grid, 0, 0, 'j')).toEqual({ row: 2, col: 0 })
        })
    })
})
