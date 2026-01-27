import React from 'react';

export type StatCardVariant = 'gray' | 'green' | 'yellow' | 'red';

interface StatCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    variant: StatCardVariant;
}

const VARIANT_STYLES = {
    gray: { bg: 'bg-gray-100', iconBg: 'bg-gray-200', text: 'text-gray-900', label: 'text-gray-500' },
    green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600', label: 'text-emerald-600' },
    yellow: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600', label: 'text-amber-600' },
    red: { bg: 'bg-red-50', iconBg: 'bg-red-100', text: 'text-red-600', label: 'text-red-600' },
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, variant }) => {
    const styles = VARIANT_STYLES[variant];

    return (
        <div className={`${styles.bg} rounded-xl p-3 sm:p-4 border border-gray-200`}>
            <p className={`text-[10px] sm:text-xs font-medium uppercase tracking-wide ${styles.label} mb-1 sm:mb-2`}>
                {label}
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
                    {icon}
                </div>
                <span className={`text-xl sm:text-2xl font-bold ${styles.text}`}>{value}</span>
            </div>
        </div>
    );
};
