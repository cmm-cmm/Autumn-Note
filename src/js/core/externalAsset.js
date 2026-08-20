/**
 * Applies the host application's security policy to a dynamically injected
 * script or stylesheet. Keeping this in one place prevents optional CDN-backed
 * modules from drifting into different CSP/referrer behaviour.
 * @param {HTMLScriptElement|HTMLLinkElement} element
 * @param {{ cspNonce?: string, externalAssetCrossOrigin?: string, externalAssetReferrerPolicy?: string }} options
 */
export function secureExternalAsset(element, options = {}) {
  if (options.cspNonce) element.nonce = options.cspNonce;
  const crossOrigin = options.externalAssetCrossOrigin ?? 'anonymous';
  const referrerPolicy = options.externalAssetReferrerPolicy ?? 'no-referrer';
  if (crossOrigin) element.crossOrigin = crossOrigin;
  if (referrerPolicy) element.referrerPolicy = referrerPolicy;
  return element;
}
