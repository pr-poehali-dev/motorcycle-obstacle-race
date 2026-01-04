import { useEffect, useRef, useState } from 'react';
import { Obstacle } from '@/types/game';

interface GameCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  gameMode: 'normal' | 'night' | 'snow';
  bikeSpeed: number;
  bikeJump: number;
  bikeDefense: number;
  onScoreUpdate: (score: number, distance: number, coins: number) => void;
  onGameOver: (stars: number) => void;
}

export const GameCanvas = ({
  isPlaying,
  isPaused,
  gameMode,
  bikeSpeed,
  bikeJump,
  bikeDefense,
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
  const [lives, setLives] = useState(3);
  const animationFrameRef = useRef<number>();

  const GROUND_Y = 350;
  const BIKE_WIDTH = 60;
  const BIKE_HEIGHT = 40;
  const GRAVITY = 0.8;
  const BASE_SPEED = 5;

  useEffect(() => {
    if (!isPlaying) {
      setObstacles([]);
      setCoins([]);
      setScore(0);
      setDistance(0);
      setCollectedCoins(0);
      setLives(3);
      setBike({ x: 100, y: 300, velocityY: 0, isJumping: false });
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === 'ArrowUp') && !bike.isJumping && isPlaying && !isPaused) {
        const jumpPower = -15 - (bikeJump * 0.5);
        const snowPenalty = gameMode === 'snow' ? 0.5 : 1;
        setBike(prev => ({ 
          ...prev, 
          velocityY: jumpPower * snowPenalty, 
          isJumping: true 
        }));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [bike.isJumping, isPlaying, isPaused, bikeJump, gameMode]);

  const spawnObstacle = () => {
    const types: Obstacle['type'][] = ['spike', 'barrier', 'hole', 'ramp'];
    const type = types[Math.floor(Math.random() * types.length)];
    const width = type === 'hole' ? 80 : 40;
    const height = type === 'barrier' ? 60 : 30;
    
    setObstacles(prev => [...prev, {
      id: Math.random().toString(),
      x: 800,
      y: type === 'hole' ? GROUND_Y : GROUND_Y - height,
      width,
      height,
      type
    }]);
  };

  const spawnCoin = () => {
    setCoins(prev => [...prev, {
      x: 800,
      y: GROUND_Y - 100 - Math.random() * 100,
      collected: false
    }]);
  };

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const obstacleInterval = setInterval(spawnObstacle, 2000);
    const coinInterval = setInterval(spawnCoin, 1500);

    return () => {
      clearInterval(obstacleInterval);
      clearInterval(coinInterval);
    };
  }, [isPlaying, isPaused]);

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameSpeed = BASE_SPEED * (1 + bikeSpeed * 0.1);

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (gameMode === 'night') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const gradient = ctx.createRadialGradient(bike.x + 30, bike.y + 20, 10, bike.x + 30, bike.y + 20, 150);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (gameMode === 'snow') {
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a0933');
        gradient.addColorStop(1, '#0a0e1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, GROUND_Y + 40, canvas.width, 10);

      ctx.fillStyle = '#9b87f5';
      ctx.shadowColor = '#9b87f5';
      ctx.shadowBlur = 20;
      ctx.fillRect(bike.x, bike.y, BIKE_WIDTH, BIKE_HEIGHT);
      ctx.fillRect(bike.x + 10, bike.y + BIKE_HEIGHT, 10, 10);
      ctx.fillRect(bike.x + 40, bike.y + BIKE_HEIGHT, 10, 10);
      ctx.shadowBlur = 0;

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

      setObstacles(prev => {
        return prev
          .map(obstacle => ({ ...obstacle, x: obstacle.x - gameSpeed }))
          .filter(obstacle => obstacle.x > -obstacle.width);
      });

      obstacles.forEach(obstacle => {
        if (obstacle.type === 'spike') {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
          ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
          ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
          ctx.closePath();
          ctx.fill();
        } else if (obstacle.type === 'barrier') {
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 15;
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else if (obstacle.type === 'hole') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 10);
        } else if (obstacle.type === 'ramp') {
          ctx.fillStyle = '#0EA5E9';
          ctx.shadowColor = '#0EA5E9';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
          ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
          ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        const bikeLeft = bike.x;
        const bikeRight = bike.x + BIKE_WIDTH;
        const bikeTop = bike.y;
        const bikeBottom = bike.y + BIKE_HEIGHT;
        const obsLeft = obstacle.x;
        const obsRight = obstacle.x + obstacle.width;
        const obsTop = obstacle.y;
        const obsBottom = obstacle.y + obstacle.height;

        if (bikeRight > obsLeft && bikeLeft < obsRight && 
            bikeBottom > obsTop && bikeTop < obsBottom) {
          if (bikeDefense < 5 || Math.random() > bikeDefense * 0.1) {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                const stars = distance > 1500 ? 3 : distance > 1000 ? 2 : distance > 500 ? 1 : 0;
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
          .filter(coin => coin.x > -20);
      });

      coins.forEach((coin, index) => {
        if (!coin.collected) {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          const coinDistance = Math.sqrt(
            Math.pow(bike.x + BIKE_WIDTH / 2 - coin.x, 2) + 
            Math.pow(bike.y + BIKE_HEIGHT / 2 - coin.y, 2)
          );
          
          if (coinDistance < 30) {
            setCoins(prev => {
              const newCoins = [...prev];
              newCoins[index] = { ...coin, collected: true };
              return newCoins;
            });
            setCollectedCoins(prev => prev + 1);
          }
        }
      });

      setDistance(prev => prev + 1);
      setScore(prev => prev + Math.floor(gameSpeed));
      
      onScoreUpdate(score, distance, collectedCoins);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPaused, bike, obstacles, coins, score, distance, collectedCoins, gameMode, bikeSpeed, bikeJump, bikeDefense, lives, onScoreUpdate, onGameOver]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400}
        className="border-2 border-primary neon-border rounded-lg"
      />
      <div className="absolute top-4 left-4 text-white">
        <div className="text-lg font-bold gradient-text">Очки: {score}</div>
        <div className="text-lg font-bold gradient-text">Дистанция: {distance}м</div>
        <div className="text-lg font-bold gradient-text">Монеты: {collectedCoins}</div>
        <div className="text-lg font-bold text-red-400">Жизни: {lives}</div>
      </div>
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-4xl font-bold neon-text">ПАУЗА</div>
        </div>
      )}
    </div>
  );
};
