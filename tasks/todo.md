# Phase D — Bank Transfer User Flow ✅

## Overview
Add "Transferencia bancaria" as an alternative payment method in the subscription flow, allow users to upload comprobantes, and show payment status with notifications.

## Tasks

### Subagent 1: Bank Transfer Option in Subscription Flow ✅
- [x] Add payment method selector (MercadoPago vs Transferencia bancaria) to SubscriptionPage
- [x] Create BankDetailsCard component showing CBU, alias, titular, banco (with copy buttons)
- [x] Update Company type to include `paymentMethod` and `bankTransferStatus` fields
- [x] Update mapCompanyFromDb to map `payment_method` and `bank_transfer_status` from DB
- [x] Create `bankTransfer.ts` API service (submitBankTransferPayment, uploadReceipt, getLatestManualPayment)
- [x] Add BANK_TRANSFER_UPLOAD and BANK_TRANSFER_STATUS routes
- [x] Update ProtectedRoute to allow access to bank transfer pages

### Subagent 2: Comprobante Upload ✅
- [x] Create BankTransferUploadPage.tsx with FileUpload for receipt (PDF/image, max 10MB)
- [x] Upload to `receipts/{companyId}/{paymentId}.{ext}` in Supabase Storage
- [x] Update manual_payment record with receipt_url and receipt_uploaded_at
- [x] Register lazy pages in routes.config.ts
- [x] Add routes in App.tsx (onboarding section, ProtectedRoute wrapped)
- [x] Show toast.success on upload + navigate to status page

### Subagent 3: Payment Status Page + Notifications ✅
- [x] Create BankTransferStatusPage.tsx with 3 states (pending/approved/rejected)
- [x] Show rejection reason in muted box, option to re-upload
- [x] Polls every 10s for status updates, auto-redirect on approval
- [x] Add notification insert to approvePayment (type: system, "Pago aprobado")
- [x] Add notification insert to rejectPayment (type: info, "Pago rechazado" + reason)
- [x] Set bank_transfer_status to 'active' on approval

## Verification ✅
- [x] `pnpm build` passes (19.5s, Turbopack, 0 errors)
- [x] Fixed BankTransferStatusPage useAuth destructuring (user→currentCompany)
- [x] Fixed BankTransferUploadPage null check on getLatestManualPayment

## Files Created
- `apps/web/src/lib/api/services/bankTransfer.ts`
- `apps/web/src/features/auth/components/BankDetailsCard.tsx`
- `apps/web/src/features/auth/BankTransferUploadPage.tsx`
- `apps/web/src/features/auth/BankTransferStatusPage.tsx`

## Files Modified
- `apps/web/src/types/company.ts` — added paymentMethod, bankTransferStatus
- `apps/web/src/lib/api/mappers.ts` — map payment_method, bank_transfer_status
- `apps/web/src/lib/api/services/index.ts` — export bankTransfer
- `apps/web/src/constants/routes.ts` — BANK_TRANSFER_UPLOAD, BANK_TRANSFER_STATUS
- `apps/web/src/features/auth/SubscriptionPage.tsx` — payment method toggle + bank transfer flow
- `apps/web/src/routes/ProtectedRoute.tsx` — allow bank transfer pages
- `apps/web/src/routes/routes.config.ts` — lazy imports
- `apps/web/src/App.tsx` — onboarding routes
- `apps/web/src/lib/api/services/admin.ts` — notifications + bank_transfer_status on approve/reject
