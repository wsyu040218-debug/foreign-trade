import { escapeHtml, inquiryBadge } from '../dom.js'
import { getCustomer, getInquiry, spawnInquiry, toggleFollowup } from '../store.js'

export function renderDashboard(state) {
  const open = state.inquiries.filter((i) =>
    ['new', 'clarifying', 'quoted', 'negotiating', 'won', 'pi_issued', 'in_production', 'docs_ready', 'bl_out'].includes(
      i.status,
    ),
  )
  const unread = state.inquiries.filter((i) => i.unread).length
  const leftover = state.customers.filter((c) => !state.inquiries.some((i) => i.customerId === c.id)).length
  const follow = state.followups.filter((f) => !f.done)
  const waitingPi = state.pis.filter((p) => p.status === 'awaiting_deposit').length

  return `
    <header class="page-head">
      <div>
        <h2>今日待办</h2>
        <p class="sub">问清 → 报价 → 出 PI → 30% 定金 → 排产单据 → 70% 尾款关档。</p>
      </div>
      <button type="button" class="btn" data-spawn ${leftover ? '' : 'disabled'}>来一封新询盘</button>
    </header>
    <section class="stats">
      <article class="stat"><b>${open.length}</b><span>未了结询盘</span></article>
      <article class="stat"><b>${unread}</b><span>未读买家回复</span></article>
      <article class="stat"><b>${follow.length}</b><span>待跟进</span></article>
      <article class="stat"><b>${waitingPi}</b><span>等定金 / 履约</span></article>
    </section>
    <section class="grid-2">
      <article class="panel">
        <h3>未了结询盘</h3>
        ${
          open.length
            ? `<ul class="rows">${open
                .map((i) => {
                  const c = getCustomer(state, i.customerId)
                  return `<li><a href="#/inquiries/${i.id}"><strong>${i.unread ? '<span class="dot"></span>' : ''}${escapeHtml(i.subject)}</strong><span>${escapeHtml(c?.name)}${i.ghosted ? ' · 已读未回' : ''}</span></a>${inquiryBadge(i)}</li>`
                })
                .join('')}</ul>`
            : '<p class="empty">没有未处理询盘。可点「来一封新询盘」或重置数据。</p>'
        }
      </article>
      <article class="panel">
        <h3>待跟进</h3>
        ${
          follow.length
            ? `<ul class="rows">${follow
                .map((f) => {
                  const c = getCustomer(state, f.customerId)
                  const inq = getInquiry(state, f.inquiryId)
                  return `<li>
                    <label class="check">
                      <input type="checkbox" data-toggle-follow="${f.id}" />
                      <span><strong>D${f.day}</strong> ${escapeHtml(c?.name)} · ${escapeHtml(f.due)}<br />${escapeHtml(f.note || inq?.subject)}</span>
                    </label>
                    ${inq ? `<a class="mini" href="#/inquiries/${inq.id}">打开询盘</a>` : ''}
                  </li>`
                })
                .join('')}</ul>`
            : '<p class="empty">没有待跟进。</p>'
        }
      </article>
    </section>
    <article class="panel callout">
      <h3>建议练习路径</h3>
      <ol>
        <li>打开询盘，在对话里问数量、港口、认证、包装、付款，等对方回再报价。</li>
        <li>选工厂 A，按柜型报 FOB / CIF；不够一柜不要套整柜 CIF。</li>
        <li>谈妥后出 PI，记 30% 定金，再去「履约」出 CI/PL、提单副本，记 70% 尾款。</li>
        <li>看复盘打分：是否先问清、是否拒 DDP、小单是否乱报 CIF。</li>
      </ol>
    </article>
  `
}

export function bindDashboard(state, renderApp) {
  document.querySelectorAll('[data-toggle-follow]').forEach((el) => {
    el.addEventListener('change', () => {
      toggleFollowup(state, el.getAttribute('data-toggle-follow'))
      renderApp()
    })
  })
  document.querySelector('[data-spawn]')?.addEventListener('click', () => {
    const inquiry = spawnInquiry(state)
    if (!inquiry) return
    location.hash = `#/inquiries/${inquiry.id}`
    renderApp()
  })
}
