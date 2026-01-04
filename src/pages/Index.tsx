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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type MenuScreen = 'main' | 'levels' | 'shop' | 'achievements' | 'profile' | 'events' | 'customize';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<MenuScreen>('main');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const { 
    gameState, 
    setGameState,
    playerStats,
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
    stickers,
    avatarEmojis
  } = useGameState();

  const currentBike = bikes.find(b => b.id === playerStats.currentBike);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleScoreUpdate = (score: number, distance: number, coins: number, jumps: number) => {
    setGameState(prev => ({ ...prev, score, distance, coins }));
  };

  const handleGameOver = (stars: number) => {
    endGame(gameState.score, gameState.coins, gameState.distance, stars, 0);
  };

  const handleLogin = () => {
    if (!validateEmail(email)) {
      setEmailError('Введите корректный email');
      return;
    }
    if (password.length < 6) {
      setEmailError('Пароль должен быть минимум 6 символов');
      return;
    }
    setIsAuthenticated(true);
    setCurrentScreen('main');
  };

  const handleRegister = () => {
    if (username.trim().length < 3) {
      setEmailError('Имя должно быть минимум 3 символа');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Введите корректный email');
      return;
    }
    if (password.length < 6) {
      setEmailError('Пароль должен быть минимум 6 символов');
      return;
    }
    updateUsername(username);
    setIsAuthenticated(true);
    setCurrentScreen('main');
  };

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-12 text-center bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-primary">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-6xl font-black mb-6 gradient-text">ПОЗДРАВЛЯЕМ!</h1>
          <p className="text-2xl mb-4">Вы прошли все 20 уровней!</p>
          <p className="text-xl text-muted-foreground mb-8">
            Вы настоящая легенда! Игра перезагрузится через 30 секунд
          </p>
          <div className="flex items-center justify-center gap-8 text-3xl">
            <div>🏍️ {bikes.filter(b => b.isUnlocked).length}/5</div>
            <div>⭐ {levels.reduce((sum, l) => sum + l.stars, 0)}/60</div>
            <div>🏅 {achievements.filter(a => a.isUnlocked).length}/{achievements.length}</div>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="emoji-bg"
            style={{
              left: `${(i * 137) % 100}%`,
              top: `${(i * 89) % 100}%`,
              animationDelay: `${i * 0.3}s`
            }}
          >
            {['🏍️', '⚡', '🔥', '⭐', '💨', '🏁'][i % 6]}
          </div>
        ))}
        
        <Card className="w-full max-w-md p-8 bg-card/90 backdrop-blur-md border-2 border-primary relative z-10">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏍️</div>
            <h1 className="text-4xl font-black mb-2 gradient-text">Мотоцикл</h1>
            <h2 className="text-2xl font-bold mb-2">Избегай препятствий!</h2>
            <p className="text-muted-foreground">Войдите, чтобы начать игру</p>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="example@mail.com" 
                  className="mt-1"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Минимум 6 символов" 
                  className="mt-1"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setEmailError('');
                  }}
                />
              </div>
              {emailError && <p className="text-destructive text-sm">{emailError}</p>}
              <Button onClick={handleLogin} className="w-full">
                <Icon name="LogIn" className="mr-2" size={20} />
                Войти
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <div>
                <Label htmlFor="username">Имя пользователя</Label>
                <Input 
                  id="username" 
                  placeholder="Минимум 3 символа" 
                  className="mt-1"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setEmailError('');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input 
                  id="reg-email" 
                  type="email" 
                  placeholder="example@mail.com" 
                  className="mt-1"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                />
              </div>
              <div>
                <Label htmlFor="reg-password">Пароль</Label>
                <Input 
                  id="reg-password" 
                  type="password" 
                  placeholder="Минимум 6 символов" 
                  className="mt-1"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setEmailError('');
                  }}
                />
              </div>
              {emailError && <p className="text-destructive text-sm">{emailError}</p>}
              <Button onClick={handleRegister} className="w-full">
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
        <div className="mb-4 flex gap-2">
          <Button 
            onClick={pauseGame}
            variant="secondary"
          >
            <Icon name={gameState.isPaused ? "Play" : "Pause"} className="mr-2" size={20} />
            {gameState.isPaused ? 'Продолжить' : 'Пауза'}
          </Button>
          <Button 
            onClick={() => setGameState(prev => ({ ...prev, isPlaying: false }))}
            variant="destructive"
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
          bikeEmoji={currentBike?.emoji || '🏍️'}
          bikeColor={currentBike?.color || '#FF6B35'}
          bikeStickers={currentBike?.stickers?.map(id => stickers.find(s => s.id === id)?.emoji || '').filter(Boolean)}
          playerAvatar={playerStats.avatar}
          playerUsername={playerStats.username}
          playerCoins={playerStats.totalCoins}
          playerGems={playerStats.premiumCurrency}
          onScoreUpdate={handleScoreUpdate}
          onGameOver={handleGameOver}
        />
        
        <div className="mt-4 text-center text-muted-foreground">
          <p className="text-lg">🖱️ Нажмите ПРОБЕЛ, ↑ или КЛИКНИТЕ для прыжка</p>
        </div>
      </div>
    );
  }

  const renderMainMenu = () => (
    <div className="space-y-6 animate-fade-in relative">
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={i}
          className="emoji-bg"
          style={{
            left: `${(i * 173) % 95}%`,
            top: `${(i * 127) % 95}%`,
            animationDelay: `${i * 0.5}s`
          }}
        >
          {['🏍️', '⚡', '🔥', '⭐', '💨', '🏁'][i % 6]}
        </div>
      ))}
      
      <div className="text-center mb-12 relative z-10">
        <div className="text-8xl mb-4 animate-float">🏍️</div>
        <h1 className="text-7xl font-black mb-4 gradient-text">
          МОТОЦИКЛ
        </h1>
        <h2 className="text-4xl font-bold mb-2 text-primary">
          Избегай препятствий!
        </h2>
        <p className="text-xl text-muted-foreground">
          ⚡ Гоночный экшен ⚡
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto relative z-10">
        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-all bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border-2 border-primary shadow-lg hover:shadow-primary/50"
          onClick={() => startGame('normal', 1)}
        >
          <div className="text-5xl mb-4">🏁</div>
          <h3 className="text-2xl font-bold mb-2 gradient-text">Начать игру</h3>
          <p className="text-muted-foreground">Классический режим</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-all bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-sm border-2 border-secondary shadow-lg hover:shadow-secondary/50"
          onClick={() => setCurrentScreen('levels')}
        >
          <div className="text-5xl mb-4">🗺️</div>
          <h3 className="text-2xl font-bold mb-2 gradient-text">Уровни</h3>
          <p className="text-muted-foreground">20 уровней сложности</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-all bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-sm border-2 border-accent shadow-lg hover:shadow-accent/50"
          onClick={() => setCurrentScreen('shop')}
        >
          <div className="text-5xl mb-4">🛒</div>
          <h3 className="text-2xl font-bold mb-2 gradient-text">Магазин</h3>
          <p className="text-muted-foreground">Мотоциклы и улучшения</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-all bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border-2 border-primary shadow-lg hover:shadow-primary/50"
          onClick={() => setCurrentScreen('customize')}
        >
          <div className="text-5xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold mb-2 gradient-text">Кастомизация</h3>
          <p className="text-muted-foreground">Наклейки на мотоциклы</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-all bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-sm border-2 border-secondary shadow-lg hover:shadow-secondary/50"
          onClick={() => setCurrentScreen('events')}
        >
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-2xl font-bold mb-2 gradient-text">События</h3>
          <p className="text-muted-foreground">Специальные награды</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-all bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-sm border-2 border-accent shadow-lg hover:shadow-accent/50"
          onClick={() => setCurrentScreen('achievements')}
        >
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold mb-2 gradient-text">Достижения</h3>
          <p className="text-muted-foreground">{achievements.filter(a => a.isUnlocked).length}/{achievements.length}</p>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:scale-105 transition-all bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border-2 border-primary shadow-lg hover:shadow-primary/50 col-span-full"
          onClick={() => setCurrentScreen('profile')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{playerStats.avatar}</div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">{playerStats.username}</h3>
                <p className="text-muted-foreground">Уровень {playerStats.level} • {playerStats.gamesPlayed} игр</p>
              </div>
            </div>
            <div className="flex gap-6 text-2xl">
              <div className="text-center">
                <div className="font-bold gradient-text">{playerStats.totalCoins}</div>
                <div className="text-sm">💰 Монеты</div>
              </div>
              <div className="text-center">
                <div className="font-bold gradient-text">{playerStats.premiumCurrency}</div>
                <div className="text-sm">💎 Алмазы</div>
              </div>
              <div className="text-center">
                <div className="font-bold gradient-text">{Math.floor(playerStats.totalDistance)}</div>
                <div className="text-sm">📏 Метров</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderLevels = () => (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-5xl font-black gradient-text">🗺️ Уровни</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline" size="lg">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {levels.map(level => (
          <Card 
            key={level.id}
            className={`p-6 text-center ${level.isUnlocked ? 'cursor-pointer hover:scale-110 border-primary' : 'opacity-50 border-muted'} transition-all border-2`}
            onClick={() => level.isUnlocked && startGame('normal', level.id)}
          >
            <div className="text-5xl font-black mb-2 gradient-text">{level.id}</div>
            <Badge variant={
              level.difficulty === 'easy' ? 'default' :
              level.difficulty === 'medium' ? 'secondary' :
              level.difficulty === 'hard' ? 'destructive' :
              level.difficulty === 'unreal' ? 'outline' : 'destructive'
            } className="mb-2">
              {level.difficulty === 'easy' ? 'Легко' :
               level.difficulty === 'medium' ? 'Средне' :
               level.difficulty === 'hard' ? 'Сложно' :
               level.difficulty === 'unreal' ? 'Нереально' : 'Невозможно'}
            </Badge>
            <div className="flex justify-center gap-1">
              {[1, 2, 3].map(star => (
                <span key={star} className={star <= level.stars ? 'text-2xl' : 'text-2xl opacity-30'}>
                  ⭐
                </span>
              ))}
            </div>
            {!level.isUnlocked && (
              <div className="mt-2 text-xs flex items-center justify-center gap-1">
                🔒 {level.requiredStars} ⭐
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-5xl font-black gradient-text">🛒 Магазин</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline" size="lg">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bikes.map(bike => (
              <Card 
                key={bike.id}
                className="p-6 border-2"
                style={{ borderColor: bike.isUnlocked ? bike.color : '#444' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-6xl">{bike.emoji}</div>
                    <div>
                      <h3 className="text-2xl font-bold gradient-text">{bike.name}</h3>
                      {bike.id === playerStats.currentBike && (
                        <Badge variant="default">Выбран</Badge>
                      )}
                      {bike.requirement === 'night-distance' && (
                        <Badge variant="secondary">50км ночью</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">⚡ Скорость</span>
                      <span className="text-sm font-bold">{bike.speed + playerStats.upgrades.speed}/10</span>
                    </div>
                    <Progress value={(bike.speed + playerStats.upgrades.speed) * 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">🛡️ Защита</span>
                      <span className="text-sm font-bold">{bike.defense + playerStats.upgrades.defense}/10</span>
                    </div>
                    <Progress value={(bike.defense + playerStats.upgrades.defense) * 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">🚀 Прыжок</span>
                      <span className="text-sm font-bold">{bike.jump + playerStats.upgrades.jump}/10</span>
                    </div>
                    <Progress value={(bike.jump + playerStats.upgrades.jump) * 10} className="h-2" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 italic">💡 {bike.ability}</p>

                {bike.isUnlocked ? (
                  <Button 
                    onClick={() => selectBike(bike.id)}
                    disabled={bike.id === playerStats.currentBike}
                    className="w-full"
                    size="lg"
                  >
                    {bike.id === playerStats.currentBike ? '✓ Выбран' : 'Выбрать'}
                  </Button>
                ) : bike.price === 0 ? (
                  <Button disabled className="w-full" size="lg">
                    🔒 Заблокирован
                  </Button>
                ) : (
                  <Button 
                    onClick={() => buyBike(bike.id)}
                    className="w-full"
                    size="lg"
                  >
                    {bike.isPremium ? '💎' : '💰'} Купить за {bike.price}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upgrades">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { stat: 'speed', emoji: '⚡', name: 'Скорость', desc: 'Увеличивает скорость байка' },
              { stat: 'defense', emoji: '🛡️', name: 'Защита', desc: 'Снижает урон от препятствий' },
              { stat: 'jump', emoji: '🚀', name: 'Прыжок', desc: 'Прыгайте выше' }
            ].map(({ stat, emoji, name, desc }) => {
              const currentLevel = playerStats.upgrades[stat as keyof typeof playerStats.upgrades];
              const cost = (currentLevel + 1) * 500;
              
              return (
                <Card key={stat} className="p-6 border-2 border-primary">
                  <div className="text-6xl mb-4 text-center">{emoji}</div>
                  <h3 className="text-2xl font-bold mb-2 text-center gradient-text">{name}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">{desc}</p>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Уровень {currentLevel}</span>
                      <span>Макс. 10</span>
                    </div>
                    <Progress value={currentLevel * 10} className="h-3" />
                  </div>
                  <Button 
                    onClick={() => upgradeStats(stat as 'speed' | 'defense' | 'jump')}
                    disabled={currentLevel >= 10}
                    className="w-full"
                    size="lg"
                  >
                    {currentLevel >= 10 ? 'МАКС' : `💰 Улучшить за ${cost}`}
                  </Button>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderCustomize = () => (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-5xl font-black gradient-text">🎨 Кастомизация</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline" size="lg">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-2 border-primary">
          <h3 className="text-2xl font-bold mb-4 gradient-text">Наклейки</h3>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {stickers.map(sticker => {
              const isUnlocked = playerStats.unlockedStickers.includes(sticker.id);
              return (
                <div 
                  key={sticker.id}
                  className={`p-4 rounded-lg border-2 text-center ${isUnlocked ? 'border-primary cursor-pointer hover:scale-110' : 'border-muted opacity-50'} transition-all`}
                >
                  <div className="text-4xl mb-2">{sticker.emoji}</div>
                  <div className="text-xs mb-2">{sticker.name}</div>
                  {!isUnlocked && (
                    <Button 
                      onClick={() => buySticker(sticker.id)}
                      size="sm"
                      className="w-full text-xs"
                    >
                      💰 {sticker.price}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 border-2 border-secondary">
          <h3 className="text-2xl font-bold mb-4 gradient-text">Мой {currentBike?.name}</h3>
          <div className="text-center mb-6">
            <div className="text-9xl mb-4">{currentBike?.emoji}</div>
            <div className="flex justify-center gap-3 mb-4">
              {currentBike?.stickers?.slice(0, 3).map((stickerId, index) => {
                const sticker = stickers.find(s => s.id === stickerId);
                return sticker ? (
                  <div 
                    key={index}
                    className="text-4xl cursor-pointer hover:scale-125 transition-transform"
                    onClick={() => removeStickerFromBike(playerStats.currentBike, index)}
                  >
                    {sticker.emoji}
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">Нажмите на наклейку, чтобы добавить (макс. 3):</p>
            <div className="grid grid-cols-4 gap-2">
              {playerStats.unlockedStickers.map(stickerId => {
                const sticker = stickers.find(s => s.id === stickerId);
                const canAdd = (currentBike?.stickers?.length || 0) < 3;
                return sticker ? (
                  <Button
                    key={stickerId}
                    variant="outline"
                    size="sm"
                    onClick={() => canAdd && addStickerToBike(playerStats.currentBike, stickerId)}
                    disabled={!canAdd}
                    className="text-2xl h-14"
                  >
                    {sticker.emoji}
                  </Button>
                ) : null;
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-5xl font-black gradient-text">🏆 Достижения</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline" size="lg">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <Card 
            key={achievement.id}
            className={`p-6 ${achievement.isUnlocked ? 'bg-primary/20 border-primary border-2' : 'bg-card/50 border-muted'}`}
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{achievement.isUnlocked ? '🏅' : '🔒'}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1 gradient-text">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                
                {!achievement.isUnlocked && (
                  <div className="mb-3">
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
                
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    💰 {achievement.reward.coins}
                  </Badge>
                  {achievement.reward.premiumCurrency > 0 && (
                    <Badge variant="default">
                      💎 {achievement.reward.premiumCurrency}
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
        <h2 className="text-5xl font-black gradient-text">📅 События</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline" size="lg">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => {
          let progress = 0;
          let target = 1;
          
          if (event.requirement) {
            if (event.requirement.type === 'night-distance') {
              progress = playerStats.nightDistance || 0;
              target = event.requirement.value;
            } else if (event.requirement.type === 'snow-distance') {
              progress = playerStats.snowDistance || 0;
              target = event.requirement.value;
            } else if (event.requirement.type === 'extreme-stars') {
              progress = levels.slice(10, 20).reduce((sum, l) => sum + l.stars, 0);
              target = event.requirement.value;
            }
          }
          
          return (
            <Card 
              key={event.id}
              className="p-6 border-2 border-primary cursor-pointer hover:scale-105 transition-all"
              onClick={() => event.isActive && startGame(event.type as any)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-5xl">
                  {event.type === 'night' ? '🌙' : event.type === 'snow' ? '❄️' : '🎯'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold gradient-text">{event.name}</h3>
                  <Badge variant={event.isActive ? 'default' : 'secondary'}>
                    {event.isActive ? 'Активно' : 'Завершено'}
                  </Badge>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">{event.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  📅 {event.startDate} - {event.endDate}
                </div>
                
                {event.requirement && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Прогресс</span>
                      <span>{Math.floor(progress)} / {target}</span>
                    </div>
                    <Progress value={(progress / target) * 100} className="h-2" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Badge variant="secondary" className="text-lg">
                  💰 {event.rewards.coins}
                </Badge>
                <Badge variant="default" className="text-lg">
                  💎 {event.rewards.premiumCurrency}
                </Badge>
              </div>

              {event.isActive && (
                <Button className="w-full mt-4" size="lg">
                  🎮 Начать событие
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-5xl font-black gradient-text">👤 Профиль</h2>
        <Button onClick={() => setCurrentScreen('main')} variant="outline" size="lg">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-2 border-primary">
          <div className="text-center mb-6">
            <Dialog>
              <DialogTrigger asChild>
                <div className="text-9xl mb-4 cursor-pointer hover:scale-110 transition-transform inline-block">
                  {playerStats.avatar}
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Выберите аватар</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-5 gap-3">
                  {avatarEmojis.map(emoji => (
                    <Button
                      key={emoji}
                      variant="outline"
                      className="text-4xl h-20"
                      onClick={() => {
                        updateAvatar(emoji);
                      }}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="mb-2">
                  <Icon name="Edit" className="mr-2" />
                  Изменить имя
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Изменить имя</DialogTitle>
                </DialogHeader>
                <Input 
                  defaultValue={playerStats.username}
                  onBlur={(e) => e.target.value.length >= 3 && updateUsername(e.target.value)}
                  placeholder="Минимум 3 символа"
                />
              </DialogContent>
            </Dialog>

            <h3 className="text-3xl font-bold gradient-text mb-2">{playerStats.username}</h3>
            <p className="text-muted-foreground">Уровень {playerStats.level}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between p-3 bg-card/50 rounded">
              <span>🎮 Всего игр:</span>
              <span className="font-bold">{playerStats.gamesPlayed}</span>
            </div>
            <div className="flex justify-between p-3 bg-card/50 rounded">
              <span>🏆 Рекорд:</span>
              <span className="font-bold">{playerStats.highScore}</span>
            </div>
            <div className="flex justify-between p-3 bg-card/50 rounded">
              <span>📏 Дистанция:</span>
              <span className="font-bold">{Math.floor(playerStats.totalDistance)}м</span>
            </div>
            <div className="flex justify-between p-3 bg-card/50 rounded">
              <span>🦘 Прыжков:</span>
              <span className="font-bold">{playerStats.totalJumps}</span>
            </div>
            <div className="flex justify-between p-3 bg-card/50 rounded">
              <span>💰 Монеты:</span>
              <span className="font-bold text-yellow-400">{playerStats.totalCoins}</span>
            </div>
            <div className="flex justify-between p-3 bg-card/50 rounded">
              <span>💎 Алмазы:</span>
              <span className="font-bold text-purple-400">{playerStats.premiumCurrency}</span>
            </div>
          </div>

          <Button 
            onClick={logout}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            <Icon name="LogOut" className="mr-2" size={20} />
            Выйти из аккаунта
          </Button>
        </Card>

        <Card className="p-6 border-2 border-secondary">
          <h3 className="text-2xl font-bold mb-4 gradient-text">Достижения</h3>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {achievements.slice(0, 15).map(achievement => (
              <div 
                key={achievement.id}
                className={`text-4xl text-center p-2 rounded ${achievement.isUnlocked ? 'bg-primary/20' : 'bg-gray-800'}`}
                title={achievement.title}
              >
                {achievement.isUnlocked ? '🏅' : '🔒'}
              </div>
            ))}
          </div>

          <h3 className="text-2xl font-bold mb-4 gradient-text">Коллекция мотоциклов</h3>
          <div className="space-y-2">
            {bikes.filter(b => b.isUnlocked).map(bike => (
              <div 
                key={bike.id} 
                className="flex items-center gap-3 p-3 rounded bg-card/50 border-2"
                style={{ borderColor: bike.color }}
              >
                <div className="text-4xl">{bike.emoji}</div>
                <div>
                  <div className="font-bold">{bike.name}</div>
                  <div className="text-xs text-muted-foreground">{bike.ability}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {currentScreen === 'main' && renderMainMenu()}
        {currentScreen === 'levels' && renderLevels()}
        {currentScreen === 'shop' && renderShop()}
        {currentScreen === 'customize' && renderCustomize()}
        {currentScreen === 'achievements' && renderAchievements()}
        {currentScreen === 'events' && renderEvents()}
        {currentScreen === 'profile' && renderProfile()}
      </div>
    </div>
  );
};

export default Index;
