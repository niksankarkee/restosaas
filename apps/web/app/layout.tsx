import './globals.css';
import { CommonLayout } from '@/components/common-layout';
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='min-h-screen bg-gray-50'>
        <AuthProvider>
          <CommonLayout>{children}</CommonLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
