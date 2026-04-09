import { useState, useEffect, useMemo } from 'react';
import { KANO_LABS } from './data/labs';
import { Laboratory, LabService } from './types';
import Map from './components/Map';
import LabList from './components/LabList';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Search, Filter, Map as MapIcon, List, Beaker, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<LabService | 'All'>('All');
  const [view, setView] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available'>('all');

  const services: (LabService | 'All')[] = [
    'All', 'Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'Biopsy', 'Urine Analysis'
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const filteredLabs = useMemo(() => {
    let labs = KANO_LABS.map(lab => {
      if (userLocation) {
        return {
          ...lab,
          distance: calculateDistance(
            userLocation[0], userLocation[1],
            lab.coordinates.lat, lab.coordinates.lng
          )
        };
      }
      return lab;
    });

    // Sort by distance if location is available
    if (userLocation) {
      labs.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return labs.filter(lab => {
      const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lab.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesService = selectedService === 'All' || lab.services.includes(selectedService as string);
      const matchesAvailability = availabilityFilter === 'all' || lab.availability === 'available';
      
      return matchesSearch && matchesService && matchesAvailability;
    });
  }, [searchQuery, selectedService, availabilityFilter, userLocation]);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="border-bottom bg-white z-10 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Beaker className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Kano Lab Connect</h1>
          </div>
          
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search laboratories or locations..." 
                className="pl-10 bg-muted/50 border-none focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as 'map' | 'list')} className="w-[120px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map"><MapIcon className="w-4 h-4" /></TabsTrigger>
                <TabsTrigger value="list"><List className="w-4 h-4" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white border-bottom px-4 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="flex items-center gap-2 shrink-0 mr-4 border-r pr-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Filters</span>
          </div>
          
          <div className="flex gap-2">
            {services.map((service) => (
              <Badge 
                key={service}
                variant={selectedService === service ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap hover:bg-primary hover:text-white transition-colors"
                onClick={() => setSelectedService(service)}
              >
                {service}
              </Badge>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 border-l pl-4">
             <Badge 
                variant={availabilityFilter === 'available' ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setAvailabilityFilter(prev => prev === 'all' ? 'available' : 'all')}
              >
                Available Now
              </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row relative">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block w-96 border-r bg-muted/30 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
              {filteredLabs.length} Laboratories Found
            </h2>
          </div>
          <LabList 
            labs={filteredLabs} 
            onSelectLab={(lab) => {
              setSelectedLab(lab);
              setView('map');
            }}
            selectedLabId={selectedLab?.id}
          />
        </div>

        {/* Map/List View for Mobile & Map for Desktop */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {view === 'map' ? (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <Map 
                  labs={filteredLabs} 
                  userLocation={userLocation}
                  selectedLab={selectedLab}
                  onSelectLab={setSelectedLab}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 bg-white p-4 md:hidden overflow-y-auto"
              >
                <LabList 
                  labs={filteredLabs} 
                  onSelectLab={(lab) => {
                    setSelectedLab(lab);
                    setView('map');
                  }}
                  selectedLabId={selectedLab?.id}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Action Button for Location */}
          <button 
            onClick={() => {
              if (userLocation) {
                setSelectedLab(null);
                // The map will center on userLocation if selectedLab is null
              }
            }}
            className="absolute bottom-6 right-6 z-10 bg-white p-3 rounded-full shadow-lg border hover:bg-muted transition-colors"
            title="My Location"
          >
            <Navigation className="w-6 h-6 text-primary" />
          </button>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Optional, currently using tabs in header) */}
    </div>
  );
}
