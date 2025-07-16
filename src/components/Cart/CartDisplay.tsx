"use client";

import React, { useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useGetCartByUserIdQuery,
  useDeleteCartByUserIdMutation,
} from "@/redux/features/carts/cartsApi";
import {
  useUpdateCartItemQuantityMutation,
  useDeleteCartItemMutation,
} from "@/redux/features/cartItems/cartItemsApi";
import { CartItem } from "@/redux/features/cartItems/cartItemsTypes";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"; // Import FetchBaseQueryError
import { SerializedError } from "@reduxjs/toolkit"; // Import SerializedError
import { useSession } from "next-auth/react";
import { withAuth } from "../Auth/withAuth";

const CartDisplay: React.FC = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();

  const {
    data: cart,
    isLoading,
    isError,
    error,
    refetch: refetchCart,
  } = useGetCartByUserIdQuery(userId ?? "");

  const [updateCartItemQuantity, { isLoading: isUpdatingQuantity }] =
    useUpdateCartItemQuantityMutation();
  const [deleteCartItem, { isLoading: isDeletingItem }] =
    useDeleteCartItemMutation();
  const [deleteCart, { isLoading: isClearingCart }] =
    useDeleteCartByUserIdMutation();

  // Helper function to get the error message safely
  const getErrorMessage = (
    error: FetchBaseQueryError | SerializedError | undefined
  ): string => {
    if (!error) return "An unknown error occurred.";

    if ("status" in error) {
      // This is a FetchBaseQueryError (e.g., from your API)
      if (
        typeof error.data === "object" &&
        error.data !== null &&
        "error" in error.data &&
        typeof error.data.error === "string"
      ) {
        return error.data.error; // Assuming your API returns { error: "message" }
      }
      return `API Error: ${error.status}`;
    } else if ("message" in error) {
      // This is a SerializedError
      return error.message || "An unexpected client-side error occurred.";
    }
    return "An unknown error occurred.";
  };

  useEffect(() => {
    if (isError) {
      // No need to check 'error' here, as isError implies error exists
      toast.error(`Failed to load cart: ${getErrorMessage(error)}`);
    }
  }, [isError, error]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      await updateCartItemQuantity({
        id: itemId,
        quantity: newQuantity,
      }).unwrap();
      toast.success("Cart item quantity updated!");
      refetchCart();
    } catch (err: unknown) {
      // Changed 'any' to 'unknown'
      console.error("Failed to update cart item quantity:", err);
      toast.error(
        `Failed to update quantity: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await deleteCartItem(itemId).unwrap();
      toast.success("Item removed from cart!");
      refetchCart(); // Manually refetch
    } catch (err: unknown) {
      // Changed 'any' to 'unknown'
      console.error("Failed to remove cart item:", err);
      toast.error(
        `Failed to remove item: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
    }
  };

  const handleClearCart = async () => {
    try {
      await deleteCart(userId ?? "").unwrap();
      toast.success("Cart cleared successfully!");
      refetchCart(); // Manually refetch
    } catch (err: unknown) {
      // Changed 'any' to 'unknown'
      console.error("Failed to clear cart:", err);
      toast.error(
        `Failed to clear cart: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
    }
  };

  const calculateTotal = () => {
    if (!cart?.cart_items) return 0;
    return cart.cart_items.reduce(
      (sum, item) => sum + item.quantity * item.price_at_addition,
      0
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8 min-h-[50vh]">
        <LoadingSpinner />
        <p className="ml-2">Loading cart...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full text-center text-red-600 mt-10">
        <Alert type="error" message={`Error: ${getErrorMessage(error)}`} />
      </div>
    );
  }

  const cartItems = cart?.cart_items || [];

  return (
    <div className="container mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Your Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
          <Button variant="primary" onClick={() => router.push("/products")}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <div>
          <div className="space-y-6 mb-8">
            {cartItems.map((item: CartItem) => (
              <div
                key={item.id}
                className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm"
              >
                <div className="relative w-24 h-24 mr-4 flex-shrink-0">
                  <Image
                    src={
                      item.partner_products?.thumbnail_url ||
                      item.partner_products?.product_image_urls?.[0] ||
                      "/placeholder-image.jpg"
                    }
                    alt={item.partner_products?.partner_name || "Product Image"}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.partner_products?.partner_name || "Unnamed Product"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    By: {item.partner_products?.partner_id || "Unknown Partner"}
                  </p>
                  <p className="text-md font-medium text-primary mt-1">
                    ${item.price_at_addition.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    disabled={isUpdatingQuantity || isDeletingItem}
                  >
                    -
                  </Button>
                  <span className="text-lg font-medium">{item.quantity}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    disabled={isUpdatingQuantity || isDeletingItem}
                  >
                    +
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    isLoading={isDeletingItem}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t pt-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Total: ${calculateTotal().toFixed(2)}
            </h2>
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={handleClearCart}
                isLoading={isClearingCart}
                disabled={isClearingCart}
              >
                Clear Cart
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push("/checkout")}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(CartDisplay, { allowedRoles: ["client"] });
