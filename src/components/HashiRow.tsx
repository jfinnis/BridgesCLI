import { Box, Text } from 'ink'

export type HashiNodeData = {
    position: number
    value: number
}

export type HashiRowProps = {
    length: number
    nodes: HashiNodeData[]
}

export function HashiRow({ length, nodes }: HashiRowProps) {
    const nodeWidth = 5
    const spaceBetween = 5
    const spacePadding = 3

    const slots: (number | null)[] = Array(length).fill(null)
    for (const node of nodes) {
        if (node.position >= 0 && node.position < length) {
            slots[node.position] = node.value
        }
    }

    const lines: string[] = []
    for (let line = 0; line < 5; line++) {
        let rowStr = ' '.repeat(spacePadding)
        for (let i = 0; i < slots.length; i++) {
            const value = slots[i]
            if (value === null) {
                rowStr += ' '.repeat(nodeWidth)
            } else {
                if (line === 0 || line === 4) {
                    rowStr += ' '.repeat(nodeWidth)
                } else if (line === 1) {
                    rowStr += '┏━━━┓'
                } else if (line === 3) {
                    rowStr += '┗━━━┛'
                } else {
                    rowStr += `┃ ${value} ┃`
                }
            }
            if (i < slots.length - 1) {
                rowStr += ' '.repeat(spaceBetween)
            }
        }
        rowStr += ' '.repeat(spacePadding)
        lines.push(rowStr)
    }

    return (
        <Box flexDirection="column">
            {lines.map((line, i) => (
                <Text key={i}>{line}</Text>
            ))}
        </Box>
    )
}
