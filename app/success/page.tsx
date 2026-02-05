'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Payment Link only redirects here on successful payment
    // So we can safely activate Pro status
    localStorage.setItem('qr_pro', 'true');
    localStorage.setItem('qr_pro_date', new Date().toISOString());
    
    // Check if there's a pending QR config to restore
    const pendingConfig = localStorage.getItem('qr_pending_config');
    if (pendingConfig) {
      // Auto-redirect to home with restore flag after a brief delay
      setTimeout(() => {
        router.push('/?restored=true');
      }, 2000);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="text-6xl mb-4">🎉</div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Pro!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            You now have lifetime access to all premium features!
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Custom logos in QR codes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Gradient colors</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>SVG export (vector format)</span>
            </div>
          </div>

          <Button 
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            Create Your QR Code →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
