import type { HashiNodeData } from '../types.ts'
import type { PlacedBridge } from './types.ts'

export function bridgesEqual(a: PlacedBridge, b: PlacedBridge): boolean {
    return (
        (a.from.row === b.from.row &&
            a.from.col === b.from.col &&
            a.to.row === b.to.row &&
            a.to.col === b.to.col) ||
        (a.from.row === b.to.row &&
            a.from.col === b.to.col &&
            a.to.row === b.from.row &&
            a.to.col === b.from.col)
    )
}

export function toggleBridge(
    bridges: PlacedBridge[],
    bridge: PlacedBridge
): { bridges: PlacedBridge[]; erased: boolean } {
    const exists = bridges.some(b => bridgesEqual(b, bridge))
    if (exists) {
        return { bridges: bridges.filter(b => !bridgesEqual(b, bridge)), erased: true }
    }
    return { bridges: [...bridges, bridge], erased: false }
}

export function mergeBridges(
    originalRows: HashiNodeData[][],
    bridges: PlacedBridge[]
): HashiNodeData[][] {
    const rows = originalRows.map(row => row.map(cell => ({ ...cell })))

    for (const bridge of bridges) {
        const { from, to } = bridge
        const bridgeCount = bridge.count || 1

        if (from.row === to.row) {
            const row = rows[from.row]
            if (!row) continue
            const minCol = Math.min(from.col, to.col)
            const maxCol = Math.max(from.col, to.col)

            if (minCol >= 0 && minCol < row.length) {
                const cell = row[minCol]
                if (cell) cell.lineRight = bridgeCount as 1 | 2
            }
            if (maxCol >= 0 && maxCol < row.length) {
                const cell = row[maxCol]
                if (cell) cell.lineLeft = bridgeCount as 1 | 2
            }
            for (let c = minCol + 1; c < maxCol; c++) {
                if (c >= 0 && c < row.length) {
                    const cell = row[c]
                    if (cell) cell.value = bridgeCount === 2 ? '=' : '-'
                }
            }
        } else if (from.col === to.col) {
            const minRow = Math.min(from.row, to.row)
            const maxRow = Math.max(from.row, to.row)

            const topNode = rows[minRow]?.[from.col]
            if (topNode) topNode.lineDown = bridgeCount as 1 | 2

            const bottomNode = rows[maxRow]?.[from.col]
            if (bottomNode) bottomNode.lineUp = bridgeCount as 1 | 2

            for (let r = minRow + 1; r < maxRow; r++) {
                if (r >= 0 && r < rows.length) {
                    const rowNode = rows[r]?.[from.col]
                    if (rowNode) rowNode.value = bridgeCount === 2 ? '#' : '|'
                }
            }
        }
    }

    return rows
}
