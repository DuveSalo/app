import { type ReactNode } from 'react';

export type StatCardVariant = 'total' | 'valid' | 'expiring' | 'expired';

interface StatCardProps {
    label: string;
    value: number;
    icon: ReactNode;
    changeText: string;
    variant: StatCardVariant;
}

export const StatCard = ({ label, value, icon, changeText }: StatCardProps) => {
    return (
        <div className="flex items-center gap-4 border border-neutral-200 shadow-sm bg-white rounded-lg p-4">
            <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-neutral-500 block">
                    {label}
                </span>
                <span className="text-2xl font-bold text-neutral-900 tracking-tight block mt-1">
                    {value}
                </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
                {icon}
                <span className="text-xs text-neutral-500">
                    {changeText}
                </span>
            </div>
        </div>
    );
};
