import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import Controls, { legendItems } from '../Controls.tsx'

describe('Controls', () => {
    it('shows p, n, q controls', () => {
        const { lastFrame } = render(<Controls />)
        expect(lastFrame()).toContain('Controls:')
        expect(lastFrame()).toContain('p: Previous puzzle')
        expect(lastFrame()).toContain('n: Next puzzle')
        expect(lastFrame()).toContain('q: Quit')
    })

    describe('legendItems', () => {
        it('shows n/p as enabled when idle', () => {
            const items = legendItems(false, true, true)
            const p = items.find(i => i.key === 'p')
            const n = items.find(i => i.key === 'n')
            expect(p?.disabled).toBe(false)
            expect(n?.disabled).toBe(false)
        })

        it('shows n/p as disabled in selecting-node mode', () => {
            const items = legendItems(true, true, true)
            const p = items.find(i => i.key === 'p')
            const n = items.find(i => i.key === 'n')
            expect(p?.disabled).toBe(true)
            expect(n?.disabled).toBe(true)
        })

        it('does not include s key', () => {
            const items = legendItems(false, true, true)
            const s = items.find(i => i.key === 's')
            expect(s).toBeUndefined()
        })
    })
})
