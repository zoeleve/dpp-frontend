import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CreateDPP from '../pages/CreateDPP';
import api from '../services/api';
import '../i18n';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn()
  }
}));

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('CreateDPP Component', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('submits form with valid data', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 1 } });

    render(
      <BrowserRouter>
        <CreateDPP />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Product' } });
    const pidInput = screen.getByPlaceholderText(/e.g. UUID/i);
    fireEvent.change(pidInput, { target: { value: '12345' } });

    fireEvent.click(screen.getByRole('button', { name: /create dpp/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/dpp/json/', expect.objectContaining({
        title: 'New Product',
        product_id: '12345'
      }));
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
