# Testing Guide

## Overview

This project uses two testing frameworks:

- **Vitest** — unit and component tests (`*.test.ts` / `*.test.tsx`)
- **Playwright** — end-to-end browser tests (`*.spec.ts`)

## Test Structure

```
src/
  lib/
    api/
      mappers.test.ts          # DB-to-domain mapper tests
      services/
        auth.test.ts            # Auth utility tests
    utils/
      dateUtils.test.ts         # Date/expiration calculations
      companyUtils.test.ts      # CUIT validation, field validation
      typeGuards.test.ts        # JSON type converters
  routes/
    ProtectedRoute.test.tsx     # Route guard component tests
  test/
    setup.ts                    # Global test setup (mocks, cleanup)
e2e/
  smoke.spec.ts                 # App loads, basic structure
  auth.spec.ts                  # Login form, validation, redirects
```

## Naming Conventions

| Type | Pattern | Location |
|---|---|---|
| Unit test | `*.test.ts` | Co-located with source file |
| Component test | `*.test.tsx` | Co-located with component |
| E2E test | `*.spec.ts` | `e2e/` directory |

## Running Tests

### Unit Tests (Vitest)

```bash
# Watch mode (re-runs on change)
pnpm test

# Single run
pnpm test:run

# With coverage report
pnpm test:coverage
```

### E2E Tests (Playwright)

```bash
# Headless (auto-starts dev server)
pnpm test:e2e

# With Playwright UI (interactive)
pnpm test:e2e:ui

# Headed browser (visible)
pnpm test:e2e:headed
```

### Full Suite

```bash
pnpm test:run && pnpm test:e2e && pnpm build
```

## Writing Unit Tests

### Pure Functions

Place the test file next to the source:

```ts
// src/lib/utils/myUtil.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './myUtil';

describe('myFunction', () => {
  it('should handle the basic case', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### Date-Dependent Tests

Use `vi.useFakeTimers()` to make tests deterministic:

```ts
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-20T12:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Component Tests

The global setup provides mocks for Supabase, `matchMedia`, `IntersectionObserver`, and `ResizeObserver`. Additional mocks can be added per-test:

```ts
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../path/to/dependency', () => ({
  useSomething: vi.fn().mockReturnValue({ data: null }),
}));

test('renders component', () => {
  render(
    <MemoryRouter>
      <MyComponent />
    </MemoryRouter>
  );
  expect(screen.getByText('Expected text')).toBeInTheDocument();
});
```

### Mapper Tests

Test both the happy path and null/undefined edge cases:

```ts
it('should map all fields', () => {
  const result = mapXFromDb(mockData);
  expect(result.fieldName).toBe('expected');
});

it('should handle null optional fields', () => {
  const result = mapXFromDb({ ...mockData, optional_field: null });
  expect(result.optionalField).toBeUndefined();
});
```

## Writing E2E Tests

E2E tests run against the real app in a browser. The dev server starts automatically.

**Important:** The app uses `HashRouter`, so routes are `/#/login`, `/#/dashboard`, etc. Navigate to `/` and let the router redirect, rather than using `goto('/#/route')` directly.

```ts
// e2e/myFeature.spec.ts
import { test, expect } from '@playwright/test';

test('feature works', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('**/#/login');
  await expect(page.getByText('Expected')).toBeVisible();
});
```

## Excluded from Testing

- `src/components/ui/**` — shadcn/ui base components (third-party)
- `node_modules/`, `e2e/` — excluded from Vitest
- External services (Supabase, MercadoPago) are mocked in unit tests

## Coverage

Coverage reports are generated at `./coverage/` when running `pnpm test:coverage`. The V8 provider is used for speed.

## Debugging

### Vitest

```bash
# Run a single test file
pnpm test:run src/lib/utils/dateUtils.test.ts

# Run tests matching a name
pnpm test:run -t "CUIT"
```

### Playwright

```bash
# Debug a specific test with browser DevTools
pnpm test:e2e:headed --debug

# Generate trace on failure (auto-enabled on first retry)
# View traces: npx playwright show-trace test-results/.../trace.zip
```
