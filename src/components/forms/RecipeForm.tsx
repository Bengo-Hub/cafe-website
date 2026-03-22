import { useState } from 'react';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { type Recipe } from '@/lib/api/recipes';
import { fetchUnits, createUnit, fetchInventoryItems, type Unit, type InventoryItem } from '@/lib/api/inventory';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CrudModal } from '@/components/dashboard/CrudModal';

const recipeSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Recipe name is required'),
  output_qty: z.number().positive(),
  unit_of_measure: z.string().default('PORTION'),
  is_active: z.boolean().default(true),
  ingredients: z.array(z.object({
    item_id: z.string().uuid('Invalid inventory item selection'),
    item_sku: z.string().min(1),
    quantity: z.number().positive(),
    unit_of_measure: z.string(),
    notes: z.string().optional(),
  })).min(1, 'At least one ingredient is required'),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: RecipeFormValues) => void;
  isLoading?: boolean;
}

export default function RecipeForm({ initialData, onSubmit, isLoading }: RecipeFormProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', abbreviation: '' });
  const [activeUnitField, setActiveUnitField] = useState<string | null>(null);

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialData ?? {
      sku: '',
      name: '',
      output_qty: 1,
      unit_of_measure: 'PORTION',
      is_active: true,
      ingredients: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const { data: units = [], isLoading: loadingUnits } = useQuery({
    queryKey: ['inventory-units'],
    queryFn: fetchUnits,
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: fetchInventoryItems,
  });
  const inventoryItems: InventoryItem[] = inventoryData?.data ?? [];

  const addUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: (unit) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-units'] });
      setShowAddUnit(false);
      setNewUnit({ name: '', abbreviation: '' });
      if (activeUnitField === 'recipe') {
        setValue('unit_of_measure', unit.name);
      } else if (activeUnitField?.startsWith('ingredient-')) {
        const index = parseInt(activeUnitField.split('-')[1]);
        setValue(`ingredients.${index}.unit_of_measure`, unit.name);
      }
    }
  });

  const filteredInventory = inventoryItems.filter((item: InventoryItem) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-primary-brand">Menu Item SKU</label>
          <Input 
            {...register('sku')} 
            placeholder="e.g. BEV-ESP-001" 
            className="rounded-xl border-brand-beige/20"
          />
          {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-primary-brand">Recipe Name</label>
          <Input 
            {...register('name')} 
            placeholder="e.g. Espresso Double Shot" 
            className="rounded-xl border-brand-beige/20"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-primary-brand">Output Quantity</label>
          <Input 
            type="number" 
            {...register('output_qty', { valueAsNumber: true })} 
            className="rounded-xl border-brand-beige/20"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-primary-brand">Unit of Measure</label>
            <button 
              type="button" 
              onClick={() => { setShowAddUnit(true); setActiveUnitField('recipe'); }}
              className="text-[10px] font-black text-brand-orange hover:underline"
            >
              + NEW UNIT
            </button>
          </div>
          <select 
            {...register('unit_of_measure')}
            className="flex h-10 w-full rounded-xl border border-brand-beige/20 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingUnits ? <option>Loading units...</option> : units.map((u: Unit) => (
              <option key={u.id} value={u.name}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>
            ))}
            {units.length === 0 && !loadingUnits && <option value="PORTION">PORTION</option>}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-primary-brand">Ingredients (BOM)</h3>
          <p className="text-xs text-secondary-brand">Add raw items from inventory</p>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.id} className="p-4 border-brand-beige/10 bg-brand-beige/5 relative group">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1 space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-tighter text-secondary-brand opacity-60">Item</label>
                   <Input 
                    value={watch(`ingredients.${index}.item_sku`)} 
                    readOnly 
                    className="bg-transparent border-none font-bold text-primary-brand h-8 px-0"
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-tighter text-secondary-brand opacity-60">Quantity</label>
                   <Input 
                    type="number" 
                    step="0.01"
                    {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })} 
                    className="h-8 rounded-lg border-brand-beige/20"
                   />
                </div>
                <div className="space-y-1">
                   <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black uppercase tracking-tighter text-secondary-brand opacity-60">UOM</label>
                     <button 
                       type="button" 
                       onClick={() => { setShowAddUnit(true); setActiveUnitField(`ingredient-${index}`); }}
                       className="text-[9px] font-black text-brand-orange hover:underline"
                     >
                       + NEW
                     </button>
                   </div>
                   <select 
                    {...register(`ingredients.${index}.unit_of_measure`)}
                    className="flex h-8 w-full rounded-lg border border-brand-beige/20 bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange"
                   >
                     {units.map((u: Unit) => (
                       <option key={u.id} value={u.name}>{u.name}</option>
                     ))}
                     {units.length === 0 && <option value="PIECE">PIECE</option>}
                   </select>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => remove(index)}
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Card>
          ))}
        </div>

        {/* Inventory Item Selector */}
        <div className="p-4 rounded-2xl border-2 border-dashed border-brand-beige/10 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-brand opacity-40" />
            <Input 
              placeholder="Search inventory items to add..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-brand-beige/20 h-10 bg-white"
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto space-y-2">
            {filteredInventory.slice(0, 5).map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-beige/5 transition-colors cursor-pointer border border-transparent hover:border-brand-beige/10"
                onClick={() => {
                  append({
                    item_id: item.id,
                    item_sku: item.sku,
                    quantity: 1,
                    unit_of_measure: 'PIECE',
                  });
                  setSearchTerm('');
                }}
              >
                <div>
                  <p className="text-sm font-bold text-primary-brand">{item.name}</p>
                  <p className="text-[10px] font-mono text-secondary-brand uppercase">{item.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-brand-beige/10 px-2 py-0.5 rounded-full font-bold text-secondary-brand">
                    {item.type}
                  </span>
                  <Plus className="h-4 w-4 text-brand-orange" />
                </div>
              </div>
            ))}
            {searchTerm && filteredInventory.length === 0 && (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-secondary-brand font-medium">No matching items found in inventory</p>
                <Link 
                  href="/dashboard/inventory?action=add" 
                  className="inline-flex items-center gap-2 text-xs font-black text-brand-orange hover:underline uppercase tracking-widest"
                >
                  <Plus className="h-3 w-3" /> Create New Inventory Item
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real Unit Suggestions */}
      {!loadingUnits && units.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          <p className="w-full text-[10px] font-black text-secondary-brand opacity-40 uppercase tracking-widest mb-1">Quick Suggestions</p>
          {units.slice(0, 8).map((u: Unit) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setValue('unit_of_measure', u.name)}
              className="text-[10px] font-bold text-secondary-brand/60 hover:text-brand-orange border border-brand-beige/20 px-2 py-1 rounded-md transition-colors"
            >
              {u.name}
            </button>
          ))}
        </div>
      )}

      {/* Add Unit Modal */}
      <CrudModal
        isOpen={showAddUnit}
        onClose={() => setShowAddUnit(false)}
        title="Create New Unit"
        description="Add a new unit of measure to the inventory system"
        onSubmit={(e: any) => {
          e.preventDefault();
          addUnitMutation.mutate(newUnit);
        }}
        submitLabel="Create Unit"
        isSubmitting={addUnitMutation.isPending}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary-brand">Unit Name</label>
            <Input 
              value={newUnit.name}
              onChange={(e: any) => setNewUnit({ ...newUnit, name: e.target.value })}
              placeholder="e.g. Kilogram"
              className="rounded-xl border-brand-beige/20"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary-brand">Abbreviation (Optional)</label>
            <Input 
              value={newUnit.abbreviation}
              onChange={(e: any) => setNewUnit({ ...newUnit, abbreviation: e.target.value })}
              placeholder="e.g. kg"
              className="rounded-xl border-brand-beige/20"
            />
          </div>
        </div>
      </CrudModal>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="rounded-xl bg-brand-orange text-white h-12 px-8 font-black flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : initialData ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </div>
    </form>
  );
}
