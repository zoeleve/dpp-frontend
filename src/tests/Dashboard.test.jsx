import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import * as api from '../services/api';
import '../i18n';

// Mock API functions
vi.mock('../services/api', () => ({
  getDPPs: vi.fn(),
  getDPPStats: vi.fn(),
  getCurrentUser: vi.fn(),
  exportDPP: vi.fn(),
  exportDPPPdf: vi.fn(),
  deleteDPP: vi.fn(),
  publishDPP: vi.fn(),
  unpublishDPP: vi.fn(),
  getDPPGraph: vi.fn()
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getCurrentUser.mockReturnValue({ role: 'ADMIN', id: 1 });
    api.getDPPStats.mockResolvedValue({ data: { total_dpps: 10, published_dpps: 5, draft_dpps: 5, my_dpps: 2 } });
  });

  it('renders stats and dpp list', async () => {
    const mockDPPs = [
      { id: 1, title: 'Test Product 1', dpp_uuid: 'uuid-1', is_published: true, owner_id: 1 },
      { id: 2, title: 'Test Product 2', dpp_uuid: 'uuid-2', is_published: false, owner_id: 2 }
    ];
    api.getDPPs.mockResolvedValue({ data: { results: mockDPPs, total_count: 2 } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Check loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Total stats
    });
  });

  it('handles empty state', async () => {
    api.getDPPs.mockResolvedValue({ data: { results: [], total_count: 0 } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });
});
