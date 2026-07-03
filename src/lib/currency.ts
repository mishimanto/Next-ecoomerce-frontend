export function formatCurrency(value?: number | string | null) {
  const amount = Number(value || 0);

  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
