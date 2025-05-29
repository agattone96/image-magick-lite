import MainLayout from '@/components/layout/MainLayout';
import '@/styles/globals.css'; // Assuming you have a global CSS file
import { AppContextProvider } from '@/hooks/useAppContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppContextProvider>
          <MainLayout>{children}</MainLayout>
        </AppContextProvider>
      </body>
    </html>
  );
}
