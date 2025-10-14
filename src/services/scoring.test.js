import { describe, test, expect, vi } from 'vitest';
import { calculatePersona } from '../../supabase/functions/_shared/scoring.js';

// Mock the companionConfig to isolate the tests
vi.mock('../../supabase/functions/_shared/companionConfig.js', () => ({
  companionConfig: {
    questionnaire: [
      {
        id: 1,
        options: [
          { id: 'a', scores: { mentor: 2 } },
          { id: 'b', scores: { friend: 2 } },
        ],
      },
      {
        id: 2,
        options: [
          { id: 'a', scores: { supporter: 2 } },
          { id: 'b', scores: { friend: 1, supporter: 1 } },
        ],
      },
      {
        id: 3,
        options: [
          { id: 'a', scores: { mentor: 2 } },
          { id: 'b', scores: { friend: 2 } },
        ],
      },
    ],
  },
}));

describe('Scoring Logic', () => {
  test('Clear Winner: should return "mentor" when all answers point to mentor', () => {
    const answers = [
      { questionId: 1, optionId: 'a' },
      { questionId: 3, optionId: 'a' },
    ];
    expect(calculatePersona(answers)).toBe('mentor');
  });

  test('Mixed Results: should correctly calculate the winner with mixed answers', () => {
    const answers = [
      { questionId: 1, optionId: 'b' },
      { questionId: 2, optionId: 'b' },
    ];
    expect(calculatePersona(answers)).toBe('friend');
  });

  test('Tie-Breaker: should return the expected winner in a tie', () => {
    const answers = [
      { questionId: 1, optionId: 'a' },
      { questionId: 3, optionId: 'b' },
    ];
    expect(calculatePersona(answers)).toBe('mentor');
  });
});