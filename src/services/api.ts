import { Category } from "@/types/category";
import { Brand } from "@/types/brand";
import { BlogItem } from "@/types/blogItem";
import { Product } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FRONTEND_IMAGE_PREFIXES = ["/images/", "/_next/"];

function requireApiUrl() {
  if (!API_URL) {
    throw new Error("API URL is not configured.");
  }

  return API_URL;
}

type ApiCollection<T> = {
  data: T[];
};

export type PaginatedResponse<T> = ApiCollection<T> & {
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type ProductQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string | number;
  brand?: string | number;
  sort?: "latest" | "oldest" | "best-selling";
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
};

type OrderResponse = {
  message: string;
  order: {
    id: number;
    order_number: string;
    payment_token: string;
    status: string;
    email: string;
    subtotal: number;
    coupon_code?: string | null;
    discount_total: number;
    shipping_total: number;
    total: number;
    payable_now: number;
    due_on_delivery: number;
    payment_status: string;
    payment_method: string;
    shipping_method: string;
  };
};

export type CheckoutPaymentMethod = {
  code: string;
  title: string;
  type: string;
  instructions?: string | null;
  account_details?: Array<{
    label: string;
    value: string;
  }>;
  payment_systems?: Array<{
    code: string;
    title: string;
    image?: string | null;
    account_number?: string | null;
    payment_action?: string | null;
    instructions?: string | null;
  }>;
};

export type CheckoutConfig = {
  payment_methods: CheckoutPaymentMethod[];
  delivery: {
    store_district: string;
    inside_district_charge: number;
    outside_district_charge: number;
  };
};

export type SiteSettings = {
  project_name: string;
  tagline?: string | null;
  support_phone?: string | null;
  support_email?: string | null;
  address?: string | null;
  logo?: string | null;
  favicon?: string | null;
  footer_account_links?: Array<{ label: string; url: string }> | null;
  footer_quick_links?: Array<{ label: string; url: string }> | null;
  footer_social_links?: Array<{ label: string; url: string; icon?: string | null }> | null;
  accepted_payments?: Array<{ label: string; icon: string }> | null;
  newsletter_title?: string | null;
  newsletter_text?: string | null;
};

export type ContentPage = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string[];
};

export type HomeHeroItem = {
  id: number;
  type: "slider" | "promo" | "feature";
  title: string;
  subtitle?: string | null;
  description?: string | null;
  badge?: string | null;
  label?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  image?: string | null;
  price?: number | null;
  old_price?: number | null;
  sort_order?: number;
};

export type HomeHero = {
  sliders: HomeHeroItem[];
  promos: HomeHeroItem[];
  features: HomeHeroItem[];
};

export type PromoBannerItem = {
  id: number;
  position: "big" | "small_left" | "small_right";
  title: string;
  headline?: string | null;
  description?: string | null;
  highlight_text?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  image?: string | null;
  background_color?: string | null;
  button_color?: string | null;
  highlight_color?: string | null;
  sort_order?: number;
};

export type PromoBanners = {
  big: PromoBannerItem[];
  small_left: PromoBannerItem[];
  small_right: PromoBannerItem[];
};

export type PaymentOrder = {
  order: {
    order_number: string;
    status: string;
    payment_status: string;
    email: string;
    subtotal: number;
    coupon_code?: string | null;
    discount_total: number;
    shipping_total: number;
    total: number;
    payable_now: number;
    due_on_delivery: number;
    paid_total: number;
    payment_method: string;
    items: Array<{
      title: string;
      quantity: number;
      line_total: number;
    }>;
  };
  payment_method: CheckoutPaymentMethod | null;
  submissions: Array<{
    id: number;
    payment_method_code: string;
    amount: number;
    sender_number: string;
    transaction_id: string;
    status: string;
    admin_note?: string | null;
    created_at?: string | null;
  }>;
};

function apiOrigin() {
  return new URL(requireApiUrl()).origin;
}

function normalizeBackendImage(src?: string | null) {
  if (!src) {
    return "";
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (FRONTEND_IMAGE_PREFIXES.some((prefix) => src.startsWith(prefix))) {
    return src;
  }

  if (src.startsWith("/")) {
    return `${apiOrigin()}${src}`;
  }

  return `${apiOrigin()}/storage/${src.replace(/^storage\//, "")}`;
}

function normalizeCategory(category: Category): Category {
  return {
    ...category,
    img: normalizeBackendImage(category.img) || "/images/categories/categories-01.png",
  };
}

function normalizeBrand(brand: Brand): Brand {
  return {
    ...brand,
    img: normalizeBackendImage(brand.img),
  };
}

function normalizeBlog(blog: BlogItem): BlogItem {
  return {
    ...blog,
    img: normalizeBackendImage(blog.img) || "/images/blog/blog-01.jpg",
    author: blog.author
      ? {
          ...blog.author,
          avatar: normalizeBackendImage(blog.author.avatar),
        }
      : blog.author,
  };
}

function normalizeProduct(product: Product): Product {
  const normalizedThumbnails = (product.imgs?.thumbnails || [])
    .map(normalizeBackendImage)
    .filter(Boolean);
  const normalizedPreviews = (product.imgs?.previews || [])
    .map(normalizeBackendImage)
    .filter(Boolean);
  const thumbnails = normalizedThumbnails.length ? normalizedThumbnails : normalizedPreviews;
  const previews = normalizedPreviews.length ? normalizedPreviews : normalizedThumbnails;

  const normalizeOptionValue = (value?: string) => (value || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    ...product,
    imgs: {
      thumbnails,
      previews,
    },
    attributes: product.attributes?.map((attribute) => {
      const seenValues = new Set<string>();

      return {
        ...attribute,
        slug: attribute.slug.replaceAll("-", "_"),
        values: attribute.values
          .map((value) => ({
            ...value,
            value: normalizeOptionValue(value.value || value.label),
            image: normalizeBackendImage(value.image),
          }))
          .filter((value) => {
            const key = value.label.toLowerCase();
            if (seenValues.has(key)) {
              return false;
            }

            seenValues.add(key);
            return true;
          }),
      };
    }),
    variants: product.variants?.map((variant) => ({
      ...variant,
      image: normalizeBackendImage(variant.image),
      options: Object.fromEntries(
        Object.entries(variant.options || {}).map(([key, value]) => [
          key.replaceAll("-", "_"),
          normalizeOptionValue(value),
        ])
      ),
      price: Number(variant.price || 0),
      discounted_price: Number(variant.discounted_price || variant.price || 0),
      stock: Number(variant.stock || 0),
      is_active: variant.is_active ?? true,
    })),
    brand: product.brand
      ? {
          ...product.brand,
          img: normalizeBackendImage(product.brand.img),
        }
      : product.brand,
  };
}

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === false) {
      return;
    }

    query.set(key, String(value));
  });

  const value = query.toString();

  return value ? `?${value}` : "";
}

export async function fetchProductsPage(
  query: ProductQuery = {}
): Promise<PaginatedResponse<Product>> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/products${buildQuery({
    page: query.page,
    per_page: query.perPage,
    search: query.search,
    category: query.category,
    brand: query.brand,
    sort: query.sort,
    min_price: query.minPrice,
    max_price: query.maxPrice,
    featured: query.featured ? 1 : undefined,
  })}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load products");
  }

  const payload = (await response.json()) as PaginatedResponse<Product>;

  return {
    ...payload,
    data: payload.data.map(normalizeProduct),
  };
}

export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  const payload = await fetchProductsPage({
    perPage: 60,
    ...query,
  });

  return payload.data;
}

export async function fetchProduct(product: string): Promise<Product> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/products/${encodeURIComponent(product)}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load product");
  }

  const payload = (await response.json()) as { data: Product };

  return normalizeProduct(payload.data);
}

export async function submitProductReview(
  product: string | number,
  payload: {
    name: string;
    email: string;
    rating: number;
    comment: string;
  }
): Promise<{ message: string; product: Product }> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/products/${encodeURIComponent(String(product))}/reviews`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const validationMessage = data?.errors
      ? Object.values(data.errors).flat().join(" ")
      : null;

    throw new Error(validationMessage || data?.message || "Unable to submit review");
  }

  return {
    message: data.message,
    product: normalizeProduct(data.product.data ?? data.product),
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/categories`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load categories");
  }

  const payload = (await response.json()) as ApiCollection<Category>;

  return payload.data.map(normalizeCategory);
}

export async function fetchBrands(): Promise<Brand[]> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/brands`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load brands");
  }

  const payload = (await response.json()) as ApiCollection<Brand>;

  return payload.data.map(normalizeBrand);
}

export async function fetchBlogs(): Promise<BlogItem[]> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/blogs`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load blogs");
  }

  const payload = (await response.json()) as ApiCollection<BlogItem>;

  return payload.data.map(normalizeBlog);
}

export async function fetchBlog(blog: string): Promise<BlogItem> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/blogs/${encodeURIComponent(blog)}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load blog");
  }

  const payload = (await response.json()) as { data: BlogItem };

  return normalizeBlog(payload.data);
}

export async function fetchCheckoutConfig(): Promise<CheckoutConfig> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/checkout/config`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load checkout settings");
  }

  const config = (await response.json()) as CheckoutConfig;

  return {
    ...config,
    payment_methods: config.payment_methods.map((method) => ({
      ...method,
      payment_systems: method.payment_systems?.map((system) => ({
        ...system,
        image: normalizeBackendImage(system.image),
      })),
    })),
  };
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/site-settings`, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load site settings");
  }

  const settings = (await response.json()) as SiteSettings;

  return {
    ...settings,
    logo: normalizeBackendImage(settings.logo) || "/images/logo/logo.svg",
    favicon: normalizeBackendImage(settings.favicon) || "/favicon.ico",
    accepted_payments: settings.accepted_payments?.map((payment) => ({
      ...payment,
      icon: normalizeBackendImage(payment.icon) || payment.icon,
    })),
  };
}

export async function fetchContentPage(page: string): Promise<ContentPage> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/pages/${encodeURIComponent(page)}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load page");
  }

  const payload = (await response.json()) as { data: ContentPage };

  return payload.data;
}

export async function fetchHomeHero(): Promise<HomeHero> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/home-hero`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load home hero");
  }

  const payload = (await response.json()) as HomeHero;

  return {
    sliders: payload.sliders.map((item) => ({
      ...item,
      image: normalizeBackendImage(item.image) || "/images/hero/hero-01.png",
    })),
    promos: payload.promos.map((item) => ({
      ...item,
      image: normalizeBackendImage(item.image) || "/images/hero/hero-01.png",
    })),
    features: payload.features.map((item) => ({
      ...item,
      image: normalizeBackendImage(item.image) || "/images/icons/icon-01.svg",
    })),
  };
}

export async function fetchPromoBanners(): Promise<PromoBanners> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/promo-banners`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load promo banners");
  }

  const payload = (await response.json()) as PromoBanners;
  const normalizeBanner = (item: PromoBannerItem): PromoBannerItem => ({
    ...item,
    image: normalizeBackendImage(item.image),
  });

  return {
    big: payload.big.map(normalizeBanner),
    small_left: payload.small_left.map(normalizeBanner),
    small_right: payload.small_right.map(normalizeBanner),
  };
}

export async function createOrder(
  payload: Record<string, unknown>
): Promise<OrderResponse> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/orders`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const validationMessage = error?.errors
      ? Object.values(error.errors).flat().join(" ")
      : null;

    throw new Error(validationMessage || error?.message || "Unable to place order");
  }

  return response.json() as Promise<OrderResponse>;
}

export async function applyCoupon(
  payload: Record<string, unknown>
): Promise<{
  message: string;
  coupon: {
    code: string;
    type: string;
    value: number;
    discount: number;
  };
}> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/coupons/apply`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const validationMessage = error?.errors
      ? Object.values(error.errors).flat().join(" ")
      : null;

    throw new Error(validationMessage || error?.message || "Unable to apply coupon");
  }

  return response.json();
}

export async function fetchPaymentOrder(token: string): Promise<PaymentOrder> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/payments/${encodeURIComponent(token)}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load payment details");
  }

  const paymentOrder = (await response.json()) as PaymentOrder;

  return {
    ...paymentOrder,
    payment_method: paymentOrder.payment_method
      ? {
          ...paymentOrder.payment_method,
          payment_systems: paymentOrder.payment_method.payment_systems?.map((system) => ({
            ...system,
            image: normalizeBackendImage(system.image),
          })),
        }
      : paymentOrder.payment_method,
  };
}

export async function submitPaymentProof(
  token: string,
  payload: FormData
): Promise<{ message: string }> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/payments/${encodeURIComponent(token)}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: payload,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const validationMessage = error?.errors
      ? Object.values(error.errors).flat().join(" ")
      : null;

    throw new Error(validationMessage || error?.message || "Unable to submit payment");
  }

  return response.json() as Promise<{ message: string }>;
}

export async function submitContactMessage(
  payload: Record<string, unknown>
): Promise<{ message: string }> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/contact-messages`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const validationMessage = error?.errors
      ? Object.values(error.errors).flat().join(" ")
      : null;

    throw new Error(validationMessage || error?.message || "Unable to send message");
  }

  return response.json() as Promise<{ message: string }>;
}

export async function submitNewsletterSubscription(
  email: string
): Promise<{ message: string }> {
  const apiUrl = requireApiUrl();
  const response = await fetch(`${apiUrl}/newsletter-subscriptions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const validationMessage = error?.errors
      ? Object.values(error.errors).flat().join(" ")
      : null;

    throw new Error(validationMessage || error?.message || "Unable to subscribe");
  }

  return response.json() as Promise<{ message: string }>;
}
