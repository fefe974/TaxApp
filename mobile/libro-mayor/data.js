export const fmt = (n) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US');
export const fmtMov = (n) => (n > 0 ? '+' : '−') + '$' + Math.abs(n).toLocaleString('en-US');

export const CUENTAS = [
  { n: 'Activos', saldo: 'deudor', sube: 'cargo' },
  { n: 'Pasivos', saldo: 'acreedor', sube: 'abono' },
  { n: 'Capital Social', saldo: 'acreedor', sube: 'abono' },
  { n: 'Utilidades Retenidas', saldo: 'acreedor', sube: 'abono' },
  { n: 'Dividendos', saldo: 'deudor', sube: 'cargo' },
  { n: 'Ingresos', saldo: 'acreedor', sube: 'abono' },
  { n: 'Gastos', saldo: 'deudor', sube: 'cargo' },
];

// mov columns: ef (efectivo), cc (ctas. cobrar), eq (equipo) | np (notas pagar), cp (ctas. pagar), cs (capital social), ur (utilidades retenidas)
export const TRANS = [
  {
    desc: 'Se emiten acciones a cambio de $10,000 en efectivo',
    diario: [['Efectivo', 10000, 'cargo'], ['Capital social', 10000, 'abono']],
    mov: { ef: 10000, cs: 10000 },
    hint: 'El efectivo que entra es un Activo. ¿Qué cuenta de Capital aumenta cuando se emiten acciones?',
  },
  {
    desc: 'Se pagan $800 en efectivo por gastos de renta',
    diario: [['Gasto de renta', 800, 'cargo'], ['Efectivo', 800, 'abono']],
    mov: { ef: -800, ur: -800 },
    tag: { ur: ' (Gasto)' },
    hint: 'Un gasto siempre se carga (Cargo). ¿Qué le pasa al Efectivo cuando se paga algo?',
  },
  {
    desc: 'Se compra equipo por $3,000 a crédito',
    diario: [['Equipo', 3000, 'cargo'], ['Cuentas por pagar', 3000, 'abono']],
    mov: { eq: 3000, cp: 3000 },
    hint: '"A crédito" significa que no se paga con efectivo — se genera una obligación (Pasivo).',
  },
  {
    desc: 'Se reciben $1,500 en efectivo por ingresos de servicios',
    diario: [['Efectivo', 1500, 'cargo'], ['Ingresos por servicios', 1500, 'abono']],
    mov: { ef: 1500, ur: 1500 },
    tag: { ur: ' (Ingreso)' },
    hint: 'Recibir efectivo por un servicio genera un Ingreso, y los ingresos aumentan el Capital (Abono).',
  },
  {
    desc: 'Se piden prestados $700 al banco',
    diario: [['Efectivo', 700, 'cargo'], ['Notas por pagar', 700, 'abono']],
    mov: { ef: 700, np: 700 },
    hint: 'Un préstamo bancario es un Pasivo con un nombre distinto al de "Cuentas por pagar".',
  },
  {
    desc: 'Se prestan servicios y se facturan $2,000 a crédito',
    diario: [['Cuentas por cobrar', 2000, 'cargo'], ['Ingresos por servicios', 2000, 'abono']],
    mov: { cc: 2000, ur: 2000 },
    tag: { ur: ' (Ingreso)' },
    hint: '"Se facturan" (no se cobra en efectivo) significa que el cliente nos debe: Cuentas por cobrar.',
  },
  {
    desc: 'Se pagan gastos: salarios $500, servicios públicos $300 y publicidad $100',
    diario: [
      ['Salarios', 500, 'cargo'],
      ['Servicios públicos', 300, 'cargo'],
      ['Publicidad', 100, 'cargo'],
      ['Efectivo', 900, 'abono'],
    ],
    mov: { ef: -900, ur: -900 },
    tag: { ur: ' (Gastos)' },
    hint: 'Son tres gastos distintos (los tres se cargan) contra una sola salida de Efectivo.',
  },
];

export const SALDOS_INICIALES = { ef: 0, cc: 0, eq: 0, np: 0, cp: 0, cs: 0, ur: 0 };

// Normalized shape for the "Ahora tú" independent practice round: every account name
// that appears anywhere in TRANS (for distractor chips), and each transaction reduced
// to { desc, hint, correct: [{ name, side }] } with cargo/abono mapped to debit/credit.
export const TRANS_ACCOUNT_POOL = [...new Set(TRANS.flatMap((t) => t.diario.map(([name]) => name)))];
export const TRANS_PRACTICE_ITEMS = TRANS.map((t) => ({
  desc: t.desc,
  hint: t.hint,
  correct: t.diario.map(([name, , tipo]) => ({ name, side: tipo === 'cargo' ? 'debit' : 'credit' })),
}));

// status: 'listo' (done), 'curso' (in progress), 'proximo' (upcoming, not yet interactive).
// interactive classes carry a `progressKey` naming which entry in the `progress` map
// (passed in from App.js) drives their own live status + the chapter's blended %.
export function computeChapters(progress) {
  return COURSE.map((ch, i) => {
    let prog = 0;
    const classes = ch.classes.map((cl) => {
      if (!cl.interactive) return cl;
      const pct = progress[cl.progressKey] ?? 0;
      prog += pct / 100;
      const status = pct === 0 ? 'proximo' : pct === 100 ? 'listo' : 'curso';
      return { ...cl, status };
    });
    ch.classes.forEach((cl) => {
      if (!cl.interactive && cl.status === 'listo') prog += 1;
    });
    const cPct = Math.round((prog / ch.classes.length) * 100);
    return {
      index: i,
      num: i + 1,
      code: ch.code,
      title: ch.title,
      countText: ch.classes.length + (ch.classes.length === 1 ? ' clase' : ' clases'),
      pct: cPct,
      classes,
    };
  });
}

export const COURSE = [
  {
    code: 'Capítulo 1',
    title: 'Introducción a la contabilidad',
    classes: [
      { title: 'La empresa y la información financiera', status: 'listo' },
      { title: 'La ecuación contable básica', status: 'listo' },
      { title: 'Activos, pasivos y capital', status: 'listo' },
    ],
  },
  {
    code: 'Capítulo 2',
    title: 'El libro mayor y la partida doble',
    classes: [
      { title: 'El libro mayor y la partida doble', interactive: true, target: 'libro', progressKey: 'libro' },
      { title: 'Analizar y registrar transacciones', interactive: true, target: 'leccion22', progressKey: 'leccion22' },
    ],
  },
  {
    code: 'Capítulo 3',
    title: 'Ajustes y cierre contable',
    classes: [
      { title: 'Asientos de ajuste', status: 'proximo' },
      { title: 'Depreciación y devengado', status: 'proximo' },
      { title: 'Cierre del periodo', status: 'proximo' },
    ],
  },
  {
    code: 'Capítulo 4',
    title: 'Estados financieros y análisis',
    classes: [
      { title: 'Balance general', status: 'proximo' },
      { title: 'Estado de resultados', status: 'proximo' },
      { title: 'Flujo de efectivo', status: 'proximo' },
      { title: 'Razones financieras', status: 'proximo' },
    ],
  },
];

/* ============================================================
   LECCIÓN 2.2 · Analyze and Record Business Transactions
   ============================================================ */

// Illustrations 2.9–2.10: Chart of Accounts, categorized by numbering block.
export const CHART_OF_ACCOUNTS = [
  {
    range: '100s',
    category: 'Activos',
    categoryEn: 'Assets',
    accounts: [
      { code: 101, name: 'Cash' },
      { code: 112, name: 'Accounts Receivable' },
      { code: 126, name: 'Supplies' },
      { code: 157, name: 'Equipment' },
    ],
  },
  {
    range: '200s',
    category: 'Pasivos',
    categoryEn: 'Liabilities',
    accounts: [
      { code: 200, name: 'Notes Payable' },
      { code: 201, name: 'Accounts Payable' },
      { code: 209, name: 'Unearned Service Revenue' },
    ],
  },
  {
    range: '300s',
    category: 'Capital contable',
    categoryEn: "Stockholders' Equity",
    accounts: [
      { code: 311, name: 'Common Stock' },
      { code: 320, name: 'Retained Earnings' },
      { code: 332, name: 'Dividends' },
    ],
  },
  {
    range: '400s',
    category: 'Ingresos',
    categoryEn: 'Revenues',
    accounts: [{ code: 400, name: 'Service Revenue' }],
  },
  {
    range: '600s / 700s',
    category: 'Gastos',
    categoryEn: 'Expenses',
    accounts: [
      { code: 726, name: 'Salaries and Wages Expense' },
      { code: 729, name: 'Rent Expense' },
    ],
  },
];

// Illustration 2.8: the worked journalizing-technique example.
export const JOURNALIZING_EXAMPLE = {
  entries: [
    {
      date: 'Sept. 1',
      lines: [
        { account: 'Cash', ref: '101', debit: 15000 },
        { account: 'Common Stock', ref: '311', credit: 15000 },
      ],
      explanation: 'Issued common stock for cash',
    },
    {
      date: 'Sept. 1',
      lines: [
        { account: 'Equipment', ref: '157', debit: 7000 },
        { account: 'Cash', ref: '101', credit: 7000 },
      ],
      explanation: 'Purchase of equipment for cash',
    },
  ],
};

// Illustrations 2.11–2.20: Pioneer Advertising's October transactions, illustrated.
export const PIONEER_TRANS = [
  {
    ill: 'Ilustración 2.11',
    title: 'Investment',
    desc: 'Se invierte capital en la empresa a cambio de acciones.',
    analysis: [
      { account: 'Cash', kind: 'Activo', change: 'aumenta', amount: 100000 },
      { account: 'Common Stock', kind: 'Capital', change: 'aumenta', amount: 100000 },
    ],
    lines: [
      { account: 'Cash', debit: 100000 },
      { account: 'Common Stock', credit: 100000 },
    ],
  },
  {
    ill: 'Ilustración 2.12',
    title: 'Purchase of Equipment',
    desc: 'Se compra equipo firmando un pagaré (Notes Payable) a cambio.',
    analysis: [
      { account: 'Equipment', kind: 'Activo', change: 'aumenta', amount: 50000 },
      { account: 'Notes Payable', kind: 'Pasivo', change: 'aumenta', amount: 50000 },
    ],
    lines: [
      { account: 'Equipment', debit: 50000 },
      { account: 'Notes Payable', credit: 50000 },
    ],
  },
  {
    ill: 'Ilustración 2.13',
    title: 'Unearned Revenue',
    desc: 'Se recibe un adelanto en efectivo por servicios que se prestarán después.',
    analysis: [
      { account: 'Cash', kind: 'Activo', change: 'aumenta', amount: 12000 },
      { account: 'Unearned Service Revenue', kind: 'Pasivo', change: 'aumenta', amount: 12000 },
    ],
    lines: [
      { account: 'Cash', debit: 12000 },
      { account: 'Unearned Service Revenue', credit: 12000 },
    ],
  },
  {
    ill: 'Ilustración 2.14',
    title: 'Payment of Rent',
    desc: 'Se paga la renta del mes en efectivo.',
    analysis: [
      { account: 'Rent Expense', kind: 'Gasto', change: 'aumenta', amount: 9000 },
      { account: 'Cash', kind: 'Activo', change: 'disminuye', amount: 9000 },
    ],
    lines: [
      { account: 'Rent Expense', debit: 9000 },
      { account: 'Cash', credit: 9000 },
    ],
  },
  {
    ill: 'Ilustración 2.15',
    title: 'Payment of Insurance',
    desc: 'Se paga por adelantado una póliza de seguro.',
    analysis: [
      { account: 'Prepaid Insurance', kind: 'Activo', change: 'aumenta', amount: 6000 },
      { account: 'Cash', kind: 'Activo', change: 'disminuye', amount: 6000 },
    ],
    lines: [
      { account: 'Prepaid Insurance', debit: 6000 },
      { account: 'Cash', credit: 6000 },
    ],
  },
  {
    ill: 'Ilustración 2.16',
    title: 'Purchase of Supplies on Credit',
    desc: 'Se compran suministros a crédito.',
    analysis: [
      { account: 'Supplies', kind: 'Activo', change: 'aumenta', amount: 25000 },
      { account: 'Accounts Payable', kind: 'Pasivo', change: 'aumenta', amount: 25000 },
    ],
    lines: [
      { account: 'Supplies', debit: 25000 },
      { account: 'Accounts Payable', credit: 25000 },
    ],
  },
  {
    ill: 'Ilustración 2.17',
    title: 'Signing a Contract',
    desc: 'Se firma un contrato de servicios futuros — todavía no hay intercambio de valor.',
    analysis: [{ account: 'Ninguna cuenta', kind: '—', change: 'sin efecto', amount: 0 }],
    lines: null,
    noEntry: true,
  },
  {
    ill: 'Ilustración 2.18',
    title: 'Payment of Salaries',
    desc: 'Se pagan los salarios de los empleados.',
    analysis: [
      { account: 'Salaries and Wages Expense', kind: 'Gasto', change: 'aumenta', amount: 40000 },
      { account: 'Cash', kind: 'Activo', change: 'disminuye', amount: 40000 },
    ],
    lines: [
      { account: 'Salaries and Wages Expense', debit: 40000 },
      { account: 'Cash', credit: 40000 },
    ],
  },
  {
    ill: 'Ilustración 2.19',
    title: 'Receipt and Billing of Services',
    desc: 'Se prestan servicios: una parte se cobra de inmediato y otra queda a crédito.',
    analysis: [
      { account: 'Cash', kind: 'Activo', change: 'aumenta', amount: 28000 },
      { account: 'Accounts Receivable', kind: 'Activo', change: 'aumenta', amount: 72000 },
      { account: 'Service Revenue', kind: 'Capital', change: 'aumenta', amount: 100000 },
    ],
    lines: [
      { account: 'Cash', debit: 28000 },
      { account: 'Accounts Receivable', debit: 72000 },
      { account: 'Service Revenue', credit: 100000 },
    ],
  },
  {
    ill: 'Ilustración 2.20',
    title: 'Payment of Dividends',
    desc: 'Se declaran y pagan dividendos a los accionistas.',
    analysis: [
      { account: 'Dividends', kind: 'Capital', change: 'aumenta', amount: 5000 },
      { account: 'Cash', kind: 'Activo', change: 'disminuye', amount: 5000 },
    ],
    lines: [
      { account: 'Dividends', debit: 5000 },
      { account: 'Cash', credit: 5000 },
    ],
  },
];

// Put It into Practice, LO 2.2 · Kleene Window Washing Inc. — July 2025.
// Each account tracks its own running net balance; `normal` says which column
// (debit/credit) it belongs in on the Trial Balance.
export const KLEENE_ACCOUNTS = [
  { key: 'cash', name: 'Cash', normal: 'debit' },
  { key: 'ar', name: 'Accounts Receivable', normal: 'debit' },
  { key: 'supplies', name: 'Supplies', normal: 'debit' },
  { key: 'prepaidIns', name: 'Prepaid Insurance', normal: 'debit' },
  { key: 'equipment', name: 'Equipment', normal: 'debit' },
  { key: 'ap', name: 'Accounts Payable', normal: 'credit' },
  { key: 'commonStock', name: 'Common Stock', normal: 'credit' },
  { key: 'dividends', name: 'Dividends', normal: 'debit' },
  { key: 'serviceRevenue', name: 'Service Revenue', normal: 'credit' },
  { key: 'salariesExp', name: 'Salaries and Wages Expense', normal: 'debit' },
  { key: 'maintenanceExp', name: 'Maintenance and Repairs Expense', normal: 'debit' },
];

export const KLEENE_SALDOS_INICIALES = KLEENE_ACCOUNTS.reduce((acc, a) => ({ ...acc, [a.key]: 0 }), {});

export const KLEENE_TRANS = [
  {
    date: 'Jul. 1',
    desc: 'Se emiten acciones a cambio de $12,000 en efectivo',
    lines: [
      { account: 'cash', side: 'debit', amount: 12000 },
      { account: 'commonStock', side: 'credit', amount: 12000 },
    ],
    hint: 'Emitir acciones a cambio de efectivo aumenta el Capital Social.',
  },
  {
    date: 'Jul. 1',
    desc: 'Se compra un camión (Equipment) por $8,000: $2,000 en efectivo y $6,000 a crédito',
    lines: [
      { account: 'equipment', side: 'debit', amount: 8000 },
      { account: 'cash', side: 'credit', amount: 2000 },
      { account: 'ap', side: 'credit', amount: 6000 },
    ],
    hint: 'El camión es Equipment. Una parte se paga con Efectivo y el resto queda a crédito (Accounts Payable) — son tres cuentas, no dos.',
  },
  {
    date: 'Jul. 3',
    desc: 'Se compran suministros (Supplies) a crédito por $900',
    lines: [
      { account: 'supplies', side: 'debit', amount: 900 },
      { account: 'ap', side: 'credit', amount: 900 },
    ],
    hint: 'Comprar a crédito no afecta el Efectivo — genera una obligación.',
  },
  {
    date: 'Jul. 5',
    desc: 'Se paga por adelantado una póliza de seguro por $1,800',
    lines: [
      { account: 'prepaidIns', side: 'debit', amount: 1800 },
      { account: 'cash', side: 'credit', amount: 1800 },
    ],
    hint: 'Pagar por adelantado crea un Activo (Prepaid Insurance), no un gasto todavía.',
  },
  {
    date: 'Jul. 12',
    desc: 'Se prestan servicios y se facturan $3,700 a crédito',
    lines: [
      { account: 'ar', side: 'debit', amount: 3700 },
      { account: 'serviceRevenue', side: 'credit', amount: 3700 },
    ],
    hint: 'Facturar a crédito genera Accounts Receivable, no efectivo.',
  },
  {
    date: 'Jul. 18',
    desc: 'Se pagan $1,500 de cuentas por pagar ($1,000 + $500)',
    lines: [
      { account: 'ap', side: 'debit', amount: 1500 },
      { account: 'cash', side: 'credit', amount: 1500 },
    ],
    hint: 'Pagar una deuda reduce tanto el Efectivo como Accounts Payable.',
  },
  {
    date: 'Jul. 20',
    desc: 'Se pagan salarios por $2,000',
    lines: [
      { account: 'salariesExp', side: 'debit', amount: 2000 },
      { account: 'cash', side: 'credit', amount: 2000 },
    ],
    hint: 'Los salarios son un gasto que se paga en efectivo de inmediato.',
  },
  {
    date: 'Jul. 21',
    desc: 'Se cobran $1,600 de cuentas por cobrar',
    lines: [
      { account: 'cash', side: 'debit', amount: 1600 },
      { account: 'ar', side: 'credit', amount: 1600 },
    ],
    hint: 'Cobrar una cuenta reduce Accounts Receivable y aumenta el Efectivo.',
  },
  {
    date: 'Jul. 25',
    desc: 'Se prestan servicios y se facturan $2,500 a crédito',
    lines: [
      { account: 'ar', side: 'debit', amount: 2500 },
      { account: 'serviceRevenue', side: 'credit', amount: 2500 },
    ],
    hint: 'Igual que la operación del día 12: se factura, no se cobra de inmediato.',
  },
  {
    date: 'Jul. 31',
    desc: 'Se paga mantenimiento y reparaciones por $290',
    lines: [
      { account: 'maintenanceExp', side: 'debit', amount: 290 },
      { account: 'cash', side: 'credit', amount: 290 },
    ],
    hint: 'Un gasto más, pagado de inmediato en efectivo.',
  },
  {
    date: 'Jul. 31',
    desc: 'Se declaran y pagan dividendos por $600',
    lines: [
      { account: 'dividends', side: 'debit', amount: 600 },
      { account: 'cash', side: 'credit', amount: 600 },
    ],
    hint: 'Los dividendos reducen el Capital contable — no son un gasto operativo.',
  },
];

// Same normalized shape as TRANS_PRACTICE_ITEMS, for Kleene's "Ahora tú" round.
export const KLEENE_ACCOUNT_POOL = KLEENE_ACCOUNTS.map((a) => a.name);
export const KLEENE_PRACTICE_ITEMS = KLEENE_TRANS.map((t) => ({
  desc: t.desc,
  hint: t.hint,
  correct: t.lines.map((l) => ({
    name: KLEENE_ACCOUNTS.find((a) => a.key === l.account).name,
    side: l.side,
  })),
}));
