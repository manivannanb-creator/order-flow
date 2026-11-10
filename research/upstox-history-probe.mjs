// Isolated, read-only Upstox historical-data probe.
// No server, no trading, no token logging, no fabricated candle data.
const token = process.env.UPSTOX_ACCESS_TOKEN;
const instrument = process.env.UPSTOX_TEST_INSTRUMENT || "NSE_EQ|INE002A01018";
const to = process.env.UPSTOX_TEST_TO || "2026-11-06";
const from = process.env.UPSTOX_TEST_FROM || "2026-11-05";
const unit = process.env.UPSTOX_TEST_UNIT || "minutes";
const interval = process.env.UPSTOX_TEST_INTERVAL || "5";
const encode = encodeURIComponent;
function report(data) { console.log(JSON.stringify(data)); }
if (!token) {
  report({status:"NOT_CONFIGURED",message:"UPSTOX_ACCESS_TOKEN missing. Add it as a protected variable on this worker; never paste it in logs or source."});
  process.exit(0);
}
const endpoint = `https://api.upstox.com/v3/historical-candle/${encode(instrument)}/${unit}/${interval}/${to}/${from}`;
try {
  const res = await fetch(endpoint,{headers:{"Accept":"application/json","Authorization":`Bearer ${token}`},signal:AbortSignal.timeout(20000)});
  const body = await res.json().catch(()=>({}));
  const candles = body?.data?.candles;
  const rows = Array.isArray(candles)?candles:[];
  report({
    status:res.ok?"HTTP_OK":"HTTP_ERROR",
    httpStatus:res.status,
    instrument,from,to,interval:`${interval} ${unit}`,
    candleCount:rows.length,
    firstCandleTimestamp:rows.at(-1)?.[0]??null,
    lastCandleTimestamp:rows[0]?.[0]??null,
    candleWidth:rows[0]?.length??0,
    oiPresent:rows.some(r=>r.length>=7&&r[6]!==null&&r[6]!==undefined),
    oiNonNullRows:rows.filter(r=>r.length>=7&&r[6]!==null&&r[6]!==undefined).length,
    apiErrorCode:body?.errors?.[0]?.errorCode??body?.errors?.[0]?.error_code??null,
    apiErrorMessage:body?.errors?.[0]?.message??null
  });
} catch(e) {
  report({status:"NETWORK_ERROR",error:e?.name??"Error",message:String(e?.message??e).slice(0,250)});
  process.exitCode=1;
}
