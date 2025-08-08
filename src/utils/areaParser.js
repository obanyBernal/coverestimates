// utils/areaParser.js
export function parseAreaExpression(expr) {
  if (!expr || !expr.trim()) return { value: 0, error: null };

  const termSep = /\s*\+\s*/;                 // separa por "+"
  const multSep = /\s*[x×*]\s*/i;             // acepta x, × o *
  const safeNum = s => {
    const n = Number(String(s).trim().replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  };

  let total = 0;
  const terms = expr.split(termSep).filter(Boolean);

  for (const term of terms) {
    // Permite "n" o "n x m"
    if (multSep.test(term)) {
      const [a, b] = term.split(multSep);
      const n1 = safeNum(a);
      const n2 = safeNum(b);
      if (Number.isNaN(n1) || Number.isNaN(n2)) {
        return { value: 0, error: `Término inválido: "${term}"` };
      }
      total += n1 * n2;
    } else {
      const n = safeNum(term);
      if (Number.isNaN(n)) {
        return { value: 0, error: `Número inválido: "${term}"` };
      }
      total += n;
    }
  }

  // Opcional: redondear a entero
  return { value: Math.round(total), error: null };
}
