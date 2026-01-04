import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { GameCanvas } from '@/components/GameCanvas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type MenuScreen = 'main' | 'levels' | 'shop' | 'achievements' | 'profile' | 'events' | 'settings' | 'auth';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<MenuScreen>('main');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { 
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
  } = useGameState();

  const currentBike = bikes.find(b => b.id === playerStats.currentBike);

  const handleScoreUpdate = (score: number, distance: number, coins: number) => {
    setGameState(prev => ({ ...prev, score, distance, coins }));
  };

  const handleGameOver = (stars: number) => {
    endGame(gameState.score, gameState.coins, stars);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('main');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 scanlines">
        <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border-primary/50 neon-border">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2 gradient-text animate-pulse-glow">CYBER MOTO</h1>
            <p className="text-muted-foreground">Войдите в систему</p>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="cyber@rider.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input id="password" type="password" placeholder="••••••••" className="mt-1" />
              </div>
              <Button onClick={handleLogin} className="w-full neon-border">
                <Icon name="LogIn" className="mr-2" size={20} />
                Войти
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <div>
                <Label htmlFor="username">Имя пользователя</Label>
                <Input id="username" placeholder="CyberRider" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" placeholder="cyber@rider.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="reg-password">Пароль</Label>
                <Input id="reg-password" type="password" placeholder="••••••••" className="mt-1" />
              </div>
              <Button onClick={handleLogin} className="w-full neon-border">
                <Icon name="UserPlus" className="mr-2" size={20} />
                Зарегистрироваться
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  if (gameState.isPlaying) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="mb-4">
          <Button 
            onClick={pauseGame}
            className="neon-border"
          >
            <Icon name={gameState.isPaused ? "Play" : "Pause"} className="mr-2" size={20} />
            {gameState.isPaused ? 'Продолжить' : 'Пауза'}
          </Button>
          <Button 
            onClick={() => setGameState(prev => ({ ...prev, isPlaying: false }))}
            variant="destructive"
            className="ml-2"
          >
            <Icon name="X" className="mr-2" size={20} />
            Выйти
          </Button>
        </div>
        
        <GameCanvas
          isPlaying={gameState.isPlaying}
          isPaused={gameState.isPaused}
          gameMode={gameState.gameMode}
          bikeSpeed={currentBike ? currentBike.speed + playerStats.upgrades.speed : 5}
          bikeJump={currentBike ? currentBike.jump + playerStats.upgrades.jump : 4}
          bikeDefense={currentBike ? currentBike.defense + playerStats.upgrades.defense : 3}
          onScoreUpdate={handleScoreUpdate}
          onGameOver={handleGameOver}
        />
        
        <div className="mt-4 text-center text-muted-foreground">
          <p>Нажмите ПРОБЕЛ или ↑ для прыжка</p>
        </div>
      </div>
    );
  }

  const renderMainMenu = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-7xl font-black mb-4 gradient-text animate-pulse-glow glitch">
          CYBER MOTO
        </h1>
        <p className="text-xl text-muted-foreground neon-text-green">
          Футуристические гонки на грани возможного
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-transform bg-card/80 backdrop-blur-sm border-primary/50 neon-border"
          onClick={() => startGame('normal', 1)}
        >
          <Icon name="Play" size={48} className="mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2 gradient-text">Начать игру</h3>
          <p className="text-muted-foreground">Классический режим с препятствиями</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-transform bg-card/80 backdrop-blur-sm border-secondary/50 neon-border-green"
          onClick={() => setCurrentScreen('levels')}
        >
          <Icon name="Map" size={48} className="mb-4 text-secondary" />
          <h3 className="text-2xl font-bold mb-2 gradient-text">Уровни</h3>
          <p className="text-muted-foreground">20 уровней возрастающей сложности</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-transform bg-card/80 backdrop-blur-sm border-accent/50"
          onClick={() => setCurrentScreen('shop')}
        >
          <Icon name="ShoppingCart" size={48} className="mb-4 text-accent" />
          <h3 className="text-2xl font-bold mb-2 gradient-text">Магазин</h3>
          <p className="text-muted-foreground">Покупка и улучшение мотоциклов</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-transform bg-card/80 backdrop-blur-sm border-primary/50"
          onClick={() => setCurrentScreen('events')}
        >
          <Icon name="Calendar" size={48} className="mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2 gradient-text">События</h3>
          <p className="text-muted-foreground">Специальные режимы и награды</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-transform bg-card/80 backdrop-blur-sm border-secondary/50"
          onClick={() => setCurrentScreen('achievements')}
        >
          <Icon name="Trophy" size={48} className="mb-4 text-secondary" />
          <h3 className="text-2xl font-bold mb-2 gradient-text">Достижения</h3>
          <p className="text-muted-foreground">Отслеживайте свой прогресс</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-transform bg-card/80 backdrop-blur-sm border-accent/50"
          onClick={() => setCurrentScreen('profile')}
        >
          <Icon name="User" size={48} className="mb-4 text-accent" />
          <h3 className="text-2xl font-bold mb-2 gradient-text">Профиль</h3>
          <p className="text-muted-foreground">Статистика и настройки</p>
        </Card>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-primary/30">
          <Icon name="Coins" size={24} className="text-yellow-400" />
          <span className="text-lg font-bold gradient-text">{playerStats.totalCoins}</span>
        </div>
        <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-secondary/30">
          <Icon name="Gem" size={24} className="text-purple-400" />
          <span className="text-lg font-bold gradient-text">{playerStats.premiumCurrency}</span>
        </div>
      </div>
    </div>
  );

  const renderLevels = () => (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-bold gradient-text">Уровни</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {levels.map(level => (
          <Card 
            key={level.id}
            className={`p-4 ${level.isUnlocked ? 'cursor-pointer hover:scale-105' : 'opacity-50'} transition-transform bg-card/80 backdrop-blur-sm border-primary/50`}
            onClick={() => level.isUnlocked && startGame('normal', level.id)}
          >
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 gradient-text">{level.id}</div>
              <div className="text-sm text-muted-foreground mb-2">{level.name}</div>
              <Badge variant={
                level.difficulty === 'easy' ? 'default' :
                level.difficulty === 'medium' ? 'secondary' :
                level.difficulty === 'hard' ? 'destructive' : 'outline'
              }>
                {level.difficulty === 'easy' ? 'Легко' :
                 level.difficulty === 'medium' ? 'Средне' :
                 level.difficulty === 'hard' ? 'Сложно' : 'Невозможно'}
              </Badge>
              <div className="flex justify-center gap-1 mt-2">
                {[1, 2, 3].map(star => (
                  <Icon 
                    key={star} 
                    name="Star" 
                    size={16} 
                    className={star <= level.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                  />
                ))}
              </div>
              {!level.isUnlocked && (
                <div className="mt-2 flex items-center justify-center gap-1 text-xs">
                  <Icon name="Lock" size={12} />
                  <span>Требуется {level.requiredStars} ⭐</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-bold gradient-text">Магазин</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <Tabs defaultValue="bikes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="bikes">Мотоциклы</TabsTrigger>
          <TabsTrigger value="upgrades">Улучшения</TabsTrigger>
        </TabsList>

        <TabsContent value="bikes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bikes.map(bike => (
              <Card 
                key={bike.id}
                className="p-6 bg-card/80 backdrop-blur-sm border-primary/50"
                style={{ borderColor: bike.color }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold gradient-text">{bike.name}</h3>
                  {bike.id === playerStats.currentBike && (
                    <Badge variant="default">Выбран</Badge>
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Скорость</span>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-4 ${i < bike.speed ? 'bg-primary' : 'bg-gray-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Защита</span>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-4 ${i < bike.defense ? 'bg-secondary' : 'bg-gray-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Прыжок</span>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-4 ${i < bike.jump ? 'bg-accent' : 'bg-gray-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{bike.ability}</p>

                {bike.isUnlocked ? (
                  <Button 
                    onClick={() => selectBike(bike.id)}
                    disabled={bike.id === playerStats.currentBike}
                    className="w-full"
                  >
                    {bike.id === playerStats.currentBike ? 'Выбран' : 'Выбрать'}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => buyBike(bike.id)}
                    className="w-full neon-border"
                  >
                    <Icon name={bike.isPremium ? "Gem" : "Coins"} className="mr-2" size={20} />
                    Купить за {bike.price}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upgrades">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['speed', 'defense', 'jump'].map((stat) => (
              <Card key={stat} className="p-6 bg-card/80 backdrop-blur-sm border-primary/50">
                <Icon 
                  name={stat === 'speed' ? 'Zap' : stat === 'defense' ? 'Shield' : 'ArrowUp'} 
                  size={48} 
                  className="mb-4 text-primary"
                />
                <h3 className="text-xl font-bold mb-2 gradient-text">
                  {stat === 'speed' ? 'Скорость' : stat === 'defense' ? 'Защита' : 'Прыжок'}
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Уровень {playerStats.upgrades[stat as keyof typeof playerStats.upgrades]}</span>
                    <span>Макс. 10</span>
                  </div>
                  <Progress 
                    value={playerStats.upgrades[stat as keyof typeof playerStats.upgrades] * 10} 
                    className="h-2"
                  />
                </div>
                <Button 
                  onClick={() => upgradeStats(stat as 'speed' | 'defense' | 'jump')}
                  disabled={playerStats.upgrades[stat as keyof typeof playerStats.upgrades] >= 10}
                  className="w-full neon-border"
                >
                  <Icon name="Coins" className="mr-2" size={20} />
                  Улучшить за {playerStats.upgrades[stat as keyof typeof playerStats.upgrades] * 500}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-bold gradient-text">Достижения</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <Card 
            key={achievement.id}
            className={`p-6 ${achievement.isUnlocked ? 'bg-primary/20 border-primary' : 'bg-card/50'} backdrop-blur-sm`}
          >
            <div className="flex items-start gap-4">
              <Icon 
                name={achievement.icon as any} 
                size={48} 
                className={achievement.isUnlocked ? 'text-primary' : 'text-gray-600'}
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1 gradient-text">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                
                {!achievement.isUnlocked && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Прогресс</span>
                      <span>{achievement.progress} / {achievement.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">
                    <Icon name="Coins" size={12} className="mr-1" />
                    {achievement.reward.coins}
                  </Badge>
                  {achievement.reward.premiumCurrency > 0 && (
                    <Badge variant="default">
                      <Icon name="Gem" size={12} className="mr-1" />
                      {achievement.reward.premiumCurrency}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-bold gradient-text">События</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(event => (
          <Card 
            key={event.id}
            className="p-6 bg-card/80 backdrop-blur-sm border-primary/50 neon-border cursor-pointer hover:scale-105 transition-transform"
            onClick={() => startGame(event.type)}
          >
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Calendar" size={32} className="text-primary" />
              <Badge variant={event.isActive ? 'default' : 'secondary'}>
                {event.isActive ? 'Активно' : 'Скоро'}
              </Badge>
            </div>
            
            <h3 className="text-2xl font-bold mb-2 gradient-text">{event.name}</h3>
            <p className="text-muted-foreground mb-4">{event.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Clock" size={16} />
                <span>{event.startDate} - {event.endDate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary">
                <Icon name="Coins" size={12} className="mr-1" />
                +{event.rewards.coins}
              </Badge>
              <Badge variant="default">
                <Icon name="Gem" size={12} className="mr-1" />
                +{event.rewards.premiumCurrency}
              </Badge>
            </div>

            {event.isActive && (
              <Button className="w-full mt-4 neon-border">
                <Icon name="Play" className="mr-2" size={20} />
                Начать событие
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-bold gradient-text">Профиль</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-4xl">
              🏍️
            </div>
            <div>
              <h3 className="text-2xl font-bold gradient-text">{playerStats.username}</h3>
              <p className="text-muted-foreground">Уровень {playerStats.level}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Всего игр:</span>
              <span className="font-bold">{playerStats.gamesPlayed}</span>
            </div>
            <div className="flex justify-between">
              <span>Рекорд:</span>
              <span className="font-bold">{playerStats.highScore}</span>
            </div>
            <div className="flex justify-between">
              <span>Пройдено:</span>
              <span className="font-bold">{playerStats.totalDistance}м</span>
            </div>
            <div className="flex justify-between">
              <span>Монеты:</span>
              <span className="font-bold text-yellow-400">{playerStats.totalCoins}</span>
            </div>
            <div className="flex justify-between">
              <span>Кристаллы:</span>
              <span className="font-bold text-purple-400">{playerStats.premiumCurrency}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/50">
          <h3 className="text-xl font-bold mb-4 gradient-text">Достижения</h3>
          <div className="grid grid-cols-4 gap-2">
            {achievements.slice(0, 8).map(achievement => (
              <div 
                key={achievement.id}
                className={`p-2 rounded ${achievement.isUnlocked ? 'bg-primary/20' : 'bg-gray-800'}`}
              >
                <Icon 
                  name={achievement.icon as any} 
                  size={24} 
                  className={achievement.isUnlocked ? 'text-primary' : 'text-gray-600'}
                />
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold mt-6 mb-4 gradient-text">Коллекция мотоциклов</h3>
          <div className="space-y-2">
            {bikes.filter(b => b.isUnlocked).map(bike => (
              <div 
                key={bike.id} 
                className="flex items-center gap-2 p-2 rounded bg-card/50"
              >
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: bike.color }}
                />
                <span className="text-sm">{bike.name}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => {
              setIsAuthenticated(false);
              setPlayerStats({
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
              });
            }}
            variant="destructive"
            className="w-full mt-6"
          >
            <Icon name="LogOut" className="mr-2" size={20} />
            Выйти
          </Button>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 scanlines">
      <div className="max-w-7xl mx-auto">
        {currentScreen === 'main' && renderMainMenu()}
        {currentScreen === 'levels' && renderLevels()}
        {currentScreen === 'shop' && renderShop()}
        {currentScreen === 'achievements' && renderAchievements()}
        {currentScreen === 'events' && renderEvents()}
        {currentScreen === 'profile' && renderProfile()}
      </div>
    </div>
  );
};

export default Index;
