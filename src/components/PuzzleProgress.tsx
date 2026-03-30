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
    if (states.length % columns !== 0) {
        throw new Error(
            `PuzzleProgress: states length (${states.length}) must be divisible by columns (${columns})`
        )
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

function renderSeparatorRow(columns: number): string {
    return renderBorder(columns, '├', '┼', '┤')
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

    const numRows = states.length / columns
    const rows = Array.from({ length: numRows }, (_, i) =>
        states.slice(i * columns, (i + 1) * columns)
    )

    return (
        <Box flexDirection="column">
            <Text>{renderTopBorder(columns)}</Text>
            {rows.map((row, rowIndex) => {
                const startIndex = rowIndex * columns
                return (
                    <Box key={rowIndex} flexDirection="column">
                        <Text>{renderNumbersLine(row, startIndex)}</Text>
                        <Text>{renderIconsLine(row)}</Text>
                        {rowIndex < rows.length - 1 && <Text>{renderSeparatorRow(columns)}</Text>}
                    </Box>
                )
            })}
            <Text>{renderBottomBorder(columns)}</Text>
        </Box>
    )
}
