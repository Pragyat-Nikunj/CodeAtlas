import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/providers/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CodeAtlas AI | Smart Documentation',
  description:
    'AI-driven architectural maps and security audits for your GitHub repositories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-50">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col bg-slate-800">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
