import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import '../i18n'; // Initialize i18n

// Mock API calls to prevent network errors during tests
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  },
  getCurrentUser: vi.fn(() => null),
  getMe: vi.fn(() => Promise.resolve({ data: {} }))
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Since the default route redirects to /login (if not auth), we expect to see something related to login or the app shell
    // Or at least verify that the render didn't throw.
    expect(document.body).toBeInTheDocument();
  });
});
