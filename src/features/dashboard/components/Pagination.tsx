import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}) => {
    const [showPageSizeDropdown, setShowPageSizeDropdown] = React.useState(false);

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-3 sm:gap-6 border-t border-gray-100">
            <span className="text-xs sm:text-sm text-gray-500 font-medium order-2 sm:order-1">
                {startItem}–{endItem} de {totalItems}
            </span>

            <div className="flex items-center gap-3 sm:gap-4 order-1 sm:order-2">
                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-sm font-semibold text-gray-900 bg-white">
                        {currentPage}
                    </button>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Page Size Dropdown - Hidden on mobile */}
                <div className="relative hidden sm:block">
                    <button
                        onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-2"
                    >
                        {pageSize} / pág
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {showPageSizeDropdown && (
                        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            {[10, 20, 50].map(size => (
                                <button
                                    key={size}
                                    onClick={() => { onPageSizeChange(size); setShowPageSizeDropdown(false); }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${pageSize === size ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}
                                >
                                    {size} / página
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
