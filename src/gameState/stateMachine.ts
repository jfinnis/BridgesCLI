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
    | { type: 'toggle-solution' }
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

function isNumberKey(input: string): boolean {
    return input >= '1' && input <= '8'
}

function isDirectionKey(input: string): boolean {
    const lower = input.toLowerCase()
    return lower === 'h' || lower === 'j' || lower === 'k' || lower === 'l'
}

function isLabelKey(input: string): boolean {
    const code = input.charCodeAt(0)
    return code >= 97 && code <= 122
}

function resolveNavigationAction(
    input: string,
    puzzleIndex: number,
    puzzlesLength: number
): InputAction {
    if (input === 'n' && puzzleIndex + 1 < puzzlesLength) {
        return { type: 'navigate', direction: 'next' }
    }
    if (input === 'p' && puzzleIndex - 1 >= 0) {
        return { type: 'navigate', direction: 'prev' }
    }
    if (input === 's') {
        return { type: 'toggle-solution' }
    }
    return { type: 'none' }
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
    const { mode, selectedNumber, matchingNodes, selectedNode } = state

    if (input === 'q') {
        return {
            nextState: getInitialSelectionState(),
            action: { type: 'quit' },
        }
    }

    if (mode === 'idle') {
        if (key.escape) {
            return {
                nextState: state,
                action: { type: 'reset' },
            }
        }

        if (isNumberKey(input)) {
            const num = parseInt(input, 10)
            const matches = findMatchingNodes(grid, num)
            if (matches.length > 0) {
                if (matches.length === 1) {
                    return {
                        nextState: {
                            mode: 'selecting-node',
                            selectedNumber: num,
                            direction: null,
                            matchingNodes: matches,
                            disambiguationLabels: [],
                            selectedNode: matches[0] ?? null,
                        },
                        action: { type: 'select-number', number: num },
                    }
                } else {
                    return {
                        nextState: {
                            mode: 'disambiguation',
                            selectedNumber: num,
                            direction: null,
                            matchingNodes: matches,
                            disambiguationLabels: generateLabels(matches.length),
                            selectedNode: null,
                        },
                        action: { type: 'select-number', number: num },
                    }
                }
            }
        }

        return {
            nextState: state,
            action: { type: 'none' },
        }
    }

    if (mode === 'disambiguation') {
        if (key.escape) {
            return {
                nextState: getInitialSelectionState(),
                action: { type: 'reset' },
            }
        }

        const nav = resolveNavigationAction(input, puzzleIndex, puzzlesLength)
        if (nav.type !== 'none' && canNavigate) {
            return {
                nextState: getInitialSelectionState(),
                action: nav,
            }
        }

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

        return {
            nextState: state,
            action: { type: 'none' },
        }
    }

    if (mode === 'selecting-node') {
        if (key.escape) {
            return {
                nextState: getInitialSelectionState(),
                action: { type: 'reset' },
            }
        }

        const nav = resolveNavigationAction(input, puzzleIndex, puzzlesLength)
        if (nav.type !== 'none' && canNavigate) {
            return {
                nextState: getInitialSelectionState(),
                action: nav,
            }
        }

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

        return {
            nextState: state,
            action: { type: 'none' },
        }
    }

    if (mode === 'selected' || mode === 'invalid') {
        if (key.escape) {
            return {
                nextState: getInitialSelectionState(),
                action: { type: 'reset' },
            }
        }

        if (isNumberKey(input)) {
            const num = parseInt(input, 10)
            const matches = findMatchingNodes(grid, num)
            if (matches.length > 0) {
                if (matches.length === 1) {
                    return {
                        nextState: {
                            mode: 'selecting-node',
                            selectedNumber: num,
                            direction: null,
                            matchingNodes: matches,
                            disambiguationLabels: [],
                            selectedNode: matches[0] ?? null,
                        },
                        action: { type: 'select-number', number: num },
                    }
                } else {
                    return {
                        nextState: {
                            mode: 'disambiguation',
                            selectedNumber: num,
                            direction: null,
                            matchingNodes: matches,
                            disambiguationLabels: generateLabels(matches.length),
                            selectedNode: null,
                        },
                        action: { type: 'select-number', number: num },
                    }
                }
            }
        }

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

        return {
            nextState: state,
            action: { type: 'none' },
        }
    }

    return {
        nextState: state,
        action: { type: 'none' },
    }
}
