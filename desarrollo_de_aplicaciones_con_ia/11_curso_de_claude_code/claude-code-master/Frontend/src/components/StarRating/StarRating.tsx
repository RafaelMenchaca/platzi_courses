/**
 * StarRating Component
 * Componente de calificación con estrellas.
 * - Modo display (por defecto): solo lectura, soporta medias estrellas.
 * - Modo interactivo: cuando se pasa `onRate` y `readonly` es false, las
 *   estrellas se vuelven botones clickeables (con hover y teclado).
 */

'use client';

import { useState } from 'react';
import styles from './StarRating.module.scss';

interface StarRatingProps {
  rating: number; // 0-5, puede ser decimal
  totalRatings?: number; // Número total de ratings
  showCount?: boolean; // Mostrar contador de ratings
  size?: 'small' | 'medium' | 'large'; // Tamaño visual
  readonly?: boolean; // Modo solo lectura
  className?: string; // Clase CSS adicional
  onRate?: (value: number) => void; // Handler de calificación (activa modo interactivo)
  disabled?: boolean; // Deshabilita la interacción (ej. mientras se envía)
}

/**
 * Sub-componente: Icono de estrella con diferentes estados de relleno
 */
interface StarIconProps {
  fillState: 'empty' | 'half' | 'full';
}

const StarIcon = ({ fillState }: StarIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Gradient para media estrella */}
        <linearGradient id="halfStarGradient">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={
          fillState === 'full'
            ? 'currentColor'
            : fillState === 'half'
            ? 'url(#halfStarGradient)'
            : 'none'
        }
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Componente principal: StarRating
 */
export const StarRating = ({
  rating,
  totalRatings = 0,
  showCount = false,
  size = 'medium',
  readonly = false,
  className = '',
  onRate,
  disabled = false,
}: StarRatingProps) => {
  // Estado de hover (solo aplica en modo interactivo)
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  // El modo interactivo se activa solo si hay handler y no es readonly
  const isInteractive = !readonly && typeof onRate === 'function';

  /**
   * Determina el estado de relleno de cada estrella
   */
  const getStarFillState = (
    starIndex: number,
    value: number
  ): 'empty' | 'half' | 'full' => {
    const currentRating = Math.max(0, Math.min(5, value)); // Clamp 0-5

    if (currentRating >= starIndex) return 'full';
    if (currentRating >= starIndex - 0.5) return 'half';
    return 'empty';
  };

  // Formatear el rating para mostrar (1 decimal)
  const formattedRating = rating.toFixed(1);

  // ============ MODO INTERACTIVO ============
  if (isInteractive) {
    // El valor a pintar: el hover tiene prioridad sobre la selección actual
    const displayValue = hoverValue ?? rating;

    return (
      <div
        className={`${styles.starRating} ${styles[size]} ${styles.interactive} ${className}`}
        role="radiogroup"
        aria-label="Calificar este curso"
      >
        <div className={styles.stars} onMouseLeave={() => setHoverValue(null)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`${styles.star} ${styles.starButton} ${
                styles[getStarFillState(star, displayValue)]
              }`}
              role="radio"
              aria-checked={Math.round(rating) === star}
              aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
              disabled={disabled}
              onClick={() => onRate?.(star)}
              onMouseEnter={() => setHoverValue(star)}
              onFocus={() => setHoverValue(star)}
              onBlur={() => setHoverValue(null)}
            >
              <StarIcon fillState={getStarFillState(star, displayValue)} />
            </button>
          ))}
        </div>

        {showCount && totalRatings > 0 && (
          <span className={styles.count} aria-label={`${totalRatings} ratings`}>
            ({totalRatings})
          </span>
        )}
      </div>
    );
  }

  // ============ MODO DISPLAY (solo lectura) ============
  return (
    <div
      className={`${styles.starRating} ${styles[size]} ${className}`}
      role="img"
      aria-label={`Rating: ${formattedRating} out of 5 stars${
        showCount && totalRatings > 0 ? `, ${totalRatings} ratings` : ''
      }`}
    >
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${styles[getStarFillState(star, rating)]}`}
            aria-hidden="true"
          >
            <StarIcon fillState={getStarFillState(star, rating)} />
          </span>
        ))}
      </div>

      {/* Contador de ratings (opcional) */}
      {showCount && totalRatings > 0 && (
        <span className={styles.count} aria-label={`${totalRatings} ratings`}>
          ({totalRatings})
        </span>
      )}
    </div>
  );
};
