import { Box, Text } from 'ink'

type LegendItem = {
    key: string
    description: string
}

const LEGEND_ITEMS: LegendItem[] = [
    { key: 'p', description: 'Previous puzzle' },
    { key: 'n', description: 'Next puzzle' },
    { key: 'q', description: 'Quit' },
]

export default function Messages() {
    return (
        <Box flexDirection="column" marginTop={1}>
            <Text bold>Controls:</Text>
            {LEGEND_ITEMS.map(item => (
                <Box key={item.key}>
                    <Text bold>{item.key}</Text>
                    <Text>: {item.description}</Text>
                </Box>
            ))}
        </Box>
    )
}
