import "./globals.css";
import { ToastContainer } from "@/components/common/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="font-sarabun bg-surface-page" suppressHydrationWarning>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
