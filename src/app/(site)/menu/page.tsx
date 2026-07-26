'use client';

import {
    MenuItemCard,
    MenuItemModal
} from '@/components/sections';
import { Badge, Button } from '@/components/ui';
import { config } from '@/config/env';
import { useMenu } from '@/hooks/use-menu';
import { useTenantSlug } from '@/hooks/use-tenant-slug';
import { generateMenuSchema } from '@/lib/utils/schema';
import { MenuItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    LayoutGrid,
    List,
    Search,
    SlidersHorizontal,
    Sparkles,
    UtensilsCrossed,
    X
} from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';
import { useMemo, useState } from 'react';

const ITEMS_PER_PAGE = 8;

export default function MenuPage() {
  const menuSchema = generateMenuSchema();
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { items, isLoading, categories } = useMenu();
  const tenantSlug = useTenantSlug();

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'All Items' || item.category === selectedCategory;
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.dietaryTags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'price') {
          comparison = a.price - b.price;
        } else if (sortBy === 'category') {
          comparison = a.category.localeCompare(b.category);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [items, selectedCategory, searchQuery, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleRedirect = (item: MenuItem, action: 'add-to-cart' | 'view' | 'whitelist') => {
    const orderingPwaUrl = config.services.orderingPwa || 'https://ordering.codevertexafrica.com';
    const redirectUrl = `${orderingPwaUrl}/${tenantSlug}/menu?item_id=${item.id}&action=${action}`;

    window.location.href = redirectUrl;
  };

  const handleOrder = (item: MenuItem) => {
    handleRedirect(item, 'add-to-cart');
    setIsModalOpen(false);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <>
      <Script
        id="menu-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
      />

      <main className="relative min-h-screen overflow-hidden bg-brand-light dark:bg-brand-dark transition-colors duration-600">
        {/* Magical Background Elements */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-mesh opacity-40" />
          <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
        </div>

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[600px] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/services/thecafe.jpg"
              alt="Our Menu"
              fill
              className="object-cover scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-dark/40 to-brand-dark" />
            <div className="absolute inset-0 bg-mesh opacity-20" />
          </div>

          <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/20 backdrop-blur-md px-6 py-2 text-xs font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/30">
                <Sparkles className="h-4 w-4" />
                <span>Culinary Excellence</span>
              </div>
              <h1 className="mb-6 text-7xl font-black text-white md:text-9xl tracking-tighter leading-none">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Menu</span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl font-light text-brand-beige/70 dark:text-brand-beige/80 leading-relaxed md:text-2xl">
                A curated selection of signature meals, specialty coffees, and artisanal treats
                crafted with passion and the finest local ingredients.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Menu Content */}
        <section className="container relative z-10 -mt-20 pb-24">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden w-80 flex-shrink-0 space-y-8 lg:block">
              <div className="sticky top-28 electrical-border rounded-[2.5rem]">
                <div className="rounded-[2.5rem] bg-brand-light/40 dark:bg-brand-dark/40 p-8 shadow-2xl backdrop-blur-xl border border-brand-beige/20 dark:border-white/10">
                  <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange shadow-inner">
                        <Filter className="h-6 w-6" />
                      </div>
                      <span className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">Filters</span>
                    </div>
                    {(selectedCategory !== 'All Items' || searchQuery) && (
                      <button
                        onClick={() => {
                          setSelectedCategory('All Items');
                          setSearchQuery('');
                          setCurrentPage(1);
                        }}
                        className="text-xs font-black uppercase tracking-widest text-brand-orange hover:text-brand-burnt transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="space-y-10">
                    {/* Search */}
                    <div>
                      <h4 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-brand-orange/60">Search</h4>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-orange" />
                        <input
                          type="text"
                          placeholder="Find a dish..."
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="h-14 w-full rounded-2xl border-none bg-white/5 dark:bg:white/5 pl-12 pr-4 text-sm font-medium text-brand-dark dark:text-white placeholder:text-brand-muted/40 dark:placeholder:text-brand-beige/30 focus:ring-2 focus:ring-brand-orange/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h4 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-brand-orange/60">Categories</h4>
                      <div className="flex flex-col gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`group flex items-center justify-between rounded-2xl px-5 py-4 text-sm transition-all ${
                              selectedCategory === cat
                                ? 'bg-brand-orange text-white shadow-xl shadow-brand-orange/30 font-black'
                                : 'text-brand-muted dark:text-brand-beige/60 hover:bg-brand-orange/10 hover:text-brand-orange'
                            }`}
                          >
                            <span className="tracking-tight">{cat}</span>
                            {selectedCategory === cat ? (
                              <div className="h-2 w-2 rounded-full bg:white" />
                            ) : (
                              <ChevronDown className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 -rotate-90" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <h4 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-brand-orange/60">Sort By</h4>
                      <div className="flex flex-col gap-4">
                        {(['name', 'price', 'category'] as const).map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setCurrentPage(1);
                            }}
                            className={`flex items-center gap-4 text-sm capitalize transition-colors ${
                              sortBy === option ? 'font-black text-brand-orange' : 'text-brand-beige/60 hover:text-white'
                            }`}
                          >
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              sortBy === option ? 'border-brand-orange bg-brand-orange/5' : 'border-brand-orange/20'
                            }`}>
                              {sortBy === option && <div className="h-2.5 w-2.5 rounded-full bg-brand-orange" />}
                            </div>
                            <span className="tracking-tight">{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 space-y-8">
              {/* Search and Mobile Controls */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1 group electrical-border rounded-[2rem]">
                  <Search className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-brand-orange transition-colors group-focus-within:text-brand-orange" />
                  <input
                    type="text"
                    placeholder="Search for dishes, drinks, ingredients..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full rounded-[2rem] border-none bg-brand-dark/40 py-6 pl-16 pr-8 shadow-2xl focus:ring-2 focus:ring-brand-orange/50 text-white backdrop-blur-xl text-lg font-medium border border-white/10"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    className="lg:hidden h-16 px-8 rounded-[2rem] border-none bg-brand-dark/40 shadow-2xl backdrop-blur-xl font-black text-white uppercase tracking-widest text-xs"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="mr-2 h-5 w-5 text-brand-orange" />
                    Filters
                  </Button>

                  <div className="hidden items-center rounded-[2rem] bg-brand-dark/40 p-2 shadow-2xl backdrop-blur-xl md:flex border border-white/10">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`rounded-2xl p-3.5 transition-all ${
                        viewMode === 'grid' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-brand-orange/40 hover:text-brand-orange'
                      }`}
                    >
                      <LayoutGrid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`rounded-2xl p-3.5 transition-all ${
                        viewMode === 'list' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-brand-orange/40 hover:text-brand-orange'
                      }`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={toggleSortOrder}
                    className="h-16 px-8 rounded-[2rem] border-none bg-brand-dark/40 shadow-2xl backdrop-blur-xl flex items-center gap-3 font-black text:white"
                  >
                    <ArrowUpDown className="h-5 w-5 text-brand-orange" />
                    <span className="uppercase text-[10px] tracking-[0.2em]">{sortOrder}</span>
                  </Button>
                </div>
              </div>

              {/* Active Filters Bar */}
              {(selectedCategory !== 'All Items' || searchQuery) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange/60">Active:</span>
                  {selectedCategory !== 'All Items' && (
                    <Badge variant="info" className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-brand-orange/10 text-brand-orange border-none font-black text-[10px] uppercase tracking-widest">
                      {selectedCategory}
                      <button onClick={() => handleCategoryChange('All Items')} className="p-1 hover:bg-brand-orange/20 rounded-full transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="default" className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-brand-dark/40 backdrop-blur-md border border-white/10 font-black text-[10px] uppercase tracking-widest text-white">
                      "{searchQuery}"
                      <button onClick={() => handleSearchChange('')} className="p-1 hover:bg-brand-orange/10 rounded-full transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </motion.div>
              )}

              {/* Results Count */}
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <p className="text-lg font-light text-brand-beige/60">
                  Showing <span className="font-black text-white">{filteredItems.length}</span> items
                  {totalPages > 1 && (
                    <span className="ml-2">
                      (page {currentPage} of {totalPages})
                    </span>
                  )}
                </p>
              </div>

              {/* Menu Grid / List */}
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-10 md:grid-cols-2 xl:grid-cols-3"
                  >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-[500px] rounded-[3rem] bg-white/5 animate-pulse border border-white/5" />
                    ))}
                  </motion.div>
                ) : paginatedItems.length > 0 ? (
                  <motion.div
                    layout
                    className={
                      viewMode === 'grid'
                        ? 'grid gap-8 sm:grid-cols-2 xl:grid-cols-3 auto-rows-[minmax(480px,1fr)]'
                        : 'flex flex-col gap-8'
                    }
                  >
                    {paginatedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={viewMode === 'grid' ? 'min-h-[480px]' : viewMode === 'list' ? 'h-56' : ''}
                      >
                        <MenuItemCard
                          item={item}
                          onClick={() => handleItemClick(item)}
                          onAddToCart={() => handleRedirect(item, 'add-to-cart')}
                          onView={() => handleRedirect(item, 'view')}
                          className={viewMode === 'list' ? 'flex flex-row h-full' : 'h-full'}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-32 text-center"
                  >
                    <div className="mb-10 relative">
                      <div className="absolute inset-0 bg-brand-orange/20 blur-[100px] rounded-full" />
                      <div className="relative rounded-full bg-brand-dark/40 backdrop-blur-xl p-12 shadow-2xl border border-white/10">
                        <UtensilsCrossed className="h-20 w-20 text-brand-orange/40" />
                      </div>
                    </div>
                    <h3 className="mb-4 text-4xl font-black text-white tracking-tight">No dishes found</h3>
                    <p className="mb-12 max-w-md text-xl text-brand-beige/60 font-light leading-relaxed">
                      We couldn&apos;t find any items matching your current filters. Try adjusting your search or category.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      className="rounded-full px-12 h-16 text-sm font-black uppercase tracking-widest shadow-xl shadow-brand-orange/20 bg-brand-orange hover:bg-brand-burnt text-white transition-all hover:scale-105"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All Items');
                        setCurrentPage(1);
                      }}
                    >
                      Reset all filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination (bottom only) */}
              {paginatedItems.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="rounded-full h-14 px-6 border-brand-orange/30 text-brand-orange disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`h-12 w-12 rounded-full font-black text-sm transition-all ${
                            currentPage === pageNum
                              ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30'
                              : 'bg-brand-dark/40 text-brand-beige/60 hover:bg-brand-orange/20 hover:text-brand-orange'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="rounded-full h-14 px-6 border-brand-orange/30 text-brand-orange disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Mobile Filters Drawer Overlay */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 z-[100] bg-brand-dark/80 backdrop-blur-md lg:hidden"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-[101] rounded-t-[3.5rem] bg-brand-dark/90 p-10 shadow-2xl backdrop-blur-2xl lg:hidden max-h:[90vh] overflow-y-auto border-t border-white/10"
              >
                <div className="mx-auto mb-10 h-2 w-20 rounded-full bg-brand-orange/20" />
                
                <div className="mb-12 flex items-center justify-between">
                  <h2 className="text-4xl font-black text-white tracking-tight">Filters</h2>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="rounded-full bg-brand-orange/10 p-3"
                  >
                    <X className="h-7 w-7 text-brand-orange" />
                  </button>
                </div>
                
                <div className="space-y-12">
                  <div className="space-y-8">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand-orange/60">Categories</h4>
                    <div className="flex flex-wrap gap-4">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            handleCategoryChange(cat);
                            setShowFilters(false);
                          }}
                          className={`rounded-2xl px-8 py-4 text-sm font-black transition-all ${
                            selectedCategory === cat
                              ? 'bg-brand-orange text-white shadow-xl shadow-brand-orange/30'
                              : 'bg-white/5 text-brand-beige/60'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand-orange/60">Sort By</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {(['name', 'price', 'category'] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setCurrentPage(1);
                          }}
                          className={`rounded-2xl border-2 px-8 py-5 text-sm font-black capitalize transition-all ${
                            sortBy === option
                              ? 'border-brand-orange bg-brand-orange/5 text-brand-orange'
                              : 'border-white/10 text-brand-beige/60'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-16">
                  <Button 
                    className="w-full h-20 rounded-full text-sm font-black uppercase tracking-widest shadow-xl shadow-brand-orange/30 bg-brand-orange hover:bg-brand-burnt text-white" 
                    onClick={() => setShowFilters(false)}
                  >
                    Show {filteredItems.length} Results
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Menu Item Modal */}
        <MenuItemModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onOrder={handleOrder}
        />
      </main>
    </>
  );
}

