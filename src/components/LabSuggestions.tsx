import { Laboratory, LabService } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { MapPin, Phone, Star, Activity, SearchX, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export interface ScoredLab extends Laboratory {
    coveredCount: number;
    missingTests: LabService[];
}

interface LabSuggestionsProps {
    labs: ScoredLab[];
    requestedCount: number;
    onSelectLab: (lab: Laboratory) => void;
    selectedLabId?: string;
    layout?: 'list' | 'grid';
}

export default function LabSuggestions({ labs, requestedCount, onSelectLab, selectedLabId, layout = 'list' }: LabSuggestionsProps) {

    if (labs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <SearchX className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">No labs match</h3>
                <p className="text-sm text-muted-foreground mt-1">Try removing some filters.</p>
            </div>
        );
    }

    const pct = (covered: number) => Math.round((covered / requestedCount) * 100);

    return (
        <ScrollArea className="h-full pr-2">
            <div className={cn('pb-20', layout === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 items-start' : 'space-y-3')}>
                {labs.map((lab, idx) => {
                    const coverage = requestedCount > 0 ? pct(lab.coveredCount) : 0;
                    const coverageColor =
                        coverage === 100 ? 'text-green-600' :
                            coverage >= 60 ? 'text-amber-600' : 'text-red-500';
                    const barColor =
                        coverage === 100 ? 'bg-green-500' :
                            coverage >= 60 ? 'bg-amber-400' : 'bg-red-400';

                    return (
                        <motion.div
                            key={lab.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.03 }}
                            onClick={() => onSelectLab(lab)}
                        >
                            <Card className={cn(
                                'cursor-pointer transition-all duration-300 glass-card hover:shadow-md border-transparent overflow-hidden h-full flex flex-col',
                                selectedLabId === lab.id
                                    ? 'ring-2 ring-primary ring-offset-1 border-primary/50 translate-x-1'
                                    : 'hover:border-primary/20',
                                lab.featured && selectedLabId !== lab.id && 'ring-1 ring-amber-300/60 border-amber-200/40'
                            )}>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-[15px] font-bold leading-tight">
                                            {lab.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {lab.featured && (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                                                    ★ Sponsored
                                                </span>
                                            )}
                                            <Badge
                                                className={cn(
                                                    'capitalize text-[10px] font-bold px-2 py-0',
                                                    lab.availability === 'available' && 'bg-green-500 hover:bg-green-600',
                                                    lab.availability === 'busy' && 'bg-yellow-500 hover:bg-yellow-600 text-black',
                                                    lab.availability === 'closed' && 'bg-red-500 hover:bg-red-600'
                                                )}
                                            >
                                                {lab.availability}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 pt-0 space-y-3">
                                    {/* Address & distance */}
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 text-primary/70" />
                                        <span className="truncate">{lab.address}</span>
                                    </div>

                                    {/* Coverage bar */}
                                    {requestedCount > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    Test Coverage
                                                </span>
                                                <span className={cn('text-[12px] font-black', coverageColor)}>
                                                    {lab.coveredCount}/{requestedCount} tests &nbsp;·&nbsp; {coverage}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={cn('h-full rounded-full transition-all', barColor)}
                                                    style={{ width: `${coverage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Missing tests (compact) */}
                                    {requestedCount > 0 && lab.missingTests.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {lab.missingTests.slice(0, 3).map(t => (
                                                <span key={t} className="flex items-center gap-0.5 text-[9px] text-red-500 bg-red-50 border border-red-100 rounded-full px-1.5 py-0.5">
                                                    <XCircle className="w-2.5 h-2.5" /> {t}
                                                </span>
                                            ))}
                                            {lab.missingTests.length > 3 && (
                                                <span className="text-[9px] text-muted-foreground font-medium self-center">
                                                    +{lab.missingTests.length - 3} not available
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {requestedCount > 0 && lab.missingTests.length === 0 && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            All requested tests available!
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center gap-2 pt-4 mt-auto border-t">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="flex items-center">
                                                <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
                                                <span className="text-[11px] font-bold">{lab.rating}</span>
                                            </div>
                                            {lab.distance !== undefined && (
                                                <div className="text-[11px] font-bold text-primary flex items-center">
                                                    <Activity className="w-3 h-3 mr-1" />
                                                    {lab.distance.toFixed(1)} km
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-2.5 text-[11px] font-bold gap-1"
                                                onClick={e => { e.stopPropagation(); window.open(`tel:${lab.contact}`); }}
                                            >
                                                <Phone className="w-3 h-3" /> Call
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-8 px-2.5 text-[11px] font-bold gap-1"
                                                onClick={e => { e.stopPropagation(); onSelectLab(lab); }}
                                            >
                                                Details <ChevronRight className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
