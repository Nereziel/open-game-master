import { LocaleApplier, LocaleProvider } from "@/lib/locale";
import { localeTag } from "@/lib/messages-logic";
// The server renders a French page with the catalog in hand (translate.ts).
import "@/lib/i18n/server-catalogs";
import { getGlobalConfig } from "@/lib/db/app-settings";
import { LOCALE_COOKIE, localeOfServerLanguage, resolveLocale } from "@/lib/i18n/locale";
import { ThemeApplier } from "@/lib/theme-mode";
import { ThemePanelHost } from "@/components/ThemePanelHost";
import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import TopoBackground from "./TopoBackground";
import { ServerAddressButton } from "@/components/ServerAddressButton";
import { ConfirmHost } from "@/components/ui/ConfirmDialog";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Game Master",
  description: "Multiplayer D&D 5e campaigns with an AI Game Master.",
  applicationName: "Open Game Master",
  appleWebApp: {
    capable: true,
    title: "Open GM",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#181420",
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  // A French server opens in French for a reader who chose nothing.
  const serverLocale = localeOfServerLanguage(getGlobalConfig().serverLanguage);
  const initialLocale = resolveLocale({
    savedLocale: cookieStore.get(LOCALE_COOKIE)?.value ?? null,
    serverLocale,
    acceptLanguage: headerStore.get("accept-language"),
  });
  return (
    <html
      lang={localeTag(initialLocale)}
      className="h-full antialiased"
      // browser extensions (Grammarly among them) inject attributes into <html>
      // and <body> before React loads
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* The reader's theme and scale, applied to <html> before anything
            else paints (docs/vtt-parity-implementation-plan.md section 14). */}
        <ThemeApplier />
        <ThemePanelHost />
        {/* The reader's language, the same on-device contract: the stored
            choice (or the browser's) lands on <html lang> before paint. */}
        <LocaleApplier />
        {/* Dust motes first, so the contour canvas is drawn over them. */}
        <div className="ambient-dust" aria-hidden="true" />
        <TopoBackground />
        <LocaleProvider initialLocale={initialLocale} serverLocale={serverLocale}>
          {children}
          {/* Every page: the QR and address a friend scans to add this server
              in the app or open it in a browser on the same network. */}
          <ServerAddressButton />
          {/* The app's own confirm and notice, asked from anywhere. */}
          <ConfirmHost />
        </LocaleProvider>
      </body>
    </html>
  );
}
