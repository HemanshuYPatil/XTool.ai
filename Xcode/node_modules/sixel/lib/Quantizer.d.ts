import { IQuantResult } from './Types';
/**
 * The internal quantizer currently relies on the kd tree quanization from UPNG.
 *
 * Planned:
 *  - SIXEL optimized quantizer without alpha channel and reduced RGB (only 1M colors possible)
 *  - better/customizable dithering algos
 *  - separate palette creation from image reduction
 *  - support for predefined palette (needs reconstruction of kd tree)
 *  - grayscale / monochrome transformations
 *
 * FIXME: Dithering should respect image dimensions.
 */
export declare function reduce(data: Uint8Array | Uint8ClampedArray, width: number, colors: number): IQuantResult;
