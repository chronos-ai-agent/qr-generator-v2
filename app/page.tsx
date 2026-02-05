'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import QRPreview from '@/components/QRPreview';
import DownloadModal from '@/components/DownloadModal';
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import { Toaster, toast } from 'sonner';

// Color presets
const colorPresets = [
  { name: 'Minimal', fg: '#000000', bg: '#ffffff', gradient: false, g1: '#000000', g2: '#000000' },
  { name: 'Ocean', fg: '#0077b6', bg: '#ffffff', gradient: true, g1: '#0077b6', g2: '#00b4d8' },
  { name: 'Sunset', fg: '#f97316', bg: '#fffbeb', gradient: true, g1: '#f97316', g2: '#ec4899' },
  { name: 'Forest', fg: '#16a34a', bg: '#f0fdf4', gradient: true, g1: '#16a34a', g2: '#84cc16' },
  { name: 'Royal', fg: '#7c3aed', bg: '#faf5ff', gradient: true, g1: '#7c3aed', g2: '#c026d3' },
  { name: 'Midnight', fg: '#1e3a5f', bg: '#f8fafc', gradient: true, g1: '#1e3a5f', g2: '#475569' },
];

// Style options
const dotStyles: { value: DotType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
];

const cornerSquareStyles: { value: CornerSquareType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'dot', label: 'Dot' },
];

const cornerDotStyles: { value: CornerDotType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
];

export default function Home() {
  const [url, setUrl] = useState('https://example.com');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logo, setLogo] = useState<string | null>(null);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor1, setGradientColor1] = useState('#6366f1');
  const [gradientColor2, setGradientColor2] = useState('#ec4899');
  const [dotStyle, setDotStyle] = useState<DotType>('rounded');
  const [cornerSquareStyle, setCornerSquareStyle] = useState<CornerSquareType>('extra-rounded');
  const [cornerDotStyle, setCornerDotStyle] = useState<CornerDotType>('dot');
  const [isPro, setIsPro] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png');
  const [activeTab, setActiveTab] = useState('basic');
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

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setFgColor(preset.fg);
    setBgColor(preset.bg);
    setUseGradient(preset.gradient);
    if (preset.gradient) {
      setGradientColor1(preset.g1);
      setGradientColor2(preset.g2);
    }
    toast.success(`Applied "${preset.name}" preset`);
  };

  const createQRForDownload = useCallback((includePremium: boolean) => {
    return new QRCodeStyling({
      width: 1024,
      height: 1024,
      data: url || 'https://example.com',
      dotsOptions: (includePremium && useGradient)
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
        color: (includePremium && useGradient) ? gradientColor1 : fgColor,
      },
      cornersDotOptions: {
        type: cornerDotStyle,
        color: (includePremium && useGradient) ? gradientColor2 : fgColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 20,
        imageSize: 0.4,
      },
      image: (includePremium && logo) ? logo : undefined,
    });
  }, [url, fgColor, bgColor, logo, useGradient, gradientColor1, gradientColor2, dotStyle, cornerSquareStyle, cornerDotStyle]);

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
    const premiumUsed = logo !== null || useGradient || format === 'svg';
    
    if (isPro || !premiumUsed) {
      const qr = createQRForDownload(isPro);
      qr.download({ name: isPro ? 'qr-code-pro' : 'qr-code', extension: format });
      toast.success(`QR code downloaded as ${format.toUpperCase()}!`);
    } else {
      setShowModal(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Toaster position="top-center" richColors />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            QR Code Studio
          </h1>
          <p className="text-gray-500 text-lg">Create stunning, customized QR codes in seconds</p>
          {isPro && (
            <span className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-medium rounded-full shadow-lg shadow-purple-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              Pro User
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Controls - 3 columns */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                      Basic
                    </TabsTrigger>
                    <TabsTrigger value="style" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                      Style
                    </TabsTrigger>
                    <TabsTrigger value="colors" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                      Colors
                    </TabsTrigger>
                    <TabsTrigger value="logo" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                      Logo
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Tab */}
                  <TabsContent value="basic" className="space-y-6 mt-0 animate-in fade-in-50 duration-300">
                    <div className="space-y-3">
                      <Label htmlFor="url" className="text-base font-medium">Content</Label>
                      <Input
                        id="url"
                        type="text"
                        placeholder="Enter URL, text, or any data..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="text-lg h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      />
                      <p className="text-sm text-slate-500">This is what your QR code will contain when scanned.</p>
                    </div>
                  </TabsContent>

                  {/* Style Tab */}
                  <TabsContent value="style" className="space-y-6 mt-0 animate-in fade-in-50 duration-300">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Dot Style</Label>
                      <Select value={dotStyle} onValueChange={(v) => setDotStyle(v as DotType)}>
                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dotStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-slate-500">The shape of the data dots in your QR code.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Corner Squares</Label>
                        <Select value={cornerSquareStyle} onValueChange={(v) => setCornerSquareStyle(v as CornerSquareType)}>
                          <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {cornerSquareStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">Corner Dots</Label>
                        <Select value={cornerDotStyle} onValueChange={(v) => setCornerDotStyle(v as CornerDotType)}>
                          <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {cornerDotStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Colors Tab */}
                  <TabsContent value="colors" className="space-y-6 mt-0 animate-in fade-in-50 duration-300">
                    {/* Presets */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Quick Presets</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {colorPresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => applyPreset(preset)}
                            className="group relative p-3 rounded-xl border-2 border-slate-200 hover:border-purple-400 hover:shadow-md transition-all duration-200"
                          >
                            <div 
                              className="w-full h-8 rounded-lg mb-2"
                              style={{ 
                                background: preset.gradient 
                                  ? `linear-gradient(135deg, ${preset.g1}, ${preset.g2})`
                                  : preset.fg 
                              }}
                            />
                            <span className="text-xs font-medium text-slate-600 group-hover:text-purple-600 transition-colors">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">QR Color</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="w-12 h-11 rounded-lg cursor-pointer border-2 border-slate-200 hover:border-purple-400 transition-colors"
                          />
                          <Input
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="flex-1 font-mono text-sm h-11 bg-slate-50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Background</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-12 h-11 rounded-lg cursor-pointer border-2 border-slate-200 hover:border-purple-400 transition-colors"
                          />
                          <Input
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="flex-1 font-mono text-sm h-11 bg-slate-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient Toggle */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium flex items-center gap-2">
                            Gradient Mode
                            {!isPro && <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">Pro</span>}
                          </Label>
                          <p className="text-sm text-slate-500 mt-0.5">Apply a beautiful gradient to your QR code</p>
                        </div>
                        <Switch
                          checked={useGradient}
                          onCheckedChange={setUseGradient}
                        />
                      </div>
                      
                      {useGradient && (
                        <div className="grid grid-cols-2 gap-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={gradientColor1}
                              onChange={(e) => setGradientColor1(e.target.value)}
                              className="w-11 h-11 rounded-lg cursor-pointer border-2 border-slate-200"
                            />
                            <Input
                              value={gradientColor1}
                              onChange={(e) => setGradientColor1(e.target.value)}
                              className="flex-1 font-mono text-sm h-11 bg-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={gradientColor2}
                              onChange={(e) => setGradientColor2(e.target.value)}
                              className="w-11 h-11 rounded-lg cursor-pointer border-2 border-slate-200"
                            />
                            <Input
                              value={gradientColor2}
                              onChange={(e) => setGradientColor2(e.target.value)}
                              className="flex-1 font-mono text-sm h-11 bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Logo Tab */}
                  <TabsContent value="logo" className="space-y-6 mt-0 animate-in fade-in-50 duration-300">
                    <div className="space-y-3">
                      <Label className="text-base font-medium flex items-center gap-2">
                        Center Logo
                        {!isPro && <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">Pro</span>}
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      {logo ? (
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                          <img src={logo} alt="Logo preview" className="w-16 h-16 object-contain rounded-lg bg-white p-2 shadow-sm" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-700">Logo uploaded</p>
                            <p className="text-sm text-slate-500">Will appear in center of QR code</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={removeLogo} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200 group"
                        >
                          <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-purple-600 transition-colors">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">Click to upload logo</span>
                            <span className="text-sm">PNG, JPG, or SVG</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Download Buttons */}
                <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
                  <Button
                    onClick={() => handleDownload('png')}
                    className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PNG
                  </Button>
                  <Button
                    onClick={() => handleDownload('svg')}
                    variant="outline"
                    className="w-full h-12 text-base border-2 hover:bg-slate-50"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Download SVG
                    {!isPro && <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">Pro</span>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview - 2 columns */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="p-4 bg-white rounded-2xl shadow-inner">
                    <QRPreview
                      url={url}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      logo={logo}
                      useGradient={useGradient}
                      gradientColor1={gradientColor1}
                      gradientColor2={gradientColor2}
                      dotStyle={dotStyle}
                      cornerSquareStyle={cornerSquareStyle}
                      cornerDotStyle={cornerDotStyle}
                    />
                  </div>
                </CardContent>
              </Card>
              <p className="mt-4 text-center text-sm text-slate-400">
                Changes update instantly
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-slate-400">
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
