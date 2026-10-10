export const TEMPLATES = {
  clarify: {
    label: '先问清（不报价）',
    build({ customer, product, destPort, qtyLabel, cert }) {
      return `Hi ${customer.name.split(' ')[0]},

Thanks for the inquiry on ${product.sku}. Before I send a firm unit price, please confirm:

1) Quantity: ${qtyLabel} — full 40HQ or trial / LCL?
2) Destination: CIF ${destPort} or FOB Ningbo only?
3) Certification: ${cert} on this exact item, English report?
4) Packing: neutral box + sticker, or printed box (MOQ)?
5) Payment: 30% T/T with PI, 70% against copy of B/L. We do not quote DDP from here.

I will send FOB / CIF after you confirm the above.

Best regards`
    },
    buildZh({ destPort, qtyLabel, cert }) {
      return `报价前请确认：
1）数量：${qtyLabel} — 整柜还是试单/拼箱？
2）目的港：CIF ${destPort} 还是只报 FOB 宁波？
3）认证：本货号 ${cert} 英文报告？
4）包装：中性盒+贴纸，还是印刷盒（起订量）？
5）付款：PI 后 30% 电汇，见提单副本 70%。我们这边不报 DDP。
你确认后我再发 FOB / CIF。`
    },
  },
  inquiry: {
    label: '询盘回复',
    build({ customer, product, sellFob, sellCif, fobPort, cifPort, leadDays }) {
      return `Hi ${customer.name.split(' ')[0]},

Thanks for reaching out. For supermarket and foodservice in Germany, I would quote a 6-piece SUS304 set with satin finish, not 201.

Item ${product.sku}: ${product.name}. Neutral color box, your sticker or printed logo. We can arrange LFGB testing on this item.

  USD ${sellCif ?? '—'} / set  CIF ${cifPort}
  USD ${sellFob ?? '—'} / set  FOB ${fobPort}

Payment: 30% T/T down, 70% T/T against copy of B/L
Lead time: ${leadDays} days after deposit and artwork confirmed
Offer valid 7 days

Could you confirm sticker vs printed box, and palletized or floor loaded?

Best regards`
    },
  },
  quote: {
    label: '报价说明',
    build({ product, sellFob, sellCif, fobPort, cifPort, qtyLabel, leadDays }) {
      return `Hi,

Please find our offer for ${product.sku}.

Qty: ${qtyLabel}
  USD ${sellCif ?? '—'} / set  CIF ${cifPort}
  USD ${sellFob ?? '—'} / set  FOB ${fobPort}

Packing: ${product.packing}
Payment: 30% T/T down, 70% T/T against copy of B/L
Lead time: ${leadDays} days after deposit and artwork confirmed
Validity: 7 days (ocean freight)

Not included: German import duty, VAT, destination charges. This is not DDP.

Best regards`
    },
  },
  outreach: {
    label: '开发信',
    build({ product, fobPort, cifPort }) {
      return `Hi,

I looked at your stainless cooking tools range. I handle OEM for ${product.sku} (${product.material}, neutral box). We can run LFGB on the actual item and ship FOB ${fobPort} or CIF ${cifPort}.

If a trial 40'HQ is in your plan this season, I can send spec + carton size tomorrow.

Best regards`
    },
  },
  nego: {
    label: '砍价 / DDP 回复',
    build({ sellCif, cifPort, leadDays }) {
      return `Hi,

Straight answers below.

Price
I can move to USD ${sellCif ?? '5.95'} / set CIF ${cifPort} if we keep SUS304, you take the full 40'HQ, and we use sticker logo. I will not switch to 201.

Samples
I can send 2 sets. I waive the unit charge; please take DHL freight collect. Deductible from bulk.

DDP
I will not quote DDP from here. Please compare my CIF ${cifPort} with your forwarder. EORI + postcode needed before any door price.

Lead time
15 days is not realistic for 304 with confirmed artwork. We ship in ${leadDays} days after deposit and box confirmation.

If this works, I will send the PI today.

Best regards`
    },
  },
}
