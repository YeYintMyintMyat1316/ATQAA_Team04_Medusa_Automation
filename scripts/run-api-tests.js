// Runs the Postman collection with Newman and writes:
//   reports/logs/newman_<timestamp>.log   - readable run log (every request + assertion + summary)
//   reports/Team04_API_Automation_Report.html  - HTML Extra report
//   reports/Team04_API_Automation_Report.json  - raw Newman JSON report
// Usage: node scripts/run-api-tests.js          (1 iteration, default data)
//        node scripts/run-api-tests.js --ddt    (10 iterations from test_data_checkout.csv)
const newman = require("newman");
const fs = require("fs");
const path = require("path");

const ddt = process.argv.includes("--ddt");
const root = path.join(__dirname, "..");
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const logDir = path.join(root, "reports", "logs");
fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, `newman_${stamp}${ddt ? "_ddt" : ""}.log`);
const log = fs.createWriteStream(logFile);
const line = (s = "") => log.write(`${new Date().toISOString()}  ${s}\n`);

const options = {
  collection: path.join(root, "postman/collections/Team04_Medusa_API_Collection.postman_collection.json"),
  environment: path.join(root, "postman/environments/Medusa_Staging_Env.postman_environment.json"),
  reporters: ["cli", "htmlextra", "json"],
  reporter: {
    htmlextra: {
      export: path.join(root, "reports/Team04_API_Automation_Report.html"),
      title: `Team04 Medusa API Automation Report${ddt ? " (DDT)" : ""}`,
    },
    json: { export: path.join(root, "reports/Team04_API_Automation_Report.json") },
  },
};
if (ddt) options.iterationData = path.join(root, "postman/data/test_data_checkout.csv");

line(`=== Team04 Medusa API run started | mode: ${ddt ? "DDT (test_data_checkout.csv)" : "single run"} ===`);
line(`Collection : ${path.basename(options.collection)}`);
line(`Environment: ${path.basename(options.environment)}`);

let failures = 0;
newman.run(options)
  .on("beforeIteration", (err, a) => line(`\n----- Iteration ${a.cursor.iteration + 1}/${a.cursor.cycles} -----`))
  .on("request", (err, a) => {
    const req = a.request, res = a.response;
    if (err) return line(`ERROR  ${req.method} ${req.url.toString()} -> ${err.message}`);
    const name = (a.item && a.item.name) ? a.item.name : "  (script request)";
    line(`${String(name).padEnd(32)} ${String(req.method).padEnd(6)} ${req.url.toString()} -> ${res.code} ${res.status} (${res.responseTime} ms, ${res.responseSize} B)`);
  })
  .on("assertion", (err, a) => {
    if (err) { failures++; line(`    FAIL  ${a.assertion}  ->  ${err.message}`); }
    else line(`    PASS  ${a.assertion}`);
  })
  .on("console", (err, a) => line(`    console.${a.level}: ${(a.messages || []).join(" ")}`))
  .on("done", (err, summary) => {
    const s = summary.run.stats, t = summary.run.timings;
    line("\n=== Summary ===");
    for (const k of ["iterations", "requests", "testScripts", "prerequestScripts", "assertions"]) {
      line(`${k.padEnd(18)} executed: ${String(s[k].total).padStart(5)}   failed: ${s[k].failed}`);
    }
    line(`duration           ${((t.completed - t.started) / 1000).toFixed(1)} s, avg response ${Math.round(t.responseAverage)} ms`);
    summary.run.failures.forEach((f, i) =>
      line(`failure ${i + 1}: [${f.source && f.source.name}] ${f.error.test || ""} -> ${f.error.message} (iteration ${f.cursor.iteration + 1})`));
    line(err || summary.run.failures.length ? "RESULT: FAILED" : "RESULT: PASSED (0 failures)");
    log.end(() => {
      console.log(`\nLog file: ${path.relative(root, logFile)}`);
      process.exit(err || summary.run.failures.length ? 1 : 0);
    });
  });
