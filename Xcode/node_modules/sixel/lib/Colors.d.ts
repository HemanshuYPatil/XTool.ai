/**
 * Copyright (c) 2019 Joerg Breitbart.
 * @license MIT
 */
import { RGBA8888, RGBColor } from './Types';
export declare const BIG_ENDIAN: boolean;
export declare function red(n: RGBA8888): number;
export declare function green(n: RGBA8888): number;
export declare function blue(n: RGBA8888): number;
export declare function alpha(n: RGBA8888): number;
/**
 * Convert RGB channels to native color RGBA8888.
 */
export declare function toRGBA8888(r: number, g: number, b: number, a?: number): RGBA8888;
/**
 * Convert native color to [r, g, b, a].
 */
export declare function fromRGBA8888(color: RGBA8888): [number, number, number, number];
/**
 * Get index of nearest color in `palette` for `color`.
 * Uses euclidean distance without any luminescence correction.
 */
export declare function nearestColorIndex(color: RGBA8888, palette: RGBColor[]): number;
/**
 * Normalize SIXEL RGB values (percent based, 0-100) to RGBA8888.
 */
export declare function normalizeRGB(r: number, g: number, b: number): RGBA8888;
/**
 * Normalize SIXEL HLS values to RGBA8888. Applies hue correction of +240°.
 */
export declare function normalizeHLS(h: number, l: number, s: number): RGBA8888;
/**
 * default palettes
 */
/**
 * 16 predefined color registers of VT340 (values in %):
 * ```
 *                R   G   B
 * 0  Black       0   0   0
 * 1  Blue        20  20  80
 * 2  Red         80  13  13
 * 3  Green       20  80  20
 * 4  Magenta     80  20  80
 * 5  Cyan        20  80  80
 * 6  Yellow      80  80  20
 * 7  Gray 50%    53  53  53
 * 8  Gray 25%    26  26  26
 * 9  Blue*       33  33  60
 * 10 Red*        60  26  26
 * 11 Green*      33  60  33
 * 12 Magenta*    60  33  60
 * 13 Cyan*       33  60  60
 * 14 Yellow*     60  60  33
 * 15 Gray 75%    80  80  80
 * ```
 * (*) less saturated
 *
 * @see https://vt100.net/docs/vt3xx-gp/chapter2.html#S2.4
*/
export declare const PALETTE_VT340_COLOR: Uint32Array;
/**
 * 16 predefined monochrome registers of VT340 (values in %):
 * ```
 *              R   G   B
 * 0  Black     0   0   0
 * 1  Gray-2    13  13  13
 * 2  Gray-4    26  26  26
 * 3  Gray-6    40  40  40
 * 4  Gray-1    6   6   6
 * 5  Gray-3    20  20  20
 * 6  Gray-5    33  33  33
 * 7  White 7   46  46  46
 * 8  Black 0   0   0   0
 * 9  Gray-2    13  13  13
 * 10 Gray-4    26  26  26
 * 11 Gray-6    40  40  40
 * 12 Gray-1    6   6   6
 * 13 Gray-3    20  20  20
 * 14 Gray-5    33  33  33
 * 15 White 7   46  46  46
 * ```
 *
 * @see https://vt100.net/docs/vt3xx-gp/chapter2.html#S2.4
 */
export declare const PALETTE_VT340_GREY: Uint32Array;
/**
 * 256 predefined ANSI colors.
 *
 * @see https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
 */
export declare const PALETTE_ANSI_256: Uint32Array;
/**
 * Background: Black by default.
 * Foreground: White by default.
 *
 * Background color is used whenever a fill color is needed and not explicitly set.
 * Foreground color is used as default initial sixel color.
 */
export declare const DEFAULT_BACKGROUND: RGBA8888;
export declare const DEFAULT_FOREGROUND: RGBA8888;
