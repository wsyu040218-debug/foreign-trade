export function scoreDeal(inquiry, quote) {
  if (!inquiry) return { items: [], passed: 0, total: 0 }
  const msgs = inquiry.messages || []
  const firstYou = msgs.find((m) => m.from === 'you')
  const askedFirst = Boolean(
    firstYou &&
      !/^quotation sent/i.test(firstYou.text || '') &&
      !/^updated quotation/i.test(firstYou.text || ''),
  )
  const textAll = msgs
    .filter((m) => m.from === 'you')
    .map((m) => `${m.text} ${m.textZh || ''}`.toLowerCase())
    .join('\n')
  const refusedDdp =
    Boolean(inquiry.negotiation?.refuseDdp) ||
    textAll.includes('not quote ddp') ||
    textAll.includes('will not quote ddp') ||
    textAll.includes('no ddp') ||
    (textAll.includes('不报') && textAll.includes('ddp'))
  const lclOk = inquiry.fullContainer || quote == null || quote.sellCif == null

  const items = [
    {
      ok: askedFirst,
      title: '先问清再报价',
      why: askedFirst ? '第一封不是直接甩单价。' : '第一封就是报价。应先问数量、港口、认证、包装、付款。',
    },
    {
      ok: refusedDdp,
      title: '拒绝门口价 DDP',
      why: refusedDdp ? '信里或底线里拒绝了 DDP。' : '没有拒 DDP。练习里应写明不报门口价。',
    },
    {
      ok: lclOk,
      title: '不够一柜不报整柜 CIF',
      why: lclOk
        ? inquiry.fullContainer
          ? '这票是整柜，可以报 CIF。'
          : '小单只报了 FOB。'
        : '小单套了整柜 CIF，买家运费会对不上。',
    },
  ]
  return { items, passed: items.filter((i) => i.ok).length, total: items.length }
}
