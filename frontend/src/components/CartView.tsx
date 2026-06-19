/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import { CartItem } from '../types';

interface Props {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onContinueShopping: () => void;
  onProceedToCheckout: (discount: number) => void;
}

export function CartView({ cart, onUpdateQuantity, onRemoveItem, onContinueShopping, onProceedToCheckout }: Props) {
  const [promoCode, setPromoCode] = React.useState('');
  const [discountPct, setDiscountPct] = React.useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = (subtotal * discountPct) / 100;
  const delivery = subtotal > 50 ? 0 : 5;
  const total = subtotal - discount + delivery;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscountPct(10);
    } else if (promoCode.toUpperCase() === 'FIRST20') {
      setDiscountPct(20);
    } else {
      setDiscountPct(0);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="animate-fadeIn" style={{ background: 'var(--bg-primary)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ShoppingBag size={36} color="#b0b0b0" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Your cart is empty</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Add items to your cart to get started</p>
          <button onClick={onContinueShopping} className="btn btn-primary" style={{ padding: '12px 32px' }}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: 40 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <button onClick={onContinueShopping} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none',
          border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20
        }}>
          <ArrowLeft size={16} /> Continue Shopping
        </button>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Cart Items */}
          <div style={{ flex: 1, minWidth: 400 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Shopping Cart ({cart.length} items)</h2>
              </div>

              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', gap: 16, padding: '20px 24px',
                    borderBottom: '1px solid #f5f5f5'
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 4, background: '#f8f8f8', padding: 8 }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>{item.product.name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Seller: {item.product.sellerName}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 4 }}>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} style={{ width: 28, height: 28, border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>−</button>
                        <span style={{ width: 36, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} style={{ width: 28, height: 28, border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>+</button>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>${(item.product.price * item.quantity).toFixed(2)}</span>
                      {item.product.originalPrice && (
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                          ${(item.product.originalPrice * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-secondary)',
                      cursor: 'pointer', padding: 4, alignSelf: 'flex-start'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div style={{ width: 340, flexShrink: 0 }}>
            <div className="card" style={{ position: 'sticky', top: 130 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Price Details
                </h3>
              </div>

              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                  <span>Price ({cart.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {discountPct > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: 'var(--success)' }}>
                    <span>Discount ({discountPct}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                  <span>Delivery Charges</span>
                  <span style={{ color: delivery === 0 ? 'var(--success)' : undefined }}>
                    {delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}
                  </span>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '14px 0', marginTop: 8, borderTop: '1px dashed var(--border)',
                  fontSize: 16, fontWeight: 700
                }}>
                  <span>Total Amount</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {/* Promo Code */}
                <div style={{ marginTop: 16, padding: 12, background: '#f8f9fa', borderRadius: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Tag size={14} color="var(--primary)" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Have a promo code?</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="input"
                      style={{ fontSize: 13, padding: '8px 12px' }}
                    />
                    <button onClick={handleApplyPromo} className="btn btn-primary" style={{ fontSize: 12, padding: '8px 16px', whiteSpace: 'nowrap' }}>
                      Apply
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Try SAVE10 or FIRST20
                  </p>
                </div>

                <button
                  onClick={() => onProceedToCheckout(discountPct)}
                  className="btn btn-accent"
                  style={{ width: '100%', marginTop: 16, padding: '14px 24px', fontSize: 15, borderRadius: 4 }}
                >
                  PLACE ORDER
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
