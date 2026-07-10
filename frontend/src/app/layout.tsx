import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ToastContainer } from "@/components/common/Toast";

const SITE_NAME = "Thai EduData Insight";
const SITE_DESC =
  "ศูนย์รวมข้อมูลการศึกษาไทย ค้นหา ดาวน์โหลด และวิเคราะห์ชุดข้อมูลจากหน่วยงานภาครัฐ";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://167.99.67.27";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESC,
    siteName: SITE_NAME,
    locale: "th_TH",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="font-sarabun bg-surface-page" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(location.hostname==='localhost'){location.replace(location.href.replace('//localhost','//127.0.0.1'));}",
          }}
        />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
