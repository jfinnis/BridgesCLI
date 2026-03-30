import { describe, expect, it } from 'vitest'
import {
    findMatchingNodes,
    findReachableNodeInDirection,
    generateLabels,
} from '../gridOperations.ts'
import type { Grid } from '../types.ts'

const makeGrid = (rows: (number | string | null)[][]): Grid =>
    rows.map(row =>
        row.map(cell =>
            cell === null ? { value: ' ' } : { value: cell as number | '-' | '=' | '#' | '|' }
        )
    )

describe('findMatchingNodes', () => {
    it('returns empty array for empty grid', () => {
        expect(findMatchingNodes([], 1)).toEqual([])
    })

    it('returns empty array when no nodes match', () => {
        const grid = makeGrid([
            [1, 2, 3],
            [4, 5, 6],
        ])
        expect(findMatchingNodes(grid, 7)).toEqual([])
    })

    it('returns single match', () => {
        const grid = makeGrid([[1, 2, 3]])
        expect(findMatchingNodes(grid, 2)).toEqual([{ row: 0, col: 1 }])
    })

    it('returns multiple matches', () => {
        const grid = makeGrid([
            [1, 2],
            [2, 3],
        ])
        const matches = findMatchingNodes(grid, 2)
        expect(matches).toContainEqual({ row: 0, col: 1 })
        expect(matches).toContainEqual({ row: 1, col: 0 })
        expect(matches.length).toBe(2)
    })
})

describe('generateLabels', () => {
    it('returns empty array for count 0', () => {
        expect(generateLabels(0)).toEqual([])
    })

    it('returns single label', () => {
        expect(generateLabels(1)).toEqual(['a'])
    })

    it('generates labels up to z', () => {
        const labels = generateLabels(26)
        expect(labels.length).toBe(26)
        expect(labels[0]).toBe('a')
        expect(labels[25]).toBe('z')
    })
})

describe('findReachableNodeInDirection', () => {
    it('returns null for empty grid', () => {
        expect(findReachableNodeInDirection([], 0, 0, 'h')).toBeNull()
    })

    it('returns null when no node in direction', () => {
        const grid = makeGrid([[1]])
        expect(findReachableNodeInDirection(grid, 0, 0, 'h')).toBeNull()
        expect(findReachableNodeInDirection(grid, 0, 0, 'k')).toBeNull()
    })

    describe('h (left)', () => {
        it('finds node to the left', () => {
            const grid = makeGrid([[3, null, 2]])
            expect(findReachableNodeInDirection(grid, 0, 2, 'h')).toEqual({ row: 0, col: 0 })
        })

        it('returns null when blocked by vertical bridge', () => {
            const grid = makeGrid([[3, '|', 2]])
            expect(findReachableNodeInDirection(grid, 0, 2, 'h')).toBeNull()
        })

        it('returns null when blocked by double vertical bridge', () => {
            const grid = makeGrid([[3, '#', 2]])
            expect(findReachableNodeInDirection(grid, 0, 2, 'h')).toBeNull()
        })

        it('returns null at grid boundary', () => {
            const grid = makeGrid([[1]])
            expect(findReachableNodeInDirection(grid, 0, 0, 'h')).toBeNull()
        })
    })

    describe('l (right)', () => {
        it('finds node to the right', () => {
            const grid = makeGrid([[3, ' ', 2]])
            expect(findReachableNodeInDirection(grid, 0, 0, 'l')).toEqual({ row: 0, col: 2 })
        })

        it('returns null when blocked by vertical bridge', () => {
            const grid = makeGrid([[3, '|', 2]])
            expect(findReachableNodeInDirection(grid, 0, 0, 'l')).toBeNull()
        })

        it('returns null at grid boundary', () => {
            const grid = makeGrid([[1]])
            expect(findReachableNodeInDirection(grid, 0, 0, 'l')).toBeNull()
        })
    })

    describe('j (down)', () => {
        it('finds node below', () => {
            const grid = makeGrid([[3], [null], [2]])
            expect(findReachableNodeInDirection(grid, 0, 0, 'j')).toEqual({ row: 2, col: 0 })
        })

        it('returns null when blocked by horizontal bridge', () => {
            const grid = makeGrid([[3], ['-'], [2]])
            expect(findReachableNodeInDirection(grid, 0, 0, 'j')).toBeNull()
        })

        it('returns null when blocked by double horizontal bridge', () => {
            const grid = makeGrid([[3], ['='], [2]])
            expect(findReachableNodeInDirection(grid, 0, 0, 'j')).toBeNull()
        })

        it('returns null at grid boundary', () => {
            const grid = makeGrid([[1]])
            expect(findReachableNodeInDirection(grid, 0, 0, 'j')).toBeNull()
        })
    })

    describe('k (up)', () => {
        it('finds node above', () => {
            const grid = makeGrid([[3], [null], [2]])
            expect(findReachableNodeInDirection(grid, 2, 0, 'k')).toEqual({ row: 0, col: 0 })
        })

        it('returns null when blocked by horizontal bridge', () => {
            const grid = makeGrid([[3], ['-'], [2]])
            expect(findReachableNodeInDirection(grid, 2, 0, 'k')).toBeNull()
        })

        it('returns null at grid boundary', () => {
            const grid = makeGrid([[1]])
            expect(findReachableNodeInDirection(grid, 0, 0, 'k')).toBeNull()
        })
    })
})
