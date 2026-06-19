/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { getSellerProducts, createProduct, updateProduct, deleteProduct } from '../services/product.service.js';
import { fetchSellerOrders, updateOrderStatus } from '../services/order.service.js';
import { getSellerById, updateSellerProfile } from '../services/seller.service.js';
import { Product, Order } from '../types.js';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  Briefcase,
  X,
  PlusCircle
} from 'lucide-react';

interface SellerDashboardProps {
  onProductsUpdated: () => void;
}

export function SellerDashboard({ onProductsUpdated }: SellerDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'profile'>('overview');
  
  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeName, setStoreName] = useState(user?.storeName || '');
  const [storeDesc, setStoreDesc] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Product modal / form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    brand: '',
    category: 'Electronics' as Product['category'],
    description: '',
    price: 0,
    originalPrice: 0,
    image: '',
    imagesStr: '', // comma separated image URLs
    stock: 10,
    badge: ''
  });
  
  // Custom Specs state
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      // 1. Load Seller Profile
      try {
        const profile = await getSellerById(user.id);
        setStoreName(profile.storeName || user.storeName || '');
        setStoreDesc(profile.storeDescription || '');
      } catch (e) {
        console.warn('Could not load seller profile, using defaults.', e);
      }

      // 2. Load Seller Products
      const sellerProds = await getSellerProducts(user.id);
      setProducts(sellerProds);

      // 3. Load Seller Orders
      const sellerOrders = await fetchSellerOrders();
      setOrders(sellerOrders);
    } catch (err: any) {
      console.error('Error fetching seller dashboard data:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle store profile update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await updateSellerProfile({
        storeName,
        storeDescription: storeDesc
      });
      setSuccess('Store profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update store profile.');
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add or edit
  const openProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProdForm({
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || 0,
        image: product.image,
        imagesStr: product.images ? product.images.join(', ') : '',
        stock: product.stock,
        badge: product.badge || ''
      });
      // Set specs
      const specPairs = Object.entries(product.specs || {}).map(([key, value]) => ({ key, value }));
      setSpecsList(specPairs);
    } else {
      setEditingProduct(null);
      setProdForm({
        name: '',
        brand: '',
        category: 'Electronics',
        description: '',
        price: 0,
        originalPrice: 0,
        image: '',
        imagesStr: '',
        stock: 10,
        badge: ''
      });
      setSpecsList([]);
    }
    setNewSpecKey('');
    setNewSpecVal('');
    setIsModalOpen(true);
  };

  // Handle add spec
  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setSpecsList([...specsList, { key: newSpecKey.trim(), value: newSpecVal.trim() }]);
    setNewSpecKey('');
    setNewSpecVal('');
  };

  // Remove spec
  const handleRemoveSpec = (index: number) => {
    setSpecsList(specsList.filter((_, i) => i !== index));
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const imagesArray = prodForm.imagesStr
      ? prodForm.imagesStr.split(',').map(s => s.trim()).filter(Boolean)
      : [prodForm.image];

    const specsObj: Record<string, string> = {};
    specsList.forEach(item => {
      specsObj[item.key] = item.value;
    });

    const payload = {
      name: prodForm.name,
      brand: prodForm.brand,
      category: prodForm.category,
      description: prodForm.description,
      price: Number(prodForm.price),
      originalPrice: prodForm.originalPrice ? Number(prodForm.originalPrice) : undefined,
      image: prodForm.image,
      images: imagesArray,
      stock: Number(prodForm.stock),
      badge: prodForm.badge || undefined,
      specs: specsObj,
      sellerName: storeName || user?.name || 'Verified Seller'
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setSuccess('Product updated successfully!');
      } else {
        await createProduct(payload);
        setSuccess('Product created successfully!');
      }
      setIsModalOpen(false);
      loadData();
      onProductsUpdated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');
    try {
      await deleteProduct(id);
      setSuccess('Product deleted successfully!');
      loadData();
      onProductsUpdated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete product.');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setError('');
    try {
      await updateOrderStatus(orderId, status);
      setSuccess('Order status updated!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update order status.');
    }
  };

  // Calculations for overview stats
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => {
      // Sum up items belonging to this seller
      const sellerItemsTotal = order.items
        .filter(item => item.sellerId === user?.id)
        .reduce((s, item) => s + (item.productPrice * item.quantity), 0);
      return sum + sellerItemsTotal;
    }, 0);

  const totalUnitsSold = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => {
      const sellerItemsQty = order.items
        .filter(item => item.sellerId === user?.id)
        .reduce((s, item) => s + item.quantity, 0);
      return sum + sellerItemsQty;
    }, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

  return (
    <div id="seller-dashboard-view" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <p className="mt-1 text-sm text-blue-100">
          Manage your storefront, upload products, track orders, and boost your sales on CloudKart.
        </p>
      </div>

      {/* Message feedback alerts */}
      {success && (
        <div className="mb-6 flex items-center space-x-2 rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 border border-emerald-100">
          <Check className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center space-x-2 rounded-lg bg-rose-50 p-4 text-sm font-semibold text-rose-800 border border-rose-100">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                  activeTab === 'products'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Package className="h-4.5 w-4.5" />
                <span>My Products</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                  activeTab === 'orders'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                <span>Fulfillment Orders</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Settings className="h-4.5 w-4.5" />
                <span>Store Settings</span>
              </button>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-4">
              <div className="rounded-xl bg-slate-50 p-4 text-xs">
                <span className="block font-bold text-slate-500 uppercase">Seller Status</span>
                <span className="mt-1 flex items-center space-x-1.5 font-bold text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>Verified Partner</span>
                </span>
                <span className="mt-2 block text-[10px] text-slate-400">
                  ID: {user?.id}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Panel */}
        <div className="lg:col-span-3">
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Counters */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Gross Revenue</span>
                      <h3 className="mt-1 text-2xl font-black text-slate-900">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Units Dispatched</span>
                      <h3 className="mt-1 text-2xl font-black text-slate-900">{totalUnitsSold} units</h3>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Active Catalog</span>
                      <h3 className="mt-1 text-2xl font-black text-slate-900">{products.length} listed</h3>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                      <Briefcase className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Action Alerts */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900">Task Tracker</h3>
                <div className="mt-4 space-y-3">
                  {pendingOrdersCount > 0 ? (
                    <div className="flex items-start space-x-3 rounded-xl bg-amber-50 p-4 border border-amber-100">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-800">Unfulfilled Orders ({pendingOrdersCount})</h4>
                        <p className="mt-0.5 text-xs text-amber-700">
                          You have orders waiting for dispatch. Mark them as Shipped to keep customers informed.
                        </p>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="mt-2 flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          <span>Go to Fulfillment</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3 rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                      <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-800 font-sans">All caught up!</h4>
                        <p className="mt-0.5 text-xs text-emerald-700">
                          You have no pending orders to ship. Nice work!
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <Package className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 font-sans">Product Inventory</h4>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Listing stock levels are healthy. Expand your catalog to attract more buyers.
                      </p>
                      <button
                        onClick={() => openProductModal(null)}
                        className="mt-2 flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        <span>Add New Product</span>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'products' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-bold text-slate-900">Manage Catalog</h3>
                <button
                  onClick={() => openProductModal(null)}
                  className="flex items-center space-x-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow"
                >
                  <Plus className="h-4 w-4" />
                  <span>List New Product</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-slate-300" />
                  <h4 className="mt-4 text-sm font-bold text-slate-700">No products listed</h4>
                  <p className="mt-1 text-xs text-slate-400">List your first product to display it in the store.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="py-3 pr-4">Product Info</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(prod => (
                        <tr key={prod.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 pr-4 flex items-center space-x-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="h-10 w-10 rounded-lg object-cover border border-slate-100 bg-slate-50"
                            />
                            <div>
                              <h4 className="font-bold text-slate-900 line-clamp-1">{prod.name}</h4>
                              <span className="text-[10px] text-slate-400 font-semibold">{prod.brand}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-600">{prod.category}</td>
                          <td className="py-4 px-4 font-bold text-slate-900">${prod.price.toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prod.stock <= 2 
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {prod.stock} left
                            </span>
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <div className="flex justify-end space-x-1.5">
                              <button
                                onClick={() => openProductModal(prod)}
                                className="p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'orders' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-bold text-slate-900">Manage Orders</h3>
                <p className="text-xs text-slate-400">Process shipping status of customer orders below.</p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
                  <h4 className="mt-4 text-sm font-bold text-slate-700 font-sans">No orders received</h4>
                  <p className="mt-1 text-xs text-slate-400">Orders placed on your products will be visible here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => {
                    const sellerItems = order.items.filter(item => item.sellerId === user?.id);
                    const sellerTotal = sellerItems.reduce((sum, i) => sum + (i.productPrice * i.quantity), 0);

                    return (
                      <div key={order.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-150 pb-3.5 mb-4">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Order ID</span>
                            <h4 className="font-mono text-sm font-bold text-slate-900">{order.id}</h4>
                            <span className="text-[10px] text-slate-500 font-medium">Placed: {order.date}</span>
                          </div>
                          
                          <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 text-right uppercase">Your Subtotal</span>
                              <span className="block text-sm font-black text-blue-600 text-right">${sellerTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Customer & Shipping info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs font-medium">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Buyer Contact</span>
                            <span className="block text-slate-800 mt-1">{order.shippingName} ({order.email})</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Shipping Address</span>
                            <span className="block text-slate-700 mt-1">
                              {order.shippingAddress}, {order.shippingCity}, {order.shippingZip}
                            </span>
                          </div>
                        </div>

                        {/* Items listed */}
                        <div className="bg-white rounded-lg border border-slate-150 overflow-hidden divide-y divide-slate-100">
                          {sellerItems.map(item => (
                            <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="h-10 w-10 rounded object-cover border border-slate-100 bg-slate-50"
                                />
                                <div>
                                  <h5 className="font-bold text-slate-900">{item.productName}</h5>
                                  <span className="text-[10px] text-slate-400">Qty: {item.quantity} × ${item.productPrice.toLocaleString()}</span>
                                </div>
                              </div>
                              <span className="font-bold text-slate-800">${(item.productPrice * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'profile' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-bold text-slate-900">Store Settings</h3>
                <p className="text-xs text-slate-400">Customize your public store page details.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Display Store Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter store name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-850 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Store Bio / Description</label>
                  <textarea
                    rows={4}
                    placeholder="Tell buyers about your products, shipping speed, and history..."
                    value={storeDesc}
                    onChange={(e) => setStoreDesc(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-850 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow"
                  >
                    Save Store Profile
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product Listing' : 'List New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-750 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony WH-1000XM4 Noise Canceling Headphones"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony, Apple, Nike"
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value as Product['category'] })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Sports">Sports</option>
                    <option value="Books">Books</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Toys">Toys</option>
                    <option value="Grocery">Grocery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Inventory Stock Level</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Promo Badge / Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. BESTSELLER, 20% OFF"
                    value={prodForm.badge}
                    onChange={(e) => setProdForm({ ...prodForm, badge: e.target.value })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">List Price ($)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Original Price ($) (Before Discount)</label>
                  <input
                    type="number"
                    min={0}
                    value={prodForm.originalPrice}
                    onChange={(e) => setProdForm({ ...prodForm, originalPrice: Number(e.target.value) })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Main Product Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/image.jpg"
                  value={prodForm.image}
                  onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Gallery Image URLs (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  value={prodForm.imagesStr}
                  onChange={(e) => setProdForm({ ...prodForm, imagesStr: e.target.value })}
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Product Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your product details..."
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500"
                />
              </div>

              {/* Specifications Management Section */}
              <div className="border-t border-slate-100 pt-4">
                <span className="block text-xs font-bold text-slate-700">Technical Specifications</span>
                <p className="text-[10px] text-slate-400 mb-2">Add product parameters like Color, Weight, Dimensions, Battery Life, etc.</p>

                {/* Specs List */}
                {specsList.length > 0 && (
                  <div className="mb-3 rounded-lg border border-slate-150 bg-slate-50 p-2 space-y-1.5 max-h-36 overflow-y-auto">
                    {specsList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-100">
                        <span className="font-semibold text-slate-600">{item.key}:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-800">{item.value}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(idx)}
                            className="text-rose-500 hover:text-rose-700 p-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new Spec row */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. Model Number"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="e.g. WH-1000XM4"
                    value={newSpecVal}
                    onChange={(e) => setNewSpecVal(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="flex items-center space-x-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow"
                >
                  Save Product Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
