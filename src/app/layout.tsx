import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DamKoto BD (Best Deal Finder) | বাংলাদেশের সেরা টেক ও ডিজিটাল পণ্য মূল্য তুলনা প্ল্যাটফর্ম",
  description: "Star Tech, Ryans, Techland, Walton, Samanta সহ ২২+ বিশ্বস্ত বাংলাদেশী টেক ও ডিজিটাল শপ থেকে লাইভ মূল্য তুলনা করে সেরা অফারে কিনুন। ০% স্ক্যাম গ্যারান্টি।",
  keywords: ["DamKoto BD", "Best Deal Finder", "দামকত বিডি", "Price Comparison Bangladesh", "Star Tech", "Ryans", "Techland", "Walton", "Tech Price BD"],
  openGraph: {
    title: "DamKoto BD (Best Deal Finder) | বাংলাদেশের সেরা মূল্য তুলনা প্ল্যাটফর্ম",
    description: "২২+ বিশ্বস্ত বাংলাদেশী টেক ও ডিজিটাল শপ থেকে লাইভ মূল্য তুলনা করে কিনুন সবচেয়ে সাশ্রয়ী মূল্যে।",
    siteName: "DamKoto BD",
    type: "website",
    locale: "bn_BD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
