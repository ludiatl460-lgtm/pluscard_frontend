import type { Metadata } from "next";
import { Noto_Sans_Lao } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";


const noto_sans_lao = Noto_Sans_Lao({
  subsets: ["lao"],
  weight: ["300", "400", "500", "600", "700"], 
  variable: "--font-noto-sans-lao",
});

export const metadata: Metadata = {
  title: "Plus-Card Reconciliation",
  description: "ລະບົບທຽບຍອດທຸລະກຳບັດນໍ້າມັນ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="lo"
      className={`${noto_sans_lao.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
         <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        /> 
      </body>
    </html>
  );
}