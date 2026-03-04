/**
 * HashiNode types
 */
export type HashiNodeData = {
    value: number | '-' | '=' | '#' | ' ' | '|'
    /** Num lines connected on left, undefined if 0. */
    lineLeft?: 1 | 2
    /** Num lines connected on right, undefined if 0. */
    lineRight?: 1 | 2
    /** Num lines connected above, undefined if 0. */
    lineUp?: 1 | 2
    /** Num lines connected below, undefined if 0. */
    lineDown?: 1 | 2
}

export type HashiNodeDisplayMode = 'normal' | 'highlight' | 'dim'

export type HashiNodeOptions = {
    displayMode?: HashiNodeDisplayMode
    label?: string
}

/**
 * Game operation types
 */
export type SelectionMode = 'idle' | 'selecting-node' | 'disambiguation' | 'selected' | 'invalid'

export type Direction = 'h' | 'j' | 'k' | 'l'

export type SelectionState = {
    mode: SelectionMode
    selectedNumber: number | null
    direction: Direction | null
    matchingNodes: { row: number; col: number }[]
    disambiguationLabels: string[]
    selectedNode: { row: number; col: number } | null
}
