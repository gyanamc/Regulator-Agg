# Source Registry: Regulatory Intelligence Hub India

## 1. Regulators & Official Source Endpoints

This registry records official regulatory publication channels, access mechanisms, frequency, legal/licensing boundaries, and implementation status for the MVP.

| Regulator | Short Name | Official Portal | Monitored Publication URL | Content Types | Ingestion Mode | Status |
|---|---|---|---|---|---|---|
| **Indian Computer Emergency Response Team** | **CERT-In** | `https://www.cert-in.org.in` | `https://www.cert-in.org.in/s2cIOs?action=advisories` (and public RSS feed) | Security Advisories, Vulnerability Notes, Cyber Directives | Live HTTP Ingestion + RSS Parser | **Live Functional Connector** |
| **Reserve Bank of India** | **RBI** | `https://www.rbi.org.in` | `https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx` & `Notifications.aspx` | Master Directions, Circulars, Notifications | Modular Connector Shell (Live Feeds / Scraper Guard + Fixture Fallback) | **Active Shell + Verified Fixtures** |
| **Securities and Exchange Board of India** | **SEBI** | `https://www.sebi.gov.in` | `https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&smid=0&ssid=7` | Circulars, Master Circulars, Guidelines | Modular Connector Shell + Fixture Fallback | **Active Shell + Verified Fixtures** |
| **National Payments Corporation of India** | **NPCI** | `https://www.npci.org.in` | `https://www.npci.org.in/what-we-do/upi/circulars` | Operational Circulars, Tech Specifications, Security Directives | Modular Connector Shell + Fixture Fallback | **Active Shell + Verified Fixtures** |
| **Insurance Regulatory and Development Authority of India** | **IRDAI** | `https://irdai.gov.in` | `https://irdai.gov.in/circulars` | Master Directions, Circulars, Cyber Insurance Guidelines | Modular Connector Shell + Fixture Fallback | **Active Shell + Verified Fixtures** |

---

## 2. Ingestion Policies, Legal & Ethical Scraping Rules

1. **Public Information Grounding**: Only publicly disclosed, non-gated regulatory guidelines, directions, and circulars are monitored. No login portals, bypass mechanisms, or CAPTCHA circumvention tools are used.
2. **Politeness & Rate Limiting**:
   - A minimum crawl delay of 2.5 seconds between document downloads.
   - User-Agent header clearly identifies the platform:
     `User-Agent: RegulatoryIntelligenceHubBot/1.0 (+https://regulatoryintelligencehub.in/bot; compliance-research)`
   - Full respect of `robots.txt` directives.
3. **Data Integrity & Cryptographic Hashing**:
   - Every downloaded file is fingerprinted with `SHA-256`.
   - If an official publication is updated silently by a regulator at the same URL, the hash difference triggers a new version alert while retaining the historical version.
4. **Administrative Manual Upload**:
   - Administrators can manually upload official PDFs (with circular number, official URL, and date) to ingest emergency circulars before the scheduled crawler cycle runs.

---

## 3. Demo & Fixture Data Policy

- All sample or offline development documents MUST carry:
  1. `isDemo: true` in database records.
  2. Clear prefix or badge: `[DEMO_DATA]`.
  3. Noticeable amber banner in the user interface indicating:
     *"Local Fixture Mode: Displaying test fixtures for demonstration and development purposes."*
- Demo documents must use generic, non-real circular numbers (e.g. `DEMO-RBI-CYBER-2024-01`, `DEMO-CERTIN-ADV-2024-99`) to prevent any confusion with authentic regulatory mandates.
- Real publications ingested from live sources (e.g. CERT-In live advisories) carry `isDemo: false` and render with an official green source verification indicator.
