export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100
}

export function setsPer40hq(cbmPerSet, usableCbm = 68) {
  if (!cbmPerSet || cbmPerSet <= 0) return 0
  return Math.floor(usableCbm / cbmPerSet)
}

export function costBreakdown({
  exw,
  inlandPerSet,
  docsPerSet,
  oceanPer40hq,
  insuranceRate,
  qty,
  cbmPerSet,
  usableCbm,
  forceFullContainer,
}) {
  const fobCost = round2(Number(exw) + Number(inlandPerSet) + Number(docsPerSet))
  const capacity = setsPer40hq(cbmPerSet, usableCbm)
  const full = Boolean(forceFullContainer) || Number(qty) >= capacity
  if (!full) {
    return {
      fobCost,
      cifCost: null,
      oceanPerSet: null,
      insurancePerSet: null,
      capacity,
      canUseContainerCif: false,
    }
  }
  const oceanPerSet = round2(Number(oceanPer40hq) / capacity)
  const insurancePerSet = round2((fobCost + oceanPerSet) * 1.1 * Number(insuranceRate))
  const cifCost = round2(fobCost + oceanPerSet + insurancePerSet)
  return {
    fobCost,
    cifCost,
    oceanPerSet,
    insurancePerSet,
    capacity,
    canUseContainerCif: true,
  }
}

export function validateQuote({ sellFob, sellCif, canUseContainerCif, fobPort, cifPort }) {
  const errors = []
  if (!fobPort) errors.push('必须写明 FOB 港口')
  if (sellCif != null && sellCif !== '' && !cifPort) errors.push('必须写明 CIF 港口')
  const fob = sellFob === '' || sellFob == null ? null : Number(sellFob)
  const cif = sellCif === '' || sellCif == null ? null : Number(sellCif)
  if (fob == null || Number.isNaN(fob) || fob <= 0) errors.push('必须填写对外 FOB 单价')
  if (cif != null && Number.isNaN(cif)) errors.push('CIF 单价无效')
  if (cif != null && !canUseContainerCif) {
    errors.push('数量不足一柜，不能沿用整柜 CIF，请只报 FOB 或按 LCL 重算运费')
  }
  if (cif != null && fob != null && cif <= fob) errors.push('CIF 必须高于 FOB')
  return errors
}

export function marginPct(sell, cost) {
  if (sell == null || cost == null || sell <= 0) return null
  return round2(((sell - cost) / sell) * 100)
}
