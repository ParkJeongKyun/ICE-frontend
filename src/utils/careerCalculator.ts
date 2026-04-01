/**
 * Parse date string in format "YYYY.MM"
 */
function parseCareerDate(dateStr: string): { year: number; month: number } {
  const parts = dateStr.split('.');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
  };
}

/**
 * Calculate the duration between two dates in "career.period" format (e.g., "2021.01 ~ 2022.07")
 * Returns an object with years and months
 */
export function calculateCareerDuration(periodString: string): {
  years: number;
  months: number;
} {
  // Split by the period separator (~, -, or –)
  const separator = periodString.includes('~')
    ? '~'
    : periodString.includes('–')
      ? '–'
      : '-';
  const parts = periodString.split(separator).map((p) => p.trim());

  if (parts.length !== 2) {
    return { years: 0, months: 0 };
  }

  const startDate = parseCareerDate(parts[0]);
  const endDate = parseCareerDate(parts[1]);

  let years = endDate.year - startDate.year;
  let months = endDate.month - startDate.month;

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months };
}

/**
 * Calculate total career duration by summing all career periods
 */
export function calculateTotalCareerDuration(careerPeriods: string[]): {
  years: number;
  months: number;
} {
  let totalMonths = 0;

  careerPeriods.forEach((period) => {
    const { years, months } = calculateCareerDuration(period);
    totalMonths += years * 12 + months;
  });

  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  return { years, months: remainingMonths };
}
