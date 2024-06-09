import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: "%s | Setemi's Acme Dashboard",
    default: "Setemi's Acme Dashboard",
  },
  description:
    'The official Next.js Learn Dashboard built with App Router by Oluwasetemi',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}

export default RootLayout;
