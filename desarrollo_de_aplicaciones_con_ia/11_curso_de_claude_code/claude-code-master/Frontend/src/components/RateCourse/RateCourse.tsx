/**
 * RateCourse
 * Widget interactivo para que el usuario califique un curso (1-5 estrellas).
 *
 * - Precarga el voto actual del usuario (si existe) vía ratingsApi.getUserRating.
 * - Al calificar usa ratingsApi.createRating (POST hace upsert en el backend).
 * - Refresca la ruta tras un voto exitoso para reflejar el nuevo promedio.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StarRating } from '@/components/StarRating/StarRating';
import { ratingsApi, ApiError } from '@/services/ratingsApi';
import type { RatingState } from '@/types/rating';
import { MOCK_USER_ID } from '@/config/user';
import styles from './RateCourse.module.scss';

interface RateCourseProps {
  courseId: number;
}

export const RateCourse = ({ courseId }: RateCourseProps) => {
  const router = useRouter();
  const [userRating, setUserRating] = useState<number>(0);
  const [state, setState] = useState<RatingState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Precargar el rating existente del usuario para este curso
  useEffect(() => {
    let active = true;

    ratingsApi
      .getUserRating(courseId, MOCK_USER_ID)
      .then((existing) => {
        if (active && existing) {
          setUserRating(existing.rating);
        }
      })
      .catch(() => {
        // Si falla la precarga no bloqueamos la UI: el usuario puede calificar igual
      });

    return () => {
      active = false;
    };
  }, [courseId]);

  const handleRate = async (value: number) => {
    // Guardamos el valor previo para poder revertir si la petición falla
    const previous = userRating;

    setState('loading');
    setErrorMsg(null);
    setUserRating(value); // UI optimista

    try {
      const saved = await ratingsApi.createRating(courseId, {
        user_id: MOCK_USER_ID,
        rating: value,
      });

      setUserRating(saved.rating);
      setState('success');
      // Refrescar la ruta para que el promedio agregado se actualice
      router.refresh();
    } catch (error) {
      // Rollback de la UI optimista
      setUserRating(previous);
      setState('error');
      setErrorMsg(
        error instanceof ApiError
          ? error.message
          : 'No se pudo guardar tu calificación. Inténtalo de nuevo.'
      );
    }
  };

  return (
    <div className={styles.rateCourse}>
      <span className={styles.label}>
        {userRating > 0 ? 'Tu calificación' : 'Califica este curso'}
      </span>

      <StarRating
        rating={userRating}
        size="large"
        onRate={handleRate}
        disabled={state === 'loading'}
      />

      <span className={styles.status} role="status" aria-live="polite">
        {state === 'loading' && 'Guardando…'}
        {state === 'success' && '¡Gracias por tu calificación!'}
        {state === 'error' && errorMsg}
      </span>
    </div>
  );
};
