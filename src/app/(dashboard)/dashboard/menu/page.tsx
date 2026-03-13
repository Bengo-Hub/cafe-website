'use client';

import { Badge, Button, Card } from '@/components/ui';
import {
    type MenuCategory,
    type MenuItem,
    createCategory,
    createMenuItem,
    deleteMenuItem,
    fetchCategories,
    fetchMenuItems,
    updateMenuItem,
} from '@/lib/api/catalog';
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

  // Form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    category_id: '',
    prep_time_minutes: 0,
  });

  const { data: categoriesRes, isLoading: loadingCategories } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: fetchCategories,
  });

  const categories = categoriesRes?.data ?? [];

  const { data: itemsRes, isLoading: loadingItems } = useQuery({
    queryKey: ['catalog-items', selectedCategoryId, search],
    queryFn: () =>
      fetchMenuItems({
        category_id: selectedCategoryId || undefined,
        search: search || undefined,
        limit: 100,
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
    mutationFn: () =>
      createMenuItem({
        name: newItem.name,
        description: newItem.description || undefined,
        sku: newItem.sku,
        price: newItem.price,
        category_id: newItem.category_id || selectedCategoryId || '',
        prep_time_minutes: newItem.prep_time_minutes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
      setNewItem({ name: '', description: '', sku: '', price: 0, category_id: '', prep_time_minutes: 0 });
      setShowAddItem(false);
    },
  });

  const saveEdit = useMutation({
    mutationFn: () => {
      if (!editingItem) throw new Error('No item to edit');
      return updateMenuItem(editingItem.id, {
        name: editingItem.name,
        description: editingItem.description || undefined,
        price: editingItem.price,
        is_available: editingItem.is_available,
        is_featured: editingItem.is_featured,
        prep_time_minutes: editingItem.prep_time_minutes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
      setEditingItem(null);
    },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary-brand md:text-4xl">
            Menu Management
          </h1>
          <p className="font-light text-secondary-brand">
            Manage categories, items, pricing, and availability.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddCategory(true)}
            variant="outline"
            className="h-10 rounded-xl border-brand-beige/10 text-primary-brand"
          >
            <Plus className="mr-2 h-4 w-4" /> Category
          </Button>
          <Button
            onClick={() => setShowAddItem(true)}
            className="h-10 rounded-xl bg-brand-orange text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Menu Item
          </Button>
        </div>
      </header>

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
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-brand opacity-40" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-56 rounded-xl border border-brand-beige/10 bg-brand-beige/5 pl-10 pr-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Items grid */}
      {loadingCategories || loadingItems ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ChefHat className="mb-3 h-10 w-10 text-secondary-brand opacity-30" />
          <p className="text-lg font-bold text-primary-brand">No menu items found</p>
          <p className="text-sm text-secondary-brand">
            {search ? 'Try a different search.' : 'Add your first menu item to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: MenuItem) => (
            <Card key={item.id} className="relative overflow-hidden border border-brand-beige/10 p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-black text-primary-brand">{item.name}</h3>
                  {item.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-secondary-brand">{item.description}</p>
                  )}
                </div>
                <span className="ml-2 text-lg font-black text-brand-orange">
                  {formatCurrency(item.price, item.currency)}
                </span>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                <Badge className={item.is_available ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </Badge>
                {item.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600">Featured</Badge>}
                {item.prep_time_minutes && (
                  <Badge className="bg-blue-500/10 text-blue-600">{item.prep_time_minutes} min</Badge>
                )}
                <Badge className="bg-brand-beige/10 text-secondary-brand">{item.sku}</Badge>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleAvailability.mutate({ id: item.id, available: !item.is_available })}
                  className="rounded-lg p-2 hover:bg-brand-beige/10"
                  title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                >
                  {item.is_available ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                </button>
                <button
                  onClick={() => toggleFeatured.mutate({ id: item.id, featured: !item.is_featured })}
                  className="rounded-lg p-2 hover:bg-brand-beige/10"
                  title={item.is_featured ? 'Unfeature' : 'Feature'}
                >
                  <Star className={`h-4 w-4 ${item.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-brand'}`} />
                </button>
                <Link
                  href={`/dashboard/inventory?search=${item.sku}`}
                  className="rounded-lg p-2 hover:bg-brand-orange/10 text-brand-orange"
                  title="Manage Recipe / Stock"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button onClick={() => setEditingItem({ ...item })} className="rounded-lg p-2 hover:bg-brand-beige/10" title="Edit">
                  <Edit2 className="h-4 w-4 text-secondary-brand" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${item.name}"?`)) removeItem.mutate(item.id);
                  }}
                  className="rounded-lg p-2 hover:bg-red-500/10"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <CrudModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title="Add Category"
        description="Create a new menu category"
        onSubmit={(e) => {
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
        onSubmit={(e) => {
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
          onSubmit={(e) => {
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
