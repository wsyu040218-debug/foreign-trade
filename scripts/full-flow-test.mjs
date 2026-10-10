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
const { validateQuote } = await import('../src/calc.js')
const {
  createQuote,
  saveReply,
  createPI,
  markDepositReceived,
  isClarified,
  spawnInquiry,
} = await import('../src/store.js')

const failures = []
function assert(name, cond, extra) {
  if (!cond) failures.push(name + (extra ? ` :: ${extra}` : ''))
  else console.log('OK', name)
}

const state = createSeed()
assert('seed inquiries', state.inquiries.length >= 4)
assert('24 customers', state.customers.length === 24)

const lumen = state.inquiries.find((i) => i.customerId === 'c-lumen')
assert('lumen LCL', lumen && lumen.fullContainer === false)
assert(
  'lumen CIF blocked',
  validateQuote({
    sellFob: 5.6,
    sellCif: 6.3,
    canUseContainerCif: false,
    fobPort: 'Ningbo',
    cifPort: 'Hamburg',
  }).some((e) => e.includes('不足一柜')),
)
assert(
  'CIF <= FOB blocked',
  validateQuote({
    sellFob: 6.3,
    sellCif: 6.1,
    canUseContainerCif: true,
    fobPort: 'Ningbo',
    cifPort: 'Hamburg',
  }).some((e) => e.includes('必须高于')),
)

const ae = state.inquiries.find((i) => i.customerId === 'c-ae') || state.inquiries[0]
assert('not clarified before ask', isClarified(ae) === false)
assert(
  'quote blocked before clarify',
  createQuote(state, {
    inquiryId: ae.id,
    factoryId: 'f-a',
    sellFob: 5.6,
    sellCif: 6.35,
    fobPort: 'Ningbo',
    cifPort: ae.destPort,
    leadDays: 30,
    packing: 'box',
    validityDays: 7,
  }) === null,
)

saveReply(
  state,
  ae.id,
  `Please confirm destination. Do you want CIF ${ae.destPort}, or FOB Ningbo only?`,
  '问港口',
)
assert(
  'buyer replied after first ask',
  ae.messages.filter((m) => m.from === 'buyer').length >= 2,
  ae.messages.map((m) => m.from).join(','),
)
assert('clarified after buyer answer', isClarified(ae) === true)

saveReply(state, ae.id, 'Do you need FDA on this exact item, English report within 12 months?', '问认证')
assert('second ask got buyer reply', ae.messages.at(-1).from === 'buyer', ae.messages.at(-1).from)

const q = createQuote(state, {
  inquiryId: ae.id,
  factoryId: 'f-a',
  sellFob: 5.6,
  sellCif: 6.35,
  fobPort: 'Ningbo',
  cifPort: ae.destPort,
  leadDays: 30,
  packing: 'neutral',
  validityDays: 7,
})
assert('quote created', Boolean(q))
assert('buyer replied to quote', ae.messages.at(-1).from === 'buyer')

let loops = 0
while (ae.status !== 'won' && loops < 10) {
  saveReply(
    state,
    ae.id,
    'We confirm 304, 30% T/T against PI, 70% against B/L copy. We will not quote DDP.',
    '确认条款',
  )
  loops += 1
}
assert('won after talk', ae.status === 'won', `status=${ae.status} loops=${loops}`)

const pi = createPI(state, q.id)
assert('PI created', Boolean(pi) && ae.piId === pi.id)
assert('PI awaiting deposit', pi.status === 'awaiting_deposit')
assert('quote locked', q.locked === true)

saveReply(state, ae.id, 'Please confirm PI qty and 30% deposit amount.', '出票后再问')
assert('buyer still replies after PI', ae.messages.at(-1).from === 'buyer', ae.messages.at(-1).from)

markDepositReceived(state, pi.id)
assert('deposit in', pi.status === 'deposit_in')

const spawned = spawnInquiry(state)
assert('spawn leftover customer', Boolean(spawned?.id))
saveReply(state, spawned.id, 'Hi, before I quote: please confirm quantity.', '问数量')
assert('spawned got reply', spawned.messages.at(-1).from === 'buyer')

console.log('\nSTATUS', ae.status, 'msgs', ae.messages.length, 'pi', ae.piId)
if (failures.length) {
  console.log('FAIL')
  for (const f of failures) console.log('-', f)
  process.exit(1)
}
console.log('ALL LOGIC PASS')
