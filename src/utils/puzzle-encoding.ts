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
 * - "-": single horizontal line (connects to adjacent nodes)
 * - "=": double horizontal line (connects to adjacent nodes)
 * - "|": single vertical line (connects to node in row below)
 * - "#": double vertical line (connects to node in row below)
 *
 * The letter repeat rule applies to lines: "-c" means 3 single horizontal lines
 *
 * Example: "3x3:1-1.1a|" creates a 3x3 grid with horizontal and vertical bridges
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
        const nodes: HashiNodeData[] = Array(numNodes)
            .fill(null)
            .map(() => ({ value: ' ' }))
        let position = 0
        let i = 0

        // Parse each character in the encoding
        while (i < rowStr.length && position < numNodes) {
            const char = rowStr[i] ?? ''
            const charCode = char.charCodeAt(0)

            // Digit: create a node with the numeric value
            if (charCode >= 48 && charCode <= 57) {
                const value = Number(char)
                // Check if previous position has a line node and set lineLeft
                if (
                    position > 0 &&
                    (nodes[position - 1]?.value === '-' || nodes[position - 1]?.value === '=')
                ) {
                    const lineCount: 1 | 2 = nodes[position - 1]?.value === '=' ? 2 : 1
                    nodes[position] = { value, lineLeft: lineCount }
                } else {
                    nodes[position] = { value }
                }
                position++
                i++
            } else if (char === '-' || char === '=') {
                // Horizontal line: single (-) or double (=)
                const lineCount: 1 | 2 = char === '=' ? 2 : 1

                // Set lineRight on current position if it's a number node
                if (position > 0 && typeof nodes[position - 1]?.value === 'number') {
                    const node = nodes[position - 1]
                    if (node) {
                        nodes[position - 1] = { ...node, lineRight: lineCount }
                    }
                }

                // Create the line node
                nodes[position] = { value: char as '-' | '=' }

                // Set lineRight on the line node and lineLeft on next position if it's a number node
                if (position < numNodes - 1 && typeof nodes[position + 1]?.value === 'number') {
                    const node = nodes[position + 1]
                    if (node) {
                        nodes[position + 1] = { ...node, lineLeft: lineCount }
                    }
                }

                // Check if next char is a letter (repeat count)
                const nextChar = rowStr[i + 1]
                if (nextChar && nextChar >= 'a' && nextChar <= 'z') {
                    const repeat = letterToNumber(nextChar)
                    // Create repeated line nodes (the first is already at 'position')
                    // We need to create 'repeat' more nodes starting at position+1
                    for (let r = 1; r <= repeat && position + r < numNodes; r++) {
                        nodes[position + r] = { value: char as '-' | '=' }
                        // Set lineLeft/lineRight on adjacent number nodes
                        if (
                            position + r > 0 &&
                            typeof nodes[position + r - 1]?.value === 'number'
                        ) {
                            const node = nodes[position + r - 1]
                            if (node) {
                                nodes[position + r - 1] = {
                                    ...node,
                                    lineRight: lineCount,
                                }
                            }
                        }
                        if (
                            position + r < numNodes - 1 &&
                            typeof nodes[position + r + 1]?.value === 'number'
                        ) {
                            const node = nodes[position + r + 1]
                            if (node) {
                                nodes[position + r + 1] = {
                                    ...node,
                                    lineLeft: lineCount,
                                }
                            }
                        }
                    }
                    // Set lineLeft on the last line node if next position has a number
                    const lastLinePos = position + repeat
                    if (
                        lastLinePos < numNodes - 1 &&
                        typeof nodes[lastLinePos + 1]?.value === 'number'
                    ) {
                        const node = nodes[lastLinePos + 1]
                        if (node) {
                            nodes[lastLinePos + 1] = { ...node, lineLeft: lineCount }
                        }
                    }
                    position += repeat + 1
                    i += 2
                } else {
                    position++
                    i++
                }
            } else if (char === '|' || char === '#') {
                // Vertical line: single (|) or double (#)
                // Create the line node (connections handled in second pass)
                // Note: vertical lines do not support letter repeat
                nodes[position] = { value: char as '|' | '#' }
                position++
                i++
            } else {
                // Letter: skip positions based on letter-to-number mapping
                position += letterToNumber(char)
                i++
            }
        }

        // Fill any remaining undefined positions with empty nodes
        for (let j = 0; j < numNodes; j++) {
            if (nodes[j] === undefined || nodes[j] === null) {
                nodes[j] = { value: ' ' }
            }
        }

        rows.push(nodes)
    }

    // Second pass: handle vertical line connections
    // For each vertical line, connect to the number nodes above and below
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const currentRow = rows[rowIdx]
        if (!currentRow) continue

        for (let colIdx = 0; colIdx < currentRow.length; colIdx++) {
            const node = currentRow[colIdx]
            if (!node) continue
            if (node.value === '|' || node.value === '#') {
                const lineCount: 1 | 2 = node.value === '#' ? 2 : 1

                // Set lineDown on the number node in the row above (if exists)
                if (rowIdx > 0) {
                    const nodeAbove = rows[rowIdx - 1]?.[colIdx]
                    if (nodeAbove && typeof nodeAbove.value === 'number') {
                        const row = rows[rowIdx - 1]
                        if (row) {
                            row[colIdx] = { ...nodeAbove, lineDown: lineCount }
                        }
                    }
                }

                // Set lineUp on the number node in the row below (if exists)
                if (rowIdx < rows.length - 1) {
                    const nodeBelow = rows[rowIdx + 1]?.[colIdx]
                    if (nodeBelow && typeof nodeBelow.value === 'number') {
                        const row = rows[rowIdx + 1]
                        if (row) {
                            row[colIdx] = { ...nodeBelow, lineUp: lineCount }
                        }
                    }
                }
            }
        }
    }

    return rows
}

export interface PuzzleData {
    encoding: string
    solution?: string
}

export const samplePuzzles: PuzzleData[] = [
    {
        encoding: '7x7:4a3a3a3.a2c4a.3b3b3.g.2b8a4a.d1a3.a1a4a1a',
        solution: '7x7:4=3-3=3.#2=b4|.3-a3a#3.c#a##.2=a8=4#.c#1-3.a1-4-1a',
    },
    {
        encoding: '9x9:3c1a3a3.b2b3c.3c2a2b.e4b6.3a4a8b3a.a1a3a2c.3a3a2b1a.c4a5b3.3a5a3b2a',
        solution:
            '9x9:3-b1a3-3.#a2-a3#a#.3a|a2#2a#.|a|a#4=a6.3-4=8=a3#.|1-3#2a|#.3-3#2#a1#.|a#4=5-a3.3=5-3=a2a',
    },
    {
        encoding: '9x9:2a5a6b2a.a1d1a2.3a2b1a2a.a4b8a4b.3g3.b3a3b2a.a2a1b3a3.1a3d2a.a3b4a3a2',
        solution:
            '9x9:2-5=6=a2a.|1#a#a1-2.3|2a#1-2|.#4=a8=4||.3|b#a#|3.||3-3a#2#.|2#1-a3|3.1|3-c2|.a3=a4=3-2',
    },
    {
        encoding: '9x9:4b4a6b3.a2b3a1b.2h.a2a1a4c.4a4a3a2a3.c2a8a4a.h2.b2a1b2a.3b2a4b2',
        solution:
            '9x9:4=a4=6-a3.#2-a3#1a|.2|b##|a|.a2-1#4|a|.4=4-3#2-3.#a|2=8=4|.#a|b#a#2.#a2-1#a2|.3-a2-4-a2',
    },
    {
        encoding: '9x9:a3d3a3.1a2a4b1a.a4a4a1b4.d4b3a.3b3b2b.a1f3.6a2a2a3b.c2c2a.3a2b2b3',
        solution:
            '9x9:a3=c3-3.1|2=4-a1#.|4=4|1-a4.||a#4=a3|.3|a3|a2||.#1a||a#|3.6=2|2-3|#.#b2-b2#.3-2-a2-a3',
    },
    {
        encoding: '9x9:a2a3b6a2.b2a3d.a1g.b1c3a3.4c8b3a.e1c.3a3a2d.g1a.b3b4b4',
        solution:
            '9x9:a2-3=a6=2.a|2-3a#b.a1|a#a#b.b1a#a3-3.4=b8=a3#.#c#1a|#.3-3a2|a|#.b#b|a1#.b3-a4=a4',
    },
    {
        encoding: '9x9:4b6b2a2.i.3a2a2c6.c3b2b.b5a4c4.f2b.2a8a4c3.c1b2b.b4e3',
        solution:
            '9x9:4=a6=a2a2.#b#d#.3-2#2=b6.b|3-a2a#.b5=4a|a4.b#a#a2a#.2=8=4a|a3.b#1-a2a|.b4=d3',
    },
    {
        encoding: '9x9:a3b5b1a.1b2a2b3.i.2c2a2a6.a3a8a4a1a.5a2a4c5.i.4b4a2b3.a1b4b1a',
        solution:
            '9x9:a3=a5-a1a.1|a2#2-a3.||a##|b#.2|a#2|2=6.|3=8=4-1#.5=2#4=b5.#b##c|.4=a4#2=a3.a1-a4-a1a',
    },
    {
        encoding: '9x9:3c1a3a3.b2b3c.3c2a2b.e4b6.3a4a8b3a.a1a3a2c.3a3a2b1a.c4a5b3.3a5a3b2a',
        solution:
            '9x9:3-b1a3-3.#a2-a3#a#.3a|a2#2a#.|a|a#4=a6.3-4=8=a3#.|1-3#2a|#.3-3#2#a1#.|a#4=5-a3.3=5-3=a2a',
    },
    {
        encoding: '9x9:4a3b3a1a.a3b4a1a3.4h.b3a3a4a6.a1a1a2a2a.5a8a5a3b.h3.1a2a4b4a.a1a2b3a3',
        solution:
            '9x9:4=3-a3-1a.#3=a4|1-3.4|b#|b#.#|3-3|4=6.#1#1-2#2#.5=8=5-3##.|a#a#b#3.1a2a4=a4|.a1-2-a3=3',
    },
    {
        encoding: '9x9:a1b4b3a.3b4d1.d2a1b.a3a8a3a4a.2c1c3.a4a3a3a4a.b1a3d.1d3b4.a4b4b1a',
        solution: '9x9:a1-a4=a3a.3=a4|b|1.|b#2-1||.|3=8=3-4|.2|a#1b#3.|4-3|3=4#.|#1-3|b#.1#b|3=a4.a4=a4-a1a',
    },
    {
        encoding: '9x9:2a5a6b2a.a1d1a2.3a2b1a2a.a4b8a4b.3g3.b3a3b2a.a2a1b3a3.1a3d2a.a3b4a3a2',
        solution: '9x9:2-5=6=a2a.|1#a#a1-2.3|2a#1-2|.#4=a8=4||.3|b#a#|3.||3-3a#2#.|2#1-a3|3.1|3-c2|.a3=a4=3-2',
    },
    {
        encoding: '9x9:3a3a2c1.a3d3b.b2b1c.4b2b8a4.a2e2a.4a5b1b2.c1b3b.b3b2a3a.2c2a3a3',
        solution: '9x9:3-3=2c1.#3-c3a|.##2-a1#a|.4#|2=a8=4.#2|c#2|.4-5-a1##2.|a#1-a3#|.|a3-a2-3|.2-b2-3=3',
    },
    {
        encoding: '9x9:4a2b1b3.a2b3a3b.5a4b1c.h3.b5a4a5b.1h.c1b3a4.b2a3b2a.1b3b2a3',
        solution: '9x9:4=2b1-a3.#2=a3-3a#.5=4-a1#a#.|a|c#a3.|a5=4-5a|.1a#a|a#a|.b#1|a3-4.b2|3=a2#.1-a3-a2-3',
    },
    {
        encoding: '9x9:1a2a3a4a3.a2a4a4a2a.1c2d.a5a4a2b3.b3a8b3a.3b1d3.b1b3a3a.a2b2d.4b4a3b3',
        solution: '9x9:1-2-3=4=3.a2-4-4=2|.1|a#2|b|.|5=4#2-a3.|#3=8=a3|.3#|1#b|3.##1|#3=3#.#2a|2|b#.4=a4-3-a3',
    },
    {
        encoding: '9x9:a2b3a4a4.3a4b2a2a.a2a5b4b.5a4d3a.c2a3c.a2d2a4.b3b3a2a.a4a3b2a2.3a2a2b2a',
        solution: '9x9:a2=a3-4=4.3=4=a2|2#.|2=5=a4##.5=4|b|3#.#a#2-3||#.#2#b#2|4.##3-a3|2#.#4=3-a2|2.3-2-2-a2a',
    },
    {
        encoding: '9x9:1a1a4a3a2.a3a2a2a3a.2g3.a2b3b3a.3b4a3b6.a3b4b3a.2g3.a4a2a1a2a.3a2a3a3a3',
        solution: '9x9:1a1-4=3-2.|3-2|2=3|.2#a||b|3.|2a|3=a3#.3=a4-3=a6.a3-a4=a3#.2#b|b|3.#4=2|1-2|.3-2-3-3=3',
    },
    {
        encoding: '9x9:2a3a4a3a2.a2a2a2a1a.b1a3d.2d1b2.a3b8b4a.4b4d2.d3a2b.a1a4a1a1a.1a1a2a3a2',
        solution: '9x9:2-3=4=3-2.|2-2-2a1|.||1-3|a||.2|b#1a|2.|3=a8=a4|.4=a4#b|2.|b#3-2||.|1-4-1|1|.1a1-2-3-2',
    },
    {
        encoding: '9x9:3a4a3a2a2.a2c3a3a.2a1e2.a3b2a1b.4a2b2a1a.a1b2a5a4.b2b3c.3c1a2b.a2a3a3b3',
        solution: '9x9:3=4-3-2-2.|2|a|3=3|.2#1a||a|2.|3-a2|1||.4-2-a2|1|.#1-a2-5-4.#a2=a3#a#.3-b1|2a#.a2=3-3-a3',
    },
    { encoding: '9x9:3a4a3a2a2.a2c3a3a.2a1e2.a3b2a1b.4a2b2a1a.a1b2a5a4.b2b3c.3c1a2b.a2a3a3b3' },
    { encoding: '9x9:2b4b5a4.b3b4a2a.f1b.1a2a3c4.a4a3a3a3a.2c4a5a4.b1f.a2a2b3b.3a5b4b3' },
    { encoding: '9x9:4a3a3b3a.a1a3b3a2.4a2a2b2a.a1a1e.2a5a8a4a4.e2a2a.a3b3a2a6.1a2b2a1a.a4b4a2a3' },
    { encoding: '9x9:2b5b4a2.a1e1a.d1a3b.a4a8a2a3a.3a1a3a3a3.a2a2a2a6a.b2a2d.a2e3a.4a3b1b2' },
    { encoding: '9x9:3a1a1a3a3.a2a1e.b2a7a4b.3d2b5.a2b4a3b.h3.3a2a3a4b.a2a3a3b4.2a3d2a' },
    { encoding: '9x9:1a3b3b3.a2g.2a3a1a2a6.a4a1a3a3a.b1a2c4.3d3a6a.a4b6a1a3.e1a2a.3a3a5a5a3' },
    {
        encoding:
            '9x16:a3a2a5a2a.2a3a2a2a2.e3c.a2b1a1b.4a4b4b4.a3b1a1b.2a2b5c.a4a4b2a4.d2d.3b5a3a2a.b1e3.d4b2a.3a3c2a4.a1a2e.1a2a3a3b.a2c2b3',
    },
    {
        encoding:
            '9x16:a2a2a3a3a.2a2a4a1a2.e2a3a.a3b5a3a5.5a3b2a3a.a2f2.b3a4b3a.a3a1e.2a1a4a3a2.a4a2e.3a1a2b3a.a5a2b3a3.3a3b1c.a2a2c3a.2a3a2a3a2.a2a6a3a2a',
    },
    {
        encoding:
            '9x16:2a3b2b2.a1b2d.2e1a3.b4a8b2a.2b1b2a4.e1c.1a1a4b2a.a3a2d2.2d3a3a.a5b5a2a4.c1e.3a2b2b3.a2b3a1b.4a4e3.d2b1a.3b4b2a3.',
    },
    {
        encoding:
            '13x22:1a2b2b3a2a2.i1a2a.3b3b3a3a1b.a3c1f2.b3c4b1c.3g2b4a.b5b2f3.i2a3a.3a4a1a1a1a1a5.e3c4c.a3a3c1d3.2d2c4a1a.c5c2e.2a1a3a3a3a5a4.a4a2i.3f3b4b.a4b3g2.3b3b3c2b.g4c2a.b1a1a2b3b4.a1a1i.2a2a3b3b2a3',
    },
    { encoding: '9x9:3b3b4a2.a2c1c.b1a4a2b.3d2b3.a2b5b1a.4b2a2b2.b1a3b2a.a1c2b1.2a3d3a' },
    { encoding: '9x9:4b4b4a4.b1a1d.2b1d3.d2a2b.4a4b3b4.a4b4b2a.2a1c2a2.a2e1a.2a4a3a4a2' },
    {
        encoding:
            '21x35:a1a3b4a2a2a4b3a2b2.3c2b1e4b6a2b.b4c3a2c3d2a2a.a2a4a5a3b2b4a2d2.3a2a2a4a3c2c2d.a4a3a3a2b5b4a4a3a1a.3c4f4b3a3a2b.a2a2b3a4a3a2b5a4b5.4a2b4a1a3a7b2a1a1b.a2a3b5a4d1a3a3b4.3c4f2i.a2a2b4b5b5a3a3a4a4.e5b3a4f2a2a.4a3a5i1a2a2a3.a3a2a3a3a4b6b3a3a4a.3a2a3a2a2a4b2b4a3a3.a2a3e4k.4a4a2c2a3a5a3b5b3.a1a3b3b6c2b3d.1a3b3a3b1g2a2.a3a4b2b4b6b2a4c.2g2b2b2a2a3a2.a2a6a4a6d2b1a4c.5a4a4a2a2b4b8a3a1a2.a1a4a2a7b4b4a2a5a3a.b4e2b3b4c2b.3c6b7a3c2a2a1b3.a3a2o2a.3a5a5a3b3a4b5b2b3.e2a3e1d4b.3b2b3b2d2b2a',
    },
]
