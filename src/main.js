import './style.css'
import { loadState, markRead, resetState } from './store.js'
import { bindDashboard, renderDashboard } from './views/dashboard.js'
import { bindInquiryDetail, bindInquiryList, renderInquiryDetail, renderInquiryList } from './views/inquiries.js'
import { bindFulfillment, renderFulfillment } from './views/fulfillment.js'
import { bindQuotes, renderQuotes } from './views/quotes.js'
import { bindCustomers, renderCustomers } from './views/customers.js'
import { bindProducts, renderProducts } from './views/products.js'

let state = loadState()

const NAV = [
  { hash: '#/today', id: 'today', label: '今日' },
  { hash: '#/inquiries', id: 'inquiries', label: '来信' },
  { hash: '#/quotes', id: 'quotes', label: '报价' },
  { hash: '#/ship', id: 'ship', label: '履约' },
  { hash: '#/customers', id: 'customers', label: '客户' },
  { hash: '#/cost', id: 'cost', label: '成本' },
]

function route() {
  const raw = location.hash || '#/today'
  const parts = raw.replace('#/', '').split('/')
  return { name: parts[0] || 'today', id: parts[1] }
}

function renderApp() {
  const r = route()
  const openCount = state.inquiries.filter((i) => i.unread || i.status === 'new').length
  document.querySelector('#app').innerHTML = `
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">KS</span>
        <div>
          <p class="eyebrow">练习台</p>
          <h1>厨具出口</h1>
        </div>
      </div>
      <nav>
        ${NAV.map((n) => {
          const on = r.name === n.id
          const count = n.id === 'inquiries' && openCount ? `<span class="nav-count">${openCount}</span>` : ''
          return `<a class="${on ? 'is-on' : ''}" href="${n.hash}"><span>${n.label}</span>${count}</a>`
        }).join('')}
      </nav>
      <button type="button" class="ghost reset" data-reset>重置数据</button>
    </header>
    <main class="main" id="main"></main>
  `

  const main = document.querySelector('#main')
  if (r.name === 'inquiries' && r.id) {
    markRead(state, r.id)
    main.innerHTML = renderInquiryDetail(state, r.id)
    bindInquiryDetail(state, r.id, renderApp)
  } else if (r.name === 'inquiries') {
    main.innerHTML = renderInquiryList(state)
    bindInquiryList(state, renderApp)
  } else if (r.name === 'quotes') {
    main.innerHTML = renderQuotes(state)
    bindQuotes(state, renderApp)
  } else if (r.name === 'ship') {
    main.innerHTML = renderFulfillment(state)
    bindFulfillment(state, renderApp)
  } else if (r.name === 'customers') {
    main.innerHTML = renderCustomers(state)
    bindCustomers(state, renderApp)
  } else if (r.name === 'cost') {
    main.innerHTML = renderProducts(state)
    bindProducts(state, renderApp)
  } else {
    main.innerHTML = renderDashboard(state)
    bindDashboard(state, renderApp)
  }

  document.querySelector('[data-reset]')?.addEventListener('click', () => {
    if (!confirm('清除本机练习数据并恢复花名册与开局询盘？')) return
    state = resetState()
    location.hash = '#/today'
    renderApp()
  })
}

window.addEventListener('hashchange', renderApp)
renderApp()
