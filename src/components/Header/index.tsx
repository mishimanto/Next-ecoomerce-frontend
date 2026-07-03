"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CustomSelect from "./CustomSelect";
import { menuData } from "./menuData";
import Dropdown from "./Dropdown";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { updateproductDetails } from "@/redux/features/product-details";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "next/image";
import { getUser, logout as authLogout } from "@/services/auth";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { useCategories } from "@/hooks/useCategories";
import { fetchProductsPage } from "@/services/api";
import { Product } from "@/types/product";
import { getProductUrl } from "@/lib/product";
import { formatCurrency } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { FaRegHeart } from "react-icons/fa";
import {
  FiPhoneCall,
  FiSearch,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const siteSettings = useSiteSettings();
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const { openCartModal } = useCartModalContext();
  const categories = useCategories();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const product = useAppSelector((state) => state.cartReducer.items);
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const cartCount = product.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const cartBadge = formatBadgeCount(cartCount);
  const wishlistBadge = formatBadgeCount(wishlistCount);
  const normalizedSearchQuery = debouncedSearchQuery.trim();
  const { data: searchPage, isFetching: searchLoading } = useQuery({
    queryKey: ["products", "header-search", normalizedSearchQuery],
    queryFn: () =>
      fetchProductsPage({
        search: normalizedSearchQuery,
        perPage: 6,
      }),
    enabled: normalizedSearchQuery.length >= 2,
  });
  const searchResults = searchPage?.data || [];

  const handleOpenCartModal = () => {
    openCartModal();
  };

  const handleLogout = async () => {
    await authLogout();
    setUser(null);
    setAccountDropdownOpen(false);
  };

  const goToProduct = (item: Product) => {
    dispatch(updateproductDetails({ ...item }));
    setSearchQuery("");
    setSearchOpen(false);
    router.push(getProductUrl(item));
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (searchResults.length > 0) {
      goToProduct(searchResults[0]);
    }
  };

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);

    return () => window.removeEventListener("scroll", handleStickyMenu);
  });

  useEffect(() => {
    const syncUser = () => setUser(getUser());

    syncUser();
    window.addEventListener("auth-changed", syncUser);

    return () => window.removeEventListener("auth-changed", syncUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node)
      ) {
        setAccountDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { label: "All Categories", value: "0" },
    ...categories.map((category) => ({
      label: category.title,
      value: category.slug || category.id.toString(),
    })),
  ];

  const isMenuItemActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <header
      className={`fixed left-0 top-0 w-full z-9999 bg-[#1E293B]/95 text-white backdrop-blur transition-all ease-in-out duration-300 ${
        stickyMenu && "shadow-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-7.5 xl:px-0">
        {/* <!-- header top start --> */}
        <div
          className="flex items-center justify-between gap-3 py-4 ease-out duration-200 xl:gap-5 xl:py-5"
        >
          {/* <!-- header top left --> */}
          <div className="flex w-auto min-w-0 items-center">
            <Link
              className="flex h-10 flex-shrink-0 items-center overflow-hidden xl:h-11"
              href="/"
            >
              <Image
                src={siteSettings.logo || "/images/logo/logo.svg"}
                alt={siteSettings.project_name || "Logo"}
                width={180}
                height={44}
                priority
                unoptimized
                className="h-10 w-auto max-w-[170px] object-contain xl:h-11 xl:max-w-[190px]"
                style={{ width: "auto" }}
              />
            </Link>
          </div>

          {/* <!-- header top right --> */}
          <div className="flex w-auto items-center gap-3 sm:gap-5 xl:gap-7.5">
            <div className="hidden xl:flex items-center gap-3.5">
              <FiPhoneCall size={24} className="text-blue-200" />

              <div>
                {/* <span className="block text-2xs text-dark-4 uppercase">
                  24/7 SUPPORT
                </span> */}
                <p className="font-medium text-custom-sm text-white">
                  {siteSettings.support_phone || "(+965) 7492-3477"}
                </p>
              </div>
            </div>

            {/* <!-- divider --> */}
            <span className="hidden xl:block w-px h-7.5 bg-white/20"></span>

            <div className="flex w-auto items-center justify-end gap-3 sm:gap-5">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="relative" ref={accountDropdownRef}>
                  {user ? (
                    <button
                      type="button"
                      onClick={() =>
                        setAccountDropdownOpen((current) => !current)
                      }
                      className="flex items-center gap-2.5"
                      aria-expanded={accountDropdownOpen}
                      aria-haspopup="menu"
                      aria-label="Account menu"
                    >
                      <AccountAvatar user={user} />
                    </button>
                  ) : (
                    <Link href="/signin" className="flex items-center gap-2.5">
                      <AccountIcon />

                      <div className="hidden sm:block">
                        {/* <span className="block text-2xs text-dark-4 uppercase">
                          account
                        </span> */}
                        <p className="font-medium text-custom-sm text-white">
                          Sign In
                        </p>
                      </div>
                    </Link>
                  )}

                  {user && accountDropdownOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-3 w-[220px] rounded-lg border border-gray-3 bg-white shadow-2 py-2 z-99999"
                    >
                      <div className="px-4 py-3 border-b border-gray-3">
                        <p className="font-medium text-custom-sm text-dark truncate">
                          {user.name}
                        </p>                      
                      </div>

                      <Link
                        href="/my-account"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-4 py-2.5 text-custom-sm text-dark-2 hover:bg-blue-50 hover:text-blue-700"
                        role="menuitem"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/my-account"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-4 py-2.5 text-custom-sm text-dark-2 hover:bg-blue-50 hover:text-blue-700"
                        role="menuitem"
                      >
                        Orders
                      </Link>
                      <Link
                        href="/my-account"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-4 py-2.5 text-custom-sm text-dark-2 hover:bg-blue-50 hover:text-blue-700"
                        role="menuitem"
                      >
                        Account Details
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-custom-sm text-dark-2 hover:bg-blue-50 hover:text-blue-700"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleOpenCartModal}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-md text-white duration-200 hover:bg-white/10 hover:text-blue-100"
                  aria-label="Open cart"
                >
                  <FiShoppingCart
                    size={22}
                    className="text-white duration-200 group-hover:text-blue-100"
                  />

                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#df350b] px-1 text-[11px] font-bold leading-none text-white shadow-2">
                    {cartBadge}
                  </span>
                </button>

                <Link
                  href="/wishlist"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-md text-white duration-200 hover:bg-white/10 hover:text-blue-100"
                  aria-label="Wishlist"
                >
                  <FaRegHeart size={22} />

                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#eb390c] px-1 text-[11px] font-bold leading-none text-white shadow-2">
                    {wishlistBadge}
                  </span>
                </Link>    
                
              </div>

              {/* <!-- Hamburger Toggle BTN --> */}
              <button
                id="Toggle"
                aria-label="Toggler"
                className="xl:hidden flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/10"
                onClick={() => setNavigationOpen(!navigationOpen)}
              >
                <span className="block relative cursor-pointer w-5.5 h-5.5">
                  <span className="du-block absolute right-0 w-full h-full">
                    <span
                      className={`block relative top-0 left-0 bg-white rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-[0] ${
                        !navigationOpen && "!w-full delay-300"
                      }`}
                    ></span>
                    <span
                      className={`block relative top-0 left-0 bg-white rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-150 ${
                        !navigationOpen && "!w-full delay-400"
                      }`}
                    ></span>
                    <span
                      className={`block relative top-0 left-0 bg-white rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-200 ${
                        !navigationOpen && "!w-full delay-500"
                      }`}
                    ></span>
                  </span>

                  <span className="block absolute right-0 w-full h-full rotate-45">
                    <span
                      className={`block bg-white rounded-sm ease-in-out duration-200 delay-300 absolute left-2.5 top-0 w-0.5 h-full ${
                        !navigationOpen && "!h-0 delay-[0] "
                      }`}
                    ></span>
                    <span
                      className={`block bg-white rounded-sm ease-in-out duration-200 delay-400 absolute left-0 top-2.5 w-full h-0.5 ${
                        !navigationOpen && "!h-0 dealy-200"
                      }`}
                    ></span>
                  </span>
                </span>
              </button>
              {/* //   <!-- Hamburger Toggle BTN --> */}
            </div>
          </div>
        </div>
        {/* <!-- header top end --> */}

        <div className="pb-4 xl:hidden">
          <form onSubmit={handleSearchSubmit}>
            <div ref={mobileSearchRef} className="relative w-full">
              <input
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                value={searchQuery}
                type="search"
                name="mobile-search"
                id="mobile-search"
                placeholder="Search products..."
                autoComplete="off"
                className="custom-search w-full rounded-md border border-gray-3 bg-white py-3 pl-4 pr-11 text-custom-sm outline-none ease-in duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500/25"
              />

              <button
                type="submit"
                aria-label="Search"
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-dark-4 duration-200 hover:text-blue-700"
              >
                <FiSearch size={19} />
              </button>

              {searchOpen && searchQuery.trim().length >= 2 && (
                <SearchResultsDropdown
                  isLoading={searchLoading}
                  results={searchResults}
                  onSelect={goToProduct}
                />
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#2563EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className="flex items-center justify-between">
            {/* <!--=== Main Nav Start ===--> */}
            <div
              className={`absolute right-4 top-[72px] z-99999 h-0 w-[200px] invisible xl:static xl:right-auto xl:top-auto xl:z-auto xl:h-auto xl:w-auto xl:visible xl:flex items-center justify-between ${
                navigationOpen &&
                `!visible bg-[#2563EB] shadow-lg border border-white/10 !h-auto max-h-[400px] overflow-y-auto rounded-md p-5`
              }`}
            >
              {/* <!-- Main Nav Start --> */}
              <nav>
                <ul className="flex xl:items-center flex-col xl:flex-row gap-5 xl:gap-6">
                  {menuData.map((menuItem, i) =>
                    menuItem.submenu ? (
                      <Dropdown
                        key={i}
                        menuItem={menuItem}
                        stickyMenu={stickyMenu}
                      />
                    ) : (
                      <li
                        key={i}
                        className={`group relative before:absolute before:left-0 before:top-0 before:h-[3px] before:w-0 before:rounded-b-[3px] before:bg-white before:ease-out before:duration-200 hover:before:w-full ${
                          isMenuItemActive(menuItem.path) && "before:!w-full"
                        }`}
                      >
                        <Link
                          href={menuItem.path}
                          onClick={() => setNavigationOpen(false)}
                          className={`flex text-custom-sm font-medium text-white/85 hover:text-white xl:py-6 ${
                            isMenuItemActive(menuItem.path) && "!text-white"
                          }`}
                        >
                          {menuItem.title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </nav>
              {/* //   <!-- Main Nav End --> */}
            </div>
            {/* // <!--=== Main Nav End ===--> */}

            {/* // <!--=== Nav Right Start ===--> */}
            <div className="hidden xl:flex items-center gap-5 py-3">
              <div className="w-[590px]">
                <form onSubmit={handleSearchSubmit}>
                  <div className="flex items-center">
                    <CustomSelect options={options} />

                    <div
                      ref={searchRef}
                      className="relative max-w-[380px] sm:min-w-[380px] w-full"
                    >
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-px h-5.5 bg-gray-4"></span>
                      <input
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSearchOpen(true);
                        }}
                        onFocus={() => setSearchOpen(true)}
                        value={searchQuery}
                        type="search"
                        name="search"
                        id="search"
                        placeholder="I am shopping for..."
                        autoComplete="off"
                        className="custom-search w-full rounded-r-[5px] bg-white !border-l-0 border border-gray-3 py-2.5 pl-4 pr-10 outline-none ease-in duration-200 focus:ring-2 focus:ring-blue-500/25"
                      />

                      <button
                        type="submit"
                        id="search-btn"
                        aria-label="Search"
                        className="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-dark-4 ease-in duration-200 hover:text-blue-700"
                      >
                        <FiSearch size={18} />
                      </button>

                      {searchOpen && searchQuery.trim().length >= 2 && (
                        <SearchResultsDropdown
                          isLoading={searchLoading}
                          results={searchResults}
                          onSelect={goToProduct}
                        />
                      )}
                    </div>
                  </div>
                </form>
              </div>

              
            </div>
            {/* <!--=== Nav Right End ===--> */}
          </div>
        </div>
      </div>
    </header>
  );
};

function AccountIcon() {
  return <FiUser size={24} className="text-blue-200" />;
}

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : count.toString();
}

function SearchResultsDropdown({
  isLoading,
  results,
  onSelect,
}: {
  isLoading: boolean;
  results: Product[];
  onSelect: (item: Product) => void;
}) {
  return (
    <div className="absolute left-0 right-0 top-full z-99999 mt-2 overflow-hidden rounded-md border border-gray-3 bg-white shadow-2">
      {isLoading ? (
        <p className="px-4 py-3 text-custom-sm text-dark-4">
          Searching...
        </p>
      ) : results.length > 0 ? (
        <ul className="max-h-[320px] overflow-y-auto">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-1"
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-2">
                  {item.imgs?.thumbnails?.[0] && (
                    <Image
                      src={item.imgs.thumbnails[0]}
                      alt={item.title}
                      width={42}
                      height={42}
                      unoptimized
                      className="max-h-10 w-auto object-contain"
                    />
                  )}
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-custom-sm font-medium text-dark">
                    {item.title}
                  </span>
                  <span className="block text-custom-xs text-dark-4">
                    {formatCurrency(item.discountedPrice)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-custom-sm text-dark-4">
          No products found
        </p>
      )}
    </div>
  );
}

function AccountAvatar({ user }: { user: ReturnType<typeof getUser> }) {
  if (user?.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt={user.name ? `${user.name} profile` : "Profile image"}
        width={24}
        height={24}
        unoptimized
        className="w-6 h-6 rounded-full object-cover bg-gray-2"
      />
    );
  }

  return <AccountIcon />;
}

export default Header;
