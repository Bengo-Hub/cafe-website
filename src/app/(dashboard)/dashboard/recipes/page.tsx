'use client';

import { useState } from 'react';
import { Badge, Button, Card, Pagination } from '@/components/ui';
import { fetchMenuItems, type MenuItem } from '@/lib/api/catalog';
import { recipesApi, type Recipe } from '@/lib/api/recipes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Link2, Loader2, Plus, Edit2, Trash2, X, Search, SlidersHorizontal } from 'lucide-react';
import RecipeForm from '@/components/forms/RecipeForm';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export default function RecipesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: itemsRes, isLoading: itemsLoading } = useQuery({
    queryKey: ['catalog-items-recipes', page],
    queryFn: () => fetchMenuItems({ limit: PAGE_SIZE, page }),
  });

  const { data: recipesRes, isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes', page, PAGE_SIZE],
    queryFn: () => recipesApi.list({ page, limit: PAGE_SIZE }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Recipe) => recipesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      closeModal();
      toast.success('Recipe created');
    },
    onError: (err: Error) => toast.error(`Failed to create recipe: ${err.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Recipe) => recipesApi.update(data.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      closeModal();
      toast.success('Recipe updated');
    },
    onError: (err: Error) => toast.error(`Failed to update recipe: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recipesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setDeleteTarget(null);
      toast.success('Recipe deleted');
    },
    onError: (err: Error) => toast.error(`Failed to delete: ${err.message}`),
  });

  const allRecipes: Recipe[] = recipesRes?.data ?? [];
  const recipeTotal = recipesRes?.total ?? 0;

  // Build a map from SKU → recipe for the current page of menu items
  const recipeMap = new Map(allRecipes.map(r => [r.sku, r]));

  // Apply client-side search and status filters to the loaded items
  const items = (itemsRes?.data?.data ?? []).filter((item: MenuItem) => {
    const recipe = recipeMap.get(item.sku);
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) &&
        !item.sku.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'active') return !!(recipe?.is_active);
    if (statusFilter === 'inactive') return recipe ? !recipe.is_active : false;
    return true;
  });

  const openModal = (recipe?: Recipe) => {
    if (recipe) setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingRecipe(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (data: any) => {
    if (editingRecipe) {
      updateMutation.mutate({ ...data, id: editingRecipe.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = itemsLoading || recipesLoading;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary-brand md:text-4xl">
            Recipes &amp; Stock Linkage
          </h1>
          <p className="mt-1 font-light text-secondary-brand">
            Link menu items to inventory BOMs for automatic stock deduction.
          </p>
        </div>
        <Button
          onClick={() => openModal()}
          className="rounded-xl bg-brand-orange text-white h-12 px-6 font-black flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Recipe
        </Button>
      </header>

      <Card className="border border-brand-beige/10 p-5 bg-brand-beige/5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10">
            <Link2 className="h-5 w-5 text-brand-orange" />
          </div>
          <div>
            <h3 className="font-bold text-primary-brand">Automatic Stock Deduction</h3>
            <p className="mt-1 text-sm text-secondary-brand">
              When a recipe is active and its SKU matches a menu item, the inventory service will deduct ingredients from stock on every sale.
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-secondary-brand opacity-40" />
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                statusFilter === s
                  ? 'bg-brand-orange text-white'
                  : 'bg-brand-beige/5 text-secondary-brand hover:bg-brand-beige/10'
              }`}
            >
              {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-brand opacity-40" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 w-56 rounded-xl border border-brand-beige/10 bg-brand-beige/5 pl-10 pr-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary-brand">Active Linkages</h2>
          {!isLoading && (
            <span className="text-xs text-secondary-brand opacity-60 font-medium">
              {items.length} item{items.length !== 1 ? 's' : ''} shown · {recipeTotal} recipes total
            </span>
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-brand-beige/10 rounded-3xl">
            <BookOpen className="mb-3 h-10 w-10 text-secondary-brand opacity-30" />
            <p className="font-bold text-primary-brand">No menu items found</p>
            {(search || statusFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); setPage(1); }}
                className="mt-3 text-sm text-brand-orange hover:underline font-bold"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-brand-beige/10">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="bg-brand-beige/5 text-left text-xs font-black uppercase tracking-widest text-secondary-brand opacity-60">
                  <th className="p-4">Menu Item</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Ingredients</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: MenuItem) => {
                  const recipe = recipeMap.get(item.sku);
                  return (
                    <tr key={item.id} className="border-t border-brand-beige/10 hover:bg-brand-beige/5 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-primary-brand">{item.name}</p>
                      </td>
                      <td className="p-4 font-mono text-xs text-secondary-brand">{item.sku}</td>
                      <td className="p-4">
                        {recipe ? (
                          <Badge className={`text-[10px] border-none ${recipe.is_active ? 'bg-green-500/10 text-green-600' : 'bg-brand-beige/10 text-secondary-brand'}`}>
                            {recipe.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-500 text-[10px] border-none">No Recipe</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {recipe ? (
                          <div className="flex flex-wrap gap-1">
                            {recipe.ingredients.map((ing, i) => (
                              <Badge key={i} className="bg-brand-beige/10 text-[10px] text-secondary-brand border-none">
                                {ing.quantity} {ing.unit_of_measure} {ing.item_sku}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-secondary-brand opacity-50">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {recipe ? (
                          <>
                            <Button
                              onClick={() => openModal(recipe)}
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-brand-orange/10 hover:text-brand-orange"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => setDeleteTarget(recipe)}
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-red-500/10 hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => openModal({ sku: item.sku, name: item.name, output_qty: 1, unit_of_measure: 'PORTION', is_active: true, ingredients: [] })}
                            variant="ghost"
                            className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:bg-brand-orange/10"
                          >
                            Add Recipe
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={itemsRes?.data?.total ?? 0}
        onPageChange={setPage}
        itemLabel="items"
      />

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl space-y-8 relative"
            >
              <button
                onClick={closeModal}
                className="absolute right-8 top-8 h-10 w-10 rounded-full bg-brand-beige/5 flex items-center justify-center text-secondary-brand hover:bg-red-500 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <h2 className="text-3xl font-black text-primary-brand">
                  {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
                </h2>
                <p className="text-secondary-brand font-light">
                  {editingRecipe ? `Updating BOM for SKU: ${editingRecipe.sku}` : 'Define the bill of materials for your menu item.'}
                </p>
              </div>

              <RecipeForm
                key={editingRecipe?.id ?? editingRecipe?.sku ?? 'new'}
                initialData={editingRecipe || undefined}
                onSubmit={handleFormSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl space-y-5">
            <div>
              <h3 className="text-xl font-black text-primary-brand">Delete Recipe?</h3>
              <p className="text-secondary-brand text-sm mt-2">
                The recipe <span className="font-bold text-primary-brand">{deleteTarget.name}</span> (SKU: {deleteTarget.sku}) will be permanently removed. Stock deductions for this menu item will stop.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-11 rounded-xl border border-brand-beige/20 bg-brand-beige/5 text-sm font-bold text-primary-brand hover:bg-brand-beige/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id!)}
                disabled={deleteMutation.isPending}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-black uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
