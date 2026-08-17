#!/usr/bin/env tsx
import { generateKeyPairSync } from 'crypto';

function generateVapidKeys() {
  const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
  });

  const privateKeyBase64 = privateKey.export({ type: 'pkcs8', format: 'der' });
  const publicKeyBase64 = publicKey.export({ type: 'spki', format: 'der' });

  function toBase64Url(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  const privateKeyUrl = toBase64Url(privateKeyBase64);
  const publicKeyUrl = toBase64Url(publicKeyBase64);

  console.log('VAPID Keys Generated:');
  console.log('Add these to your .env.local:');
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKeyUrl}`);
  console.log(`VAPID_PRIVATE_KEY=${privateKeyUrl}`);
}

generateVapidKeys();