import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, getApiUrl } from '../api';

const MOCK_API_URL = 'http://localhost:8000/api';

describe('API Utility', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        global.fetch = vi.fn();
        localStorage.clear();
        document.cookie = '';
    });

    it('getApiUrl formats URLs correctly', () => {
        // Checking formatting - it removes leading slash or keeps as is
        expect(getApiUrl('/users')).toContain('users');
        expect(getApiUrl('users')).toContain('users');
    });

    it('apiRequest attaches CSRF token from cookies', async () => {
        document.cookie = 'csrftoken=test-csrf-token';
        
        const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await api.get('/test-endpoint');

        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'X-CSRFToken': 'test-csrf-token'
                })
            })
        );
    });

    it('apiRequest attaches Organization ID from localStorage', async () => {
        localStorage.setItem('activeOrganizationId', '111');
        
        const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await api.get('/test-endpoint'); // not auth/login so it should attach

        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'X-Organization-Id': '111'
                })
            })
        );
    });
});
