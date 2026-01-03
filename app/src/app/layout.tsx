import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

// Google Analytics ID - Replace with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

export const metadata: Metadata = {
  title: {
    default: "Harper Slone Designs",
    template: "%s | Harper Slone Designs",
  },
  description: "Visual artist, photographer, and creative director based in Paris. Specializing in image, video, identity, brand design, and creative direction. Available worldwide.",
  keywords: ["Harper Slone", "visual artist", "photographer", "Paris", "creative director", "brand design", "identity design", "graphic design", "art direction"],
  authors: [{ name: "Harper Slone" }],
  creator: "Harper Slone",
  publisher: "Harper Slone Designs",
  metadataBase: new URL("https://www.harperslone.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Harper Slone Designs",
    description: "Visual artist, photographer, and creative director based in Paris. Specializing in image, video, identity, brand design, and creative direction.",
    url: "https://www.harperslone.com",
    siteName: "Harper Slone Designs",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Harper Slone Designs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Harper Slone Designs",
    description: "Visual artist, photographer, and creative director based in Paris",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="canonical" href="https://www.harperslone.com" />
        
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Harper Slone",
              "url": "https://www.harperslone.com",
              "jobTitle": "Visual Artist & Photographer",
              "worksFor": {
                "@type": "Organization",
                "name": "Harper Slone Designs"
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Paris",
                "addressCountry": "France"
              },
              "sameAs": []
            }),
          }}
        />
      </head>
      <body
        className="antialiased"
      >
        <CustomCursor />
        {children}
        
        {/* Four Dots - Return to Home (Right Bottom) - Cross Formation - Always Visible */}
        <div className="fixed bottom-4 right-4 z-50" style={{ 
          width: '32px', 
          height: '32px'
        }}>
          <Link href="/" className="absolute rounded-full hover:opacity-80 transition-opacity" style={{ 
            backgroundColor: '#bfdbfe',
            width: '12px',
            height: '12px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translateY(-10px)'
          }} title="Return to home">
          </Link>
          <Link href="/" className="absolute rounded-full hover:opacity-80 transition-opacity" style={{ 
            backgroundColor: '#86efac',
            width: '12px',
            height: '12px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translate(-10px, 0px)'
          }} title="Return to home">
          </Link>
          <Link href="/" className="absolute rounded-full hover:opacity-80 transition-opacity" style={{ 
            backgroundColor: '#fef08a',
            width: '12px',
            height: '12px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translate(10px, 0px)'
          }} title="Return to home">
          </Link>
          <Link href="/" className="absolute rounded-full hover:opacity-80 transition-opacity" style={{ 
            backgroundColor: '#fce7f3',
            width: '12px',
            height: '12px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translateY(10px)'
          }} title="Return to home">
          </Link>
        </div>
      </body>
    </html>
  );
}
