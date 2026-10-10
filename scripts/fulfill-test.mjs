const store = {}
globalThis.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => {
    store[k] = String(v)
  },
  removeItem: (k) => {
    delete store[k]
  },
}

const { createSeed } = await import('../src/seed.js')
const { scoreDeal } = await import('../src/score.js')
const {
  saveReply,
  createQuote,
  createPI,
  markDepositReceived,
  issueDocs,
  issueBL,
  markBalanceReceived,
} = await import('../src/store.js')

const state = createSeed()
const ae = state.inquiries.find((i) => i.customerId === 'c-ae')
saveReply(state, ae.id, 'Please confirm destination. Do you want CIF Jebel Ali, or FOB Ningbo only?', '问港口')
const q = createQuote(state, {
  inquiryId: ae.id,
  factoryId: 'f-a',
  sellFob: 5.6,
  sellCif: 6.35,
  fobPort: 'Ningbo',
  cifPort: 'Jebel Ali',
  leadDays: 30,
  packing: 'neutral',
  validityDays: 7,
})
createPI(state, q.id)
markDepositReceived(state, ae.piId)
const sh = state.shipments[0]
if (ae.status !== 'in_production') throw new Error('expect in_production ' + ae.status)
issueDocs(state, sh.id)
if (ae.status !== 'docs_ready' || !sh.ci || !sh.pl) throw new Error('docs')
issueBL(state, sh.id)
if (ae.status !== 'bl_out') throw new Error('bl')
markBalanceReceived(state, sh.id)
if (ae.status !== 'closed' || sh.status !== 'closed') throw new Error('closed')
const score = scoreDeal(ae, q)
if (score.total !== 3 || score.passed < 2) throw new Error('score ' + JSON.stringify(score))
console.log('FULFILL PASS', ae.status, score.passed, '/', score.total)
