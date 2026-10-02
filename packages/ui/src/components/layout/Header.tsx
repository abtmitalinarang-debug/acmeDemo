import AcmeStoreLogo from "../../lib/icons/acme-store-logo";
import CartIcon from "../../lib/icons/cart-icon";
import { Input } from "../ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search02Icon } from "@hugeicons/core-free-icons";
import CartSheet from "../CartSheet";
import { Button } from "../button";
import Link from "next/link";
import RouteLinks from "@repo/utils/route-links";
import { absoluteUrl } from "@repo/utils/navigate";
import HamBurger from "../../lib/icons/hamburger";

export default function Header() {
  const navs = [
    {
      href: "/all",
      title: "All",
    },
    {
      href: "/shirts",
      title: "Shirts",
    },
    {
      href: "/stickers",
      title: "Stickers",
    },
  ];
  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <Button
          aria-label="Open mobile menu"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
        >
          <HamBurger />
        </Button>
      </div>

      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href={absoluteUrl(RouteLinks.website)}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl  border-b-stone-700 dark:bg-black">
              <AcmeStoreLogo />
            </div>

            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block text-muted">
              Acme Store
            </div>
          </Link>

          <ul className="hidden gap-6 text-sm md:flex md:items-center">
            {navs?.map((nav) => {
              return (
                <li>
                  <Link
                    href={nav.href}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {nav.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="hidden justify-center md:flex md:w-1/3">
          <div className="relative w-full max-w-[550px] lg:w-80 xl:w-full">
            <Input
              type="text"
              name="q"
              placeholder="Search for products..."
              autoComplete="off"
              className="w-full rounded-lg  bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
            />

            <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
              <HugeiconsIcon icon={Search02Icon} className="text-muted" />
            </div>
          </div>
        </div>

        <div className="flex justify-end md:w-1/3">
          <CartSheet>
            <Button
              aria-label="Open cart"
              variant={"default"}
              className="bg-foreground relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
            >
              <CartIcon />

              <span className="absolute right-0 top-0 -mr-2 -mt-2 h-4 w-4 rounded-sm bg-blue-600 text-[11px] font-medium text-white">
                3
              </span>
            </Button>
          </CartSheet>
        </div>
      </div>
    </nav>
  );
}
