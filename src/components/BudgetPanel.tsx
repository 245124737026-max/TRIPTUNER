import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { BudgetBreakdown, ComfortTier } from '../types/travel';

interface BudgetPanelProps {
  budget: BudgetBreakdown;
  budgetTarget: number;
  travellers: number;
  durationDays: number;
  comfortTier: ComfortTier;
  onChangeTier: (tier: ComfortTier) => void;
}

export const BudgetPanel: React.FC<BudgetPanelProps> = ({
  budget,
  budgetTarget,
  travellers,
  durationDays,
  comfortTier,
  onChangeTier,
}) => {
  const safeTotal = Math.max(1, budget.total);
  const items = [
    {
      key: 'travel',
      label: 'Travel & Transit',
      amount: budget.travel,
      pct: Math.round((budget.travel / safeTotal) * 100),
      barClass: 'bg-sky-700',
      dotClass: 'bg-sky-700',
      note: 'Flights & local rail/ferry',
    },
    {
      key: 'accommodation',
      label: 'Accommodation',
      amount: budget.accommodation,
      pct: Math.round((budget.accommodation / safeTotal) * 100),
      barClass: 'bg-slate-800',
      dotClass: 'bg-slate-800',
      note: `${durationDays} nights · ${Math.ceil(travellers / 2)} room(s)`,
    },
    {
      key: 'food',
      label: 'Food & Dining',
      amount: budget.food,
      pct: Math.round((budget.food / safeTotal) * 100),
      barClass: 'bg-amber-500',
      dotClass: 'bg-amber-500',
      note: 'Curated meals & cafes',
    },
    {
      key: 'activities',
      label: 'Activities & Entry',
      amount: budget.activities,
      pct: Math.max(
        0,
        100 -
          Math.round((budget.travel / safeTotal) * 100) -
          Math.round((budget.accommodation / safeTotal) * 100) -
          Math.round((budget.food / safeTotal) * 100)
      ),
      barClass: 'bg-emerald-600',
      dotClass: 'bg-emerald-600',
      note: 'Tickets, tours & excursions',
    },
  ];

  const isOver = budget.variance < 0;
  const absVariance = Math.abs(budget.variance);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight">
            Budget Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Target: ${budgetTarget.toLocaleString()} · {travellers}{' '}
            {travellers === 1 ? 'traveller' : 'travellers'} · {durationDays} days
          </p>
        </div>

        <div className="text-right">
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            ${budget.total.toLocaleString()}
          </div>
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-medium mt-0.5 tabular-nums ${
              isOver ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            {isOver ? (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>
              {isOver
                ? `Over target by $${absVariance.toLocaleString()}`
                : `Under target by $${absVariance.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* Stacked Distribution Bar */}
      <div
        className="w-full h-3 rounded-full overflow-hidden bg-slate-100 flex mb-5"
        role="img"
        aria-label="Expense distribution across travel, accommodation, food, and activities"
      >
        {items.map((item) => (
          <div
            key={item.key}
            style={{ width: `${Math.max(4, item.pct)}%` }}
            className={`${item.barClass} h-full transition-all duration-300 border-r border-white last:border-r-0`}
            title={`${item.label}: $${item.amount.toLocaleString()} (${item.pct}%)`}
          />
        ))}
      </div>

      {/* 4-Category Ledger */}
      <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
        {items.map((item) => (
          <div
            key={item.key}
            className="py-3 flex items-center justify-between gap-4 text-sm"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-xs shrink-0 ${item.dotClass}`} aria-hidden="true" />
                <span className="font-medium text-slate-900 truncate">{item.label}</span>
              </div>
              <div className="text-xs text-slate-500 pl-4.5 mt-0.5">{item.note}</div>
            </div>

            <div className="text-right shrink-0 font-mono tabular-nums">
              <div className="font-semibold text-slate-900">
                ${item.amount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">{item.pct}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Metrics + Tier Quick Switch */}
      <div className="mt-4 pt-1 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-slate-600 font-mono tabular-nums">
          <span>${budget.perPerson.toLocaleString()} / person</span>
          <span aria-hidden="true">·</span>
          <span>${budget.perDay.toLocaleString()} / day</span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['essential', 'comfort', 'boutique'] as ComfortTier[]).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => onChangeTier(tier)}
              className={`px-2.5 py-1 text-xs font-medium capitalize rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                comfortTier === tier
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
