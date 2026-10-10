export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function money(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `USD ${Number(n).toFixed(2)}`
}

export function statusLabel(status) {
  return {
    new: '待问清',
    clarifying: '已问清',
    quoted: '已报价',
    negotiating: '议价中',
    won: '买家要 PI',
    pi_issued: '已出 PI',
    lost: '关闭',
    awaiting_deposit: '等定金',
    deposit_in: '定金已到',
    in_production: '排产中',
    docs_ready: '已出单据',
    bl_out: '等尾款',
    closed: '已收齐',
  }[status] || status
}

export function statusBadge(status) {
  return `<span class="badge badge-${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</span>`
}

/** 已生成 PI 的询盘不再显示「买家要 PI」 */
export function inquiryBadge(inquiry) {
  if (!inquiry) return ''
  if (['in_production', 'docs_ready', 'bl_out', 'closed'].includes(inquiry.status)) {
    return statusBadge(inquiry.status)
  }
  if (inquiry.piId) return statusBadge('pi_issued')
  return statusBadge(inquiry.status)
}
