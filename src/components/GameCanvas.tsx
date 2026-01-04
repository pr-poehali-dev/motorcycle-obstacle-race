import { useEffect, useRef, useState } from 'react';
import { Obstacle } from '@/types/game';

interface GameCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  gameMode: 'normal' | 'night' | 'snow';
  bikeSpeed: number;
  bikeJump: number;
  bikeDefense: number;
  bikeEmoji: string;
  bikeColor: string;
  bikeStickers?: string[];
  playerAvatar: string;
  playerUsername: string;
  playerCoins: number;
  playerGems: number;
  onScoreUpdate: (score: number, distance: number, coins: number, jumps: number) => void;
  onGameOver: (stars: number) => void;
}

export const GameCanvas = ({
  isPlaying,
  isPaused,
  gameMode,
  bikeSpeed,
  bikeJump,
  bikeDefense,
  bikeEmoji,
  bikeColor,
  bikeStickers = [],
  playerAvatar,
  playerUsername,
  playerCoins,
  playerGems,
  onScoreUpdate,
  onGameOver
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bike, setBike] = useState({ x: 100, y: 300, velocityY: 0, isJumping: false });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [coins, setCoins] = useState<Array<{ x: number; y: number; collected: boolean }>>([]);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [jumps, setJumps] = useState(0);
  const [lives, setLives] = useState(3);
  const animationFrameRef = useRef<number>();
  const lastObstacleTime = useRef<number>(0);

  const GROUND_Y = 350;
  const BIKE_SIZE = 50;
  const GRAVITY = 0.6;
  const BASE_SPEED = 5;

  useEffect(() => {
    if (!isPlaying) {
      setObstacles([]);
      setCoins([]);
      setScore(0);
      setDistance(0);
      setCollectedCoins(0);
      setJumps(0);
      setLives(3);
      setBike({ x: 100, y: GROUND_Y, velocityY: 0, isJumping: false });
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === 'ArrowUp') && !bike.isJumping && isPlaying && !isPaused) {
        const jumpPower = -12 - (bikeJump * 0.8);
        const snowPenalty = gameMode === 'snow' ? 0.7 : 1;
        setBike(prev => ({ 
          ...prev, 
          velocityY: jumpPower * snowPenalty, 
          isJumping: true 
        }));
        setJumps(prev => prev + 1);
      }
    };

    const handleClick = () => {
      if (!bike.isJumping && isPlaying && !isPaused) {
        const jumpPower = -12 - (bikeJump * 0.8);
        const snowPenalty = gameMode === 'snow' ? 0.7 : 1;
        setBike(prev => ({ 
          ...prev, 
          velocityY: jumpPower * snowPenalty, 
          isJumping: true 
        }));
        setJumps(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [bike.isJumping, isPlaying, isPaused, bikeJump, gameMode]);

  const spawnObstacle = (currentTime: number) => {
    if (currentTime - lastObstacleTime.current < 1500) return;
    lastObstacleTime.current = currentTime;

    const types: Obstacle['type'][] = ['spike', 'barrier', 'cone', 'hole'];
    const type = types[Math.floor(Math.random() * types.length)];
    const width = type === 'hole' ? 100 : type === 'cone' ? 35 : 45;
    const height = type === 'barrier' ? 70 : type === 'cone' ? 60 : 40;
    
    setObstacles(prev => [...prev, {
      id: Math.random().toString(),
      x: 800,
      y: GROUND_Y - height,
      width,
      height,
      type
    }]);
  };

  const spawnCoin = () => {
    if (Math.random() > 0.3) {
      setCoins(prev => [...prev, {
        x: 800 + Math.random() * 200,
        y: GROUND_Y - 80 - Math.random() * 120,
        collected: false
      }]);
    }
  };

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const coinInterval = setInterval(spawnCoin, 2000);

    return () => {
      clearInterval(coinInterval);
    };
  }, [isPlaying, isPaused]);

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameSpeed = BASE_SPEED * (1 + bikeSpeed * 0.15);
    const defenseBonus = bikeDefense * 0.1;

    const gameLoop = (currentTime: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (gameMode === 'night') {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const gradient = ctx.createRadialGradient(bike.x + 25, bike.y + 25, 20, bike.x + 100, bike.y, 200);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 100, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (gameMode === 'snow') {
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 50; i++) {
          const x = (currentTime * 0.1 + i * 16) % canvas.width;
          const y = (currentTime * 0.05 + i * 23) % canvas.height;
          ctx.fillRect(x, y, 3, 3);
        }
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#00D9FF');
        gradient.addColorStop(0.5, '#1a2332');
        gradient.addColorStop(1, '#0f1419');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.fillStyle = '#2a3a4a';
      ctx.fillRect(0, GROUND_Y + BIKE_SIZE, canvas.width, 10);

      ctx.font = `${BIKE_SIZE}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bikeEmoji, bike.x + BIKE_SIZE / 2, bike.y + BIKE_SIZE / 2);

      if (bikeStickers && bikeStickers.length > 0) {
        ctx.font = `${BIKE_SIZE * 0.5}px Arial`;
        bikeStickers.slice(0, 3).forEach((sticker, index) => {
          const offsetX = (index - 1) * 15;
          const offsetY = -10 + (index % 2) * 20;
          ctx.fillText(sticker, bike.x + BIKE_SIZE / 2 + offsetX, bike.y + BIKE_SIZE / 2 + offsetY);
        });
      }

      setBike(prev => {
        let newY = prev.y + prev.velocityY;
        let newVelocityY = prev.velocityY + GRAVITY;
        let newIsJumping = prev.isJumping;

        if (newY >= GROUND_Y) {
          newY = GROUND_Y;
          newVelocityY = 0;
          newIsJumping = false;
        }

        return { ...prev, y: newY, velocityY: newVelocityY, isJumping: newIsJumping };
      });

      spawnObstacle(currentTime);

      setObstacles(prev => {
        return prev
          .map(obstacle => ({ ...obstacle, x: obstacle.x - gameSpeed }))
          .filter(obstacle => obstacle.x > -obstacle.width - 100);
      });

      obstacles.forEach(obstacle => {
        if (obstacle.type === 'spike') {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          for (let i = 0; i < obstacle.width; i += 15) {
            ctx.moveTo(obstacle.x + i, obstacle.y + obstacle.height);
            ctx.lineTo(obstacle.x + i + 7, obstacle.y);
            ctx.lineTo(obstacle.x + i + 15, obstacle.y + obstacle.height);
          }
          ctx.closePath();
          ctx.fill();
        } else if (obstacle.type === 'barrier') {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.strokeStyle = '#065f46';
          ctx.lineWidth = 3;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else if (obstacle.type === 'cone') {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
          ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
          ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
          ctx.closePath();
          ctx.fill();
          
          ctx.fillStyle = '#ffffff';
          const stripeHeight = obstacle.height / 5;
          for (let i = 1; i < 5; i += 2) {
            ctx.beginPath();
            const y1 = obstacle.y + i * stripeHeight;
            const y2 = obstacle.y + (i + 1) * stripeHeight;
            const w1 = (obstacle.width / 2) * (1 - i * 0.2);
            const w2 = (obstacle.width / 2) * (1 - (i + 1) * 0.2);
            ctx.moveTo(obstacle.x + obstacle.width / 2 - w1, y1);
            ctx.lineTo(obstacle.x + obstacle.width / 2 + w1, y1);
            ctx.lineTo(obstacle.x + obstacle.width / 2 + w2, y2);
            ctx.lineTo(obstacle.x + obstacle.width / 2 - w2, y2);
            ctx.closePath();
            ctx.fill();
          }
        } else if (obstacle.type === 'hole') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(obstacle.x, obstacle.y + obstacle.height, obstacle.width, 10);
        }

        const bikeLeft = bike.x + 5;
        const bikeRight = bike.x + BIKE_SIZE - 5;
        const bikeTop = bike.y + 5;
        const bikeBottom = bike.y + BIKE_SIZE - 5;
        const obsLeft = obstacle.x;
        const obsRight = obstacle.x + obstacle.width;
        const obsTop = obstacle.y;
        const obsBottom = obstacle.y + obstacle.height;

        const collision = bikeRight > obsLeft && bikeLeft < obsRight && 
                          bikeBottom > obsTop && bikeTop < obsBottom;

        if (collision) {
          const damageChance = Math.random();
          if (damageChance > defenseBonus) {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                const stars = distance > 2000 ? 3 : distance > 1200 ? 2 : distance > 600 ? 1 : 0;
                onGameOver(stars);
              }
              return newLives;
            });
            setObstacles(prev => prev.filter(o => o.id !== obstacle.id));
          }
        }
      });

      setCoins(prev => {
        return prev
          .map(coin => ({ ...coin, x: coin.x - gameSpeed }))
          .filter(coin => coin.x > -30);
      });

      coins.forEach((coin) => {
        if (!coin.collected) {
          ctx.font = '24px Arial';
          ctx.fillText('🪙', coin.x, coin.y);

          const coinDistance = Math.sqrt(
            Math.pow(bike.x + BIKE_SIZE / 2 - coin.x, 2) + 
            Math.pow(bike.y + BIKE_SIZE / 2 - coin.y, 2)
          );
          
          if (coinDistance < 40) {
            setCoins(prev => {
              const newCoins = [...prev];
              const index = newCoins.findIndex(c => c.x === coin.x && c.y === coin.y);
              if (index !== -1) {
                newCoins[index] = { ...newCoins[index], collected: true };
              }
              return newCoins;
            });
            setCollectedCoins(prev => prev + 1);
            setScore(prev => prev + 10);
          }
        }
      });

      setDistance(prev => {
        const newDistance = prev + gameSpeed * 0.1;
        return newDistance;
      });
      setScore(prev => prev + Math.floor(gameSpeed * 0.1));

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(10, 10, 280, 100);
      ctx.strokeStyle = bikeColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, 280, 100);

      ctx.font = '32px Arial';
      ctx.fillText(playerAvatar, 35, 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Rubik';
      ctx.textAlign = 'left';
      ctx.fillText(playerUsername, 70, 35);

      ctx.font = '14px Rubik';
      ctx.fillText(`💰 ${playerCoins + collectedCoins}`, 70, 55);
      ctx.fillText(`💎 ${playerGems}`, 170, 55);

      ctx.fillStyle = '#FF6B35';
      ctx.fillRect(70, 65, 210, 8);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(70, 65, (lives / 3) * 210, 8);

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Rubik';
      ctx.fillText(`❤️ ${lives}/3`, 70, 88);
      ctx.fillText(`📏 ${Math.floor(distance)}м`, 140, 88);
      ctx.fillText(`🏆 ${score}`, 230, 88);

      onScoreUpdate(score, distance, collectedCoins, jumps);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPaused, bike, obstacles, coins, score, distance, collectedCoins, lives, jumps, bikeSpeed, bikeJump, bikeDefense, gameMode, bikeEmoji, bikeColor, bikeStickers, playerAvatar, playerUsername, playerCoins, playerGems, onScoreUpdate, onGameOver]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={450} 
        className="border-4 rounded-lg shadow-2xl"
        style={{ borderColor: bikeColor }}
      />
      <div className="absolute top-4 right-4 text-white text-sm bg-black/60 px-3 py-1 rounded">
        {gameMode === 'night' && '🌙 Ночной режим'}
        {gameMode === 'snow' && '❄️ Снежный режим'}
        {gameMode === 'normal' && '☀️ Обычный режим'}
      </div>
    </div>
  );
};
