import { Box, Text } from 'ink'

import type { SelectionState } from '../types.ts'

type LegendItem = {
    key: string
    description: string
    disabled?: boolean
}

export function legendItems(hasSolution: boolean, isSelecting: boolean): LegendItem[] {
    return [
        { key: 'p', description: 'Previous puzzle', disabled: isSelecting },
        { key: 'n', description: 'Next puzzle', disabled: isSelecting },
        { key: 's', description: 'Show solution', disabled: isSelecting || !hasSolution },
        { key: 'q', description: 'Quit' },
    ]
}

type MessagesProps = {
    hasSolution?: boolean
    selectionState?: SelectionState
}

export default function Messages({ hasSolution = false, selectionState }: MessagesProps) {
    const isSelecting = selectionState !== undefined && selectionState.mode !== 'idle'

    return (
        <Box flexDirection="column" marginTop={1}>
            <Text bold>Controls:</Text>
            {legendItems(hasSolution, isSelecting).map(item => (
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
