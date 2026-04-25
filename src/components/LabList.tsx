import { Laboratory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { MapPin, Phone, Star, Activity, SearchX, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface LabListProps {
  labs: Laboratory[];
  onSelectLab: (lab: Laboratory) => void;
  selectedLabId?: string;
  onClearFilters?: () => void;
}

export default function LabList({ labs, onSelectLab, selectedLabId, onClearFilters }: LabListProps) {
  if (labs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
        <div className="bg-muted p-4 rounded-full mb-4">
          <SearchX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold">No laboratories found</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        {onClearFilters && (
          <Button onClick={onClearFilters} variant="outline" size="sm">
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
        {labs.map((lab) => (
          <motion.div
            key={lab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelectLab(lab)}
          >
            <Card className={cn(
              "cursor-pointer transition-all duration-300 glass-card hover:shadow-md border-transparent overflow-hidden h-full flex flex-col",
              selectedLabId === lab.id ? "ring-2 ring-primary ring-offset-1 border-primary/50 translate-x-1" : "hover:border-primary/20",
              lab.featured && selectedLabId !== lab.id && "ring-1 ring-amber-300/60 border-amber-200/40"
            )}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                    {lab.name}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {lab.featured && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                        ★ Sponsored
                      </span>
                    )}
                    <Badge
                      variant={
                        lab.availability === 'available' ? 'default' :
                          lab.availability === 'busy' ? 'secondary' :
                            'destructive'
                      }
                      className={cn(
                        "capitalize text-[10px] font-bold px-2 py-0",
                        lab.availability === 'available' && "bg-green-500 hover:bg-green-600",
                        lab.availability === 'busy' && "bg-yellow-500 hover:bg-yellow-600 text-black",
                        lab.availability === 'closed' && "bg-red-500 hover:bg-red-600"
                      )}
                    >
                      {lab.availability}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 text-primary/70" />
                  <span className="truncate">{lab.address}</span>
                </div>

                <div className="flex items-center justify-between">
                  {lab.distance !== undefined ? (
                    <div className="text-[11px] font-bold text-primary flex items-center">
                      <Activity className="w-3 h-3 mr-1" />
                      {lab.distance.toFixed(1)} km away
                    </div>
                  ) : <div />}

                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
                    <span className="text-[11px] font-bold">{lab.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {lab.services.slice(0, 4).map((service) => (
                    <Badge key={service} variant="outline" className="text-[9px] py-0 px-1.5 bg-background/50 border-muted">
                      {service}
                    </Badge>
                  ))}
                  {lab.services.length > 4 && (
                    <span className="text-[9px] text-muted-foreground font-medium">+{lab.services.length - 4} more</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 h-8 text-[11px] font-bold gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${lab.contact}`);
                    }}
                  >
                    <Phone className="w-3 h-3" />
                    Call Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="View details"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLab(lab);
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
