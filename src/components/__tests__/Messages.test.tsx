import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import Messages from '../Messages.tsx'

describe('Messages', () => {
    it('shows congratulations when solution is reached', () => {
        const { lastFrame } = render(<Messages solutionReached={true} />)
        expect(lastFrame()).toContain('Congratulations! Puzzle solved!')
    })

    it('does not show congratulations when solution is not reached', () => {
        const { lastFrame } = render(<Messages solutionReached={false} />)
        expect(lastFrame()).not.toContain('Congratulations! Puzzle solved!')
    })

    it('shows grid not connected warning when grid is not connected', () => {
        const { lastFrame } = render(<Messages gridNotConnected={true} />)
        expect(lastFrame()).toContain('Grid is not fully connected')
    })

    it('does not show grid warning when grid is connected', () => {
        const { lastFrame } = render(<Messages gridNotConnected={false} />)
        expect(lastFrame()).not.toContain('Grid is not fully connected')
    })
})
