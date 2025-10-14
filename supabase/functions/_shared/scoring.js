import { companionConfig } from './companionConfig.js';

export function calculatePersona(answers) {
  const scores = {
    friend: 0,
    mentor: 0,
    romanticPartner: 0,
    supporter: 0,
  };

  for (const answer of answers) {
    const question = companionConfig.questionnaire.find(q => q.id == answer.questionId);
    if (!question) continue;

    const option = question.options.find(o => o.id === answer.optionId);
    if (option && option.scores) {
      for (const persona in option.scores) {
        if (scores.hasOwnProperty(persona)) {
          scores[persona] += option.scores[persona];
        }
      }
    }
  }

  const determinedPersona = Object.keys(scores).reduce((a, b) => {
    if (scores[a] > scores[b]) {
      return a;
    } else if (scores[b] > scores[a]) {
      return b;
    }
    // Tie-breaker: romanticPartner > mentor > friend > supporter
    const order = ['romanticPartner', 'mentor', 'friend', 'supporter'];
    return order.indexOf(a) < order.indexOf(b) ? a : b;
  });

  return determinedPersona;
}