import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import App from './App';

// Mock global fetch so tests don't require a live network
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ status: 'UP', database: 'connected', data: [] }),
  })
);

describe('React App Component', () => {
  it('renders the main heading correctly', () => {
    render(<App />);
    const headingElement = screen.getByText(/DevOps CI\/CD Pipeline Project/i);
    expect(headingElement).toBeInTheDocument();
  });

  it('renders the architecture badges', () => {
    render(<App />);
    expect(screen.getByText(/React \(Frontend\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Express \(Backend\)/i)).toBeInTheDocument();
    expect(screen.getByText(/PostgreSQL \(Database\)/i)).toBeInTheDocument();
  });
});
