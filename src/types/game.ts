export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  distance: number;
  coins: number;
  premiumCurrency: number;
  level: number;
  lives: number;
  gameMode: 'normal' | 'night' | 'snow';
}

export interface Bike {
  id: string;
  name: string;
  color: string;
  speed: number;
  defense: number;
  jump: number;
  price: number;
  isPremium: boolean;
  isUnlocked: boolean;
  ability: string;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'barrier' | 'hole' | 'ramp';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: {
    coins: number;
    premiumCurrency: number;
  };
}

export interface Level {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'impossible';
  stars: number;
  maxStars: 3;
  isUnlocked: boolean;
  requiredStars: number;
  obstacles: number;
  distance: number;
}

export interface PlayerStats {
  username: string;
  email: string;
  avatar: string;
  totalDistance: number;
  totalCoins: number;
  premiumCurrency: number;
  level: number;
  xp: number;
  gamesPlayed: number;
  highScore: number;
  currentBike: string;
  unlockedBikes: string[];
  achievements: string[];
  upgrades: {
    speed: number;
    defense: number;
    jump: number;
  };
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: 'night' | 'snow';
  isActive: boolean;
  startDate: string;
  endDate: string;
  rewards: {
    coins: number;
    premiumCurrency: number;
  };
}
