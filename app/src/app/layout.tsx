import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Portfolio Archive",
  description: "Experimental portfolio inspired by David Carson and BLESS Service",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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
