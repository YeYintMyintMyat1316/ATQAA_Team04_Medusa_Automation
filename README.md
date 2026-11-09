# ATQAA_Team04_Medusa_Automation

Advanced Testing & QA Automation (61VLSC45332201) - Capstone project, Team 04.
Quality engineering of the Medusa.js v2 headless e-commerce platform on Render Cloud staging.

| System | URL |
| :--- | :--- |
| Storefront UI | https://atqaa-medusa-storefront.vercel.app/vn |
| Store API | https://atqaa-medusa-store.onrender.com/store |
| Admin UI | https://atqaa-medusa-store.onrender.com/app/ |
| Admin API | https://atqaa-medusa-store.onrender.com/admin |

## Engineering Role Matrix & Assignee Mapping

| Role | Specialist Track | Primary Technical Responsibilities | Jira Assignee (Full Name & Email) |
| :--- | :--- | :--- | :--- |
| **Student A** | **Lead QE & Playwright Specialist** | Web UI Page Object Model (POM), E2E Checkout flows, Admin Fulfillment verification, CI/CD Pipeline orchestration. | Ye Yint Myint Myat - 2500it10016@vanlangsaigon.edu.vn |
| **Student B** | **API Automation Engineer** | Postman Collections, Dynamic JS chaining, Pre-request & Test scripts, Newman CLI runner integration. | Thae Phyu Aung Myo - 2500it10013@vanlangsaigon.edu.vn |
| **Student C** | **Synthetic Data & Performance Specialist** | GDPR Synthetic Test Data generation (1,000+ rows), k6 Load Engine scripts, Stress/Soak test execution. | Ye Yint Myint Myat - 2500it10016@vanlangsaigon.edu.vn |

> Team04 has 2 members: Ye Yint Myint Myat covers both the Student A and Student C roles.

## Repository layout

```
postman/
  collections/    Team04_Medusa_API_Collection.postman_collection.json
  environments/   Medusa_Staging_Env.postman_environment.json
  data/           test_data_checkout.csv   (DDT dataset, 10 rows)
playwright/       pages/ (POM), tests/
k6/               scripts/, data/
docs/             Sprint 1 survey, Prompt_Log, Requirement Profile
reports/          Newman HTML reports (generated)
.github/workflows/testing-pipeline.yml
```

## Running the API suite locally

```bash
npm install -g newman newman-reporter-htmlextra
# wake the Render free-tier server first (cold start ~30-50 s)
curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" https://atqaa-medusa-store.onrender.com/health

newman run postman/collections/Team04_Medusa_API_Collection.postman_collection.json \
  -e postman/environments/Medusa_Staging_Env.postman_environment.json \
  -d postman/data/test_data_checkout.csv \
  -r cli,htmlextra --reporter-htmlextra-export reports/Team04_API_Automation_Report.html
```

## Workflow conventions

- Branch names and commits carry the Jira key, e.g. `feature/MED-41-export-postman-jsons`, `MED-41 #done Export Postman JSON`.
- `main` is protected: PR + approval + passing status checks required.
