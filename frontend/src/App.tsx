/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { ShopAllView } from './components/ShopAllView.js';
import { ProductDetailView } from './components/ProductDetailView.js';
import { CartView } from './components/CartView.js';
import { CheckoutView } from './components/CheckoutView.js';
import { OrderConfirmationView } from './components/OrderConfirmationView.js';
import { AzureConsultant } from './components/AzureConsultant.js';
import { Product, CartItem, Order, CustomResourceConfig } from './types.js';
import { useAuth } from './contexts/AuthContext.js';
import { getProducts } from './services/product.service.js';
import { fetchCart, addToCart, updateCartItemQuantity, removeCartItem, clearCart } from './services/cart.service.js';
import { placeOrder } from './services/order.service.js';

export default function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<string>('shop');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  
  // Durable CART state: Load from localStorage if present initially
  const [cart, setCart] = React.useState<CartItem[]>(() => {
    try {
      const cached = localStorage.getItem('cloudcommerce_cart');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [activeOrder, setActiveOrder] = React.useState<Order | null>(null);
  const [discountPct, setDiscountPct] = React.useState<number>(0);

  // Sync products from backend
  React.useEffect(() => {
    getProducts()
      .then(setProductsList)
      .catch(err => console.error('Failed to load catalog products:', err));
  }, []);

  // Sync user's cart from backend if authenticated
  React.useEffect(() => {
    if (user && productsList.length > 0) {
      fetchCart()
        .then((serverCart) => {
          const reconstructed = serverCart.items.map((srvItem: any) => {
            const matched = productsList.find(p => p.id === srvItem.productId);
            return {
              id: srvItem.id,
              product: matched || {
                id: srvItem.productId,
                name: srvItem.productName,
                price: srvItem.productPrice,
                image: srvItem.productImage,
                isAzureResource: srvItem.isAzureResource,
                sku: srvItem.sku,
                category: 'Compute & VM',
                description: '',
                thumbnails: [srvItem.productImage],
                rating: 5,
                ratingCount: 1,
                specs: {}
              },
              quantity: srvItem.quantity,
              selectedColor: srvItem.selectedColor,
              customConfig: srvItem.customConfig
            };
          });
          setCart(reconstructed);
        })
        .catch(err => console.error('Failed to retrieve user cart:', err));
    }
  }, [user, productsList]);

  // Fallback sync to localStorage for guests
  React.useEffect(() => {
    if (!user) {
      localStorage.setItem('cloudcommerce_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  // Jump smoothly to top on tab transitions
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => item.id !== id));
      if (user) {
        try {
          await removeCartItem(id);
        } catch (e) {
          console.error('Failed to remove cart item:', e);
        }
      }
    } else {
      setCart((current) =>
        current.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
      if (user) {
        try {
          await updateCartItemQuantity(id, quantity);
        } catch (e) {
          console.error('Failed to update cart item quantity:', e);
        }
      }
    }
  };

  const handleRemoveItem = async (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
    if (user) {
      try {
        await removeCartItem(id);
      } catch (e) {
        console.error('Failed to remove cart item:', e);
      }
    }
  };

  const handleAddToCart = async (
    product: Product,
    quantity: number,
    color?: string,
    customConfig?: CustomResourceConfig
  ) => {
    let compoundKey = product.id;
    if (customConfig) {
      compoundKey += `-${customConfig.vCPUs}c-${customConfig.ramGB}m-${customConfig.storageGB}s-${customConfig.region}-${customConfig.tier}`;
    } else if (color) {
      compoundKey += `-${color.replace(/\s+/g, '')}`;
    }

    setCart((current) => {
      const matchIndex = current.findIndex((item) => item.id === compoundKey);
      if (matchIndex > -1) {
        const copy = [...current];
        copy[matchIndex].quantity += quantity;
        return copy;
      } else {
        return [
          ...current,
          {
            id: compoundKey,
            product,
            quantity,
            selectedColor: color,
            customConfig
          }
        ];
      }
    });

    if (user) {
      try {
        await addToCart({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image,
          isAzureResource: product.isAzureResource,
          sku: product.sku,
          quantity,
          selectedColor: color,
          customConfig
        });
      } catch (e) {
        console.error('Failed to sync added item with backend cart:', e);
      }
    }
  };

  const handlePlaceOrder = async (metadata: {
    email: string;
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingZip: string;
    paymentMethod: string;
  }) => {
    const subtotal = cart.reduce((sum, item) => {
      const price = item.customConfig ? item.customConfig.monthlyRate : item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    const discountAmount = (subtotal * discountPct) / 100;
    const shippingCharge = subtotal > 150 ? 0 : 15;
    const estimatedTax = (subtotal - discountAmount) * 0.0825;
    const totalAmount = subtotal - discountAmount + shippingCharge + estimatedTax;

    const formattedItems = cart.map(item => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      productPrice: item.customConfig ? item.customConfig.monthlyRate : item.product.price,
      productImage: item.product.image,
      isAzureResource: item.product.isAzureResource,
      sku: item.product.sku,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      customConfig: item.customConfig
    }));

    if (user) {
      try {
        const orderRes = await placeOrder({
          items: formattedItems,
          subtotal,
          shipping: shippingCharge,
          tax: estimatedTax,
          discount: discountAmount,
          total: totalAmount,
          email: metadata.email,
          shippingName: metadata.shippingName,
          shippingAddress: metadata.shippingAddress,
          shippingCity: metadata.shippingCity,
          shippingZip: metadata.shippingZip,
          paymentMethod: metadata.paymentMethod
        });
        setActiveOrder(orderRes);
        await clearCart();
      } catch (e) {
        console.error('Failed to post order to server:', e);
      }
    } else {
      const newOrder: Order = {
        id: `AZ-${Math.floor(100000 + Math.random() * 900000)}-CC`,
        items: [...cart],
        subtotal,
        shipping: shippingCharge,
        tax: estimatedTax,
        discount: discountAmount,
        total: totalAmount,
        date: new Date().toLocaleDateString(),
        ...metadata
      };
      setActiveOrder(newOrder);
    }

    setCart([]);
    setActiveTab('confirmed');
  };

  const handleInjectResources = (recommendations: { product: Product; quantity: number; config: CustomResourceConfig }[]) => {
    recommendations.forEach((rec) => {
      handleAddToCart(rec.product, rec.quantity, undefined, rec.config);
    });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('details');
  };

  return (
    <div id="application-root" className="flex min-h-screen flex-col font-sans text-slate-800 antialiased bg-slate-50/20">
      
      {/* GLOBAL PERSISTENT NAVBAR */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cart={cart}
        setFilterCategory={setFilterCategory}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* CORE FRAMEWORK SWITCHBOARD ROUTER */}
      <main id="application-body" className="flex-1">
        {activeTab === 'shop' && (
          <ShopAllView
            products={productsList}
            onViewProduct={handleSelectProduct}
            onQuickAdd={(p) => handleAddToCart(p, 1)}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'details' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            onBackToShop={() => setActiveTab('shop')}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === 'cart' && (
          <CartView
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onContinueShopping={() => setActiveTab('shop')}
            onProceedToCheckout={(discount) => {
              setDiscountPct(discount);
              setActiveTab('checkout');
            }}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutView
            cart={cart}
            discountPct={discountPct}
            onBackToCart={() => setActiveTab('cart')}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {activeTab === 'confirmed' && (
          <OrderConfirmationView
            order={activeOrder}
            onContinueShopping={() => setActiveTab('shop')}
          />
        )}

        {activeTab === 'advisor' && (
          <AzureConsultant
            products={productsList}
            onInjectResources={handleInjectResources}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* GLOBAL FOOTING BRACKET */}
      <Footer setActiveTab={setActiveTab} setFilterCategory={setFilterCategory} />

    </div>
  );
}
