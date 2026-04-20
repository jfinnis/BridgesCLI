export type SelectionMode = 'idle' | 'selecting-node' | 'disambiguation' | 'selected' | 'invalid'

export type Direction = 'h' | 'j' | 'k' | 'l'

export type GridPosition = { row: number; col: number }

export type SelectionState = {
    mode: SelectionMode
    selectedNumber: number | null
    direction: Direction | null
    matchingNodes: GridPosition[]
    disambiguationLabels: string[]
    selectedNode: GridPosition | null
    bridgeErased?: boolean
    isDoubleBridge?: boolean
}

export type PlacedBridge = {
    from: GridPosition
    to: GridPosition
    count?: number
}

export type GridCell = { value: number | '-' | '=' | '#' | ' ' | '|' }

export type Grid = GridCell[][]
