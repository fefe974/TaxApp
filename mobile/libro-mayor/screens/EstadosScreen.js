import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { Ojal, Titulo, TituloEm, Intro } from '../components/Typography';
import { IconFlujoAbajo } from '../components/Icons';

function Reng({ label, value, sangria, variant, resalta }) {
  const isGranTotal = variant === 'granTotal';
  return (
    <View
      style={[
        styles.reng,
        variant === 'subtotal' && styles.rengSubtotal,
        isGranTotal && styles.rengGranTotal,
      ]}
    >
      <Text style={[styles.rengLabel, sangria && styles.rengSangria, variant === 'subtotal' && styles.rengLabelBold]}>
        {label}
      </Text>
      {isGranTotal ? (
        <View style={styles.granTotalValorWrap}>
          <Text style={[styles.rengValor, styles.rengValorBold, resalta && styles.rengValorResalta]}>{value}</Text>
          <View style={styles.dobleLinea}>
            <View style={styles.dobleLineaBarra} />
            <View style={styles.dobleLineaBarra} />
          </View>
        </View>
      ) : (
        <Text style={[styles.rengValor, variant === 'subtotal' && styles.rengValorBold, resalta && styles.rengValorResalta]}>
          {value}
        </Text>
      )}
    </View>
  );
}

function EstadoCard({ title, subtitle, children }) {
  return (
    <View style={styles.estado}>
      <View style={styles.membrete}>
        <Text style={styles.membreteTitulo}>{title}</Text>
        <Text style={styles.membreteSub}>{subtitle.toUpperCase()}</Text>
        <View style={styles.membreteAccent} />
      </View>
      <View style={styles.cuerpo}>{children}</View>
    </View>
  );
}

function Flujo({ children }) {
  return (
    <View style={styles.flujo}>
      <View style={styles.flujoBarra} />
      <IconFlujoAbajo size={13} color={colors.latonOscuro} />
      <Text style={styles.flujoTexto}>{children}</Text>
    </View>
  );
}

export default function EstadosScreen() {
  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Ojal>ILUSTRACIONES 2.4 – 2.5</Ojal>
      <Titulo>
        Los estados, <TituloEm>encadenados</TituloEm>
      </Titulo>
      <Intro>
        La utilidad neta fluye hacia las utilidades retenidas, y su saldo final se reporta en el balance general.
      </Intro>

      <EstadoCard title="Estado de Resultados" subtitle="Cuentas nominales">
        <Reng label="Ingresos por servicios" value="$3,500" />
        <Reng label="Gasto de renta" value="(800)" sangria />
        <Reng label="Salarios" value="(500)" sangria />
        <Reng label="Servicios públicos" value="(300)" sangria />
        <Reng label="Publicidad" value="(100)" sangria />
        <Reng label="Utilidad neta" value="$1,800" variant="granTotal" resalta />
      </EstadoCard>

      <Flujo>LA UTILIDAD NETA SE SUMA</Flujo>

      <EstadoCard title="Estado de Utilidades Retenidas" subtitle="Puente entre estados">
        <Reng label="Saldo inicial" value="$0" />
        <Reng label="(+) Utilidad neta" value="1,800" resalta />
        <Reng label="(−) Dividendos" value="0" />
        <Reng label="Saldo final" value="$1,800" variant="granTotal" resalta />
      </EstadoCard>

      <Flujo>EL SALDO FINAL SE REPORTA</Flujo>

      <EstadoCard title="Balance General" subtitle="Cuentas reales">
        <Reng label="Activos" value="" variant="subtotal" />
        <Reng label="Efectivo" value="$10,500" sangria />
        <Reng label="Cuentas por cobrar" value="2,000" sangria />
        <Reng label="Equipo" value="3,000" sangria />
        <Reng label="Total activos" value="$15,500" variant="granTotal" />
        <View style={{ height: 10 }} />
        <Reng label="Pasivos y capital contable" value="" variant="subtotal" />
        <Reng label="Notas por pagar" value="$700" sangria />
        <Reng label="Cuentas por pagar" value="3,000" sangria />
        <Reng label="Capital social" value="10,000" sangria />
        <Reng label="Utilidades retenidas" value="1,800" sangria resalta />
        <Reng label="Total pasivos y capital" value="$15,500" variant="granTotal" />
      </EstadoCard>

      <View style={styles.leyenda}>
        <View style={styles.caja}>
          <Text style={[styles.cajaTitulo, { color: colors.debe }]}>CUENTAS NOMINALES</Text>
          <Text style={styles.cajaTexto}>Temporales: ingresos, gastos y dividendos. Afectan el capital durante el periodo.</Text>
        </View>
        <View style={styles.caja}>
          <Text style={[styles.cajaTitulo, { color: colors.haber }]}>CUENTAS REALES</Text>
          <Text style={styles.cajaTexto}>Permanentes: capital social y utilidades retenidas. Perduran entre periodos.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
    gap: 0,
  },
  estado: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 15,
    overflow: 'hidden',
  },
  membrete: {
    padding: 17,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: colors.texto,
  },
  membreteTitulo: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.texto,
  },
  membreteSub: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textoSuave,
    marginTop: 2,
  },
  membreteAccent: {
    position: 'absolute',
    left: 17,
    right: 17,
    bottom: -3.5,
    height: 1,
    backgroundColor: colors.laton,
    opacity: 0.6,
  },
  cuerpo: {
    padding: 17,
    paddingTop: 12,
    paddingBottom: 15,
  },
  reng: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 5,
  },
  rengSubtotal: {
    borderTopWidth: 1,
    borderTopColor: colors.regla,
  },
  rengGranTotal: {
    borderTopWidth: 2.5,
    borderTopColor: colors.texto,
    marginTop: 4,
    paddingTop: 9,
  },
  rengLabel: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: colors.textoSuave,
  },
  rengLabelBold: {
    fontFamily: fonts.sansSemiBold,
    color: colors.texto,
  },
  rengSangria: {
    paddingLeft: 14,
  },
  rengValor: {
    fontFamily: fonts.mono,
    fontSize: 12.5,
    color: colors.texto,
  },
  rengValorBold: {
    fontFamily: fonts.monoSemiBold,
  },
  rengValorResalta: {
    color: colors.haber,
  },
  granTotalValorWrap: {
    alignItems: 'flex-end',
  },
  dobleLinea: {
    marginTop: 2,
    width: '100%',
    gap: 1.5,
  },
  dobleLineaBarra: {
    height: 1,
    backgroundColor: colors.texto,
  },
  flujo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginVertical: 7,
    marginLeft: 23,
  },
  flujoBarra: {
    width: 2,
    height: 26,
    backgroundColor: colors.laton,
  },
  flujoTexto: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: colors.latonOscuro,
  },
  leyenda: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 17,
  },
  caja: {
    flex: 1,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 13,
  },
  cajaTitulo: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 6,
  },
  cajaTexto: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    lineHeight: 17.5,
    color: colors.textoSuave,
  },
});
