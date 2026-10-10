const PRODUCT_ID = 'p-ks304'

/** @type {Array<Record<string, unknown>>} */
export const ROSTER = [
  { id: 'c-nord', name: 'Nordküche Import GmbH', country: '德国', city: 'Hamburg', channel: '超市 + 餐饮批发', persona: 'ddp', port: 'Hamburg', fullContainer: true, cert: 'LFGB', notes: '会砍价、要样品、要 DDP。' },
  { id: 'c-lumen', name: 'Lumen Hauswaren GmbH', country: '德国', city: 'Bremen', channel: '区域批发', persona: 'small', port: 'Hamburg', fullContainer: false, cert: 'LFGB', notes: '先试 1200 套，不够一柜。' },
  { id: 'c-roesle', name: 'Nordstahl Tools GmbH', country: '德国', city: 'Stuttgart', channel: '专业厨具品牌', persona: 'cert_lfgb', port: 'Hamburg', fullContainer: true, cert: 'LFGB', notes: '先问本货号检测报告。' },
  { id: 'c-fackel', name: 'Küchenallee Handel', country: '德国', city: 'Nuremberg', channel: '家庭工具连锁', persona: 'bargain', port: 'Hamburg', fullContainer: true, cert: 'LFGB', notes: '对标价，默认砍 8%。' },
  { id: 'c-brab', name: 'Delta Home NL B.V.', country: '荷兰', city: 'Amsterdam', channel: '家居零售', persona: 'accept', port: 'Rotterdam', fullContainer: true, cert: 'LFGB', notes: '条款清楚就下试单。' },
  { id: 'c-tesc', name: 'Central Cookware s.r.o.', country: '捷克', city: 'Prague', channel: '欧洲分销', persona: 'bargain', port: 'Hamburg', fullContainer: true, cert: 'LFGB', notes: '要比三家再谈。' },
  { id: 'c-jj', name: 'Harbour Design Ltd', country: '英国', city: 'London', channel: '设计厨具', persona: 'private_label', port: 'Felixstowe', fullContainer: true, cert: 'LFGB', notes: '要中性盒和 logo 位置。' },
  { id: 'c-ems', name: 'Rhein Haus GmbH', country: '德国', city: 'Cologne', channel: '家居品牌', persona: 'sample', port: 'Hamburg', fullContainer: true, cert: 'LFGB', notes: '没看到样品不下柜。' },
  { id: 'c-wmf', name: 'Südmetall Beschaffung', country: '德国', city: 'Geislingen', channel: '中高端采购', persona: 'ghost', port: 'Hamburg', fullContainer: true, cert: 'LFGB', notes: '回复慢，常已读不回。' },
  { id: 'c-west', name: 'Westmark Trading', country: '德国', city: 'Lennestadt', channel: '厨房小工具', persona: 'cert_lfgb', port: 'Hamburg', fullContainer: false, cert: 'LFGB', notes: '小单也要报告。' },
  { id: 'c-gefu', name: 'Formküche GmbH', country: '德国', city: 'Düsseldorf', channel: '设计厨具', persona: 'sample', port: 'Hamburg', fullContainer: true, cert: 'LFGB', notes: '要看砂光和厚度。' },
  { id: 'c-metal', name: 'Alpen Metaltex AG', country: '瑞士', city: 'Zurich', channel: '金属厨房件', persona: 'accept', port: 'Hamburg', fullContainer: true, cert: 'LFGB', notes: 'FOB 条款清楚即可。' },
  { id: 'c-ae', name: 'Gulf Kitchen Trading', country: '阿联酋', city: 'Dubai', channel: '湾区批发', persona: 'large_me', port: 'Jebel Ali', fullContainer: true, cert: 'FDA', notes: '量大，不太啃 DDP。' },
  { id: 'c-sa', name: 'Riyadh Housewares Co.', country: '沙特', city: 'Riyadh', channel: '商超进口', persona: 'large_me', port: 'Jeddah', fullContainer: true, cert: 'FDA', notes: '要整柜，交期可谈。' },
  { id: 'c-pl', name: 'Warsaw Kitchen Sp. z o.o.', country: '波兰', city: 'Warsaw', channel: '中欧批发', persona: 'bargain', port: 'Gdansk', fullContainer: true, cert: 'LFGB', notes: '预算紧。' },
  { id: 'c-fr', name: 'Atelier Cuisine SAS', country: '法国', city: 'Lyon', channel: '餐饮供应', persona: 'ddp', port: 'Le Havre', fullContainer: true, cert: 'LFGB', notes: '习惯问门口价。' },
  { id: 'c-es', name: 'Iberia Hogar S.L.', country: '西班牙', city: 'Barcelona', channel: '零售进口', persona: 'small', port: 'Barcelona', fullContainer: false, cert: 'LFGB', notes: '先 1500 套试铺。' },
  { id: 'c-it', name: 'Cucina Nord srl', country: '意大利', city: 'Milan', channel: '酒店用品', persona: 'cert_lfgb', port: 'Genoa', fullContainer: true, cert: 'LFGB', notes: '要英文报告。' },
  { id: 'c-au', name: 'Pacific Homewares Pty', country: '澳洲', city: 'Sydney', channel: '零售进口', persona: 'cert_fda', port: 'Sydney', fullContainer: true, cert: 'FDA', notes: '要食品接触说明。' },
  { id: 'c-us', name: 'Midwest Kitchen Supply', country: '美国', city: 'Chicago', channel: '餐饮批发', persona: 'cert_fda', port: 'Los Angeles', fullContainer: true, cert: 'FDA', notes: '先问 FDA，很少要 DDP。' },
  { id: 'c-uk2', name: 'Northline Imports Ltd', country: '英国', city: 'Manchester', channel: '超市供货', persona: 'bargain', port: 'Felixstowe', fullContainer: true, cert: 'LFGB', notes: '要比价表。' },
  { id: 'c-be', name: 'Schelde Housewares BV', country: '比利时', city: 'Antwerp', channel: '批发', persona: 'ghost', port: 'Antwerp', fullContainer: true, cert: 'LFGB', notes: '询完可能消失。' },
  { id: 'c-se', name: 'Nordic Pantry AB', country: '瑞典', city: 'Gothenburg', channel: '北欧零售', persona: 'private_label', port: 'Gothenburg', fullContainer: true, cert: 'LFGB', notes: '要贴纸盒说明。' },
  { id: 'c-tr', name: 'Anadolu Mutfak A.S.', country: '土耳其', city: 'Istanbul', channel: '区域进口', persona: 'sample', port: 'Istanbul', fullContainer: true, cert: 'LFGB', notes: '先看两套样品。' },
]

export const PERSONA_LABEL = {
  bargain: '硬砍价',
  ddp: '坚持 DDP',
  small: '小单试铺',
  cert_lfgb: '认证党 LFGB',
  cert_fda: '认证党 FDA',
  sample: '样品先行',
  accept: '条款清楚就下',
  ghost: '常已读不回',
  private_label: '贴牌细节党',
  large_me: '中东整柜',
}

export function createSeed() {
  const customers = ROSTER.map((c) => ({ ...c }))
  const startIds = ['c-nord', 'c-lumen', 'c-ae', 'c-us', 'c-brab']
  const inquiries = startIds.map((id) => buildInquiry(customers.find((c) => c.id === id), `i-${id}`))

  return {
    shipping: {
      oceanPer40hq: 2200,
      usableCbm: 68,
      insuranceRate: 0.003,
      fobPort: 'Ningbo',
      cifPort: 'Hamburg',
    },
    customers,
    products: [
      {
        id: PRODUCT_ID,
        sku: 'KS-304-6',
        name: '6 件套 304 不锈钢厨具',
        material: 'SUS304 砂光，铲面约 1.0 mm',
        packing: 'PE 袋 + 中性彩盒，12 套/箱，可打托',
        cbmPerSet: 0.0038,
        setsPerCarton: 12,
        moq: 1200,
        cert: 'LFGB / EU 1935/2004（按货号）',
      },
    ],
    factories: [
      {
        id: 'f-a',
        name: '阳江 OEM 工厂 A',
        productId: PRODUCT_ID,
        exw: 4.85,
        inlandPerSet: 0.18,
        docsPerSet: 0.04,
        leadDays: 30,
        lfgb: true,
        recommended: true,
        notes: '工作端+手柄 304，可按货号出 LFGB。交期稳，不是最低价。',
      },
      {
        id: 'f-b',
        name: '永康现货型工厂 B',
        productId: PRODUCT_ID,
        exw: 4.35,
        inlandPerSet: 0.16,
        docsPerSet: 0.04,
        leadDays: 15,
        lfgb: false,
        recommended: false,
        notes: '表价更低。报告可能套用，15 天多半是 201 或旧盒。德国大货不建议做主供。',
      },
    ],
    inquiries,
    quotes: [],
    pis: [],
    shipments: [],
    followups: [
      {
        id: 'fu-d0',
        customerId: 'c-nord',
        inquiryId: inquiries[0].id,
        day: 0,
        due: todayISO(),
        done: false,
        note: '新询盘尚未回复',
      },
    ],
  }
}

export function buildInquiry(customer, id = `i-${customer.id}-${Date.now()}`) {
  const full = Boolean(customer.fullContainer)
  const qty = full ? 17800 : 1200
  const { subject, body, bodyZh, tags } = openingMail(customer)
  const now = new Date().toISOString()
  return {
    id,
    customerId: customer.id,
    productId: PRODUCT_ID,
    qty,
    qtyLabel: full ? `1 × 40HQ（约 17,800 套）` : '1,200 套（不足一柜）',
    fullContainer: full,
    destPort: customer.port,
    subject,
    body,
    status: 'new',
    factoryId: null,
    quoteId: null,
    piId: null,
    tags,
    unread: true,
    messages: [{ at: now, from: 'buyer', text: body, textZh: bodyZh }],
    negotiation: null,
    quoteErrors: [],
  }
}

function openingMail(c) {
  const cert = c.cert
  const port = c.port
  switch (c.persona) {
    case 'ddp':
      return {
        subject: `Trial 40HQ to ${port} — can you do DDP?`,
        body: `Hi, we import kitchen tools for retail in ${c.city}. Please quote 6pcs stainless utensil set, private label, one 40'HQ.\nNeed ${cert}. Can you offer DDP ${c.city}?`,
        bodyZh: `你好，我们在 ${c.city} 做零售厨具进口。请报 6 件套不锈钢厨具，贴牌，一个 40 尺柜。\n需要 ${cert}。能否报 DDP ${c.city}？`,
        tags: ['整柜', '要 DDP', cert],
      }
    case 'small':
      return {
        subject: `Small trial 1200 sets — same CIF as container?`,
        body: `We only need 1,200 sets for a regional test in ${c.city}. Please quote CIF ${port} at your container unit price if possible.`,
        bodyZh: `我们在 ${c.city} 只要 1,200 套区域试铺。如果可以，请按整柜单价报 CIF ${port}。`,
        tags: ['不足一柜', '想套整柜 CIF'],
      }
    case 'bargain':
      return {
        subject: `Need your best price — 6pcs SS set, 40HQ`,
        body: `Please quote 6pcs 304 utensil set, 1x40HQ to ${port}. We already have offers from two other factories. Need your best number.`,
        bodyZh: `请报 6 件套 304 厨具，1×40HQ 到 ${port}。我们已经有两家工厂报价，要你们最低价。`,
        tags: ['硬砍价', '整柜'],
      }
    case 'cert_lfgb':
      return {
        subject: `LFGB on this item? KS-304-6`,
        body: `Before we talk price: do you have LFGB / 1935/2004 for this exact item, in English, last 12 months? Destination ${port}.`,
        bodyZh: `谈价格之前：这只货号有没有 12 个月内的英文 LFGB / 1935/2004？目的港 ${port}。`,
        tags: ['LFGB', '认证党'],
      }
    case 'cert_fda':
      return {
        subject: `FDA food contact — utensil set to ${port}`,
        body: `We buy for ${c.country}. Quote 6pcs stainless set, 40HQ FOB Ningbo or CIF ${port}. Must confirm FDA food-contact report for this SKU.`,
        bodyZh: `我们买给 ${c.country}。请报 6 件套，40HQ FOB 宁波或 CIF ${port}。必须确认本货号 FDA 食品接触报告。`,
        tags: ['FDA', '认证党'],
      }
    case 'sample':
      return {
        subject: `Samples first — then container`,
        body: `Send 2 sets to ${c.city} first. If finish and weight are OK we discuss 40HQ to ${port}. ${cert} preferred.`,
        bodyZh: `先寄 2 套到 ${c.city}。做工和克重可以再谈 40HQ 到 ${port}。希望有 ${cert}。`,
        tags: ['样品先行'],
      }
    case 'accept':
      return {
        subject: `Clean offer please — 40HQ ${port}`,
        body: `Please send FOB Ningbo and CIF ${port} for KS-304-6, 40HQ, ${cert}, 30/70 T/T. If terms are clear we can move to PI.`,
        bodyZh: `请报 KS-304-6 的 FOB 宁波和 CIF ${port}，40HQ，${cert}，30/70 电汇。条款清楚就可以出 PI。`,
        tags: ['痛快型', '整柜'],
      }
    case 'ghost':
      return {
        subject: `Checking 6pcs set — ${c.country}`,
        body: `Please send a quotation for 6pcs stainless kitchen set, one container to ${port}. We will review internally.`,
        bodyZh: `请报 6 件套不锈钢厨具，一柜到 ${port}。我们内部看一下。`,
        tags: ['可能不回'],
      }
    case 'private_label':
      return {
        subject: `Private label box — sticker or print?`,
        body: `We need neutral box, our logo sticker first, later printed box. Quote 40HQ CIF ${port}. Tell us MOQ for printed carton.`,
        bodyZh: `先要中性盒+我们 logo 贴纸，以后再印刷盒。请报 40HQ CIF ${port}。告知印刷彩盒起订量。`,
        tags: ['贴牌', '彩盒'],
      }
    case 'large_me':
      return {
        subject: `40HQ to ${port} — monthly repeat possible`,
        body: `We distribute in ${c.country}. Quote 6pcs set, 1x40HQ CIF ${port} or FOB Ningbo. Food contact ${cert}. Repeat order if first container is clean.`,
        bodyZh: `我们在 ${c.country} 做分销。请报 6 件套，1×40HQ CIF ${port} 或 FOB 宁波。食品接触 ${cert}。第一柜顺利可返单。`,
        tags: ['中东整柜', cert],
      }
    default:
      return {
        subject: `RFQ kitchen utensil set`,
        body: `Please quote 6pcs stainless utensil set to ${port}.`,
        bodyZh: `请报 6 件套不锈钢厨具到 ${port}。`,
        tags: ['询价'],
      }
  }
}

export function inquiryOpeningZh(customer) {
  if (!customer) return ''
  return openingMail(customer).bodyZh || ''
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function addDaysISO(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
