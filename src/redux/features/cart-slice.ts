import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

type CartItem = {
  id: number;
  title: string;
  slug?: string;
  sku?: string | null;
  variantSku?: string | null;
  selectedAttributes?: Record<string, string>;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type CartItemIdentity = {
  id: number;
  variantSku?: string | null;
  selectedAttributes?: Record<string, string>;
};

const initialState: InitialState = {
  items: [],
};

function selectedAttributesKey(selectedAttributes?: Record<string, string>) {
  return JSON.stringify(selectedAttributes || {});
}

function matchesCartItem(item: CartItem, identity: CartItemIdentity) {
  return (
    item.id === identity.id &&
    (item.variantSku || null) === (identity.variantSku || null) &&
    selectedAttributesKey(item.selectedAttributes) ===
      selectedAttributesKey(identity.selectedAttributes)
  );
}

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, sku, variantSku, selectedAttributes, price, quantity, discountedPrice, imgs } =
        action.payload;
      const existingItem = state.items.find((item) => (
        matchesCartItem(item, { id, variantSku, selectedAttributes })
      ));

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          title,
          sku,
          variantSku,
          selectedAttributes,
          price,
          quantity,
          discountedPrice,
          imgs,
        });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<CartItemIdentity>) => {
      state.items = state.items.filter((item) => !matchesCartItem(item, action.payload));
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<CartItemIdentity & { quantity: number }>
    ) => {
      const { quantity, ...identity } = action.payload;
      const existingItem = state.items.find((item) => matchesCartItem(item, identity));

      if (existingItem) {
        existingItem.quantity = Math.max(1, quantity);
      }
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;
