export const DESCONTOS = { normal: 0, vip: 0.10, elite: 0.20 }

export function calcularPrecoFinal(precoBase, nivel, precoVip = null, precoElite = null) {
  if (nivel === 'elite') return precoElite ?? precoBase * (1 - DESCONTOS.elite)
  if (nivel === 'vip')   return precoVip   ?? precoBase * (1 - DESCONTOS.vip)
  return precoBase
}