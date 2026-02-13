import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'

import { HashiRow } from '../HashiRow.tsx'

describe('HashiRow', () => {
    it('renders three nodes', () => {
        const { lastFrame } = render(
            <HashiRow
                length={3}
                nodes={[
                    { position: 0, value: 1 },
                    { position: 1, value: 2 },
                    { position: 2, value: 3 },
                ]}
            />
        )
        expect(lastFrame()).toEqual(`
   ┏━━━┓     ┏━━━┓     ┏━━━┓
   ┃ 1 ┃     ┃ 2 ┃     ┃ 3 ┃
   ┗━━━┛     ┗━━━┛     ┗━━━┛
`)
    })

    it('renders empty positions as blank', () => {
        const { lastFrame } = render(
            <HashiRow
                length={3}
                nodes={[
                    { position: 0, value: 1 },
                    { position: 2, value: 3 },
                ]}
            />
        )
        expect(lastFrame()).toEqual(`
   ┏━━━┓               ┏━━━┓
   ┃ 1 ┃               ┃ 3 ┃
   ┗━━━┛               ┗━━━┛
`)})

    it('ignores nodes outside valid positions', () => {
        const { lastFrame } = render(
            <HashiRow
                length={3}
                nodes={[
                    { position: -1, value: 1 },
                    { position: 0, value: 2 },
                    { position: 3, value: 3 },
                ]}
            />
        )
        expect(lastFrame()).toEqual(`
   ┏━━━┓
   ┃ 2 ┃
   ┗━━━┛
`)
        expect(lastFrame()).not.toContain('┃ 1 ┃')
        expect(lastFrame()).not.toContain('┃ 3 ┃')
    })
})
