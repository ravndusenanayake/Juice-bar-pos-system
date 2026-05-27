'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Plus, RefreshCw, ShoppingCart, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  category_id: number;
  product_type: 'FINISHED' | 'RECIPE';
  price: string | number;
  quantity: number;
  image: string | null;
  status: boolean;
  category: Category;
}

export default function ProductsPage() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Product Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newProductType, setNewProductType] = useState<'FINISHED' | 'RECIPE'>('FINISHED');
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newStatus, setNewStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve products database');
      }

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error occurred while loading products';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      setSubmitError('Product name is required.');
      return;
    }
    if (!newCategoryId) {
      setSubmitError('Category selection is required.');
      return;
    }
    const parsedPrice = parseFloat(newPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setSubmitError('Price must be a valid non-negative number.');
      return;
    }
    
    const parsedQty = newProductType === 'RECIPE' ? 0 : parseInt(newQuantity, 10);
    if (newProductType === 'FINISHED' && (isNaN(parsedQty) || parsedQty < 0)) {
      setSubmitError('Quantity must be a valid non-negative integer.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProductName.trim(),
          category_id: Number(newCategoryId),
          product_type: newProductType,
          price: parsedPrice,
          quantity: parsedQty,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      // Reset states and close modal
      setNewProductName('');
      setNewCategoryId('');
      setNewProductType('FINISHED');
      setNewPrice('');
      setNewQuantity('');
      setNewStatus(true);
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error occurred while saving product';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Authorization Guard: Super Admin Access Only
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
  if (!isSuperAdmin) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 animate-bounce">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Access Privileges Insufficient</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          This secure database view is restricted to Super Administrator roles only. Please contact system support for authorization.
        </p>
      </div>
    );
  }

  // Helper to format currency
  const formatPrice = (price: string | number) => {
    const num = Number(price);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  // Helper to render Stock badge dynamically
  const renderStockBadge = (product: Product) => {
    if (product.product_type === 'RECIPE') {
      return (
        <span className="text-xs text-slate-500 font-medium italic">
          N/A (Recipe Type)
        </span>
      );
    }

    const qty = product.quantity;
    if (qty === 0) {
      return (
        <Badge className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
          Out of Stock (0)
        </Badge>
      );
    }
    if (qty <= 5) {
      return (
        <Badge className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] font-bold">
          Low Stock ({qty})
        </Badge>
      );
    }
    return (
      <Badge className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
        Healthy ({qty})
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-200">Products Inventory</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and view catalog pricing, stock levels, and classifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchProducts} 
            className="border-slate-800 text-slate-300 bg-slate-900/40 hover:bg-slate-900/80"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button 
            size="sm" 
            onClick={() => {
              setNewProductName('');
              setNewCategoryId('');
              setNewProductType('FINISHED');
              setNewPrice('');
              setNewQuantity('');
              setNewStatus(true);
              setSubmitError(null);
              setIsAddModalOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-all duration-200 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
          <p className="text-sm text-slate-400 font-medium animate-pulse">Syncing products from POS...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          ⚠️ {error}
          <div className="mt-4">
            <Button onClick={fetchProducts} variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
              Retry Sync
            </Button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-slate-900 border-dashed bg-slate-950/10 p-20 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-500 mb-4">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No Products Registered</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Get started by registering a product item. Click the &quot;Add Product&quot; button above.
          </p>
        </div>
      ) : (
        /* Products Data Table */
        <div className="rounded-xl border border-slate-900 bg-slate-900/40 backdrop-blur-md overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900/80 border-slate-800">
              <TableRow className="border-slate-900 hover:bg-slate-900/80">
                <TableHead className="w-[80px] text-slate-400 font-bold">Code</TableHead>
                <TableHead className="text-slate-400 font-bold">Product Item</TableHead>
                <TableHead className="text-slate-400 font-bold">Category</TableHead>
                <TableHead className="w-[120px] text-slate-400 font-bold text-center">Type</TableHead>
                <TableHead className="w-[100px] text-slate-400 font-bold text-right">Price</TableHead>
                <TableHead className="w-[150px] text-slate-400 font-bold text-center">Inventory Level</TableHead>
                <TableHead className="w-[100px] text-slate-400 font-bold text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-slate-800">
              {products.map((product) => (
                <TableRow key={product.id} className="border-slate-900 hover:bg-slate-900/40 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-500 font-semibold">
                    #PRD-{product.id.toString().padStart(3, '0')}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-200">{product.name}</TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {product.category?.name || 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider ${
                      product.product_type === 'FINISHED' 
                        ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5' 
                        : 'border-amber-500/30 text-amber-400 bg-amber-500/5'
                    }`}>
                      {product.product_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-emerald-400">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderStockBadge(product)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      product.status 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/25'
                    }`}>
                      {product.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Product Glassmorphic Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with elegant blur */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => {
              if (!submitting) {
                setIsAddModalOpen(false);
                setSubmitError(null);
              }
            }}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Create Product</h3>
                  <p className="text-xs text-slate-400">Register a new catalog item</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSubmitError(null);
                }}
                disabled={submitting}
                className="h-8 w-8 rounded-lg border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 p-3.5 mb-4 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="font-medium">{submitError}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1.5">
                <Label htmlFor="product-name" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Product Name
                </Label>
                <Input
                  id="product-name"
                  type="text"
                  placeholder="e.g. Avocado Shake, Green Detox"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  disabled={submitting}
                  className="h-10 border-slate-850 bg-slate-900/40 text-slate-200 placeholder:text-slate-605 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/10"
                  required
                  autoFocus
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <Label htmlFor="product-category" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Classification Category
                </Label>
                <select
                  id="product-category"
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  disabled={submitting}
                  className="h-10 w-full rounded-lg border border-slate-850 bg-slate-900/40 px-2.5 py-1 text-slate-200 focus:border-emerald-500/50 outline-none focus:ring-1 focus:ring-emerald-500/50 md:text-sm text-sm"
                  required
                >
                  <option value="" disabled className="bg-slate-950 text-slate-500">
                    -- Select Category --
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-950 text-slate-200">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Type Toggle */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Product Type
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewProductType('FINISHED');
                    }}
                    disabled={submitting}
                    className={`flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all border ${
                      newProductType === 'FINISHED'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-900/10 border-slate-900 text-slate-500 hover:bg-slate-900/40 hover:text-slate-400'
                    }`}
                  >
                    Finished Good
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProductType('RECIPE');
                      setNewQuantity('0');
                    }}
                    disabled={submitting}
                    className={`flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all border ${
                      newProductType === 'RECIPE'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/5'
                        : 'bg-slate-900/10 border-slate-900 text-slate-500 hover:bg-slate-900/40 hover:text-slate-400'
                    }`}
                  >
                    Recipe Item
                  </button>
                </div>
              </div>

              {/* Price & Quantity Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="product-price" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Unit Price ($)
                  </Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 5.50"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    disabled={submitting}
                    className="h-10 border-slate-850 bg-slate-900/40 text-slate-200 placeholder:text-slate-605 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="product-qty" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Inventory Stock
                  </Label>
                  <Input
                    id="product-qty"
                    type="number"
                    min="0"
                    placeholder={newProductType === 'RECIPE' ? 'N/A' : 'e.g. 20'}
                    value={newProductType === 'RECIPE' ? '' : newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    disabled={submitting || newProductType === 'RECIPE'}
                    className="h-10 border-slate-850 bg-slate-900/40 text-slate-200 placeholder:text-slate-605 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/10 disabled:opacity-40 disabled:bg-slate-900/10 disabled:cursor-not-allowed"
                    required={newProductType === 'FINISHED'}
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Initial Status
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewStatus(true)}
                    disabled={submitting}
                    className={`flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all border ${
                      newStatus
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-900/10 border-slate-900 text-slate-500 hover:bg-slate-900/40 hover:text-slate-400'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${newStatus ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    Active Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus(false)}
                    disabled={submitting}
                    className={`flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all border ${
                      !newStatus
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-md shadow-red-500/5'
                        : 'bg-slate-900/10 border-slate-900 text-slate-500 hover:bg-slate-900/40 hover:text-slate-400'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${!newStatus ? 'bg-red-400' : 'bg-slate-600'}`} />
                    Inactive Status
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 mt-2 border-t border-slate-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setSubmitError(null);
                  }}
                  disabled={submitting}
                  className="border-slate-850 bg-slate-900/20 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 rounded-xl px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl px-5 transition-all duration-200 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      Creating...
                    </div>
                  ) : (
                    'Create Product'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
