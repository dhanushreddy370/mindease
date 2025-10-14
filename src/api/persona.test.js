import { describe, test, expect, vi } from 'vitest';

// Mock the Supabase client
const mockUpsert = vi.fn();
const mockAuth = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      upsert: mockUpsert,
    }),
    auth: {
      getUser: mockAuth,
    },
  }),
}));

// Mock the scoring function
vi.mock('../../supabase/functions/_shared/scoring.js', () => ({
  calculatePersona: () => 'mentor',
}));

import { assignPersona } from '../../supabase/functions/_shared/persona.js';

const supabase = {
  from: () => ({
    upsert: mockUpsert,
  }),
  auth: {
    getUser: mockAuth,
  },
};

import { beforeEach } from 'vitest';

describe('assignPersona', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Valid Request: should return the persona and update the database', async () => {
    mockAuth.mockResolvedValue({ data: { user: { id: '123' } } });
    mockUpsert.mockResolvedValue({ error: null });

    const answers = [{ questionId: 1, optionId: 'a' }];
    const result = await assignPersona(supabase, answers);

    expect(result.persona).toBe('mentor');
    expect(mockUpsert).toHaveBeenCalledWith({ user_id: '123', tone: 'mentor' }, { onConflict: 'user_id' });
  });

  test('Invalid Request: should still process and update with a default persona', async () => {
    mockAuth.mockResolvedValue({ data: { user: { id: '123' } } });
    mockUpsert.mockResolvedValue({ error: null });

    const result = await assignPersona(supabase, null);
    expect(result.persona).toBe('mentor');
    expect(mockUpsert).toHaveBeenCalledWith({ user_id: '123', tone: 'mentor' }, { onConflict: 'user_id' });
  });

  test('Unauthorized: should throw an error if the user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ data: { user: null } });

    const answers = [{ questionId: 1, optionId: 'a' }];
    await expect(assignPersona(supabase, answers)).rejects.toThrow('Unauthorized');
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});