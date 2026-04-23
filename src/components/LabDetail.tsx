import { Laboratory, LabService } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import {
    MapPin, Phone, Star, Navigation2, X,
    CheckCircle2, XCircle, Activity, ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LabDetailProps {
    lab: Laboratory;
    requestedTests: LabService[];
    userLocation: [number, number] | null;
    onClose: () => void;
}

export default function LabDetail({ lab, requestedTests, userLocation, onClose }: LabDetailProps) {
    const coveredTests = requestedTests.filter(t => lab.services.includes(t));
    const missingTests = requestedTests.filter(t => !lab.services.includes(t));
    const coverage = requestedTests.length > 0
        ? Math.round((coveredTests.length / requestedTests.length) * 100)
        : 0;

    const googleMapsUrl = userLocation
        ? `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${lab.coordinates.lat},${lab.coordinates.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${lab.coordinates.lat},${lab.coordinates.lng}`;

    const coverageColor =
        coverage === 100 ? 'text-green-600' :
            coverage >= 60 ? 'text-amber-600' : 'text-red-500';

    const barColor =
        coverage === 100 ? 'bg-green-500' :
            coverage >= 60 ? 'bg-amber-400' : 'bg-red-400';

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25 }}
            className="h-full flex flex-col bg-white dark:bg-card rounded-2xl border shadow-xl overflow-hidden"
        >
            {/* Header */}
            <div className={cn(
                'p-5 border-b relative',
                lab.featured ? 'bg-gradient-to-br from-amber-50 to-white' : 'bg-muted/30'
            )}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>

                <div className="pr-8">
                    <div className="flex items-center gap-2 mb-1">
                        {lab.featured && (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-300 rounded-full px-2 py-0.5">
                                ★ Sponsored
                            </span>
                        )}
                        <Badge
                            className={cn(
                                'capitalize text-[10px] font-bold px-2 py-0',
                                lab.availability === 'available' && 'bg-green-500',
                                lab.availability === 'busy' && 'bg-yellow-500 text-black',
                                lab.availability === 'closed' && 'bg-red-500'
                            )}
                        >
                            {lab.availability}
                        </Badge>
                    </div>
                    <h2 className="text-xl font-black leading-tight mt-2 mb-1">{lab.name}</h2>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                        <span>{lab.address}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold">{lab.rating}</span>
                        </div>
                        {lab.distance !== undefined && (
                            <div className="flex items-center gap-1 text-primary text-sm font-bold">
                                <Activity className="w-3.5 h-3.5" />
                                {lab.distance.toFixed(1)} km away
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Scrollable content */}
            <ScrollArea className="flex-1">
                <div className="p-5 space-y-5">
                    {/* Coverage summary */}
                    {requestedTests.length > 0 && (
                        <div className="rounded-xl border p-4 space-y-3 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Test Coverage
                                </span>
                                <span className={cn('text-sm font-black', coverageColor)}>
                                    {coveredTests.length}/{requestedTests.length} &nbsp;·&nbsp; {coverage}%
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className={cn('h-full rounded-full transition-all', barColor)}
                                    style={{ width: `${coverage}%` }}
                                />
                            </div>

                            {/* Covered */}
                            {coveredTests.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1.5">
                                        ✔ Available here
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {coveredTests.map(t => (
                                            <span key={t} className="flex items-center gap-0.5 text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                                                <CheckCircle2 className="w-2.5 h-2.5" /> {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Missing */}
                            {missingTests.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1.5">
                                        ✗ Not available here
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {missingTests.map(t => (
                                            <span key={t} className="flex items-center gap-0.5 text-[10px] font-medium bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5">
                                                <XCircle className="w-2.5 h-2.5" /> {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* All services the lab offers */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            All Services Offered
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {lab.services.map(s => (
                                <Badge
                                    key={s}
                                    variant="outline"
                                    className={cn(
                                        'text-[9px] py-0.5 px-2 bg-background/50',
                                        requestedTests.includes(s) && 'border-green-400 text-green-700 bg-green-50'
                                    )}
                                >
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Fixed CTA footer */}
            <div className="p-4 border-t bg-background/80 backdrop-blur flex gap-2">
                <Button
                    variant="outline"
                    className="h-11 font-bold text-sm gap-2 flex-1"
                    onClick={() => window.open(`tel:${lab.contact}`)}
                >
                    <Phone className="w-4 h-4" />
                    Call Lab
                </Button>
                <Button
                    className="h-11 font-bold text-sm gap-2 flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open(googleMapsUrl, '_blank')}
                >
                    <Navigation2 className="w-4 h-4" />
                    Get Directions
                </Button>
            </div>
        </motion.div>
    );
}
