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

// --- CONFIGURATION (Default Theme - "Museum Guardian" AAA) ---
const DEFAULT_THEME = {
    name: 'Guardião do Museu',
    colors: {
        sky: '#1a1a2e',        // Deep Museum Night
        ground: '#2D1B0E',     // Rich Dark Wood
        platform: '#4A3728',   // Mahogany
        player: '#00ACC1',     // Teal (matches visitor jacket)
        coin: '#FFD700',       // Gold
        goal: '#66BB6A',       // Green Exit
        spike: '#8B0000'       // Dark Red Danger
    },
    // AAA Parallax Backgrounds
    backgrounds: {
        far: '/assets/game/bg_far.png',
        mid: '/assets/game/bg_mid.png',
        platform: '/assets/game/platform.png',
        artifact: '/assets/game/artifact.png'
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
    // Preload sprite sheets
    Object.entries(SPRITE_SHEETS).forEach(([entityType, animations]) => {
        Object.entries(animations).forEach(([animName, config]) => {
            const key = `${entityType}_${animName}`;
            const img = new Image();
            img.src = config.src;
            preloadedImages[key] = img;
        });
    });

    // Preload AAA backgrounds
    const bgImages = [
        { key: 'bg_far', src: '/assets/game/bg_far.png' },
        { key: 'bg_mid', src: '/assets/game/bg_mid.png' },
        { key: 'platform', src: '/assets/game/platform.png' },
        { key: 'artifact', src: '/assets/game/artifact.png' }
    ];
    bgImages.forEach(({ key, src }) => {
        const img = new Image();
        img.src = src;
        preloadedImages[key] = img;
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
        tiles: [] as { x: number, y: number, type: string, collected?: boolean, animFrame?: number, vx?: number, vy?: number, originX?: number, originY?: number }[],
        particles: [] as Particle[],
        levelWidth: 0,
        levelHeight: 0,
        animationFrame: 0,
        // Animation State
        playerAnimFrame: 0,
        lastFrameTime: 0,
        facingRight: true,
    });

    // Player sprite based on character selection
    const playerSpriteRef = useRef<HTMLImageElement | null>(null);

    // Load selected character sprite
    useEffect(() => {
        const img = new Image();
        img.src = selectedCharacter.sprite;
        img.onload = () => {
            playerSpriteRef.current = img;
        };
    }, [selectedCharacter]);

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
        const canvasW = ctx.canvas.width;
        const canvasH = ctx.canvas.height;
        const cameraX = game.current.camera.x;

        // ==================== AAA PARALLAX SYSTEM ====================
        // Layer 0: Dark gradient sky
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasH);
        gradient.addColorStop(0, '#0f0c29');
        gradient.addColorStop(0.5, '#302b63');
        gradient.addColorStop(1, '#24243e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Layer 1: Far background (slowest parallax - 10%)
        const bgFar = preloadedImages['bg_far'];
        if (bgFar && bgFar.complete) {
            const parallaxFar = cameraX * 0.1;
            // Tile the background for seamless scrolling
            const bgWidth = canvasW * 1.5;
            const bgX = -(parallaxFar % bgWidth);
            ctx.drawImage(bgFar, bgX, 0, bgWidth, canvasH);
            ctx.drawImage(bgFar, bgX + bgWidth, 0, bgWidth, canvasH);
        }

        // Layer 2: Mid background (medium parallax - 30%)
        const bgMid = preloadedImages['bg_mid'];
        if (bgMid && bgMid.complete) {
            const parallaxMid = cameraX * 0.3;
            const midY = canvasH * 0.4; // Position in lower half
            const midH = canvasH * 0.6;
            const midW = canvasW * 2;
            const midX = -(parallaxMid % midW);
            ctx.globalAlpha = 0.9;
            ctx.drawImage(bgMid, midX, midY, midW, midH);
            ctx.drawImage(bgMid, midX + midW, midY, midW, midH);
            ctx.globalAlpha = 1;
        }

        // ==================== AMBIENT LIGHTING ====================
        // Add subtle vignette effect
        const vignetteGradient = ctx.createRadialGradient(
            canvasW / 2, canvasH / 2, canvasH * 0.3,
            canvasW / 2, canvasH / 2, canvasH
        );
        vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
        vignetteGradient.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, canvasW, canvasH);

        // ==================== GAME WORLD (Camera Transform) ====================
        ctx.save();
        ctx.translate(-cameraX, 0);

        // ==================== DRAW TILES WITH AAA TEXTURES ====================
        const platformImg = preloadedImages['platform'];
        const artifactImg = preloadedImages['artifact'];

        for (const tile of game.current.tiles) {
            if (tile.collected) continue;

            // Ground tiles (#) - Use platform texture
            if (tile.type === '#' || tile.type === '=') {
                if (platformImg && platformImg.complete) {
                    ctx.drawImage(platformImg, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
                } else {
                    // Fallback: Rich gradient
                    const tileGrad = ctx.createLinearGradient(tile.x, tile.y, tile.x, tile.y + TILE_SIZE);
                    tileGrad.addColorStop(0, '#5D4037');
                    tileGrad.addColorStop(0.5, '#4E342E');
                    tileGrad.addColorStop(1, '#3E2723');
                    ctx.fillStyle = tileGrad;
                    ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
                    // Gold trim
                    ctx.strokeStyle = '#D4AF37';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(tile.x + 1, tile.y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                }
                continue;
            }

            // Coins (C) - Use artifact texture with glow
            if (tile.type === 'C') {
                if (artifactImg && artifactImg.complete) {
                    // Glow effect
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 15;
                    ctx.drawImage(artifactImg, tile.x - 5, tile.y - 5, TILE_SIZE + 10, TILE_SIZE + 10);
                    ctx.shadowBlur = 0;
                } else {
                    // Fallback: Golden coin with shine
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 10;
                    const coinGrad = ctx.createRadialGradient(
                        tile.x + TILE_SIZE / 2, tile.y + TILE_SIZE / 2, 0,
                        tile.x + TILE_SIZE / 2, tile.y + TILE_SIZE / 2, 15
                    );
                    coinGrad.addColorStop(0, '#FFF8E1');
                    coinGrad.addColorStop(0.5, '#FFD700');
                    coinGrad.addColorStop(1, '#FF8F00');
                    ctx.fillStyle = coinGrad;
                    ctx.beginPath();
                    ctx.arc(tile.x + TILE_SIZE / 2, tile.y + TILE_SIZE / 2, 15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
                continue;
            }

            // Spikes (^) - Danger red with glow
            if (tile.type === '^') {
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 8;
                const spikeGrad = ctx.createLinearGradient(tile.x, tile.y + TILE_SIZE, tile.x, tile.y);
                spikeGrad.addColorStop(0, '#4A0000');
                spikeGrad.addColorStop(1, '#8B0000');
                ctx.fillStyle = spikeGrad;
                ctx.beginPath();
                ctx.moveTo(tile.x, tile.y + TILE_SIZE);
                ctx.lineTo(tile.x + TILE_SIZE / 2, tile.y);
                ctx.lineTo(tile.x + TILE_SIZE, tile.y + TILE_SIZE);
                ctx.fill();
                ctx.shadowBlur = 0;
                continue;
            }

            // Goal (G) - Green portal with glow
            if (tile.type === 'G') {
                ctx.shadowColor = '#00FF00';
                ctx.shadowBlur = 20;
                const goalGrad = ctx.createRadialGradient(
                    tile.x + TILE_SIZE / 2, tile.y + TILE_SIZE / 2, 0,
                    tile.x + TILE_SIZE / 2, tile.y + TILE_SIZE / 2, TILE_SIZE
                );
                goalGrad.addColorStop(0, '#A5D6A7');
                goalGrad.addColorStop(0.5, '#66BB6A');
                goalGrad.addColorStop(1, '#2E7D32');
                ctx.fillStyle = goalGrad;
                ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
                ctx.shadowBlur = 0;
                continue;
            }

            // Enemies (E) - Animated ink monster
            if (tile.type === 'E') {
                const enemyImg = preloadedImages['enemy_walk'];
                if (enemyImg && enemyImg.complete) {
                    const sheet = SPRITE_SHEETS.enemy.walk;
                    const frameWidth = sheet.frameWidth;
                    const frame = tile.animFrame || 0;
                    const sx = frame * frameWidth;
                    ctx.drawImage(enemyImg, sx, 0, frameWidth, enemyImg.height, tile.x - 10, tile.y - 20, 60, 60);
                } else {
                    ctx.fillStyle = '#FF5722';
                    ctx.fillRect(tile.x, tile.y + 10, TILE_SIZE, TILE_SIZE - 10);
                }
                continue;
            }

            // Boss (B) - Animated boss
            if (tile.type === 'B') {
                const bossImg = preloadedImages['boss_attack'];
                if (bossImg && bossImg.complete) {
                    const sheet = SPRITE_SHEETS.boss.attack;
                    const frameWidth = sheet.frameWidth;
                    const frame = (tile.animFrame || 0) % 3;
                    const sx = frame * frameWidth;
                    ctx.shadowColor = '#880E4F';
                    ctx.shadowBlur = 15;
                    ctx.drawImage(bossImg, sx, 0, frameWidth, bossImg.height, tile.x - 30, tile.y - 40, 120, 100);
                    ctx.shadowBlur = 0;
                } else {
                    ctx.fillStyle = '#880E4F';
                    ctx.fillRect(tile.x, tile.y, 60, 60);
                }
                continue;
            }
        }

        // Draw Player with Selected Character Sprite
        if (!game.current.player.isDead) {
            const p = game.current.player;
            const isMoving = Math.abs(p.vx) > 0.5;

            // Use selected character sprite
            const playerImg = playerSpriteRef.current;

            if (playerImg && playerImg.complete) {
                // Calculate frame (4 frames in sprite sheet)
                const totalFrames = 4;
                const frameWidth = playerImg.width / totalFrames;
                const frameHeight = playerImg.height;
                const frame = isMoving ? game.current.playerAnimFrame % totalFrames : 0;
                const sx = frame * frameWidth;

                ctx.save();

                // Flip horizontally if facing left
                if (!game.current.facingRight) {
                    ctx.translate(p.x + p.width, p.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(playerImg, sx, 0, frameWidth, frameHeight, 0, -20, 80, 100);
                } else {
                    ctx.drawImage(playerImg, sx, 0, frameWidth, frameHeight, p.x - 10, p.y - 20, 80, 100);
                }

                ctx.restore();
            } else {
                // Fallback: Draw colored rectangle with character color
                ctx.fillStyle = selectedCharacter.color;
                ctx.fillRect(p.x, p.y, p.width, p.height);
                // Face
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(p.x + p.width / 2, p.y + 20, 15, 0, Math.PI * 2);
                ctx.fill();
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
