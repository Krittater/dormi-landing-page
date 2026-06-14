import type { Metadata, Viewport } from 'next';
import { Kanit, Sarabun } from 'next/font/google';
import './globals.css';

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const sarabun = Sarabun({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'dormi Link and Rent — ระบบบริหารหอพักอัจฉริยะ',
  description:
    'ยกระดับการจัดการหอพักด้วย dormi Link and Rent ระบบที่ออกแบบมาเพื่อเจ้าของและผู้ดูแล ตั้งแต่การทำสัญญา จัดการบิล ไปจนถึงงานซ่อมบำรุง',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#059669',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${kanit.variable} ${sarabun.variable}`}>
      <body>{children}</body>
    </html>
  );
}
