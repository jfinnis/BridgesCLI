export type HashiNodeData = {
    value: number | '-' | '=' | '#' | ' ' | '|'
    /** Num lines connected on left, undefined if 0. */
    lineLeft?: 1 | 2
    /** Num lines connected on right, undefined if 0. */
    lineRight?: 1 | 2
    /** Num lines connected above, undefined if 0. */
    lineUp?: 1 | 2
    /** Num lines connected below, undefined if 0. */
    lineDown?: 1 | 2
}
