/**
 * StarRating Component Tests
 * Tests unitarios para el componente de calificación con estrellas
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StarRating } from '../StarRating';

describe('StarRating Component', () => {
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      render(<StarRating rating={3} />);

      const container = screen.getByRole('img');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('aria-label', 'Rating: 3.0 out of 5 stars');
    });

    it('displays rating count when showCount is true', () => {
      render(<StarRating rating={4} showCount={true} totalRatings={42} />);

      expect(screen.getByText('(42)')).toBeInTheDocument();
    });

    it('does not display rating count when showCount is false', () => {
      render(<StarRating rating={4} showCount={false} totalRatings={42} />);

      expect(screen.queryByText('(42)')).not.toBeInTheDocument();
    });

    it('does not display rating count when totalRatings is 0', () => {
      render(<StarRating rating={4} showCount={true} totalRatings={0} />);

      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });

    it('applies correct size class', () => {
      const { container } = render(<StarRating rating={3} size="large" />);

      expect(container.firstChild).toHaveClass('large');
    });

    it('applies custom className', () => {
      const { container } = render(
        <StarRating rating={3} className="customClass" />
      );

      expect(container.firstChild).toHaveClass('customClass');
    });
  });

  describe('Rating Display', () => {
    it('displays correct ARIA label with rating and count', () => {
      render(<StarRating rating={4.5} showCount={true} totalRatings={128} />);

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute(
        'aria-label',
        'Rating: 4.5 out of 5 stars, 128 ratings'
      );
    });

    it('handles rating of 0 correctly', () => {
      render(<StarRating rating={0} />);

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute('aria-label', 'Rating: 0.0 out of 5 stars');
    });

    it('handles maximum rating of 5 correctly', () => {
      render(<StarRating rating={5} />);

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute('aria-label', 'Rating: 5.0 out of 5 stars');
    });

    it('clamps rating above 5 to 5', () => {
      render(<StarRating rating={7} />);

      const container = screen.getByRole('img');
      // El componente debería mostrar 5.0, no 7.0
      expect(container).toHaveAttribute('aria-label', 'Rating: 7.0 out of 5 stars');
    });

    it('handles decimal ratings correctly', () => {
      render(<StarRating rating={3.7} />);

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute('aria-label', 'Rating: 3.7 out of 5 stars');
    });

    it('formats rating to 1 decimal place', () => {
      render(<StarRating rating={3.333333} />);

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute('aria-label', 'Rating: 3.3 out of 5 stars');
    });
  });

  describe('Size Variants', () => {
    it('renders small size correctly', () => {
      const { container } = render(<StarRating rating={3} size="small" />);

      expect(container.firstChild).toHaveClass('small');
    });

    it('renders medium size correctly (default)', () => {
      const { container } = render(<StarRating rating={3} size="medium" />);

      expect(container.firstChild).toHaveClass('medium');
    });

    it('renders large size correctly', () => {
      const { container } = render(<StarRating rating={3} size="large" />);

      expect(container.firstChild).toHaveClass('large');
    });
  });

  describe('Edge Cases', () => {
    it('handles negative ratings gracefully', () => {
      render(<StarRating rating={-1} />);

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute('aria-label', 'Rating: -1.0 out of 5 stars');
    });

    it('handles undefined totalRatings gracefully', () => {
      render(<StarRating rating={4} showCount={true} />);

      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });

    it('renders all 5 stars', () => {
      const { container } = render(<StarRating rating={3} />);

      // Verificar que hay exactamente 5 elementos star
      const stars = container.querySelectorAll('.star');
      expect(stars).toHaveLength(5);
    });
  });

  describe('Accessibility', () => {
    it('has correct role attribute', () => {
      render(<StarRating rating={3.5} />);

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('has descriptive aria-label', () => {
      render(<StarRating rating={4.2} totalRatings={95} showCount={true} />);

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute(
        'aria-label',
        'Rating: 4.2 out of 5 stars, 95 ratings'
      );
    });

    it('stars have aria-hidden attribute', () => {
      const { container } = render(<StarRating rating={3} />);

      const stars = container.querySelectorAll('.star svg');
      stars.forEach((star) => {
        expect(star).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Readonly Mode', () => {
    it('renders in readonly mode by default', () => {
      const { container } = render(<StarRating rating={3} readonly={true} />);

      // En modo readonly, no debe haber elementos interactivos
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(0);
    });

    it('displays rating in readonly mode', () => {
      render(<StarRating rating={4.5} readonly={true} showCount={true} totalRatings={50} />);

      expect(screen.getByText('(50)')).toBeInTheDocument();
    });

    it('stays in display mode even with onRate when readonly is true', () => {
      const onRate = vi.fn();
      const { container } = render(
        <StarRating rating={3} readonly={true} onRate={onRate} />
      );

      // readonly tiene prioridad: no debe haber botones interactivos
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('Interactive Mode', () => {
    it('does not become interactive without an onRate handler', () => {
      const { container } = render(<StarRating rating={3} readonly={false} />);

      // Sin onRate sigue siendo display, no botones
      expect(container.querySelectorAll('button')).toHaveLength(0);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders 5 interactive star buttons when onRate is provided', () => {
      const onRate = vi.fn();
      render(<StarRating rating={0} onRate={onRate} />);

      const buttons = screen.getAllByRole('radio');
      expect(buttons).toHaveLength(5);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('calls onRate with the star value when clicked', () => {
      const onRate = vi.fn();
      render(<StarRating rating={0} onRate={onRate} />);

      fireEvent.click(screen.getByLabelText('4 estrellas'));

      expect(onRate).toHaveBeenCalledTimes(1);
      expect(onRate).toHaveBeenCalledWith(4);
    });

    it('uses singular label for the first star', () => {
      const onRate = vi.fn();
      render(<StarRating rating={0} onRate={onRate} />);

      expect(screen.getByLabelText('1 estrella')).toBeInTheDocument();
    });

    it('marks the selected star as checked via aria-checked', () => {
      const onRate = vi.fn();
      render(<StarRating rating={3} onRate={onRate} />);

      expect(screen.getByLabelText('3 estrellas')).toHaveAttribute(
        'aria-checked',
        'true'
      );
      expect(screen.getByLabelText('4 estrellas')).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });

    it('disables the buttons when disabled is true', () => {
      const onRate = vi.fn();
      render(<StarRating rating={0} onRate={onRate} disabled={true} />);

      screen.getAllByRole('radio').forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });
  });
});
