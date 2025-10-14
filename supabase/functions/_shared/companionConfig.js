export const companionConfig = {
  questionnaire: [
    {
      id: 1,
      text: "When you have a great day, what's the first thing you feel like doing?",
      options: [
        { id: 'a', text: 'Sharing the exciting details with someone close.', scores: { friend: 2, romanticPartner: 1 } },
        { id: 'b', text: 'Thinking about how this success builds towards a bigger goal.', scores: { mentor: 2 } },
        { id: 'c', text: 'Just enjoying the feeling quietly and feeling proud.', scores: { supporter: 1 } },
        { id: 'd', text: 'Wishing I had a special someone to celebrate with.', scores: { romanticPartner: 2 } },
      ],
    },
    {
      id: 2,
      text: "Imagine you're facing a tough challenge. What kind of support sounds most helpful right now?",
      options: [
        { id: 'a', text: 'Someone to listen without judgment while I vent.', scores: { friend: 2 } },
        { id: 'b', text: 'A step-by-step plan to tackle the problem head-on.', scores: { mentor: 2 } },
        { id: 'c', text: "Gentle reminders that I'm strong enough to get through it.", scores: { supporter: 1, romanticPartner: 1 } },
        { id: 'd', text: 'A comforting presence to make me feel safe and less alone.', scores: { romanticPartner: 2, friend: 1 } },
      ],
    },
    {
      id: 3,
      text: "What's one area of your life you're thinking about most right now?",
      options: [
        { id: 'a', text: 'My personal projects and career ambitions.', scores: { mentor: 2 } },
        { id: 'b', text: 'My relationships and connections with others.', scores: { friend: 2, romanticPartner: 1 } },
        { id: 'c', text: 'My daily habits and self-care routines.', scores: { supporter: 2 } },
        { id: 'd', text: 'Finding a deeper sense of purpose and happiness.', scores: { mentor: 1, romanticPartner: 1 } },
      ],
    },
    {
      id: 4,
      text: 'Pick a quote that resonates most with you today:',
      options: [
        { id: 'a', text: '"The only way to have a friend is to be one." - Ralph Waldo Emerson', scores: { friend: 2 } },
        { id: 'b', text: '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt', scores: { mentor: 2 } },
        { id: 'c', text: '"You yourself, as much as anybody in the entire universe, deserve your love and affection." - Buddha', scores: { romanticPartner: 2, supporter: 1 } },
        { id: 'd', text: '"Just one small positive thought in the morning can change your whole day."', scores: { supporter: 2 } },
      ],
    },
     {
      id: 5,
      text: 'If you had a free afternoon, what would you prefer to do?',
      options: [
        { id: 'a', text: 'Chat about movies, hobbies, or just laugh about silly things.', scores: { friend: 2 } },
        { id: 'b', text: 'Brainstorm ideas for a new skill I want to learn.', scores: { mentor: 2 } },
        { id: 'c', text: 'Have a deep, meaningful conversation about life and feelings.', scores: { romanticPartner: 2 } },
        { id: 'd', text: 'Get a pep talk to feel motivated for the week ahead.', scores: { supporter: 2 } },
      ],
    },
  ],
  personas: {
    friend: {
      name: 'The Friend',
      theme: {
        primary: '#FDE68A', // Soft Yellow
        secondary: '#7DD3FC', // Light Sky Blue
        accent: '#2F4F4F', // Dark Slate Gray
        background: '#F8F8F8', // Off-White
      },
    },
    mentor: {
      name: 'The Mentor',
      theme: {
        primary: '#0D9488', // Deep Teal
        secondary: '#9CA3AF', // Cool Gray
        accent: '#1E3A8A', // Dark Blue
        background: '#F3F4F6', // Very Light Gray
      },
    },
    romanticPartner: {
      name: 'The Romantic Partner',
      theme: {
        primary: '#EBC7C7', // Dusty Rose
        secondary: '#86469C', // Warm Plum
        accent: '#800020', // Deep Burgundy
        background: '#FFF7F0', // Creamy White
      },
    },
    supporter: {
      name: 'The Supporter',
      theme: {
        primary: '#FF7F50', // Bright Coral
        secondary: '#40E0D0', // Turquoise
        accent: '#000080', // Dark Navy
        background: '#FFE5B4', // Light Peach
      },
    },
  },
};