import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}

export default RootLayout;
