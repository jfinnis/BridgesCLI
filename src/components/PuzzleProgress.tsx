import { Box, Text } from 'ink'

export type PuzzleState = 'solved' | 'in-progress' | 'not-started'

export type PuzzleProgressProps = {
    states: PuzzleState[]
    columns?: number
}

const SOLVED = '✅'
const IN_PROGRESS = '⏳'
const NOT_STARTED = '⬜'

function validateStates(states: PuzzleState[], columns: number): void {
    if (states.length === 0) {
        throw new Error('PuzzleProgress: states must not be empty')
    }
    if (columns < 1) {
        throw new Error(`PuzzleProgress: columns must be at least 1, got ${columns}`)
    }

    const inProgressCount = states.filter(s => s === 'in-progress').length
    if (inProgressCount > 1) {
        throw new Error(
            `PuzzleProgress: only one puzzle can be in progress at a time, got ${inProgressCount}`
        )
    }
}

function padNumber(n: number): string {
    return n.toString().padStart(2, '0')
}

function renderBorder(columns: number, left: string, middle: string, right: string): string {
    const edges = Array(columns).fill('──')
    const line = edges.join(middle)
    return `${left}${line}${right}`
}

function renderTopBorder(columns: number): string {
    return renderBorder(columns, '┌', '┬', '┐')
}

function renderSeparatorBetweenRows(
    rowAbove: PuzzleState[],
    rowBelow: PuzzleState[] | undefined
): string {
    const colsBelow = rowBelow?.length ?? 0

    // Left edge
    let line = colsBelow > 0 ? '├' : '└'

    // Middle: horizontal segments and junctions for columns in rowAbove
    for (let i = 0; i < rowAbove.length; i++) {
        const hasBelow = i < colsBelow

        // Horizontal segment for this column
        line += '──'

        // Junction after this column (if not last column in rowAbove)
        if (i < rowAbove.length - 1) {
            if (hasBelow) {
                line += '┼' // column continues below
            } else {
                line += '┴' // column ends here
            }
        }
    }

    // Right edge: based on last column in rowAbove
    const lastCol = rowAbove.length - 1
    if (lastCol >= 0 && lastCol < colsBelow) {
        line += '┤'
    } else {
        line += '┘'
    }

    return line
}

function renderBottomBorder(columns: number): string {
    return renderBorder(columns, '└', '┴', '┘')
}

function renderNumbersLine(rowStates: PuzzleState[], startIndex: number): string {
    return `│${rowStates.map((_, i) => padNumber(startIndex + i + 1)).join('│')}│`
}

function renderIconsLine(rowStates: PuzzleState[]): string {
    return `│${rowStates
        .map(state =>
            state === 'solved' ? SOLVED : state === 'in-progress' ? IN_PROGRESS : NOT_STARTED
        )
        .join('│')}│`
}

export default function PuzzleProgress({ states, columns = 5 }: PuzzleProgressProps) {
    validateStates(states, columns)

    const numRows = Math.ceil(states.length / columns)
    const rows = Array.from({ length: numRows }, (_, i) =>
        states.slice(i * columns, (i + 1) * columns)
    )

    return (
        <Box flexDirection="column">
            <Text>{renderTopBorder(rows[0]?.length ?? columns)}</Text>
            {rows.map((row, rowIndex) => {
                const startIndex = rowIndex * columns
                const isLastRow = rowIndex === rows.length - 1
                return (
                    <Box key={rowIndex} flexDirection="column">
                        <Text>{renderNumbersLine(row, startIndex)}</Text>
                        <Text>{renderIconsLine(row)}</Text>
                        {!isLastRow && (
                            <Text>{renderSeparatorBetweenRows(row, rows[rowIndex + 1])}</Text>
                        )}
                    </Box>
                )
            })}
            <Text>{renderBottomBorder(rows[rows.length - 1]?.length ?? columns)}</Text>
        </Box>
    )
}
