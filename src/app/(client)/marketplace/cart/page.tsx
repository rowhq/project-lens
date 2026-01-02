"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import { useCartStore, PLATFORM_FEE_PERCENTAGE } from "@/shared/lib/cart-store";
import { useToast } from "@/shared/hooks/use-toast";
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  FileText,
  MapPin,
  CreditCard,
  Loader2,
  Info,
  Lock,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, removeItem, clearCart, getTotal, getPlatformFee } =
    useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const checkoutMutation = trpc.marketplace.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      toast({
        title: "Checkout failed",
        description:
          error.message || "Unable to process checkout. Please try again.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    },
  });

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some reports to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    checkoutMutation.mutate({
      listingIds: items.map((item) => item.listingId),
    });
  };

  const subtotal = getTotal();
  const platformFee = getPlatformFee();
  const total = subtotal;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/marketplace"
          className="p-2 hover:bg-gray-800 clip-notch-sm text-gray-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
          <p className="text-gray-400">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-gray-900 clip-notch border border-gray-800 p-12 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">Your cart is empty</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.listingId}
                className="bg-gray-900 clip-notch border border-gray-800 p-4 flex gap-4"
              >
                <div className="w-16 h-16 bg-gray-800 clip-notch-sm flex items-center justify-center flex-shrink-0">
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white line-clamp-1">
                    {item.title}
                  </h3>
                  {item.property && (
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {item.property.city}, {item.property.state}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {item.reportType.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right flex flex-col justify-between">
                  <p className="text-lg font-bold text-white font-mono">
                    ${item.price.toFixed(0)}
                  </p>
                  <button
                    onClick={() => removeItem(item.listingId)}
                    className="text-red-500 hover:text-red-400 p-1 self-end"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="relative bg-gray-900 clip-notch border border-lime-400/30 p-6 sticky top-6">
              <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-lime-400" />
              <div className="absolute -top-px -right-px w-3 h-3 border-r border-t border-lime-400" />
              <h2 className="font-semibold text-white mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-mono">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1">
                    Platform fee
                    <span className="text-xs text-gray-500">
                      ({(PLATFORM_FEE_PERCENTAGE * 100).toFixed(0)}%)
                    </span>
                  </span>
                  <span className="text-white">Included</span>
                </div>
                <div className="pt-3 border-t border-gray-700 flex justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-lg text-lime-400 font-mono">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || items.length === 0}
                className="w-full mt-6 py-3 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Checkout
                  </>
                )}
              </button>

              <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
                <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Secure checkout powered by Stripe. Your payment information is
                  encrypted and never stored on our servers.
                </span>
              </div>
            </div>

            {/* Seller Earnings Note */}
            <div className="bg-lime-400/10 clip-notch p-4 border border-lime-400/30">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-lime-400">Seller Earnings</p>
                  <p className="mt-1 text-gray-400">
                    Sellers receive{" "}
                    {((1 - PLATFORM_FEE_PERCENTAGE) * 100).toFixed(0)}% of the
                    sale price. Platform fees support marketplace operations and
                    quality assurance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
