import { Box, Text } from 'ink'

type LegendItem = {
    key: string
    description: string
    disabled?: boolean
}

const LEGEND_ITEMS = (hasSolution: boolean): LegendItem[] => [
    { key: 'p', description: 'Previous puzzle' },
    { key: 'n', description: 'Next puzzle' },
    { key: 's', description: 'Show solution', disabled: !hasSolution },
    { key: 'q', description: 'Quit' },
]

type MessagesProps = {
    hasSolution?: boolean
}

export default function Messages({ hasSolution = false }: MessagesProps) {
    return (
        <Box flexDirection="column" marginTop={1}>
            <Text bold>Controls:</Text>
            {LEGEND_ITEMS(hasSolution).map(item => (
                <Box key={item.key}>
                    <Text bold color={item.disabled ? 'gray' : undefined}>
                        {item.key}
                    </Text>
                    <Text color={item.disabled ? 'gray' : undefined}>: {item.description}</Text>
                </Box>
            ))}
        </Box>
    )
}
