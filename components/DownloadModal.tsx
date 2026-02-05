'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/test_4gM9AM7Wtdc6eeacQ73F600';

interface DownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasPremiumFeatures: boolean;
  premiumFeatures: string[];
  onDownloadFree: () => void;
  onDownloadPremium: () => void;
  isPro: boolean;
  downloadFormat: 'png' | 'svg';
}

export default function DownloadModal({
  open,
  onOpenChange,
  hasPremiumFeatures,
  premiumFeatures,
  onDownloadFree,
  onDownloadPremium,
  isPro,
  downloadFormat,
}: DownloadModalProps) {
  const handleDownloadFree = () => {
    onDownloadFree();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            🎉 Your QR looks amazing!
          </DialogTitle>
          <DialogDescription>
            You&apos;ve designed a QR code with premium features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Premium features used */}
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="font-medium text-purple-900 mb-2">
              Premium features you&apos;re using:
            </p>
            <ul className="space-y-1">
              {premiumFeatures.map((feature, i) => (
                <li key={i} className="text-sm text-purple-700 flex items-center gap-2">
                  <span className="text-purple-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro offer */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-purple-900">$9</span>
              <span className="text-purple-600">one-time</span>
            </div>
            <p className="text-sm text-purple-700 mb-3">
              Unlock all premium features forever:
            </p>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>✓ Custom logo in QR codes</li>
              <li>✓ Beautiful gradient colors</li>
              <li>✓ SVG vector downloads</li>
              <li>✓ Unlimited QR codes</li>
              <li>✓ Lifetime access</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <a href={`${STRIPE_PAYMENT_URL}?prefilled_email=`}>
                Pay $9 & Download with Premium
              </a>
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleDownloadFree}
              className="w-full text-gray-500 hover:text-gray-700"
            >
              Download without premium features (free)
            </Button>
          </div>

          <p className="text-xs text-center text-gray-400">
            Secure payment via Stripe • Instant access
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
