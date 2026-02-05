"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STRIPE_PAYMENT_URL = "https://buy.stripe.com/test_4gM9AM7Wtdc6eeacQ73F600";

interface QRGeneratorProps {
  isPremium: boolean;
  onPremiumChange: (isPremium: boolean) => void;
}

export default function QRGenerator({ isPremium, onPremiumChange }: QRGeneratorProps) {
  const [url, setUrl] = useState("https://example.com");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor, setGradientColor] = useState("#6366f1");
  const [showPaywall, setShowPaywall] = useState(false);
  const [downloadType, setDownloadType] = useState<"png" | "svg">("png");
  
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  // Check for premium features being used
  const hasPremiumFeatures = logo !== null || useGradient;
  const wantsSvg = downloadType === "svg";

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 280,
      height: 280,
      type: "svg",
      data: url || "https://example.com",
      dotsOptions: {
        color: fgColor,
        type: "rounded",
        ...(useGradient && {
          gradient: {
            type: "linear",
            rotation: 45,
            colorStops: [
              { offset: 0, color: fgColor },
              { offset: 1, color: gradientColor },
            ],
          },
        }),
      },
      backgroundOptions: {
        color: bgColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
      },
      ...(logo && { image: logo }),
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qrCode.current.append(qrRef.current);
    }
  }, [url, fgColor, bgColor, logo, useGradient, gradientColor]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (type: "png" | "svg") => {
    setDownloadType(type);
    
    // Check if premium features are being used or SVG is requested
    const needsPremium = (type === "svg") || hasPremiumFeatures;
    
    if (needsPremium && !isPremium) {
      setShowPaywall(true);
      return;
    }
    
    // Proceed with download
    doDownload(type);
  };

  const doDownload = (type: "png" | "svg") => {
    if (qrCode.current) {
      qrCode.current.download({
        name: "qr-code",
        extension: type,
      });
    }
  };

  const handleDownloadWithoutPremium = () => {
    // Remove premium features and download
    const tempLogo = logo;
    const tempGradient = useGradient;
    
    setLogo(null);
    setUseGradient(false);
    setShowPaywall(false);
    
    // Wait for state update and QR regeneration
    setTimeout(() => {
      doDownload("png");
      // Restore settings for preview
      setLogo(tempLogo);
      setUseGradient(tempGradient);
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <Card className="p-6 space-y-6">
          <div>
            <Label htmlFor="url">Enter URL or Text</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-website.com"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fgColor">Foreground Color</Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="color"
                  id="fgColor"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bgColor">Background Color</Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="color"
                  id="bgColor"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload - Works for everyone! */}
          <div>
            <Label htmlFor="logo">Add Logo (Preview Free!)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="flex-1"
              />
              {logo && (
                <Button variant="outline" onClick={() => setLogo(null)}>
                  Remove
                </Button>
              )}
            </div>
            {logo && !isPremium && (
              <p className="text-sm text-amber-600 mt-1">
                ✨ Logo preview is free! Upgrade to download with logo.
              </p>
            )}
          </div>

          {/* Gradient Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="gradient"
                checked={useGradient}
                onChange={(e) => setUseGradient(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="gradient">Use Gradient</Label>
            </div>
            {useGradient && (
              <input
                type="color"
                value={gradientColor}
                onChange={(e) => setGradientColor(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
            )}
            {useGradient && !isPremium && (
              <span className="text-sm text-amber-600">✨ Pro feature</span>
            )}
          </div>

          {/* Download Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => handleDownload("png")}
              className="flex-1"
            >
              Download PNG
            </Button>
            <Button
              onClick={() => handleDownload("svg")}
              variant="outline"
              className="flex-1"
            >
              Download SVG {!isPremium && "✨"}
            </Button>
          </div>

          {isPremium && (
            <div className="text-center text-sm text-green-600 font-medium">
              ✨ Pro Activated — All features unlocked!
            </div>
          )}
        </Card>

        {/* QR Preview */}
        <Card className="p-6 flex flex-col items-center justify-center bg-gray-50">
          <div
            ref={qrRef}
            className="bg-white p-4 rounded-lg shadow-sm"
          />
          <p className="text-sm text-gray-500 mt-4">
            Live Preview
          </p>
        </Card>
      </div>

      {/* Paywall Dialog */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🎉 Your QR looks amazing!</DialogTitle>
            <DialogDescription>
              You&apos;re using premium features. Unlock them forever for just $9.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="font-medium">Premium features you&apos;re using:</p>
              <ul className="text-sm space-y-1">
                {logo && <li>✓ Custom logo embedding</li>}
                {useGradient && <li>✓ Gradient colors</li>}
                {wantsSvg && <li>✓ SVG export</li>}
              </ul>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <p className="font-bold text-lg">Unlock Pro — $9 one-time</p>
              <ul className="text-sm mt-2 space-y-1 text-gray-600">
                <li>✓ Logo embedding forever</li>
                <li>✓ Gradient colors</li>
                <li>✓ SVG downloads</li>
                <li>✓ Lifetime access</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <a href={STRIPE_PAYMENT_URL}>
                  Pay $9 & Download
                </a>
              </Button>
              <Button
                variant="ghost"
                onClick={handleDownloadWithoutPremium}
                className="w-full text-gray-500"
              >
                Download without premium features (free)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
