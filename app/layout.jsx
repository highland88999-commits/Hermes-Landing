import '../styles/globals.css';

// This replaces the <Head> tags from the Pages router
export const metadata = {
  title: 'Olympus | Nexus Vortex',
  description: 'The Grand Multiverse Directory for nexusvortex.ca',
};

// Controls the mobile viewport scaling for your canvas
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
