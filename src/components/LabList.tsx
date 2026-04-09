import { Laboratory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { MapPin, Phone, Star, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface LabListProps {
  labs: Laboratory[];
  onSelectLab: (lab: Laboratory) => void;
  selectedLabId?: string;
}

export default function LabList({ labs, onSelectLab, selectedLabId }: LabListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-200px)] pr-4">
      <div className="space-y-4">
        {labs.map((lab) => (
          <motion.div
            key={lab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectLab(lab)}
          >
            <Card className={`cursor-pointer transition-colors ${selectedLabId === lab.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold leading-tight">{lab.name}</CardTitle>
                  <Badge variant={
                    lab.availability === 'available' ? 'default' :
                    lab.availability === 'busy' ? 'secondary' :
                    'destructive'
                  } className="capitalize">
                    {lab.availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1 shrink-0" />
                  <span className="truncate">{lab.address}</span>
                </div>
                
                {lab.distance !== undefined && (
                  <div className="text-xs font-medium text-primary">
                    {lab.distance.toFixed(1)} km away
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mt-2">
                  {lab.services.slice(0, 3).map((service) => (
                    <Badge key={service} variant="outline" className="text-[10px] py-0">
                      {service}
                    </Badge>
                  ))}
                  {lab.services.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{lab.services.length - 3} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs">
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
                    <span>{lab.rating}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="w-3 h-3 mr-1" />
                    <span>{lab.contact}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
