import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { OrganizationProvider, useOrganizationState } from '../OrganizationContext';

const TestComponent = () => {
  const { activeOrganizationId, setActiveOrganizationId } = useOrganizationState();

  return (
    <div>
      <span data-testid="org-id">{activeOrganizationId}</span>
      <button 
        data-testid="set-org-btn" 
        onClick={() => setActiveOrganizationId(123)}
      >
        Set Org
      </button>
    </div>
  );
};

describe('OrganizationContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with no active organization by default', () => {
    render(
      <OrganizationProvider>
        <TestComponent />
      </OrganizationProvider>
    );

    expect(screen.getByTestId('org-id').textContent).toBe('');
  });

  it('updates state and localStorage when SET_ACTIVE_ORGANIZATION is dispatched', () => {
    render(
      <OrganizationProvider>
        <TestComponent />
      </OrganizationProvider>
    );

    act(() => {
      screen.getByTestId('set-org-btn').click();
    });

    expect(screen.getByTestId('org-id').textContent).toBe('123');
    expect(localStorage.getItem('activeOrganizationId')).toBe('123');
  });

  it('restores organization from localStorage on mount', () => {
    localStorage.setItem('activeOrganizationId', '456');

    render(
      <OrganizationProvider>
        <TestComponent />
      </OrganizationProvider>
    );

    expect(screen.getByTestId('org-id').textContent).toBe('456');
  });
});
