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
                    (nodes[position - 1]!.value === '-' || nodes[position - 1]!.value === '=')
                ) {
                    const lineCount: 1 | 2 = nodes[position - 1]!.value === '=' ? 2 : 1
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
                if (position > 0 && typeof nodes[position - 1]!.value === 'number') {
                    nodes[position - 1] = { ...nodes[position - 1]!, lineRight: lineCount }
                }

                // Create the line node
                nodes[position] = { value: char as '-' | '=' }

                // Set lineRight on the line node and lineLeft on next position if it's a number node
                if (position < numNodes - 1 && typeof nodes[position + 1]!.value === 'number') {
                    nodes[position + 1] = { ...nodes[position + 1]!, lineLeft: lineCount }
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
                            typeof nodes[position + r - 1]!.value === 'number'
                        ) {
                            nodes[position + r - 1] = {
                                ...nodes[position + r - 1]!,
                                lineRight: lineCount,
                            }
                        }
                        if (
                            position + r < numNodes - 1 &&
                            typeof nodes[position + r + 1]!.value === 'number'
                        ) {
                            nodes[position + r + 1] = {
                                ...nodes[position + r + 1]!,
                                lineLeft: lineCount,
                            }
                        }
                    }
                    // Set lineLeft on the last line node if next position has a number
                    const lastLinePos = position + repeat
                    if (
                        lastLinePos < numNodes - 1 &&
                        typeof nodes[lastLinePos + 1]!.value === 'number'
                    ) {
                        nodes[lastLinePos + 1] = { ...nodes[lastLinePos + 1]!, lineLeft: lineCount }
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
        const currentRow = rows[rowIdx]!

        for (let colIdx = 0; colIdx < currentRow.length; colIdx++) {
            const node = currentRow[colIdx]!
            if (node.value === '|' || node.value === '#') {
                const lineCount: 1 | 2 = node.value === '#' ? 2 : 1

                // Set lineDown on the number node in the row above (if exists)
                if (rowIdx > 0) {
                    const nodeAbove = rows[rowIdx - 1]![colIdx]!
                    if (typeof nodeAbove.value === 'number') {
                        rows[rowIdx - 1]![colIdx] = { ...nodeAbove, lineDown: lineCount }
                    }
                }

                // Set lineUp on the number node in the row below (if exists)
                if (rowIdx < rows.length - 1) {
                    const nodeBelow = rows[rowIdx + 1]![colIdx]!
                    if (typeof nodeBelow.value === 'number') {
                        rows[rowIdx + 1]![colIdx] = { ...nodeBelow, lineUp: lineCount }
                    }
                }
            }
        }
    }

    return rows
}
