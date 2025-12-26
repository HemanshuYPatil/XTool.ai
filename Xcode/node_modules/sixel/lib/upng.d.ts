interface IQuantizer {
    getKDtree(data: Uint8Array | Uint8ClampedArray, colors: number): any;
}
export declare const quantize: IQuantizer;
export {};
