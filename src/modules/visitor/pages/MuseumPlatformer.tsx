import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';

// --- GAME CONSTANTS ---
const TILE_SIZE = 40;
const GRAVITY = 0.5;
const FRICTION = 0.8;
const JUMP_FORCE = -12;
const SPEED = 5;
const ANIMATION_FRAME_DURATION = 150; // ms per frame

// --- SPRITE SHEET CONFIG ---
const SPRITE_SHEETS = {
    player: {
        walk: { src: '/assets/characters/visitor_walk.png', frames: 4, frameWidth: 256 },
        jump: { src: '/assets/characters/visitor_jump.png', frames: 1, frameWidth: 256 },
    },
    enemy: {
        walk: { src: '/assets/characters/enemy_walk.png', frames: 4, frameWidth: 256 },
    },
    statue: {
        walk: { src: '/assets/characters/statue_walk.png', frames: 4, frameWidth: 256 },
    },
    frame: {
        walk: { src: '/assets/characters/frame_walk.png', frames: 4, frameWidth: 256 },
    },
    boss: {
        attack: { src: '/assets/characters/boss_attack.png', frames: 3, frameWidth: 341 },
    }
};

// --- CONFIGURATION (Default Theme - "The Gallery") ---
// Future: This can be replaced by "ImperialMuseumTheme" or "MASPTheme" props.
const DEFAULT_THEME = {
    colors: {
        sky: '#5BA3E6',        // Museum Blue
        ground: '#3E2723',     // Dark Museum Wood
        platform: '#6D4C41',   // Mahogany
        player: '#00ACC1',     // Teal (matches visitor jacket)
        coin: '#FFD700',       // Gold
        goal: '#66BB6A',       // Green Exit
        spike: '#37474F'       // Dark Grey Spikes
    },
    backgrounds: {
        default: null as string | null,
        level2: null as string | null
    },
    level: [
        "..................................................",
        "..................................................",
        "..................................................",
        "......................CC..........................",
        ".....................====.........................",
        "............CC....................................",
        "...........====...................CC..............",
        ".................................====.............",
        "....C.........................................G...",
        ".......................^^^...................###..",
        "##################################################"
    ]
};

// --- TYPES ---
interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    isGrounded: boolean;
    isDead: boolean;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

// Pre-load images for animation
const preloadedImages: { [key: string]: HTMLImageElement } = {};
const preloadImages = () => {
    Object.entries(SPRITE_SHEETS).forEach(([entityType, animations]) => {
        Object.entries(animations).forEach(([animName, config]) => {
            const key = `${entityType}_${animName}`;
            const img = new Image();
            img.src = config.src;
            preloadedImages[key] = img;
        });
    });
};
preloadImages();


export const MuseumPlatformer: React.FC<{ onClose: () => void; theme?: typeof DEFAULT_THEME }> = ({ onClose, theme = DEFAULT_THEME }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Remove navigate since we use onClose
    // const navigate = useNavigate();

    const { tenantId } = useAuth(); // Need tenantId for leaderboard

    // Character Options
    const CHARACTERS = [
        { id: 'male_light', name: 'Visitante 1', sprite: '/assets/characters/visitor_male_light.png', color: '#FFE0B2' },
        { id: 'male_medium', name: 'Visitante 2', sprite: '/assets/characters/visitor_male_medium.png', color: '#BCAAA4' },
        { id: 'male_dark', name: 'Visitante 3', sprite: '/assets/characters/visitor_male_dark.png', color: '#6D4C41' },
        { id: 'female_light', name: 'Visitante 4', sprite: '/assets/characters/visitor_female_light.png', color: '#FFE0B2' },
        { id: 'female_medium', name: 'Visitante 5', sprite: '/assets/characters/visitor_female_medium.png', color: '#BCAAA4' },
        { id: 'female_dark', name: 'Visitante 6', sprite: '/assets/characters/visitor_female_dark.png', color: '#6D4C41' },
    ];

    // UI State
    const [gameState, setGameState] = useState<'SELECT_CHARACTER' | 'START' | 'PLAYING' | 'GAMEOVER' | 'WIN' | 'CAMPAIGN_WIN'>('SELECT_CHARACTER');
    const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[0]);
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [currentLevelIdx, setCurrentLevelIdx] = useState(0);

    // Normalize theme levels (support single or array)
    const levels = (theme as any).levels || [theme.level];
    const sprites = (theme as any).sprites; // Access sprites safely

    // Fetch Leaderboard on Game Over / Campaign Win
    useEffect(() => {
        if (gameState === 'GAMEOVER' || gameState === 'CAMPAIGN_WIN') {
            fetchLeaderboard();
        }
    }, [gameState]);

    const fetchLeaderboard = async () => {
        if (!tenantId) return;
        try {
            const res = await api.get(`/gamification/leaderboard?tenantId=${tenantId}`);
            setLeaderboard(res.data);
        } catch (e) {
            console.error("Failed to load leaderboard", e);
        }
    };

    // Game Mutable State (Ref to avoid re-renders in loop)
    const game = useRef({
        player: { x: 50, y: 50, width: 60, height: 80, vx: 0, vy: 0, isGrounded: false, isDead: false } as Entity,
        keys: { left: false, right: false, up: false },
        camera: { x: 0 },
        tiles: [] as { x: number, y: number, type: string, collected?: boolean, animFrame?: number }[],
        particles: [] as Particle[],
        levelWidth: 0,
        levelHeight: 0,
        animationFrame: 0,
        // Animation State
        playerAnimFrame: 0,
        lastFrameTime: 0,
        facingRight: true,
    });

    useEffect(() => {
        initLevel(currentLevelIdx);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Start Loop
        game.current.animationFrame = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(game.current.animationFrame);
        };
    }, [currentLevelIdx, levels]); // Added dependencies for level changes

    const initLevel = (levelIndex: number = 0) => {
        const tiles = [];
        const rows = levels[levelIndex]; // Load specific level
        if (!rows) return; // Safety check

        game.current.levelHeight = rows.length * TILE_SIZE;
        game.current.levelWidth = rows[0].length * TILE_SIZE;

        for (let r = 0; r < rows.length; r++) {
            for (let c = 0; c < rows[r].length; c++) {
                const char = rows[r][c];
                if (char !== '.') {
                    tiles.push({
                        x: c * TILE_SIZE,
                        y: r * TILE_SIZE,
                        type: char,
                        vx: 0, // For enemies
                        vy: 0,
                        originX: c * TILE_SIZE, // Guard patrol origin
                        originY: r * TILE_SIZE
                    });
                }
            }
        }
        game.current.tiles = tiles;
        game.current.player = { x: 50, y: 50, width: 60, height: 80, vx: 0, vy: 0, isGrounded: false, isDead: false };
        game.current.camera.x = 0;

        // Only reset score/coins if starting fresh campaign
        if (levelIndex === 0) {
            setCoins(0);
            setScore(0);
        }

        setGameState('PLAYING');
    };

    const nextLevel = () => {
        if (currentLevelIdx < levels.length - 1) {
            setCurrentLevelIdx(prev => prev + 1);
            // initLevel will be called by the useEffect due to currentLevelIdx change
        } else {
            setGameState('CAMPAIGN_WIN');
            saveProgress();
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') game.current.keys.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') game.current.keys.right = true;
        if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
            game.current.keys.up = true;
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') game.current.keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') game.current.keys.right = false;
        if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') game.current.keys.up = false;
    };

    const spawnParticles = (x: number, y: number, color: string, count: number) => {
        for (let i = 0; i < count; i++) {
            game.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color
            });
        }
    };

    const update = () => {
        if (gameState !== 'PLAYING') return;
        const { player, keys, tiles } = game.current;

        // --- 1. MOVEMENT & PHYSICS ---
        if (keys.left) {
            player.vx = -SPEED;
            game.current.facingRight = false;
        }
        if (keys.right) {
            player.vx = SPEED;
            game.current.facingRight = true;
        }
        if (!keys.left && !keys.right) player.vx *= FRICTION;

        // Jump
        if (keys.up && player.isGrounded) {
            player.vy = JUMP_FORCE;
            player.isGrounded = false;
        }

        player.vy += GRAVITY;

        // --- ANIMATION FRAME UPDATE ---
        const now = performance.now();
        if (now - game.current.lastFrameTime > ANIMATION_FRAME_DURATION) {
            game.current.lastFrameTime = now;
            // Player animation
            if (Math.abs(player.vx) > 0.5) {
                game.current.playerAnimFrame = (game.current.playerAnimFrame + 1) % 4;
            } else {
                game.current.playerAnimFrame = 0; // Idle = first frame
            }
            // Enemy animations
            for (const tile of tiles) {
                if (tile.type === 'E' || tile.type === 'S' || tile.type === 'F' || tile.type === 'B') {
                    tile.animFrame = ((tile.animFrame || 0) + 1) % 4;
                }
            }
        }

        // --- 2. X COLLISION ---
        player.x += player.vx;
        checkCollision(player, tiles, 'x');

        // --- 3. Y COLLISION ---
        player.y += player.vy;
        player.isGrounded = false; // Assume falling until proven otherwise
        checkCollision(player, tiles, 'y');

        // --- 4. GAME OVER/WIN CHECK ---
        if (player.y > game.current.levelHeight) {
            die();
        }

        // --- 5. CAMERA ---
        // Camera follows player (centered)
        game.current.camera.x = player.x - 400;
        // Clamp camera
        if (game.current.camera.x < 0) game.current.camera.x = 0;
        if (game.current.camera.x > game.current.levelWidth - 800) game.current.camera.x = game.current.levelWidth - 800;

        // --- 6. PARTICLES ---
        for (let i = game.current.particles.length - 1; i >= 0; i--) {
            const p = game.current.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // gravity
            p.life -= 0.05;
            if (p.life <= 0) game.current.particles.splice(i, 1);
        }

        // --- 7. ENTITIES (Enemies/Boss) ---
        for (const tile of tiles) {
            // Update Enemies (Simple Patrol: Move left/right)
            if (tile.type === 'E') {
                if (!tile.vx) tile.vx = -2; // Init Speed

                tile.x += tile.vx;
                // Bounce logic (simple distance based or collision based if implemented)
                // For now, simple bounce after 100px travel (assuming we track origin)
                // Simplified: Bounce on edges (needs more logic for platforms).
                // Hack: Just oscillate every 60 frames? No, use position.
                // Let's use a simpler "Patrol Range" or just bounce on solid block collision if we checked it.
                // For MVP: oscillating movement relative to spawn.

                // Better MVP: Just move back and forth 100px
                if (!tile.originX) tile.originX = tile.x;
                if (tile.x < tile.originX - 100) tile.vx = 2;
                if (tile.x > tile.originX + 100) tile.vx = -2;
            }

            // Boss Logic (B) - Moves faster and jumps?
            if (tile.type === 'B') {
                if (!tile.vx) tile.vx = 3;
                tile.x += tile.vx;
                if (!tile.originX) tile.originX = tile.x;
                if (tile.x < tile.originX - 200) tile.vx = 3;
                if (tile.x > tile.originX + 200) tile.vx = -3;

                // Boss Jump randomly
                if (Math.random() < 0.02) tile.y -= 10;
                if (tile.y < (tile.originY || 0)) tile.y += 1; // Gravity fake
            }
        }
    };

    const checkCollision = (p: Entity, tiles: any[], axis: 'x' | 'y') => {
        for (const tile of tiles) {
            if (tile.collected) continue; // Skip collected coins

            // AABB Collision Test
            if (
                p.x < tile.x + (tile.type === 'B' ? 60 : TILE_SIZE) && // Boss is wider
                p.x + p.width > tile.x &&
                p.y < tile.y + (tile.type === 'B' ? 60 : TILE_SIZE) &&
                p.y + p.height > tile.y
            ) {
                // Determine Type Behavior
                if (tile.type === 'C') {
                    // Collect Coin
                    tile.collected = true;
                    setCoins(prev => prev + 1);
                    setScore(prev => prev + 100);
                    spawnParticles(tile.x + TILE_SIZE / 2, tile.y + TILE_SIZE / 2, theme.colors.coin, 5);
                    continue; // No physical collision
                }

                if (tile.type === 'E' || tile.type === 'B') {
                    // Enemy Interaction
                    // Mario Logic: Jump on top to kill?
                    const isJumpingOnTop = p.vy > 0 && p.y + p.height < tile.y + 20;

                    if (isJumpingOnTop) {
                        // Kill Enemy
                        tile.collected = true; // "Kill" by hiding
                        p.vy = -8; // Bounce
                        setScore(prev => prev + (tile.type === 'B' ? 1000 : 200));
                        spawnParticles(tile.x, tile.y, '#555', 10);
                        if (tile.type === 'B') {
                            // Boss Defeated! Maybe drop key? For now just XP.
                            // setGameState('WIN') if boss is mandatory?
                            // Let's keep Goal as win condition.
                        }
                    } else {
                        // Die
                        die();
                        return;
                    }
                    continue;
                }

                if (tile.type === 'G') {
                    // Level Goal Reached
                    if (currentLevelIdx < levels.length - 1) {
                        setGameState('WIN'); // Intermediate Win
                    } else {
                        setGameState('CAMPAIGN_WIN'); // Final Win
                        saveProgress();
                    }
                    return;
                }

                if (tile.type === '^') {
                    // Spike Death
                    die();
                    return;
                }

                // Solid Block Collision (# or =)
                if (axis === 'x') {
                    if (tile.type === 'E' || tile.type === 'B') continue; // Don't collide solid X with enemies yet (handled above)

                    if (p.vx > 0) p.x = tile.x - p.width;
                    if (p.vx < 0) p.x = tile.x + TILE_SIZE;
                    p.vx = 0;
                } else {
                    if (tile.type === 'E' || tile.type === 'B') continue;

                    if (p.vy > 0) { // Falling
                        p.y = tile.y - p.height;
                        p.isGrounded = true;
                        p.vy = 0;
                    } else if (p.vy < 0) { // Hitting head
                        p.y = tile.y + TILE_SIZE;
                        p.vy = 0;
                    }
                }
            }
        }
    };

    const die = () => {
        game.current.player.isDead = true;
        setGameState('GAMEOVER');
        spawnParticles(game.current.player.x, game.current.player.y, theme.colors.player, 20);
    };

    const saveProgress = async () => {
        // Mock save for now - in real app, call API
        console.log("Saving XP:", score);
        try {
            await api.post('/gamification/xp', { amount: score + 500, reason: 'GAME_WIN' });
        } catch (e) { console.error(e); }
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
        // Clear Screen or Draw Background
        const currentLevelIdx = 0; // TODO: Track current level in state to select bg
        // For now, use sky color as fallback
        ctx.fillStyle = theme.colors.sky;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw Background Image if available
        if (theme.backgrounds?.default) {
            const img = new Image();
            img.src = theme.backgrounds.default;
            // In a real game, pre-load images. For prototype:
            if (img.complete) {
                ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
            } else {
                img.onload = () => ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
            }
        }

        ctx.save();
        ctx.translate(-game.current.camera.x, 0);

        // Draw Tiles
        for (const tile of game.current.tiles) {
            if (tile.collected) continue;

            if (tile.type === '#') ctx.fillStyle = theme.colors.ground;
            else if (tile.type === '=') ctx.fillStyle = theme.colors.platform;
            else if (tile.type === 'C') ctx.fillStyle = theme.colors.coin;
            else if (tile.type === '^') ctx.fillStyle = theme.colors.spike;
            else if (tile.type === 'G') ctx.fillStyle = theme.colors.goal;
            else if (tile.type === 'E') ctx.fillStyle = '#FF5722'; // Enemy Orange
            else if (tile.type === 'B') ctx.fillStyle = '#880E4F'; // Boss Purple
            else continue;

            if (tile.type === 'C') {
                ctx.beginPath();
                ctx.arc(tile.x + TILE_SIZE / 2, tile.y + TILE_SIZE / 2, 10, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile.type === '^') {
                ctx.beginPath();
                ctx.moveTo(tile.x, tile.y + TILE_SIZE);
                ctx.lineTo(tile.x + TILE_SIZE / 2, tile.y);
                ctx.lineTo(tile.x + TILE_SIZE, tile.y + TILE_SIZE);
                ctx.fill();
            } else if (tile.type === 'E') {
                // Draw Animated Enemy (Ink Monster)
                const enemyImg = preloadedImages['enemy_walk'];
                if (enemyImg && enemyImg.complete) {
                    const sheet = SPRITE_SHEETS.enemy.walk;
                    const frameWidth = sheet.frameWidth;
                    const frame = tile.animFrame || 0;
                    const sx = frame * frameWidth;
                    ctx.drawImage(enemyImg, sx, 0, frameWidth, enemyImg.height, tile.x - 10, tile.y - 20, 60, 60);
                } else {
                    // Fallback Draw Spiky Enemy
                    ctx.fillRect(tile.x, tile.y + 10, TILE_SIZE, TILE_SIZE - 10);
                    ctx.fillStyle = 'white';
                    ctx.fillRect(tile.x + 5, tile.y + 15, 8, 8);
                    ctx.fillRect(tile.x + 25, tile.y + 15, 8, 8);
                }
            } else if (tile.type === 'S') {
                // Draw Animated Statue Enemy
                const statueImg = preloadedImages['statue_walk'];
                if (statueImg && statueImg.complete) {
                    const sheet = SPRITE_SHEETS.statue.walk;
                    const frameWidth = sheet.frameWidth;
                    const frame = tile.animFrame || 0;
                    const sx = frame * frameWidth;
                    ctx.drawImage(statueImg, sx, 0, frameWidth, statueImg.height, tile.x - 10, tile.y - 30, 60, 70);
                } else {
                    ctx.fillStyle = '#BDBDBD';
                    ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
                }
            } else if (tile.type === 'F') {
                // Draw Animated Frame Enemy
                const frameImg = preloadedImages['frame_walk'];
                if (frameImg && frameImg.complete) {
                    const sheet = SPRITE_SHEETS.frame.walk;
                    const frameWidth = sheet.frameWidth;
                    const frame = tile.animFrame || 0;
                    const sx = frame * frameWidth;
                    ctx.drawImage(frameImg, sx, 0, frameWidth, frameImg.height, tile.x - 10, tile.y - 20, 60, 60);
                } else {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
                }
            } else if (tile.type === 'B') {
                // Draw Animated Boss
                const bossImg = preloadedImages['boss_attack'];
                if (bossImg && bossImg.complete) {
                    const sheet = SPRITE_SHEETS.boss.attack;
                    const frameWidth = sheet.frameWidth;
                    const frame = (tile.animFrame || 0) % 3;
                    const sx = frame * frameWidth;
                    ctx.drawImage(bossImg, sx, 0, frameWidth, bossImg.height, tile.x - 30, tile.y - 40, 120, 100);
                } else {
                    // Fallback Draw Big Boss
                    ctx.fillRect(tile.x, tile.y, 60, 60);
                    ctx.fillStyle = 'yellow';
                    ctx.fillRect(tile.x + 10, tile.y + 10, 15, 10);
                    ctx.fillRect(tile.x + 35, tile.y + 10, 15, 10);
                }
            } else {
                ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
            }
        }

        // Draw Player with Animation
        if (!game.current.player.isDead) {
            const p = game.current.player;
            const isJumping = !p.isGrounded;
            const isMoving = Math.abs(p.vx) > 0.5;

            // Select sprite sheet based on state
            const sheetKey = isJumping ? 'player_jump' : 'player_walk';
            const sheet = isJumping ? SPRITE_SHEETS.player.jump : SPRITE_SHEETS.player.walk;
            const img = preloadedImages[sheetKey];

            if (img && img.complete) {
                const frameWidth = sheet.frameWidth;
                const frameHeight = img.height;
                const frame = isJumping ? 0 : game.current.playerAnimFrame;
                const sx = frame * frameWidth;

                ctx.save();

                // Flip horizontally if facing left
                if (!game.current.facingRight) {
                    ctx.translate(p.x + p.width, p.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, sx, 0, frameWidth, frameHeight, 0, 0, p.width, p.height);
                } else {
                    ctx.drawImage(img, sx, 0, frameWidth, frameHeight, p.x, p.y, p.width, p.height);
                }

                ctx.restore();
            } else {
                // Fallback: Draw colored rectangle
                ctx.fillStyle = theme.colors.player;
                ctx.fillRect(p.x, p.y, p.width, p.height);
                // Eyes
                ctx.fillStyle = 'white';
                const faceDir = game.current.facingRight ? 1 : -1;
                ctx.fillRect(p.x + (faceDir === 1 ? 30 : 8), p.y + 12, 10, 10);
            }
        }

        // Draw Particles
        for (const p of game.current.particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, 6, 6);
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    };

    const gameLoop = () => {
        update();
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) draw(ctx);
        }
        game.current.animationFrame = requestAnimationFrame(gameLoop);
    };

    // --- RENDER UI ---
    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800 z-50 flex flex-col items-center justify-center p-4">

            {/* CHARACTER SELECTION SCREEN */}
            {gameState === 'SELECT_CHARACTER' && (
                <div className="flex flex-col items-center justify-center w-full max-w-3xl">
                    {/* Logo */}
                    <img src="/assets/characters/select_male.jpg" alt="Art Run Select" className="w-full max-w-md rounded-xl mb-6 shadow-2xl" />

                    <h2 className="text-3xl font-black text-white mb-6 tracking-wider">SELECT YOUR VISITOR</h2>

                    {/* Character Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {CHARACTERS.map((char) => (
                            <button
                                key={char.id}
                                onClick={() => setSelectedCharacter(char)}
                                className={`
                                    p-4 rounded-xl border-4 transition-all hover:scale-105
                                    ${selectedCharacter.id === char.id
                                        ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/30'
                                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'}
                                `}
                            >
                                <div
                                    className="w-16 h-16 rounded-full mx-auto mb-2"
                                    style={{ backgroundColor: char.color }}
                                />
                                <p className="text-white text-sm font-medium">{char.name}</p>
                            </button>
                        ))}
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={() => {
                            setCurrentLevelIdx(0);
                            initLevel(0);
                        }}
                        className="px-12 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xl font-black rounded-xl hover:scale-105 transition-all shadow-xl shadow-blue-500/30"
                    >
                        JOGAR AGORA!
                    </button>

                    <button onClick={onClose} className="mt-4 text-gray-400 hover:text-white text-sm">
                        ← Voltar aos Desafios
                    </button>
                </div>
            )}

            {/* GAME UI (only show when not selecting character) */}
            {gameState !== 'SELECT_CHARACTER' && (
                <>
                    {/* Header / Score */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white pointer-events-none">
                        <div className="flex gap-4 text-xl font-bold font-mono">
                            <span className="text-yellow-400">COINS: {coins}</span>
                            <span>SCORE: {score}</span>
                            <span className="text-gray-400 text-sm">Level {currentLevelIdx + 1}/{levels.length}</span>
                        </div>
                        <div>
                            <button onClick={onClose} className="pointer-events-auto bg-white/10 p-2 rounded hover:bg-white/20">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Game Canvas */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={450}
                            className="bg-sky-300 max-w-full h-auto"
                        />

                        {/* Overlays */}
                        {gameState === 'GAMEOVER' && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4">
                                <h2 className="text-5xl font-black mb-2 text-red-500">GAME OVER</h2>
                                <p className="mb-6 font-mono text-xl">Score: {score}</p>

                                {/* Mini Leaderboard */}
                                <div className="bg-white/10 p-4 rounded-xl mb-6 w-full max-w-sm backdrop-blur-md">
                                    <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2"><Trophy size={16} /> TOP PLAYERS</h3>
                                    <div className="space-y-2 text-sm">
                                        {leaderboard.slice(0, 3).map((p, i) => (
                                            <div key={i} className="flex justify-between border-b border-white/10 pb-1">
                                                <span>#{p.rank} {p.name}</span>
                                                <span className="text-yellow-400 font-mono">{p.xp} XP</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => initLevel()}
                                    className="flex items-center gap-2 px-8 py-3 bg-red-600 rounded-xl hover:bg-red-700 font-bold transition-transform hover:scale-105"
                                >
                                    <RefreshCw /> Tentar Novamente
                                </button>
                                <button onClick={onClose} className="mt-4 text-gray-400 hover:text-white">Sair</button>
                            </div>
                        )}

                        {gameState === 'WIN' && (
                            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-white text-center p-8">
                                <Trophy className="w-20 h-20 text-yellow-400 mb-4 animate-bounce" />
                                <h2 className="text-4xl font-black mb-2 text-yellow-500">LEVEL COMPLETED!</h2>
                                <p className="mb-6 opacity-80">Você completou a fase {currentLevelIdx + 1}/{levels.length}</p>
                                <p className="text-2xl font-mono mb-6 text-green-400">Score Atual: {score} XP</p>

                                <button
                                    onClick={() => nextLevel()}
                                    className="px-8 py-3 bg-green-600 rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-600/20 flex items-center gap-2"
                                >
                                    Próxima Fase <ChevronRight />
                                </button>
                            </div>
                        )}

                        {gameState === 'CAMPAIGN_WIN' && (
                            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white text-center p-8">
                                <div className="relative">
                                    <Star className="w-24 h-24 text-yellow-500 mb-4 animate-spin-slow" />
                                    <Trophy className="w-12 h-12 text-white absolute top-6 left-6" />
                                </div>
                                <h2 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                    CAMPAIGN CLEARED!
                                </h2>
                                <p className="mb-6 text-xl text-gray-300">Você zerou a campanha "{theme.name || 'Art Run'}"!</p>
                                <div className="bg-white/10 p-6 rounded-2xl mb-8 border border-white/20">
                                    <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">XP TOTAL</p>
                                    <p className="text-6xl font-mono font-bold text-green-400">{score + 1000}</p>
                                </div>

                                {/* Leaderboard */}
                                <div className="w-full max-w-sm mb-6">
                                    <h3 className="text-left text-sm font-bold text-yellow-500 mb-2">RANKING FINAL</h3>
                                    <div className="bg-black/50 rounded-lg p-2 max-h-40 overflow-y-auto">
                                        {leaderboard.map((p, i) => (
                                            <div key={i} className="flex justify-between border-b border-light/10 py-1 text-sm">
                                                <span>#{p.rank} {p.name}</span>
                                                <span>{p.xp}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:scale-105 transition-all font-bold shadow-xl lg:text-xl"
                                >
                                    Voltar ao Menu
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Controls Hint */}
                    <div className="mt-4 text-gray-500 text-sm font-mono hidden md:block">
                        Controls: Arrows / WASD to Move • SPACE to Jump
                    </div>

                    {/* Mobile Touch Controls */}
                    <div className="md:hidden w-full max-w-lg mt-4 flex justify-between gap-4 select-none">
                        <div className="flex gap-2">
                            <ControlBtn
                                onDown={() => { game.current.keys.left = true; }}
                                onUp={() => { game.current.keys.left = false; }}
                                icon="←"
                            />
                            <ControlBtn
                                onDown={() => { game.current.keys.right = true; }}
                                onUp={() => { game.current.keys.right = false; }}
                                icon="→"
                            />
                        </div>
                        <ControlBtn
                            onDown={() => { game.current.keys.up = true; }}
                            onUp={() => { game.current.keys.up = false; }}
                            icon="JUMP"
                            large
                        />
                    </div>
                </>
            )}
        </div>
    );
};

const ControlBtn = ({ onDown, onUp, icon, large }: any) => (
    <button
        onPointerDown={(e) => { e.preventDefault(); onDown(); }}
        onPointerUp={(e) => { e.preventDefault(); onUp(); }}
        onPointerLeave={(e) => { e.preventDefault(); onUp(); }}
        className={`
            flex items-center justify-center rounded-2xl bg-white/10 active:bg-white/30 text-white font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95
            ${large ? 'w-24 h-16 text-sm bg-blue-500/30' : 'w-16 h-16 text-2xl'}
        `}
    >
        {icon}
    </button>
);
