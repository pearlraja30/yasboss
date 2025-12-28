// src/types/react-image-magnifiers.d.ts

declare module 'react-image-magnifiers' {
    import React from 'react';

    export interface GlassMagnifierProps {
        imageSrc: string;
        imageAlt?: string;
        largeImageSrc?: string;
        magnifierSize?: string | number;
        magnifierBorderSize?: number;
        magnifierBorderColor?: string;
        magnifierBackgroundColor?: string;
        magnifierOffsetX?: number;
        magnifierOffsetY?: number;
        square?: boolean;
        cursorStyle?: string;
        onImageLoad?: (e: React.SyntheticEvent) => void;
        onZoomStart?: () => void;
        onZoomEnd?: () => void;
        allowOverflow?: boolean;
        style?: React.CSSProperties;
        className?: string;
    }

    export class GlassMagnifier extends React.Component<GlassMagnifierProps> {}
    
    // Add other components if you plan to use them
    export class SideBySideMagnifier extends React.Component<any> {}
    export class Magnifier extends React.Component<any> {}
}