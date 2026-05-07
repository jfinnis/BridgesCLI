import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import type { PuzzleState } from '../PuzzleProgress.tsx'
import PuzzleProgress from '../PuzzleProgress.tsx'

describe('PuzzleProgress', () => {
    it('renders the expected grid for 1-5 solved, 6 in progress, 7-30 not started', () => {
        const states: PuzzleState[] = [
            'solved',
            'solved',
            'solved',
            'solved',
            'solved',
            'in-progress',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
        ]

        const { lastFrame } = render(<PuzzleProgress states={states} columns={5} />)
        expect(lastFrame()).toEqual(`┌──┬──┬──┬──┬──┐
│01│02│03│04│05│
│✅│✅│✅│✅│✅│
├──┼──┼──┼──┼──┤
│06│07│08│09│10│
│⏳│⬜│⬜│⬜│⬜│
├──┼──┼──┼──┼──┤
│11│12│13│14│15│
│⬜│⬜│⬜│⬜│⬜│
├──┼──┼──┼──┼──┤
│16│17│18│19│20│
│⬜│⬜│⬜│⬜│⬜│
├──┼──┼──┼──┼──┤
│21│22│23│24│25│
│⬜│⬜│⬜│⬜│⬜│
├──┼──┼──┼──┼──┤
│26│27│28│29│30│
│⬜│⬜│⬜│⬜│⬜│
└──┴──┴──┴──┴──┘`)
    })

    it('throws error when more than one puzzle is in progress', () => {
        const states: PuzzleState[] = [
            'in-progress',
            'in-progress',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
            'not-started',
        ]

        const { lastFrame } = render(<PuzzleProgress states={states} columns={5} />)
        expect(lastFrame()).toContain(
            'PuzzleProgress: only one puzzle can be in progress at a time'
        )
    })

    it('renders correctly when last row has fewer columns', () => {
        const states: PuzzleState[] = ['solved', 'not-started', 'not-started']

        const { lastFrame } = render(<PuzzleProgress states={states} columns={5} />)
        expect(lastFrame()).toEqual(`┌──┬──┬──┐
│01│02│03│
│✅│⬜│⬜│
└──┴──┴──┘`)
    })
})
