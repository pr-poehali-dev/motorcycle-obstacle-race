import { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerStats, Bike, Level, Achievement, GameEvent } from '@/types/game';

const BIKE_EMOJIS = ['🏍️', '🏁', '⚡', '🔥', '💨', '⭐'];
const AVATAR_EMOJIS = ['😎', '🤓', '😄', '🥳', '🤩', '😺', '🐱', '🦁', '🐯', '🦊', '🐼', '🐨', '🐻', '🐹', '🦄'];

const INITIAL_BIKES: Bike[] = [
  {
    id: 'starter',
    name: 'Стартовый байк',
    emoji: '🏍️',
    color: '#FF6B35',
    speed: 5,
    defense: 3,
    jump: 4,
    price: 0,
    isPremium: false,
    isUnlocked: true,
    ability: 'Сбалансированные характеристики',
    stickers: []
  },
  {
    id: 'speed-demon',
    name: 'Демон скорости',
    emoji: '⚡',
    color: '#FFD700',
    speed: 8,
    defense: 2,
    jump: 5,
    price: 5000,
    isPremium: false,
    isUnlocked: false,
    ability: 'Скорость +60%, но хрупкий',
    stickers: []
  },
  {
    id: 'tank',
    name: 'Железный танк',
    emoji: '🛡️',
    color: '#00D9FF',
    speed: 4,
    defense: 9,
    jump: 3,
    price: 7000,
    isPremium: false,
    isUnlocked: false,
    ability: 'Максимальная защита',
    stickers: []
  },
  {
    id: 'jumper',
    name: 'Небесный прыгун',
    emoji: '🚀',
    color: '#9b87f5',
    speed: 6,
    defense: 4,
    jump: 9,
    price: 100,
    isPremium: true,
    isUnlocked: false,
    ability: 'Двойная высота прыжка',
    stickers: []
  },
  {
    id: 'night-ghost',
    name: 'Ночной призрак',
    emoji: '👻',
    color: '#8B5CF6',
    speed: 7,
    defense: 6,
    jump: 7,
    price: 0,
    isPremium: false,
    isUnlocked: false,
    ability: 'Мастер ночных забегов',
    stickers: [],
    requirement: 'night-distance'
  }
];

const INITIAL_LEVELS: Level[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Уровень ${i + 1}`,
  difficulty: i < 5 ? 'easy' : i < 10 ? 'medium' : i < 15 ? 'hard' : i === 19 ? 'unreal' : 'impossible',
  stars: 0,
  maxStars: 3,
  isUnlocked: i === 0,
  requiredStars: i * 3,
  obstacles: 5 + i * 2,
  distance: 1000 + i * 500
}));

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-ride', title: 'Первая поездка', description: 'Завершите первый уровень', icon: 'Flag', isUnlocked: false, progress: 0, maxProgress: 1, reward: { coins: 100, premiumCurrency: 0 } },
  { id: 'coin-collector', title: 'Коллекционер монет', description: 'Соберите 1000 монет', icon: 'Coins', isUnlocked: false, progress: 0, maxProgress: 1000, reward: { coins: 500, premiumCurrency: 5 } },
  { id: 'speed-demon', title: 'Демон скорости', description: 'Проедьте 10000 метров', icon: 'Zap', isUnlocked: false, progress: 0, maxProgress: 10000, reward: { coins: 1000, premiumCurrency: 10 } },
  { id: 'perfect-run', title: 'Идеальный заезд', description: 'Получите 3 звезды на любом уровне', icon: 'Star', isUnlocked: false, progress: 0, maxProgress: 1, reward: { coins: 300, premiumCurrency: 3 } },
  { id: 'survivor', title: 'Выживший', description: 'Сыграйте 50 игр', icon: 'Shield', isUnlocked: false, progress: 0, maxProgress: 50, reward: { coins: 2000, premiumCurrency: 20 } },
  { id: 'level-5', title: 'Новичок', description: 'Пройдите 5 уровень', icon: 'Trophy', isUnlocked: false, progress: 0, maxProgress: 1, reward: { coins: 200, premiumCurrency: 2 } },
  { id: 'level-10', title: 'Опытный', description: 'Пройдите 10 уровень', icon: 'Award', isUnlocked: false, progress: 0, maxProgress: 1, reward: { coins: 500, premiumCurrency: 5 } },
  { id: 'level-15', title: 'Мастер', description: 'Пройдите 15 уровень', icon: 'Medal', isUnlocked: false, progress: 0, maxProgress: 1, reward: { coins: 1000, premiumCurrency: 10 } },
  { id: 'level-20', title: 'Легенда', description: 'Пройдите 20 уровень', icon: 'Crown', isUnlocked: false, progress: 0, maxProgress: 1, reward: { coins: 5000, premiumCurrency: 50 } },
  { id: 'all-3-stars', title: 'Перфекционист', description: 'Получите 3 звезды на всех уровнях', icon: 'Sparkles', isUnlocked: false, progress: 0, maxProgress: 20, reward: { coins: 10000, premiumCurrency: 100 } },
  { id: 'jumper', title: 'Прыгун', description: 'Совершите 1000 прыжков', icon: 'ArrowUp', isUnlocked: false, progress: 0, maxProgress: 1000, reward: { coins: 500, premiumCurrency: 5 } },
  { id: 'millionaire', title: 'Миллионер', description: 'Соберите 100000 монет', icon: 'DollarSign', isUnlocked: false, progress: 0, maxProgress: 100000, reward: { coins: 5000, premiumCurrency: 50 } },
  { id: 'marathon', title: 'Марафонец', description: 'Проедьте 100000 метров', icon: 'Target', isUnlocked: false, progress: 0, maxProgress: 100000, reward: { coins: 3000, premiumCurrency: 30 } },
  { id: 'all-bikes', title: 'Коллекционер байков', description: 'Разблокируйте все мотоциклы', icon: 'Package', isUnlocked: false, progress: 0, maxProgress: 5, reward: { coins: 2000, premiumCurrency: 20 } },
  { id: 'max-upgrades', title: 'Максимальная мощность', description: 'Улучшите все характеристики до макс', icon: 'Rocket', isUnlocked: false, progress: 0, maxProgress: 30, reward: { coins: 5000, premiumCurrency: 50 } },
  { id: 'no-damage', title: 'Неуязвимый', description: 'Пройдите уровень без потери жизней', icon: 'Heart', isUnlocked: false, progress: 0, maxProgress: 1, reward: { coins: 1000, premiumCurrency: 10 } },
  { id: 'night-rider', title: 'Ночной гонщик', description: 'Пройдите 50км в ночном режиме', icon: 'Moon', isUnlocked: false, progress: 0, maxProgress: 50000, reward: { coins: 2000, premiumCurrency: 20 } },
  { id: 'snow-master', title: 'Мастер снега', description: 'Пройдите 30км в снежном режиме', icon: 'Snowflake', isUnlocked: false, progress: 0, maxProgress: 30000, reward: { coins: 1500, premiumCurrency: 15 } },
  { id: '100-games', title: 'Увлечённый', description: 'Сыграйте 100 игр', icon: 'Gamepad2', isUnlocked: false, progress: 0, maxProgress: 100, reward: { coins: 3000, premiumCurrency: 30 } },
  { id: 'high-score', title: 'Рекордсмен', description: 'Наберите 50000 очков', icon: 'TrendingUp', isUnlocked: false, progress: 0, maxProgress: 50000, reward: { coins: 5000, premiumCurrency: 50 } }
];

const GAME_EVENTS: GameEvent[] = [
  {
    id: 'night-race',
    name: 'Ночной забег',
    description: 'Только фары освещают путь. Пройдите 50км!',
    type: 'night',
    isActive: true,
    startDate: '01.01.2026',
    endDate: '31.01.2026',
    rewards: { coins: 1500, premiumCurrency: 15 },
    requirement: { type: 'night-distance', value: 50000 }
  },
  {
    id: 'snow-ride',
    name: 'Снежный заезд',
    description: 'Снег ограничивает прыжки. Пройдите 30км!',
    type: 'snow',
    isActive: true,
    startDate: '01.01.2026',
    endDate: '15.02.2026',
    rewards: { coins: 2000, premiumCurrency: 20 },
    requirement: { type: 'snow-distance', value: 30000 }
  },
  {
    id: 'extreme-show',
    name: 'Экстрим шоу',
    description: 'Пройдите уровни 11-20 на 3 звезды каждый!',
    type: 'normal',
    isActive: true,
    startDate: '01.01.2026',
    endDate: '28.02.2026',
    rewards: { coins: 3000, premiumCurrency: 25 },
    requirement: { type: 'extreme-stars', value: 30 }
  }
];

const STICKERS = [
  { id: 'fire', emoji: '🔥', name: 'Огонь', price: 500 },
  { id: 'lightning', emoji: '⚡', name: 'Молния', price: 500 },
  { id: 'star', emoji: '⭐', name: 'Звезда', price: 500 },
  { id: 'rocket', emoji: '🚀', name: 'Ракета', price: 750 },
  { id: 'diamond', emoji: '💎', name: 'Алмаз', price: 1000 },
  { id: 'crown', emoji: '👑', name: 'Корона', price: 1000 },
  { id: 'trophy', emoji: '🏆', name: 'Трофей', price: 750 },
  { id: 'checkered', emoji: '🏁', name: 'Финиш', price: 500 }
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
      username: 'Игрок',
      email: '',
      avatar: '😎',
      totalDistance: 0,
      nightDistance: 0,
      snowDistance: 0,
      totalCoins: 1000,
      premiumCurrency: 50,
      level: 1,
      xp: 0,
      gamesPlayed: 0,
      totalJumps: 0,
      highScore: 0,
      currentBike: 'starter',
      unlockedBikes: ['starter'],
      achievements: [],
      unlockedStickers: [],
      upgrades: {
        speed: 0,
        defense: 0,
        jump: 0
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

  const [events, setEvents] = useState<GameEvent[]>(() => {
    const saved = localStorage.getItem('events');
    if (saved) {
      return JSON.parse(saved);
    }
    return GAME_EVENTS;
  });

  const [gameCompleted, setGameCompleted] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    const allCompleted = levels.every(l => l.stars >= 3);
    if (allCompleted && !gameCompleted) {
      setGameCompleted(true);
      setTimeout(() => {
        window.location.reload();
      }, 30000);
    }
  }, [levels, gameCompleted]);

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

  const endGame = useCallback((finalScore: number, collectedCoins: number, finalDistance: number, stars: number, jumps: number) => {
    const mode = gameState.gameMode;
    
    setPlayerStats(prev => {
      const updates: any = {
        totalCoins: prev.totalCoins + collectedCoins,
        totalDistance: prev.totalDistance + finalDistance,
        totalJumps: prev.totalJumps + jumps,
        gamesPlayed: prev.gamesPlayed + 1,
        highScore: Math.max(prev.highScore, finalScore)
      };

      if (mode === 'night') updates.nightDistance = (prev.nightDistance || 0) + finalDistance;
      if (mode === 'snow') updates.snowDistance = (prev.snowDistance || 0) + finalDistance;

      return { ...prev, ...updates };
    });

    if (gameState.level <= 20) {
      setLevels(prev => prev.map(level => {
        if (level.id === gameState.level) {
          return { ...level, stars: Math.max(level.stars, stars) };
        }
        if (level.id === gameState.level + 1 && stars > 0) {
          return { ...level, isUnlocked: true };
        }
        return level;
      }));
    }

    updateAchievements(collectedCoins, finalDistance, stars, jumps);
    checkEventCompletion();
    unlockNightGhost();
    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState]);

  const updateAchievements = (coins: number, distance: number, stars: number, jumps: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.isUnlocked) return achievement;
      
      let newProgress = achievement.progress;
      
      if (achievement.id === 'first-ride' && gameState.level === 1 && stars > 0) newProgress = 1;
      if (achievement.id === 'coin-collector') newProgress = Math.min(newProgress + coins, achievement.maxProgress);
      if (achievement.id === 'speed-demon') newProgress = Math.min(newProgress + distance, achievement.maxProgress);
      if (achievement.id === 'perfect-run' && stars === 3) newProgress = 1;
      if (achievement.id === 'jumper') newProgress = Math.min(newProgress + jumps, achievement.maxProgress);
      if (achievement.id === 'marathon') newProgress = Math.min(newProgress + distance, achievement.maxProgress);
      if (achievement.id === 'high-score' && gameState.score > achievement.progress) newProgress = gameState.score;
      
      if (achievement.id === `level-${gameState.level}` && stars > 0) newProgress = 1;
      
      const isUnlocked = newProgress >= achievement.maxProgress;
      if (isUnlocked && !achievement.isUnlocked) {
        setPlayerStats(p => ({
          ...p,
          totalCoins: p.totalCoins + achievement.reward.coins,
          premiumCurrency: p.premiumCurrency + achievement.reward.premiumCurrency
        }));
      }
      
      return { ...achievement, progress: newProgress, isUnlocked };
    }));
  };

  const checkEventCompletion = () => {
    setEvents(prev => prev.map(event => {
      if (!event.requirement) return event;
      
      let completed = false;
      if (event.requirement.type === 'night-distance') {
        completed = (playerStats.nightDistance || 0) >= event.requirement.value;
      } else if (event.requirement.type === 'snow-distance') {
        completed = (playerStats.snowDistance || 0) >= event.requirement.value;
      } else if (event.requirement.type === 'extreme-stars') {
        const last10Stars = levels.slice(10, 20).reduce((sum, l) => sum + l.stars, 0);
        completed = last10Stars >= 30;
      }
      
      if (completed && event.isActive) {
        setPlayerStats(p => ({
          ...p,
          totalCoins: p.totalCoins + event.rewards.coins,
          premiumCurrency: p.premiumCurrency + event.rewards.premiumCurrency
        }));
        return { ...event, isActive: false };
      }
      
      return event;
    }));
  };

  const unlockNightGhost = () => {
    if ((playerStats.nightDistance || 0) >= 50000) {
      setBikes(prev => prev.map(b => b.id === 'night-ghost' ? { ...b, isUnlocked: true } : b));
      setPlayerStats(p => ({ ...p, unlockedBikes: [...new Set([...p.unlockedBikes, 'night-ghost'])] }));
    }
  };

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
    const currentLevel = playerStats.upgrades[stat];
    if (currentLevel >= 10) return false;
    
    const cost = (currentLevel + 1) * 500;
    if (playerStats.totalCoins >= cost) {
      setPlayerStats(prev => ({
        ...prev,
        totalCoins: prev.totalCoins - cost,
        upgrades: { ...prev.upgrades, [stat]: currentLevel + 1 }
      }));
      return true;
    }
    return false;
  }, [playerStats]);

  const buySticker = useCallback((stickerId: string) => {
    const sticker = STICKERS.find(s => s.id === stickerId);
    if (!sticker || playerStats.unlockedStickers.includes(stickerId)) return false;
    
    if (playerStats.totalCoins >= sticker.price) {
      setPlayerStats(prev => ({
        ...prev,
        totalCoins: prev.totalCoins - sticker.price,
        unlockedStickers: [...prev.unlockedStickers, stickerId]
      }));
      return true;
    }
    return false;
  }, [playerStats]);

  const addStickerToBike = useCallback((bikeId: string, stickerId: string) => {
    setBikes(prev => prev.map(bike => {
      if (bike.id === bikeId && bike.isUnlocked) {
        return { ...bike, stickers: [...(bike.stickers || []), stickerId] };
      }
      return bike;
    }));
  }, []);

  const removeStickerFromBike = useCallback((bikeId: string, index: number) => {
    setBikes(prev => prev.map(bike => {
      if (bike.id === bikeId) {
        const newStickers = [...(bike.stickers || [])];
        newStickers.splice(index, 1);
        return { ...bike, stickers: newStickers };
      }
      return bike;
    }));
  }, []);

  const updateUsername = useCallback((newUsername: string) => {
    setPlayerStats(prev => ({ ...prev, username: newUsername }));
  }, []);

  const updateAvatar = useCallback((newAvatar: string) => {
    setPlayerStats(prev => ({ ...prev, avatar: newAvatar }));
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  return {
    gameState,
    setGameState,
    playerStats,
    setPlayerStats,
    bikes,
    levels,
    achievements,
    events,
    gameCompleted,
    startGame,
    pauseGame,
    endGame,
    buyBike,
    selectBike,
    upgradeStats,
    buySticker,
    addStickerToBike,
    removeStickerFromBike,
    updateUsername,
    updateAvatar,
    logout,
    stickers: STICKERS,
    avatarEmojis: AVATAR_EMOJIS
  };
};
