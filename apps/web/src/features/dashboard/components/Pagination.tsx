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
            <span className="text-xs text-muted-foreground">
                Mostrando {startItem}-{endItem} de {totalItems} documentos
            </span>

            <div className="flex items-center gap-1.5">
                {/* Previous */}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 rounded-md border border-border bg-background hover:bg-muted transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none disabled:opacity-30 disabled:pointer-events-none"
                >
                    <ChevronLeft className={`h-3.5 w-3.5 ${currentPage === 1 ? 'text-muted-foreground' : 'text-foreground'}`} />
                </button>

                {/* Page numbers */}
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`flex items-center justify-center w-8 h-8 text-xs rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none ${
                            page === currentPage
                                ? 'bg-primary font-medium text-primary-foreground'
                                : 'border border-border bg-background text-muted-foreground hover:bg-muted'
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
                    className="flex items-center justify-center w-8 h-8 rounded-md border border-border bg-background hover:bg-muted transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none disabled:opacity-30 disabled:pointer-events-none"
                >
                    <ChevronRight className={`h-3.5 w-3.5 ${currentPage === totalPages ? 'text-muted-foreground' : 'text-foreground'}`} />
                </button>
            </div>
        </div>
    );
};
