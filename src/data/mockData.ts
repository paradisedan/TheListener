export interface User {
  id: string;
  username: string;
  avatar: string;
  contributions: number;
}

export interface Comment {
  id: string;
  user: User;
  message: string;
  timestamp: Date;
}

export interface Version {
  number: number;
  changes: string[];
  timestamp: Date;
}

export const mockUsers: User[] = [
  { id: '1', username: 'BeatMaker_42', avatar: '🎵', contributions: 127 },
  { id: '2', username: 'SynthWave_90', avatar: '🎹', contributions: 98 },
  { id: '3', username: 'BassDropper', avatar: '🎸', contributions: 84 },
  { id: '4', username: 'MelodyQueen', avatar: '👑', contributions: 76 },
  { id: '5', username: 'DrumPro_X', avatar: '🥁', contributions: 65 },
  { id: '6', username: 'ChoralHarmony', avatar: '🎤', contributions: 58 },
  { id: '7', username: 'LoFi_Vibes', avatar: '🌙', contributions: 52 },
  { id: '8', username: 'EDM_Wizard', avatar: '⚡', contributions: 47 },
  { id: '9', username: 'JazzyCat', avatar: '🎺', contributions: 43 },
  { id: '10', username: 'Acoustic_Soul', avatar: '🎻', contributions: 39 },
  { id: '11', username: 'Trap_Master', avatar: '🔥', contributions: 35 },
  { id: '12', username: 'ChillBeats', avatar: '✨', contributions: 31 },
];

export const mockComments: Comment[] = [
  { id: '1', user: mockUsers[0], message: 'Love the new bass line! 🔥', timestamp: new Date(Date.now() - 30000) },
  { id: '2', user: mockUsers[1], message: 'Can we add more synth layers?', timestamp: new Date(Date.now() - 45000) },
  { id: '3', user: mockUsers[2], message: 'Drop is perfect now!', timestamp: new Date(Date.now() - 60000) },
  { id: '4', user: mockUsers[3], message: 'Maybe slow the tempo slightly?', timestamp: new Date(Date.now() - 90000) },
  { id: '5', user: mockUsers[4], message: 'Drums hitting different 💯', timestamp: new Date(Date.now() - 120000) },
  { id: '6', user: mockUsers[5], message: 'Add vocals next?', timestamp: new Date(Date.now() - 150000) },
  { id: '7', user: mockUsers[6], message: 'This is fire already', timestamp: new Date(Date.now() - 180000) },
  { id: '8', user: mockUsers[7], message: 'Buildup needs more energy', timestamp: new Date(Date.now() - 210000) },
  { id: '9', user: mockUsers[8], message: 'Jazz influence is subtle but nice', timestamp: new Date(Date.now() - 240000) },
  { id: '10', user: mockUsers[9], message: 'Loving the evolution 🎶', timestamp: new Date(Date.now() - 270000) },
];

export const mockVersions: Version[] = [
  {
    number: 1,
    changes: ['Initial beat pattern', 'Basic drum loop', 'Simple bass line'],
    timestamp: new Date(Date.now() - 86400000 * 3),
  },
  {
    number: 2,
    changes: ['Added synth melody', 'Layered hi-hats', 'Introduced chord progression'],
    timestamp: new Date(Date.now() - 86400000 * 2),
  },
  {
    number: 3,
    changes: ['Build-up section added', 'Drop intensified', 'Transition smoothed'],
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    number: 4,
    changes: ['Vocals processed', 'Bass enhanced', 'Final mix polish'],
    timestamp: new Date(),
  },
];

export const aiDirection = "Users want a heavier drop with more bass, and they're asking for vocal chops in the breakdown.";

export const getRandomComment = (): Comment => {
  const messages = [
    'This is sounding amazing! 🎵',
    'Can we try adding strings?',
    'The vibe is perfect',
    'Maybe add a bridge section?',
    'Love where this is going 💫',
    'Drop could be heavier',
    'Tempo feels just right',
    'Add some reverb?',
    'This slaps! 🔥',
    'Brilliant collaboration',
  ];
  
  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    user: randomUser,
    message: randomMessage,
    timestamp: new Date(),
  };
};
