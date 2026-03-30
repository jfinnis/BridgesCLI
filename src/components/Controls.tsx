import { Box, Text } from 'ink'

import type { SelectionState } from '../gameState/types.ts'

type LegendItem = {
    key: string
    description: string
    disabled?: boolean
}

export function legendItems(
    hasSolution: boolean,
    enableSolutions: boolean,
    isSelecting: boolean
): LegendItem[] {
    const items: LegendItem[] = [
        { key: 'p', description: 'Previous puzzle', disabled: isSelecting },
        { key: 'n', description: 'Next puzzle', disabled: isSelecting },
    ]

    if (enableSolutions) {
        items.push({
            key: 's',
            description: 'Show solution',
            disabled: isSelecting || !hasSolution,
        })
    }

    items.push({ key: 'q', description: 'Quit' })

    return items
}

type ControlsProps = {
    hasSolution?: boolean
    enableSolutions?: boolean
    selectionState?: SelectionState
}

export default function Controls({
    hasSolution = false,
    enableSolutions = false,
    selectionState,
}: ControlsProps) {
    const isSelecting = selectionState !== undefined && selectionState.mode !== 'idle'

    return (
        <Box flexDirection="column" marginTop={1}>
            <Text bold>Controls:</Text>
            {legendItems(hasSolution, enableSolutions, isSelecting).map(item => (
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
