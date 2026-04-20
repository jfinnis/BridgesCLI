import { describe, expect, it } from 'vitest'
import { getBridgeCount } from '../bridges.ts'

describe('getBridgeCount', () => {
    it('returns 0 for node with no bridges', () => {
        expect(getBridgeCount({ value: 3 })).toBe(0)
    })

    it('counts single bridge in each direction', () => {
        expect(getBridgeCount({ value: 1, lineRight: 1 })).toBe(1)
        expect(getBridgeCount({ value: 1, lineLeft: 1 })).toBe(1)
        expect(getBridgeCount({ value: 1, lineUp: 1 })).toBe(1)
        expect(getBridgeCount({ value: 1, lineDown: 1 })).toBe(1)
    })

    it('counts double bridges', () => {
        expect(getBridgeCount({ value: 2, lineRight: 2 })).toBe(2)
        expect(getBridgeCount({ value: 2, lineLeft: 2 })).toBe(2)
    })

    it('sums multiple bridge directions', () => {
        expect(getBridgeCount({ value: 2, lineLeft: 1, lineRight: 1 })).toBe(2)
        expect(
            getBridgeCount({ value: 4, lineUp: 1, lineDown: 1, lineLeft: 1, lineRight: 1 })
        ).toBe(4)
        expect(
            getBridgeCount({ value: 6, lineUp: 2, lineDown: 2, lineLeft: 1, lineRight: 1 })
        ).toBe(6)
    })

    it('treats undefined as 0', () => {
        expect(getBridgeCount({ value: 1, lineRight: undefined })).toBe(0)
    })
})
