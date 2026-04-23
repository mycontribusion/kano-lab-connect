import { useState, useEffect, useMemo } from 'react';
import { KANO_LABS } from './data/labs';
import { Laboratory, LabService } from './types';
import InvestigationPicker from './components/InvestigationPicker';
import LabSuggestions, { ScoredLab } from './components/LabSuggestions';
import LabDetail from './components/LabDetail';
import { cn, calculateDistance } from './lib/utils';
import { Badge } from './components/ui/badge';
import { Beaker, Navigation, Star, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SortMode = 'sponsored' | 'nearest';

export default function App() {
  const [selectedInvestigations, setSelectedInvestigations] = useState<LabService[]>([]);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('sponsored');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available'>('all');

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
    <div className="flex flex-col h-screen bg-muted/30 overflow-hidden font-geist-variable">
      {/* Header */}
      <header className="glass-header px-4 py-3 shadow-sm border-b border-primary/10">
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

          <div className="flex items-center gap-2 ml-auto">
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
            <div className="flex items-center gap-0.5 rounded-full border bg-white/50 p-0.5 shadow-sm">
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
                className="p-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600"
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
          {/* Investigation picker */}
          <div className="p-4 border-b bg-white/60 backdrop-blur">
            <InvestigationPicker
              selected={selectedInvestigations}
              onChange={setSelectedInvestigations}
            />
          </div>

          {/* Results header */}
          <div className="px-4 py-2 flex items-center justify-between border-b bg-muted/10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {scoredLabs.length} Labs
              {selectedInvestigations.length > 0 && ` · ${selectedInvestigations.length} test${selectedInvestigations.length > 1 ? 's' : ''} selected`}
            </span>
            {selectedInvestigations.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                Sorted by {sortMode === 'sponsored' ? 'sponsored + coverage' : 'proximity'}
              </span>
            )}
          </div>

          {/* Suggestions list */}
          <div className="flex-1 overflow-hidden p-3">
            <LabSuggestions
              labs={scoredLabs}
              requestedCount={selectedInvestigations.length}
              onSelectLab={setSelectedLab}
              selectedLabId={selectedLab?.id}
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
                className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-muted-foreground"
              >
                <div className="bg-muted/50 p-6 rounded-3xl">
                  <Beaker className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                </div>
                <div>
                  <p className="font-semibold text-base">No lab selected</p>
                  <p className="text-sm mt-1">
                    {selectedInvestigations.length === 0
                      ? 'Pick investigations on the left to find matching labs'
                      : 'Click a lab card to see full details'}
                  </p>
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
