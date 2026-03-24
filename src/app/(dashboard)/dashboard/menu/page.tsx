'use client';

import { Badge, Button, Pagination } from '@/components/ui';
import {
    type MenuCategory,
    type MenuItem,
    fetchCategories,
    fetchMenuItems,
    fetchOutlets,
    createCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from '@/lib/api/catalog';
import { recipesApi } from '@/lib/api/recipes';
import { getMediaUrl } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    ChefHat,
    Edit2,
    Loader2,
    Plus,
    Search,
    Star,
    ToggleLeft,
    ToggleRight,
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
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    basePrice: 0,
    categoryId: '',
    leadTimeMinutes: 0,
    imageUrl: '',
    outletId: '',
    addToAllOutlets: false,
    recipe_output_qty: 1,
    recipe_unit: 'PORTION',
    recipe_ingredients: [] as any[],
  });

  const { data: outletsRes } = useQuery({
    queryKey: ['catalog-outlets'],
    queryFn: fetchOutlets,
  });
  const defaultOutletId = (outletsRes?.data ?? [])[0]?.id ?? '';

  const { data: categoriesRes, isLoading: loadingCategories } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: fetchCategories,
  });

  const categories = categoriesRes?.data ?? [];

  const outlets = outletsRes?.data ?? [];

  const { data: itemsRes, isLoading: loadingItems } = useQuery({
    queryKey: ['catalog-items', selectedCategoryId, selectedOutletId, search, availabilityFilter, page],
    queryFn: () =>
      fetchMenuItems({
        category_id: selectedCategoryId || undefined,
        outlet_id: selectedOutletId || undefined,
        search: search || undefined,
        is_available: availabilityFilter === 'available' ? true : availabilityFilter === 'unavailable' ? false : undefined,
        limit: pageSize,
        page: page,
      }),
  });

  const itemsData = itemsRes?.data;
  const items = itemsData?.data ?? [];

  const { data: allRecipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => recipesApi.list(),
  });

  const toggleAvailability = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      updateMenuItem(id, { isAvailable: available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
      toast.success('Availability updated');
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      updateMenuItem(id, { isFeatured: featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
      toast.success('Featured status updated');
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
      toast.success('Item deleted');
    },
    onError: (err: Error) => toast.error(`Failed to delete: ${err.message}`),
  });

  const addCategory = useMutation({
    mutationFn: (name: string) => createCategory({ name, outletId: defaultOutletId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-categories'] });
      setNewCategoryName('');
      setShowAddCategory(false);
      toast.success('Category created');
    },
    onError: (err: Error) => toast.error(`Failed to create category: ${err.message}`),
  });

  const addItem = useMutation({
    mutationFn: async () => {
      // 1. Create inventory item (auto-generates SKU)
      const { createInventoryItem } = await import('@/lib/api/inventory');
      const invItem = await createInventoryItem({
        name: newItem.name,
        description: newItem.description,
        type: 'RECIPE',
        initial_quantity: 1,
        reorder_level: 1,
        image_url: newItem.imageUrl,
        add_to_all_outlets: newItem.addToAllOutlets,
      });

      const sku = invItem.sku;

      // 2. Create Recipe with BOM ingredients (optional)
      const bomIngredients = (newItem.recipe_ingredients ?? []).map((ing: any, idx: number) => ({
        item_id: ing.item_id,
        item_sku: ing.item_sku,
        quantity: ing.quantity,
        unit_of_measure: ing.unit_of_measure,
        display_order: idx,
      }));

      try {
        await recipesApi.create({
          name: newItem.name,
          sku,
          output_qty: newItem.recipe_output_qty,
          unit_of_measure: newItem.recipe_unit,
          ingredients: bomIngredients,
          is_active: true,
        });
      } catch {
        // Recipe creation is optional — continue with menu item
      }

      // 3. Create Menu Item in catalog
      return createMenuItem({
        categoryId: newItem.categoryId || (categories[0]?.id ?? ''),
        outletId: newItem.outletId || defaultOutletId,
        name: newItem.name,
        description: newItem.description,
        sku,
        basePrice: Number(newItem.basePrice),
        imageUrl: newItem.imageUrl,
        leadTimeMinutes: Number(newItem.leadTimeMinutes),
        isAvailable: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setShowAddItem(false);
      setNewItem({
        name: '',
        description: '',
        basePrice: 0,
        categoryId: '',
        leadTimeMinutes: 0,
        imageUrl: '',
        outletId: '',
        addToAllOutlets: false,
        recipe_output_qty: 1,
        recipe_unit: 'PORTION',
        recipe_ingredients: [],
      });
      toast.success('Menu item created');
    },
    onError: (err: Error) => toast.error(`Failed to create item: ${err.message}`),
  });

  const saveEdit = useMutation({
    mutationFn: async () => {
      if (!editingItem) return Promise.reject();

      // Update the menu item (including category reassignment)
      const result = await updateMenuItem(editingItem.id, {
        categoryId: editingItem.categoryId,
        name: editingItem.name,
        description: editingItem.description,
        basePrice: Number(editingItem.basePrice),
        imageUrl: editingItem.imageUrl,
        isAvailable: editingItem.isAvailable,
        isFeatured: editingItem.isFeatured,
        leadTimeMinutes: editingItem.leadTimeMinutes,
      });

      // Update recipe BOM if ingredients were modified
      const bomIngredients = ((editingItem as any).recipe_ingredients ?? []).map((ing: any, idx: number) => ({
        item_id: ing.item_id,
        item_sku: ing.item_sku,
        quantity: ing.quantity,
        unit_of_measure: ing.unit_of_measure,
        display_order: idx,
      }));

      if (bomIngredients.length > 0 && editingItem.sku) {
        try {
          const existingRecipes = await recipesApi.list();
          const existingRecipe = existingRecipes.find(r => r.sku === editingItem.sku);

          if (existingRecipe?.id) {
            await recipesApi.update(existingRecipe.id, {
              ...existingRecipe,
              output_qty: (editingItem as any).recipe_output_qty ?? existingRecipe.output_qty,
              unit_of_measure: (editingItem as any).recipe_unit ?? existingRecipe.unit_of_measure,
              ingredients: bomIngredients,
            });
          } else {
            await recipesApi.create({
              name: editingItem.name,
              sku: editingItem.sku,
              output_qty: (editingItem as any).recipe_output_qty ?? 1,
              unit_of_measure: (editingItem as any).recipe_unit ?? 'PORTION',
              ingredients: bomIngredients,
              is_active: true,
            });
          }
        } catch {
          // Recipe update is best-effort — menu item was already saved
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setEditingItem(null);
      toast.success('Item updated');
    },
    onError: (err: Error) => toast.error(`Failed to update: ${err.message}`),
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
          {outlets.length > 1 && (
            <select
              value={selectedOutletId || ''}
              onChange={(e) => setSelectedOutletId(e.target.value || null)}
              className="h-10 rounded-xl border border-brand-beige/20 bg-white px-3 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
            >
              <option value="">All Outlets</option>
              {outlets.map((o: any) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}
          <select
            value={availabilityFilter}
            onChange={(e) => { setAvailabilityFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-xl border border-brand-beige/20 bg-white px-3 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
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
                      {item.imageUrl ? (
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-brand-beige/10">
                          <img src={getMediaUrl(item.imageUrl)} alt={item.name} className="h-full w-full object-cover" />
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
                      {item.category?.name || item.categoryName || categories.find((c: MenuCategory) => c.id === item.categoryId)?.name || 'Uncategorized'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-brand-orange whitespace-nowrap">
                      {formatCurrency(item.basePrice, item.currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       <Badge className={item.isAvailable ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                       </Badge>
                      {item.isFeatured && <Badge className="bg-yellow-500/10 text-yellow-600">Featured</Badge>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleAvailability.mutate({ id: item.id, available: !item.isAvailable })}
                        className="rounded-lg p-2 hover:bg-brand-beige/10 transition-colors"
                        title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                      >
                        {item.isAvailable ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-red-400" />}
                      </button>
                      <button
                        onClick={() => toggleFeatured.mutate({ id: item.id, featured: !item.isFeatured })}
                        className="rounded-lg p-2 hover:bg-brand-beige/10 transition-colors"
                        title={item.isFeatured ? 'Unfeature' : 'Feature'}
                      >
                        <Star className={`h-4 w-4 ${item.isFeatured ? 'text-yellow-400' : 'text-secondary-brand'}`} fill={item.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                      {item.sku && (
                        <Link
                          href={`/dashboard/inventory?search=${item.sku}`}
                          className="rounded-lg p-2 hover:bg-brand-orange/10 text-brand-orange transition-colors"
                          title="Manage Recipe / Stock"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <button onClick={() => {
                          const recipe = allRecipes.find(r => r.sku === item.sku);
                          setEditingItem({
                            ...item,
                            recipe_output_qty: recipe?.output_qty ?? 1,
                            recipe_unit: recipe?.unit_of_measure ?? 'PORTION',
                            recipe_ingredients: recipe?.ingredients?.map(ing => ({
                              item_id: ing.item_id,
                              item_sku: ing.item_sku,
                              item_name: ing.item_name || ing.item_sku,
                              quantity: ing.quantity,
                              unit_of_measure: ing.unit_of_measure,
                            })) ?? [],
                          } as any);
                        }} className="rounded-lg p-2 hover:bg-brand-beige/10 transition-colors" title="Edit">
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
        {itemsData && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={itemsData.total}
            onPageChange={setPage}
            itemLabel="items"
          />
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
          data={{ ...newItem, categoryId: newItem.categoryId || selectedCategoryId || '' }}
          categories={categories}
          outlets={outlets}
          defaultOutletId={defaultOutletId}
          onChange={(data) => setNewItem(data)}
          onCategoryCreated={(name) => addCategory.mutate(name)}
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
          outlets={outlets}
          defaultOutletId={defaultOutletId}
          onChange={(data) => setEditingItem(data)}
          isEdit
          onCategoryCreated={(name) => addCategory.mutate(name)}
        />
        </CrudModal>
      )}
    </div>
  );
}

function Input(props: any) {
  return <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />;
}
