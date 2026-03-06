import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'
import type { SelectionState } from '../../types.ts'
import Header from '../Header.tsx'

describe('Header', () => {
    it('shows idle message when no selection state and no number range', () => {
        const { lastFrame } = render(<Header puzzleIndex={0} puzzle="5x5:1a1" />)
        expect(lastFrame()).toContain('Type a number to select a node')
    })

    it('shows dynamic number range when provided', () => {
        const { lastFrame } = render(
            <Header puzzleIndex={0} puzzle="5x5:1a1" minNumber={2} maxNumber={7} />
        )
        expect(lastFrame()).toContain('Type a number [2-7] to select a node')
    })

    describe('selection state messages', () => {
        it('shows "select direction" message after we disambiguate which node', () => {
            const selectionState: SelectionState = {
                mode: 'selecting-node',
                selectedNumber: 1,
                direction: null,
                matchingNodes: [
                    { row: 0, col: 0 },
                    { row: 1, col: 1 },
                ],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 0 },
            }
            const { lastFrame } = render(
                <Header puzzleIndex={0} puzzle="5x5:1a1" selectionState={selectionState} />
            )
            expect(lastFrame()).toContain(`Select direction with`)
        })

        it('shows disambiguation message without direction', () => {
            const selectionState: SelectionState = {
                mode: 'disambiguation',
                selectedNumber: 1,
                direction: null,
                matchingNodes: [
                    { row: 0, col: 0 },
                    { row: 1, col: 2 },
                ],
                disambiguationLabels: ['a', 'b'],
                selectedNode: null,
            }
            const { lastFrame } = render(
                <Header puzzleIndex={0} puzzle="5x5:1a1" selectionState={selectionState} />
            )
            expect(lastFrame()).toContain('Press label shown to select that node')
        })

        it('shows disambiguation message with direction', () => {
            const selectionState: SelectionState = {
                mode: 'disambiguation',
                selectedNumber: 1,
                direction: 'h',
                matchingNodes: [
                    { row: 0, col: 0 },
                    { row: 1, col: 2 },
                ],
                disambiguationLabels: ['a', 'b'],
                selectedNode: null,
            }
            const { lastFrame } = render(
                <Header puzzleIndex={0} puzzle="5x5:1a1" selectionState={selectionState} />
            )
            expect(lastFrame()).toContain('Press label shown to select that node')
        })

        it('shows selected message with direction (horizontal)', () => {
            const selectionState: SelectionState = {
                mode: 'selected',
                selectedNumber: 1,
                direction: 'l',
                matchingNodes: [{ row: 0, col: 0 }],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 0 },
            }
            const { lastFrame } = render(
                <Header puzzleIndex={0} puzzle="5x5:1a1" selectionState={selectionState} />
            )
            expect(lastFrame()).toContain('Drew horizontal bridge')
        })

        it('shows selected message with direction (vertical)', () => {
            const selectionState: SelectionState = {
                mode: 'selected',
                selectedNumber: 1,
                direction: 'k',
                matchingNodes: [{ row: 0, col: 0 }],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 0 },
            }
            const { lastFrame } = render(
                <Header puzzleIndex={0} puzzle="5x5:1a1" selectionState={selectionState} />
            )
            expect(lastFrame()).toContain('Drew vertical bridge')
        })

        it('shows erased bridge message when bridgeErased is true', () => {
            const selectionState: SelectionState = {
                mode: 'selected',
                selectedNumber: 1,
                direction: 'l',
                matchingNodes: [{ row: 0, col: 0 }],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 0 },
                bridgeErased: true,
            }
            const { lastFrame } = render(
                <Header puzzleIndex={0} puzzle="5x5:1a1" selectionState={selectionState} />
            )
            expect(lastFrame()).toContain('Erased bridge')
        })

        it('shows invalid message when no node in direction', () => {
            const selectionState: SelectionState = {
                mode: 'invalid',
                selectedNumber: 1,
                direction: 'h',
                matchingNodes: [{ row: 0, col: 0 }],
                disambiguationLabels: [],
                selectedNode: { row: 0, col: 0 },
            }
            const { lastFrame } = render(
                <Header puzzleIndex={0} puzzle="5x5:1a1" selectionState={selectionState} />
            )
            expect(lastFrame()).toContain('Cannot draw bridge left from node')
        })
    })

    describe('puzzle display', () => {
        it('shows puzzle number for indexed puzzles', () => {
            const { lastFrame } = render(<Header puzzleIndex={2} puzzle="5x5:1a1" />)
            expect(lastFrame()).toContain('Bridges: Puzzle #3')
        })

        it('shows solution suffix when showSolution is true', () => {
            const { lastFrame } = render(
                <Header puzzleIndex={0} puzzle="5x5:1a1" showSolution={true} />
            )
            expect(lastFrame()).toContain('Viewing solution (press s to return to puzzle)')
        })

        it('shows custom puzzle label for custom puzzles', () => {
            const { lastFrame } = render(
                <Header puzzleIndex={0} puzzle="5x5:1a1" isCustomPuzzle={true} />
            )
            expect(lastFrame()).toContain('Bridges: Puzzle - 5x5:1a1')
        })
    })
})
