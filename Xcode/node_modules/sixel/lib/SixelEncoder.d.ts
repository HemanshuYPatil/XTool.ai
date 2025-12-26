/**
 * Copyright (c) 2019 Joerg Breitbart.
 * @license MIT
 */
import { RGBA8888, RGBColor } from './Types';
/**
 * Create escape sequence introducer for SIXEL.
 * Should be written to the terminal before any SIXEL data.
 *
 * A SIXEL DSC sequence understands 3 parameters, but only the second one (background select) is supported
 * by some terminals. Therefore only this parameter is exposed.
 *
 * backgroundSelect:
 *  - 0   device default action (most terminals will apply background color)
 *  - 1   no action (no change to zero bit value grid positions)
 *  - 2   set to background color - zero bit value grid positions are set to background color (device dependent).
 *
 * @see https://www.vt100.net/docs/vt3xx-gp/chapter14.html
 * @param backgroundSelect background color setting (default = 0)
 */
export declare function introducer(backgroundSelect?: 0 | 1 | 2): string;
/**
 * Finalize SIXEL sequence. Write this, when the SIXEL data stream has ended to restore
 * the terminal to normal operation.
 */
export declare const FINALIZER = "\u001B\\";
/**
 * sixelEncode - encode pixel data to SIXEL string.
 *
 * The colors of the image get aligned to the given palette, unmatched colors will be translated
 * by euclidean distance. Without proper quantization beforehand this leads to poor output quality,
 * thus consider using a quantizer with custom palette creation and dithering.
 * For transparency only an alpha value of 0 will be respected as fully transparent,
 * other alpha values are set to fully opaque (255). Transparent pixels will be colored by the
 * terminal later on depending on the `backgroundSelect` setting of the introducer.
 *
 * To be in line with the SIXEL spec (DEC STD 070) `palette` should not contain more than 256 colors.
 * Note that older devices limit color registers even further (16 on VT340). Furthermore a high
 * number of colors will have a penalty on creation time, temporary memory usage and
 * the size of the SIXEL data. For simple graphics a rather small palette (16 to 64) might do,
 * for complicated pictures higher should work with 128+.
 *
 * @param data    pixel data
 * @param width   width of the image
 * @param height  height of the image
 * @param palette palette to be applied
 * @param rasterAttributes whether to write raster attributes (true)
 */
export declare function sixelEncode(data: Uint8ClampedArray | Uint8Array, width: number, height: number, palette: RGBA8888[] | RGBColor[], rasterAttributes?: boolean): string;
/**
 * sixelEncodeIndexed - encode indexed image data to SIXEL string.
 * Same as `sixelEncode`, but for correctly indexed colors.
 */
export declare function sixelEncodeIndexed(indices: Uint16Array, width: number, height: number, palette: RGBA8888[] | RGBColor[], rasterAttributes?: boolean): string;
/**
 * Convenient function to create a full SIXEL escape sequence for given image data (alpha).
 *
 * Quantization is done by the internal quantizer, with dithering done on 4 neighboring pixels
 * for speed reasons, which works great for real pictures to level out hard color plane borders,
 * but might show moiré or striping artefacts on color gradients.
 * Currently the dithering is not configurable, resort to custom quantizer
 * library in conjunction with `sixelEncode` if you observe dithering issues.
 *
 * @param data              pixel data
 * @param width             width of the image
 * @param height            height of the image
 * @param maxColors         max colors of the created palette
 * @param backgroundSelect  background select behavior for transparent pixels
 */
export declare function image2sixel(data: Uint8Array | Uint8ClampedArray, width: number, height: number, maxColors?: number, backgroundSelect?: 0 | 1 | 2): string;
