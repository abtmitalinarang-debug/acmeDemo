import Link from "next/link";
import AcmeStoreLogo from "../../lib/icons/acme-store-logo";

export default function Footer() {
  const footerLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Shipping & Return Policy", href: "/shipping" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <footer className="w-full bg-zinc-100 dark:bg-zinc-900 text-sm text-neutral-500 dark:text-neutral-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 border-t border-zinc-200 px-6 py-12 text-sm md:flex-row md:gap-12 md:px-4 min-[1320px]:px-0">
        <div className="flex flex-col md:flex-row justify-between py-12 items-start w-full">
          <div className="flex flex-col md:flex-row md:gap-24 gap-8">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white">
                <AcmeStoreLogo />
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white uppercase text-sm">
                ACME STORE
              </span>
            </div>

            <ul className="flex flex-col space-y-4">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 md:mt-0">
            <a
              href="#"
              className="flex items-stretch rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <span className="flex items-center border-r border-neutral-200 dark:border-neutral-700 px-3 text-[10px]">
                ▲
              </span>
              <span className="flex items-center px-3 py-2">Deploy</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 w-full">
        <div className="w-full px-4 flex flex-col md:flex-row items-center justify-between py-6 text-xs text-neutral-500 mx-w-auto">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span>© 2023-2026 ACME, Inc. All rights reserved.</span>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <a
              href="#"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              View the source
            </a>
          </div>
          <div>
            Created by{" "}
            <span className="text-neutral-900 dark:text-white">▲ Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
