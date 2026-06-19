/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Star, ShoppingCart, Zap, Truck, Shield, RefreshCw, Store } from 'lucide-react';
import { Product } from '../types';
import { getProductReviews, submitProductReview } from '../services/product.service.js';

interface Props {
  product: Product;
  onBackToShop: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductDetailView({ product, onBackToShop, onAddToCart }: Props) {
  const [selectedImage, setSelectedImage] = React.useState(product.image);
  const [quantity, setQuantity] = React.useState(1);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [activeSection, setActiveSection] = React.useState<'specs' | 'reviews'>('specs');

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  React.useEffect(() => {
    getProductReviews(product.id).then(setReviews).catch(() => {});
  }, [product.id]);

  return (
    <div className="animate-fadeIn" style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: 40 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        {/* Breadcrumb */}
        <button onClick={onBackToShop} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none',
          border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20
        }}>
          <ArrowLeft size={16} /> Back to Products
        </button>

        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {/* Left: Image Gallery */}
          <div style={{ width: 460, flexShrink: 0 }}>
            <div className="card" style={{ position: 'sticky', top: 130 }}>
              {/* Main Image */}
              <div style={{
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 32, borderBottom: '1px solid #f0f0f0'
              }}>
                <img
                  src={selectedImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: 12, overflowX: 'auto' }}>
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      style={{
                        width: 56, height: 56, borderRadius: 4, overflow: 'hidden',
                        border: selectedImage === img ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: 'white', cursor: 'pointer', padding: 4, flexShrink: 0
                      }}
                    >
                      <img src={img} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, padding: 16 }}>
                <button
                  onClick={() => onAddToCart(product, quantity)}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '14px 20px', fontSize: 15, borderRadius: 4 }}
                >
                  <ShoppingCart size={18} /> ADD TO CART
                </button>
                <button
                  onClick={() => { onAddToCart(product, quantity); }}
                  className="btn btn-accent"
                  style={{ flex: 1, padding: '14px 20px', fontSize: 15, borderRadius: 4 }}
                >
                  <Zap size={18} /> BUY NOW
                </button>
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div className="card" style={{ padding: 28 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                {product.brand}
              </span>

              <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6, lineHeight: 1.4 }}>
                {product.name}
              </h1>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                <span className="star-badge" style={{ fontSize: 13, padding: '3px 8px' }}>
                  {product.rating} <Star size={11} fill="white" />
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {product.ratingCount.toLocaleString()} Ratings & {reviews.length} Reviews
                </span>
              </div>

              {/* Price */}
              <div style={{ marginTop: 20, padding: '16px 0', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontSize: 28, fontWeight: 700 }}>${product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span style={{ fontSize: 16, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                        ${product.originalPrice}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--success)' }}>
                        {discount}% off
                      </span>
                    </>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500, marginTop: 4 }}>
                  inclusive of all taxes
                </p>
              </div>

              {/* Quantity */}
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 8, width: 'fit-content', border: '1px solid var(--border)', borderRadius: 4 }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 36, height: 36, border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>−</button>
                  <span style={{ width: 48, textAlign: 'center', fontSize: 14, fontWeight: 700, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', lineHeight: '36px' }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} style={{ width: 36, height: 36, border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>+</button>
                </div>
              </div>

              {/* Highlights */}
              <div style={{ marginTop: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { icon: <Truck size={20} />, title: 'Free Delivery', desc: 'On orders over $50' },
                  { icon: <RefreshCw size={20} />, title: '7 Day Returns', desc: 'Easy return policy' },
                  { icon: <Shield size={20} />, title: 'Secure Payment', desc: 'Encrypted checkout' },
                ].map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ color: 'var(--primary)' }}>{h.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{h.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{h.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Seller Info */}
              <div style={{
                marginTop: 24, padding: 16, background: '#f8f9fa', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Store size={18} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Sold by: {product.sellerName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
                  </div>
                </div>
              </div>
            </div>

            {/* Specs & Reviews Tabs */}
            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
                {['specs', 'reviews'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSection(tab as any)}
                    style={{
                      flex: 1, padding: '14px 20px', border: 'none', background: 'none',
                      fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                      color: activeSection === tab ? 'var(--primary)' : 'var(--text-secondary)',
                      borderBottom: activeSection === tab ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer', textTransform: 'capitalize'
                    }}
                  >
                    {tab === 'specs' ? 'Specifications' : `Reviews (${reviews.length})`}
                  </button>
                ))}
              </div>

              <div style={{ padding: 24 }}>
                {activeSection === 'specs' && (
                  <div>
                    <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 20 }}>
                      {product.description}
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {Object.entries(product.specs).map(([key, val], i) => (
                          <tr key={key} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                            <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', width: '40%' }}>{key}</td>
                            <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-primary)' }}>{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeSection === 'reviews' && (
                  <div>
                    {reviews.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, padding: 40 }}>
                        No reviews yet. Be the first to review this product!
                      </p>
                    ) : (
                      reviews.map(rev => (
                        <div key={rev.id} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #f5f5f5' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="star-badge" style={{ fontSize: 11 }}>
                              {rev.rating} <Star size={9} fill="white" />
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{rev.title}</span>
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{rev.body}</p>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                            {rev.author} • {rev.date} {rev.verified && <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ Verified</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
