import { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerStats, Bike, Level, Achievement, GameEvent } from '@/types/game';

const INITIAL_BIKES: Bike[] = [
  {
    id: 'starter',
    name: 'Cyber Runner',
    color: '#9b87f5',
    speed: 5,
    defense: 3,
    jump: 4,
    price: 0,
    isPremium: false,
    isUnlocked: true,
    ability: 'Стандартные характеристики'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    color: '#0EA5E9',
    speed: 8,
    defense: 2,
    jump: 5,
    price: 5000,
    isPremium: false,
    isUnlocked: false,
    ability: 'Увеличенная скорость +60%'
  },
  {
    id: 'tank',
    name: 'Iron Tank',
    color: '#10b981',
    speed: 4,
    defense: 9,
    jump: 3,
    price: 7000,
    isPremium: false,
    isUnlocked: false,
    ability: 'Защита от столкновений'
  },
  {
    id: 'jumper',
    name: 'Sky Jumper',
    color: '#D946EF',
    speed: 6,
    defense: 4,
    jump: 9,
    price: 100,
    isPremium: true,
    isUnlocked: false,
    ability: 'Двойной прыжок'
  }
];

const INITIAL_LEVELS: Level[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Уровень ${i + 1}`,
  difficulty: i < 5 ? 'easy' : i < 10 ? 'medium' : i < 15 ? 'hard' : 'impossible',
  stars: 0,
  maxStars: 3,
  isUnlocked: i === 0,
  requiredStars: i === 19 ? 57 : 0,
  obstacles: 5 + i * 2,
  distance: 1000 + i * 500
}));

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-ride',
    title: 'Первая поездка',
    description: 'Завершите первый уровень',
    icon: 'Flag',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: { coins: 100, premiumCurrency: 0 }
  },
  {
    id: 'coin-collector',
    title: 'Коллекционер монет',
    description: 'Соберите 1000 монет',
    icon: 'Coins',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1000,
    reward: { coins: 500, premiumCurrency: 5 }
  },
  {
    id: 'speed-demon',
    title: 'Демон скорости',
    description: 'Проедьте 10000 метров',
    icon: 'Zap',
    isUnlocked: false,
    progress: 0,
    maxProgress: 10000,
    reward: { coins: 1000, premiumCurrency: 10 }
  },
  {
    id: 'perfect-run',
    title: 'Идеальный заезд',
    description: 'Получите 3 звезды на любом уровне',
    icon: 'Star',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: { coins: 300, premiumCurrency: 3 }
  },
  {
    id: 'survivor',
    title: 'Выживший',
    description: 'Сыграйте 50 игр',
    icon: 'Shield',
    isUnlocked: false,
    progress: 0,
    maxProgress: 50,
    reward: { coins: 2000, premiumCurrency: 20 }
  }
];

const GAME_EVENTS: GameEvent[] = [
  {
    id: 'night-race',
    name: 'Ночной забег',
    description: 'Только фары освещают путь. Будьте осторожны!',
    type: 'night',
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2026-01-15',
    rewards: { coins: 1500, premiumCurrency: 15 }
  },
  {
    id: 'snow-ride',
    name: 'Снежный заезд',
    description: 'Снег ограничивает прыжки. Адаптируйтесь!',
    type: 'snow',
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    rewards: { coins: 2000, premiumCurrency: 20 }
  }
];

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    score: 0,
    distance: 0,
    coins: 0,
    premiumCurrency: 0,
    level: 1,
    lives: 3,
    gameMode: 'normal'
  });

  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('playerStats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      username: 'Player',
      email: '',
      avatar: '',
      totalDistance: 0,
      totalCoins: 1000,
      premiumCurrency: 50,
      level: 1,
      xp: 0,
      gamesPlayed: 0,
      highScore: 0,
      currentBike: 'starter',
      unlockedBikes: ['starter'],
      achievements: [],
      upgrades: {
        speed: 1,
        defense: 1,
        jump: 1
      }
    };
  });

  const [bikes, setBikes] = useState<Bike[]>(() => {
    const saved = localStorage.getItem('bikes');
    if (saved) {
      return JSON.parse(saved);
    }
    return INITIAL_BIKES;
  });

  const [levels, setLevels] = useState<Level[]>(() => {
    const saved = localStorage.getItem('levels');
    if (saved) {
      return JSON.parse(saved);
    }
    return INITIAL_LEVELS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('achievements');
    if (saved) {
      return JSON.parse(saved);
    }
    return INITIAL_ACHIEVEMENTS;
  });

  const [events] = useState<GameEvent[]>(GAME_EVENTS);

  useEffect(() => {
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
  }, [playerStats]);

  useEffect(() => {
    localStorage.setItem('bikes', JSON.stringify(bikes));
  }, [bikes]);

  useEffect(() => {
    localStorage.setItem('levels', JSON.stringify(levels));
  }, [levels]);

  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  const startGame = useCallback((mode: 'normal' | 'night' | 'snow', levelId?: number) => {
    setGameState({
      isPlaying: true,
      isPaused: false,
      score: 0,
      distance: 0,
      coins: 0,
      premiumCurrency: 0,
      level: levelId || 1,
      lives: 3,
      gameMode: mode
    });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const endGame = useCallback((finalScore: number, collectedCoins: number, stars: number) => {
    setPlayerStats(prev => ({
      ...prev,
      totalCoins: prev.totalCoins + collectedCoins,
      totalDistance: prev.totalDistance + gameState.distance,
      gamesPlayed: prev.gamesPlayed + 1,
      highScore: Math.max(prev.highScore, finalScore)
    }));

    if (gameState.level <= 20) {
      setLevels(prev => prev.map(level => {
        if (level.id === gameState.level) {
          return {
            ...level,
            stars: Math.max(level.stars, stars)
          };
        }
        if (level.id === gameState.level + 1) {
          return { ...level, isUnlocked: true };
        }
        return level;
      }));
    }

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.distance, gameState.level]);

  const buyBike = useCallback((bikeId: string) => {
    const bike = bikes.find(b => b.id === bikeId);
    if (!bike || bike.isUnlocked) return false;

    if (bike.isPremium) {
      if (playerStats.premiumCurrency >= bike.price) {
        setPlayerStats(prev => ({
          ...prev,
          premiumCurrency: prev.premiumCurrency - bike.price,
          unlockedBikes: [...prev.unlockedBikes, bikeId]
        }));
        setBikes(prev => prev.map(b => b.id === bikeId ? { ...b, isUnlocked: true } : b));
        return true;
      }
    } else {
      if (playerStats.totalCoins >= bike.price) {
        setPlayerStats(prev => ({
          ...prev,
          totalCoins: prev.totalCoins - bike.price,
          unlockedBikes: [...prev.unlockedBikes, bikeId]
        }));
        setBikes(prev => prev.map(b => b.id === bikeId ? { ...b, isUnlocked: true } : b));
        return true;
      }
    }
    return false;
  }, [bikes, playerStats]);

  const selectBike = useCallback((bikeId: string) => {
    const bike = bikes.find(b => b.id === bikeId);
    if (bike?.isUnlocked) {
      setPlayerStats(prev => ({ ...prev, currentBike: bikeId }));
    }
  }, [bikes]);

  const upgradeStats = useCallback((stat: 'speed' | 'defense' | 'jump') => {
    const cost = playerStats.upgrades[stat] * 500;
    if (playerStats.totalCoins >= cost) {
      setPlayerStats(prev => ({
        ...prev,
        totalCoins: prev.totalCoins - cost,
        upgrades: {
          ...prev.upgrades,
          [stat]: prev.upgrades[stat] + 1
        }
      }));
      return true;
    }
    return false;
  }, [playerStats]);

  const checkAchievements = useCallback(() => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.isUnlocked) return achievement;

      let newProgress = achievement.progress;

      if (achievement.id === 'first-ride' && levels[0].stars > 0) {
        newProgress = 1;
      } else if (achievement.id === 'coin-collector') {
        newProgress = playerStats.totalCoins;
      } else if (achievement.id === 'speed-demon') {
        newProgress = playerStats.totalDistance;
      } else if (achievement.id === 'perfect-run' && levels.some(l => l.stars === 3)) {
        newProgress = 1;
      } else if (achievement.id === 'survivor') {
        newProgress = playerStats.gamesPlayed;
      }

      if (newProgress >= achievement.maxProgress) {
        setPlayerStats(prev => ({
          ...prev,
          totalCoins: prev.totalCoins + achievement.reward.coins,
          premiumCurrency: prev.premiumCurrency + achievement.reward.premiumCurrency,
          achievements: [...prev.achievements, achievement.id]
        }));
        return { ...achievement, progress: newProgress, isUnlocked: true };
      }

      return { ...achievement, progress: newProgress };
    }));
  }, [levels, playerStats]);

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  return {
    gameState,
    setGameState,
    playerStats,
    setPlayerStats,
    bikes,
    levels,
    achievements,
    events,
    startGame,
    pauseGame,
    endGame,
    buyBike,
    selectBike,
    upgradeStats
  };
};
