import { type ReactNode } from 'react';

export type StatCardVariant = 'gray' | 'green' | 'yellow' | 'red';

interface StatCardProps {
    label: string;
    value: number;
    icon: ReactNode;
    variant: StatCardVariant;
}

const VARIANT_STYLES = {
    gray: {
        card: 'bg-gray-50',
        iconBg: 'bg-gray-200/60',
        value: 'text-gray-900',
        label: 'text-gray-500',
    },
    green: {
        card: 'bg-emerald-50',
        iconBg: 'bg-emerald-100/60',
        value: 'text-emerald-900',
        label: 'text-emerald-600',
    },
    yellow: {
        card: 'bg-amber-50',
        iconBg: 'bg-amber-100/60',
        value: 'text-amber-900',
        label: 'text-amber-600',
    },
    red: {
        card: 'bg-red-50',
        iconBg: 'bg-red-100/60',
        value: 'text-red-900',
        label: 'text-red-600',
    },
};

export const StatCard = ({ label, value, icon, variant }: StatCardProps) => {
    const styles = VARIANT_STYLES[variant];

    return (
        <div className={`${styles.card} rounded-xl p-3 sm:p-4`}>
            <div className="flex items-center justify-between">
                <div className="min-w-0">
                    <span className={`text-xl sm:text-2xl font-semibold tracking-tight ${styles.value}`}>
                        {value}
                    </span>
                    <p className={`text-xs font-medium ${styles.label} mt-0.5`}>
                        {label}
                    </p>
                </div>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};
