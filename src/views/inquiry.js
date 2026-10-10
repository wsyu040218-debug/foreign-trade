import {
  addFollowup,
  addDays,
  addNegotiation,
  customerById,
  factoryById,
  latestQuote,
  productOf,
  saveInquiry,
  todayISO,
  uid,
  upsertQuote,
} from '../store.js'
import { marginPct, quoteCosts, validateSellPrice } from '../calc.js'
import { REPLY_TEMPLATES } from '../templates.js'
import { esc, money, statusLabel, tagHtml } from '../dom.js'

export function renderInquiry(state, ui) {
  const list = state.inquiries
  const current = list.find((i) => i.id === ui.inquiryId) || list[0]
  if (!current) return `<p>没有询盘。</p>`

  const customer = customerById(state, current.customerId)
  const product = productOf(state)
  const quote = latestQuote(state, current.id)
  const factory = current.factoryId ? factoryById(state, current.factoryId) : null
  const cost = factory
    ? quoteCosts(factory, product, state.costs, { qty: current.qty })
    : null
  const negs = state.negotiations.filter((n) => n.inquiryId === current.id)
  const defaultSell = current.id === 'inq-bargain' ? 5.95 : 6.35
  const defaultFobSell = 6.1

  return `
    <header class="page-head">
      <div>
        <p class="eyebrow-ink">询盘收件箱</p>
        <h2>来信 · 选厂 · 报价 · 回信</h2>
      </div>
    </header>
    <div class="split">
      <aside class="list-pane">
        ${list
          .map(
            (i) => `
          <button type="button" class="list-item${i.id === current.id ? ' is-active' : ''}" data-go="inquiry" data-id="${i.id}">
            <strong>${esc(i.subject)}</strong>
            <span>${statusLabel(i.status)} · ${esc(i.qtyNote)}</span>
          </button>`,
          )
          .join('')}
      </aside>
      <div class="detail-pane">
        <section class="card">
          <p class="card-kicker">${esc(customer?.name)} · ${esc(current.from)}</p>
          <h3>${esc(current.subject)}</h3>
          <p class="tags">${tagHtml(current.tags)} <span class="tag">${statusLabel(current.status)}</span></p>
          <pre class="letter">${esc(current.body)}</pre>
        </section>

        <section class="card">
          <h3>1. 选工厂</h3>
          <div class="factory-grid">
            ${state.factories
              .map((f) => {
                const c = quoteCosts(f, product, state.costs, { qty: current.qty })
                const on = current.factoryId === f.id
                return `<button type="button" class="factory${on ? ' is-on' : ''}${f.recommended ? ' is-rec' : ''}" data-pick-factory="${f.id}">
                  <strong>${esc(f.name)}</strong>
                  <span>EXW ${money(f.exw)} · 交期 ${f.leadDaysMin}–${f.leadDaysMax} 天</span>
                  <span>FOB ${money(c.fob)} → CIF 成本 ${money(c.cif)}${c.usedLcl ? '（LCL）' : ''}</span>
                  <span class="muted">${esc(f.notes)}</span>
                  ${f.recommended ? '<em>推荐德国食品接触单</em>' : ''}
                </button>`
              })
              .join('')}
          </div>
        </section>

        ${
          cost
            ? `<section class="card">
          <h3>2. 系统成本（工厂已选）</h3>
          <dl class="kv">
            <div><dt>EXW → FOB Ningbo</dt><dd>${money(cost.fob)}</dd></div>
            <div><dt>海运分摊</dt><dd>${money(cost.oceanShare)}${cost.usedLcl ? ' · LCL' : ' · 整柜'}</dd></div>
            <div><dt>CIF Hamburg 成本</dt><dd>${money(cost.cif)}</dd></div>
            <div><dt>数量</dt><dd>${current.qty.toLocaleString()} 套 ${cost.fullContainer ? '（够一柜）' : '（不够一柜）'}</dd></div>
          </dl>
          ${!cost.fullContainer ? `<p class="warn">不够一柜：禁止沿用整柜 CIF。请报 FOB，或勾选 LCL 重算海运后再报 CIF。</p>` : ''}
          <form class="quote-form" data-quote-form>
            <label>条款
              <select name="incoterm">
                <option value="CIF" ${!cost.fullContainer ? '' : 'selected'}>CIF Hamburg</option>
                <option value="FOB" ${!cost.fullContainer ? 'selected' : ''}>FOB Ningbo</option>
              </select>
            </label>
            <label>对外单价 USD
              <input name="sell" type="number" step="0.01" value="${cost.fullContainer ? defaultSell : defaultFobSell}" />
            </label>
            <label>装运港
              <input name="portFrom" value="${esc(state.costs.portFrom)}" />
            </label>
            <label>目的港
              <input name="portTo" value="${esc(state.costs.portTo)}" />
            </label>
            <label class="check">
              <input name="usedLcl" type="checkbox" ${cost.usedLcl ? 'checked' : ''} /> 勾选后按 LCL 重算海运再报 CIF
            </label>
            <button type="submit" class="btn primary">生成 / 更新报价</button>
          </form>
          <p class="muted" data-quote-hint></p>
        </section>`
            : `<section class="card"><p class="muted">先选工厂，系统才会给出 FOB / CIF 成本。</p></section>`
        }

        ${
          quote
            ? `<section class="card">
          <h3>当前报价</h3>
          <p><strong>${quote.incoterm} ${esc(quote.portTo || quote.portFrom)}</strong> · ${money(quote.sell)} / 套
            · 毛利 ${marginPct(quote.sell, quote.incoterm === 'CIF' ? quote.cifCost : quote.fobCost)}%
            ${quote.locked ? '· 已锁定' : ''}</p>
          <form class="nego-form" data-nego-form>
            <label>议价说明
              <textarea name="note" rows="3">拒 DDP：无 EORI / 邮编不报门口价。样品免货费、运费到付。交期坚持 30 天。CIF 可靠到 5.95（贴纸盒 + 整柜）。</textarea>
            </label>
            <label>议价后单价 USD
              <input name="offer" type="number" step="0.01" value="${current.id === 'inq-bargain' ? '5.95' : quote.sell}" />
            </label>
            <label class="check"><input name="refuseDdp" type="checkbox" checked /> 明确拒绝 DDP</label>
            <button type="submit" class="btn">保存议价</button>
          </form>
          ${
            negs.length
              ? `<ul class="mini">${negs
                  .map(
                    (n) =>
                      `<li>${esc(n.createdAt)} · ${money(n.offerPrice)} · ${n.refuseDdp ? '拒 DDP' : ''} — ${esc(n.note)}</li>`,
                  )
                  .join('')}</ul>`
              : ''
          }
        </section>`
            : ''
        }

        <section class="card">
          <h3>回信（插入模板后可改）</h3>
          <div class="tpl-row">
            ${REPLY_TEMPLATES.map((t) => `<button type="button" class="btn ghost" data-tpl="${t.id}">${esc(t.label)}</button>`).join('')}
          </div>
          <textarea data-reply rows="12">${esc(current.replyDraft)}</textarea>
          <button type="button" class="btn" data-save-reply>保存回信到本询盘</button>
        </section>

        <section class="card">
          <h3>跟进</h3>
          <div class="tpl-row">
            <button type="button" class="btn" data-follow="0">设 D0（今天）</button>
            <button type="button" class="btn primary" data-follow="3">设 D3</button>
            <button type="button" class="btn" data-follow="7">设 D7</button>
          </div>
        </section>
      </div>
    </div>
  `
}

export function bindInquiry(root, state, ui, refresh) {
  const current = state.inquiries.find((i) => i.id === ui.inquiryId) || state.inquiries[0]
  if (!current) return

  root.querySelectorAll('[data-pick-factory]').forEach((el) => {
    el.addEventListener('click', () => {
      current.factoryId = el.getAttribute('data-pick-factory')
      saveInquiry(state, current)
      refresh()
    })
  })

  root.querySelector('[data-quote-form]')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const factory = factoryById(state, current.factoryId)
    const product = productOf(state)
    const usedLcl = fd.get('usedLcl') === 'on'
    const costs = quoteCosts(factory, product, state.costs, {
      qty: current.qty,
      forceLcl: usedLcl,
    })
    const incoterm = String(fd.get('incoterm'))
    const sell = Number(fd.get('sell'))
    const portFrom = String(fd.get('portFrom') || '').trim()
    const portTo = String(fd.get('portTo') || '').trim()
    const errors = validateSellPrice({
      incoterm,
      sell,
      fob: costs.fob,
      cif: costs.cif,
      portFrom,
      portTo,
      qty: current.qty,
      product,
      usedLcl: costs.usedLcl,
    })
    const hint = root.querySelector('[data-quote-hint]')
    if (errors.length) {
      hint.textContent = errors.join('；')
      hint.classList.add('warn')
      return
    }
    const existing = latestQuote(state, current.id)
    const quote = {
      id: existing && !existing.locked ? existing.id : uid('q'),
      inquiryId: current.id,
      factoryId: factory.id,
      incoterm,
      sell,
      qty: current.qty,
      fobCost: costs.fob,
      cifCost: costs.cif,
      oceanShare: costs.oceanShare,
      usedLcl: costs.usedLcl,
      fullContainer: costs.fullContainer,
      portFrom,
      portTo,
      locked: false,
      createdAt: todayISO(),
    }
    upsertQuote(state, quote)
    hint.textContent = `已保存 ${incoterm} ${sell.toFixed(2)}，毛利 ${marginPct(sell, incoterm === 'CIF' ? costs.cif : costs.fob)}%。可到「报价 / PI」预览英文条款。`
    hint.classList.remove('warn')
    refresh()
  })

  root.querySelector('[data-nego-form]')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const quote = latestQuote(state, current.id)
    if (!quote) return
    const fd = new FormData(e.target)
    const offer = Number(fd.get('offer'))
    addNegotiation(state, {
      id: uid('neg'),
      inquiryId: current.id,
      quoteId: quote.id,
      note: String(fd.get('note') || ''),
      offerPrice: offer,
      refuseDdp: fd.get('refuseDdp') === 'on',
      createdAt: todayISO(),
    })
    if (!quote.locked && offer > 0) {
      quote.sell = offer
      upsertQuote(state, quote)
    }
    refresh()
  })

  root.querySelectorAll('[data-tpl]').forEach((el) => {
    el.addEventListener('click', () => {
      const tpl = REPLY_TEMPLATES.find((t) => t.id === el.getAttribute('data-tpl'))
      const box = root.querySelector('[data-reply]')
      if (tpl && box) box.value = tpl.body.replaceAll('[Name]', current.from.split(' ')[0])
    })
  })

  root.querySelector('[data-save-reply]')?.addEventListener('click', () => {
    current.replyDraft = root.querySelector('[data-reply]')?.value || ''
    saveInquiry(state, current)
    refresh()
  })

  root.querySelectorAll('[data-follow]').forEach((el) => {
    el.addEventListener('click', () => {
      const n = Number(el.getAttribute('data-follow'))
      const dayType = n === 0 ? 'D0' : n === 3 ? 'D3' : 'D7'
      addFollowup(state, {
        id: uid('fu'),
        customerId: current.customerId,
        inquiryId: current.id,
        dayType,
        dueDate: addDays(todayISO(), n),
        note: `${current.subject} · ${dayType} 跟进`,
        done: false,
      })
      refresh()
    })
  })
}
