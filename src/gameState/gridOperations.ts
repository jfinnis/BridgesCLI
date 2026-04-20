import type { Direction, Grid, GridPosition } from './types.ts'

export function findMatchingNodes(grid: Grid, number: number): GridPosition[] {
    const matches: GridPosition[] = []
    for (let row = 0; row < grid.length; row++) {
        const currentRow = grid[row]
        if (!currentRow) continue
        for (let col = 0; col < currentRow.length; col++) {
            const cell = currentRow[col]
            if (cell && cell.value === number) {
                matches.push({ row, col })
            }
        }
    }
    return matches
}

export function generateLabels(count: number): string[] {
    const labels: string[] = []
    for (let i = 0; i < count; i++) {
        labels.push(String.fromCharCode(97 + i))
    }
    return labels
}

export function findReachableNodeInDirection(
    grid: Grid,
    fromRow: number,
    fromCol: number,
    direction: Direction
): GridPosition | null {
    const rowCount = grid.length
    const firstRow = grid[0]
    if (!firstRow) return null
    const colCount = firstRow.length

    let checkRow = fromRow
    let checkCol = fromCol

    if (direction === 'h') {
        checkCol = fromCol - 1
        while (checkCol >= 0) {
            const row = grid[fromRow]
            if (!row) return null
            const cell = row[checkCol]
            if (cell) {
                if (cell.value === '|' || cell.value === '#') {
                    return null
                }
                if (typeof cell.value === 'number') {
                    return { row: fromRow, col: checkCol }
                }
            }
            checkCol--
        }
    } else if (direction === 'l') {
        checkCol = fromCol + 1
        while (checkCol < colCount) {
            const row = grid[fromRow]
            if (!row) return null
            const cell = row[checkCol]
            if (cell) {
                if (cell.value === '|' || cell.value === '#') {
                    return null
                }
                if (typeof cell.value === 'number') {
                    return { row: fromRow, col: checkCol }
                }
            }
            checkCol++
        }
    } else if (direction === 'j') {
        checkRow = fromRow + 1
        while (checkRow < rowCount) {
            const row = grid[checkRow]
            if (!row) return null
            const cell = row[fromCol]
            if (cell) {
                if (cell.value === '-' || cell.value === '=') {
                    return null
                }
                if (typeof cell.value === 'number') {
                    return { row: checkRow, col: fromCol }
                }
            }
            checkRow++
        }
    } else if (direction === 'k') {
        checkRow = fromRow - 1
        while (checkRow >= 0) {
            const row = grid[checkRow]
            if (!row) return null
            const cell = row[fromCol]
            if (cell) {
                if (cell.value === '-' || cell.value === '=') {
                    return null
                }
                if (typeof cell.value === 'number') {
                    return { row: checkRow, col: fromCol }
                }
            }
            checkRow--
        }
    }

    return null
}
