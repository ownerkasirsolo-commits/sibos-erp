import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Plus } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    group?: string;
}

interface ComboboxProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onAddNew?: () => void;
}

const Combobox: React.FC<ComboboxProps> = ({ options, value, onChange, placeholder, onAddNew }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedLabel = options.find(opt => opt.value === value)?.label || '';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
        }
    }, [isOpen]);

    const filteredOptions = query
        ? options.filter(opt => opt.label.toLowerCase().includes(query.toLowerCase()))
        : options;
    
    const groupedOptions = filteredOptions.reduce((acc, option) => {
        const group = option.group || 'Lainnya';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(option);
        return acc;
    }, {} as Record<string, Option[]>);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full glass-input rounded-lg p-2.5 text-sm text-left flex justify-between items-center"
            >
                <span className={value ? 'text-white' : 'text-gray-400'}>{selectedLabel || placeholder}</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-60">
                    <div className="p-2 border-b border-white/10 flex gap-2 items-center">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari bahan..."
                                className="w-full bg-black/30 rounded-md py-1.5 pl-8 pr-3 text-sm text-white outline-none focus:ring-1 focus:ring-orange-500"
                                autoFocus
                            />
                        </div>
                        {onAddNew && (
                            <button
                                onClick={() => { onAddNew(); setIsOpen(false); }}
                                className="p-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-md transition-colors shadow-lg"
                                title="Tambah Baru"
                            >
                                <Plus size={16} />
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {Object.entries(groupedOptions).map(([group, opts]) => (
                            <div key={group}>
                                <div className="px-3 py-1.5 text-xs font-bold text-gray-500 sticky top-0 bg-[#1e293b]">{group}</div>
                                {(opts as Option[]).map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-orange-500/10 hover:text-orange-300"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-500">
                                Tidak ada hasil.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Combobox;