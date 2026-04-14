import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './input';

describe('Input visual state contract', () => {
  it('owns its focus indicator without stacking the global outline', () => {
    render(<Input aria-label="Email" type="email" />);

    const input = screen.getByLabelText('Email');

    expect(input).toHaveClass('focus-visible:border-ring');
    expect(input).toHaveClass('focus-visible:ring-2');
    expect(input).toHaveClass('focus-visible:ring-ring/35');
    expect(input).toHaveClass('focus-visible:outline-none');
  });

  it('neutralizes browser autofill chrome with app tokens', () => {
    const globalsCss = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

    expect(globalsCss).toContain('input:-webkit-autofill');
    expect(globalsCss).toContain('-webkit-text-fill-color: var(--foreground)');
    expect(globalsCss).toContain('box-shadow: 0 0 0 1000px var(--background) inset');
    expect(globalsCss).toContain('caret-color: var(--foreground)');
  });
});
