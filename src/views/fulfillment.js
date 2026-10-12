import { escapeHtml, money, statusBadge } from '../dom.js'
import { scoreDeal } from '../score.js'
import { addDaysISO } from '../seed.js'
import {
  clockDate,
  confirmArtwork,
  getCustomer,
  getInquiry,
  getProduct,
  getQuote,
  issueBL,
  issueDocs,
  markBalanceReceived,
} from '../store.js'

export function renderFulfillment(state) {
  const list = state.shipments || []
  return `
    <header class="page-head">
      <div>
        <h2>排产</h2>
        <p class="sub">交期从定金 + 彩盒确认起算。先确认彩盒，再按 PI 出 CI / PL，提单副本后收 70% 关档。练习日 ${escapeHtml(clockDate(state))}。</p>
      </div>
    </header>
    ${
      list.length === 0
        ? '<p class="empty">还没有开工。先在来信里出形式发票，等买家打定金，再点「定金已到，安排生产」。</p>'
        : `<section class="stack">${list.map((s) => shipCard(state, s)).join('')}</section>`
    }
  `
}

function amounts(p) {
  const unit = p.sellCif != null ? Number(p.sellCif) : Number(p.sellFob)
  const amount = Number(p.qty) * unit
  const deposit = Math.round(amount * 0.3 * 100) / 100
  const balance = Math.round((amount - deposit) * 100) / 100
  const term = p.sellCif != null ? `CIF ${p.cifPort}` : `FOB ${p.fobPort}`
  return { unit, amount, deposit, balance, term }
}

function shipCard(state, s) {
  const pi = state.pis.find((p) => p.id === s.piId)
  const inquiry = getInquiry(state, s.inquiryId)
  const customer = getCustomer(state, s.customerId)
  const product = getProduct(state, inquiry?.productId)
  const quote = inquiry?.quoteId ? getQuote(state, inquiry.quoteId) : null
  if (!pi || !inquiry) return ''
  const a = amounts(pi)
  const cartons = Math.ceil(Number(pi.qty) / (product?.setsPerCarton || 12))
  const ready = s.readyDate || addDaysISO(pi.leadDays || 30)
  const score = scoreDeal(inquiry, quote)

  return `<article class="panel">
    <div class="panel-head">
      <div>
        <h3>${escapeHtml(customer?.name || '')}</h3>
        <p class="sub">${escapeHtml(pi.qtyLabel)} · ${escapeHtml(product?.sku || '')} · ${s.artworkOn ? `交期约至 ${escapeHtml(ready)}` : '彩盒未确认，交期未起算'}</p>
      </div>
      ${statusBadge(s.status)}
    </div>
    <div class="metrics">
      <div><span>总价</span><b>USD ${a.amount.toFixed(2)}</b></div>
      <div><span>已收定金 30%</span><b>USD ${a.deposit.toFixed(2)}</b></div>
      <div><span>待收尾款 70%</span><b>USD ${a.balance.toFixed(2)}</b></div>
    </div>
    <p class="field-help">货号 ${escapeHtml(product?.sku || '')} · 约 ${cartons.toLocaleString()} 箱 · ${escapeHtml(a.term)}</p>

    <ol class="cal">
      <li class="${s.depositOn ? 'is-on' : ''}">定金日 ${escapeHtml(s.depositOn || '—')}</li>
      <li class="${s.artworkOn ? 'is-on' : ''}">彩盒确认 ${escapeHtml(s.artworkOn || '未确认')}</li>
      <li class="${s.readyDate ? 'is-on' : ''}">交期 ${escapeHtml(s.readyDate || `定金+彩盒后再加 ${pi.leadDays} 天`)}</li>
    </ol>

    ${
      s.status === 'in_production' && !s.artworkOn
        ? `<div class="actions">
            <button type="button" class="btn" data-artwork="${s.id}">确认彩盒，开始起算交期</button>
            <a class="ghost" href="#/inquiries/${inquiry.id}">回询盘</a>
          </div>
          <p class="hint">交期从定金和彩盒都确认的那天起算，不是只从定金日。</p>`
        : ''
    }

    ${
      s.status === 'in_production' && s.artworkOn
        ? `<div class="actions">
            <button type="button" class="btn" data-issue-docs="${s.id}">出具商业发票和装箱单</button>
            <a class="ghost" href="#/inquiries/${inquiry.id}">回询盘</a>
          </div>
          <p class="hint">数量和港口从 PI 带出。点上面按钮出 CI / PL。</p>`
        : ''
    }

    ${
      s.ci
        ? `<h3>商业发票 CI</h3><pre class="letter" translate="no">${escapeHtml(s.ci)}</pre>`
        : ''
    }
    ${
      s.pl
        ? `<h3>装箱单 PL</h3><pre class="letter" translate="no">${escapeHtml(s.pl)}</pre>`
        : ''
    }

    ${
      s.status === 'docs_ready'
        ? `<div class="actions">
            <button type="button" class="ghost" data-copy>复制单据</button>
            <button type="button" class="btn" data-issue-bl="${s.id}">提单副本已出</button>
          </div>
          <p class="hint">货装上船后，把提单副本给对方，对方才付 70%。</p>`
        : ''
    }

    ${
      s.status === 'bl_out'
        ? `<p class="warn">提单副本已通知买家。等对方付尾款 USD ${a.balance.toFixed(2)}。</p>
          <div class="actions">
            <button type="button" class="btn" data-balance="${s.id}">尾款已到账</button>
            <a class="ghost" href="#/inquiries/${inquiry.id}">回询盘</a>
          </div>`
        : ''
    }

    ${
      s.status === 'closed'
        ? `<p class="hint">已收齐 / 可关档。去看下面复盘对错表，再开下一封询盘。</p>`
        : ''
    }

    <div class="score">
      <h3>这票复盘 ${score.passed}/${score.total}</h3>
      <ul class="rows compact">
        ${score.items
          .map(
            (it) =>
              `<li><span class="badge ${it.ok ? 'badge-deposit_in' : 'badge-new'}">${it.ok ? '过' : '缺'}</span><div><strong>${escapeHtml(it.title)}</strong><p class="muted">${escapeHtml(it.why)}</p></div></li>`,
          )
          .join('')}
      </ul>
    </div>
  </article>`
}

export function bindFulfillment(state, renderApp) {
  document.querySelectorAll('[data-artwork]').forEach((btn) => {
    btn.addEventListener('click', () => {
      confirmArtwork(state, btn.getAttribute('data-artwork'))
      renderApp()
    })
  })
  document.querySelectorAll('[data-issue-docs]').forEach((btn) => {
    btn.addEventListener('click', () => {
      issueDocs(state, btn.getAttribute('data-issue-docs'))
      renderApp()
    })
  })
  document.querySelectorAll('[data-issue-bl]').forEach((btn) => {
    btn.addEventListener('click', () => {
      issueBL(state, btn.getAttribute('data-issue-bl'))
      renderApp()
    })
  })
  document.querySelectorAll('[data-balance]').forEach((btn) => {
    btn.addEventListener('click', () => {
      markBalanceReceived(state, btn.getAttribute('data-balance'))
      renderApp()
    })
  })
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const texts = [...btn.closest('.panel').querySelectorAll('pre')].map((p) => p.innerText)
      try {
        await navigator.clipboard.writeText(texts.join('\n\n'))
        btn.textContent = '已复制'
      } catch {
        btn.textContent = '复制失败'
      }
    })
  })
}
