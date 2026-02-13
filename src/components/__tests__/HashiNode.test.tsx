import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import { HashiNode } from '../HashiNode.tsx'

describe('HashiNode', () => {
    it('renders number 4 in a circle', () => {
        const { lastFrame } = render(<HashiNode value={4} />)
        expect(lastFrame()).toBe(`┏━━━┓
┃ 4 ┃
┗━━━┛`)
    })

    it('throws for value less than 1', () => {
        const { lastFrame } = render(<HashiNode value={0} />)
        expect(lastFrame()).toContain('HashiNode value must be an integer between 1 and 8, got 0')
    })

    it('throws for value greater than 8', () => {
        const { lastFrame } = render(<HashiNode value={9} />)
        expect(lastFrame()).toContain('HashiNode value must be an integer between 1 and 8, got 9')
    })

    it('throws for non-integer values', () => {
        const { lastFrame: lf1 } = render(<HashiNode value={4.5} />)
        expect(lf1()).toContain('HashiNode value must be an integer between 1 and 8, got 4.5')

        const { lastFrame: lf2 } = render(<HashiNode value={NaN} />)
        expect(lf2()).toContain('HashiNode value must be an integer between 1 and 8, got NaN')
    })

    it('throws for non-number values', () => {
        // @ts-expect-error - testing runtime validation
        const { lastFrame: lf1 } = render(<HashiNode value="4" />)
        expect(lf1()).toContain('HashiNode value must be an integer between 1 and 8')

        // @ts-expect-error - testing runtime validation
        const { lastFrame: lf2 } = render(<HashiNode value={null} />)
        expect(lf2()).toContain('HashiNode value must be an integer between 1 and 8')
    })

    it('renders valid values 1 through 8', () => {
        for (let i = 1; i <= 8; i++) {
            const { lastFrame } = render(<HashiNode value={i} />)
            expect(lastFrame()).toEqual(`┏━━━┓
┃ ${i} ┃
┗━━━┛`)
        }
    })
})
