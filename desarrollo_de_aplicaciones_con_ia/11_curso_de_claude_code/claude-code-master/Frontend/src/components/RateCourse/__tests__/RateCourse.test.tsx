/**
 * RateCourse Component Tests
 * Verifica la precarga, el envío optimista, el éxito y el rollback en error.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RateCourse } from '../RateCourse';

// Mocks compartidos (hoisted para poder usarlos dentro de los factories de vi.mock)
const { refreshMock, getUserRatingMock, createRatingMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  getUserRatingMock: vi.fn(),
  createRatingMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/services/ratingsApi', () => ({
  ratingsApi: {
    getUserRating: getUserRatingMock,
    createRating: createRatingMock,
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status = 500) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

const COURSE_ID = 1;
const EXPECTED_USER_ID = 42; // MOCK_USER_ID

describe('RateCourse Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto: el usuario aún no ha calificado
    getUserRatingMock.mockResolvedValue(null);
    createRatingMock.mockResolvedValue({ rating: 0 });
  });

  it('renders the call-to-action label when user has no rating', async () => {
    render(<RateCourse courseId={COURSE_ID} />);

    expect(screen.getByText('Califica este curso')).toBeInTheDocument();
    // La precarga consulta el rating del usuario
    await waitFor(() =>
      expect(getUserRatingMock).toHaveBeenCalledWith(COURSE_ID, EXPECTED_USER_ID)
    );
  });

  it('preloads the existing user rating', async () => {
    getUserRatingMock.mockResolvedValue({ rating: 4 });

    render(<RateCourse courseId={COURSE_ID} />);

    await waitFor(() =>
      expect(screen.getByLabelText('4 estrellas')).toHaveAttribute(
        'aria-checked',
        'true'
      )
    );
    expect(screen.getByText('Tu calificación')).toBeInTheDocument();
  });

  it('submits a rating, shows success and refreshes the route', async () => {
    createRatingMock.mockResolvedValue({ rating: 5 });

    render(<RateCourse courseId={COURSE_ID} />);

    fireEvent.click(screen.getByLabelText('5 estrellas'));

    await waitFor(() =>
      expect(
        screen.getByText('¡Gracias por tu calificación!')
      ).toBeInTheDocument()
    );

    expect(createRatingMock).toHaveBeenCalledWith(COURSE_ID, {
      user_id: EXPECTED_USER_ID,
      rating: 5,
    });
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('rolls back the optimistic UI and shows an error when the request fails', async () => {
    createRatingMock.mockRejectedValue(new Error('network down'));

    render(<RateCourse courseId={COURSE_ID} />);

    fireEvent.click(screen.getByLabelText('5 estrellas'));

    // Mensaje de error (fallback genérico)
    await waitFor(() =>
      expect(
        screen.getByText(/no se pudo guardar tu calificación/i)
      ).toBeInTheDocument()
    );

    // Rollback: ninguna estrella queda seleccionada (vuelve a 0)
    expect(screen.getByLabelText('5 estrellas')).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
