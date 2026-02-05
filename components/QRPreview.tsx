'use client';

import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

export interface QRPreviewProps {
  url: string;
  fgColor: string;
  bgColor: string;
  logo: string | null;
  useGradient: boolean;
  gradientColor1: string;
  gradientColor2: string;
}

export default function QRPreview({
  url,
  fgColor,
  bgColor,
  logo,
  useGradient,
  gradientColor1,
  gradientColor2,
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
            type: 'rounded',
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
            type: 'rounded',
          },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: useGradient ? gradientColor1 : fgColor,
      },
      cornersDotOptions: {
        type: 'dot',
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
  }, [url, fgColor, bgColor, logo, useGradient, gradientColor1, gradientColor2]);

  return (
    <div
      ref={qrRef}
      className="flex items-center justify-center min-w-[280px] min-h-[280px]"
    />
  );
}
