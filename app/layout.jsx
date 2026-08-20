import '../styles/globals.css';

// App Router Metadata replacing Pages Router <Head>
export const metadata = {
  title: 'Olympus | Nexus Vortex',
  description: 'The Grand Multiverse Directory for nexusvortex.ca',
};

// Next.js 14+ Mobile Viewport Configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-white selection:bg-cyan-500 selection:text-black antialiased">
        {children}
      </body>
    </html>
  );
}
