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
    tag: { cs: '' },
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
