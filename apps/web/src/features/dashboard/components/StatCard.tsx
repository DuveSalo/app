import { type ReactNode } from 'react';

export type StatCardVariant = 'total' | 'valid' | 'expiring' | 'expired';

interface StatCardProps {
    label: string;
    value: number;
    icon: ReactNode;
    changeText: string;
    variant: StatCardVariant;
}

export const StatCard = ({ label, value, icon, changeText, variant }: StatCardProps) => {
    return (
        <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
            <span className="text-xs font-medium text-neutral-500">
                {label}
            </span>
            <span className="text-2xl font-bold text-neutral-900">
                {value}
            </span>
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs text-neutral-500">
                    {changeText}
                </span>
            </div>
        </div>
    );
};
