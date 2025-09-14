export type Size = {
    width: number;
    height: number;
};
export type UploadedImage = {
    id: string;
    buffer: Buffer;
    filename: string;
    kind?: 'photo' | 'logo' | 'background';
};
export type Palette = {
    dominant: string;
    accent: string;
};
export type GenerateOptions = {
    title?: string;
    sizes?: Size[];
};
export type ThumbnailResult = {
    base: Buffer;
    variants: {
        size: Size;
        buffer: Buffer;
    }[];
};
export declare function extractPalette(buf: Buffer): Promise<Palette>;
export declare function generateThumbnail(images: UploadedImage[], opts?: GenerateOptions): Promise<ThumbnailResult>;
