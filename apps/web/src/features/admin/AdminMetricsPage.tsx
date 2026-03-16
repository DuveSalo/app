import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import PageLayout from '@/components/layout/PageLayout';
import { SkeletonCards } from '@/components/common/SkeletonLoader';
import * as api from '@/lib/api/services';
import { createLogger } from '@/lib/utils/logger';
import { formatCurrency } from '@/lib/utils/dateUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import type { MonthlyMetric, MetricsSummary } from './types';

const logger = createLogger('AdminMetricsPage');

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

const AdminMetricsPage = () => {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [summaryData, monthly] = await Promise.all([
        api.getMetricsSummary(),
        api.getMonthlyMetrics(),
      ]);
      setSummary(summaryData);
      setMonthlyData(monthly);
    } catch (err) {
      logger.error('Error fetching metrics', err);
      toast.error('Error al cargar las metricas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <PageLayout title="Metricas">
        <div className="flex flex-col gap-6">
          <SkeletonCards />
          <div className="border border-border rounded-lg p-4 h-[340px] animate-pulse bg-muted/30" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-4 h-[340px] animate-pulse bg-muted/30" />
            <div className="border border-border rounded-lg p-4 h-[340px] animate-pulse bg-muted/30" />
          </div>
        </div>
      </PageLayout>
    );
  }

  const statCards = [
    { label: 'Escuelas activas', value: String(summary?.totalActive ?? 0) },
    { label: 'Registros este mes', value: String(summary?.newRegistrations ?? 0) },
    { label: 'Tasa de retencion', value: `${summary?.retentionRate ?? 0}%` },
    {
      label: 'Ingresos del mes',
      value: formatCurrency((summary?.monthlyRevenue ?? 0) / 100),
    },
  ];

  return (
    <PageLayout title="Metricas">
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="border border-border rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-semibold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Registrations chart */}
        <div className="border border-border rounded-lg p-4">
          <h2 className="text-base font-medium mb-4">Registros mensuales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="registrations"
                fill="hsl(240 5.9% 10%)"
                name="Registros"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Two charts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* School status chart */}
          <div className="border border-border rounded-lg p-4">
            <h2 className="text-base font-medium mb-4">Estado de escuelas por mes</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="active"
                  fill="#10b981"
                  name="Activas"
                  radius={[4, 4, 0, 0]}
                  stackId="status"
                />
                <Bar
                  dataKey="cancelled"
                  fill="#ef4444"
                  name="Canceladas"
                  radius={[4, 4, 0, 0]}
                  stackId="status"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue chart */}
          <div className="border border-border rounded-lg p-4">
            <h2 className="text-base font-medium mb-4">Ingresos mensuales</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: number) => formatCurrency(value / 100)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number | undefined) => [
                    formatCurrency((value ?? 0) / 100),
                    'Ingresos',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(240 5.9% 10%)"
                  name="Ingresos"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminMetricsPage;
