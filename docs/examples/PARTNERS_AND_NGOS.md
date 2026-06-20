# Corporate and NGO Partners in Jenga365

Jenga365 integrates both **Corporate Partners** and **NGO Partners**. While they share similar onboarding, they follow fundamentally different workflows within the application, particularly around financial contributions and Resource Exchange.

This document outlines an example of each, explaining how they interact with the system, what Data Studio components apply to them, and how their data links back to the frontend dashboards.

---

## 1. Corporate Partner Example
**Example:** *EcoCorp*
**Objective:** Sponsors Jenga365's "Green Game" by providing financial funding based on predefined tree survival and mentorship milestones.

### Interaction with the System
- **Registration**:
  - EcoCorp registers via `/register/corporate`.
  - During the sign-up process, they agree to the milestone-based Contribution Model and sign the related NDA/Protocol.
- **Workflow**:
  - Their `role` is set to `CorporatePartner` and their `orgType` metadata is `Corporate`.
  - They participate in the **Financial Flow**. As field audits report tree survival and events take place, "milestones" track progress (`corporate_unlock_milestones` table).
  - Once a threshold is crossed, a milestone unlocks, which signals to the partner (via notifications/Paystack integration) to release pledged funds or resources.

### Looker Studio (Data Studio) Setup
Corporate Partners receive a personalized, live Impact Report generated in Looker Studio.
1. **Underlying Data**: Drizzle maintains PostgreSQL Views specifically for Corporate reporting. Looker reads:
   - `v_corporate_partner_scorecard`: Shows unlocked vs. locked milestones.
   - `v_unlocked_resources`: Highlights resources, amounts, and statuses tied to unlocked milestones.
2. **Provisioning via Script**: To setup the Looker Studio iframe on the dashboard, run:
   ```bash
   npx dotenv -e .env -- npm run partner:looker \
     --partner=<corporate-partner-uuid> \
     --report-id=<looker_report_id> \
     --share-url=<https://lookerstudio.google.com/...>
   ```
   *This script binds the Partner ID to the report ID and share URL in the database.*

### Linking to the Frontend
- The Partner accesses their dashboard at `/dashboard/partner`.
- If their Looker columns (`lookerReportId` and `lookerShareUrl`) are populated, the `LookerEmbed` component will display their iframe dynamically, allowing them to instantly see the real-time ESG Scorecard.

---

## 2. NGO Partner Example
**Example:** *Green Earth Foundation*
**Objective:** Partners with Jenga365 to facilitate resource distribution (e.g., saplings, shovels, or volunteer time), bypassing the direct financial workflows.

### Interaction with the System
- **Registration**:
  - They register via `/register/ngo` (which secretly redirects to `/register/corporate?type=ngo`).
  - Because the URL includes `type=ngo`, the system auto-sets their `orgType` to `NGO` and explicitly **skips** the corporate Contribution Model step.
- **Workflow**:
  - Their `role` is set to `NGO`.
  - **MOU Agreement**: Once they log in, they cannot access the dashboard until they have a signed Memorandum of Understanding (MOU). This is stored in `ngo_mou_agreements`.
  - **Resource Exchange**: Instead of financial transactions, NGOs log peer-to-peer or partner-to-partner transfers using the Resource Exchange Log (`resource_exchange_log`). These logs explicitly have no Paystack/financial payment references by design.

### Looker Studio (Data Studio) Setup
- Unlike Corporate Partners who receive automated milestone ESG reporting frames via Looker Studio, NGOs use the native frontend components to view their exchange logs.
- General Public Impact Data from Data Studio (`v_public_impact_aggregate`) may be shared with NGOs for broader reporting, but they do not typically need the `partner:looker` provisioning script run for their account.

### Linking to the Frontend
- The NGO accesses their dashboard at `/dashboard/ngo`.
- The Next.js frontend checks if the user's `metadata.orgType` is `NGO`.
- **MOU Gate**: If `getNgoMouStatus()` returns false (no signed MOU), the dashboard automatically redirects to `/dashboard/ngo/mou` to force signing.
- **Dashboard Data**: Once the MOU is active, the NGO dashboard renders the `NgoDashboard` component which lists their recent Resource Exchanges (`getNgoExchangeLog()`) without any financial UI elements.

---

## Seed Data Usage

To test these two examples locally, run the seed script:
```bash
npm run seed:partners
```

This creates:
- **EcoCorp (Corporate Partner)**
  - Email: `admin@ecocorp.example.com`
  - Has pre-seeded unlock milestones.
- **Green Earth Foundation (NGO Partner)**
  - Email: `admin@greenearth.example.com`
  - Pre-seeded with a signed MOU, granting direct access to the NGO dashboard.
