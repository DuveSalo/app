# Settings Feature

User profile, company management, employee management, and billing/subscription settings.

## Architecture

```
settings/
├── SettingsPage.tsx              # Main settings page (tabbed layout)
├── components/
│   ├── ProfileSection.tsx        # User profile display/edit
│   ├── CompanyInfoSection.tsx    # Company details
│   ├── EmployeeSection.tsx       # Employee list + management
│   ├── EmployeeModal.tsx         # Add/edit employee modal
│   ├── BillingSection.tsx        # Subscription status + plan info
│   └── ChangePlanModal.tsx       # Plan upgrade/downgrade modal
└── hooks/
    └── useSettingsData.ts        # Data fetching hook for settings
```

## Rules

- Settings page uses tab-based navigation (Profile, Company, Employees, Billing).
- Employee management must respect company-level RLS — users can only manage employees within their company.
- Billing section integrates with MercadoPago subscription management (cancel, suspend, reactivate, change plan).
- Plan changes trigger Edge Function calls — never modify subscription state directly in the client.

## Security

- Employee invitations should validate email format before sending.
- Subscription actions (cancel, change plan) must show confirmation dialogs.
- Never expose billing details (payment method, full card numbers) in the UI.
