import { type ReactNode } from 'react';

export type StatCardVariant = 'total' | 'valid' | 'expiring' | 'expired';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: ReactNode;
    changeText: string;
    variant: StatCardVariant;
}

const variantStyles: Record<StatCardVariant, string> = {
    total: 'border-border bg-background',
    valid: 'border-emerald-200 bg-emerald-50',
    expiring: 'border-amber-200 bg-amber-50',
    expired: 'border-red-200 bg-red-50',
};

export const StatCard = ({ label, value, icon, changeText, variant }: StatCardProps) => {
    return (
        <div className={`rounded-lg border p-5 ${variantStyles[variant]}`}>
            <span className="text-sm text-muted-foreground block">
                {label}
            </span>
            <span className="text-2xl font-bold text-foreground block mt-1">
                {value}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
                {icon}
                <span className="text-xs text-muted-foreground">
                    {changeText}
                </span>
            </div>
        </div>
    );
};
