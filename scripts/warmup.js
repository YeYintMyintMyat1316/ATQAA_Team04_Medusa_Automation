// Wakes the Render free-tier server (cold start ~30-50 s) before running tests.
const url = "https://atqaa-medusa-store.onrender.com/health";
const tries = 8, waitMs = 10000;

async function main() {
  for (let i = 1; i <= tries; i++) {
    const t0 = Date.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
      console.log(`warm-up ${i}/${tries}: HTTP ${res.status} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      if (res.ok) return;
    } catch (e) {
      console.log(`warm-up ${i}/${tries}: ${e.name} after ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
    await new Promise(r => setTimeout(r, waitMs));
  }
  console.error("Server did not wake up");
  process.exit(1);
}
main();
