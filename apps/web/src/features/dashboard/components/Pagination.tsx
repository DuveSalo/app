import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    totalItems,
    onPageChange,
}: PaginationProps) => {
    const startItem = (currentPage - 1) * 10 + 1;
    const endItem = Math.min(currentPage * 10, totalItems);

    // Generate page numbers to show (max 4 visible)
    const getPageNumbers = () => {
        const pages: number[] = [];
        const maxVisible = 4;
        let start = Math.max(1, currentPage - 1);
        const end = Math.min(totalPages, start + maxVisible - 1);
        start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-between w-full">
            <span className="text-xs text-neutral-500">
                Mostrando {startItem}-{endItem} de {totalItems} documentos
            </span>

            <div className="flex items-center gap-2">
                {/* Previous */}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 rounded-md border border-neutral-200 focus:outline-none disabled:opacity-30"
                >
                    <ChevronLeft className={`h-4 w-4 ${currentPage === 1 ? 'text-neutral-400' : 'text-neutral-900'}`} />
                </button>

                {/* Page numbers */}
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`flex items-center justify-center w-8 h-8 rounded-md text-sm focus:outline-none ${
                            page === currentPage
                                ? 'bg-neutral-900 font-medium text-white'
                                : 'border border-neutral-200 font-light text-neutral-500'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Next */}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-8 h-8 rounded-md border border-neutral-200 focus:outline-none disabled:opacity-30"
                >
                    <ChevronRight className={`h-4 w-4 ${currentPage === totalPages ? 'text-neutral-400' : 'text-neutral-900'}`} />
                </button>
            </div>
        </div>
    );
};
