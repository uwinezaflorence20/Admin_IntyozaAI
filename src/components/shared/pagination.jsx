import { TbChevronsLeft, TbChevronLeft, TbChevronRight, TbChevronsRight } from 'react-icons/tb';
import { cn } from '@/lib/utils';

function PageButton({ onClick, disabled, label, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={cn(
                'grid size-9 place-items-center rounded-full text-muted transition',
                disabled ? 'opacity-35' : 'hover:bg-brand-soft hover:text-brand'
            )}
        >
            {children}
        </button>
    );
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const last = Math.max(totalPages, 1);
    return (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 text-[0.85rem] text-muted">
            <span>Page {currentPage} of {last}</span>
            <div className="flex items-center gap-1">
                <PageButton label="First page" onClick={() => onPageChange(1)} disabled={currentPage <= 1}>
                    <TbChevronsLeft size={18} />
                </PageButton>
                <PageButton label="Previous page" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
                    <TbChevronLeft size={18} />
                </PageButton>
                <span className="grid h-9 min-w-9 place-items-center rounded-full bg-brand px-3 font-bold text-on-brand">
                    {currentPage}
                </span>
                <PageButton label="Next page" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= last}>
                    <TbChevronRight size={18} />
                </PageButton>
                <PageButton label="Last page" onClick={() => onPageChange(last)} disabled={currentPage >= last}>
                    <TbChevronsRight size={18} />
                </PageButton>
            </div>
        </div>
    );
}
