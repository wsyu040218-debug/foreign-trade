import { PERSONA_LABEL } from '../seed.js'
import { escapeHtml } from '../dom.js'
import { addFollowup, updateCustomerNotes } from '../store.js'

export function renderCustomers(state) {
  return `
    <header class="page-head">
      <div>
        <h2>客户花名册</h2>
        <p class="sub">${state.customers.length} 个模拟买家。性格不同，回信规则不同。</p>
      </div>
    </header>
    <article class="panel">
      <table class="plain roster">
        <thead>
          <tr>
            <th>公司</th>
            <th>国家 / 港口</th>
            <th>性格</th>
            <th>渠道</th>
            <th>询盘</th>
          </tr>
        </thead>
        <tbody>
          ${state.customers
            .map((c) => {
              const related = state.inquiries.filter((i) => i.customerId === c.id)
              return `<tr>
                <td><strong>${escapeHtml(c.name)}</strong><br /><span class="muted">${escapeHtml(c.city)}</span></td>
                <td>${escapeHtml(c.country)} · ${escapeHtml(c.port)}</td>
                <td>${escapeHtml(PERSONA_LABEL[c.persona] || c.persona)}</td>
                <td>${escapeHtml(c.channel)}</td>
                <td>${
                  related.length
                    ? related.map((i) => `<a href="#/inquiries/${i.id}">${escapeHtml(i.subject)}</a>`).join('<br />')
                    : '<span class="muted">尚未来信</span>'
                }</td>
              </tr>`
            })
            .join('')}
        </tbody>
      </table>
    </article>
    <section class="stack">
      ${state.customers
        .map((c) => {
          return `<article class="panel compact-notes">
            <h3>${escapeHtml(c.name)}</h3>
            <p class="sub">${escapeHtml(c.notes || '')}</p>
            <label>客户笔记
              <textarea data-notes="${c.id}" rows="2">${escapeHtml(c.notes)}</textarea>
            </label>
            <button type="button" class="ghost" data-save-notes="${c.id}">保存笔记</button>
            <button type="button" class="ghost" data-fu="${c.id}">设 D7 跟进</button>
          </article>`
        })
        .join('')}
    </section>
  `
}

export function bindCustomers(state, renderApp) {
  document.querySelectorAll('[data-save-notes]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-save-notes')
      const notes = document.querySelector(`[data-notes="${id}"]`).value
      updateCustomerNotes(state, id, notes)
      renderApp()
    })
  })
  document.querySelectorAll('[data-fu]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-fu')
      const inq = state.inquiries.find((i) => i.customerId === id)
      addFollowup(state, {
        customerId: id,
        inquiryId: inq?.id,
        day: 7,
        note: '开发/报价跟进 D7',
      })
      location.hash = '#/today'
    })
  })
}
