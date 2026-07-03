import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import quickViewReducer from "./features/quickView-slice";
import cartReducer, {
  addItemToCart,
  removeItemFromCart,
} from "./features/cart-slice";
import wishlistReducer, {
  addItemToWishlist,
  removeAllItemsFromWishlist,
  removeItemFromWishlist,
} from "./features/wishlist-slice";
import productDetailsReducer from "./features/product-details";

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const listenerMiddleware = createListenerMiddleware();
const STORE_STORAGE_KEY = "next_commerce_store_v1";

const toastOptions = {
  position: "top-right" as const,
  duration: 2200,
  style: {
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "500",
    padding: "12px 14px",
  },
};

listenerMiddleware.startListening({
  actionCreator: addItemToCart,
  effect: (action) => {
    toast.success(`${action.payload.title} added to cart`, toastOptions);
  },
});

listenerMiddleware.startListening({
  actionCreator: removeItemFromCart,
  effect: (action, listenerApi) => {
    const state = listenerApi.getOriginalState() as RootState;
    const item = state.cartReducer.items.find(
      (cartItem) =>
        cartItem.id === action.payload.id &&
        (cartItem.variantSku || null) === (action.payload.variantSku || null) &&
        JSON.stringify(cartItem.selectedAttributes || {}) ===
          JSON.stringify(action.payload.selectedAttributes || {})
    );

    toast.success(`${item?.title || "Item"} removed from cart`, toastOptions);
  },
});

listenerMiddleware.startListening({
  actionCreator: addItemToWishlist,
  effect: (action, listenerApi) => {
    const state = listenerApi.getOriginalState() as RootState;
    const exists = state.wishlistReducer.items.some(
      (item) => item.id === action.payload.id
    );

    if (exists) {
      toast(`${action.payload.title} is already in your wishlist`, toastOptions);
      return;
    }

    toast.success(`${action.payload.title} added to wishlist`, toastOptions);
  },
});

listenerMiddleware.startListening({
  actionCreator: removeItemFromWishlist,
  effect: (action, listenerApi) => {
    const state = listenerApi.getOriginalState() as RootState;
    const item = state.wishlistReducer.items.find(
      (wishlistItem) => wishlistItem.id === action.payload
    );

    toast.success(`${item?.title || "Item"} removed from wishlist`, toastOptions);
  },
});

listenerMiddleware.startListening({
  actionCreator: removeAllItemsFromWishlist,
  effect: (_, listenerApi) => {
    const state = listenerApi.getOriginalState() as RootState;

    if (state.wishlistReducer.items.length === 0) {
      return;
    }

    toast.success("Wishlist cleared", toastOptions);
  },
});

export const store = configureStore({
  reducer: {
    quickViewReducer,
    cartReducer,
    wishlistReducer,
    productDetailsReducer,
  },
  preloadedState: loadStoredState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

if (typeof window !== "undefined") {
  store.subscribe(() => {
    const state = store.getState();

    window.localStorage.setItem(
      STORE_STORAGE_KEY,
      JSON.stringify({
        cartReducer: state.cartReducer,
        wishlistReducer: state.wishlistReducer,
      })
    );
  });
}

function loadStoredState() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const storedState = window.localStorage.getItem(STORE_STORAGE_KEY);

    if (!storedState) {
      return undefined;
    }

    const parsed = JSON.parse(storedState);

    return {
      cartReducer: parsed.cartReducer,
      wishlistReducer: parsed.wishlistReducer,
    };
  } catch {
    window.localStorage.removeItem(STORE_STORAGE_KEY);
    return undefined;
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
