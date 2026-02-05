'use client';

import { useEffect, useRef } from 'react';
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';

export interface QRPreviewProps {
  url: string;
  fgColor: string;
  bgColor: string;
  logo: string | null;
  useGradient: boolean;
  gradientColor1: string;
  gradientColor2: string;
  dotStyle: DotType;
  cornerSquareStyle: CornerSquareType;
  cornerDotStyle: CornerDotType;
}

export default function QRPreview({
  url,
  fgColor,
  bgColor,
  logo,
  useGradient,
  gradientColor1,
  gradientColor2,
  dotStyle,
  cornerSquareStyle,
  cornerDotStyle,
}: QRPreviewProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 280,
      height: 280,
      type: 'svg',
      data: url || 'https://example.com',
      dotsOptions: useGradient
        ? {
            type: dotStyle,
            gradient: {
              type: 'linear',
              rotation: 45,
              colorStops: [
                { offset: 0, color: gradientColor1 },
                { offset: 1, color: gradientColor2 },
              ],
            },
          }
        : {
            color: fgColor,
            type: dotStyle,
          },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: cornerSquareStyle,
        color: useGradient ? gradientColor1 : fgColor,
      },
      cornersDotOptions: {
        type: cornerDotStyle,
        color: useGradient ? gradientColor2 : fgColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
        imageSize: 0.4,
      },
      ...(logo && { image: logo }),
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, [url, fgColor, bgColor, logo, useGradient, gradientColor1, gradientColor2, dotStyle, cornerSquareStyle, cornerDotStyle]);

  return (
    <div
      ref={qrRef}
      className="flex items-center justify-center min-w-[280px] min-h-[280px]"
    />
  );
}
