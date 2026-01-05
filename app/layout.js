import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata = {
  title: "SI Manajemen rapat trilogi",
  description: "Aplikasi manajemen agenda rapat dan notulensi Universitas Trilogi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased bg-sky-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
