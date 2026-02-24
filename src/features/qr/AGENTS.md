# QR Modules Feature

Multi-type QR code document management. Supports multiple QR module types (elevators, water heaters, fire safety, detection systems).

## Architecture

```
qr/
├── QRModuleListPage.tsx         # Shared list view for all QR types
├── UploadQRDocumentPage.tsx     # Upload new QR document
└── EditQRDocumentPage.tsx       # Edit existing QR document
```

## Rules

- QR modules are **polymorphic** — same components handle multiple entity types.
- Route config in `QR_MODULE_ROUTES` array generates routes dynamically.
- Each QR type has its own route path but shares the same page components.
- Service: `src/lib/api/services/qr.ts`.
- PDF generation for QR codes uses `jsPDF` via `src/lib/api/services/pdf.ts`.

## Module Types

| Type | Route | Description |
|------|-------|-------------|
| Elevators | `/qr-elevators` | Elevator inspection QR codes |
| Water Heaters | `/qr-water-heaters` | Water heater compliance QR codes |
| Fire Safety | `/qr-fire-safety` | Fire safety equipment QR codes |
| Detection | `/qr-detection` | Detection system QR codes |
