'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import QRPreview from '@/components/QRPreview';
import DownloadModal from '@/components/DownloadModal';
import QRCodeStyling from 'qr-code-styling';
import { Toaster, toast } from 'sonner';

export default function Home() {
  const [url, setUrl] = useState('https://example.com');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logo, setLogo] = useState<string | null>(null);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor1, setGradientColor1] = useState('#6366f1');
  const [gradientColor2, setGradientColor2] = useState('#ec4899');
  const [isPro, setIsPro] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const proStatus = localStorage.getItem('qr_pro') === 'true';
    setIsPro(proStatus);
    
    const params = new URLSearchParams(window.location.search);
    
    // Check for canceled payment
    if (params.get('canceled') === 'true') {
      toast.error('Payment was canceled');
      window.history.replaceState({}, '', '/');
    }
    
    // Check for restored config after payment
    if (params.get('restored') === 'true') {
      const savedConfig = localStorage.getItem('qr_pending_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          setUrl(config.url || 'https://example.com');
          setFgColor(config.fgColor || '#000000');
          setBgColor(config.bgColor || '#ffffff');
          setLogo(config.logo || null);
          setUseGradient(config.useGradient || false);
          setGradientColor1(config.gradientColor1 || '#6366f1');
          setGradientColor2(config.gradientColor2 || '#ec4899');
          
          // Clear the saved config
          localStorage.removeItem('qr_pending_config');
          
          toast.success('Your QR code design has been restored! Download with Pro features now.');
        } catch (e) {
          console.error('Failed to restore QR config:', e);
        }
      }
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const hasPremiumFeatures = logo !== null || useGradient || downloadFormat === 'svg';
  
  const getPremiumFeatures = () => {
    const features: string[] = [];
    if (logo) features.push('Custom logo in QR code');
    if (useGradient) features.push('Gradient colors');
    if (downloadFormat === 'svg') features.push('SVG vector export');
    return features;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        toast.success('Logo added! It will appear in your QR code.');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createQRForDownload = useCallback((includePremium: boolean) => {
    return new QRCodeStyling({
      width: 1024,
      height: 1024,
      data: url || 'https://example.com',
      dotsOptions: (includePremium && useGradient)
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
        color: (includePremium && useGradient) ? gradientColor1 : fgColor,
      },
      cornersDotOptions: {
        type: 'dot',
        color: (includePremium && useGradient) ? gradientColor2 : fgColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 20,
        imageSize: 0.4,
      },
      image: (includePremium && logo) ? logo : undefined,
    });
  }, [url, fgColor, bgColor, logo, useGradient, gradientColor1, gradientColor2]);

  const handleDownloadFree = useCallback(() => {
    const qr = createQRForDownload(false);
    qr.download({ name: 'qr-code', extension: 'png' });
    toast.success('QR code downloaded (basic version)');
  }, [createQRForDownload]);

  const handleDownloadPremium = useCallback(() => {
    const qr = createQRForDownload(true);
    qr.download({ name: 'qr-code-pro', extension: downloadFormat });
    toast.success(`QR code downloaded as ${downloadFormat.toUpperCase()}!`);
  }, [createQRForDownload, downloadFormat]);

  const handleDownload = (format: 'png' | 'svg') => {
    setDownloadFormat(format);
    
    // Check if trying to use premium features
    const premiumUsed = logo !== null || useGradient || format === 'svg';
    
    if (isPro || !premiumUsed) {
      // Pro user or no premium features - just download
      const qr = createQRForDownload(isPro);
      qr.download({ name: isPro ? 'qr-code-pro' : 'qr-code', extension: format });
      toast.success(`QR code downloaded as ${format.toUpperCase()}!`);
    } else {
      // Show paywall modal
      setShowModal(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-center" richColors />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            QR Code Generator
          </h1>
          <p className="text-gray-600">Create beautiful, customized QR codes instantly</p>
          {isPro && (
            <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-full">
              ✨ Pro User
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6 space-y-6">
              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="url">URL or Text</Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="https://your-website.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fgColor">QR Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="fgColor"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="bgColor"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Gradient Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gradient" className="flex items-center gap-2">
                    Gradient Colors
                    {!isPro && <span className="text-xs text-purple-600">✨ Pro</span>}
                  </Label>
                  <button
                    id="gradient"
                    role="switch"
                    aria-checked={useGradient}
                    onClick={() => setUseGradient(!useGradient)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useGradient ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useGradient ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {useGradient && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border"
                      />
                      <Input
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border"
                      />
                      <Input
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Logo
                  {!isPro && <span className="text-xs text-purple-600">✨ Pro</span>}
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {logo ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={logo} alt="Logo preview" className="w-12 h-12 object-contain rounded" />
                    <span className="flex-1 text-sm text-gray-600">Logo added</span>
                    <Button variant="ghost" size="sm" onClick={removeLogo}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    Upload Logo
                  </Button>
                )}
              </div>

              {/* Download Buttons */}
              <div className="pt-4 space-y-3">
                <Button
                  onClick={() => handleDownload('png')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  Download PNG
                </Button>
                <Button
                  onClick={() => handleDownload('svg')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Download SVG
                  {!isPro && <span className="ml-2 text-xs text-purple-600">✨ Pro</span>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="flex flex-col items-center justify-center">
            <Card className="border-0 shadow-lg p-6 bg-white">
              <QRPreview
                url={url}
                fgColor={fgColor}
                bgColor={bgColor}
                logo={logo}
                useGradient={useGradient}
                gradientColor1={gradientColor1}
                gradientColor2={gradientColor2}
              />
            </Card>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Live preview • Changes appear instantly
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>Create unlimited QR codes • Premium features for just $9</p>
        </footer>
      </div>

      <DownloadModal
        open={showModal}
        onOpenChange={setShowModal}
        hasPremiumFeatures={hasPremiumFeatures}
        premiumFeatures={getPremiumFeatures()}
        onDownloadFree={handleDownloadFree}
        onDownloadPremium={handleDownloadPremium}
        isPro={isPro}
        downloadFormat={downloadFormat}
        qrConfig={{
          url,
          fgColor,
          bgColor,
          logo,
          useGradient,
          gradientColor1,
          gradientColor2,
        }}
      />
    </main>
  );
}
