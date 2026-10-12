import { escapeHtml, money, statusBadge, statusLabel } from '../dom.js'
import { getCustomer, getInquiry, getProduct, markDepositReceived, savePiChecks } from '../store.js'

export function renderQuotes(state) {
  return `
    <header class="page-head">
      <div>
        <h2>看价和形式发票</h2>
        <p class="sub">这里看总价和 30% 定金。对方按这张票打钱。钱到了回到来信点「定金已到，安排生产」，或下面直接点。</p>
      </div>
    </header>
    ${
      state.quotes.length === 0
        ? '<p class="empty">还没有报价。先去询盘问清再报价。</p>'
        : `<section class="stack">${state.quotes.map((q) => quoteCard(state, q)).join('')}</section>`
    }
    ${
      state.pis.length
        ? `<section class="stack"><h3>PI</h3>${state.pis.map((p) => piCard(state, p)).join('')}</section>`
        : ''
    }
  `
}

function quoteCard(state, q) {
  const inquiry = getInquiry(state, q.inquiryId)
  const customer = getCustomer(state, inquiry?.customerId)
  const product = getProduct(state, inquiry?.productId)
  const text = `QUOTATION ${product?.sku}
Buyer: ${customer?.name}
Qty: ${inquiry?.qtyLabel}
USD ${Number(q.sellFob).toFixed(2)} / set FOB ${q.fobPort}
${q.sellCif != null ? `USD ${Number(q.sellCif).toFixed(2)} / set CIF ${q.cifPort}` : 'CIF not offered (not a full container)'}
Payment: 30% T/T against PI, 70% T/T against copy of B/L
Lead time: ${q.leadDays} days after deposit and artwork
Validity: ${q.validityDays} days
Packing: ${q.packing}
Not DDP.`

  return `<article class="panel">
    <div class="panel-head">
      <div>
        <h3>报价</h3>
        <p class="sub">${escapeHtml(customer?.name)} · ${escapeHtml(inquiry?.qtyLabel)}</p>
      </div>
      ${q.locked ? statusBadge('pi_issued') : statusBadge('quoted')}
    </div>
    <p class="price-pair"><span>${money(q.sellFob)} FOB ${escapeHtml(q.fobPort)}</span>${q.sellCif != null ? `<span>${money(q.sellCif)} CIF ${escapeHtml(q.cifPort)}</span>` : ''}</p>
    <pre class="letter" translate="no">${escapeHtml(text)}</pre>
    <div class="actions">
      <button type="button" class="ghost" data-copy>复制条款</button>
      ${inquiry ? `<a class="ghost" href="#/inquiries/${inquiry.id}">回询盘</a>` : ''}
    </div>
  </article>`
}

function piCard(state, p) {
  const customer = getCustomer(state, p.customerId)
  const product = getProduct(state, p.productId)
  const inquiry = getInquiry(state, p.inquiryId)
  const unit = p.sellCif != null ? Number(p.sellCif) : Number(p.sellFob)
  const amount = Number(p.qty) * unit
  const deposit = Math.round(amount * 0.3 * 100) / 100
  const balance = Math.round((amount - deposit) * 100) / 100
  const term = p.sellCif != null ? `CIF ${p.cifPort}` : `FOB ${p.fobPort}`
  const checks = p.checks || {}
  const text = `PROFORMA INVOICE ${p.id}
Seller: Your trading desk
Buyer: ${customer?.name}
Item: ${product?.sku} ${product?.name}
Qty: ${p.qtyLabel} (${p.qty} sets)
Unit: ${money(unit)} ${term}
Amount: USD ${amount.toFixed(2)}
Deposit 30%: USD ${deposit.toFixed(2)} by T/T against this PI
Balance 70%: USD ${balance.toFixed(2)} against copy of B/L
Lead time: ${p.leadDays} days after deposit and artwork confirmed
Packing: ${p.packing}
Documents: CI, PL, B/L, food-contact report copy
Not DDP.`

  const items = [
    ['buyer', `买方是 ${customer?.name}`],
    ['sku', `货号 ${product?.sku}，304 不是 201`],
    ['qty', `数量 ${p.qtyLabel} 与单价同一口径`],
    ['price', `单价 ${money(unit)} ${term}`],
    ['total', `总价 USD ${amount.toFixed(2)} = 单价 × ${p.qty}`],
    ['deposit', `定金 30% = USD ${deposit.toFixed(2)}`],
    ['port', `港口 ${term}，和询盘 ${inquiry?.destPort || ''} 一致`],
    ['lead', `交期从定金+彩盒确认起算 ${p.leadDays} 天`],
    ['pack', `包装与回信一致`],
    ['ddp', `没有写成 DDP`],
  ]

  return `<article class="panel">
    <div class="panel-head">
      <div>
        <h3>形式发票</h3>
        <p class="sub">${escapeHtml(customer?.name)}</p>
      </div>
      ${statusBadge(p.status)}
    </div>
    <div class="metrics">
      <div><span>总价</span><b>USD ${amount.toFixed(2)}</b></div>
      <div><span>定金 30%</span><b>USD ${deposit.toFixed(2)}</b></div>
      <div><span>尾款 70%</span><b>USD ${balance.toFixed(2)}</b></div>
    </div>
    <div class="pi-paper" translate="no">
      <header class="pi-head">
        <div>
          <strong>PROFORMA INVOICE</strong>
          <p>Seller: Your trading desk, Ningbo, China</p>
        </div>
        <div class="pi-meta">
          <p>No. ${escapeHtml(p.id)}</p>
          <p>Date: ${escapeHtml((p.createdAt || '').slice(0, 10))}</p>
        </div>
      </header>
      <table class="pi-parties">
        <tr>
          <th>Seller</th>
          <th>Buyer</th>
        </tr>
        <tr>
          <td>Your trading desk<br />Ningbo, China<br />FOB port: ${escapeHtml(p.fobPort)}</td>
          <td>${escapeHtml(customer?.name || '')}<br />${escapeHtml(inquiry?.destPort || '')}</td>
        </tr>
      </table>
      <table class="pi-lines">
        <tr><th>Item</th><th>Qty</th><th>Unit</th><th>Amount</th></tr>
        <tr>
          <td>${escapeHtml(product?.sku)} ${escapeHtml(product?.name)}</td>
          <td>${escapeHtml(String(p.qty))} sets<br />${escapeHtml(p.qtyLabel)}</td>
          <td>${money(unit)} ${escapeHtml(term)}</td>
          <td>USD ${amount.toFixed(2)}</td>
        </tr>
      </table>
      <p>Deposit 30% T/T: USD ${deposit.toFixed(2)} against this PI<br />Balance 70% T/T: USD ${balance.toFixed(2)} against copy of B/L<br />Lead time: ${p.leadDays} days after deposit and artwork confirmed<br />Packing: ${escapeHtml(p.packing)}<br />Documents: CI, PL, B/L, food-contact report copy<br />Not DDP.</p>
      <div class="pi-sign">
        <div>Seller signature / stamp</div>
        <div>Buyer confirmation</div>
      </div>
    </div>
    <pre class="letter hidden-copy" translate="no">${escapeHtml(text)}</pre>
    <form class="form nego-form" data-pi-checks="${p.id}">
      <p class="hint">复制前自己对票。系统只拦 CIF/FOB，拦不住写错港口或数量。</p>
      <div class="check-grid">
      ${items
        .map(
          ([key, label]) =>
            `<label class="check"><input type="checkbox" name="${key}" ${checks[key] ? 'checked' : ''} /> ${escapeHtml(label)}</label>`,
        )
        .join('')}
      </div>
      <div class="actions">
        <button type="submit" class="ghost">保存核对</button>
        <button type="button" class="ghost" data-copy>复制 PI</button>
        ${
          p.status === 'awaiting_deposit'
            ? `<button type="button" class="btn" data-deposit="${p.id}">定金已到账</button>`
            : `<a class="btn" href="#/ship">去排产：彩盒、单据、尾款</a>`
        }
      </div>
    </form>
  </article>`
}

export function bindQuotes(state, renderApp) {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const pre = btn.closest('.panel')?.querySelector('pre')
      try {
        await navigator.clipboard.writeText(pre.innerText)
        btn.textContent = '已复制'
      } catch {
        btn.textContent = '复制失败'
      }
    })
  })
  document.querySelectorAll('[data-pi-checks]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const id = form.getAttribute('data-pi-checks')
      const fd = new FormData(form)
      const checks = {}
      for (const [k] of fd.entries()) checks[k] = true
      savePiChecks(state, id, checks)
      renderApp()
    })
  })
  document.querySelectorAll('[data-deposit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      markDepositReceived(state, btn.getAttribute('data-deposit'))
      location.hash = '#/ship'
      renderApp()
    })
  })
}
