import { customerById } from '../store.js'
import { esc, statusLabel, tagHtml } from '../dom.js'

export function renderToday(state, { go }) {
  const open = state.inquiries.filter((i) => i.status === 'open')
  const due = state.followups.filter((f) => !f.done)
  const bargain = state.inquiries.find((i) => i.id === 'inq-bargain')

  return `
    <header class="page-head">
      <div>
        <p class="eyebrow-ink">今日</p>
        <h2>打开就能处理德国厨具询盘</h2>
        <p class="lede-ink">核心练手：砍价询盘 → 选工厂 A → 报 CIF、拒 DDP → 议价 → 出 PI → 设 D3 跟进。</p>
      </div>
    </header>

    ${
      bargain && bargain.status !== 'won'
        ? `<section class="card highlight">
            <p class="card-kicker">建议从这里练</p>
            <h3>${esc(bargain.subject)}</h3>
            <p class="muted">${esc(bargain.qtyNote)} · ${statusLabel(bargain.status)}</p>
            <button type="button" class="btn primary" data-go="inquiry" data-id="${bargain.id}">处理砍价询盘</button>
          </section>`
        : `<section class="card ok">
            <p class="card-kicker">核心路径</p>
            <h3>砍价询盘已出 PI</h3>
            <p class="muted">可到「报价 / PI」查看英文条款，或重置数据再练一遍。</p>
          </section>`
    }

    <div class="grid-2">
      <section class="card">
        <h3>未报价询盘 <span class="count">${open.length}</span></h3>
        ${
          open.length
            ? `<ul class="rows">${open
                .map((i) => {
                  const c = customerById(state, i.customerId)
                  return `<li>
                    <button type="button" class="row-btn" data-go="inquiry" data-id="${i.id}">
                      <strong>${esc(i.subject)}</strong>
                      <span>${esc(c?.name)} · ${esc(i.qtyNote)}</span>
                      <span class="tags">${tagHtml(i.tags)}</span>
                    </button>
                  </li>`
                })
                .join('')}</ul>`
            : `<p class="muted">没有未报价询盘。</p>`
        }
      </section>
      <section class="card">
        <h3>待跟进 <span class="count">${due.length}</span></h3>
        ${
          due.length
            ? `<ul class="rows">${due
                .map((f) => {
                  const c = customerById(state, f.customerId)
                  return `<li class="follow-row">
                    <div>
                      <strong>${esc(f.dayType)}</strong> · ${esc(f.dueDate)}
                      <p class="muted">${esc(c?.name)} — ${esc(f.note)}</p>
                    </div>
                    <button type="button" class="btn ghost" data-done-follow="${f.id}">完成</button>
                  </li>`
                })
                .join('')}</ul>`
            : `<p class="muted">还没有跟进。出 PI 后设 D0 / D3 / D7。</p>`
        }
      </section>
    </div>
  `
}
