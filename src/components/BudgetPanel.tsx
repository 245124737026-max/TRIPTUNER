import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeftRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { BudgetBreakdown, ComfortTier } from '../types/travel';

interface BudgetPanelProps {
  budget: BudgetBreakdown;
  budgetTarget: number;
  travellers: number;
  durationDays: number;
  comfortTier: ComfortTier;
  onChangeTier: (tier: ComfortTier) => void;
  destinationId?: string;
}

interface CurrencyMeta {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  fallbackRateFromUSD: number;
}

const SUPPORTED_CURRENCIES: CurrencyMeta[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 0, fallbackRateFromUSD: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 0, fallbackRateFromUSD: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 0, fallbackRateFromUSD: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, fallbackRateFromUSD: 153.5 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 0, fallbackRateFromUSD: 1.39 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 0, fallbackRateFromUSD: 1.53 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF ', decimals: 0, fallbackRateFromUSD: 0.88 },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'ISK ', decimals: 0, fallbackRateFromUSD: 138.2 },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD ', decimals: 0, fallbackRateFromUSD: 9.85 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 0, fallbackRateFromUSD: 84.4 },
];

const DESTINATION_LOCAL_CURRENCY: Record<string, string> = {
  kyoto: 'JPY',
  tokyo: 'JPY',
  amalfi: 'EUR',
  reykjavik: 'ISK',
  marrakech: 'MAD',
  banff: 'CAD',
};

const FALLBACK_RATES: Record<string, number> = Object.fromEntries(
  SUPPORTED_CURRENCIES.map((c) => [c.code, c.fallbackRateFromUSD])
);

export const BudgetPanel: React.FC<BudgetPanelProps> = ({
  budget,
  budgetTarget,
  travellers,
  durationDays,
  comfortTier,
  onChangeTier,
  destinationId,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [rateSource, setRateSource] = useState<'live' | 'reference'>('reference');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isFetchingRates, setIsFetchingRates] = useState<boolean>(false);
  const [converterOpen, setConverterOpen] = useState<boolean>(false);
  const [customUsdInput, setCustomUsdInput] = useState<string>('100');

  const fetchLiveRates = useCallback(async () => {
    setIsFetchingRates(true);
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 5000);
      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        signal: controller.signal,
      });
      window.clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data && data.result === 'success' && data.rates) {
        const merged: Record<string, number> = { ...FALLBACK_RATES };
        for (const c of SUPPORTED_CURRENCIES) {
          if (typeof data.rates[c.code] === 'number' && data.rates[c.code] > 0) {
            merged[c.code] = data.rates[c.code];
          }
        }
        setRates(merged);
        setRateSource('live');
        setLastUpdated(
          new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
        return;
      }
      throw new Error('Unexpected exchange rate payload');
    } catch {
      // Fall back gracefully to Frankfurter for major currencies before static reference rates
      try {
        const res2 = await fetch('https://api.frankfurter.app/latest?from=USD');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.rates) {
            const merged: Record<string, number> = { ...FALLBACK_RATES, USD: 1 };
            for (const c of SUPPORTED_CURRENCIES) {
              if (typeof data2.rates[c.code] === 'number' && data2.rates[c.code] > 0) {
                merged[c.code] = data2.rates[c.code];
              }
            }
            setRates(merged);
            setRateSource('live');
            setLastUpdated(
              new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
            );
            return;
          }
        }
      } catch {
        // Keep reference rates if external network is unavailable
      }
      setRateSource('reference');
    } finally {
      setIsFetchingRates(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveRates();
  }, [fetchLiveRates]);

  const activeCurrencyMeta = useMemo(
    () =>
      SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency) ||
      SUPPORTED_CURRENCIES[0],
    [selectedCurrency]
  );

  const activeRate = rates[activeCurrencyMeta.code] ?? 1;

  const formatMoney = useCallback(
    (usdAmount: number, fractionDigits = 0) => {
      const converted = usdAmount * activeRate;
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: activeCurrencyMeta.code,
          maximumFractionDigits: fractionDigits,
          minimumFractionDigits: fractionDigits,
        }).format(converted);
      } catch {
        return `${activeCurrencyMeta.symbol}${Math.round(converted).toLocaleString()}`;
      }
    },
    [activeRate, activeCurrencyMeta]
  );

  const localCurrencyCode = destinationId
    ? DESTINATION_LOCAL_CURRENCY[destinationId]
    : undefined;

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
  const parsedCustomUsd = Math.max(0, Number(customUsdInput) || 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight">
            Budget Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Target: {formatMoney(budgetTarget)} · {travellers}{' '}
            {travellers === 1 ? 'traveller' : 'travellers'} · {durationDays} days
          </p>
        </div>

        <div className="text-right">
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatMoney(budget.total)}
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
                ? `Over target by ${formatMoney(absVariance)}`
                : `Under target by ${formatMoney(absVariance)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Currency Converter Bar */}
      <div className="mb-5 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="budget-currency-select"
              className="text-xs font-semibold text-slate-700 whitespace-nowrap"
            >
              Currency
            </label>
            <select
              id="budget-currency-select"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} — {currency.name}
                </option>
              ))}
            </select>

            {localCurrencyCode && localCurrencyCode !== selectedCurrency && (
              <button
                type="button"
                onClick={() => setSelectedCurrency(localCurrencyCode)}
                className="px-2 py-1 text-[11px] font-medium text-sky-700 bg-white border border-slate-200 hover:border-sky-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                Use {localCurrencyCode}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConverterOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeftRight className="w-3 h-3 text-slate-500" aria-hidden="true" />
              {converterOpen ? 'Hide Converter' : 'Quick Convert'}
            </button>
            <button
              type="button"
              onClick={fetchLiveRates}
              disabled={isFetchingRates}
              title="Refresh live exchange rates"
              aria-label="Refresh live exchange rates"
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetchingRates ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono tabular-nums">
          <span>
            1 USD = {activeRate.toFixed(activeRate >= 20 ? 2 : 4)} {activeCurrencyMeta.code}
          </span>
          <span className="font-sans">
            {isFetchingRates
              ? 'Updating exchange rates...'
              : rateSource === 'live'
              ? `Live exchange rates · ${lastUpdated}`
              : 'Reference exchange rates'}
          </span>
        </div>

        {converterOpen && (
          <div className="pt-2.5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
            <div>
              <label
                htmlFor="quick-usd-input"
                className="block text-[11px] font-medium text-slate-600 mb-1"
              >
                Amount in USD
              </label>
              <input
                id="quick-usd-input"
                type="number"
                min={0}
                value={customUsdInput}
                onChange={(e) => setCustomUsdInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-md px-3 py-1.5">
              <div className="text-[11px] text-slate-500">
                Converted ({activeCurrencyMeta.code})
              </div>
              <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                {formatMoney(parsedCustomUsd, activeRate < 10 ? 2 : 0)}
              </div>
            </div>
          </div>
        )}
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
            title={`${item.label}: ${formatMoney(item.amount)} (${item.pct}%)`}
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
                {formatMoney(item.amount)}
              </div>
              <div className="text-xs text-slate-500">{item.pct}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Metrics + Tier Quick Switch */}
      <div className="mt-4 pt-1 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-slate-600 font-mono tabular-nums">
          <span>{formatMoney(budget.perPerson)} / person</span>
          <span aria-hidden="true">·</span>
          <span>{formatMoney(budget.perDay)} / day</span>
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
