import { secureExternalAsset } from '../../src/js/core/externalAsset.js';

describe('secureExternalAsset', () => {
  it('applies CSP and request privacy options to scripts and stylesheets', () => {
    for (const element of [document.createElement('script'), document.createElement('link')]) {
      expect(secureExternalAsset(element, {
        cspNonce: 'request-nonce',
        externalAssetCrossOrigin: 'anonymous',
        externalAssetReferrerPolicy: 'no-referrer',
      })).toBe(element);
      expect(element.nonce).toBe('request-nonce');
      expect(element.crossOrigin).toBe('anonymous');
      expect(element.referrerPolicy).toBe('no-referrer');
    }
  });

  it('uses privacy-preserving defaults and lets the host opt out', () => {
    const script = document.createElement('script');
    secureExternalAsset(script);
    expect(script.hasAttribute('nonce')).toBe(false);
    expect(script.crossOrigin).toBe('anonymous');
    expect(script.referrerPolicy).toBe('no-referrer');

    const optedOut = document.createElement('script');
    secureExternalAsset(optedOut, {
      externalAssetCrossOrigin: '',
      externalAssetReferrerPolicy: '',
    });
    expect(optedOut.crossOrigin).toBeNull();
    expect(optedOut.hasAttribute('referrerpolicy')).toBe(false);
  });
});
