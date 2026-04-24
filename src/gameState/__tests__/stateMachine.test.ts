import { describe, expect, it, vi } from 'vitest'
import {
    getInitialSelectionState,
    handleDirectionBridge,
    handleEscape,
    handleNavigation,
    handleQuit,
    isDirectionKey,
    isLabelKey,
    isNumberKey,
    resolveNavigationAction,
    selectNodeFromMatches,
    transition,
    transitionDisambiguation,
    transitionIdle,
    transitionSelectedOrInvalid,
    transitionSelectingNode,
} from '../stateMachine.ts'

type GridCell = { value: number | '-' | '=' | '#' | ' ' | '|' }
type Grid = GridCell[][]

const makeGrid = (rows: (number | string | null)[][]): Grid =>
    rows.map(row =>
        row.map(cell =>
            cell === null ? null : { value: cell as number | '-' | '=' | '#' | ' ' | '|' }
        )
    )

const emptyGrid: Grid = []

const makeState = (overrides: Partial<Parameters<typeof getInitialSelectionState>[0]> = {}) => ({
    ...getInitialSelectionState(),
    ...overrides,
})

describe('isNumberKey', () => {
    it('returns true for keys 1-8', () => {
        expect(isNumberKey('1')).toBe(true)
        expect(isNumberKey('8')).toBe(true)
    })

    it('returns false for 0 and 9', () => {
        expect(isNumberKey('0')).toBe(false)
        expect(isNumberKey('9')).toBe(false)
    })

    it('returns false for non-numeric keys', () => {
        expect(isNumberKey('a')).toBe(false)
        expect(isNumberKey('q')).toBe(false)
        expect(isNumberKey('')).toBe(false)
    })
})

describe('isDirectionKey', () => {
    it('returns true for h/j/k/l', () => {
        expect(isDirectionKey('h')).toBe(true)
        expect(isDirectionKey('j')).toBe(true)
        expect(isDirectionKey('k')).toBe(true)
        expect(isDirectionKey('l')).toBe(true)
    })

    it('returns true for uppercase H/J/K/L', () => {
        expect(isDirectionKey('H')).toBe(true)
        expect(isDirectionKey('J')).toBe(true)
        expect(isDirectionKey('K')).toBe(true)
        expect(isDirectionKey('L')).toBe(true)
    })

    it('returns false for non-direction keys', () => {
        expect(isDirectionKey('a')).toBe(false)
        expect(isDirectionKey('q')).toBe(false)
        expect(isDirectionKey('')).toBe(false)
    })
})

describe('isLabelKey', () => {
    it('returns true for a-z', () => {
        expect(isLabelKey('a')).toBe(true)
        expect(isLabelKey('m')).toBe(true)
        expect(isLabelKey('z')).toBe(true)
    })

    it('returns false for A-Z', () => {
        expect(isLabelKey('A')).toBe(false)
        expect(isLabelKey('Z')).toBe(false)
    })

    it('returns false for non-letter keys', () => {
        expect(isLabelKey('1')).toBe(false)
        expect(isLabelKey('')).toBe(false)
    })
})

describe('resolveNavigationAction', () => {
    it('returns navigate next when n is pressed and can go forward', () => {
        expect(resolveNavigationAction('n', 0, 3)).toEqual({ type: 'navigate', direction: 'next' })
    })

    it('returns navigate prev when p is pressed and can go back', () => {
        expect(resolveNavigationAction('p', 1, 3)).toEqual({ type: 'navigate', direction: 'prev' })
    })

    it('returns toggle-solution for s', () => {
        expect(resolveNavigationAction('s', 0, 3)).toEqual({ type: 'toggle-solution' })
    })

    it('returns null when n is pressed on last puzzle', () => {
        expect(resolveNavigationAction('n', 2, 3)).toBeNull()
    })

    it('returns null when p is pressed on first puzzle', () => {
        expect(resolveNavigationAction('p', 0, 3)).toBeNull()
    })

    it('returns null for non-navigation keys', () => {
        expect(resolveNavigationAction('a', 0, 3)).toBeNull()
    })
})

describe('handleQuit', () => {
    it('returns reset state and quit action', () => {
        const result = handleQuit()
        expect(result.nextState).toEqual(getInitialSelectionState())
        expect(result.action).toEqual({ type: 'quit' })
    })
})

describe('handleEscape', () => {
    it('returns reset state and reset action', () => {
        const result = handleEscape()
        expect(result.nextState).toEqual(getInitialSelectionState())
        expect(result.action).toEqual({ type: 'reset' })
    })
})

describe('handleNavigation', () => {
    it('returns navigation result when canNavigate is true', () => {
        const result = handleNavigation('n', 0, 3, true)
        expect(result).toEqual({
            nextState: getInitialSelectionState(),
            action: { type: 'navigate', direction: 'next' },
        })
    })

    it('returns null when canNavigate is false', () => {
        const result = handleNavigation('n', 0, 3, false)
        expect(result).toBeNull()
    })

    it('returns null for non-navigation input', () => {
        const result = handleNavigation('a', 0, 3, true)
        expect(result).toBeNull()
    })
})

describe('selectNodeFromMatches', () => {
    it('returns selecting-node mode when there is one match', () => {
        const matches = [{ row: 0, col: 1 }]
        const result = selectNodeFromMatches(matches, 2)
        expect(result.mode).toBe('selecting-node')
        expect(result.selectedNode).toEqual({ row: 0, col: 1 })
        expect(result.disambiguationLabels).toEqual([])
    })

    it('returns disambiguation mode when there are multiple matches', () => {
        const matches = [
            { row: 0, col: 1 },
            { row: 1, col: 0 },
        ]
        const result = selectNodeFromMatches(matches, 2)
        expect(result.mode).toBe('disambiguation')
        expect(result.selectedNode).toBeNull()
        expect(result.disambiguationLabels).toEqual(['a', 'b'])
    })
})

describe('transitionIdle', () => {
    const grid = makeGrid([[1, null, 2]])

    it('returns null for non-number input', () => {
        expect(transitionIdle(makeState(), 'a', grid)).toBeNull()
    })

    it('returns null when number not found in grid', () => {
        expect(transitionIdle(makeState(), '9', grid)).toBeNull()
    })

    it('returns selecting-node when one match found', () => {
        const result = transitionIdle(makeState(), '1', grid)
        expect(result).toEqual({
            nextState: {
                mode: 'selecting-node',
                selectedNumber: 1,
                direction: null,
                matchingNodes: [{ row: 0, col: 0 }],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 0 },
            },
            action: { type: 'select-number', number: 1 },
        })
    })

    it('returns disambiguation when multiple matches found', () => {
        const grid2 = makeGrid([[2, null, 2]])
        const result = transitionIdle(makeState(), '2', grid2)
        expect(result).toEqual({
            nextState: {
                mode: 'disambiguation',
                selectedNumber: 2,
                direction: null,
                matchingNodes: [
                    { row: 0, col: 0 },
                    { row: 0, col: 2 },
                ],
                disambiguationLabels: ['a', 'b'],
                selectedNode: null,
            },
            action: { type: 'select-number', number: 2 },
        })
    })
})

describe('transitionDisambiguation', () => {
    it('returns null for non-label input', () => {
        const state = makeState({
            mode: 'disambiguation',
            matchingNodes: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
            ],
            disambiguationLabels: ['a', 'b'],
        })
        expect(transitionDisambiguation(state, '1')).toBeNull()
    })

    it('returns selecting-node when valid label pressed', () => {
        const state = makeState({
            mode: 'disambiguation',
            matchingNodes: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
            ],
            disambiguationLabels: ['a', 'b'],
            selectedNumber: 2,
        })
        const result = transitionDisambiguation(state, 'a')
        expect(result).toEqual({
            nextState: {
                mode: 'selecting-node',
                selectedNumber: 2,
                direction: null,
                matchingNodes: [
                    { row: 0, col: 0 },
                    { row: 0, col: 1 },
                ],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 0 },
            },
            action: { type: 'select-label', labelIndex: 0 },
        })
    })

    it('returns null when label index out of bounds', () => {
        const state = makeState({
            mode: 'disambiguation',
            matchingNodes: [{ row: 0, col: 0 }],
            disambiguationLabels: ['a'],
        })
        expect(transitionDisambiguation(state, 'b')).toBeNull()
    })
})

describe('handleDirectionBridge', () => {
    it('returns null for non-direction input', () => {
        const state = makeState({
            mode: 'selecting-node',
            selectedNode: { row: 0, col: 0 },
        })
        expect(handleDirectionBridge(state, 'a', emptyGrid)).toBeNull()
    })

    it('returns null when no selected node', () => {
        const state = makeState({ mode: 'selecting-node', selectedNode: null })
        expect(handleDirectionBridge(state, 'l', emptyGrid)).toBeNull()
    })

    it('returns selected mode when bridge placed successfully', () => {
        const grid = makeGrid([[3, null, 2]])
        const state = makeState({
            mode: 'selecting-node',
            selectedNode: { row: 0, col: 0 },
            selectedNumber: 3,
            matchingNodes: [{ row: 0, col: 0 }],
        })
        const onBridgePlaced = vi.fn(() => false)
        const result = handleDirectionBridge(state, 'l', grid, onBridgePlaced)

        expect(result).toEqual({
            nextState: {
                mode: 'selected',
                direction: 'l',
                selectedNumber: 3,
                matchingNodes: [{ row: 0, col: 0 }],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 0 },
                bridgeErased: false,
                isDoubleBridge: false,
            },
            action: {
                type: 'select-direction',
                direction: 'l',
                isDouble: false,
            },
        })
        expect(onBridgePlaced).toHaveBeenCalledWith({
            from: { row: 0, col: 0 },
            to: { row: 0, col: 2 },
            count: 1,
        })
    })

    it('returns invalid mode when no reachable node', () => {
        const grid = makeGrid([[3]])
        const state = makeState({
            mode: 'selecting-node',
            selectedNode: { row: 0, col: 0 },
        })
        const result = handleDirectionBridge(state, 'l', grid)

        expect(result?.nextState.mode).toBe('invalid')
        expect(result?.action).toEqual({
            type: 'select-direction',
            direction: 'l',
            isDouble: false,
        })
    })

    it('detects double bridge with uppercase', () => {
        const grid = makeGrid([[3, null, 2]])
        const state = makeState({
            mode: 'selecting-node',
            selectedNode: { row: 0, col: 0 },
        })
        const onBridgePlaced = vi.fn(() => false)
        const result = handleDirectionBridge(state, 'L', grid, onBridgePlaced)

        expect(result?.nextState.isDoubleBridge).toBe(true)
        expect(onBridgePlaced).toHaveBeenCalledWith({
            from: { row: 0, col: 0 },
            to: { row: 0, col: 2 },
            count: 2,
        })
    })
})

describe('transitionSelectingNode', () => {
    it('handles navigation', () => {
        const state = makeState({ mode: 'selecting-node' })
        const result = transitionSelectingNode(state, 'n', emptyGrid, 0, 3, true)
        expect(result?.action.type).toBe('navigate')
    })

    it('handles direction bridge', () => {
        const grid = makeGrid([[3, null, 2]])
        const state = makeState({
            mode: 'selecting-node',
            selectedNode: { row: 0, col: 0 },
        })
        const result = transitionSelectingNode(state, 'l', grid, 0, 3, true)
        expect(result?.nextState.mode).toBe('selected')
    })

    it('returns null for unrecognized input', () => {
        const state = makeState({
            mode: 'selecting-node',
            selectedNode: { row: 0, col: 0 },
        })
        expect(transitionSelectingNode(state, 'a', emptyGrid, 0, 3, true)).toBeNull()
    })
})

describe('transitionSelectedOrInvalid', () => {
    const grid = makeGrid([[1, null, 2]])

    it('handles number key to find new node', () => {
        const state = makeState({
            mode: 'selected',
            selectedNode: { row: 0, col: 0 },
        })
        const result = transitionSelectedOrInvalid(state, '2', grid)
        expect(result?.nextState.mode).toBe('selecting-node')
        expect(result?.action).toEqual({ type: 'select-number', number: 2 })
    })

    it('handles direction bridge', () => {
        const grid2 = makeGrid([[3, null, 2]])
        const state = makeState({
            mode: 'selected',
            selectedNode: { row: 0, col: 0 },
        })
        const result = transitionSelectedOrInvalid(state, 'l', grid2)
        expect(result?.nextState.mode).toBe('selected')
    })

    it('returns null for unrecognized input', () => {
        const state = makeState({ mode: 'selected' })
        expect(transitionSelectedOrInvalid(state, 'a', emptyGrid)).toBeNull()
    })
})

describe('transition (main)', () => {
    const grid = makeGrid([
        [1, null, 2],
        [null, null, null],
        [2, null, 1],
    ])

    it('handles quit', () => {
        const state = makeState({ mode: 'selecting-node' })
        const result = transition(state, 'q', {}, grid, 0, 3, true)
        expect(result.action).toEqual({ type: 'quit' })
        expect(result.nextState.mode).toBe('idle')
    })

    it('handles escape reset', () => {
        const state = makeState({ mode: 'selecting-node' })
        const result = transition(state, 'a', { escape: true }, grid, 0, 3, true)
        expect(result.action).toEqual({ type: 'reset' })
        expect(result.nextState.mode).toBe('idle')
    })

    it('dispatches to transitionIdle for idle mode', () => {
        const grid2 = makeGrid([[1, null, 2]])
        const state = makeState({ mode: 'idle' })
        const result = transition(state, '1', {}, grid2, 0, 3, true)
        expect(result.nextState.mode).toBe('selecting-node')
    })

    it('dispatches to transitionDisambiguation for disambiguation mode', () => {
        const state = makeState({
            mode: 'disambiguation',
            matchingNodes: [
                { row: 0, col: 0 },
                { row: 2, col: 2 },
            ],
            disambiguationLabels: ['a', 'b'],
        })
        const result = transition(state, 'a', {}, grid, 0, 3, true)
        expect(result.nextState.mode).toBe('selecting-node')
        expect(result.nextState.selectedNode).toEqual({ row: 0, col: 0 })
    })

    it('dispatches to transitionSelectingNode for selecting-node mode', () => {
        const state = makeState({
            mode: 'selecting-node',
            selectedNode: { row: 0, col: 0 },
        })
        const result = transition(state, 'l', {}, grid, 0, 3, true)
        expect(result.nextState.mode).toBe('selected')
    })

    it('dispatches to transitionSelectedOrInvalid for selected mode', () => {
        const state = makeState({
            mode: 'selected',
            selectedNode: { row: 0, col: 0 },
        })
        const result = transition(state, 'l', {}, grid, 0, 3, true)
        expect(result.nextState.mode).toBe('selected')
    })

    it('dispatches to transitionSelectedOrInvalid for invalid mode', () => {
        const state = makeState({
            mode: 'invalid',
            selectedNode: { row: 0, col: 0 },
        })
        const result = transition(state, 'l', {}, grid, 0, 3, true)
        expect(result.nextState.mode).toBe('selected')
    })

    it('returns none for unrecognized input in any mode', () => {
        const modes: Parameters<typeof makeState>[0]['mode'][] = [
            'idle',
            'disambiguation',
            'selecting-node',
            'selected',
            'invalid',
        ]
        for (const mode of modes) {
            const state = makeState({
                mode,
                ...(mode === 'selecting-node' || mode === 'selected' || mode === 'invalid'
                    ? { selectedNode: { row: 0, col: 0 } }
                    : {}),
            })
            const result = transition(state, 'x', {}, grid, 0, 3, true)
            expect(result.action).toEqual({ type: 'none' })
        }
    })
})
