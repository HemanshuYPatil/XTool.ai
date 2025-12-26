/**
 * Copyright (c) 2021 Joerg Breitbart.
 * @license MIT
 */
/**
 * Params storage.
 * Used during parsing to hold up to 6 params of a SIXEL command.
 */
export declare class Params {
    length: number;
    params: Uint32Array;
    reset(): void;
    addParam(): void;
    addDigit(v: number): void;
}
