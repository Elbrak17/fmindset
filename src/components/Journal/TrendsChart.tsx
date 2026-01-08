'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Types
export interface JournalEntryForChart {
  id: string;
  mood: number;
  energy: number;
  stress: number;
  entryDate: string;
}

export interface TrendsChartProps {
  entries: JournalEntryForChart[];
  period: 7 | 14 | 30;
  onPeriodChange: (period: 7 | 14 | 30) => void;
  showMovingAverage?: boolean;
}

// Constants
const PERIOD_OPTIONS: Array<{ value: 7 | 14 | 30; label: string }> = [
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' },
  { value: 30, label: '30 Days' },
];

const MIN_ENTRIES_FOR_CHART = 3;

// Colors matching the design spec
const COLORS = {
  mood: '#3B82F6',      // blue-500
  energy: '#22C55E',    // green-500
  stress: '#EF4444',    // red-500
  moodAvg: '#1D4ED8',   // blue-700 (darker for moving avg)
  energyAvg: '#15803D', // green-700
  stressAvg: '#B91C1C', // red-700
};

/**
 * Calculate simple moving average for a data series
 */
function calculateMovingAverage(data: number[], windowSize: number = 3): (number | null)[] {
  return data.map((_, index) => {
    if (index < windowSize - 1) return null;
    const window = data.slice(index - windowSize + 1, index + 1);
    const sum = window.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / windowSize);
  });
}

/**
 * Format date for display on chart
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


/**
 * Custom tooltip component for the chart
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Filter out moving average lines from tooltip
  const mainMetrics = payload.filter(
    (p) => !p.dataKey.includes('Avg')
  );

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      {mainMetrics.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 capitalize">{entry.name}:</span>
          <span className="font-medium" style={{ color: entry.color }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Period selector tabs component
 */
interface PeriodSelectorProps {
  period: 7 | 14 | 30;
  onPeriodChange: (period: 7 | 14 | 30) => void;
}

function PeriodSelector({ period, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg" role="tablist">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={period === option.value}
          onClick={() => onPeriodChange(option.value)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${
              period === option.value
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Empty state component when not enough entries
 */
function EmptyState({ entryCount }: { entryCount: number }) {
  const remaining = MIN_ENTRIES_FOR_CHART - entryCount;
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Keep checking in!
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        {entryCount === 0
          ? 'Start your first check-in to begin tracking your trends.'
          : `Just ${remaining} more check-in${remaining > 1 ? 's' : ''} to see your trends. You're doing great!`}
      </p>
    </div>
  );
}


/**
 * TrendsChart Component
 * Displays a line chart showing mood, energy, and stress trends over time.
 * Supports period selection (7/14/30 days) and optional moving average lines.
 * 
 * Requirements: 2.2, 2.3, 2.4
 */
export function TrendsChart({
  entries,
  period,
  onPeriodChange,
  showMovingAverage = false,
}: TrendsChartProps) {
  // Prepare chart data - sort by date ascending for proper chart display
  const chartData = useMemo(() => {
    // Sort entries by date ascending (oldest first for left-to-right display)
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    );

    // Extract values for moving average calculation
    const moodValues = sortedEntries.map((e) => e.mood);
    const energyValues = sortedEntries.map((e) => e.energy);
    const stressValues = sortedEntries.map((e) => e.stress);

    // Calculate moving averages if enabled
    const moodAvg = showMovingAverage ? calculateMovingAverage(moodValues) : [];
    const energyAvg = showMovingAverage ? calculateMovingAverage(energyValues) : [];
    const stressAvg = showMovingAverage ? calculateMovingAverage(stressValues) : [];

    return sortedEntries.map((entry, index) => ({
      date: formatDate(entry.entryDate),
      fullDate: entry.entryDate,
      mood: entry.mood,
      energy: entry.energy,
      stress: entry.stress,
      ...(showMovingAverage && {
        moodAvg: moodAvg[index],
        energyAvg: energyAvg[index],
        stressAvg: stressAvg[index],
      }),
    }));
  }, [entries, showMovingAverage]);

  // Check if we have enough entries
  if (entries.length < MIN_ENTRIES_FOR_CHART) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Trends</h3>
          <PeriodSelector period={period} onPeriodChange={onPeriodChange} />
        </div>
        <EmptyState entryCount={entries.length} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Trends</h3>
          <p className="text-sm text-gray-500">
            Track your mood, energy, and stress over time
          </p>
        </div>
        <PeriodSelector period={period} onPeriodChange={onPeriodChange} />
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value: string) => (
                <span className="text-sm text-gray-600 capitalize">{value}</span>
              )}
            />

            {/* Main lines */}
            <Line
              type="monotone"
              dataKey="mood"
              name="mood"
              stroke={COLORS.mood}
              strokeWidth={2}
              dot={{ fill: COLORS.mood, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="energy"
              name="energy"
              stroke={COLORS.energy}
              strokeWidth={2}
              dot={{ fill: COLORS.energy, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="stress"
              name="stress"
              stroke={COLORS.stress}
              strokeWidth={2}
              dot={{ fill: COLORS.stress, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />

            {/* Moving average lines (optional) */}
            {showMovingAverage && (
              <>
                <Line
                  type="monotone"
                  dataKey="moodAvg"
                  name="mood (avg)"
                  stroke={COLORS.moodAvg}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="energyAvg"
                  name="energy (avg)"
                  stroke={COLORS.energyAvg}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="stressAvg"
                  name="stress (avg)"
                  stroke={COLORS.stressAvg}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend explanation */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.mood }} />
            <span>Mood (higher = better)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.energy }} />
            <span>Energy (higher = more energized)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: COLORS.stress }} />
            <span>Stress (higher = more stressed)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendsChart;
