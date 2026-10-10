export function buyerReplyCount(inquiry) {
  return (inquiry.messages || []).filter((m) => m.from === 'buyer').length
}

function lastYouText(inquiry) {
  const lastYou = [...(inquiry.messages || [])].reverse().find((m) => m.from === 'you')
  return `${lastYou?.text || ''}`.toLowerCase()
}

function youMentioned(inquiry, words) {
  const text = lastYouText(inquiry)
  return words.some((w) => text.includes(w.toLowerCase()))
}

function askedFullBrief(inquiry) {
  const t = lastYouText(inquiry)
  const numbered = t.includes('1)') && t.includes('2)') && t.includes('3)')
  const topics = [
    youMentioned(inquiry, ['quantity', 'qty', '40hq', '1200', 'lcl', 'trial']),
    youMentioned(inquiry, ['destination', 'port', 'cif', 'fob']),
    youMentioned(inquiry, ['lfgb', 'fda', '1935', 'certif', 'report', 'food contact']),
    youMentioned(inquiry, ['pack', 'box', 'sticker', 'printed', 'neutral', 'logo']),
    youMentioned(inquiry, ['payment', '30%', '30/70', 't/t', 'ddp', 'deposit']),
  ].filter(Boolean).length
  return numbered || topics >= 3 || t.includes('before i send a firm')
}

function isQuestion(inquiry) {
  const t = lastYouText(inquiry)
  if (!t) return false
  if (t.startsWith('quotation sent') || t.startsWith('updated quotation')) return false
  return (
    t.includes('?') ||
    t.includes('please confirm') ||
    t.includes('before i quote') ||
    t.includes('before i send') ||
    t.includes('can you') ||
    t.includes('do you need') ||
    askedFullBrief(inquiry) ||
    youMentioned(inquiry, ['quantity', 'destination', 'certif', 'packing', 'payment', 'ddp', 'sample', 'lead time'])
  )
}

function answerQuestion(customer, inquiry, dest) {
  if (askedFullBrief(inquiry)) return fullConfirm(customer, inquiry, dest)
  if (youMentioned(inquiry, ['quantity', 'qty', '40hq', '1200', 'lcl', 'trial'])) {
    return {
      kind: 'confirm_qty',
      status: 'clarifying',
      text: inquiry.fullContainer
        ? `Yes, one 40'HQ, about 17,800 sets, to ${dest}.`
        : `Yes, only 1,200 sets for a trial. Please treat it as LCL, not a container.`,
      zh: inquiry.fullContainer
        ? `是的，一个 40 尺柜，约 17,800 套，目的港 ${dest}。`
        : `是的，只要试单 1,200 套，按拼箱，不要套整柜。`,
    }
  }
  if (youMentioned(inquiry, ['destination', 'port', 'jebel', 'hamburg', 'rotterdam']) && !youMentioned(inquiry, ['quotation sent'])) {
    return {
      kind: 'confirm_port',
      status: 'clarifying',
      text: `Destination is ${dest}. CIF ${dest} if you have a real ocean rate; otherwise FOB Ningbo is fine.`,
      zh: `目的港是 ${dest}。有真实海运价可报 CIF ${dest}，否则报 FOB 宁波即可。`,
    }
  }
  if (youMentioned(inquiry, ['lfgb', 'fda', '1935', 'certif', 'report', 'food contact'])) {
    return {
      kind: 'confirm_cert',
      status: 'clarifying',
      text: `We need ${customer.cert || 'food-contact'} on this exact SKU, English, last 12 months. Please confirm you can issue it.`,
      zh: `我们要本货号 ${customer.cert || '食品接触'} 英文报告，12 个月内。请确认你们能出。`,
    }
  }
  if (youMentioned(inquiry, ['pack', 'box', 'sticker', 'printed', 'neutral', 'logo'])) {
    return {
      kind: 'confirm_box',
      status: 'clarifying',
      text: `First container: neutral box + our sticker. Printed box later if the trial is clean.`,
      zh: `第一柜：中性盒 + 我们的贴纸。试单顺利后再谈印刷盒。`,
    }
  }
  if (youMentioned(inquiry, ['payment', '30%', '30/70', 't/t', 'ddp', 'deposit'])) {
    return {
      kind: 'confirm_pay',
      status: 'clarifying',
      text: `30% T/T against PI, 70% against copy of B/L is OK. No DDP. After we align, send the unit price.`,
      zh: `可以：PI 后 30% 电汇，见提单副本 70%。不要 DDP。对齐后请发单价。`,
    }
  }
  if (youMentioned(inquiry, ['confirm', 'before i send', 'please confirm', 'can you confirm'])) {
    return {
      kind: 'confirm',
      status: 'clarifying',
      text: `Confirmed: ${inquiry.qtyLabel} to ${dest}, ${customer.cert || 'food contact'} on this item. Neutral box + sticker. 30/70 T/T. Please send FOB / CIF now.`,
      zh: `确认：${inquiry.qtyLabel}，目的港 ${dest}，要本货号 ${customer.cert || '食品接触'}。中性盒+贴纸。30/70。请发 FOB / CIF。`,
    }
  }
  return {
    kind: 'nudge',
    status: inquiry.status === 'new' ? 'new' : inquiry.status,
    text: `Got it. Qty ${inquiry.qtyLabel}, dest ${dest}, ${customer.cert || 'cert'} on this item. What else do you need confirmed?`,
    zh: `收到。数量 ${inquiry.qtyLabel}，目的港 ${dest}，要本货号 ${customer.cert || '认证'}。还有要确认的请继续问。`,
  }
}

function askForPi(inquiry, quote, dest) {
  const fob = quote?.sellFob
  const cif = quote?.sellCif
  return {
    kind: 'accept',
    status: 'won',
    text: `Terms are clear. Please send the PI: ${
      cif != null ? `CIF ${quote.cifPort || dest} ${Number(cif).toFixed(2)}` : `FOB Ningbo ${Number(fob).toFixed(2)}`
    }, 30/70, ${inquiry.qtyLabel}.`,
    zh: `条款清楚。请出形式发票：${
      cif != null ? `CIF ${quote.cifPort || dest} ${Number(cif).toFixed(2)}` : `FOB 宁波 ${Number(fob).toFixed(2)}`
    }，30/70，${inquiry.qtyLabel}。`,
  }
}

function fullConfirm(customer, inquiry, dest) {
  const qty = inquiry.fullContainer
    ? `one 40'HQ (~17,800 sets)`
    : `1,200 sets LCL trial (not a container)`
  const cert = customer.cert || 'food-contact'
  return {
    kind: 'confirm_all',
    status: 'clarifying',
    text: `Answers to all points:\n1) Qty: ${qty}, destination ${dest}.\n2) CIF ${dest} if your ocean rate is real; otherwise FOB Ningbo.\n3) ${cert} on this exact SKU, English, last 12 months — required.\n4) Neutral box + our sticker for the first container; printed box later.\n5) 30% T/T against PI, 70% against copy of B/L. No DDP.\nPlease send FOB / CIF now.`,
    zh: `五点一并回复：\n1）数量：${inquiry.fullContainer ? '1×40HQ，约 17,800 套' : '试单 1,200 套，按拼箱，不是整柜'}，目的港 ${dest}。\n2）有真实海运价可报 CIF ${dest}，否则报 FOB 宁波。\n3）必须提供本货号 ${cert} 英文报告，12 个月内。\n4）首柜中性盒+我方贴纸，印刷盒以后再说。\n5）PI 后付 30% T/T，见提单副本付 70%。不接受 DDP。\n请现在发 FOB / CIF 单价。`,
  }
}

export function decideBuyerReply(customer, inquiry, quote) {
  if (!inquiry || !customer) return { kind: 'none' }
  const afterInitial = buyerReplyCount(inquiry) - 1
  const fob = quote?.sellFob
  const cif = quote?.sellCif
  const hasQuote = fob != null

  const nego = inquiry.negotiation || {}
  const persona = customer.persona
  const dest = customer.port || 'Hamburg'
  const saidCert = youMentioned(inquiry, ['lfgb', 'fda', '1935', 'food contact', 'report'])
  const saidDdp = youMentioned(inquiry, ['ddp', 'not ddp', 'not included']) || nego.refuseDdp
  const saidSample = youMentioned(inquiry, ['sample', 'dhl', '2 sets']) || nego.sampleFreightCollect

  if (persona === 'ghost' && afterInitial === 0 && !isQuestion(inquiry) && Math.random() < 0.35) {
    return { kind: 'ghost' }
  }

  const last = lastYouText(inquiry)
  const looksLikeOffer =
    last.includes('usd') &&
    (last.includes('quotation') || last.includes('offer') || last.includes('i can move') || last.startsWith('quotation'))

  if (inquiry.status === 'closed') {
    return {
      kind: 'ack_done',
      status: 'closed',
      text: `Balance received. File closed on our side. Thank you.`,
      zh: `尾款已到。我们这边关档了。谢谢。`,
    }
  }
  if (inquiry.status === 'bl_out') {
    return {
      kind: 'ack_bl',
      status: 'bl_out',
      text: `B/L copy is with accounts. 70% T/T will go out shortly.`,
      zh: `提单副本财务已收到。70% 电汇马上出。`,
    }
  }
  if (inquiry.status === 'docs_ready' || inquiry.status === 'in_production') {
    return {
      kind: 'ack_prod',
      status: inquiry.status,
      text: `Deposit is in. We wait for B/L copy before the 70%. Qty stays ${inquiry.qtyLabel}.`,
      zh: `定金已到。等提单副本再付 70%。数量仍按 ${inquiry.qtyLabel}。`,
    }
  }
  if (inquiry.piId) {
    return {
      kind: 'ack_pi',
      status: 'pi_issued',
      text: `We have the PI. Accounts will send 30% T/T. Qty stays ${inquiry.qtyLabel}.`,
      zh: `PI 收到了。财务会打 30% 电汇。数量仍按 ${inquiry.qtyLabel}。`,
    }
  }

  if (inquiry.status === 'won' && hasQuote) {
    return askForPi(inquiry, quote, dest)
  }

  if (!hasQuote || (isQuestion(inquiry) && !looksLikeOffer)) {
    return answerQuestion(customer, inquiry, dest)
  }

  if (persona === 'small') {
    if (cif != null) {
      return {
        kind: 'push_fob',
        status: 'negotiating',
        text: `1,200 sets is not a container. Please do not use your 40HQ CIF. Quote FOB Ningbo only, we will book LCL to ${dest}.`,
        zh: `1,200 套不是整柜，不要套 40HQ 的 CIF。只报 FOB 宁波，我们拼箱到 ${dest}。`,
      }
    }
    if (hasQuote && afterInitial >= 1) {
      return {
        kind: 'accept',
        status: 'won',
        text: `FOB ${Number(fob).toFixed(2)} works for this trial. Please send the PI for 1,200 sets FOB Ningbo.`,
        zh: `试单可以接受 FOB ${Number(fob).toFixed(2)}。请出 1,200 套 FOB 宁波的 PI。`,
      }
    }
    return {
      kind: 'ask_fob',
      status: 'negotiating',
      text: `Understood on quantity. Please send FOB Ningbo and carton CBM so our forwarder can price LCL to ${dest}.`,
      zh: `数量明白了。请报 FOB 宁波和纸箱立方，我们货代好算拼箱到 ${dest}。`,
    }
  }

  if (persona === 'cert_lfgb' && !saidCert) {
    return {
      kind: 'ask_cert',
      status: 'negotiating',
      text: `Price later. First: LFGB / 1935/2004 on THIS item, English PDF, date within 12 months. Without that we stop.`,
      zh: `价格以后再说。先要本货号 LFGB / 1935/2004 英文 PDF，12 个月内。没有就停。`,
    }
  }
  if (persona === 'cert_fda' && !saidCert) {
    return {
      kind: 'ask_cert',
      status: 'negotiating',
      text: `We need FDA food-contact for this SKU before we compare numbers. Can you send the report?`,
      zh: `比价前先要本货号 FDA 食品接触报告。能发吗？`,
    }
  }

  if (persona === 'ddp' && !saidDdp && afterInitial < 2) {
    return {
      kind: 'ask_ddp',
      status: 'negotiating',
      text: `Thanks. Can you do DDP ${customer.city}? Our warehouse needs a door price, not only CIF ${dest}.`,
      zh: `谢谢。能做 DDP ${customer.city} 吗？仓库要门口价，不要只有 CIF ${dest}。`,
    }
  }
  if (persona === 'ddp' && saidDdp && hasQuote) {
    return {
      kind: 'accept_cif',
      status: 'won',
      text: `OK, we will use our forwarder. Please send PI on CIF ${quote.cifPort || dest}${cif != null ? ` ${Number(cif).toFixed(2)}` : ''} / FOB ${Number(fob).toFixed(2)}.`,
      zh: `行，我们用自己的货代。请按 CIF ${quote.cifPort || dest}${cif != null ? ` ${Number(cif).toFixed(2)}` : ''} / FOB ${Number(fob).toFixed(2)} 出 PI。`,
    }
  }

  if (persona === 'sample' && !saidSample) {
    return {
      kind: 'ask_sample',
      status: 'negotiating',
      text: `Send 2 sets to ${customer.city} first. Freight collect is fine. We will not book a container on photos only.`,
      zh: `先寄 2 套到 ${customer.city}，运费到付可以。只看照片我们不下柜。`,
    }
  }

  if (persona === 'bargain') {
    const target = cif != null ? cif : fob
    if (hasQuote && target > 5.9 && afterInitial < 2) {
      const cut = (target * 0.92).toFixed(2)
      return {
        kind: 'cut',
        status: 'negotiating',
        text: `Your number is high versus other China offers. Can you do USD ${cut} ${cif != null ? `CIF ${dest}` : 'FOB Ningbo'} if we take the full qty?`,
        zh: `你们的价比其他中国工厂高。整柜的话能否做到 ${cut} ${cif != null ? `CIF ${dest}` : 'FOB 宁波'}？`,
      }
    }
    if (hasQuote) {
      return {
        kind: 'accept',
        status: 'won',
        text: `We can live with this if 304 and packing stay as quoted. Please send the PI.`,
        zh: `材质和包装不变的话，这个价可以。请出 PI。`,
      }
    }
  }

  if (persona === 'private_label') {
    if (!youMentioned(inquiry, ['sticker', 'printed', 'moq', 'box', 'neutral'])) {
      return {
        kind: 'ask_box',
        status: 'negotiating',
        text: `Need sticker-on-neutral-box MOQ and printed-box MOQ in writing before we compare price.`,
        zh: `比价前先书面确认：贴纸中性盒起订量，以及印刷盒起订量。`,
      }
    }
    if (hasQuote) {
      return {
        kind: 'accept',
        status: 'won',
        text: `Sticker box for the first container is fine. Please send PI.`,
        zh: `第一柜贴纸盒可以。请出 PI。`,
      }
    }
  }

  if ((persona === 'accept' || persona === 'large_me') && hasQuote) {
    const ok = (cif != null && cif <= 6.6) || (cif == null && fob <= 6.3)
    if (ok) {
      return askForPi(inquiry, quote, dest)
    }
    return {
      kind: 'cut',
      status: 'negotiating',
      text: `A bit high for our market. If you can come closer to 6.20 CIF / 5.90 FOB we will take the container.`,
      zh: `对我们市场偏高。如果能靠近 6.20 CIF / 5.90 FOB，我们就下这一柜。`,
    }
  }

  if (persona === 'ghost' && hasQuote) {
    return {
      kind: 'soft',
      status: 'negotiating',
      text: `We received it. I will check with purchasing and come back.`,
      zh: `收到了。我跟采购确认后再回你。`,
    }
  }

  if (hasQuote && afterInitial >= 2) {
    return {
      kind: 'accept',
      status: 'won',
      text: `Let's proceed. Please issue the PI with the last numbers you sent.`,
      zh: `那就按你最后报的数字出 PI 吧。`,
    }
  }

  if (!hasQuote) {
    return {
      kind: 'nudge',
      status: 'new',
      text: `Please send unit price FOB Ningbo${inquiry.fullContainer ? ` and CIF ${dest}` : ' only (LCL, not container CIF)'} plus lead time.`,
      zh: `请发 FOB 宁波${inquiry.fullContainer ? ` 和 CIF ${dest}` : '（只要 FOB，不要整柜 CIF）'} 单价和交期。`,
    }
  }

  return {
    kind: 'ack',
    status: 'negotiating',
    text: `Noted. We will review and reply.`,
    zh: `知道了。我们看完再回。`,
  }
}

export function applyBuyerDecision(state, inquiry, result, addFollowup) {
  if (!result || result.kind === 'none') return
  if (result.kind === 'ghost') {
    inquiry.unread = false
    inquiry.ghosted = true
    addFollowup(state, {
      customerId: inquiry.customerId,
      inquiryId: inquiry.id,
      day: 3,
      note: '已读未回',
    })
    return
  }
  inquiry.messages = inquiry.messages || []
  inquiry.messages.push({ at: new Date().toISOString(), from: 'buyer', text: result.text, textZh: result.zh || '' })
  inquiry.unread = true
  inquiry.body = result.text
  if (result.status) {
    const locked = ['in_production', 'docs_ready', 'bl_out', 'closed']
    if (locked.includes(inquiry.status)) {
      /* keep fulfillment */
    } else if (inquiry.piId) inquiry.status = 'pi_issued'
    else if (inquiry.status === 'won' && result.status === 'clarifying') {
      /* keep won */
    } else inquiry.status = result.status
  }
}
