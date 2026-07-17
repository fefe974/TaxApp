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
  },
  {
    desc: 'Se pagan $800 en efectivo por gastos de renta',
    diario: [['Gasto de renta', 800, 'cargo'], ['Efectivo', 800, 'abono']],
    mov: { ef: -800, ur: -800 },
    tag: { ur: ' (Gasto)' },
  },
  {
    desc: 'Se compra equipo por $3,000 a crédito',
    diario: [['Equipo', 3000, 'cargo'], ['Cuentas por pagar', 3000, 'abono']],
    mov: { eq: 3000, cp: 3000 },
  },
  {
    desc: 'Se reciben $1,500 en efectivo por ingresos de servicios',
    diario: [['Efectivo', 1500, 'cargo'], ['Ingresos por servicios', 1500, 'abono']],
    mov: { ef: 1500, ur: 1500 },
    tag: { ur: ' (Ingreso)' },
  },
  {
    desc: 'Se piden prestados $700 al banco',
    diario: [['Efectivo', 700, 'cargo'], ['Notas por pagar', 700, 'abono']],
    mov: { ef: 700, np: 700 },
  },
  {
    desc: 'Se prestan servicios y se facturan $2,000 a crédito',
    diario: [['Cuentas por cobrar', 2000, 'cargo'], ['Ingresos por servicios', 2000, 'abono']],
    mov: { cc: 2000, ur: 2000 },
    tag: { ur: ' (Ingreso)' },
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
  },
];

export const SALDOS_INICIALES = { ef: 0, cc: 0, eq: 0, np: 0, cp: 0, cs: 0, ur: 0 };

// status: 'listo' (done), 'curso' (in progress), 'proximo' (upcoming).
// interactive:true marks the one class that actually links into the Libro Mayor screens.
// Pure data derivation shared by HomeScreen's accordion and the Drawer's flat list —
// each chapter's completion % blends "listo" classes (full credit) with the one
// "interactive" class weighted by the journal's own progress (paso/TRANS.length).
export function computeChapters(pct) {
  return COURSE.map((ch, i) => {
    let prog = 0;
    ch.classes.forEach((cl) => {
      if (cl.status === 'listo') prog += 1;
      else if (cl.interactive) prog += pct / 100;
    });
    const cPct = Math.round((prog / ch.classes.length) * 100);
    return {
      index: i,
      num: i + 1,
      code: ch.code,
      title: ch.title,
      countText: ch.classes.length + (ch.classes.length === 1 ? ' clase' : ' clases'),
      pct: cPct,
      classes: ch.classes,
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
      { title: 'El libro mayor y la partida doble', status: 'curso', interactive: true },
      { title: 'Ejercicios de cargo y abono', status: 'proximo' },
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
