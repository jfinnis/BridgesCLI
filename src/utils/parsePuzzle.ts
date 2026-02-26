import type { HashiNodeData } from '../types.ts'

function letterToNumber(char: string): number {
    return char.charCodeAt(0) - 96
}

/**
 * Parses a puzzle encoding string into a 2D array of HashiNodeData.
 *
 * Encoding format: "WIDTHxHEIGHT:row1.row2.row3..."
 * - Digits (0-9): explicit node values
 * - Letters (a-z): skip positions (a=1, b=2, c=3, etc.)
 *
 * Example: "3x3:a1a.a2a.a1a" creates a 3x3 grid with a vertical column in the middle
 */
export function parsePuzzle(encoding: string): HashiNodeData[][] {
    const parts = encoding.split(':')
    const dimensions = parts[0] || ''
    const rest = parts[1] || ''

    // Parse string for row width
    const match: RegExpMatchArray | null = dimensions.match(/(\d+)x(\d+)/)
    let numNodes = 0
    if (match !== null && match[1] !== undefined) {
        numNodes = parseInt(match[1], 10)
    }

    // Split grid data into rows
    const rowStrings = rest.split('.')
    const rows: HashiNodeData[][] = []

    for (const rowStr of rowStrings) {
        const nodes: HashiNodeData[] = Array(numNodes).fill({ value: ' ' })
        let position = 0
        let i = 0

        // Parse each character in the encoding
        while (i < rowStr.length && position < numNodes) {
            const char = rowStr[i] ?? ''
            const charCode = char.charCodeAt(0)

            // Digit: create a node with the numeric value
            if (charCode >= 48 && charCode <= 57) {
                const value = Number(char)
                nodes[position] = { value }
                position++
            } else {
                // Letter: skip positions based on letter-to-number mapping
                position += letterToNumber(char)
            }
            i++
        }

        // Fill any remaining undefined positions with empty nodes
        for (let j = 0; j < numNodes; j++) {
            if (nodes[j] === undefined) {
                nodes[j] = { value: ' ' }
            }
        }

        rows.push(nodes)
    }

    return rows
}
