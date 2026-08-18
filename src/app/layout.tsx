import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { getAppSettings } from "@/lib/queries/app-settings";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();
  return {
    title: settings.brandName,
    description: "Reuniões por vídeo com câmera, áudio e compartilhamento de tela.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getAppSettings();
  const brandStyle = {
    "--primary": settings.primaryColor,
    "--ring": settings.primaryColor,
    "--sidebar-primary": settings.primaryColor,
    "--sidebar-ring": settings.primaryColor,
  } as React.CSSProperties;

  return (
    <html
      lang="pt-BR"
      className={`dark ${inter.variable} h-full antialiased`}
      style={brandStyle}
    >
      <body className="app-gradient-bg min-h-full flex flex-col text-foreground">
        <TooltipProvider delay={200}>
          {children}
          <Toaster richColors position="top-right" theme="dark" />
        </TooltipProvider>
      </body>
    </html>
  );
}
