import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Search } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { type Recipe } from '@/lib/api/recipes';
import { api } from '@/lib/api/client';

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
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, control, handleSubmit, formState: { errors }, watch } = useForm<RecipeFormValues>({
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

  useEffect(() => {
    // Fetch inventory items for selection
    api.get('/catalog/items').then(res => {
      setInventoryItems(res.data.data || []);
    });
  }, []);

  const filteredInventory = inventoryItems.filter(item => 
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
          <label className="text-sm font-bold text-primary-brand">Unit of Measure</label>
          <Input 
            {...register('unit_of_measure')} 
            placeholder="PORTION" 
            className="rounded-xl border-brand-beige/20"
          />
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
                   <label className="text-[10px] font-black uppercase tracking-tighter text-secondary-brand opacity-60">UOM</label>
                   <Input 
                    {...register(`ingredients.${index}.unit_of_measure`)} 
                    className="h-8 rounded-lg border-brand-beige/20"
                   />
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
                    unit_of_measure: item.unit_of_measure,
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
                    {item.unit_of_measure}
                  </span>
                  <Plus className="h-4 w-4 text-brand-orange" />
                </div>
              </div>
            ))}
            {searchTerm && filteredInventory.length === 0 && (
              <p className="text-center text-xs text-secondary-brand py-4">No matching items found</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="rounded-xl bg-brand-orange text-white h-12 px-8 font-black flex items-center gap-2"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </div>
    </form>
  );
}
