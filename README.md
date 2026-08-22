# 🛡️ Verix — AI Cyber & UPI Fraud Detection System & Bank Admin Dashboard

A real-time AI Cyber & UPI Fraud Detection System and Bank Admin Surveillance Dashboard built with HTML5, CSS (Dark Cyber Navy `#0B132B` / `#040D1A` design system with Emerald Green, Amber, and Crimson Red accents), and fast REST API integration with the Verix Backend (`https://fruadsih.onrender.com`).

---

## ⚡ Key Capabilities & Features

1. **Admin & Officer Authentication (`/login`)**:
   - Super Admin and Fraud Reviewer access modes with token session handling.
   - Demo credentials: `admin@verix.gov.in` / `cyber123`.

2. **Pre-Payment Threat Check Module (`/pre-check`)**:
   - **Inputs**: Recipient UPI VPA (`upi id`), Amount in ₹ (`amt`), Suspicious SMS / Call / Extortion remark (`message`), Payee Name (`name`).
   - **Active Call Detection Telemetry**: Toggles live phone call detection flag to identify high-risk *Digital Arrest* scams in progress.
   - **Preset Threat Simulations**: One-click test scenarios for **🚨 Digital Arrest Extortion**, **⚠️ Phishing APK Malware**, and **🟢 Safe Grocery**.

3. **Decision Branching Logic**:
   - **🟢 Path A: Approved Flow (Low Risk)**:
     - **Verification Screen**: Validates NPCI PSP domain reputation (98%+ safety score).
     - **Waiting Screen**: Live animated SVG circular countdown timer (`00:04`) running checks across NPCI switch, 1930 Cyber Fraud Database, and biometric bindings.
     - **Payment Screen**: "Task approved: ready to pay" with prominent pulsating green **`[ ₹ PAY ]`** button.
   - **🔴 Path B: Rejected Flow (Flagged Threat / Blacklisted VPA)**:
     - **Warning Screen / Modal**: `⚠️ WARNING: This is not a secure payment or a verified user.`
     - Displays specific extortion/fraud triggers.
     - **`[ ❌ BLOCK ]`**: Terminates transfer, alerts National Cybercrime portal (1930), and blacklists the VPA.
     - **`[ ✔️ CONTINUE ]`**: Prompts for supervisor OTP / biometric override authorization.

4. **Customer Accounts & Cards Registry (`/menu`)**:
   - Displays User Name, Phone Number, Card Last 4, Expiry Date, and Risk Status.
   - Support for registering new cards and blocking/unblocking accounts.

5. **Threat Message & Intercept Hub (`/user`)**:
   - Real-time stream of intercepted SMS phishing attempts and extortion threats.
   - Built-in Automated Honeypot response trigger and officer advisory messenger.

6. **I4C Scam Intel Feeds & 1930 Blacklist**:
   - Live synchronization with National Cybercrime Reporting Portal (1930).
   - Mule account and rogue VPA management.

7. **Mobile Action Bar**:
   - Bottom input bar with `[ + ]` quick handoff trigger for mobile devices.

---

## 🔗 Integrated REST API Endpoints

- **UPI Risk Assessment**: `POST https://fruadsih.onrender.com/api/v1/risk/check`
- **Supervisor Override Confirmation**: `POST https://fruadsih.onrender.com/api/v1/risk/confirm-override`
- **Threat Intel Reporting**: `POST https://fruadsih.onrender.com/api/v1/threat-intel/report`

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser or serve locally:

```bash
# Using Python
python3 -m http.server 3000

# Using Node.js npx serve
npx serve .
```
