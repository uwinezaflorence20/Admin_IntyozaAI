import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: {
    default: "Intyoza Admin",
    template: "%s | Intyoza Admin",
  },
  description: "Admin console for Intyoza, the youth sexual and reproductive health platform.",
  icons: {
    icon: "/favicon.svg",
    apple: "/logo.png",
  },
  robots: { index: false, follow: false },
};

// Applies the saved light/dark choice before first paint, so the page never flashes.
const themeScript = `try{var t=localStorage.getItem('intyoza.theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
