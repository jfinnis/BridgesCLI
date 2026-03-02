import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import Messages, { legendItems } from '../Messages.tsx'

describe('Messages', () => {
    it('renders the legend', () => {
        const { lastFrame } = render(<Messages />)
        expect(lastFrame()).toContain('Controls:')
        expect(lastFrame()).toContain('p: Previous puzzle')
        expect(lastFrame()).toContain('n: Next puzzle')
        expect(lastFrame()).toContain('s: Show solution')
        expect(lastFrame()).toContain('q: Quit')
    })

    describe('disabled state in selection mode', () => {
        it('shows n/p/s as enabled when idle', () => {
            const items = legendItems(true, false)
            const p = items.find(i => i.key === 'p')
            const n = items.find(i => i.key === 'n')
            const s = items.find(i => i.key === 's')
            expect(p?.disabled).toBe(false)
            expect(n?.disabled).toBe(false)
            expect(s?.disabled).toBe(false)
        })

        it('shows n/p/s as disabled in selecting-node mode', () => {
            const items = legendItems(true, true)
            const p = items.find(i => i.key === 'p')
            const n = items.find(i => i.key === 'n')
            const s = items.find(i => i.key === 's')
            expect(p?.disabled).toBe(true)
            expect(n?.disabled).toBe(true)
            expect(s?.disabled).toBe(true)
        })

        it('shows n/p/s as disabled in disambiguation mode', () => {
            const items = legendItems(true, true)
            const p = items.find(i => i.key === 'p')
            const n = items.find(i => i.key === 'n')
            const s = items.find(i => i.key === 's')
            expect(p?.disabled).toBe(true)
            expect(n?.disabled).toBe(true)
            expect(s?.disabled).toBe(true)
        })

        it('shows s as disabled when no solution exists', () => {
            const items = legendItems(false, false)
            const s = items.find(i => i.key === 's')
            expect(s?.disabled).toBe(true)
        })

        it('shows s as enabled when solution exists', () => {
            const items = legendItems(true, false)
            const s = items.find(i => i.key === 's')
            expect(s?.disabled).toBe(false)
        })
    })
})
