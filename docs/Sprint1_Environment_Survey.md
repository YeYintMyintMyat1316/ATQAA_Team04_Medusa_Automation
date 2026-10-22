# Sprint 1 - Staging Environment Survey (Task 1.4.1)

Team04 - surveyed 2026-10-22 (ICT, UTC+7). Backend: Medusa.js v2.21.2 on Render free tier.

## 1. Endpoint connectivity

| Check | Request | Result |
| :--- | :--- | :--- |
| Health | `GET /health` | 200 `OK` |
| Store API - catalog | `GET /store/products` (with `x-publishable-api-key`) | 200, 8 products, ~550 ms |
| Store API - regions | `GET /store/regions` | 200, 1 region: Vietnam (`vn`, VND) |
| Store API - no key | `GET /store/products` without key | 400 `Publishable API key required` |
| Admin auth | `POST /auth/user/emailpass` | 200, JWT returned, ~1.0-1.1 s |
| Admin API | `GET /admin/api-keys?type=publishable` (Bearer) | 200, 1 active publishable key |

Screenshots to attach in Jira (taken by the team): Storefront + DevTools Network showing `/store/products` 200; authenticated Admin dashboard.

## 2. Cold-start benchmark

Render free-tier instances sleep after 15 minutes without traffic. During this survey the first browser request was answered by Render's "Application loading" interstitial before the app responded.

Measured cold-start latency: **[FILL IN - run the curl probe below after >15 min idle; expected 30-50 s]**

```bash
curl -w "\nHTTP Status: %{http_code}\nTotal Latency: %{time_total}s\n" -o /dev/null -s \
  https://atqaa-medusa-store.onrender.com/store/products
```

## 3. Warm latency baseline (for SLA design)

| Endpoint | Warm latency observed |
| :--- | :--- |
| GET /store/carts/{id} | 279-442 ms |
| GET /store/products | 554 ms |
| POST /auth/user/emailpass | 1043-1137 ms |
| POST /store/carts | 1204-1635 ms |
| POST /store/carts/{id}/line-items | 1634-1898 ms |

## 4. Testing implications

- Always warm up (`GET /health`) before Newman / Playwright / k6 runs; CI workflow does this with retries.
- Use generous timeouts on first request (>= 60 s) and retries in CI.
- Write endpoints exceed the 1200 ms SLA from Lab 02 even when warm; GET and POST latency budgets are tracked separately (1200 ms / 2500 ms).
- Every `/store/*` call needs the `x-publishable-api-key` header (Medusa v2).
