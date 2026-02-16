import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import Messages from '../Messages.tsx'

describe('Messages', () => {
    it('renders the quit message', () => {
        const { lastFrame } = render(<Messages />)
        expect(lastFrame()).toContain('Press q to quit')
    })
})
