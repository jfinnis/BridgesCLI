import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import Messages from '../Messages.tsx'

describe('Messages', () => {
    it('renders the legend', () => {
        const { lastFrame } = render(<Messages />)
        expect(lastFrame()).toContain('Controls:')
        expect(lastFrame()).toContain('p: Previous puzzle')
        expect(lastFrame()).toContain('n: Next puzzle')
        expect(lastFrame()).toContain('q: Quit')
    })
})
