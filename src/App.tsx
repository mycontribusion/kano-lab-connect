import { useState, useEffect, useMemo } from 'react';
import { KANO_LABS } from './data/labs';
import { Laboratory, LabService } from './types';
import InvestigationPicker from './components/InvestigationPicker';
import LabSuggestions, { ScoredLab } from './components/LabSuggestions';
import LabDetail from './components/LabDetail';
import { cn, calculateDistance } from './lib/utils';
import { Badge } from './components/ui/badge';
import { Beaker, Navigation, Star, ArrowUpDown, X, Award, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SortMode = 'sponsored' | 'nearest' | 'rating';

export default function App() {
  const [selectedInvestigations, setSelectedInvestigations] = useState<LabService[]>([]);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('sponsored');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available'>('all');
  const [isMobilePickerOpen, setIsMobilePickerOpen] = useState(false);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setIsLocating(false);
        },
        () => setIsLocating(false)
      );
    }
  }, []);

  // Compute scored + sorted labs
  const scoredLabs = useMemo((): ScoredLab[] => {
    let labs = KANO_LABS.map(lab => {
      const distance = userLocation
        ? calculateDistance(userLocation[0], userLocation[1], lab.coordinates.lat, lab.coordinates.lng)
        : undefined;

      const coveredCount = selectedInvestigations.filter(inv => lab.services.includes(inv)).length;
      const missingTests = selectedInvestigations.filter(inv => !lab.services.includes(inv));

      return { ...lab, distance, coveredCount, missingTests };
    });

    // Availability filter
    if (availabilityFilter === 'available') {
      labs = labs.filter(l => l.availability === 'available');
    }

    // Sorting
    if (sortMode === 'nearest' && userLocation) {
      labs.sort((a, b) => {
        // Primary: by distance
        const distDiff = (a.distance ?? 99999) - (b.distance ?? 99999);
        // Tiebreak within 500m: featured first, then coverage, then rating
        if (Math.abs(distDiff) < 0.5) {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.coveredCount - a.coveredCount || b.rating - a.rating;
        }
        return distDiff;
      });
    } else if (sortMode === 'rating') {
      labs.sort((a, b) => {
        // 1. Rating first
        if (b.rating !== a.rating) return b.rating - a.rating;
        // 2. Most coverage
        if (b.coveredCount !== a.coveredCount) return b.coveredCount - a.coveredCount;
        // 3. Featured
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
    } else {
      // Default sponsored-first
      labs.sort((a, b) => {
        // 1. Featured first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // 2. Most coverage
        if (b.coveredCount !== a.coveredCount) return b.coveredCount - a.coveredCount;
        // 3. Rating
        return b.rating - a.rating;
      });
    }

    return labs;
  }, [selectedInvestigations, sortMode, availabilityFilter, userLocation]);

  return (
    <div className="flex flex-col h-[100dvh] md:h-screen bg-muted/30 font-geist-variable overflow-hidden">
      {/* Header */}
      <header className="glass-header px-4 py-3 shadow-sm border-b border-primary/10 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 rotate-3">
              <Beaker className="text-white w-6 h-6 -rotate-3" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight hidden sm:block leading-none">Kano Lab</h1>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest hidden sm:block">Connect</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto overflow-x-auto no-scrollbar pb-1 -mb-1">
            {/* Availability filter */}
            <Badge
              variant={availabilityFilter === 'available' ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer whitespace-nowrap rounded-full text-[11px] px-3 py-1',
                availabilityFilter === 'available'
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-200'
                  : 'bg-white/50 hover:bg-green-50 hover:border-green-200'
              )}
              onClick={() => setAvailabilityFilter(prev => prev === 'all' ? 'available' : 'all')}
            >
              Available Now
            </Badge>

            {/* Sort toggle */}
            <div className="flex items-center gap-0.5 rounded-full border bg-white/50 p-0.5 shadow-sm whitespace-nowrap">
              <button
                onClick={() => setSortMode('sponsored')}
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all',
                  sortMode === 'sponsored' ? 'bg-amber-400 text-white shadow' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Star className="w-2.5 h-2.5" /> Featured
              </button>
              <button
                onClick={() => setSortMode('rating')}
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all',
                  sortMode === 'rating' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Award className="w-2.5 h-2.5" /> Top Rated
              </button>
              <button
                onClick={() => userLocation && setSortMode('nearest')}
                disabled={!userLocation}
                title={!userLocation ? 'Enable location to sort by distance' : 'Sort by nearest'}
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all',
                  sortMode === 'nearest' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground',
                  !userLocation && 'opacity-40 cursor-not-allowed'
                )}
              >
                <ArrowUpDown className="w-2.5 h-2.5" />
                {isLocating ? 'Locating…' : 'Nearest'}
              </button>
            </div>

            {/* Re-centre location button */}
            {userLocation && (
              <button
                title="Location acquired"
                className="p-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 shrink-0"
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL — Investigation picker + lab suggestions */}
        <div className="w-full md:w-[420px] lg:w-[460px] flex flex-col border-r bg-muted/20 overflow-hidden">

          {/* Mobile Panel Toggle */}
          <div className="md:hidden p-3 border-b bg-white/80 backdrop-blur z-10 shadow-sm flex items-center justify-between">
            <button
              onClick={() => setIsMobilePickerOpen(!isMobilePickerOpen)}
              className="flex flex-1 items-center justify-between px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4" />
                {selectedInvestigations.length > 0
                  ? `${selectedInvestigations.length} tests picked`
                  : 'Pick investigations...'}
              </div>
              <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isMobilePickerOpen && 'rotate-180')} />
            </button>
          </div>

          {/* Investigation picker (Top Half) */}
          <div className={cn("p-3 md:p-4 border-b bg-white/60 backdrop-blur flex-shrink-0 flex-col max-h-[60vh] md:max-h-none h-auto", isMobilePickerOpen ? "flex" : "hidden md:flex")}>
            <div className="flex-1 overflow-hidden flex flex-col">
              <InvestigationPicker
                selected={selectedInvestigations}
                onChange={setSelectedInvestigations}
              />
            </div>
          </div>

          {/* Mobile Results Header */}
          <div className="px-4 py-2 flex md:hidden items-center justify-between border-b bg-muted/10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {scoredLabs.length} Labs
              {selectedInvestigations.length > 0 && ` · ${selectedInvestigations.length} test${selectedInvestigations.length > 1 ? 's' : ''} selected`}
            </span>
          </div>

          {/* Desktop Picked Investigations */}
          <div className="hidden md:flex flex-1 flex-col overflow-hidden bg-white/40">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/10">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Picked Investigations ({selectedInvestigations.length})
              </h3>
              {selectedInvestigations.length > 0 && (
                <button onClick={() => setSelectedInvestigations([])} className="text-[10px] uppercase font-bold text-red-500 hover:text-red-600 transition-colors">
                  Clear All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4">
              {selectedInvestigations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed rounded-xl border-muted bg-white/50">
                  <Beaker className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">Select investigations above to build your request.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedInvestigations.map(s => (
                    <div key={s} className="flex items-center justify-between p-3 bg-white rounded-xl border shadow-sm group">
                      <span className="text-sm font-semibold">{s}</span>
                      <button onClick={() => setSelectedInvestigations(prev => prev.filter(i => i !== s))} className="p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500 rounded-md transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Suggestions list */}
          <div className="flex-1 overflow-hidden p-3 md:hidden">
            <LabSuggestions
              labs={scoredLabs}
              requestedCount={selectedInvestigations.length}
              onSelectLab={setSelectedLab}
              selectedLabId={selectedLab?.id}
              layout="list"
            />
          </div>
        </div>

        {/* RIGHT PANEL — Lab detail (desktop) */}
        <div className="hidden md:flex flex-1 p-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedLab ? (
              <motion.div
                key={selectedLab.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl mx-auto"
              >
                <LabDetail
                  lab={selectedLab}
                  requestedTests={selectedInvestigations}
                  userLocation={userLocation}
                  onClose={() => setSelectedLab(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col pt-2"
              >
                <div className="mb-4 px-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-foreground">All Laboratories</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedInvestigations.length === 0
                        ? 'Pick tests on the left or click a lab card below'
                        : `Showing ${scoredLabs.length} matched labs`}
                    </p>
                  </div>
                  {selectedInvestigations.length > 0 && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
                      Sorted by {sortMode === 'sponsored' ? 'sponsored + coverage' : 'proximity'}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden px-4">
                  <LabSuggestions
                    labs={scoredLabs}
                    requestedCount={selectedInvestigations.length}
                    onSelectLab={setSelectedLab}
                    selectedLabId={undefined}
                    layout="grid"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile: full-screen lab detail sheet */}
      <AnimatePresence>
        {selectedLab && (
          <motion.div
            key="mobile-detail"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-50 md:hidden bg-background"
          >
            <LabDetail
              lab={selectedLab}
              requestedTests={selectedInvestigations}
              userLocation={userLocation}
              onClose={() => setSelectedLab(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
