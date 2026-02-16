import type { HashiNodeData } from '../types.ts'

function letterToNumber(char: string): number {
    return char.charCodeAt(0) - 96
}

export function parsePuzzle(encoding: string): HashiNodeData[][] {
    const [dimensions, rest] = encoding.split(':')
    dimensions?.match(/(\d+)x(\d+)/)

    const rowStrings = rest?.split('.') ?? []
    const rows: HashiNodeData[][] = []

    for (const rowStr of rowStrings) {
        const nodes: HashiNodeData[] = []
        let position = 0
        let i = 0

        while (i < rowStr.length) {
            const char = rowStr[i] ?? ''
            const charCode = char.charCodeAt(0)

            if (charCode >= 48 && charCode <= 57) {
                const value = Number(char)
                nodes.push({ position, value })
                position++
            } else {
                position += letterToNumber(char)
            }
            i++
        }

        rows.push(nodes)
    }

    return rows
}
