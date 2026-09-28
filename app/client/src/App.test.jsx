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

describe('AWS Full-Stack React Component', () => {
  it('renders the AWS Production Cloud Architecture heading correctly', () => {
    render(<App />);
    const headingElement = screen.getByText(/AWS Production Cloud Architecture/i);
    expect(headingElement).toBeInTheDocument();
  });

  it('renders the AWS cloud service badges', () => {
    render(<App />);
    expect(screen.getByText(/Application Load Balancer/i)).toBeInTheDocument();
    expect(screen.getByText(/EC2 Auto Scaling/i)).toBeInTheDocument();
    expect(screen.getByText(/Amazon RDS PostgreSQL/i)).toBeInTheDocument();
  });
});
