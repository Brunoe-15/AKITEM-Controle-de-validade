import { ExpirationCalculation, ExpirationStatusType } from '../types/product';

/**
 * Normalizes a date string YYYY-MM-DD to midnight in the local timezone
 */
export function parseDateAtMidnight(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 0, 0, 0, 0);
  }
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns today's date at midnight local time
 */
export function getTodayMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Calculates day difference between product expiration date and today
 */
export function getDaysDifference(expirationDateStr: string, referenceDate: Date = getTodayMidnight()): number {
  const expDate = parseDateAtMidnight(expirationDateStr);
  const diffTime = expDate.getTime() - referenceDate.getTime();
  // Round to nearest integer to avoid daylight saving fractional issues
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats YYYY-MM-DD to DD/MM/YYYY in Brazilian format
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '--/--/----';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = parseDateAtMidnight(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Computes full expiration calculation based on rules
 */
export function getExpirationCalculation(expirationDateStr: string, referenceDate: Date = getTodayMidnight()): ExpirationCalculation {
  const diffDays = getDaysDifference(expirationDateStr, referenceDate);

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    const text = `Vencido há ${daysAgo} ${daysAgo === 1 ? 'dia' : 'dias'}`;
    return {
      diffDays,
      statusType: 'expired',
      statusText: `Vermelho - ${text}`,
      statusColor: '#D93611',
      badgeColorClass: 'bg-red-50 text-[#D93611] border-red-200',
      badgeBorderClass: 'border-[#D93611]',
      badgeTextClass: 'text-[#D93611]',
      isUrgent: true,
    };
  }

  if (diffDays === 0) {
    return {
      diffDays,
      statusType: 'today',
      statusText: 'Vermelho - Vence hoje',
      statusColor: '#F21D44',
      badgeColorClass: 'bg-red-50 text-[#F21D44] border-red-200 animate-pulse',
      badgeBorderClass: 'border-[#F21D44]',
      badgeTextClass: 'text-[#F21D44]',
      isUrgent: true,
    };
  }

  if (diffDays <= 7) {
    const text = `${diffDays} ${diffDays === 1 ? 'dia restante' : 'dias restantes'}`;
    return {
      diffDays,
      statusType: 'week',
      statusText: `Laranja - ${text}`,
      statusColor: '#F27F1B',
      badgeColorClass: 'bg-amber-50 text-[#F27F1B] border-amber-200',
      badgeBorderClass: 'border-[#F27F1B]',
      badgeTextClass: 'text-[#F27F1B]',
      isUrgent: true,
    };
  }

  if (diffDays <= 31) {
    const text = `${diffDays} dias restantes`;
    return {
      diffDays,
      statusType: 'month',
      statusText: `Amarelo - ${text}`,
      statusColor: '#F2CE1B',
      badgeColorClass: 'bg-yellow-50 text-amber-800 border-yellow-300',
      badgeBorderClass: 'border-[#F2CE1B]',
      badgeTextClass: 'text-amber-800',
      isUrgent: false,
    };
  }

  // More than 31 days remaining
  const text = `${diffDays} dias restantes`;
  return {
    diffDays,
    statusType: 'ok',
    statusText: `Verde - ${text}`,
    statusColor: '#16A34A',
    badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeBorderClass: 'border-emerald-500',
    badgeTextClass: 'text-emerald-700',
    isUrgent: false,
  };
}

/**
 * Returns formatted remaining days text (e.g. "Vence hoje", "Vencido há 3 dias", "12 dias")
 */
export function getDaysRemainingLabel(diffDays: number): string {
  if (diffDays < 0) {
    const d = Math.abs(diffDays);
    return `Vencido há ${d} ${d === 1 ? 'dia' : 'dias'}`;
  }
  if (diffDays === 0) {
    return 'Vence hoje';
  }
  return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
}

/**
 * Formats today's date in nice PT-BR header string
 */
export function getFormattedToday(): string {
  const today = new Date();
  return today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
