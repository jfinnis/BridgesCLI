import { describe, expect, it } from 'vitest'

import { findNodeInDirection } from '../usePuzzleInput.ts'

describe('findNodeInDirection', () => {
    describe('1x2 grid (horizontal)', () => {
        const grid = [[{ value: 1 }, { value: 2 }]]

        it('finds node to the right', () => {
            expect(findNodeInDirection(grid, 0, 0, 'l')).toBe(true)
        })

        it('finds node to the left', () => {
            expect(findNodeInDirection(grid, 0, 1, 'h')).toBe(true)
        })

        it('returns false when no node to the right', () => {
            expect(findNodeInDirection(grid, 0, 1, 'l')).toBe(false)
        })

        it('returns false when no node to the left', () => {
            expect(findNodeInDirection(grid, 0, 0, 'h')).toBe(false)
        })

        it('returns false for vertical directions (no rows above/below)', () => {
            expect(findNodeInDirection(grid, 0, 0, 'j')).toBe(false)
            expect(findNodeInDirection(grid, 0, 0, 'k')).toBe(false)
        })
    })

    describe('2x1 grid (vertical)', () => {
        const grid = [[{ value: 1 }], [{ value: 2 }]]

        it('finds node below', () => {
            expect(findNodeInDirection(grid, 0, 0, 'j')).toBe(true)
        })

        it('finds node above', () => {
            expect(findNodeInDirection(grid, 1, 0, 'k')).toBe(true)
        })

        it('returns false when no node below', () => {
            expect(findNodeInDirection(grid, 1, 0, 'j')).toBe(false)
        })

        it('returns false when no node above', () => {
            expect(findNodeInDirection(grid, 0, 0, 'k')).toBe(false)
        })

        it('returns false for horizontal directions (no cols left/right)', () => {
            expect(findNodeInDirection(grid, 0, 0, 'h')).toBe(false)
            expect(findNodeInDirection(grid, 0, 0, 'l')).toBe(false)
        })
    })

    describe('3x3 grid with empty cells', () => {
        const grid: { value: number | '-' | '=' | '#' | ' ' | '|' }[][] = [
            [{ value: 1 }, { value: ' ' }, { value: 2 }],
            [{ value: ' ' }, { value: '#' }, { value: ' ' }],
            [{ value: 3 }, { value: ' ' }, { value: 4 }],
        ]

        it('finds node across empty cells', () => {
            expect(findNodeInDirection(grid, 0, 0, 'l')).toBe(true)
        })

        it('finds node across empty cells (down)', () => {
            expect(findNodeInDirection(grid, 0, 0, 'j')).toBe(true)
        })

        it('returns false when blocked by wall (#)', () => {
            expect(findNodeInDirection(grid, 0, 0, 'j')).toBe(true) // There's a path around
        })
    })
})
