import { applyBuyerDecision, decideBuyerReply } from './buyer-sim.js'
import { addDaysFrom, buildInquiry, createSeed, ensureCatalog, todayISO } from './seed.js'

const KEY = 'ft-workbench-v2'

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const seed = createSeed()
      localStorage.setItem(KEY, JSON.stringify(seed))
      return clone(seed)
    }
    const data = JSON.parse(raw)
    if (!Array.isArray(data.shipments)) data.shipments = []
    ensureCatalog(data)
    backfillShipments(data)
    return data
  } catch {
    const seed = createSeed()
    localStorage.setItem(KEY, JSON.stringify(seed))
    return clone(seed)
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function resetState() {
  const seed = createSeed()
  localStorage.setItem(KEY, JSON.stringify(seed))
  return clone(seed)
}

export function getCustomer(state, id) {
  return state.customers.find((c) => c.id === id)
}

export function getProduct(state, id) {
  return state.products.find((p) => p.id === id)
}

export function getFactory(state, id) {
  return state.factories.find((f) => f.id === id)
}

export function getInquiry(state, id) {
  return state.inquiries.find((i) => i.id === id)
}

export function getQuote(state, id) {
  return state.quotes.find((q) => q.id === id)
}

export function setInquiryProduct(state, inquiryId, productId) {
  const inquiry = getInquiry(state, inquiryId)
  if (!inquiry || inquiry.piId) return
  inquiry.productId = productId
  inquiry.factoryId = null
  saveState(state)
}

export function factoriesForProduct(state, productId) {
  return state.factories.filter((f) => f.productId === productId)
}

export function isClarified(inquiry) {
  if (!inquiry) return false
  if (inquiry.quoteId || inquiry.piId) return true
  if (
    ['clarifying', 'quoted', 'negotiating', 'won', 'pi_issued', 'in_production', 'docs_ready', 'bl_out', 'closed'].includes(
      inquiry.status,
    )
  )
    return true
  const msgs = inquiry.messages || []
  const firstYou = msgs.findIndex((m) => m.from === 'you')
  if (firstYou < 0) return false
  return msgs.slice(firstYou + 1).some((m) => m.from === 'buyer')
}

function backfillShipments(state) {
  for (const pi of state.pis || []) {
    if (pi.status === 'awaiting_deposit') continue
    if ((state.shipments || []).some((s) => s.piId === pi.id)) continue
    const inquiry = getInquiry(state, pi.inquiryId)
    const closed = pi.status === 'closed' || inquiry?.status === 'closed'
    state.shipments.push({
      id: `sh-${pi.id}`,
      piId: pi.id,
      inquiryId: pi.inquiryId,
      customerId: pi.customerId,
      status: closed ? 'closed' : inquiry?.status === 'bl_out' ? 'bl_out' : inquiry?.status === 'docs_ready' ? 'docs_ready' : 'in_production',
      depositOn: clockDate(state),
      artworkOn: '',
      readyDate: '',
      ci: '',
      pl: '',
      createdAt: pi.createdAt || new Date().toISOString(),
    })
    if (inquiry && inquiry.status === 'pi_issued') inquiry.status = 'in_production'
  }
}

export function markDepositReceived(state, piId) {
  const pi = state.pis.find((p) => p.id === piId)
  if (!pi) return
  pi.status = 'deposit_in'
  const inquiry = getInquiry(state, pi.inquiryId)
  if (inquiry) inquiry.status = 'in_production'
  state.shipments = state.shipments || []
  if (!state.shipments.some((s) => s.piId === piId)) {
    state.shipments.push({
      id: `sh-${Date.now()}`,
      piId,
      inquiryId: pi.inquiryId,
      customerId: pi.customerId,
      status: 'in_production',
      depositOn: clockDate(state),
      artworkOn: '',
      readyDate: '',
      ci: '',
      pl: '',
      createdAt: new Date().toISOString(),
    })
  }
  addFollowup(state, {
    customerId: pi.customerId,
    inquiryId: pi.inquiryId,
    day: pi.leadDays || 30,
    note: '排产中，到期出具 CI / PL',
  })
  saveState(state)
}

export function getShipment(state, id) {
  return (state.shipments || []).find((s) => s.id === id)
}

export function clockDate(state) {
  return state.simDate || todayISO()
}

export function confirmArtwork(state, shipmentId) {
  const s = getShipment(state, shipmentId)
  const pi = state.pis.find((p) => p.id === s?.piId)
  if (!s || !pi || s.status !== 'in_production') return
  s.artworkOn = clockDate(state)
  s.readyDate = addDaysFrom(s.artworkOn, pi.leadDays || 30)
  saveState(state)
}

export function sendSample(state, inquiryId) {
  const inquiry = getInquiry(state, inquiryId)
  const customer = getCustomer(state, inquiry?.customerId)
  if (!inquiry || !customer) return
  inquiry.sampleSent = true
  inquiry.messages = inquiry.messages || []
  inquiry.messages.push({
    at: new Date().toISOString(),
    from: 'you',
    text: `We will send 2 sets to ${customer.city} by courier, freight collect. Please share the receiving address.`,
    textZh: `我们寄 2 套样品到 ${customer.city}，运费到付。请给收件地址。`,
  })
  inquiry.unread = true
  inquiry.messages.push({
    at: new Date().toISOString(),
    from: 'buyer',
    text: `OK, freight collect is fine. Address will follow. We will not book a container before we see the 2 sets.`,
    textZh: `到付可以。地址随后发。没看到这 2 套我们不下柜。`,
  })
  saveState(state)
}

export function advanceClock(state) {
  state.simDate = addDaysFrom(clockDate(state), 1)
  const today = state.simDate
  for (const inquiry of state.inquiries || []) {
    if (!inquiry.ghosted || inquiry.piId) continue
    inquiry.ghosted = false
    inquiry.unread = true
    inquiry.messages = inquiry.messages || []
    inquiry.messages.push({
      at: new Date().toISOString(),
      from: 'buyer',
      text: `Sorry for the delay. We are still here. Please follow up on quantity / price.`,
      textZh: `抱歉回晚了。我们还在。数量和价格请再跟一下。`,
    })
  }
  for (const f of state.followups || []) {
    if (!f.done && f.due && f.due <= today) {
      f.note = `${f.note || ''}（已到 ${today}）`
    }
  }
  saveState(state)
}

export function issueDocs(state, shipmentId) {
  const s = getShipment(state, shipmentId)
  if (!s || s.status !== 'in_production' || !s.artworkOn) return
  const pi = state.pis.find((p) => p.id === s.piId)
  const inquiry = getInquiry(state, s.inquiryId)
  const customer = getCustomer(state, s.customerId)
  const product = getProduct(state, inquiry?.productId)
  if (!pi || !inquiry || !product) return
  const unit = pi.sellCif != null ? Number(pi.sellCif) : Number(pi.sellFob)
  const amount = Number(pi.qty) * unit
  const term = pi.sellCif != null ? `CIF ${pi.cifPort}` : `FOB ${pi.fobPort}`
  const cartons = Math.ceil(Number(pi.qty) / (product.setsPerCarton || 12))
  const gw = (Number(pi.qty) * 0.42).toFixed(1)
  const nw = (Number(pi.qty) * 0.36).toFixed(1)
  const cbm = (Number(pi.qty) * Number(product.cbmPerSet)).toFixed(2)
  s.ci = `COMMERCIAL INVOICE
Seller: Your trading desk, Ningbo
Buyer: ${customer.name}
Invoice No: CI-${s.id}
Related PI: ${pi.id}
Item: ${product.sku} ${product.name}
Qty: ${pi.qty} sets (${pi.qtyLabel})
Unit: ${moneyish(unit)} ${term}
Amount: USD ${amount.toFixed(2)}
Payment: 30% received, 70% against copy of B/L
Not DDP.`
  s.pl = `PACKING LIST
Buyer: ${customer.name}
Related PI: ${pi.id}
Item: ${product.sku}
Qty: ${pi.qty} sets
Packing: ${pi.packing}
Cartons: ${cartons}
NW: ${nw} kg   GW: ${gw} kg   CBM: ${cbm}
Port: ${term}`
  s.status = 'docs_ready'
  inquiry.status = 'docs_ready'
  inquiry.messages = inquiry.messages || []
  inquiry.messages.push({
    at: new Date().toISOString(),
    from: 'you',
    text: `Commercial invoice and packing list issued against PI ${pi.id}. We will send B/L copy after loading.`,
    textZh: `已按 PI ${pi.id} 出具商业发票和装箱单。装船后发提单副本。`,
  })
  inquiry.unread = true
  inquiry.messages.push({
    at: new Date().toISOString(),
    from: 'buyer',
    text: `Docs received. Please send copy of B/L when the vessel is loaded. We will pay the 70% then.`,
    textZh: `单据收到了。装船后请发提单副本，我们再付 70%。`,
  })
  saveState(state)
}

export function issueBL(state, shipmentId) {
  const s = getShipment(state, shipmentId)
  if (!s || s.status !== 'docs_ready') return
  const inquiry = getInquiry(state, s.inquiryId)
  const pi = state.pis.find((p) => p.id === s.piId)
  s.status = 'bl_out'
  if (inquiry) {
    inquiry.status = 'bl_out'
    inquiry.messages = inquiry.messages || []
    inquiry.messages.push({
      at: new Date().toISOString(),
      from: 'you',
      text: `Copy of B/L attached. Please arrange the 70% T/T as agreed.`,
      textZh: `提单副本已附。请按约定安排 70% 电汇。`,
    })
    inquiry.unread = true
    inquiry.messages.push({
      at: new Date().toISOString(),
      from: 'buyer',
      text: `B/L copy received. Accounts will remit the 70% balance shortly.`,
      textZh: `提单副本收到。财务很快汇 70% 尾款。`,
    })
  }
  addFollowup(state, {
    customerId: s.customerId,
    inquiryId: s.inquiryId,
    day: 3,
    note: `跟进尾款：${pi?.qtyLabel || ''}`,
  })
  saveState(state)
}

export function markBalanceReceived(state, shipmentId) {
  const s = getShipment(state, shipmentId)
  if (!s || s.status !== 'bl_out') return
  const pi = state.pis.find((p) => p.id === s.piId)
  const inquiry = getInquiry(state, s.inquiryId)
  s.status = 'closed'
  if (pi) pi.status = 'closed'
  if (inquiry) inquiry.status = 'closed'
  saveState(state)
}

function moneyish(n) {
  return `USD ${Number(n).toFixed(2)}`
}

export function savePiChecks(state, piId, checks) {
  const pi = state.pis.find((p) => p.id === piId)
  if (!pi) return
  pi.checks = checks
  saveState(state)
}

export function createQuote(state, payload) {
  const inquiry = getInquiry(state, payload.inquiryId)
  if (inquiry && !isClarified(inquiry)) return null
  const id = `q-${Date.now()}`
  const quote = { id, locked: false, createdAt: new Date().toISOString(), ...payload }
  state.quotes.push(quote)
  if (inquiry) {
    inquiry.quoteId = id
    inquiry.factoryId = payload.factoryId
    inquiry.status = inquiry.status === 'new' || inquiry.status === 'clarifying' ? 'quoted' : inquiry.status
    inquiry.messages = inquiry.messages || []
    inquiry.messages.push({
      at: new Date().toISOString(),
      from: 'you',
      text: `Quotation sent: USD ${payload.sellFob.toFixed(2)} FOB ${payload.fobPort}${
        payload.sellCif != null ? ` / USD ${payload.sellCif.toFixed(2)} CIF ${payload.cifPort}` : ' (FOB only)'
      }.`,
      textZh: `已报价：USD ${payload.sellFob.toFixed(2)} FOB ${payload.fobPort}${
        payload.sellCif != null ? ` / USD ${payload.sellCif.toFixed(2)} CIF ${payload.cifPort}` : '（只报 FOB）'
      }。`,
    })
  }
  saveState(state)
  runBuyerSim(state, payload.inquiryId)
  return quote
}

export function updateQuote(state, quoteId, patch) {
  const quote = getQuote(state, quoteId)
  if (!quote || quote.locked) return quote
  Object.assign(quote, patch)
  const inquiry = getInquiry(state, quote.inquiryId)
  if (inquiry) {
    inquiry.messages = inquiry.messages || []
    inquiry.messages.push({
      at: new Date().toISOString(),
      from: 'you',
      text: `Updated quotation: USD ${Number(quote.sellFob).toFixed(2)} FOB ${quote.fobPort}${
        quote.sellCif != null ? ` / USD ${Number(quote.sellCif).toFixed(2)} CIF ${quote.cifPort}` : ' (FOB only)'
      }.`,
    })
  }
  saveState(state)
  runBuyerSim(state, quote.inquiryId)
  return quote
}

export function saveReply(state, inquiryId, text, textZh = '') {
  const inquiry = getInquiry(state, inquiryId)
  if (!inquiry) return
  inquiry.messages = inquiry.messages || []
  inquiry.messages.push({ at: new Date().toISOString(), from: 'you', text, textZh })
  if (inquiry.status === 'quoted') inquiry.status = 'negotiating'
  inquiry.unread = false
  saveState(state)
  runBuyerSim(state, inquiryId)
}

function runBuyerSim(state, inquiryId) {
  const inquiry = getInquiry(state, inquiryId)
  if (!inquiry) return
  const customer = getCustomer(state, inquiry.customerId)
  const quote = inquiry.quoteId ? getQuote(state, inquiry.quoteId) : null
  let result = decideBuyerReply(customer, inquiry, quote)
  if (!result || result.kind === 'none') {
    if (['in_production', 'docs_ready', 'bl_out', 'closed'].includes(inquiry.status)) {
      result = {
        kind: 'ack_prod',
        status: inquiry.status,
        text: 'Noted. We follow the last shipping update.',
        zh: '知道了。按上一封装运消息来。',
      }
    } else if (inquiry.piId) {
      result = {
        kind: 'ack_pi',
        status: 'pi_issued',
        text: `We have the PI. Accounts will send 30% T/T.`,
        zh: `PI 收到了。财务会打 30% 电汇。`,
      }
    } else if (quote) {
      result = {
        kind: 'accept',
        status: 'won',
        text: `Please send the PI with your last numbers: USD ${Number(quote.sellFob).toFixed(2)} FOB${
          quote.sellCif != null ? ` / USD ${Number(quote.sellCif).toFixed(2)} CIF` : ''
        }.`,
        zh: `请按你最后报的数字出形式发票：FOB ${Number(quote.sellFob).toFixed(2)}${
          quote.sellCif != null ? ` / CIF ${Number(quote.sellCif).toFixed(2)}` : ''
        }。`,
      }
    } else {
      result = {
        kind: 'ack',
        status: inquiry.status,
        text: 'Confirmed. Please send FOB / CIF when ready.',
        zh: '确认。准备好了就发 FOB / CIF。',
      }
    }
  }
  applyBuyerDecision(state, inquiry, result, addFollowup)
  saveState(state)
}

export function spawnInquiry(state) {
  const used = new Set(state.inquiries.map((i) => i.customerId))
  const next = state.customers.find((c) => !used.has(c.id))
  if (!next) return null
  const inquiry = buildInquiry(next)
  state.inquiries.unshift(inquiry)
  addFollowup(state, {
    customerId: next.id,
    inquiryId: inquiry.id,
    day: 0,
    note: `新询盘：${next.name}`,
  })
  saveState(state)
  return inquiry
}

export function markRead(state, inquiryId) {
  const inquiry = getInquiry(state, inquiryId)
  if (!inquiry) return
  inquiry.unread = false
  saveState(state)
}

export function saveNegotiation(state, inquiryId, negotiation) {
  const inquiry = getInquiry(state, inquiryId)
  if (!inquiry) return
  inquiry.negotiation = negotiation
  if (!['won', 'pi_issued', 'in_production', 'docs_ready', 'bl_out', 'closed'].includes(inquiry.status)) {
    inquiry.status = 'negotiating'
  }
  saveState(state)
}

export function createPI(state, quoteId) {
  const quote = getQuote(state, quoteId)
  if (!quote) return null
  const inquiry = getInquiry(state, quote.inquiryId)
  const id = `pi-${Date.now()}`
  const pi = {
    id,
    quoteId,
    inquiryId: quote.inquiryId,
    customerId: inquiry?.customerId,
    productId: inquiry?.productId,
    qty: inquiry?.qty,
    qtyLabel: inquiry?.qtyLabel,
    sellFob: quote.sellFob,
    sellCif: quote.sellCif,
    fobPort: quote.fobPort,
    cifPort: quote.cifPort,
    payment: '30% T/T when order is placed, 70% T/T against copy of B/L',
    leadDays: quote.leadDays,
    packing: quote.packing,
    status: 'awaiting_deposit',
    createdAt: new Date().toISOString(),
  }
  state.pis.push(pi)
  quote.locked = true
  if (inquiry) {
    inquiry.piId = id
    inquiry.status = 'pi_issued'
    const unit = pi.sellCif != null ? Number(pi.sellCif) : Number(pi.sellFob)
    const amount = Number(pi.qty) * unit
    const deposit = Math.round(amount * 0.3 * 100) / 100
    inquiry.messages = inquiry.messages || []
    inquiry.messages.push({
      at: new Date().toISOString(),
      from: 'you',
      text: `PI ${id} issued. Please remit 30% T/T USD ${deposit.toFixed(2)} against this PI.`,
      textZh: `形式发票 ${id} 已出。请按这张票电汇 30% 定金 USD ${deposit.toFixed(2)}。`,
    })
    inquiry.unread = true
    inquiry.messages.push({
      at: new Date().toISOString(),
      from: 'buyer',
      text: `PI received. Accounts will send 30% deposit USD ${deposit.toFixed(2)} today. Please start production after it lands.`,
      textZh: `形式发票收到了。财务今天打 30% 定金 USD ${deposit.toFixed(2)}。钱到了请安排生产。`,
    })
  }
  saveState(state)
  return pi
}

export function addFollowup(state, { customerId, inquiryId, day, note }) {
  const item = {
    id: `fu-${Date.now()}`,
    customerId,
    inquiryId,
    day,
    due: addDaysFrom(clockDate(state), day === 0 ? 0 : day),
    done: false,
    note,
  }
  state.followups.push(item)
  saveState(state)
  return item
}

export function toggleFollowup(state, id) {
  const item = state.followups.find((f) => f.id === id)
  if (!item) return
  item.done = !item.done
  saveState(state)
}

export function updateShipping(state, patch) {
  Object.assign(state.shipping, patch)
  saveState(state)
}

export function updateFactory(state, id, patch) {
  const factory = getFactory(state, id)
  if (!factory) return
  Object.assign(factory, patch)
  saveState(state)
}

export function updateCustomerNotes(state, id, notes) {
  const customer = getCustomer(state, id)
  if (!customer) return
  customer.notes = notes
  saveState(state)
}
