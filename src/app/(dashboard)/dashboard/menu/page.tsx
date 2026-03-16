'use client';

import { Badge, Button } from '@/components/ui';
import {
    type MenuCategory,
    type MenuItem,
    fetchCategories,
    fetchMenuItems,
    createCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from '@/lib/api/catalog';
import { recipesApi } from '@/lib/api/recipes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ChefHat,
    Edit2,
    Eye,
    EyeOff,
    Loader2,
    Plus,
    Search,
    Star,
    Trash2,
    ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { CrudModal } from '@/components/dashboard/CrudModal';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { MenuItemForm } from '@/components/forms/MenuItemForm';

function formatCurrency(amount: number, currency = 'KES') {
  return `${currency} ${amount.toLocaleString()}`;
}

export default function MenuManagement() {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    category_id: '',
    prep_time_minutes: 0,
    recipe_output_qty: 1,
    recipe_unit: 'PORTION',
  });

  const { data: categoriesRes, isLoading: loadingCategories } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: fetchCategories,
  });

  const categories = categoriesRes?.data ?? [];

  const { data: itemsRes, isLoading: loadingItems } = useQuery({
    queryKey: ['catalog-items', selectedCategoryId, search, page],
    queryFn: () =>
      fetchMenuItems({
        category_id: selectedCategoryId || undefined,
        search: search || undefined,
        limit: pageSize,
        page: page,
      }),
  });

  const itemsData = itemsRes?.data;
  const items = itemsData?.items ?? [];

  const toggleAvailability = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      updateMenuItem(id, { is_available: available }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog-items'] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      updateMenuItem(id, { is_featured: featured }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog-items'] }),
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog-items'] }),
  });

  const addCategory = useMutation({
    mutationFn: (name: string) => createCategory({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-categories'] });
      setNewCategoryName('');
      setShowAddCategory(false);
    },
  });

  const addItem = useMutation({
    mutationFn: async () => {
      // 1. Create Recipe first
      await recipesApi.create({
        name: newItem.name,
        sku: newItem.sku,
        output_qty: newItem.recipe_output_qty,
        unit_of_measure: newItem.recipe_unit,
        ingredients: [], // Initial empty ingredients
        is_active: true,
      });

      // 2. Create Menu Item with recipe reference
      return createMenuItem({
        ...newItem,
        category_id: newItem.category_id || (categories[0]?.id as any),
        price: Number(newItem.price),
        prep_time_minutes: Number(newItem.prep_time_minutes),
        // Note: MenuItem type doesn't have recipe_id in the interface yet, 
        // but we'll include it in the payload if supported by backend.
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
      setShowAddItem(false);
      setNewItem({
        name: '',
        description: '',
        sku: '',
        price: 0,
        category_id: '',
        prep_time_minutes: 0,
        recipe_output_qty: 1,
        recipe_unit: 'PORTION',
      });
    },
  });

  const saveEdit = useMutation({
    mutationFn: () => {
      if (!editingItem) return Promise.reject();
      return updateMenuItem(editingItem.id, {
        name: editingItem.name,
        description: editingItem.description,
        price: Number(editingItem.price),
        is_available: editingItem.is_available,
        is_featured: editingItem.is_featured,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
      setEditingItem(null);
    },
  });

  return (
    <div className="space-y-8 p-6 sm:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary-brand">Menu Management</h1>
          <p className="mt-1 text-secondary-brand opacity-60">
            Create and organize your cafe catalogs and recipes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddCategory(true)}
            variant="outline"
            className="rounded-xl border-brand-beige/20 bg-brand-beige/5 h-12 px-6 font-bold text-primary-brand"
          >
            Add Category
          </Button>
          <Button
            onClick={() => setShowAddItem(true)}
            className="rounded-xl bg-brand-orange text-white h-12 px-6 font-black shadow-lg shadow-brand-orange/20"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Menu Item
          </Button>
        </div>
      </div>

      {/* Category tabs + search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
              !selectedCategoryId
                ? 'bg-foreground text-background'
                : 'bg-brand-beige/5 text-secondary-brand hover:bg-brand-beige/10'
            }`}
          >
            All
          </button>
          {categories.map((cat: MenuCategory) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-foreground text-background'
                  : 'bg-brand-beige/5 text-secondary-brand hover:bg-brand-beige/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-4">
           <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-brand opacity-40" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl border-brand-beige/20 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="overflow-hidden rounded-2xl border border-brand-beige/10 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-beige/5 bg-brand-beige/5">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-60">
                Item Details
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-60">
                Category
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-60 text-right">
                Price
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-60">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-60 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-beige/5">
            {loadingCategories || loadingItems ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-orange" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <ChefHat className="mx-auto mb-3 h-10 w-10 text-secondary-brand opacity-30" />
                  <p className="text-lg font-bold text-primary-brand">No menu items found</p>
                  <p className="text-sm text-secondary-brand">
                    {search ? 'Try a different search.' : 'Add your first menu item to get started.'}
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item: MenuItem) => (
                <tr key={item.id} className="group hover:bg-brand-beige/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image_url || item.imageUrl ? (
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-brand-beige/10">
                          <img src={item.image_url || item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-brand-beige/10 flex items-center justify-center text-lg">
                          🍽️
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-primary-brand">{item.name}</p>
                        <p className="text-[10px] font-mono text-secondary-brand uppercase tracking-tighter opacity-60">{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-brand-beige/10 text-secondary-brand whitespace-nowrap">
                      {categories.find((c: MenuCategory) => c.id === (item.category_id || item.categoryId))?.name || 'Uncategorized'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-brand-orange whitespace-nowrap">
                      {formatCurrency(item.price, item.currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       <Badge className={item.is_available ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                       </Badge>
                      {item.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600">Featured</Badge>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleAvailability.mutate({ id: item.id, available: !item.is_available })}
                        className="rounded-lg p-2 hover:bg-brand-beige/10 transition-colors"
                        title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                      >
                        {item.is_available ? <EyeOff className="h-4 w-4 text-red-400" /> : <Eye className="h-4 w-4 text-green-500" />}
                      </button>
                      <button
                        onClick={() => toggleFeatured.mutate({ id: item.id, featured: !item.is_featured })}
                        className="rounded-lg p-2 hover:bg-brand-beige/10 transition-colors"
                        title={item.is_featured ? 'Unfeature' : 'Feature'}
                      >
                        <Star className={`h-4 w-4 ${item.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-brand'}`} />
                      </button>
                      <Link
                        href={`/dashboard/inventory?search=${item.sku}`}
                        className="rounded-lg p-2 hover:bg-brand-orange/10 text-brand-orange transition-colors"
                        title="Manage Recipe / Stock"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button onClick={() => setEditingItem({ ...item })} className="rounded-lg p-2 hover:bg-brand-beige/10 transition-colors" title="Edit">
                        <Edit2 className="h-4 w-4 text-secondary-brand" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.name}"?`)) removeItem.mutate(item.id);
                        }}
                        className="rounded-lg p-2 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {itemsData && itemsData.total > pageSize && (
          <div className="flex items-center justify-between border-t border-brand-beige/10 bg-brand-beige/5 px-6 py-4">
            <p className="text-xs text-secondary-brand">
              Showing <span className="font-bold text-primary-brand">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-primary-brand">
                {Math.min(page * pageSize, itemsData.total)}
              </span>{' '}
              of <span className="font-bold text-primary-brand">{itemsData.total}</span> items
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="h-8 rounded-lg border-brand-beige/10 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * pageSize >= itemsData.total}
                onClick={() => setPage(p => p + 1)}
                className="h-8 rounded-lg border-brand-beige/10 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <CrudModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title="Add Category"
        description="Create a new menu category"
        onSubmit={(e: any) => {
          e.preventDefault();
          addCategory.mutate(newCategoryName);
        }}
        submitLabel="Add Category"
        isSubmitting={addCategory.isPending}
      >
        <CategoryForm
          name={newCategoryName}
          onChange={setNewCategoryName}
        />
      </CrudModal>

      {/* Add Item Modal */}
      <CrudModal
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        title="Add Menu Item"
        description="Create a new item in the catalog"
        onSubmit={(e: any) => {
          e.preventDefault();
          addItem.mutate();
        }}
        submitLabel="Add Item"
        isSubmitting={addItem.isPending}
        size="lg"
      >
        <MenuItemForm
          data={{ ...newItem, category_id: newItem.category_id || selectedCategoryId || '' }}
          categories={categories}
          onChange={(data) => setNewItem(data)}
        />
      </CrudModal>

      {/* Edit Item Modal */}
      {editingItem && (
        <CrudModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title="Edit Menu Item"
          description={`Updating details for ${editingItem.name}`}
          onSubmit={(e: any) => {
            e.preventDefault();
            saveEdit.mutate();
          }}
          submitLabel="Save Changes"
          isSubmitting={saveEdit.isPending}
          size="lg"
        >
        <MenuItemForm
          data={editingItem}
          categories={categories}
          onChange={(data) => setEditingItem(data)}
          isEdit
        />
        </CrudModal>
      )}
    </div>
  );
}

function Input(props: any) {
  return <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />;
}
