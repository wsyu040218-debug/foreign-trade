import { costBreakdown, marginPct, validateQuote } from '../calc.js'
import { escapeHtml, inquiryBadge, money } from '../dom.js'
import { scoreDeal } from '../score.js'
import { TEMPLATES } from '../templates.js'
import { inquiryOpeningZh, PERSONA_LABEL } from '../seed.js'
import {
  addFollowup,
  createPI,
  createQuote,
  factoriesForProduct,
  getCustomer,
  getFactory,
  getInquiry,
  getProduct,
  getQuote,
  isClarified,
  markRead,
  saveNegotiation,
  saveReply,
  saveState,
  spawnInquiry,
  updateQuote,
} from '../store.js'

function nextDo(inquiry, clarified, quote) {
  if (inquiry.status === 'closed') {
    return { title: '这票已经收齐关档', body: '尾款到了。去「履约」看复盘打分，再开下一封询盘。' }
  }
  if (inquiry.status === 'bl_out') {
    return { title: '提单副本已出，等 70% 尾款', body: '去「履约」点「尾款已到账」。不要再出一张 PI。' }
  }
  if (inquiry.status === 'docs_ready') {
    return { title: '商业发票和装箱单已出', body: '去「履约」点「提单副本已出」，对方才会付尾款。' }
  }
  if (inquiry.status === 'in_production') {
    return { title: '定金到了，正在排产', body: '去顶部「履约」，按 PI 出商业发票和装箱单。' }
  }
  if (inquiry.piId) {
    return {
      title: '这票已经出了形式发票',
      body: '去左侧「报价和形式发票」，核对接不接得上：总价、30% 定金、港口。定金是对着发票付的，不是先收款再开票。',
    }
  }
  if (inquiry.status === 'won') {
    return {
      title: '对方同意了，要形式发票',
      body: '往下滚，点「生成形式发票」。那是给对方打 30% 定金用的单据。',
    }
  }
  if (quote) {
    return {
      title: '价格已经发出，继续用英文回他',
      body: '他若砍价或要门口价（DDP），用上面的「拒 DDP / 议价」稿回。等他说 send the PI（请出形式发票），再点生成。',
    }
  }
  if (clarified) {
    return {
      title: '对方已经回答，可以报单价了',
      body: '先看「我们的成本」，再填「卖给买家的价」。FOB = 宁波上船价。CIF = 运到对方港口的价。不够一柜不要填 CIF。',
    }
  }
  return {
    title: '先问清楚，先不要报死价',
    body: '看左边买家英文，下面有中文。想好要问什么，点灰色按钮会生成英文，再点「发给买家」。他回了才能填单价。',
  }
}

function scoreBlock(inquiry, quote) {
  const score = scoreDeal(inquiry, quote)
  return `
    <h3>这票复盘 ${score.passed}/${score.total}</h3>
    <ul class="rows compact">
      ${score.items
        .map(
          (it) =>
            `<li><span class="badge ${it.ok ? 'badge-deposit_in' : 'badge-new'}">${it.ok ? '过' : '缺'}</span><div><strong>${escapeHtml(it.title)}</strong><p class="muted">${escapeHtml(it.why)}</p></div></li>`,
        )
        .join('')}
    </ul>`
}

function costFor(state, inquiry, factory) {
  const product = getProduct(state, inquiry.productId)
  return costBreakdown({
    exw: factory.exw,
    inlandPerSet: factory.inlandPerSet,
    docsPerSet: factory.docsPerSet,
    oceanPer40hq: state.shipping.oceanPer40hq,
    insuranceRate: state.shipping.insuranceRate,
    qty: inquiry.qty,
    cbmPerSet: product.cbmPerSet,
    usableCbm: state.shipping.usableCbm,
    forceFullContainer: inquiry.fullContainer,
  })
}

export function renderInquiryList(state) {
  const leftover = state.customers.filter((c) => !state.inquiries.some((i) => i.customerId === c.id)).length
  return `
    <header class="page-head">
      <div>
        <h2>买家来信</h2>
        <p class="sub">点开一封，先看中文在说什么，再用英文回。花名册里还有 ${leftover} 人没来信。</p>
      </div>
      <button type="button" class="btn" data-spawn ${leftover ? '' : 'disabled'}>来一封新询盘</button>
    </header>
    <ul class="card-list">
      ${state.inquiries
        .map((i) => {
          const c = getCustomer(state, i.customerId)
          return `<li>
            <a href="#/inquiries/${i.id}">
              <div>
                <strong>${i.unread ? '<span class="dot"></span>' : ''}${escapeHtml(c?.name)} · ${escapeHtml(c?.country)}</strong>
                <p>${escapeHtml(PERSONA_LABEL[c?.persona] || '')} · ${escapeHtml(i.qtyLabel)} · 港口 ${escapeHtml(i.destPort)}</p>
                <p class="en-line" translate="no">${escapeHtml(i.subject)}</p>
                <p class="tags">${(i.tags || []).map((t) => `<span>${escapeHtml(t)}</span>`).join('')}</p>
              </div>
              ${i.ghosted && !i.piId ? '<span class="badge badge-lost">已读未回</span>' : inquiryBadge(i)}
            </a>
          </li>`
        })
        .join('')}
    </ul>
  `
}

export function bindInquiryList(state, renderApp) {
  document.querySelector('[data-spawn]')?.addEventListener('click', () => {
    const inquiry = spawnInquiry(state)
    if (!inquiry) return
    location.hash = `#/inquiries/${inquiry.id}`
    renderApp()
  })
}

export function renderInquiryDetail(state, id) {
  const inquiry = getInquiry(state, id)
  if (!inquiry) return `<p class="empty">询盘不存在。</p>`
  const customer = getCustomer(state, inquiry.customerId)
  const product = getProduct(state, inquiry.productId)
  const factories = factoriesForProduct(state, inquiry.productId)
  const factory = inquiry.factoryId ? getFactory(state, inquiry.factoryId) : factories.find((f) => f.recommended)
  const selectedId = inquiry.factoryId || factory?.id
  const cost = factory ? costFor(state, inquiry, factory) : null
  const quote = inquiry.quoteId ? getQuote(state, inquiry.quoteId) : null
  const sellFob = quote?.sellFob ?? ''
  const sellCif = quote?.sellCif ?? ''
  const errors = quote
    ? validateQuote({
        sellFob: quote.sellFob,
        sellCif: quote.sellCif,
        canUseContainerCif: cost?.canUseContainerCif,
        fobPort: quote.fobPort,
        cifPort: quote.cifPort,
      })
    : []
  const clarified = isClarified(inquiry)
  const step = inquiry.status === 'closed'
    ? 6
    : inquiry.status === 'bl_out' || inquiry.status === 'docs_ready'
      ? 5
      : inquiry.status === 'in_production'
        ? 4
        : inquiry.piId
    ? 4
    : inquiry.status === 'won'
      ? 3
      : quote
        ? 2
        : clarified
          ? 1
          : 0
  const guide = nextDo(inquiry, clarified, quote)
  const showZh = localStorage.getItem('ft-show-zh') !== '0'

  return `
    <header class="page-head">
      <div>
        <p class="crumb"><a href="#/inquiries">买家来信</a></p>
        <h2>${escapeHtml(customer.name)}</h2>
        <p class="sub">${escapeHtml(customer.country)} · ${escapeHtml(PERSONA_LABEL[customer.persona] || '')} · ${escapeHtml(inquiry.qtyLabel)} · ${inquiry.ghosted && !inquiry.piId ? '<span class="badge badge-lost">已读未回</span>' : inquiryBadge(inquiry)}</p>
        <p class="en-line" translate="no">${escapeHtml(inquiry.subject)}</p>
      </div>
      <button type="button" class="ghost" data-toggle-zh>${showZh ? '只看英文' : '对照中文'}</button>
    </header>
    <ol class="steps">
      <li class="${step === 0 ? 'is-on' : ''}">① 问清</li>
      <li class="${step === 1 ? 'is-on' : ''}">② 报价</li>
      <li class="${step === 2 ? 'is-on' : ''}">③ 谈条款</li>
      <li class="${step === 3 ? 'is-on' : ''}">④ 出形式发票</li>
      <li class="${step === 4 ? 'is-on' : ''}">⑤ 等定金 / 排产</li>
      <li class="${step === 5 ? 'is-on' : ''}">⑥ 单据尾款</li>
      <li class="${step === 6 ? 'is-on' : ''}">⑦ 关档</li>
    </ol>
    <aside class="coach">
      <p class="coach-kicker">现在做什么</p>
      <h3>${escapeHtml(guide.title)}</h3>
      <p>${escapeHtml(guide.body)}</p>
    </aside>

    <section class="desk">
    <article class="panel">
      <h3>往来信件 <span class="soft">上面英文发给买家，下面中文给你看</span></h3>
      <div class="thread">
        ${(inquiry.messages || [{ from: 'buyer', text: inquiry.body, textZh: inquiryOpeningZh(customer), at: '' }])
          .map((m) => {
            const zh = m.textZh || (m.from === 'buyer' && m.text === inquiry.body ? inquiryOpeningZh(customer) : '')
            return `
          <div class="bubble ${m.from === 'you' ? 'is-you' : 'is-buyer'}">
            <small>${m.from === 'you' ? '你发出去的英文' : `买家 ${escapeHtml(customer.name)}`}</small>
            <pre class="en" translate="no">${escapeHtml(m.text)}</pre>
            ${zh && showZh ? `<p class="zh">中文：${escapeHtml(zh)}</p>` : ''}
          </div>`
          })
          .join('')}
      </div>
      <p class="field-help">点下面按钮，会把英文填进框里。看懂中文后，点「发给买家」。</p>
      <p class="tpl-label">先问清</p>
      <div class="tpl-bar">
        <button type="button" class="ghost" data-ask="qty">问数量</button>
        <button type="button" class="ghost" data-ask="port">问港口</button>
        <button type="button" class="ghost" data-ask="cert">问认证</button>
        <button type="button" class="ghost" data-ask="box">问包装</button>
        <button type="button" class="ghost" data-ask="pay">问付款（不要门口价）</button>
        <button type="button" class="ghost" data-tpl="clarify">一次问完五项</button>
      </div>
      <p class="tpl-label">已经报价之后再用</p>
      <div class="tpl-bar">
        <button type="button" class="ghost" data-tpl="inquiry">普通回复稿</button>
        <button type="button" class="ghost" data-tpl="quote">报价说明稿</button>
        <button type="button" class="ghost" data-tpl="nego">拒门口价 / 砍价稿</button>
      </div>
      <textarea id="reply-box" rows="7" placeholder="这里出现英文。看懂后再发给买家。"></textarea>
      <button type="button" class="btn" data-save-reply="${inquiry.id}">发给买家</button>
    </article>

    <article class="panel summary">
      <h3>这票货一览</h3>
      <table class="plain">
        <tr><th>买家</th><td>${escapeHtml(customer.name)}<br /><span class="soft">${escapeHtml(customer.city)}，${escapeHtml(customer.country)}</span></td></tr>
        <tr><th>他是哪种人</th><td>${escapeHtml(PERSONA_LABEL[customer.persona] || '')}。${escapeHtml(customer.notes || '')}</td></tr>
        <tr><th>要多少</th><td>${escapeHtml(inquiry.qtyLabel)}</td></tr>
        <tr><th>港口</th><td>我们宁波上船；他要到 ${escapeHtml(inquiry.destPort)}</td></tr>
        <tr><th>认证</th><td>${escapeHtml(customer.cert)}，要本货号报告</td></tr>
        <tr><th>货号</th><td>${escapeHtml(product.sku)}　${escapeHtml(product.name)}</td></tr>
      </table>
      <p class="tags">${(inquiry.tags || []).map((t) => `<span>${escapeHtml(t)}</span>`).join('')}</p>
    </article>
    </section>

    <section class="grid-2">
      <article class="panel">
        <h3>选哪家工厂供货</h3>
        <p class="field-help">德国大货选工厂 A。B 更便宜，但报告和交期不稳，不要当主供。</p>
        <div class="factory-pick" data-inquiry="${inquiry.id}">
          ${factories
            .map(
              (f) => `
            <label class="factory ${f.id === selectedId ? 'is-on' : ''} ${f.recommended ? 'is-rec' : ''}">
              <input type="radio" name="factory" value="${f.id}" ${f.id === selectedId ? 'checked' : ''} data-pick-factory="${inquiry.id}" />
              <strong>${escapeHtml(f.name)}</strong>
              <span>EXW ${money(f.exw)} · 交期 ${f.leadDays} 天 · LFGB ${f.lfgb ? '可出' : '存疑'}</span>
              <em>${escapeHtml(f.notes)}</em>
            </label>`,
            )
            .join('')}
        </div>
      </article>
      ${
        cost
          ? `<article class="panel">
      <h3>我们的成本（不能报给买家）</h3>
      <p class="field-help">这是你的底。卖价必须高于成本，差额才是毛利。</p>
      <table class="plain">
        <tr><th>FOB 成本<br /><span class="soft">货到宁波上船，我们自己要花的</span></th><td>${money(cost.fobCost)}</td></tr>
        <tr><th>一个 40 尺柜能装</th><td>${cost.capacity.toLocaleString()} 套</td></tr>
        <tr><th>海运摊到每套</th><td>${cost.canUseContainerCif ? money(cost.oceanPerSet) : '不够一柜，不能这样摊'}</td></tr>
        <tr><th>CIF 成本<br /><span class="soft">货到 ${escapeHtml(inquiry.destPort)} 港口，我们要花的</span></th><td>${cost.canUseContainerCif ? money(cost.cifCost) : '禁止套用整柜到港价'}</td></tr>
      </table>
      ${!cost.canUseContainerCif ? '<p class="warn">这票不够一柜。对外只报 FOB（上船价），不要填 CIF。</p>' : ''}
    </article>`
          : ''
      }
    </section>

    <article class="panel">
      <h3>卖给买家的价</h3>
      <p class="field-help">FOB = 宁波上船，买家自己找船。CIF = 我们付海运，货到他港口。整柜 CIF 练习价大约 6.35，可以谈到 5.95。</p>
      ${
        !clarified
          ? '<p class="warn">先在上面问完、等他回了，这两个框才会亮。</p>'
          : ''
      }
      <form class="form quote-grid" data-quote-form="${inquiry.id}">
        <input type="hidden" name="factoryId" value="${selectedId || ''}" />
        <label>上船价 FOB 宁波（美元/套）
          <input name="sellFob" type="number" step="0.01" min="0" value="${escapeHtml(sellFob)}" required ${clarified ? '' : 'disabled'} />
        </label>
        <label>到港价 CIF ${escapeHtml(inquiry.destPort || state.shipping.cifPort)}（不够一柜请留空）
          <input name="sellCif" type="number" step="0.01" min="0" value="${escapeHtml(sellCif)}" ${clarified ? '' : 'disabled'} />
        </label>
        <p class="hint">你现在的毛利：上船 ${
          sellFob && cost ? `${marginPct(Number(sellFob), cost.fobCost)}%` : '还没填'
        } · 到港 ${sellCif && cost?.cifCost ? `${marginPct(Number(sellCif), cost.cifCost)}%` : '—'}</p>
        ${
          [...errors, ...(inquiry.quoteErrors || [])].length
            ? `<ul class="errors">${[...new Set([...errors, ...(inquiry.quoteErrors || [])])].map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`
            : ''
        }
        <button type="submit" class="btn" ${clarified ? '' : 'disabled'}>${quote ? '改报价并告诉买家' : '把这个价发给买家'}</button>
      </form>
    </article>

    <article class="panel">
      <h3>你坚持的底线（自己记）</h3>
      <p class="field-help">勾上表示这封信里你拒绝了这些外行条件。对方问门口价、改 201、15 天交期时要拒。</p>
      <form class="form nego-form" data-nego-form="${inquiry.id}">
        <label class="check"><input type="checkbox" name="refuse201" ${inquiry.negotiation?.refuse201 ? 'checked' : ''} /> 不换成便宜的 201 钢</label>
        <label class="check"><input type="checkbox" name="refuseDdp" ${inquiry.negotiation?.refuseDdp ? 'checked' : ''} /> 不报门口价（DDP）</label>
        <label class="check"><input type="checkbox" name="refuse15" ${inquiry.negotiation?.refuse15 ? 'checked' : ''} /> 不答应 15 天出 304</label>
        <label class="check"><input type="checkbox" name="sampleFreightCollect" ${inquiry.negotiation?.sampleFreightCollect ? 'checked' : ''} /> 样品运费对方付</label>
        <button type="submit" class="ghost">记下这些底线</button>
      </form>
    </article>

    ${
      quote
        ? `<article class="panel">${scoreBlock(inquiry, quote)}</article>`
        : ''
    }

    <div class="actions">
      <button type="button" class="btn" data-make-pi="${inquiry.id}" ${inquiry.status === 'won' && quote && !inquiry.piId ? '' : 'disabled'}>生成形式发票</button>
      <button type="button" class="ghost" data-follow="${inquiry.id}">三天后提醒我跟进</button>
      ${inquiry.piId ? `<a class="ghost" href="#/quotes">去看形式发票</a>` : ''}
      ${['in_production', 'docs_ready', 'bl_out', 'closed'].includes(inquiry.status) ? `<a class="btn" href="#/ship">去履约</a>` : ''}
    </div>
    <p class="field-help">${
      inquiry.piId
        ? '形式发票已出。买方按发票付 30% 定金后才开工。'
        : inquiry.status === 'won'
          ? '对方说请出形式发票了，点上面的绿色按钮。'
          : quote
            ? '还不能出形式发票：等他说 send the PI。'
            : '形式发票要等问清、报价、对方同意之后。'
    }</p>
  `
}

export function bindInquiryDetail(state, id, renderApp) {
  const inquiry = getInquiry(state, id)
  if (!inquiry) return
  if (inquiry.unread) markRead(state, inquiry.id)
  const product = getProduct(state, inquiry.productId)
  const customer = getCustomer(state, inquiry.customerId)

  document.querySelectorAll('[data-pick-factory]').forEach((el) => {
    el.addEventListener('change', () => {
      inquiry.factoryId = el.value
      saveState(state)
      renderApp()
    })
  })

  const asks = {
    qty: {
      en: `Hi, before I quote: please confirm quantity. Is it ${inquiry.qtyLabel}, or a smaller trial / LCL?`,
      zh: `报价前请确认数量：是 ${inquiry.qtyLabel}，还是更小的试单/拼箱？`,
    },
    port: {
      en: `Please confirm destination. Do you want CIF ${inquiry.destPort}, or FOB Ningbo only?`,
      zh: `请确认目的港：要 CIF ${inquiry.destPort}，还是只报 FOB 宁波？`,
    },
    cert: {
      en: `Do you need ${customer.cert} on this exact item, English report within 12 months?`,
      zh: `本货号是否要 ${customer.cert} 英文报告（12 个月内）？`,
    },
    box: {
      en: `Packing: neutral box + sticker for the first container, or printed box from the start? What is your logo MOQ?`,
      zh: `包装：第一柜中性盒+贴纸，还是一开始就印刷盒？印刷盒起订量多少？`,
    },
    pay: {
      en: `Payment: 30% T/T against PI, 70% against copy of B/L. We will not quote DDP. Please confirm.`,
      zh: `付款：PI 后 30% 电汇，见提单副本 70%。我们不报 DDP。请确认。`,
    },
  }
  document.querySelectorAll('[data-ask]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const box = document.querySelector('#reply-box')
      const line = asks[btn.getAttribute('data-ask')]
      box.value = box.value.trim() ? `${box.value.trim()}\n\n${line.en}` : line.en
      const prev = box.dataset.zh ? `${box.dataset.zh}\n` : ''
      box.dataset.zh = `${prev}${line.zh}`
      box.focus()
    })
  })

  document.querySelector('[data-toggle-zh]')?.addEventListener('click', () => {
    const on = localStorage.getItem('ft-show-zh') !== '0'
    localStorage.setItem('ft-show-zh', on ? '0' : '1')
    renderApp()
  })

  const form = document.querySelector('[data-quote-form]')
  form?.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    const factoryId = String(fd.get('factoryId') || inquiry.factoryId)
    const factory = getFactory(state, factoryId)
    if (!factory) return
    const cost = costFor(state, inquiry, factory)
    const sellFob = Number(fd.get('sellFob'))
    const cifRaw = String(fd.get('sellCif') || '').trim()
    const sellCif = cifRaw === '' ? null : Number(cifRaw)
    const payload = {
      inquiryId: inquiry.id,
      factoryId,
      sellFob,
      sellCif,
      fobPort: state.shipping.fobPort,
      cifPort: inquiry.destPort || state.shipping.cifPort,
      leadDays: factory.leadDays,
      packing: product.packing,
      validityDays: 7,
    }
    const errors = validateQuote({
      sellFob,
      sellCif,
      canUseContainerCif: cost.canUseContainerCif,
      fobPort: payload.fobPort,
      cifPort: payload.cifPort,
    })
    if (errors.length) {
      inquiry.quoteErrors = errors
      saveState(state)
      renderApp()
      return
    }
    if (!isClarified(inquiry)) {
      inquiry.quoteErrors = ['先在对话里问买家，等对方回复后再报价。']
      saveState(state)
      renderApp()
      return
    }
    inquiry.quoteErrors = []
    if (inquiry.quoteId) updateQuote(state, inquiry.quoteId, payload)
    else createQuote(state, payload)
    renderApp()
  })

  document.querySelectorAll('[data-tpl]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const quote = inquiry.quoteId ? getQuote(state, inquiry.quoteId) : null
      const factory = getFactory(state, inquiry.factoryId) || factoriesForProduct(state, inquiry.productId)[0]
      const box = document.querySelector('#reply-box')
      const tpl = TEMPLATES[btn.getAttribute('data-tpl')]
      if (!box || !tpl) return
      const ctx = {
        customer,
        product,
        sellFob: quote?.sellFob,
        sellCif: quote?.sellCif,
        fobPort: state.shipping.fobPort,
        cifPort: quote?.cifPort || inquiry.destPort || state.shipping.cifPort,
        destPort: inquiry.destPort,
        qtyLabel: inquiry.qtyLabel,
        cert: customer.cert,
        leadDays: quote?.leadDays || factory?.leadDays || 30,
      }
      box.value = tpl.build(ctx)
      box.dataset.zh = tpl.buildZh ? tpl.buildZh(ctx) : ''
      box.scrollIntoView({ behavior: 'smooth', block: 'center' })
      box.focus()
    })
  })

  document.querySelector('[data-save-reply]')?.addEventListener('click', () => {
    const box = document.querySelector('#reply-box')
    const text = box.value.trim()
    if (!text) return
    saveReply(state, inquiry.id, text, box.dataset.zh || '')
    renderApp()
  })

  document.querySelector('[data-nego-form]')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    saveNegotiation(state, inquiry.id, {
      refuse201: fd.get('refuse201') === 'on',
      refuseDdp: fd.get('refuseDdp') === 'on',
      refuse15: fd.get('refuse15') === 'on',
      sampleFreightCollect: fd.get('sampleFreightCollect') === 'on',
    })
    renderApp()
  })

  document.querySelector('[data-make-pi]')?.addEventListener('click', () => {
    if (!inquiry.quoteId) {
      inquiry.quoteErrors = ['还没有报价。问清并报价、对方要 PI 之后才能出。']
      saveState(state)
      renderApp()
      document.querySelector('[data-quote-form]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (inquiry.status !== 'won') {
      inquiry.quoteErrors = ['对方还没要 PI。先谈妥条款，等他说 send the PI。']
      saveState(state)
      renderApp()
      return
    }
    const quote = getQuote(state, inquiry.quoteId)
    const factory = getFactory(state, quote.factoryId)
    const cost = costFor(state, inquiry, factory)
    const errors = validateQuote({
      sellFob: quote.sellFob,
      sellCif: quote.sellCif,
      canUseContainerCif: cost.canUseContainerCif,
      fobPort: quote.fobPort,
      cifPort: quote.cifPort,
    })
    if (errors.length) {
      inquiry.quoteErrors = errors
      saveState(state)
      renderApp()
      return
    }
    createPI(state, inquiry.quoteId)
    location.hash = '#/quotes'
  })

  document.querySelector('[data-follow]')?.addEventListener('click', () => {
    addFollowup(state, {
      customerId: inquiry.customerId,
      inquiryId: inquiry.id,
      day: 3,
      note: `跟进：${inquiry.subject}`,
    })
    location.hash = '#/today'
  })
}
