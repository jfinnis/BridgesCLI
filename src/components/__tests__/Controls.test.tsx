import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import Controls, { legendItems } from '../Controls.tsx'

describe('Controls', () => {
    it('does not show solution option when enableSolutions is false', () => {
        const { lastFrame } = render(<Controls enableSolutions={false} />)
        expect(lastFrame()).toContain('Controls:')
        expect(lastFrame()).toContain('p: Previous puzzle')
        expect(lastFrame()).toContain('n: Next puzzle')
        expect(lastFrame()).not.toContain('s: Show solution')
        expect(lastFrame()).toContain('q: Quit')
    })

    it('shows solution option when enableSolutions is true', () => {
        const { lastFrame } = render(<Controls enableSolutions={true} />)
        expect(lastFrame()).toContain('Controls:')
        expect(lastFrame()).toContain('p: Previous puzzle')
        expect(lastFrame()).toContain('n: Next puzzle')
        expect(lastFrame()).toContain('s: Show solution')
        expect(lastFrame()).toContain('q: Quit')
    })

    describe('legendItems', () => {
        describe('when enableSolutions is false', () => {
            it('shows n/p as enabled when idle', () => {
                const items = legendItems(true, false, false, true, true)
                const p = items.find(i => i.key === 'p')
                const n = items.find(i => i.key === 'n')
                const s = items.find(i => i.key === 's')
                expect(p?.disabled).toBe(false)
                expect(n?.disabled).toBe(false)
                expect(s).toBeUndefined()
            })

            it('shows n/p as disabled in selecting-node mode', () => {
                const items = legendItems(true, false, true, true, true)
                const p = items.find(i => i.key === 'p')
                const n = items.find(i => i.key === 'n')
                const s = items.find(i => i.key === 's')
                expect(p?.disabled).toBe(true)
                expect(n?.disabled).toBe(true)
                expect(s).toBeUndefined()
            })
        })

        describe('when enableSolutions is true', () => {
            it('shows n/p/s as enabled when idle', () => {
                const items = legendItems(true, true, false, true, true)
                const p = items.find(i => i.key === 'p')
                const n = items.find(i => i.key === 'n')
                const s = items.find(i => i.key === 's')
                expect(p?.disabled).toBe(false)
                expect(n?.disabled).toBe(false)
                expect(s?.disabled).toBe(false)
            })

            it('shows n/p/s as disabled in selecting-node mode', () => {
                const items = legendItems(true, true, true, true, true)
                const p = items.find(i => i.key === 'p')
                const n = items.find(i => i.key === 'n')
                const s = items.find(i => i.key === 's')
                expect(p?.disabled).toBe(true)
                expect(n?.disabled).toBe(true)
                expect(s?.disabled).toBe(true)
            })

            it('shows s as disabled when no solution exists', () => {
                const items = legendItems(false, true, false, true, true)
                const s = items.find(i => i.key === 's')
                expect(s?.disabled).toBe(true)
            })

            it('shows s as enabled when solution exists', () => {
                const items = legendItems(true, true, false, true, true)
                const s = items.find(i => i.key === 's')
                expect(s?.disabled).toBe(false)
            })
        })
    })
})
