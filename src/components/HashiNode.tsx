import { Box, Text } from 'ink'

type HashiNodeProps = {
    value: number
}

export function HashiNode({ value }: HashiNodeProps) {
    if (!Number.isInteger(value) || value < 1 || value > 8) {
        throw new Error(`HashiNode value must be an integer between 1 and 8, got ${value}`)
    }

    return (
        <Box flexDirection="column">
            <Text>┏━━━┓</Text>
            <Text>┃ {value} ┃</Text>
            <Text>┗━━━┛</Text>
        </Box>
    )
}
