import type { Metadata, Viewport } from 'next';
import { Inter, Assistant } from 'next/font/google';
import { redirect } from 'next/navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const assistant = Assistant({
  subsets: ['hebrew'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hebrew',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'zman - Family Schedule',
  description: 'Manage family schedules for kindergarten, school, and activities - works offline, syncs automatically',
  keywords: ['schedule', 'family calendar', 'kindergarten', 'school', 'PWA', 'offline'],
  authors: [{ name: 'zman' }],
  creator: 'zman',
  publisher: 'zman',
  robots: 'index, follow',
  openGraph: {
    title: 'zman - Family Schedule',
    description: 'Manage family schedules for kindergarten, school, and activities',
    type: 'website',
    locale: 'en_US',
    siteName: 'zman',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'zman - Family Schedule',
    description: 'Manage family schedules for kindergarten, school, and activities',
  },
  icons: {
    icon: '/icons/icon-192.png',
    shortcut: '/icons/icon-96.png',
    apple: '/icons/icon-192.png',
  },
  manifest: '/manifest.json',
  themeColor: '#f59e0b',
};

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout() {
  redirect('/en');
}