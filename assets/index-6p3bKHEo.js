(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=t(o);fetch(o.href,a)}})();function gt(e){return(e.messages||[]).filter(n=>n.from==="buyer").length}function j(e){const n=[...e.messages||[]].reverse().find(t=>t.from==="you");return`${(n==null?void 0:n.text)||""}`.toLowerCase()}function P(e,n){const t=j(e);return n.some(s=>t.includes(s.toLowerCase()))}function it(e){const n=j(e),t=n.includes("1)")&&n.includes("2)")&&n.includes("3)"),s=[P(e,["quantity","qty","40hq","1200","lcl","trial"]),P(e,["destination","port","cif","fob"]),P(e,["lfgb","fda","1935","certif","report","food contact"]),P(e,["pack","box","sticker","printed","neutral","logo"]),P(e,["payment","30%","30/70","t/t","ddp","deposit"])].filter(Boolean).length;return t||s>=3||n.includes("before i send a firm")}function st(e){const n=j(e);return!n||n.startsWith("quotation sent")||n.startsWith("updated quotation")?!1:n.includes("?")||n.includes("please confirm")||n.includes("before i quote")||n.includes("before i send")||n.includes("can you")||n.includes("do you need")||it(e)||P(e,["quantity","destination","certif","packing","payment","ddp","sample","lead time"])}function yt(e,n,t){return it(n)?It(e,n,t):P(n,["quantity","qty","40hq","1200","lcl","trial"])?{kind:"confirm_qty",status:"clarifying",text:n.fullContainer?`Yes, one 40'HQ, about 17,800 sets, to ${t}.`:"Yes, only 1,200 sets for a trial. Please treat it as LCL, not a container.",zh:n.fullContainer?`是的，一个 40 尺柜，约 17,800 套，目的港 ${t}。`:"是的，只要试单 1,200 套，按拼箱，不要套整柜。"}:P(n,["destination","port","jebel","hamburg","rotterdam"])&&!P(n,["quotation sent"])?{kind:"confirm_port",status:"clarifying",text:`Destination is ${t}. CIF ${t} if you have a real ocean rate; otherwise FOB Ningbo is fine.`,zh:`目的港是 ${t}。有真实海运价可报 CIF ${t}，否则报 FOB 宁波即可。`}:P(n,["lfgb","fda","1935","certif","report","food contact"])?{kind:"confirm_cert",status:"clarifying",text:`We need ${e.cert||"food-contact"} on this exact SKU, English, last 12 months. Please confirm you can issue it.`,zh:`我们要本货号 ${e.cert||"食品接触"} 英文报告，12 个月内。请确认你们能出。`}:P(n,["pack","box","sticker","printed","neutral","logo"])?{kind:"confirm_box",status:"clarifying",text:"First container: neutral box + our sticker. Printed box later if the trial is clean.",zh:"第一柜：中性盒 + 我们的贴纸。试单顺利后再谈印刷盒。"}:P(n,["payment","30%","30/70","t/t","ddp","deposit"])?{kind:"confirm_pay",status:"clarifying",text:"30% T/T against PI, 70% against copy of B/L is OK. No DDP. After we align, send the unit price.",zh:"可以：PI 后 30% 电汇，见提单副本 70%。不要 DDP。对齐后请发单价。"}:P(n,["confirm","before i send","please confirm","can you confirm"])?{kind:"confirm",status:"clarifying",text:`Confirmed: ${n.qtyLabel} to ${t}, ${e.cert||"food contact"} on this item. Neutral box + sticker. 30/70 T/T. Please send FOB / CIF now.`,zh:`确认：${n.qtyLabel}，目的港 ${t}，要本货号 ${e.cert||"食品接触"}。中性盒+贴纸。30/70。请发 FOB / CIF。`}:{kind:"nudge",status:n.status==="new"?"new":n.status,text:`Got it. Qty ${n.qtyLabel}, dest ${t}, ${e.cert||"cert"} on this item. What else do you need confirmed?`,zh:`收到。数量 ${n.qtyLabel}，目的港 ${t}，要本货号 ${e.cert||"认证"}。还有要确认的请继续问。`}}function ot(e,n,t){const s=n==null?void 0:n.sellFob,o=n==null?void 0:n.sellCif;return{kind:"accept",status:"won",text:`Terms are clear. Please send the PI: ${o!=null?`CIF ${n.cifPort||t} ${Number(o).toFixed(2)}`:`FOB Ningbo ${Number(s).toFixed(2)}`}, 30/70, ${e.qtyLabel}.`,zh:`条款清楚。请出形式发票：${o!=null?`CIF ${n.cifPort||t} ${Number(o).toFixed(2)}`:`FOB 宁波 ${Number(s).toFixed(2)}`}，30/70，${e.qtyLabel}。`}}function It(e,n,t){const s=n.fullContainer?"one 40'HQ (~17,800 sets)":"1,200 sets LCL trial (not a container)",o=e.cert||"food-contact";return{kind:"confirm_all",status:"clarifying",text:`Answers to all points:
1) Qty: ${s}, destination ${t}.
2) CIF ${t} if your ocean rate is real; otherwise FOB Ningbo.
3) ${o} on this exact SKU, English, last 12 months — required.
4) Neutral box + our sticker for the first container; printed box later.
5) 30% T/T against PI, 70% against copy of B/L. No DDP.
Please send FOB / CIF now.`,zh:`五点一并回复：
1）数量：${n.fullContainer?"1×40HQ，约 17,800 套":"试单 1,200 套，按拼箱，不是整柜"}，目的港 ${t}。
2）有真实海运价可报 CIF ${t}，否则报 FOB 宁波。
3）必须提供本货号 ${o} 英文报告，12 个月内。
4）首柜中性盒+我方贴纸，印刷盒以后再说。
5）PI 后付 30% T/T，见提单副本付 70%。不接受 DDP。
请现在发 FOB / CIF 单价。`}}function Ft(e,n,t){if(!n||!e)return{kind:"none"};const s=gt(n)-1,o=t==null?void 0:t.sellFob,a=t==null?void 0:t.sellCif,i=o!=null,d=n.negotiation||{},c=e.persona,l=e.port||"Hamburg",b=P(n,["lfgb","fda","1935","food contact","report"]),$=P(n,["ddp","not ddp","not included"])||d.refuseDdp,C=P(n,["sample","dhl","2 sets"])||d.sampleFreightCollect;if(c==="ghost"&&s===0&&!st(n)&&Math.random()<.35)return{kind:"ghost"};const m=j(n),y=m.includes("usd")&&(m.includes("quotation")||m.includes("offer")||m.includes("i can move")||m.startsWith("quotation"));if(n.status==="closed")return{kind:"ack_done",status:"closed",text:"Balance received. File closed on our side. Thank you.",zh:"尾款已到。我们这边关档了。谢谢。"};if(n.status==="bl_out")return{kind:"ack_bl",status:"bl_out",text:"B/L copy is with accounts. 70% T/T will go out shortly.",zh:"提单副本财务已收到。70% 电汇马上出。"};if(n.status==="docs_ready"||n.status==="in_production")return{kind:"ack_prod",status:n.status,text:`Deposit is in. We wait for B/L copy before the 70%. Qty stays ${n.qtyLabel}.`,zh:`定金已到。等提单副本再付 70%。数量仍按 ${n.qtyLabel}。`};if(n.piId)return{kind:"ack_pi",status:"pi_issued",text:`We have the PI. Accounts will send 30% T/T. Qty stays ${n.qtyLabel}.`,zh:`PI 收到了。财务会打 30% 电汇。数量仍按 ${n.qtyLabel}。`};if(n.status==="won"&&i)return ot(n,t,l);if(!i||st(n)&&!y)return yt(e,n,l);if(c==="small")return a!=null?{kind:"push_fob",status:"negotiating",text:`1,200 sets is not a container. Please do not use your 40HQ CIF. Quote FOB Ningbo only, we will book LCL to ${l}.`,zh:`1,200 套不是整柜，不要套 40HQ 的 CIF。只报 FOB 宁波，我们拼箱到 ${l}。`}:i&&s>=1?{kind:"accept",status:"won",text:`FOB ${Number(o).toFixed(2)} works for this trial. Please send the PI for 1,200 sets FOB Ningbo.`,zh:`试单可以接受 FOB ${Number(o).toFixed(2)}。请出 1,200 套 FOB 宁波的 PI。`}:{kind:"ask_fob",status:"negotiating",text:`Understood on quantity. Please send FOB Ningbo and carton CBM so our forwarder can price LCL to ${l}.`,zh:`数量明白了。请报 FOB 宁波和纸箱立方，我们货代好算拼箱到 ${l}。`};if(c==="cert_lfgb"&&!b)return{kind:"ask_cert",status:"negotiating",text:"Price later. First: LFGB / 1935/2004 on THIS item, English PDF, date within 12 months. Without that we stop.",zh:"价格以后再说。先要本货号 LFGB / 1935/2004 英文 PDF，12 个月内。没有就停。"};if(c==="cert_fda"&&!b)return{kind:"ask_cert",status:"negotiating",text:"We need FDA food-contact for this SKU before we compare numbers. Can you send the report?",zh:"比价前先要本货号 FDA 食品接触报告。能发吗？"};if(c==="ddp"&&!$&&s<2)return{kind:"ask_ddp",status:"negotiating",text:`Thanks. Can you do DDP ${e.city}? Our warehouse needs a door price, not only CIF ${l}.`,zh:`谢谢。能做 DDP ${e.city} 吗？仓库要门口价，不要只有 CIF ${l}。`};if(c==="ddp"&&$&&i)return{kind:"accept_cif",status:"won",text:`OK, we will use our forwarder. Please send PI on CIF ${t.cifPort||l}${a!=null?` ${Number(a).toFixed(2)}`:""} / FOB ${Number(o).toFixed(2)}.`,zh:`行，我们用自己的货代。请按 CIF ${t.cifPort||l}${a!=null?` ${Number(a).toFixed(2)}`:""} / FOB ${Number(o).toFixed(2)} 出 PI。`};if(c==="sample"&&!C)return{kind:"ask_sample",status:"negotiating",text:`Send 2 sets to ${e.city} first. Freight collect is fine. We will not book a container on photos only.`,zh:`先寄 2 套到 ${e.city}，运费到付可以。只看照片我们不下柜。`};if(c==="bargain"){const x=a??o;if(i&&x>5.9&&s<2){const f=(x*.92).toFixed(2);return{kind:"cut",status:"negotiating",text:`Your number is high versus other China offers. Can you do USD ${f} ${a!=null?`CIF ${l}`:"FOB Ningbo"} if we take the full qty?`,zh:`你们的价比其他中国工厂高。整柜的话能否做到 ${f} ${a!=null?`CIF ${l}`:"FOB 宁波"}？`}}if(i)return{kind:"accept",status:"won",text:"We can live with this if 304 and packing stay as quoted. Please send the PI.",zh:"材质和包装不变的话，这个价可以。请出 PI。"}}if(c==="private_label"){if(!P(n,["sticker","printed","moq","box","neutral"]))return{kind:"ask_box",status:"negotiating",text:"Need sticker-on-neutral-box MOQ and printed-box MOQ in writing before we compare price.",zh:"比价前先书面确认：贴纸中性盒起订量，以及印刷盒起订量。"};if(i)return{kind:"accept",status:"won",text:"Sticker box for the first container is fine. Please send PI.",zh:"第一柜贴纸盒可以。请出 PI。"}}return(c==="accept"||c==="large_me")&&i?a!=null&&a<=6.6||a==null&&o<=6.3?ot(n,t,l):{kind:"cut",status:"negotiating",text:"A bit high for our market. If you can come closer to 6.20 CIF / 5.90 FOB we will take the container.",zh:"对我们市场偏高。如果能靠近 6.20 CIF / 5.90 FOB，我们就下这一柜。"}:c==="ghost"&&i?{kind:"soft",status:"negotiating",text:"We received it. I will check with purchasing and come back.",zh:"收到了。我跟采购确认后再回你。"}:i&&s>=2?{kind:"accept",status:"won",text:"Let's proceed. Please issue the PI with the last numbers you sent.",zh:"那就按你最后报的数字出 PI 吧。"}:i?{kind:"ack",status:"negotiating",text:"Noted. We will review and reply.",zh:"知道了。我们看完再回。"}:{kind:"nudge",status:"new",text:`Please send unit price FOB Ningbo${n.fullContainer?` and CIF ${l}`:" only (LCL, not container CIF)"} plus lead time.`,zh:`请发 FOB 宁波${n.fullContainer?` 和 CIF ${l}`:"（只要 FOB，不要整柜 CIF）"} 单价和交期。`}}function Pt(e,n,t,s){if(!(!t||t.kind==="none")){if(t.kind==="ghost"){n.unread=!1,n.ghosted=!0,s(e,{customerId:n.customerId,inquiryId:n.id,day:3,note:"已读未回"});return}n.messages=n.messages||[],n.messages.push({at:new Date().toISOString(),from:"buyer",text:t.text,textZh:t.zh||""}),n.unread=!0,n.body=t.text,t.status&&(["in_production","docs_ready","bl_out","closed"].includes(n.status)||(n.piId?n.status="pi_issued":n.status==="won"&&t.status==="clarifying"||(n.status=t.status)))}}const Q="p-ks304",Y="p-ks201",ct=[{id:Y,sku:"KS-201-6",name:"6 件套 201 不锈钢厨具（练习对照货号）",material:"SUS201，表价更低，德国大货不要当主供",packing:"PE 袋 + 旧款彩盒，12 套/箱",cbmPerSet:.0038,setsPerCarton:12,moq:1200,cert:"报告可能套用，不是本货号"}],lt=[{id:"f-c",name:"永康 201 线工厂 C",productId:Y,exw:3.55,inlandPerSet:.16,docsPerSet:.04,leadDays:20,lfgb:!1,recommended:!0,notes:"便宜。只能练对照价，不要当德国 304 主供。"}],Ct=[{id:"c-nord",name:"Nordküche Import GmbH",country:"德国",city:"Hamburg",channel:"超市 + 餐饮批发",persona:"ddp",port:"Hamburg",fullContainer:!0,cert:"LFGB",notes:"会砍价、要样品、要 DDP。"},{id:"c-lumen",name:"Lumen Hauswaren GmbH",country:"德国",city:"Bremen",channel:"区域批发",persona:"small",port:"Hamburg",fullContainer:!1,cert:"LFGB",notes:"先试 1200 套，不够一柜。"},{id:"c-roesle",name:"Nordstahl Tools GmbH",country:"德国",city:"Stuttgart",channel:"专业厨具品牌",persona:"cert_lfgb",port:"Hamburg",fullContainer:!0,cert:"LFGB",notes:"先问本货号检测报告。"},{id:"c-fackel",name:"Küchenallee Handel",country:"德国",city:"Nuremberg",channel:"家庭工具连锁",persona:"bargain",port:"Hamburg",fullContainer:!0,cert:"LFGB",notes:"对标价，默认砍 8%。"},{id:"c-brab",name:"Delta Home NL B.V.",country:"荷兰",city:"Amsterdam",channel:"家居零售",persona:"accept",port:"Rotterdam",fullContainer:!0,cert:"LFGB",notes:"条款清楚就下试单。"},{id:"c-tesc",name:"Central Cookware s.r.o.",country:"捷克",city:"Prague",channel:"欧洲分销",persona:"bargain",port:"Hamburg",fullContainer:!0,cert:"LFGB",notes:"要比三家再谈。"},{id:"c-jj",name:"Harbour Design Ltd",country:"英国",city:"London",channel:"设计厨具",persona:"private_label",port:"Felixstowe",fullContainer:!0,cert:"LFGB",notes:"要中性盒和 logo 位置。"},{id:"c-ems",name:"Rhein Haus GmbH",country:"德国",city:"Cologne",channel:"家居品牌",persona:"sample",port:"Hamburg",fullContainer:!0,cert:"LFGB",notes:"没看到样品不下柜。"},{id:"c-wmf",name:"Südmetall Beschaffung",country:"德国",city:"Geislingen",channel:"中高端采购",persona:"ghost",port:"Hamburg",fullContainer:!0,cert:"LFGB",notes:"回复慢，常已读不回。"},{id:"c-west",name:"Westmark Trading",country:"德国",city:"Lennestadt",channel:"厨房小工具",persona:"cert_lfgb",port:"Hamburg",fullContainer:!1,cert:"LFGB",notes:"小单也要报告。"},{id:"c-gefu",name:"Formküche GmbH",country:"德国",city:"Düsseldorf",channel:"设计厨具",persona:"sample",port:"Hamburg",fullContainer:!0,cert:"LFGB",notes:"要看砂光和厚度。"},{id:"c-metal",name:"Alpen Metaltex AG",country:"瑞士",city:"Zurich",channel:"金属厨房件",persona:"accept",port:"Hamburg",fullContainer:!0,cert:"LFGB",notes:"FOB 条款清楚即可。"},{id:"c-ae",name:"Gulf Kitchen Trading",country:"阿联酋",city:"Dubai",channel:"湾区批发",persona:"large_me",port:"Jebel Ali",fullContainer:!0,cert:"FDA",notes:"量大，不太啃 DDP。"},{id:"c-sa",name:"Riyadh Housewares Co.",country:"沙特",city:"Riyadh",channel:"商超进口",persona:"large_me",port:"Jeddah",fullContainer:!0,cert:"FDA",notes:"要整柜，交期可谈。"},{id:"c-pl",name:"Warsaw Kitchen Sp. z o.o.",country:"波兰",city:"Warsaw",channel:"中欧批发",persona:"bargain",port:"Gdansk",fullContainer:!0,cert:"LFGB",notes:"预算紧，会问 201。",productId:Y},{id:"c-fr",name:"Atelier Cuisine SAS",country:"法国",city:"Lyon",channel:"餐饮供应",persona:"ddp",port:"Le Havre",fullContainer:!0,cert:"LFGB",notes:"习惯问门口价。"},{id:"c-es",name:"Iberia Hogar S.L.",country:"西班牙",city:"Barcelona",channel:"零售进口",persona:"small",port:"Barcelona",fullContainer:!1,cert:"LFGB",notes:"先 1500 套试铺。"},{id:"c-it",name:"Cucina Nord srl",country:"意大利",city:"Milan",channel:"酒店用品",persona:"cert_lfgb",port:"Genoa",fullContainer:!0,cert:"LFGB",notes:"要英文报告。"},{id:"c-au",name:"Pacific Homewares Pty",country:"澳洲",city:"Sydney",channel:"零售进口",persona:"cert_fda",port:"Sydney",fullContainer:!0,cert:"FDA",notes:"要食品接触说明。"},{id:"c-us",name:"Midwest Kitchen Supply",country:"美国",city:"Chicago",channel:"餐饮批发",persona:"cert_fda",port:"Los Angeles",fullContainer:!0,cert:"FDA",notes:"先问 FDA，很少要 DDP。"},{id:"c-uk2",name:"Northline Imports Ltd",country:"英国",city:"Manchester",channel:"超市供货",persona:"bargain",port:"Felixstowe",fullContainer:!0,cert:"LFGB",notes:"要比价表。"},{id:"c-be",name:"Schelde Housewares BV",country:"比利时",city:"Antwerp",channel:"批发",persona:"ghost",port:"Antwerp",fullContainer:!0,cert:"LFGB",notes:"询完可能消失。"},{id:"c-se",name:"Nordic Pantry AB",country:"瑞典",city:"Gothenburg",channel:"北欧零售",persona:"private_label",port:"Gothenburg",fullContainer:!0,cert:"LFGB",notes:"要贴纸盒说明。"},{id:"c-tr",name:"Anadolu Mutfak A.S.",country:"土耳其",city:"Istanbul",channel:"区域进口",persona:"sample",port:"Istanbul",fullContainer:!0,cert:"LFGB",notes:"先看两套样品。"}],G={bargain:"硬砍价",ddp:"坚持 DDP",small:"小单试铺",cert_lfgb:"认证党 LFGB",cert_fda:"认证党 FDA",sample:"样品先行",accept:"条款清楚就下",ghost:"常已读不回",private_label:"贴牌细节党",large_me:"中东整柜"};function R(){const e=Ct.map(s=>({...s})),t=["c-nord","c-lumen","c-ae","c-us","c-brab"].map(s=>dt(e.find(o=>o.id===s),`i-${s}`));return{shipping:{oceanPer40hq:2200,usableCbm:68,insuranceRate:.003,fobPort:"Ningbo",cifPort:"Hamburg"},simDate:H(),customers:e,products:[{id:Q,sku:"KS-304-6",name:"6 件套 304 不锈钢厨具",material:"SUS304 砂光，铲面约 1.0 mm",packing:"PE 袋 + 中性彩盒，12 套/箱，可打托",cbmPerSet:.0038,setsPerCarton:12,moq:1200,cert:"LFGB / EU 1935/2004（按货号）"},...ct],factories:[{id:"f-a",name:"阳江 OEM 工厂 A",productId:Q,exw:4.85,inlandPerSet:.18,docsPerSet:.04,leadDays:30,lfgb:!0,recommended:!0,notes:"工作端+手柄 304，可按货号出 LFGB。交期稳，不是最低价。"},{id:"f-b",name:"永康现货型工厂 B",productId:Q,exw:4.35,inlandPerSet:.16,docsPerSet:.04,leadDays:15,lfgb:!1,recommended:!1,notes:"表价更低。报告可能套用，15 天多半是 201 或旧盒。德国大货不建议做主供。"},...lt],inquiries:t,quotes:[],pis:[],shipments:[],followups:[{id:"fu-d0",customerId:"c-nord",inquiryId:t[0].id,day:0,due:H(),done:!1,note:"新询盘尚未回复"}]}}function dt(e,n=`i-${e.id}-${Date.now()}`){const t=!!e.fullContainer,s=t?17800:1200,{subject:o,body:a,bodyZh:i,tags:d}=ut(e),c=new Date().toISOString();return{id:n,customerId:e.id,productId:e.productId||Q,qty:s,qtyLabel:t?"1 × 40HQ（约 17,800 套）":"1,200 套（不足一柜）",fullContainer:t,destPort:e.port,subject:o,body:a,status:"new",factoryId:null,quoteId:null,piId:null,tags:d,unread:!0,messages:[{at:c,from:"buyer",text:a,textZh:i}],negotiation:null,quoteErrors:[]}}function ut(e){const n=e.cert,t=e.port;switch(e.persona){case"ddp":return{subject:`Trial 40HQ to ${t} — can you do DDP?`,body:`Hi, we import kitchen tools for retail in ${e.city}. Please quote 6pcs stainless utensil set, private label, one 40'HQ.
Need ${n}. Can you offer DDP ${e.city}?`,bodyZh:`你好，我们在 ${e.city} 做零售厨具进口。请报 6 件套不锈钢厨具，贴牌，一个 40 尺柜。
需要 ${n}。能否报 DDP ${e.city}？`,tags:["整柜","要 DDP",n]};case"small":return{subject:"Small trial 1200 sets — same CIF as container?",body:`We only need 1,200 sets for a regional test in ${e.city}. Please quote CIF ${t} at your container unit price if possible.`,bodyZh:`我们在 ${e.city} 只要 1,200 套区域试铺。如果可以，请按整柜单价报 CIF ${t}。`,tags:["不足一柜","想套整柜 CIF"]};case"bargain":return{subject:"Need your best price — 6pcs SS set, 40HQ",body:`Please quote 6pcs 304 utensil set, 1x40HQ to ${t}. We already have offers from two other factories. Need your best number.`,bodyZh:`请报 6 件套 304 厨具，1×40HQ 到 ${t}。我们已经有两家工厂报价，要你们最低价。`,tags:["硬砍价","整柜"]};case"cert_lfgb":return{subject:"LFGB on this item? KS-304-6",body:`Before we talk price: do you have LFGB / 1935/2004 for this exact item, in English, last 12 months? Destination ${t}.`,bodyZh:`谈价格之前：这只货号有没有 12 个月内的英文 LFGB / 1935/2004？目的港 ${t}。`,tags:["LFGB","认证党"]};case"cert_fda":return{subject:`FDA food contact — utensil set to ${t}`,body:`We buy for ${e.country}. Quote 6pcs stainless set, 40HQ FOB Ningbo or CIF ${t}. Must confirm FDA food-contact report for this SKU.`,bodyZh:`我们买给 ${e.country}。请报 6 件套，40HQ FOB 宁波或 CIF ${t}。必须确认本货号 FDA 食品接触报告。`,tags:["FDA","认证党"]};case"sample":return{subject:"Samples first — then container",body:`Send 2 sets to ${e.city} first. If finish and weight are OK we discuss 40HQ to ${t}. ${n} preferred.`,bodyZh:`先寄 2 套到 ${e.city}。做工和克重可以再谈 40HQ 到 ${t}。希望有 ${n}。`,tags:["样品先行"]};case"accept":return{subject:`Clean offer please — 40HQ ${t}`,body:`Please send FOB Ningbo and CIF ${t} for KS-304-6, 40HQ, ${n}, 30/70 T/T. If terms are clear we can move to PI.`,bodyZh:`请报 KS-304-6 的 FOB 宁波和 CIF ${t}，40HQ，${n}，30/70 电汇。条款清楚就可以出 PI。`,tags:["痛快型","整柜"]};case"ghost":return{subject:`Checking 6pcs set — ${e.country}`,body:`Please send a quotation for 6pcs stainless kitchen set, one container to ${t}. We will review internally.`,bodyZh:`请报 6 件套不锈钢厨具，一柜到 ${t}。我们内部看一下。`,tags:["可能不回"]};case"private_label":return{subject:"Private label box — sticker or print?",body:`We need neutral box, our logo sticker first, later printed box. Quote 40HQ CIF ${t}. Tell us MOQ for printed carton.`,bodyZh:`先要中性盒+我们 logo 贴纸，以后再印刷盒。请报 40HQ CIF ${t}。告知印刷彩盒起订量。`,tags:["贴牌","彩盒"]};case"large_me":return{subject:`40HQ to ${t} — monthly repeat possible`,body:`We distribute in ${e.country}. Quote 6pcs set, 1x40HQ CIF ${t} or FOB Ningbo. Food contact ${n}. Repeat order if first container is clean.`,bodyZh:`我们在 ${e.country} 做分销。请报 6 件套，1×40HQ CIF ${t} 或 FOB 宁波。食品接触 ${n}。第一柜顺利可返单。`,tags:["中东整柜",n]};default:return{subject:"RFQ kitchen utensil set",body:`Please quote 6pcs stainless utensil set to ${t}.`,bodyZh:`请报 6 件套不锈钢厨具到 ${t}。`,tags:["询价"]}}}function at(e){return e&&ut(e).bodyZh||""}function H(){return new Date().toISOString().slice(0,10)}function kt(e){return M(H(),e)}function M(e,n){const t=new Date(`${e}T12:00:00`);return t.setDate(t.getDate()+Number(n||0)),t.toISOString().slice(0,10)}function wt(e){e.simDate||(e.simDate=H());const n=new Set((e.products||[]).map(s=>s.id));for(const s of ct)n.has(s.id)||e.products.push(s);const t=new Set((e.factories||[]).map(s=>s.id));for(const s of lt)t.has(s.id)||e.factories.push(s);return e}const E="ft-workbench-v2";function Z(e){return JSON.parse(JSON.stringify(e))}function St(){try{const e=localStorage.getItem(E);if(!e){const t=R();return localStorage.setItem(E,JSON.stringify(t)),Z(t)}const n=JSON.parse(e);return Array.isArray(n.shipments)||(n.shipments=[]),wt(n),xt(n),n}catch{const e=R();return localStorage.setItem(E,JSON.stringify(e)),Z(e)}}function h(e){localStorage.setItem(E,JSON.stringify(e))}function Dt(){const e=R();return localStorage.setItem(E,JSON.stringify(e)),Z(e)}function D(e,n){return e.customers.find(t=>t.id===n)}function O(e,n){return e.products.find(t=>t.id===n)}function A(e,n){return e.factories.find(t=>t.id===n)}function g(e,n){return e.inquiries.find(t=>t.id===n)}function B(e,n){return e.quotes.find(t=>t.id===n)}function vt(e,n,t){const s=g(e,n);!s||s.piId||(s.productId=t,s.factoryId=null,h(e))}function pt(e,n){return e.factories.filter(t=>t.productId===n)}function J(e){if(!e)return!1;if(e.quoteId||e.piId||["clarifying","quoted","negotiating","won","pi_issued","in_production","docs_ready","bl_out","closed"].includes(e.status))return!0;const n=e.messages||[],t=n.findIndex(s=>s.from==="you");return t<0?!1:n.slice(t+1).some(s=>s.from==="buyer")}function xt(e){for(const n of e.pis||[]){if(n.status==="awaiting_deposit"||(e.shipments||[]).some(o=>o.piId===n.id))continue;const t=g(e,n.inquiryId),s=n.status==="closed"||(t==null?void 0:t.status)==="closed";e.shipments.push({id:`sh-${n.id}`,piId:n.id,inquiryId:n.inquiryId,customerId:n.customerId,status:s?"closed":(t==null?void 0:t.status)==="bl_out"?"bl_out":(t==null?void 0:t.status)==="docs_ready"?"docs_ready":"in_production",depositOn:N(e),artworkOn:"",readyDate:"",ci:"",pl:"",createdAt:n.createdAt||new Date().toISOString()}),t&&t.status==="pi_issued"&&(t.status="in_production")}}function ft(e,n){const t=e.pis.find(o=>o.id===n);if(!t)return;t.status="deposit_in";const s=g(e,t.inquiryId);s&&(s.status="in_production"),e.shipments=e.shipments||[],e.shipments.some(o=>o.piId===n)||e.shipments.push({id:`sh-${Date.now()}`,piId:n,inquiryId:t.inquiryId,customerId:t.customerId,status:"in_production",depositOn:N(e),artworkOn:"",readyDate:"",ci:"",pl:"",createdAt:new Date().toISOString()}),_(e,{customerId:t.customerId,inquiryId:t.inquiryId,day:t.leadDays||30,note:"排产中，到期出具 CI / PL"}),h(e)}function W(e,n){return(e.shipments||[]).find(t=>t.id===n)}function N(e){return e.simDate||H()}function Lt(e,n){const t=W(e,n),s=e.pis.find(o=>o.id===(t==null?void 0:t.piId));!t||!s||t.status!=="in_production"||(t.artworkOn=N(e),t.readyDate=M(t.artworkOn,s.leadDays||30),h(e))}function Bt(e,n){const t=g(e,n),s=D(e,t==null?void 0:t.customerId);!t||!s||(t.sampleSent=!0,t.messages=t.messages||[],t.messages.push({at:new Date().toISOString(),from:"you",text:`We will send 2 sets to ${s.city} by courier, freight collect. Please share the receiving address.`,textZh:`我们寄 2 套样品到 ${s.city}，运费到付。请给收件地址。`}),t.unread=!0,t.messages.push({at:new Date().toISOString(),from:"buyer",text:"OK, freight collect is fine. Address will follow. We will not book a container before we see the 2 sets.",textZh:"到付可以。地址随后发。没看到这 2 套我们不下柜。"}),h(e))}function Ot(e){e.simDate=M(N(e),1);const n=e.simDate;for(const t of e.inquiries||[])!t.ghosted||t.piId||(t.ghosted=!1,t.unread=!0,t.messages=t.messages||[],t.messages.push({at:new Date().toISOString(),from:"buyer",text:"Sorry for the delay. We are still here. Please follow up on quantity / price.",textZh:"抱歉回晚了。我们还在。数量和价格请再跟一下。"}));for(const t of e.followups||[])!t.done&&t.due&&t.due<=n&&(t.note=`${t.note||""}（已到 ${n}）`);h(e)}function Nt(e,n){const t=W(e,n);if(!t||t.status!=="in_production"||!t.artworkOn)return;const s=e.pis.find(y=>y.id===t.piId),o=g(e,t.inquiryId),a=D(e,t.customerId),i=O(e,o==null?void 0:o.productId);if(!s||!o||!i)return;const d=s.sellCif!=null?Number(s.sellCif):Number(s.sellFob),c=Number(s.qty)*d,l=s.sellCif!=null?`CIF ${s.cifPort}`:`FOB ${s.fobPort}`,b=Math.ceil(Number(s.qty)/(i.setsPerCarton||12)),$=(Number(s.qty)*.42).toFixed(1),C=(Number(s.qty)*.36).toFixed(1),m=(Number(s.qty)*Number(i.cbmPerSet)).toFixed(2);t.ci=`COMMERCIAL INVOICE
Seller: Your trading desk, Ningbo
Buyer: ${a.name}
Invoice No: CI-${t.id}
Related PI: ${s.id}
Item: ${i.sku} ${i.name}
Qty: ${s.qty} sets (${s.qtyLabel})
Unit: ${Tt(d)} ${l}
Amount: USD ${c.toFixed(2)}
Payment: 30% received, 70% against copy of B/L
Not DDP.`,t.pl=`PACKING LIST
Buyer: ${a.name}
Related PI: ${s.id}
Item: ${i.sku}
Qty: ${s.qty} sets
Packing: ${s.packing}
Cartons: ${b}
NW: ${C} kg   GW: ${$} kg   CBM: ${m}
Port: ${l}`,t.status="docs_ready",o.status="docs_ready",o.messages=o.messages||[],o.messages.push({at:new Date().toISOString(),from:"you",text:`Commercial invoice and packing list issued against PI ${s.id}. We will send B/L copy after loading.`,textZh:`已按 PI ${s.id} 出具商业发票和装箱单。装船后发提单副本。`}),o.unread=!0,o.messages.push({at:new Date().toISOString(),from:"buyer",text:"Docs received. Please send copy of B/L when the vessel is loaded. We will pay the 70% then.",textZh:"单据收到了。装船后请发提单副本，我们再付 70%。"}),h(e)}function _t(e,n){const t=W(e,n);if(!t||t.status!=="docs_ready")return;const s=g(e,t.inquiryId),o=e.pis.find(a=>a.id===t.piId);t.status="bl_out",s&&(s.status="bl_out",s.messages=s.messages||[],s.messages.push({at:new Date().toISOString(),from:"you",text:"Copy of B/L attached. Please arrange the 70% T/T as agreed.",textZh:"提单副本已附。请按约定安排 70% 电汇。"}),s.unread=!0,s.messages.push({at:new Date().toISOString(),from:"buyer",text:"B/L copy received. Accounts will remit the 70% balance shortly.",textZh:"提单副本收到。财务很快汇 70% 尾款。"})),_(e,{customerId:t.customerId,inquiryId:t.inquiryId,day:3,note:`跟进尾款：${(o==null?void 0:o.qtyLabel)||""}`}),h(e)}function qt(e,n){const t=W(e,n);if(!t||t.status!=="bl_out")return;const s=e.pis.find(a=>a.id===t.piId),o=g(e,t.inquiryId);t.status="closed",s&&(s.status="closed"),o&&(o.status="closed"),h(e)}function Tt(e){return`USD ${Number(e).toFixed(2)}`}function Et(e,n,t){const s=e.pis.find(o=>o.id===n);s&&(s.checks=t,h(e))}function At(e,n){const t=g(e,n.inquiryId);if(t&&!J(t))return null;const s=`q-${Date.now()}`,o={id:s,locked:!1,createdAt:new Date().toISOString(),...n};return e.quotes.push(o),t&&(t.quoteId=s,t.factoryId=n.factoryId,t.status=t.status==="new"||t.status==="clarifying"?"quoted":t.status,t.messages=t.messages||[],t.messages.push({at:new Date().toISOString(),from:"you",text:`Quotation sent: USD ${n.sellFob.toFixed(2)} FOB ${n.fobPort}${n.sellCif!=null?` / USD ${n.sellCif.toFixed(2)} CIF ${n.cifPort}`:" (FOB only)"}.`,textZh:`已报价：USD ${n.sellFob.toFixed(2)} FOB ${n.fobPort}${n.sellCif!=null?` / USD ${n.sellCif.toFixed(2)} CIF ${n.cifPort}`:"（只报 FOB）"}。`})),h(e),X(e,n.inquiryId),o}function Ht(e,n,t){const s=B(e,n);if(!s||s.locked)return s;Object.assign(s,t);const o=g(e,s.inquiryId);return o&&(o.messages=o.messages||[],o.messages.push({at:new Date().toISOString(),from:"you",text:`Updated quotation: USD ${Number(s.sellFob).toFixed(2)} FOB ${s.fobPort}${s.sellCif!=null?` / USD ${Number(s.sellCif).toFixed(2)} CIF ${s.cifPort}`:" (FOB only)"}.`})),h(e),X(e,s.inquiryId),s}function Ut(e,n,t,s=""){const o=g(e,n);o&&(o.messages=o.messages||[],o.messages.push({at:new Date().toISOString(),from:"you",text:t,textZh:s}),o.status==="quoted"&&(o.status="negotiating"),o.unread=!1,h(e),X(e,n))}function X(e,n){const t=g(e,n);if(!t)return;const s=D(e,t.customerId),o=t.quoteId?B(e,t.quoteId):null;let a=Ft(s,t,o);(!a||a.kind==="none")&&(["in_production","docs_ready","bl_out","closed"].includes(t.status)?a={kind:"ack_prod",status:t.status,text:"Noted. We follow the last shipping update.",zh:"知道了。按上一封装运消息来。"}:t.piId?a={kind:"ack_pi",status:"pi_issued",text:"We have the PI. Accounts will send 30% T/T.",zh:"PI 收到了。财务会打 30% 电汇。"}:o?a={kind:"accept",status:"won",text:`Please send the PI with your last numbers: USD ${Number(o.sellFob).toFixed(2)} FOB${o.sellCif!=null?` / USD ${Number(o.sellCif).toFixed(2)} CIF`:""}.`,zh:`请按你最后报的数字出形式发票：FOB ${Number(o.sellFob).toFixed(2)}${o.sellCif!=null?` / CIF ${Number(o.sellCif).toFixed(2)}`:""}。`}:a={kind:"ack",status:t.status,text:"Confirmed. Please send FOB / CIF when ready.",zh:"确认。准备好了就发 FOB / CIF。"}),Pt(e,t,a,_),h(e)}function bt(e){const n=new Set(e.inquiries.map(o=>o.customerId)),t=e.customers.find(o=>!n.has(o.id));if(!t)return null;const s=dt(t);return e.inquiries.unshift(s),_(e,{customerId:t.id,inquiryId:s.id,day:0,note:`新询盘：${t.name}`}),h(e),s}function ht(e,n){const t=g(e,n);t&&(t.unread=!1,h(e))}function Qt(e,n,t){const s=g(e,n);s&&(s.negotiation=t,["won","pi_issued","in_production","docs_ready","bl_out","closed"].includes(s.status)||(s.status="negotiating"),h(e))}function zt(e,n){const t=B(e,n);if(!t)return null;const s=g(e,t.inquiryId),o=`pi-${Date.now()}`,a={id:o,quoteId:n,inquiryId:t.inquiryId,customerId:s==null?void 0:s.customerId,productId:s==null?void 0:s.productId,qty:s==null?void 0:s.qty,qtyLabel:s==null?void 0:s.qtyLabel,sellFob:t.sellFob,sellCif:t.sellCif,fobPort:t.fobPort,cifPort:t.cifPort,payment:"30% T/T when order is placed, 70% T/T against copy of B/L",leadDays:t.leadDays,packing:t.packing,status:"awaiting_deposit",createdAt:new Date().toISOString()};if(e.pis.push(a),t.locked=!0,s){s.piId=o,s.status="pi_issued";const i=a.sellCif!=null?Number(a.sellCif):Number(a.sellFob),d=Number(a.qty)*i,c=Math.round(d*.3*100)/100;s.messages=s.messages||[],s.messages.push({at:new Date().toISOString(),from:"you",text:`PI ${o} issued. Please remit 30% T/T USD ${c.toFixed(2)} against this PI.`,textZh:`形式发票 ${o} 已出。请按这张票电汇 30% 定金 USD ${c.toFixed(2)}。`}),s.unread=!0,s.messages.push({at:new Date().toISOString(),from:"buyer",text:`PI received. Accounts will send 30% deposit USD ${c.toFixed(2)} today. Please start production after it lands.`,textZh:`形式发票收到了。财务今天打 30% 定金 USD ${c.toFixed(2)}。钱到了请安排生产。`})}return h(e),a}function _(e,{customerId:n,inquiryId:t,day:s,note:o}){const a={id:`fu-${Date.now()}`,customerId:n,inquiryId:t,day:s,due:M(N(e),s===0?0:s),done:!1,note:o};return e.followups.push(a),h(e),a}function Gt(e,n){const t=e.followups.find(s=>s.id===n);t&&(t.done=!t.done,h(e))}function jt(e,n){Object.assign(e.shipping,n),h(e)}function Mt(e,n,t){const s=A(e,n);s&&(Object.assign(s,t),h(e))}function Wt(e,n,t){const s=D(e,n);s&&(s.notes=t,h(e))}function r(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function S(e){return e==null||Number.isNaN(Number(e))?"—":`USD ${Number(e).toFixed(2)}`}function Rt(e){return{new:"待问清",clarifying:"已问清",quoted:"已报价",negotiating:"议价中",won:"买家要 PI",pi_issued:"已出 PI",lost:"关闭",awaiting_deposit:"等定金",deposit_in:"定金已到",in_production:"排产中",docs_ready:"已出单据",bl_out:"等尾款",closed:"已收齐"}[e]||e}function L(e){return`<span class="badge badge-${r(e)}">${r(Rt(e))}</span>`}function tt(e){return e?["in_production","docs_ready","bl_out","closed"].includes(e.status)?L(e.status):e.piId?L("pi_issued"):L(e.status):""}function Zt(e){const n=e.inquiries.filter(i=>["new","clarifying","quoted","negotiating","won","pi_issued","in_production","docs_ready","bl_out"].includes(i.status)),t=e.inquiries.filter(i=>i.unread).length,s=e.customers.filter(i=>!e.inquiries.some(d=>d.customerId===i.id)).length,o=e.followups.filter(i=>!i.done),a=e.pis.filter(i=>i.status==="awaiting_deposit").length;return`
    <header class="page-head">
      <div>
        <h2>今日待办</h2>
        <p class="sub">问清 → 报价 → 出 PI → 30% 定金 → 排产单据 → 70% 尾款关档。</p>
      </div>
      <div class="actions">
        <p class="sub">练习日 ${r(N(e))}</p>
        <button type="button" class="ghost" data-advance>推进一天</button>
        <button type="button" class="btn" data-spawn ${s?"":"disabled"}>来一封新询盘</button>
      </div>
    </header>
    <section class="stats">
      <article class="stat"><b>${n.length}</b><span>未了结询盘</span></article>
      <article class="stat"><b>${t}</b><span>未读买家回复</span></article>
      <article class="stat"><b>${o.length}</b><span>待跟进</span></article>
      <article class="stat"><b>${a}</b><span>等定金 / 排产</span></article>
    </section>
    <section class="grid-2">
      <article class="panel">
        <h3>未了结询盘</h3>
        ${n.length?`<ul class="rows">${n.map(i=>{const d=D(e,i.customerId);return`<li><a href="#/inquiries/${i.id}"><strong>${i.unread?'<span class="dot"></span>':""}${r(i.subject)}</strong><span>${r(d==null?void 0:d.name)}${i.ghosted?" · 已读未回":""}</span></a>${tt(i)}</li>`}).join("")}</ul>`:'<p class="empty">没有未处理询盘。可点「来一封新询盘」或重置数据。</p>'}
      </article>
      <article class="panel">
        <h3>待跟进</h3>
        ${o.length?`<ul class="rows">${o.map(i=>{const d=D(e,i.customerId),c=g(e,i.inquiryId);return`<li>
                    <label class="check">
                      <input type="checkbox" data-toggle-follow="${i.id}" />
                      <span><strong>D${i.day}</strong> ${r(d==null?void 0:d.name)} · ${r(i.due)}<br />${r(i.note||(c==null?void 0:c.subject))}</span>
                    </label>
                    ${c?`<a class="mini" href="#/inquiries/${c.id}">打开询盘</a>`:""}
                  </li>`}).join("")}</ul>`:'<p class="empty">没有待跟进。</p>'}
      </article>
    </section>
    <article class="panel callout">
      <h3>建议练习路径</h3>
      <ol>
        <li>打开询盘，在对话里问数量、港口、认证、包装、付款，等对方回再报价。</li>
        <li>选工厂 A，按柜型报 FOB / CIF；不够一柜不要套整柜 CIF。</li>
        <li>谈妥后出 PI，记 30% 定金，排产先确认彩盒，再出 CI/PL、提单副本，记 70% 尾款关档。</li>
        <li>看复盘打分：是否先问清、是否拒 DDP、小单是否乱报 CIF。</li>
      </ol>
    </article>
  `}function Kt(e,n){var t,s;document.querySelectorAll("[data-toggle-follow]").forEach(o=>{o.addEventListener("change",()=>{Gt(e,o.getAttribute("data-toggle-follow")),n()})}),(t=document.querySelector("[data-advance]"))==null||t.addEventListener("click",()=>{Ot(e),n()}),(s=document.querySelector("[data-spawn]"))==null||s.addEventListener("click",()=>{const o=bt(e);o&&(location.hash=`#/inquiries/${o.id}`,n())})}function T(e){return Math.round((Number(e)+Number.EPSILON)*100)/100}function z(e,n=68){return!e||e<=0?0:Math.floor(n/e)}function mt({exw:e,inlandPerSet:n,docsPerSet:t,oceanPer40hq:s,insuranceRate:o,qty:a,cbmPerSet:i,usableCbm:d,forceFullContainer:c}){const l=T(Number(e)+Number(n)+Number(t)),b=z(i,d);if(!(!!c||Number(a)>=b))return{fobCost:l,cifCost:null,oceanPerSet:null,insurancePerSet:null,capacity:b,canUseContainerCif:!1};const C=T(Number(s)/b),m=T((l+C)*1.1*Number(o)),y=T(l+C+m);return{fobCost:l,cifCost:y,oceanPerSet:C,insurancePerSet:m,capacity:b,canUseContainerCif:!0}}function K({sellFob:e,sellCif:n,canUseContainerCif:t,fobPort:s,cifPort:o}){const a=[];s||a.push("必须写明 FOB 港口"),n!=null&&n!==""&&!o&&a.push("必须写明 CIF 港口");const i=e===""||e==null?null:Number(e),d=n===""||n==null?null:Number(n);return(i==null||Number.isNaN(i)||i<=0)&&a.push("必须填写对外 FOB 单价"),d!=null&&Number.isNaN(d)&&a.push("CIF 单价无效"),d!=null&&!t&&a.push("数量不足一柜，不能沿用整柜 CIF，请只报 FOB 或按 LCL 重算运费"),d!=null&&i!=null&&d<=i&&a.push("CIF 必须高于 FOB"),a}function rt(e,n){return e==null||n==null||e<=0?null:T((e-n)/e*100)}function $t(e,n){var l;if(!e)return{items:[],passed:0,total:0};const t=e.messages||[],s=t.find(b=>b.from==="you"),o=!!(s&&!/^quotation sent/i.test(s.text||"")&&!/^updated quotation/i.test(s.text||"")),a=t.filter(b=>b.from==="you").map(b=>`${b.text} ${b.textZh||""}`.toLowerCase()).join(`
`),i=!!((l=e.negotiation)!=null&&l.refuseDdp)||a.includes("not quote ddp")||a.includes("will not quote ddp")||a.includes("no ddp")||a.includes("不报")&&a.includes("ddp"),d=e.fullContainer||n==null||n.sellCif==null,c=[{ok:o,title:"先问清再报价",why:o?"第一封不是直接甩单价。":"第一封就是报价。应先问数量、港口、认证、包装、付款。"},{ok:i,title:"拒绝门口价 DDP",why:i?"信里或底线里拒绝了 DDP。":"没有拒 DDP。练习里应写明不报门口价。"},{ok:d,title:"不够一柜不报整柜 CIF",why:d?e.fullContainer?"这票是整柜，可以报 CIF。":"小单只报了 FOB。":"小单套了整柜 CIF，买家运费会对不上。"}];return{items:c,passed:c.filter(b=>b.ok).length,total:c.length}}const Vt={clarify:{label:"先问清（不报价）",build({customer:e,product:n,destPort:t,qtyLabel:s,cert:o}){return`Hi ${e.name.split(" ")[0]},

Thanks for the inquiry on ${n.sku}. Before I send a firm unit price, please confirm:

1) Quantity: ${s} — full 40HQ or trial / LCL?
2) Destination: CIF ${t} or FOB Ningbo only?
3) Certification: ${o} on this exact item, English report?
4) Packing: neutral box + sticker, or printed box (MOQ)?
5) Payment: 30% T/T with PI, 70% against copy of B/L. We do not quote DDP from here.

I will send FOB / CIF after you confirm the above.

Best regards`},buildZh({destPort:e,qtyLabel:n,cert:t}){return`报价前请确认：
1）数量：${n} — 整柜还是试单/拼箱？
2）目的港：CIF ${e} 还是只报 FOB 宁波？
3）认证：本货号 ${t} 英文报告？
4）包装：中性盒+贴纸，还是印刷盒（起订量）？
5）付款：PI 后 30% 电汇，见提单副本 70%。我们这边不报 DDP。
你确认后我再发 FOB / CIF。`}},inquiry:{label:"询盘回复",build({customer:e,product:n,sellFob:t,sellCif:s,fobPort:o,cifPort:a,leadDays:i}){return`Hi ${e.name.split(" ")[0]},

Thanks for reaching out. For supermarket and foodservice in Germany, I would quote a 6-piece SUS304 set with satin finish, not 201.

Item ${n.sku}: ${n.name}. Neutral color box, your sticker or printed logo. We can arrange LFGB testing on this item.

  USD ${s??"—"} / set  CIF ${a}
  USD ${t??"—"} / set  FOB ${o}

Payment: 30% T/T down, 70% T/T against copy of B/L
Lead time: ${i} days after deposit and artwork confirmed
Offer valid 7 days

Could you confirm sticker vs printed box, and palletized or floor loaded?

Best regards`}},quote:{label:"报价说明",build({product:e,sellFob:n,sellCif:t,fobPort:s,cifPort:o,qtyLabel:a,leadDays:i}){return`Hi,

Please find our offer for ${e.sku}.

Qty: ${a}
  USD ${t??"—"} / set  CIF ${o}
  USD ${n??"—"} / set  FOB ${s}

Packing: ${e.packing}
Payment: 30% T/T down, 70% T/T against copy of B/L
Lead time: ${i} days after deposit and artwork confirmed
Validity: 7 days (ocean freight)

Not included: German import duty, VAT, destination charges. This is not DDP.

Best regards`}},outreach:{label:"开发信",build({product:e,fobPort:n,cifPort:t}){return`Hi,

I looked at your stainless cooking tools range. I handle OEM for ${e.sku} (${e.material}, neutral box). We can run LFGB on the actual item and ship FOB ${n} or CIF ${t}.

If a trial 40'HQ is in your plan this season, I can send spec + carton size tomorrow.

Best regards`}},nego:{label:"砍价 / DDP 回复",build({sellCif:e,cifPort:n,leadDays:t}){return`Hi,

Straight answers below.

Price
I can move to USD ${e??"5.95"} / set CIF ${n} if we keep SUS304, you take the full 40'HQ, and we use sticker logo. I will not switch to 201.

Samples
I can send 2 sets. I waive the unit charge; please take DHL freight collect. Deductible from bulk.

DDP
I will not quote DDP from here. Please compare my CIF ${n} with your forwarder. EORI + postcode needed before any door price.

Lead time
15 days is not realistic for 304 with confirmed artwork. We ship in ${t} days after deposit and box confirmation.

If this works, I will send the PI today.

Best regards`}}};function Yt(e,n,t){return e.status==="closed"?{title:"这票已经收齐关档",body:"尾款到了。去「排产」看复盘对错表，再开下一封询盘。"}:e.status==="bl_out"?{title:"提单副本已出，等 70% 尾款",body:"去「排产」点「尾款已到账」。不要再出一张 PI。"}:e.status==="docs_ready"?{title:"商业发票和装箱单已出",body:"去「排产」点「提单副本已出」，对方才会付尾款。"}:e.status==="in_production"?{title:"定金到了，正在排产",body:"去顶部「排产」，先确认彩盒，再按 PI 出 CI / PL。"}:e.piId?{title:"对方按票打定金，钱到了再开工",body:"往下看「这票的价」。总价和 30% 定金在那里。买家信里会说打定金。钱到了点「定金已到，安排生产」。"}:e.status==="won"?{title:"对方同意了，要形式发票",body:"往下滚，点「生成形式发票」。那是给对方打 30% 定金用的单据。"}:t?{title:"价格已经发出，继续用英文回他",body:"他若砍价或要门口价（DDP），用上面的「拒 DDP / 议价」稿回。等他说 send the PI（请出形式发票），再点生成。"}:n?{title:"对方已经回答，可以报单价了",body:"先看「我们的成本」，再填「卖给买家的价」。FOB = 宁波上船价。CIF = 运到对方港口的价。不够一柜不要填 CIF。"}:{title:"先问清楚，先不要报死价",body:"看左边买家英文，下面有中文。想好要问什么，点灰色按钮会生成英文，再点「发给买家」。他回了才能填单价。"}}function Jt(e,n,t){const s=n.sellCif!=null?Number(n.sellCif):Number(n.sellFob),o=Number(e.qty)*s,a=Math.round(o*.3*100)/100,i=Math.round((o-a)*100)/100,d=n.sellCif!=null?`CIF ${n.cifPort}`:`FOB ${n.fobPort}`;return`
    <article class="panel">
      <h3>这票的价（给你看的）</h3>
      <p class="field-help">套单价 × 数量 = 总价。对方先打总价的 30%，剩下 70% 等提单副本。</p>
      <div class="metrics">
        <div><span>套单价 ${r(d)}</span><b>${S(s)}</b></div>
        <div><span>总价 ${r(e.qtyLabel)}</span><b>USD ${o.toFixed(2)}</b></div>
        <div><span>要收的 30% 定金</span><b>USD ${a.toFixed(2)}</b></div>
      </div>
      <p class="hint">尾款 70% = USD ${i.toFixed(2)}。先出形式发票，再收款，再安排生产。</p>
    </article>`}function Xt(e,n){const t=$t(e,n);return`
    <h3>这票复盘 ${t.passed}/${t.total}</h3>
    <ul class="rows compact">
      ${t.items.map(s=>`<li><span class="badge ${s.ok?"badge-deposit_in":"badge-new"}">${s.ok?"过":"缺"}</span><div><strong>${r(s.title)}</strong><p class="muted">${r(s.why)}</p></div></li>`).join("")}
    </ul>`}function V(e,n,t){const s=O(e,n.productId);return mt({exw:t.exw,inlandPerSet:t.inlandPerSet,docsPerSet:t.docsPerSet,oceanPer40hq:e.shipping.oceanPer40hq,insuranceRate:e.shipping.insuranceRate,qty:n.qty,cbmPerSet:s.cbmPerSet,usableCbm:e.shipping.usableCbm,forceFullContainer:n.fullContainer})}function te(e){const n=e.customers.filter(t=>!e.inquiries.some(s=>s.customerId===t.id)).length;return`
    <header class="page-head">
      <div>
        <h2>买家来信</h2>
        <p class="sub">点开一封，先看中文在说什么，再用英文回。花名册里还有 ${n} 人没来信。</p>
      </div>
      <button type="button" class="btn" data-spawn ${n?"":"disabled"}>来一封新询盘</button>
    </header>
    <ul class="card-list">
      ${e.inquiries.map(t=>{const s=D(e,t.customerId);return`<li>
            <a href="#/inquiries/${t.id}">
              <div>
                <strong>${t.unread?'<span class="dot"></span>':""}${r(s==null?void 0:s.name)} · ${r(s==null?void 0:s.country)}</strong>
                <p>${r(G[s==null?void 0:s.persona]||"")} · ${r(t.qtyLabel)} · 港口 ${r(t.destPort)}</p>
                <p class="en-line" translate="no">${r(t.subject)}</p>
                <p class="tags">${(t.tags||[]).map(o=>`<span>${r(o)}</span>`).join("")}</p>
              </div>
              ${t.ghosted&&!t.piId?'<span class="badge badge-lost">已读未回</span>':tt(t)}
            </a>
          </li>`}).join("")}
    </ul>
  `}function ee(e,n){var t;(t=document.querySelector("[data-spawn]"))==null||t.addEventListener("click",()=>{const s=bt(e);s&&(location.hash=`#/inquiries/${s.id}`,n())})}function ne(e,n){var u,k,I,w;const t=g(e,n);if(!t)return'<p class="empty">询盘不存在。</p>';const s=D(e,t.customerId),o=O(e,t.productId),a=pt(e,t.productId),i=t.factoryId?A(e,t.factoryId):a.find(p=>p.recommended),d=t.factoryId||(i==null?void 0:i.id),c=i?V(e,t,i):null,l=t.quoteId?B(e,t.quoteId):null,b=(l==null?void 0:l.sellFob)??"",$=(l==null?void 0:l.sellCif)??"",C=l?K({sellFob:l.sellFob,sellCif:l.sellCif,canUseContainerCif:c==null?void 0:c.canUseContainerCif,fobPort:l.fobPort,cifPort:l.cifPort}):[],m=J(t),y=t.status==="closed"?6:t.status==="bl_out"||t.status==="docs_ready"?5:t.status==="in_production"||t.piId?4:t.status==="won"?3:l?2:m?1:0,x=Yt(t,m,l),f=localStorage.getItem("ft-show-zh")!=="0";return`
    <header class="page-head">
      <div>
        <p class="crumb"><a href="#/inquiries">买家来信</a></p>
        <h2>${r(s.name)}</h2>
        <p class="sub">${r(s.country)} · ${r(G[s.persona]||"")} · ${r(t.qtyLabel)} · ${r(o.sku)} · ${t.ghosted&&!t.piId?'<span class="badge badge-lost">已读未回</span>':tt(t)}</p>
        <p class="en-line" translate="no">${r(t.subject)}</p>
      </div>
      <button type="button" class="ghost" data-toggle-zh>${f?"只看英文":"对照中文"}</button>
    </header>
    <ol class="steps">
      <li class="${y===0?"is-on":""}">① 问清</li>
      <li class="${y===1?"is-on":""}">② 报价</li>
      <li class="${y===2?"is-on":""}">③ 谈条款</li>
      <li class="${y===3?"is-on":""}">④ 出形式发票</li>
      <li class="${y===4?"is-on":""}">⑤ 等定金 / 排产</li>
      <li class="${y===5?"is-on":""}">⑥ 单据尾款</li>
      <li class="${y===6?"is-on":""}">⑦ 关档</li>
    </ol>
    <aside class="coach">
      <p class="coach-kicker">现在做什么</p>
      <h3>${r(x.title)}</h3>
      <p>${r(x.body)}</p>
    </aside>

    <section class="desk">
    <article class="panel">
      <h3>往来信件 <span class="soft">上面英文发给买家，下面中文给你看</span></h3>
      <div class="thread">
        ${(t.messages||[{from:"buyer",text:t.body,textZh:at(s),at:""}]).map(p=>{const q=p.textZh||(p.from==="buyer"&&p.text===t.body?at(s):"");return`
          <div class="bubble ${p.from==="you"?"is-you":"is-buyer"}">
            <small>${p.from==="you"?"你发出去的英文":`买家 ${r(s.name)}`}</small>
            <pre class="en" translate="no">${r(p.text)}</pre>
            ${q&&f?`<p class="zh">中文：${r(q)}</p>`:""}
          </div>`}).join("")}
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
      <button type="button" class="btn" data-save-reply="${t.id}">发给买家</button>
    </article>

    <article class="panel summary">
      <h3>这票货一览</h3>
      <table class="plain">
        <tr><th>买家</th><td>${r(s.name)}<br /><span class="soft">${r(s.city)}，${r(s.country)}</span></td></tr>
        <tr><th>他是哪种人</th><td>${r(G[s.persona]||"")}。${r(s.notes||"")}</td></tr>
        <tr><th>要多少</th><td>${r(t.qtyLabel)}</td></tr>
        <tr><th>港口</th><td>我们宁波上船；他要到 ${r(t.destPort)}</td></tr>
        <tr><th>认证</th><td>${r(s.cert)}，要本货号报告</td></tr>
        <tr><th>货号</th><td>
          ${t.piId?`${r(o.sku)}　${r(o.name)}`:`<select data-pick-product="${t.id}">${e.products.map(p=>`<option value="${p.id}" ${p.id===t.productId?"selected":""}>${r(p.sku)} · ${r(p.name)}</option>`).join("")}</select>`}
        </td></tr>
      </table>
      <p class="tags">${(t.tags||[]).map(p=>`<span>${r(p)}</span>`).join("")}</p>
    </article>
    </section>

    <section class="grid-2">
      <article class="panel">
        <h3>选哪家工厂供货</h3>
        <p class="field-help">德国大货选工厂 A。B 更便宜，但报告和交期不稳，不要当主供。</p>
        <div class="factory-pick" data-inquiry="${t.id}">
          ${a.map(p=>`
            <label class="factory ${p.id===d?"is-on":""} ${p.recommended?"is-rec":""}">
              <input type="radio" name="factory" value="${p.id}" ${p.id===d?"checked":""} data-pick-factory="${t.id}" />
              <strong>${r(p.name)}</strong>
              <span>EXW ${S(p.exw)} · 交期 ${p.leadDays} 天 · LFGB ${p.lfgb?"可出":"存疑"}</span>
              <em>${r(p.notes)}</em>
            </label>`).join("")}
        </div>
      </article>
      ${c?`<article class="panel">
      <h3>我们的成本（不能报给买家）</h3>
      <p class="field-help">这是你的底。卖价必须高于成本，差额才是毛利。</p>
      <table class="plain">
        <tr><th>FOB 成本<br /><span class="soft">货到宁波上船，我们自己要花的</span></th><td>${S(c.fobCost)}</td></tr>
        <tr><th>一个 40 尺柜能装</th><td>${c.capacity.toLocaleString()} 套</td></tr>
        <tr><th>海运摊到每套</th><td>${c.canUseContainerCif?S(c.oceanPerSet):"不够一柜，不能这样摊"}</td></tr>
        <tr><th>CIF 成本<br /><span class="soft">货到 ${r(t.destPort)} 港口，我们要花的</span></th><td>${c.canUseContainerCif?S(c.cifCost):"禁止套用整柜到港价"}</td></tr>
      </table>
      ${c.canUseContainerCif?"":'<p class="warn">这票不够一柜。对外只报 FOB（上船价），不要填 CIF。</p>'}
    </article>`:""}
    </section>

    ${l?Jt(t,l):""}

    <article class="panel">
      <h3>卖给买家的价</h3>
      <p class="field-help">FOB = 宁波上船，买家自己找船。CIF = 我们付海运，货到他港口。整柜 CIF 练习价大约 6.35，可以谈到 5.95。</p>
      ${m?"":'<p class="warn">先在上面问完、等他回了，这两个框才会亮。</p>'}
      <form class="form quote-grid" data-quote-form="${t.id}">
        <input type="hidden" name="factoryId" value="${d||""}" />
        <label>上船价 FOB 宁波（美元/套）
          <input name="sellFob" type="number" step="0.01" min="0" value="${r(b)}" required ${m?"":"disabled"} />
        </label>
        <label>到港价 CIF ${r(t.destPort||e.shipping.cifPort)}（不够一柜请留空）
          <input name="sellCif" type="number" step="0.01" min="0" value="${r($)}" ${m?"":"disabled"} />
        </label>
        <p class="hint">你现在的毛利：上船 ${b&&c?`${rt(Number(b),c.fobCost)}%`:"还没填"} · 到港 ${$&&(c!=null&&c.cifCost)?`${rt(Number($),c.cifCost)}%`:"—"}</p>
        ${[...C,...t.quoteErrors||[]].length?`<ul class="errors">${[...new Set([...C,...t.quoteErrors||[]])].map(p=>`<li>${r(p)}</li>`).join("")}</ul>`:""}
        <button type="submit" class="btn" ${m?"":"disabled"}>${l?"改报价并告诉买家":"把这个价发给买家"}</button>
      </form>
    </article>

    <article class="panel">
      <h3>你坚持的底线（自己记）</h3>
      <p class="field-help">勾上表示这封信里你拒绝了这些外行条件。对方问门口价、改 201、15 天交期时要拒。</p>
      <form class="form nego-form" data-nego-form="${t.id}">
        <label class="check"><input type="checkbox" name="refuse201" ${(u=t.negotiation)!=null&&u.refuse201?"checked":""} /> 不换成便宜的 201 钢</label>
        <label class="check"><input type="checkbox" name="refuseDdp" ${(k=t.negotiation)!=null&&k.refuseDdp?"checked":""} /> 不报门口价（DDP）</label>
        <label class="check"><input type="checkbox" name="refuse15" ${(I=t.negotiation)!=null&&I.refuse15?"checked":""} /> 不答应 15 天出 304</label>
        <label class="check"><input type="checkbox" name="sampleFreightCollect" ${(w=t.negotiation)!=null&&w.sampleFreightCollect?"checked":""} /> 样品运费对方付</label>
        <button type="submit" class="ghost">记下这些底线</button>
      </form>
    </article>

    ${l?`<article class="panel">${Xt(t,l)}</article>`:""}

    <div class="actions">
      <button type="button" class="btn" data-make-pi="${t.id}" ${t.status==="won"&&l&&!t.piId?"":"disabled"}>生成形式发票</button>
      <button type="button" class="ghost" data-sample="${t.id}" ${t.sampleSent?"disabled":""}>寄 2 套样品（到付）</button>
      <button type="button" class="ghost" data-follow="${t.id}">三天后提醒我跟进</button>
      ${t.piId&&t.status==="pi_issued"?`<button type="button" class="btn" data-take-deposit="${t.piId}">定金已到，安排生产</button>`:""}
      ${t.piId?'<a class="ghost" href="#/quotes">去看形式发票全文</a>':""}
      ${["in_production","docs_ready","bl_out","closed"].includes(t.status)?'<a class="btn" href="#/ship">去排产</a>':""}
    </div>
    <p class="field-help">${t.status==="in_production"?"定金已记到账，工厂可以开工。顶部点「排产」。":t.piId?"形式发票已发给对方。等他说打定金，钱到了点「定金已到，安排生产」。":t.status==="won"?"对方说请出形式发票了，点上面的绿色按钮。":l?"还不能出形式发票：等他说 send the PI。":"形式发票要等问清、报价、对方同意之后。"}</p>
  `}function se(e,n,t){var c,l,b,$,C,m,y,x;const s=g(e,n);if(!s)return;s.unread&&ht(e,s.id);const o=O(e,s.productId),a=D(e,s.customerId);(c=document.querySelector("[data-pick-product]"))==null||c.addEventListener("change",f=>{vt(e,s.id,f.target.value),t()}),(l=document.querySelector("[data-sample]"))==null||l.addEventListener("click",()=>{var f;Bt(e,s.id),t(),(f=document.querySelector(".thread"))==null||f.scrollIntoView({behavior:"smooth",block:"end"})}),document.querySelectorAll("[data-pick-factory]").forEach(f=>{f.addEventListener("change",()=>{s.factoryId=f.value,h(e),t()})});const i={qty:{en:`Hi, before I quote: please confirm quantity. Is it ${s.qtyLabel}, or a smaller trial / LCL?`,zh:`报价前请确认数量：是 ${s.qtyLabel}，还是更小的试单/拼箱？`},port:{en:`Please confirm destination. Do you want CIF ${s.destPort}, or FOB Ningbo only?`,zh:`请确认目的港：要 CIF ${s.destPort}，还是只报 FOB 宁波？`},cert:{en:`Do you need ${a.cert} on this exact item, English report within 12 months?`,zh:`本货号是否要 ${a.cert} 英文报告（12 个月内）？`},box:{en:"Packing: neutral box + sticker for the first container, or printed box from the start? What is your logo MOQ?",zh:"包装：第一柜中性盒+贴纸，还是一开始就印刷盒？印刷盒起订量多少？"},pay:{en:"Payment: 30% T/T against PI, 70% against copy of B/L. We will not quote DDP. Please confirm.",zh:"付款：PI 后 30% 电汇，见提单副本 70%。我们不报 DDP。请确认。"}};document.querySelectorAll("[data-ask]").forEach(f=>{f.addEventListener("click",()=>{const u=document.querySelector("#reply-box"),k=i[f.getAttribute("data-ask")];u.value=u.value.trim()?`${u.value.trim()}

${k.en}`:k.en;const I=u.dataset.zh?`${u.dataset.zh}
`:"";u.dataset.zh=`${I}${k.zh}`,u.focus()})}),(b=document.querySelector("[data-toggle-zh]"))==null||b.addEventListener("click",()=>{const f=localStorage.getItem("ft-show-zh")!=="0";localStorage.setItem("ft-show-zh",f?"0":"1"),t()});const d=document.querySelector("[data-quote-form]");d==null||d.addEventListener("submit",f=>{f.preventDefault();const u=new FormData(d),k=String(u.get("factoryId")||s.factoryId),I=A(e,k);if(!I)return;const w=V(e,s,I),p=Number(u.get("sellFob")),q=String(u.get("sellCif")||"").trim(),et=q===""?null:Number(q),U={inquiryId:s.id,factoryId:k,sellFob:p,sellCif:et,fobPort:e.shipping.fobPort,cifPort:s.destPort||e.shipping.cifPort,leadDays:I.leadDays,packing:o.packing,validityDays:7},nt=K({sellFob:p,sellCif:et,canUseContainerCif:w.canUseContainerCif,fobPort:U.fobPort,cifPort:U.cifPort});if(nt.length){s.quoteErrors=nt,h(e),t();return}if(!J(s)){s.quoteErrors=["先在对话里问买家，等对方回复后再报价。"],h(e),t();return}s.quoteErrors=[],s.quoteId?Ht(e,s.quoteId,U):At(e,U),t()}),document.querySelectorAll("[data-tpl]").forEach(f=>{f.addEventListener("click",()=>{const u=s.quoteId?B(e,s.quoteId):null,k=A(e,s.factoryId)||pt(e,s.productId)[0],I=document.querySelector("#reply-box"),w=Vt[f.getAttribute("data-tpl")];if(!I||!w)return;const p={customer:a,product:o,sellFob:u==null?void 0:u.sellFob,sellCif:u==null?void 0:u.sellCif,fobPort:e.shipping.fobPort,cifPort:(u==null?void 0:u.cifPort)||s.destPort||e.shipping.cifPort,destPort:s.destPort,qtyLabel:s.qtyLabel,cert:a.cert,leadDays:(u==null?void 0:u.leadDays)||(k==null?void 0:k.leadDays)||30};I.value=w.build(p),I.dataset.zh=w.buildZh?w.buildZh(p):"",I.scrollIntoView({behavior:"smooth",block:"center"}),I.focus()})}),($=document.querySelector("[data-save-reply]"))==null||$.addEventListener("click",()=>{const f=document.querySelector("#reply-box"),u=f.value.trim();u&&(Ut(e,s.id,u,f.dataset.zh||""),t())}),(C=document.querySelector("[data-nego-form]"))==null||C.addEventListener("submit",f=>{f.preventDefault();const u=new FormData(f.target);Qt(e,s.id,{refuse201:u.get("refuse201")==="on",refuseDdp:u.get("refuseDdp")==="on",refuse15:u.get("refuse15")==="on",sampleFreightCollect:u.get("sampleFreightCollect")==="on"}),t()}),(m=document.querySelector("[data-make-pi]"))==null||m.addEventListener("click",()=>{var w,p;if(!s.quoteId){s.quoteErrors=["还没有报价。问清并报价、对方要 PI 之后才能出。"],h(e),t(),(w=document.querySelector("[data-quote-form]"))==null||w.scrollIntoView({behavior:"smooth",block:"center"});return}if(s.status!=="won"){s.quoteErrors=["对方还没要 PI。先谈妥条款，等他说 send the PI。"],h(e),t();return}const f=B(e,s.quoteId),u=A(e,f.factoryId),k=V(e,s,u),I=K({sellFob:f.sellFob,sellCif:f.sellCif,canUseContainerCif:k.canUseContainerCif,fobPort:f.fobPort,cifPort:f.cifPort});if(I.length){s.quoteErrors=I,h(e),t();return}zt(e,s.quoteId),t(),(p=document.querySelector(".thread"))==null||p.scrollIntoView({behavior:"smooth",block:"end"})}),(y=document.querySelector("[data-take-deposit]"))==null||y.addEventListener("click",()=>{ft(e,s.piId),location.hash="#/ship",t()}),(x=document.querySelector("[data-follow]"))==null||x.addEventListener("click",()=>{_(e,{customerId:s.customerId,inquiryId:s.id,day:3,note:`跟进：${s.subject}`}),location.hash="#/today"})}function oe(e){const n=e.shipments||[];return`
    <header class="page-head">
      <div>
        <h2>排产</h2>
        <p class="sub">交期从定金 + 彩盒确认起算。先确认彩盒，再按 PI 出 CI / PL，提单副本后收 70% 关档。练习日 ${r(N(e))}。</p>
      </div>
    </header>
    ${n.length===0?'<p class="empty">还没有开工。先在来信里出形式发票，等买家打定金，再点「定金已到，安排生产」。</p>':`<section class="stack">${n.map(t=>re(e,t)).join("")}</section>`}
  `}function ae(e){const n=e.sellCif!=null?Number(e.sellCif):Number(e.sellFob),t=Number(e.qty)*n,s=Math.round(t*.3*100)/100,o=Math.round((t-s)*100)/100,a=e.sellCif!=null?`CIF ${e.cifPort}`:`FOB ${e.fobPort}`;return{unit:n,amount:t,deposit:s,balance:o,term:a}}function re(e,n){const t=e.pis.find($=>$.id===n.piId),s=g(e,n.inquiryId),o=D(e,n.customerId),a=O(e,s==null?void 0:s.productId),i=s!=null&&s.quoteId?B(e,s.quoteId):null;if(!t||!s)return"";const d=ae(t),c=Math.ceil(Number(t.qty)/((a==null?void 0:a.setsPerCarton)||12)),l=n.readyDate||kt(t.leadDays||30),b=$t(s,i);return`<article class="panel">
    <div class="panel-head">
      <div>
        <h3>${r((o==null?void 0:o.name)||"")}</h3>
        <p class="sub">${r(t.qtyLabel)} · ${r((a==null?void 0:a.sku)||"")} · ${n.artworkOn?`交期约至 ${r(l)}`:"彩盒未确认，交期未起算"}</p>
      </div>
      ${L(n.status)}
    </div>
    <div class="metrics">
      <div><span>总价</span><b>USD ${d.amount.toFixed(2)}</b></div>
      <div><span>已收定金 30%</span><b>USD ${d.deposit.toFixed(2)}</b></div>
      <div><span>待收尾款 70%</span><b>USD ${d.balance.toFixed(2)}</b></div>
    </div>
    <p class="field-help">货号 ${r((a==null?void 0:a.sku)||"")} · 约 ${c.toLocaleString()} 箱 · ${r(d.term)}</p>

    <ol class="cal">
      <li class="${n.depositOn?"is-on":""}">定金日 ${r(n.depositOn||"—")}</li>
      <li class="${n.artworkOn?"is-on":""}">彩盒确认 ${r(n.artworkOn||"未确认")}</li>
      <li class="${n.readyDate?"is-on":""}">交期 ${r(n.readyDate||`定金+彩盒后再加 ${t.leadDays} 天`)}</li>
    </ol>

    ${n.status==="in_production"&&!n.artworkOn?`<div class="actions">
            <button type="button" class="btn" data-artwork="${n.id}">确认彩盒，开始起算交期</button>
            <a class="ghost" href="#/inquiries/${s.id}">回询盘</a>
          </div>
          <p class="hint">交期从定金和彩盒都确认的那天起算，不是只从定金日。</p>`:""}

    ${n.status==="in_production"&&n.artworkOn?`<div class="actions">
            <button type="button" class="btn" data-issue-docs="${n.id}">出具商业发票和装箱单</button>
            <a class="ghost" href="#/inquiries/${s.id}">回询盘</a>
          </div>
          <p class="hint">数量和港口从 PI 带出。点上面按钮出 CI / PL。</p>`:""}

    ${n.ci?`<h3>商业发票 CI</h3><pre class="letter" translate="no">${r(n.ci)}</pre>`:""}
    ${n.pl?`<h3>装箱单 PL</h3><pre class="letter" translate="no">${r(n.pl)}</pre>`:""}

    ${n.status==="docs_ready"?`<div class="actions">
            <button type="button" class="ghost" data-copy>复制单据</button>
            <button type="button" class="btn" data-issue-bl="${n.id}">提单副本已出</button>
          </div>
          <p class="hint">货装上船后，把提单副本给对方，对方才付 70%。</p>`:""}

    ${n.status==="bl_out"?`<p class="warn">提单副本已通知买家。等对方付尾款 USD ${d.balance.toFixed(2)}。</p>
          <div class="actions">
            <button type="button" class="btn" data-balance="${n.id}">尾款已到账</button>
            <a class="ghost" href="#/inquiries/${s.id}">回询盘</a>
          </div>`:""}

    ${n.status==="closed"?'<p class="hint">已收齐 / 可关档。去看下面复盘对错表，再开下一封询盘。</p>':""}

    <div class="score">
      <h3>这票复盘 ${b.passed}/${b.total}</h3>
      <ul class="rows compact">
        ${b.items.map($=>`<li><span class="badge ${$.ok?"badge-deposit_in":"badge-new"}">${$.ok?"过":"缺"}</span><div><strong>${r($.title)}</strong><p class="muted">${r($.why)}</p></div></li>`).join("")}
      </ul>
    </div>
  </article>`}function ie(e,n){document.querySelectorAll("[data-artwork]").forEach(t=>{t.addEventListener("click",()=>{Lt(e,t.getAttribute("data-artwork")),n()})}),document.querySelectorAll("[data-issue-docs]").forEach(t=>{t.addEventListener("click",()=>{Nt(e,t.getAttribute("data-issue-docs")),n()})}),document.querySelectorAll("[data-issue-bl]").forEach(t=>{t.addEventListener("click",()=>{_t(e,t.getAttribute("data-issue-bl")),n()})}),document.querySelectorAll("[data-balance]").forEach(t=>{t.addEventListener("click",()=>{qt(e,t.getAttribute("data-balance")),n()})}),document.querySelectorAll("[data-copy]").forEach(t=>{t.addEventListener("click",async()=>{const s=[...t.closest(".panel").querySelectorAll("pre")].map(o=>o.innerText);try{await navigator.clipboard.writeText(s.join(`

`)),t.textContent="已复制"}catch{t.textContent="复制失败"}})})}function ce(e){return`
    <header class="page-head">
      <div>
        <h2>看价和形式发票</h2>
        <p class="sub">这里看总价和 30% 定金。对方按这张票打钱。钱到了回到来信点「定金已到，安排生产」，或下面直接点。</p>
      </div>
    </header>
    ${e.quotes.length===0?'<p class="empty">还没有报价。先去询盘问清再报价。</p>':`<section class="stack">${e.quotes.map(n=>le(e,n)).join("")}</section>`}
    ${e.pis.length?`<section class="stack"><h3>PI</h3>${e.pis.map(n=>de(e,n)).join("")}</section>`:""}
  `}function le(e,n){const t=g(e,n.inquiryId),s=D(e,t==null?void 0:t.customerId),o=O(e,t==null?void 0:t.productId),a=`QUOTATION ${o==null?void 0:o.sku}
Buyer: ${s==null?void 0:s.name}
Qty: ${t==null?void 0:t.qtyLabel}
USD ${Number(n.sellFob).toFixed(2)} / set FOB ${n.fobPort}
${n.sellCif!=null?`USD ${Number(n.sellCif).toFixed(2)} / set CIF ${n.cifPort}`:"CIF not offered (not a full container)"}
Payment: 30% T/T against PI, 70% T/T against copy of B/L
Lead time: ${n.leadDays} days after deposit and artwork
Validity: ${n.validityDays} days
Packing: ${n.packing}
Not DDP.`;return`<article class="panel">
    <div class="panel-head">
      <div>
        <h3>报价</h3>
        <p class="sub">${r(s==null?void 0:s.name)} · ${r(t==null?void 0:t.qtyLabel)}</p>
      </div>
      ${n.locked?L("pi_issued"):L("quoted")}
    </div>
    <p class="price-pair"><span>${S(n.sellFob)} FOB ${r(n.fobPort)}</span>${n.sellCif!=null?`<span>${S(n.sellCif)} CIF ${r(n.cifPort)}</span>`:""}</p>
    <pre class="letter" translate="no">${r(a)}</pre>
    <div class="actions">
      <button type="button" class="ghost" data-copy>复制条款</button>
      ${t?`<a class="ghost" href="#/inquiries/${t.id}">回询盘</a>`:""}
    </div>
  </article>`}function de(e,n){const t=D(e,n.customerId),s=O(e,n.productId),o=g(e,n.inquiryId),a=n.sellCif!=null?Number(n.sellCif):Number(n.sellFob),i=Number(n.qty)*a,d=Math.round(i*.3*100)/100,c=Math.round((i-d)*100)/100,l=n.sellCif!=null?`CIF ${n.cifPort}`:`FOB ${n.fobPort}`,b=n.checks||{},$=`PROFORMA INVOICE ${n.id}
Seller: Your trading desk
Buyer: ${t==null?void 0:t.name}
Item: ${s==null?void 0:s.sku} ${s==null?void 0:s.name}
Qty: ${n.qtyLabel} (${n.qty} sets)
Unit: ${S(a)} ${l}
Amount: USD ${i.toFixed(2)}
Deposit 30%: USD ${d.toFixed(2)} by T/T against this PI
Balance 70%: USD ${c.toFixed(2)} against copy of B/L
Lead time: ${n.leadDays} days after deposit and artwork confirmed
Packing: ${n.packing}
Documents: CI, PL, B/L, food-contact report copy
Not DDP.`,C=[["buyer",`买方是 ${t==null?void 0:t.name}`],["sku",`货号 ${s==null?void 0:s.sku}，304 不是 201`],["qty",`数量 ${n.qtyLabel} 与单价同一口径`],["price",`单价 ${S(a)} ${l}`],["total",`总价 USD ${i.toFixed(2)} = 单价 × ${n.qty}`],["deposit",`定金 30% = USD ${d.toFixed(2)}`],["port",`港口 ${l}，和询盘 ${(o==null?void 0:o.destPort)||""} 一致`],["lead",`交期从定金+彩盒确认起算 ${n.leadDays} 天`],["pack","包装与回信一致"],["ddp","没有写成 DDP"]];return`<article class="panel">
    <div class="panel-head">
      <div>
        <h3>形式发票</h3>
        <p class="sub">${r(t==null?void 0:t.name)}</p>
      </div>
      ${L(n.status)}
    </div>
    <div class="metrics">
      <div><span>总价</span><b>USD ${i.toFixed(2)}</b></div>
      <div><span>定金 30%</span><b>USD ${d.toFixed(2)}</b></div>
      <div><span>尾款 70%</span><b>USD ${c.toFixed(2)}</b></div>
    </div>
    <div class="pi-paper" translate="no">
      <header class="pi-head">
        <div>
          <strong>PROFORMA INVOICE</strong>
          <p>Seller: Your trading desk, Ningbo, China</p>
        </div>
        <div class="pi-meta">
          <p>No. ${r(n.id)}</p>
          <p>Date: ${r((n.createdAt||"").slice(0,10))}</p>
        </div>
      </header>
      <table class="pi-parties">
        <tr>
          <th>Seller</th>
          <th>Buyer</th>
        </tr>
        <tr>
          <td>Your trading desk<br />Ningbo, China<br />FOB port: ${r(n.fobPort)}</td>
          <td>${r((t==null?void 0:t.name)||"")}<br />${r((o==null?void 0:o.destPort)||"")}</td>
        </tr>
      </table>
      <table class="pi-lines">
        <tr><th>Item</th><th>Qty</th><th>Unit</th><th>Amount</th></tr>
        <tr>
          <td>${r(s==null?void 0:s.sku)} ${r(s==null?void 0:s.name)}</td>
          <td>${r(String(n.qty))} sets<br />${r(n.qtyLabel)}</td>
          <td>${S(a)} ${r(l)}</td>
          <td>USD ${i.toFixed(2)}</td>
        </tr>
      </table>
      <p>Deposit 30% T/T: USD ${d.toFixed(2)} against this PI<br />Balance 70% T/T: USD ${c.toFixed(2)} against copy of B/L<br />Lead time: ${n.leadDays} days after deposit and artwork confirmed<br />Packing: ${r(n.packing)}<br />Documents: CI, PL, B/L, food-contact report copy<br />Not DDP.</p>
      <div class="pi-sign">
        <div>Seller signature / stamp</div>
        <div>Buyer confirmation</div>
      </div>
    </div>
    <pre class="letter hidden-copy" translate="no">${r($)}</pre>
    <form class="form nego-form" data-pi-checks="${n.id}">
      <p class="hint">复制前自己对票。系统只拦 CIF/FOB，拦不住写错港口或数量。</p>
      <div class="check-grid">
      ${C.map(([m,y])=>`<label class="check"><input type="checkbox" name="${m}" ${b[m]?"checked":""} /> ${r(y)}</label>`).join("")}
      </div>
      <div class="actions">
        <button type="submit" class="ghost">保存核对</button>
        <button type="button" class="ghost" data-copy>复制 PI</button>
        ${n.status==="awaiting_deposit"?`<button type="button" class="btn" data-deposit="${n.id}">定金已到账</button>`:'<a class="btn" href="#/ship">去排产：彩盒、单据、尾款</a>'}
      </div>
    </form>
  </article>`}function ue(e,n){document.querySelectorAll("[data-copy]").forEach(t=>{t.addEventListener("click",async()=>{var o;const s=(o=t.closest(".panel"))==null?void 0:o.querySelector("pre");try{await navigator.clipboard.writeText(s.innerText),t.textContent="已复制"}catch{t.textContent="复制失败"}})}),document.querySelectorAll("[data-pi-checks]").forEach(t=>{t.addEventListener("submit",s=>{s.preventDefault();const o=t.getAttribute("data-pi-checks"),a=new FormData(t),i={};for(const[d]of a.entries())i[d]=!0;Et(e,o,i),n()})}),document.querySelectorAll("[data-deposit]").forEach(t=>{t.addEventListener("click",()=>{ft(e,t.getAttribute("data-deposit")),location.hash="#/ship",n()})})}function pe(e){return`
    <header class="page-head">
      <div>
        <h2>客户花名册</h2>
        <p class="sub">${e.customers.length} 个模拟买家。性格不同，回信规则不同。</p>
      </div>
    </header>
    <article class="panel">
      <table class="plain roster">
        <thead>
          <tr>
            <th>公司</th>
            <th>国家 / 港口</th>
            <th>性格</th>
            <th>渠道</th>
            <th>询盘</th>
          </tr>
        </thead>
        <tbody>
          ${e.customers.map(n=>{const t=e.inquiries.filter(s=>s.customerId===n.id);return`<tr>
                <td><strong>${r(n.name)}</strong><br /><span class="muted">${r(n.city)}</span></td>
                <td>${r(n.country)} · ${r(n.port)}</td>
                <td>${r(G[n.persona]||n.persona)}</td>
                <td>${r(n.channel)}</td>
                <td>${t.length?t.map(s=>`<a href="#/inquiries/${s.id}">${r(s.subject)}</a>`).join("<br />"):'<span class="muted">尚未来信</span>'}</td>
              </tr>`}).join("")}
        </tbody>
      </table>
    </article>
    <section class="stack">
      ${e.customers.map(n=>`<article class="panel compact-notes">
            <h3>${r(n.name)}</h3>
            <p class="sub">${r(n.notes||"")}</p>
            <label>客户笔记
              <textarea data-notes="${n.id}" rows="2">${r(n.notes)}</textarea>
            </label>
            <button type="button" class="ghost" data-save-notes="${n.id}">保存笔记</button>
            <button type="button" class="ghost" data-fu="${n.id}">设 D7 跟进</button>
          </article>`).join("")}
    </section>
  `}function fe(e,n){document.querySelectorAll("[data-save-notes]").forEach(t=>{t.addEventListener("click",()=>{const s=t.getAttribute("data-save-notes"),o=document.querySelector(`[data-notes="${s}"]`).value;Wt(e,s,o),n()})}),document.querySelectorAll("[data-fu]").forEach(t=>{t.addEventListener("click",()=>{const s=t.getAttribute("data-fu"),o=e.inquiries.find(a=>a.customerId===s);_(e,{customerId:s,inquiryId:o==null?void 0:o.id,day:7,note:"开发/报价跟进 D7"}),location.hash="#/today"})})}function be(e){const n=e.products[0];return z(n.cbmPerSet,e.shipping.usableCbm),`
    <header class="page-head">
      <div>
        <h2>产品与成本</h2>
        <p class="sub">主货号 KS-304-6。对照货号 KS-201-6 只能练差价，不要当德国大货主供。改 EXW / 海运后，未锁定报价会重算。</p>
      </div>
    </header>
    <section class="grid-2">
      ${e.products.map(t=>{const s=z(t.cbmPerSet,e.shipping.usableCbm);return`<article class="panel">
            <h3>${r(t.sku)} ${r(t.name)}</h3>
            <p>${r(t.material)}</p>
            <p>${r(t.packing)}</p>
            <p>MOQ ${t.moq} · ${r(t.cert)} · 约 ${s.toLocaleString()} 套 / 40HQ</p>
          </article>`}).join("")}
    </section>
    <article class="panel">
      <h3>运费参数</h3>
      <form class="form inline" data-ship>
        <label>40HQ 海运 USD
          <input name="oceanPer40hq" type="number" step="1" value="${e.shipping.oceanPer40hq}" />
        </label>
        <label>保险费率
          <input name="insuranceRate" type="number" step="0.0001" value="${e.shipping.insuranceRate}" />
        </label>
        <button class="btn" type="submit">保存运费</button>
      </form>
    </article>
    <section class="grid-2">
      ${e.factories.map(t=>{const s=mt({exw:t.exw,inlandPerSet:t.inlandPerSet,docsPerSet:t.docsPerSet,oceanPer40hq:e.shipping.oceanPer40hq,insuranceRate:e.shipping.insuranceRate,qty:z((e.products.find(o=>o.id===t.productId)||n).cbmPerSet,e.shipping.usableCbm),cbmPerSet:(e.products.find(o=>o.id===t.productId)||n).cbmPerSet,usableCbm:e.shipping.usableCbm,forceFullContainer:!0});return`<article class="panel">
            <h3>${r(t.name)} ${t.recommended?"· 推荐":""}</h3>
            <form class="form" data-factory="${t.id}">
              <label>EXW
                <input name="exw" type="number" step="0.01" value="${t.exw}" />
              </label>
              <label>内陆+港杂 / 套
                <input name="inlandPerSet" type="number" step="0.01" value="${t.inlandPerSet}" />
              </label>
              <label>文件分摊 / 套
                <input name="docsPerSet" type="number" step="0.01" value="${t.docsPerSet}" />
              </label>
              <p>整柜成本 FOB ${S(s.fobCost)} · CIF ${S(s.cifCost)}</p>
              <p class="hint">${r(t.notes)}</p>
              <button class="btn" type="submit">保存工厂成本</button>
            </form>
          </article>`}).join("")}
    </section>
  `}function he(e,n){var t;(t=document.querySelector("[data-ship]"))==null||t.addEventListener("submit",s=>{s.preventDefault();const o=new FormData(s.target);jt(e,{oceanPer40hq:Number(o.get("oceanPer40hq")),insuranceRate:Number(o.get("insuranceRate"))}),n()}),document.querySelectorAll("[data-factory]").forEach(s=>{s.addEventListener("submit",o=>{o.preventDefault();const a=new FormData(s);Mt(e,s.getAttribute("data-factory"),{exw:Number(a.get("exw")),inlandPerSet:Number(a.get("inlandPerSet")),docsPerSet:Number(a.get("docsPerSet"))}),n()})})}let F=St();const me=[{hash:"#/today",id:"today",label:"今日"},{hash:"#/inquiries",id:"inquiries",label:"来信"},{hash:"#/quotes",id:"quotes",label:"看价"},{hash:"#/ship",id:"ship",label:"排产"},{hash:"#/customers",id:"customers",label:"客户"},{hash:"#/cost",id:"cost",label:"成本"}];function $e(){const n=(location.hash||"#/today").replace("#/","").split("/");return{name:n[0]||"today",id:n[1]}}function v(){var s;const e=$e(),n=F.inquiries.filter(o=>o.unread||o.status==="new").length;document.querySelector("#app").innerHTML=`
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">KS</span>
        <div>
          <p class="eyebrow">练习台</p>
          <h1>厨具出口</h1>
        </div>
      </div>
      <nav>
        ${me.map(o=>{const a=e.name===o.id,i=o.id==="inquiries"&&n?`<span class="nav-count">${n}</span>`:"";return`<a class="${a?"is-on":""}" href="${o.hash}"><span>${o.label}</span>${i}</a>`}).join("")}
      </nav>
      <button type="button" class="ghost reset" data-reset>重置数据</button>
    </header>
    <main class="main" id="main"></main>
  `;const t=document.querySelector("#main");e.name==="inquiries"&&e.id?(ht(F,e.id),t.innerHTML=ne(F,e.id),se(F,e.id,v)):e.name==="inquiries"?(t.innerHTML=te(F),ee(F,v)):e.name==="quotes"?(t.innerHTML=ce(F),ue(F,v)):e.name==="ship"?(t.innerHTML=oe(F),ie(F,v)):e.name==="customers"?(t.innerHTML=pe(F),fe(F,v)):e.name==="cost"?(t.innerHTML=be(F),he(F,v)):(t.innerHTML=Zt(F),Kt(F,v)),(s=document.querySelector("[data-reset]"))==null||s.addEventListener("click",()=>{confirm("清除本机练习数据并恢复花名册与开局询盘？")&&(F=Dt(),location.hash="#/today",v())})}window.addEventListener("hashchange",v);v();
