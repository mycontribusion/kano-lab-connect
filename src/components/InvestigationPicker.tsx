import { useState, useMemo } from 'react';
import { LabService, ALL_SERVICES, SERVICE_CATEGORIES } from '../types';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { Search, X, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';

interface InvestigationPickerProps {
    selected: LabService[];
    onChange: (investigations: LabService[]) => void;
}

export default function InvestigationPicker({ selected, onChange }: InvestigationPickerProps) {
    const [query, setQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>('Haematology');

    const toggle = (service: LabService) => {
        if (selected.includes(service)) {
            onChange(selected.filter(s => s !== service));
        } else {
            onChange([...selected, service]);
        }
    };

    const clearAll = () => onChange([]);

    const filteredCategories = useMemo(() => {
        if (!query.trim()) return SERVICE_CATEGORIES;
        const q = query.toLowerCase();
        const result: Record<string, LabService[]> = {};
        for (const [cat, services] of Object.entries(SERVICE_CATEGORIES)) {
            const matches = services.filter(s => s.toLowerCase().includes(q));
            if (matches.length > 0) result[cat] = matches;
        }
        return result;
    }, [query]);

    const filteredIsOpen = query.trim().length > 0;

    return (
        <div className="space-y-3 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                    <FlaskConical className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <h2 className="text-sm font-bold">Investigations Needed</h2>
                    <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                        Select tests to find matching labs
                    </p>
                </div>
            </div>



            {/* Search */}
            <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                    placeholder="Search investigations..."
                    className="pl-9 h-9 text-sm bg-white/60 rounded-xl"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Category accordion */}
            <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar md:max-h-[320px]">
                {(Object.entries(filteredCategories) as [string, LabService[]][]).map(([category, services]) => {
                    const isOpen = filteredIsOpen || expandedCategory === category;
                    const selectedInCat = services.filter(s => selected.includes(s)).length;
                    return (
                        <div key={category} className="rounded-xl border bg-white/50 overflow-hidden">
                            <button
                                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted/30 transition-colors"
                                onClick={() => setExpandedCategory(isOpen && !filteredIsOpen ? null : category)}
                            >
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {category}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {selectedInCat > 0 && (
                                        <span className="text-[9px] font-bold bg-primary text-white rounded-full px-1.5 py-0.5">
                                            {selectedInCat}
                                        </span>
                                    )}
                                    {isOpen
                                        ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                                        : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                    }
                                </div>
                            </button>
                            {isOpen && (
                                <div className="px-2 pb-2 flex flex-wrap gap-1.5">
                                    {services.map(service => {
                                        const isSelected = selected.includes(service);
                                        return (
                                            <button
                                                key={service}
                                                onClick={() => toggle(service)}
                                                className={cn(
                                                    'text-[10px] font-medium rounded-full px-2.5 py-1 border transition-all',
                                                    isSelected
                                                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                                                        : 'bg-white/80 border-muted hover:border-primary/40 hover:bg-primary/5 text-foreground'
                                                )}
                                            >
                                                {service}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
                {Object.keys(filteredCategories).length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">No investigations found</p>
                )}
            </div>
        </div>
    );
}
