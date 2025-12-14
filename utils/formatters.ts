
export const formatCompactNumber = (number: number): string => {
  if (number === 0) return 'Rp 0';
  
  // Miliar (Billion)
  if (number >= 1_000_000_000) {
    return `Rp ${(number / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}M`; 
  }
  
  // Juta (Million)
  if (number >= 1_000_000) {
    return `Rp ${(number / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`; 
  }
  
  // Ribu (Thousand)
  if (number >= 1_000) {
    return `Rp ${(number / 1_000).toFixed(0)}rb`; 
  }
  
  return `Rp ${number.toLocaleString('id-ID')}`;
};

// Keep the precise formatter for official documents/payment
export const formatCurrency = (number: number): string => {
  return `Rp ${number.toLocaleString('id-ID')}`;
};

// Format string input to currency (remove non-digits, add separators)
export const formatCurrencyInput = (val: string) => {
    const raw = val.replace(/\D/g, '');
    return raw ? parseInt(raw).toLocaleString('id-ID') : '';
};