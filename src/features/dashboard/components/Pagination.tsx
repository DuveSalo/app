import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export const Pagination = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) => {
    const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showPageSizeDropdown) return;
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowPageSizeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showPageSizeDropdown]);

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="px-4 sm:px-5 py-2 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs sm:text-sm text-gray-500 tabular-nums">
                {startItem}–{endItem} de {totalItems}
            </span>

            <div className="flex items-center gap-2 sm:gap-3">
                {/* Page Size Dropdown - Hidden on mobile */}
                <div className="relative hidden sm:block" ref={dropdownRef}>
                    <button
                        onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 flex items-center gap-1.5 transition-all"
                    >
                        {pageSize} / pág
                        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showPageSizeDropdown && (
                        <div className="absolute bottom-full right-0 mb-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 min-w-[120px] animate-fade-in">
                            {[10, 20, 50].map(size => (
                                <button
                                    key={size}
                                    onClick={() => { onPageSizeChange(size); setShowPageSizeDropdown(false); }}
                                    className={`w-full px-3.5 py-2 text-left text-sm transition-colors ${pageSize === size ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {size} por página
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 text-white text-xs font-medium">
                        {currentPage}
                    </span>
                    {totalPages > 1 && (
                        <span className="text-xs text-gray-400 mx-0.5">/ {totalPages}</span>
                    )}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
