import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en", "ro", "hr"],
  defaultLocale: "de",
  localePrefix: "always",
});
