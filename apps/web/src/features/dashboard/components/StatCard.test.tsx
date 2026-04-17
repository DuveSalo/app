import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';

const defaultProps = {
  label: 'Vigentes',
  value: 5,
  icon: <TrendingUp className="h-3.5 w-3.5" />,
  changeText: '+3 este mes',
  variant: 'valid' as const,
};

describe('StatCard', () => {
  it('renders label, value and changeText', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('Vigentes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('+3 este mes')).toBeInTheDocument();
  });

  it('renders without HoverCard wrapper when no hoverItems provided', () => {
    render(<StatCard {...defaultProps} />);
    // No HoverCard trigger data attribute should be present
    expect(document.querySelector('[data-slot="hover-card-trigger"]')).toBeNull();
  });

  it('renders without HoverCard wrapper when hoverItems is empty', () => {
    render(<StatCard {...defaultProps} hoverItems={[]} />);
    expect(document.querySelector('[data-slot="hover-card-trigger"]')).toBeNull();
    expect(screen.getByText('Vigentes')).toBeInTheDocument();
  });

  it('wraps card in HoverCard trigger when hoverItems has items', () => {
    const hoverItems = [
      { name: 'Documento A', expirationDate: '2025-06-01' },
      { name: 'Documento B', expirationDate: '2025-07-15' },
    ];
    render(<StatCard {...defaultProps} hoverItems={hoverItems} />);
    expect(document.querySelector('[data-slot="hover-card-trigger"]')).not.toBeNull();
  });

  it('card has cursor-pointer class when hoverItems has items', () => {
    const hoverItems = [{ name: 'Doc A', expirationDate: '2025-01-01' }];
    render(<StatCard {...defaultProps} hoverItems={hoverItems} />);
    const cardDiv = screen.getByText('Vigentes').closest('div[class*="rounded-lg"]');
    expect(cardDiv).toHaveClass('cursor-pointer');
  });

  it('card does NOT have cursor-pointer when no hoverItems provided', () => {
    render(<StatCard {...defaultProps} />);
    const cardDiv = screen.getByText('Vigentes').closest('div[class*="rounded-lg"]');
    expect(cardDiv).not.toHaveClass('cursor-pointer');
  });

  it('card does NOT have cursor-pointer when hoverItems is empty', () => {
    render(<StatCard {...defaultProps} hoverItems={[]} />);
    const cardDiv = screen.getByText('Vigentes').closest('div[class*="rounded-lg"]');
    expect(cardDiv).not.toHaveClass('cursor-pointer');
  });

  it('renders all variants without errors', () => {
    const variants = ['total', 'valid', 'expiring', 'expired'] as const;
    for (const variant of variants) {
      const { unmount } = render(<StatCard {...defaultProps} variant={variant} />);
      expect(screen.getByText('Vigentes')).toBeInTheDocument();
      unmount();
    }
  });
});
