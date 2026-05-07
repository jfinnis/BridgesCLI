import {
    findMatchingNodes,
    findReachableNodeInDirection,
    generateLabels,
} from './gridOperations.ts'
import type { Direction, Grid, PlacedBridge, SelectionState } from './types.ts'

export type InputAction =
    | { type: 'none' }
    | { type: 'quit' }
    | { type: 'navigate'; direction: 'next' | 'prev' }
    | { type: 'select-number'; number: number }
    | { type: 'select-label'; labelIndex: number }
    | { type: 'select-direction'; direction: Direction; isDouble: boolean }
    | { type: 'reset' }

export type TransitionResult = {
    nextState: SelectionState
    action: InputAction
}

const initialSelectionState: SelectionState = {
    mode: 'idle',
    selectedNumber: null,
    direction: null,
    matchingNodes: [],
    disambiguationLabels: [],
    selectedNode: null,
}

export function getInitialSelectionState(): SelectionState {
    return { ...initialSelectionState }
}

export function isNumberKey(input: string): boolean {
    return input >= '1' && input <= '8'
}

export function isDirectionKey(input: string): boolean {
    const lower = input.toLowerCase()
    return lower === 'h' || lower === 'j' || lower === 'k' || lower === 'l'
}

export function isLabelKey(input: string): boolean {
    const code = input.charCodeAt(0)
    return code >= 97 && code <= 122
}

export function resolveNavigationAction(
    input: string,
    puzzleIndex: number,
    puzzlesLength: number
): InputAction | null {
    if (input === 'n' && puzzleIndex + 1 < puzzlesLength) {
        return { type: 'navigate', direction: 'next' }
    }
    if (input === 'p' && puzzleIndex - 1 >= 0) {
        return { type: 'navigate', direction: 'prev' }
    }
    return null
}

export function handleQuit(): TransitionResult {
    return {
        nextState: getInitialSelectionState(),
        action: { type: 'quit' },
    }
}

export function handleEscape(): TransitionResult {
    return {
        nextState: getInitialSelectionState(),
        action: { type: 'reset' },
    }
}

export function handleNavigation(
    input: string,
    puzzleIndex: number,
    puzzlesLength: number,
    canNavigate: boolean
): TransitionResult | null {
    const action = resolveNavigationAction(input, puzzleIndex, puzzlesLength)
    if (action && canNavigate) {
        return {
            nextState: getInitialSelectionState(),
            action,
        }
    }
    return null
}

export function selectNodeFromMatches(
    matches: { row: number; col: number }[],
    selectedNumber: number | null
): SelectionState {
    if (matches.length === 1) {
        return {
            mode: 'selecting-node',
            selectedNumber,
            direction: null,
            matchingNodes: matches,
            disambiguationLabels: [],
            selectedNode: matches[0] ?? null,
        }
    }
    return {
        mode: 'disambiguation',
        selectedNumber,
        direction: null,
        matchingNodes: matches,
        disambiguationLabels: generateLabels(matches.length),
        selectedNode: null,
    }
}

export function transitionIdle(
    _state: SelectionState,
    input: string,
    grid: Grid
): TransitionResult | null {
    if (isNumberKey(input)) {
        const num = parseInt(input, 10)
        const matches = findMatchingNodes(grid, num)
        if (matches.length > 0) {
            return {
                nextState: {
                    ...selectNodeFromMatches(matches, num),
                    ...{ selectedNumber: num },
                },
                action: { type: 'select-number', number: num },
            }
        }
    }
    return null
}

export function transitionDisambiguation(
    state: SelectionState,
    input: string
): TransitionResult | null {
    const { matchingNodes, selectedNumber } = state

    if (isLabelKey(input)) {
        const labelIndex = input.charCodeAt(0) - 97
        if (labelIndex >= 0 && labelIndex < matchingNodes.length) {
            return {
                nextState: {
                    mode: 'selecting-node',
                    selectedNumber,
                    direction: null,
                    matchingNodes,
                    disambiguationLabels: [],
                    selectedNode: matchingNodes[labelIndex] ?? null,
                },
                action: { type: 'select-label', labelIndex },
            }
        }
    }
    return null
}

export function handleDirectionBridge(
    state: SelectionState,
    input: string,
    grid: Grid,
    onBridgePlaced?: (bridge: PlacedBridge) => boolean
): TransitionResult | null {
    const { selectedNode, selectedNumber, matchingNodes } = state

    if (isDirectionKey(input) && selectedNode) {
        const isDouble = input === input.toUpperCase()
        const direction = input.toLowerCase() as Direction
        const targetNode = findReachableNodeInDirection(
            grid,
            selectedNode.row,
            selectedNode.col,
            direction
        )

        let erased = false
        if (targetNode && onBridgePlaced) {
            const bridge: PlacedBridge = {
                from: selectedNode,
                to: targetNode,
                count: isDouble ? 2 : 1,
            }
            erased = onBridgePlaced(bridge)
        }

        return {
            nextState: {
                mode: targetNode ? 'selected' : 'invalid',
                direction,
                selectedNumber,
                matchingNodes,
                disambiguationLabels: [],
                selectedNode,
                bridgeErased: erased,
                isDoubleBridge: isDouble,
            },
            action: {
                type: 'select-direction',
                direction,
                isDouble,
            },
        }
    }
    return null
}

export function transitionSelectingNode(
    state: SelectionState,
    input: string,
    grid: Grid,
    puzzleIndex: number,
    puzzlesLength: number,
    canNavigate: boolean,
    onBridgePlaced?: (bridge: PlacedBridge) => boolean
): TransitionResult | null {
    const nav = handleNavigation(input, puzzleIndex, puzzlesLength, canNavigate)
    if (nav) return nav

    return handleDirectionBridge(state, input, grid, onBridgePlaced)
}

export function transitionSelectedOrInvalid(
    state: SelectionState,
    input: string,
    grid: Grid,
    onBridgePlaced?: (bridge: PlacedBridge) => boolean
): TransitionResult | null {
    if (isNumberKey(input)) {
        const num = parseInt(input, 10)
        const matches = findMatchingNodes(grid, num)
        if (matches.length > 0) {
            return {
                nextState: {
                    ...selectNodeFromMatches(matches, num),
                    ...{ selectedNumber: num },
                },
                action: { type: 'select-number', number: num },
            }
        }
    }

    return handleDirectionBridge(state, input, grid, onBridgePlaced)
}

export function transition(
    state: SelectionState,
    input: string,
    key: { escape?: boolean },
    grid: Grid,
    puzzleIndex: number,
    puzzlesLength: number,
    canNavigate: boolean,
    onBridgePlaced?: (bridge: PlacedBridge) => boolean
): TransitionResult {
    if (input === 'q') {
        return handleQuit()
    }

    if (key.escape) {
        return handleEscape()
    }

    const nav = handleNavigation(input, puzzleIndex, puzzlesLength, canNavigate)
    if (nav) {
        return nav
    }

    const { mode } = state

    switch (mode) {
        case 'idle': {
            const result = transitionIdle(state, input, grid)
            return result ?? { nextState: state, action: { type: 'none' } }
        }
        case 'disambiguation': {
            const result = transitionDisambiguation(state, input)
            return result ?? { nextState: state, action: { type: 'none' } }
        }
        case 'selecting-node': {
            const result = transitionSelectingNode(
                state,
                input,
                grid,
                puzzleIndex,
                puzzlesLength,
                canNavigate,
                onBridgePlaced
            )
            return result ?? { nextState: state, action: { type: 'none' } }
        }
        case 'selected':
        case 'invalid': {
            const result = transitionSelectedOrInvalid(state, input, grid, onBridgePlaced)
            return result ?? { nextState: state, action: { type: 'none' } }
        }
    }
}
