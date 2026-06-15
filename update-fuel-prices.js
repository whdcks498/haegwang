/* 오피넷 유가 -> fuel-prices.json (전국 4유종 + 시도별 경유). GitHub Actions 실행.
   실행: OPINET_API_KEY=키 node update-fuel-prices.js  (서버는 http 호출 가능) */
const fs=require("fs"), http=require("http");
const KEY=process.env.OPINET_API_KEY;
function get(u){return new Promise((res,rej)=>{http.get(u,r=>{let b="";r.on("data",c=>b+=c);r.on("end",()=>res(b));}).on("error",rej);});}
(async()=>{
  if(!KEY){console.error("OPINET_API_KEY 미설정");process.exit(1);}
  const all=JSON.parse(await get(`http://www.opinet.co.kr/api/avgAllPrice.do?out=json&code=${KEY}`));
  const sd =JSON.parse(await get(`http://www.opinet.co.kr/api/avgSidoPrice.do?out=json&code=${KEY}&prodcd=D047`));
  const map={B027:"gasoline",D047:"diesel",B034:"premium",K015:"lpg"};
  const oil={}; let date="";
  (all.RESULT.OIL||[]).forEach(r=>{const k=map[r.PRODCD]; if(k)oil[k]={price:parseFloat(r.PRICE),diff:parseFloat(r.DIFF)}; if(r.TRADE_DT)date=r.TRADE_DT;});
  const sido=[];
  (sd.RESULT.OIL||[]).forEach(r=>{ if(String(r.SIDOCD)==="00")return; sido.push({name:String(r.SIDONM),price:parseFloat(r.PRICE),diff:parseFloat(r.DIFF)});});
  if(!Object.keys(oil).length){console.error("유효 데이터 없음");process.exit(1);}
  const out={date,updated:new Date().toISOString().slice(0,10),source:"한국석유공사 오피넷",oil,sido};
  fs.writeFileSync("fuel-prices.json",JSON.stringify(out,null,2)+"\n");
  console.log("updated",date,"sido",sido.length);
})();
