import './globals.css';

export const metadata = {
  title: 'WhatsApp AI Bot - Control Panel',
  robots: { index: false, follow: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0d10',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
