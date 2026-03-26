---
name: tdd-workflow
description: Test-Driven Development workflow with Vitest 4
trigger: When user says /tdd or "use TDD" or "test first"
---

# TDD Workflow (Red-Green-Refactor)

## Setup
- Test framework: Vitest 4 with jsdom environment
- Test location: co-located with source (e.g., `foo.test.ts` next to `foo.ts`)
- Factories: `src/test/factories.ts` — use createMockUser, createMockCompany, createMockSubscription, createMockFireExtinguisher, createMockPaymentTransaction
- Helpers: `src/test/renderHelpers.tsx` — renderWithRouter, renderWithAuth

## Step 1: RED — Write Failing Test
1. Create test file next to the source file
2. Write test that describes the desired behavior
3. Use descriptive test names: `it('should reject expired certificates')`
4. Use factories for mock data, never hardcode
5. Run: `pnpm test -- run path/to/file.test.ts`
6. Confirm test FAILS (red)

## Step 2: GREEN — Minimum Implementation
1. Write the minimum code to make the test pass
2. No premature optimization or extra features
3. Run test again, confirm PASS (green)

## Step 3: REFACTOR — Clean Up
1. Remove duplication
2. Improve naming
3. Extract if needed (but don't over-abstract)
4. Run tests again to confirm still green

## Rules
- Never write implementation before the test
- One test at a time
- Mock Supabase client using vi.mock (see src/test/setup.ts for patterns)
- For components: use renderWithAuth() which wraps AuthContext + MemoryRouter
- Target: 80% coverage for new code
- Run coverage: `pnpm test -- run --coverage path/to/file.test.ts`

## Patterns
### Service test
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client');

describe('myService', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('should do X', async () => { /* ... */ });
});
```

### Component test
```typescript
import { describe, it, expect } from 'vitest';
vi.mock('@/lib/auth/AuthContext');
import { renderWithAuth } from '@/test/renderHelpers';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithAuth(<MyComponent />);
    expect(getByText('Title')).toBeInTheDocument();
  });
});
```
