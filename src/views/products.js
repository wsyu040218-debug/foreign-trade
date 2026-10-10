import { costBreakdown, setsPer40hq } from '../calc.js'
import { escapeHtml, money } from '../dom.js'
import { updateFactory, updateShipping } from '../store.js'

export function renderProducts(state) {
  const product = state.products[0]
  const cap = setsPer40hq(product.cbmPerSet, state.shipping.usableCbm)
  return `
    <header class="page-head">
      <div>
        <h2>产品与成本</h2>
        <p class="sub">改 EXW / 海运后，未锁定的报价在询盘页重算。已出 PI 的报价不会被改价覆盖。</p>
      </div>
    </header>
    <article class="panel">
      <h3>${escapeHtml(product.sku)} ${escapeHtml(product.name)}</h3>
      <p>${escapeHtml(product.material)}</p>
      <p>${escapeHtml(product.packing)}</p>
      <p>MOQ ${product.moq} · ${escapeHtml(product.cert)} · 约 ${cap.toLocaleString()} 套 / 40HQ</p>
    </article>
    <article class="panel">
      <h3>运费参数</h3>
      <form class="form inline" data-ship>
        <label>40HQ 海运 USD
          <input name="oceanPer40hq" type="number" step="1" value="${state.shipping.oceanPer40hq}" />
        </label>
        <label>保险费率
          <input name="insuranceRate" type="number" step="0.0001" value="${state.shipping.insuranceRate}" />
        </label>
        <button class="btn" type="submit">保存运费</button>
      </form>
    </article>
    <section class="grid-2">
      ${state.factories
        .map((f) => {
          const cost = costBreakdown({
            exw: f.exw,
            inlandPerSet: f.inlandPerSet,
            docsPerSet: f.docsPerSet,
            oceanPer40hq: state.shipping.oceanPer40hq,
            insuranceRate: state.shipping.insuranceRate,
            qty: cap,
            cbmPerSet: product.cbmPerSet,
            usableCbm: state.shipping.usableCbm,
            forceFullContainer: true,
          })
          return `<article class="panel">
            <h3>${escapeHtml(f.name)} ${f.recommended ? '· 推荐' : ''}</h3>
            <form class="form" data-factory="${f.id}">
              <label>EXW
                <input name="exw" type="number" step="0.01" value="${f.exw}" />
              </label>
              <label>内陆+港杂 / 套
                <input name="inlandPerSet" type="number" step="0.01" value="${f.inlandPerSet}" />
              </label>
              <label>文件分摊 / 套
                <input name="docsPerSet" type="number" step="0.01" value="${f.docsPerSet}" />
              </label>
              <p>整柜成本 FOB ${money(cost.fobCost)} · CIF ${money(cost.cifCost)}</p>
              <p class="hint">${escapeHtml(f.notes)}</p>
              <button class="btn" type="submit">保存工厂成本</button>
            </form>
          </article>`
        })
        .join('')}
    </section>
  `
}

export function bindProducts(state, renderApp) {
  document.querySelector('[data-ship]')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    updateShipping(state, {
      oceanPer40hq: Number(fd.get('oceanPer40hq')),
      insuranceRate: Number(fd.get('insuranceRate')),
    })
    renderApp()
  })
  document.querySelectorAll('[data-factory]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const fd = new FormData(form)
      updateFactory(state, form.getAttribute('data-factory'), {
        exw: Number(fd.get('exw')),
        inlandPerSet: Number(fd.get('inlandPerSet')),
        docsPerSet: Number(fd.get('docsPerSet')),
      })
      renderApp()
    })
  })
}
