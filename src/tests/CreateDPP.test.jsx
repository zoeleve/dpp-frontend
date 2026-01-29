import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
  it('submits form with valid data', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 1 } });

    render(
      <BrowserRouter>
        <CreateDPP />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Product' } });
    // Note: Product ID input has a placeholder, we can find by placeholder or label if unique
    const pidInput = screen.getByPlaceholderText(/e.g. UUID/i);
    fireEvent.change(pidInput, { target: { value: '12345' } });

    fireEvent.click(screen.getByRole('button', { name: /create dpp/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/dpp/json/', expect.objectContaining({
        title: 'New Product',
        product_id: '12345'
      }));
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
