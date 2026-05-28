"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category?: string;
  description?: string;
};

export type AddOn = {
  name: string;
  price: number;
};

export type CartItem = Product & {
  quantity: number;
  selectedAddOns: AddOn[];
  cartItemId: string;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selectedAddOns?: AddOn[]) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, change: number) => void;
  updateAddOns: (cartItemId: string, newAddOns: AddOn[]) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, selectedAddOns: AddOn[] = []) => {
    const sortedAddOns = [...selectedAddOns].sort((a, b) => a.name.localeCompare(b.name));
    const cartItemId = product.id + (sortedAddOns.length > 0 ? "-" + sortedAddOns.map(a => a.name).join("-") : "");
    const addOnsPrice = sortedAddOns.reduce((sum, a) => sum + a.price, 0);
    const itemPrice = product.price + addOnsPrice;

    setItems((current) => {
      const existing = current.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return current.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...current,
        {
          ...product,
          price: itemPrice,
          quantity: 1,
          selectedAddOns: sortedAddOns,
          cartItemId,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((current) => current.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, change: number) => {
    setItems((current) =>
      current
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateAddOns = (cartItemId: string, newAddOns: AddOn[]) => {
    setItems((current) => {
      const itemToUpdate = current.find(i => i.cartItemId === cartItemId);
      if (!itemToUpdate) return current;

      const sortedAddOns = [...newAddOns].sort((a, b) => a.name.localeCompare(b.name));
      const newCartItemId = itemToUpdate.id + (sortedAddOns.length > 0 ? "-" + sortedAddOns.map(a => a.name).join("-") : "");
      const addOnsPrice = sortedAddOns.reduce((sum, a) => sum + a.price, 0);
      const originalProductPrice = itemToUpdate.price - itemToUpdate.selectedAddOns.reduce((sum, a) => sum + a.price, 0);
      const newItemPrice = originalProductPrice + addOnsPrice;

      // Check if newCartItemId already exists (merging)
      const existingMerge = current.find(i => i.cartItemId === newCartItemId && i.cartItemId !== cartItemId);
      
      if (existingMerge) {
        // Merge into existing and remove old
        return current
          .map(i => i.cartItemId === newCartItemId ? { ...i, quantity: i.quantity + itemToUpdate.quantity } : i)
          .filter(i => i.cartItemId !== cartItemId);
      } else {
        // Update in place
        return current.map(i => i.cartItemId === cartItemId ? {
          ...i,
          selectedAddOns: sortedAddOns,
          price: newItemPrice,
          cartItemId: newCartItemId
        } : i);
      }
    });
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, updateAddOns, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}

