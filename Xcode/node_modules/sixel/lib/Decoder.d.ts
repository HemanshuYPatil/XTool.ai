/**
 * Copyright (c) 2021 Joerg Breitbart.
 * @license MIT
 */
import { IDecodeResult, IDecoderOptions, RGBA8888, UintTypedArray, ParseMode, IDecoderProperties } from './Types';
declare class CallbackProxy {
    bandHandler: (width: number) => number;
    modeHandler: (mode: ParseMode) => number;
    handle_band(width: number): number;
    mode_parsed(mode: number): number;
}
/**
 * Create a decoder instance asynchronously.
 * To be used in the browser main thread.
 */
export declare function DecoderAsync(opts?: IDecoderOptions): Promise<Decoder>;
/**
 * Decoder - web assembly based sixel stream decoder.
 *
 * Usage pattern:
 *  - call `init` to initialize decoder for new image
 *  - feed data chunks to `decode` or `decodeString`
 *  - grab pixels from `data32`
 *  - optional: call `release` to free memory (e.g. after big images)
 *  - start over with next image by calling `init`
 *
 * Properties:
 *  - max width of 2^14 - 4 pixels (compile time setting in wasm)
 *  - no explicit height limit (only limited by memory)
 *  - max 4096 colors palette (compile time setting in wasm)
 *
 * Explanation operation modes:
 * - M1   Mode chosen for level 1 images (no raster attributes),
 *        or for level 2 images with `truncate=false`.
 * - M2   Mode chosen for level 2 images with `truncate=true` (default).
 *        While this mode is not fully spec conform (decoder not expected to truncate),
 *        it is what spec conform encoders should create (should not excess raster).
 *        This mode has several advantages:
 *        - ~15% faster decoding speed
 *        - image dimensions can be evaluated early without processing the whole data
 *        - faster pixel access in `data32` (precalulated)
 *        - image height is not reported as multiple of 6 pixels
 * - M0   Undecided mode state after `init`.
 * The level of an image is determined during early decoding based on the fact,
 * whether the data contains valid raster attributes before any sixel data.
 * Until then the mode of an image is marked as M0, meaning the real operation mode
 * could not be decided yet.
 */
export declare class Decoder {
    private _opts;
    private _instance;
    private _wasm;
    private _states;
    private _chunk;
    private _palette;
    private _PIXEL_OFFSET;
    private _pSrc;
    private _canvas;
    private _bandWidths;
    private _maxWidth;
    private _minWidth;
    private _lastOffset;
    private _currentHeight;
    private get _fillColor();
    private get _truncate();
    private get _rasterWidth();
    private get _rasterHeight();
    private get _width();
    private get _height();
    private get _level();
    private get _mode();
    private get _paletteLimit();
    private _initCanvas;
    private _realloc;
    private _handle_band;
    /**
     * Synchonous ctor. Can be called from nodejs or a webworker context.
     * For instantiation in the browser main thread use `WasmDecoderAsync` instead.
     */
    constructor(opts?: IDecoderOptions, _instance?: WebAssembly.Instance, _cbProxy?: CallbackProxy);
    /**
     * Width of the image data.
     * Returns the rasterWidth in level2/truncating mode,
     * otherwise the max width, that has been seen so far.
     */
    get width(): number;
    /**
     * Height of the image data.
     * Returns the rasterHeight in level2/truncating mode,
     * otherwise height touched by sixels.
     */
    get height(): number;
    /**
     * Get active palette colors as RGBA8888[] (borrowed).
     */
    get palette(): Uint32Array;
    /**
     * Get the memory used by the decoder.
     *
     * This is a rough estimate accounting the wasm instance memory
     * and pixel buffers held on JS side (real value will be slightly
     * higher due to JS book-keeping).
     * Note that the decoder does not free ressources on its own,
     * call `release` to free excess memory.
     */
    get memoryUsage(): number;
    /**
     * Get various properties of the decoder and the current image.
     */
    get properties(): IDecoderProperties;
    /**
     * Initialize decoder for next image. Must be called before
     * any calls to `decode` or `decodeString`.
     */
    init(fillColor?: RGBA8888, palette?: Uint32Array | null, paletteLimit?: number, truncate?: boolean): void;
    /**
     * Decode next chunk of data from start to end index (exclusive).
     * @throws Will throw if the image exceeds the memory limit.
     */
    decode(data: UintTypedArray, start?: number, end?: number): void;
    /**
     * Decode next chunk of string data from start to end index (exclusive).
     * Note: Decoding from string data is rather slow, use `decode` with byte data instead.
     * @throws Will throw if the image exceeds the memory limit.
     */
    decodeString(data: string, start?: number, end?: number): void;
    /**
     * Get current pixel data as 32-bit typed array (RGBA8888).
     * Also peeks into pixel data of the current band, that got not pushed yet.
     */
    get data32(): Uint32Array;
    /**
     * Same as `data32`, but returning pixel data as Uint8ClampedArray suitable
     * for direct usage with `ImageData`.
     */
    get data8(): Uint8ClampedArray;
    /**
     * Release image ressources on JS side held by the decoder.
     *
     * The decoder tries to re-use memory ressources of a previous image
     * to lower allocation and GC pressure. Decoding a single big image
     * will grow the memory usage of the decoder permanently.
     * Call `release` to reset the internal buffers and free the memory.
     * Note that this destroys the image data, call it when done processing
     * a rather big image, otherwise it is not needed. Use `memoryUsage`
     * to decide, whether the held memory is still within your limits.
     * This does not affect the wasm module (operates on static memory).
     */
    release(): void;
}
/**
 * Convenient decoding functions for easier usage.
 *
 * These can be used for casual decoding of sixel images,
 * that dont come in as stream chunks.
 * Note that the functions instantiate a stream decoder for every call,
 * which comes with a performance penalty of ~25%.
 */
/**
 * Decode function with synchronous wasm loading.
 * Can be used in a web worker or in nodejs. Does not work reliable in normal browser context.
 * @throws Will throw if the image exceeds the memory limit.
 */
export declare function decode(data: UintTypedArray | string, opts?: IDecoderOptions): IDecodeResult;
/**
 * Decode function with asynchronous wasm loading.
 * Use this version in normal browser context.
 * @throws Will throw if the image exceeds the memory limit.
 */
export declare function decodeAsync(data: UintTypedArray | string, opts?: IDecoderOptions): Promise<IDecodeResult>;
export {};
