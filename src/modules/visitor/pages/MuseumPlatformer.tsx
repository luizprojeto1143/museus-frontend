import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Trophy, ChevronRight, Star, CheckCircle, Gamepad2 as GamePadIcon } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';

// --- GAME CONSTANTS ---
const TILE_SIZE = 40;
const GRAVITY = 0.6; // Slightly heavier
const FRICTION = 0.82;
const ACCELERATION = 0.8; // New accel
const MAX_SPEED = 7;
const JUMP_FORCE = -14;
const COYOTE_TIME = 6; // Frames (approx 100ms)
const JUMP_BUFFER = 5; // Frames
const ANIMATION_FRAME_DURATION = 100; // Faster anims

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
    // 10 Progressive Levels
    levels: [
        // Level 1: Reception (Tutorial)
        [
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
        ],
        // Level 2: Main Hall (Verticality)
        [
            "..................................................",
            "..............................................G...",
            ".............................................==...",
            "......................................CC..........",
            ".....................................====.........",
            "......................CC..........................",
            "............CC.......====.........................",
            "...........====...................................",
            "..................................===.............",
            "....C.............................................",
            "##################################################"
        ],
        // Level 3: Ancient Gallery (Introducing Enemies)
        [
            "..................................................",
            "..................................................",
            "......................................G...........",
            "..........................E..........===..........",
            ".........................====.....................",
            ".............E....................................",
            "............====..................................",
            ".......................CC......CC.................",
            "....C.................====....====................",
            "..................................................",
            "##################################################"
        ],
        // Level 4: Sculpture Garden (Precision Jumps)
        [
            "..................................................",
            "...........................................G......",
            "..........................................===.....",
            "..................................===.............",
            "..........................===.....................",
            "..................===............S................",
            "..........===...................===...............",
            "..................................................",
            "....C.............S......................^^^......",
            ".................===....................#####.....",
            "##################################################"
        ],
        // Level 5: Egyptian Wing (Traps)
        [
            "..................................................",
            "..................................................",
            ".....................................G............",
            "....................................===...........",
            "..........................^^......................",
            ".........................====.....................",
            ".............^^...................................",
            "............====...................^^.............",
            "....C.............................====............",
            ".......................^^^........................",
            "##################################################"
        ],
        // Level 6: Grand Hall (Mixed Challenge)
        [
            "..................................................",
            ".........................................G........",
            "............................E...........===.......",
            "...........................===....................",
            "..................................................",
            ".............S.......................S............",
            "............====....................====..........",
            ".......................^^.........................",
            "....C.................====........................",
            "..................................................",
            "######...#######...#######...#######...###########"
        ],
        // Level 7: Dark Attic (Floating Platforms)
        [
            "..................................................",
            "..................................................",
            "..............................................G...",
            ".............................................==...",
            ".....................................==...........",
            "...........................==.....................",
            ".................==...............................",
            ".......==.........................................",
            "....C.........................E...........E.......",
            "..............^^^............===.........===......",
            "##################################################"
        ],
        // Level 8: Restoration Lab (Mechanism Focus)
        [
            "..................................................",
            "................G.................................",
            "...............===................................",
            ".........................F................F.......",
            ".......................====.............====......",
            ".............F....................................",
            "...........====...................................",
            "..................................................",
            "....C.........................^^^.................",
            ".............................#####................",
            "##################################################"
        ],
        // Level 9: Clock Tower (High Danger)
        [
            "..................................................",
            "..................................................",
            "................................................G.",
            "...............................................==.",
            "......................................==..........",
            ".............................==...................",
            "....................==............................",
            "...........==.....................................",
            "....C.............................................",
            "...................^^^...................^^^......",
            "#####....#####....#####....#####....#####....#####"
        ],
        // Level 10: The Vault (Boss Fight)
        [
            "..................................................",
            "..................................................",
            "..................................................",
            "..................................................",
            "..................................................",
            ".........................B........................",
            "..................................................",
            "..................................................",
            "....C.........................................G...",
            "..................................................",
            "##################################################"
        ]
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

interface GameTile {
    x: number;
    y: number;
    type: string;
    collected?: boolean;
    vx?: number;
    vy?: number;
    animFrame?: number;
    originX?: number;
    originY?: number;
}

interface LeaderboardEntry {
    userId: string;
    name: string;
    xp: number;
    level: number;
    rank?: number;
}

// Helper to remove black background with edge smoothing
const createTransparentImage = (src: string): HTMLImageElement => {
    const img = new Image();
    const raw = new Image();
    raw.crossOrigin = "Anonymous";
    raw.src = src;

    raw.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = raw.width;
        canvas.height = raw.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(raw, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // "Magic Wand" tolerance
        const tolerance = 40;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Calculate brightness
            const brightness = (r + g + b) / 3;

            // If dark background
            if (r < tolerance && g < tolerance && b < tolerance) {
                data[i + 3] = 0; // Transparent
            }
            // Anti-aliasing helper: Fade out semi-dark edges
            else if (brightness < tolerance + 30) {
                data[i + 3] = Math.max(0, (brightness - tolerance) * 5); // Smooth alpha
            }
        }

        ctx.putImageData(imageData, 0, 0);
        img.src = canvas.toDataURL();
    };

    return img;
};

// Pre-load images for animation
const preloadedImages: { [key: string]: HTMLImageElement } = {};
const preloadImages = () => {
    // Assets that need transparency processing (black background removal)
    const needsTransparency = ['player_walk', 'player_jump', 'enemy_walk', 'statue_walk', 'boss_attack', 'artifact', 'bg_platform'];

    // Preload sprite sheets
    Object.entries(SPRITE_SHEETS).forEach(([entityType, animations]) => {
        Object.entries(animations).forEach(([animName, config]) => {
            const key = `${entityType}_${animName}`;
            if (needsTransparency.includes(key)) {
                preloadedImages[key] = createTransparentImage(config.src);
            } else {
                const img = new Image();
                img.src = config.src;
                preloadedImages[key] = img;
            }
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
        if (key === 'artifact') { // Use processed version
            preloadedImages[key] = createTransparentImage(src);
        } else {
            const img = new Image();
            img.src = src;
            preloadedImages[key] = img;
        }
    });
};
preloadImages();


export const MuseumPlatformer: React.FC<{ onClose: () => void; theme?: typeof DEFAULT_THEME }> = ({ onClose, theme = DEFAULT_THEME }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [currentLevelIdx, setCurrentLevelIdx] = useState(0);

    const levels = React.useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = theme as any;
        return t.levels || [t.level];
    }, [theme]);

    // Game Mutable State (Ref to avoid re-renders in loop)
    const game = useRef({
        player: { x: 50, y: 50, width: 60, height: 80, vx: 0, vy: 0, isGrounded: false, isDead: false } as Entity,
        keys: { left: false, right: false, up: false, jumpPressed: false }, // Track press state
        camera: { x: 0, y: 0, shake: 0 },
        tiles: [] as GameTile[],
        particles: [] as Particle[],
        levelWidth: 0,
        levelHeight: 0,
        animationFrame: 0,
        // Animation State
        playerAnimFrame: 0,
        lastFrameTime: 0,
        facingRight: true,
        // Physics State AAA
        coyoteTimer: 0,
        jumpBufferTimer: 0,
        squashY: 1, // Squash & Stretch
        scaleX: 1,
    });

    // Player sprite based on character selection
    const playerSpriteRef = useRef<HTMLImageElement | null>(null);

    const fetchLeaderboard = useCallback(async () => {
        if (!tenantId) return;
        try {
            const res = await api.get(`/gamification/leaderboard?tenantId=${tenantId}`);
            setLeaderboard(res.data);
        } catch (e) {
            console.error("Failed to load leaderboard", e);
        }
    }, [tenantId]);

    const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
        for (let i = 0; i < count; i++) {
            game.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color
            });
        }
    }, []);

    const saveProgress = useCallback(async () => {
        console.log("Saving XP:", score);
        try {
            await api.post('/gamification/xp', { amount: score + 500, reason: 'GAME_WIN' });
        } catch (e) { console.error(e); }
    }, [score]);

    const die = useCallback(() => {
        game.current.player.isDead = true;
        setGameState('GAMEOVER');
        game.current.camera.shake = 1.0; // TRIGGER SHAKE
        spawnParticles(game.current.player.x, game.current.player.y, theme.colors.player, 20);
    }, [theme, spawnParticles]);

    const checkCollision = useCallback((p: Entity, tiles: GameTile[], axis: 'x' | 'y') => {
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
                            // Boss Defeated!
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
                    die();
                    return;
                }

                // Solid Block Collision (# or =)
                if (axis === 'x') {
                    if (tile.type === 'E' || tile.type === 'B') continue;

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
    }, [currentLevelIdx, levels.length, theme, die, saveProgress, spawnParticles]);

    const initLevel = useCallback((levelIndex: number = 0) => {
        const tiles = [];
        const rows = levels[levelIndex];
        if (!rows) return;

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
                        vx: 0,
                        vy: 0,
                        originX: c * TILE_SIZE,
                        originY: r * TILE_SIZE
                    });
                }
            }
        }
        game.current.tiles = tiles;
        game.current.player = { x: 50, y: 50, width: 60, height: 80, vx: 0, vy: 0, isGrounded: false, isDead: false };
        game.current.camera.x = 0;

        if (levelIndex === 0) {
            setCoins(0);
            setScore(0);
        }

        setGameState('PLAYING');
    }, [levels]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') game.current.keys.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') game.current.keys.right = true;
        if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
            game.current.keys.up = true;
        }
    }, []);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') game.current.keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') game.current.keys.right = false;
        if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') game.current.keys.up = false;
    }, []);

    const update = useCallback(() => {
        if (gameState !== 'PLAYING') return;
        const { player, keys, tiles } = game.current;

        // --- 1. MOVEMENT & PHYSICS (AAA FEEL) ---
        // Acceleration
        if (keys.left) {
            player.vx -= ACCELERATION;
            game.current.facingRight = false;
        }
        if (keys.right) {
            player.vx += ACCELERATION;
            game.current.facingRight = true;
        }

        // Friction & Cap Speed
        player.vx *= FRICTION;
        if (player.vx > MAX_SPEED) player.vx = MAX_SPEED;
        if (player.vx < -MAX_SPEED) player.vx = -MAX_SPEED;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;

        // Gravity
        player.vy += GRAVITY;

        // GROUND CHECK / COYOTE TIME
        if (player.isGrounded) {
            game.current.coyoteTimer = COYOTE_TIME;
        } else {
            game.current.coyoteTimer--;
        }

        // JUMP BUFFERING
        if (keys.up) {
            // If just pressed (needs separate key tracking for 'just pressed' logic ideally, 
            // but relying on rapid polling or keydown listener setting a short-lived 'pressed' state)
            // Simplified: we assume keys.up is held.
            game.current.jumpBufferTimer = JUMP_BUFFER;
        } else {
            game.current.jumpBufferTimer--;
        }

        // EXECUTE JUMP
        if (game.current.jumpBufferTimer > 0 && game.current.coyoteTimer > 0) {
            player.vy = JUMP_FORCE;
            game.current.coyoteTimer = 0; // Consume jump
            game.current.jumpBufferTimer = 0;
            player.isGrounded = false;

            // Squash on Jump
            game.current.squashY = 1.3;
            game.current.scaleX = 0.7;

            // Spawn little cloud
            spawnParticles(player.x + player.width / 2, player.y + player.height, '#FFF', 5);
        }

        // Variable Jump Height (Release jump key to fall faster)
        if (!keys.up && player.vy < 0) {
            player.vy *= 0.5;
        }

        // Recovery from Squash
        game.current.squashY += (1 - game.current.squashY) * 0.15;
        game.current.scaleX += (1 - game.current.scaleX) * 0.15;


        // --- ANIMATION FRAME UPDATE ---
        const now = performance.now();
        if (now - game.current.lastFrameTime > ANIMATION_FRAME_DURATION) {
            game.current.lastFrameTime = now;
            // Only animate if moving significant amount
            if (Math.abs(player.vx) > 0.5) {
                game.current.playerAnimFrame = (game.current.playerAnimFrame + 1) % 4;
            } else {
                game.current.playerAnimFrame = 0;
            }
            for (const tile of tiles) {
                if (tile.type === 'E' || tile.type === 'S' || tile.type === 'F' || tile.type === 'B') {
                    // eslint-disable-next-line react-hooks/immutability
                    tile.animFrame = ((tile.animFrame || 0) + 1) % 4;
                }
            }
        }

        // --- 2. X COLLISION ---
        player.x += player.vx;
        checkCollision(player, tiles, 'x');

        // --- 3. Y COLLISION ---
        player.y += player.vy;
        const wasGrounded = player.isGrounded;
        player.isGrounded = false;
        checkCollision(player, tiles, 'y');

        // Landing Impact (Squash)
        if (!wasGrounded && player.isGrounded) {
            game.current.squashY = 0.7;
            game.current.scaleX = 1.3;
            spawnParticles(player.x + player.width / 2, player.y + player.height, '#8D6E63', 4);
        }

        // --- 4. GAME OVER/WIN CHECK ---
        if (player.y > game.current.levelHeight) {
            die();
        }

        // --- 5. CAMERA & SHAKE ---
        // Smooth Follow
        const targetCamX = player.x - 400 + (game.current.facingRight ? 100 : -100); // Look ahead
        game.current.camera.x += (targetCamX - game.current.camera.x) * 0.1;

        // Decay Shake
        if (Math.abs(game.current.camera.shake) > 0.1) {
            game.current.camera.shake *= 0.9;
        } else {
            game.current.camera.shake = 0;
        }

        // Clamp
        if (game.current.camera.x < 0) game.current.camera.x = 0;
        const maxScroll = Math.max(0, game.current.levelWidth - 800);
        if (game.current.camera.x > maxScroll) game.current.camera.x = maxScroll;

        // --- 6. PARTICLES ---
        for (let i = game.current.particles.length - 1; i >= 0; i--) {
            const p = game.current.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life -= 0.05;
            if (p.life <= 0) game.current.particles.splice(i, 1);
        }

        // --- 7. ENTITIES ---
        for (const tile of tiles) {
            if (tile.type === 'E') {
                if (!tile.vx) tile.vx = -2;
                tile.x += tile.vx;
                if (!tile.originX) tile.originX = tile.x;
                if (tile.x < tile.originX - 100) tile.vx = 2; // AI Range
                if (tile.x > tile.originX + 100) tile.vx = -2;
            }
            if (tile.type === 'B') {
                // ... (Boss Logic kept same for now)
                if (!tile.vx) tile.vx = 3;
                tile.x += tile.vx;
                if (!tile.originX) tile.originX = tile.x;
                if (tile.x < tile.originX - 200) tile.vx = 3;
                if (tile.x > tile.originX + 200) tile.vx = -3;
                if (Math.random() < 0.02) tile.y -= 10;
                if (tile.y < (tile.originY || 0)) tile.y += 1;
            }
        }
    }, [gameState, die, checkCollision]);

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        const canvasW = ctx.canvas.width;
        const canvasH = ctx.canvas.height;
        const cameraX = game.current.camera.x;

        // Backgrounds
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasH);
        gradient.addColorStop(0, theme.colors.sky);
        gradient.addColorStop(0.5, '#302b63');
        gradient.addColorStop(1, '#24243e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasW, canvasH);

        const bgFar = preloadedImages['bg_far'];
        if (bgFar && bgFar.complete) {
            const parallaxFar = cameraX * 0.1;
            const bgWidth = canvasW * 1.5;
            const bgX = -(parallaxFar % bgWidth);
            ctx.drawImage(bgFar, bgX, 0, bgWidth, canvasH);
            ctx.drawImage(bgFar, bgX + bgWidth, 0, bgWidth, canvasH);
        }

        const bgMid = preloadedImages['bg_mid'];
        if (bgMid && bgMid.complete) {
            const parallaxMid = cameraX * 0.3;
            const midY = canvasH * 0.4;
            const midH = canvasH * 0.6;
            const midW = canvasW * 2;
            const midX = -(parallaxMid % midW);
            ctx.globalAlpha = 0.9;
            ctx.drawImage(bgMid, midX, midY, midW, midH);
            ctx.drawImage(bgMid, midX + midW, midY, midW, midH);
            ctx.globalAlpha = 1;
        }

        // Vignette
        const vignetteGradient = ctx.createRadialGradient(
            canvasW / 2, canvasH / 2, canvasH * 0.3,
            canvasW / 2, canvasH / 2, canvasH
        );
        vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
        vignetteGradient.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Camera Shake
        const shakeX = (Math.random() - 0.5) * game.current.camera.shake * 20;
        const shakeY = (Math.random() - 0.5) * game.current.camera.shake * 20;

        ctx.save();
        ctx.translate(-cameraX + shakeX, shakeY);

        const platformImg = preloadedImages['platform'];
        const artifactImg = preloadedImages['artifact'];

        for (const tile of game.current.tiles) {
            if (tile.collected) continue;

            if (tile.type === '#' || tile.type === '=') {
                if (platformImg && platformImg.complete) {
                    ctx.drawImage(platformImg, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
                } else {
                    ctx.fillStyle = theme.colors.platform;
                    ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
                    ctx.strokeStyle = '#D4AF37';
                    ctx.strokeRect(tile.x + 1, tile.y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                }
                continue;
            }

            if (tile.type === 'C') {
                if (artifactImg && artifactImg.complete) {
                    ctx.shadowColor = theme.colors.coin;
                    ctx.shadowBlur = 15;
                    ctx.drawImage(artifactImg, tile.x - 5, tile.y - 5, TILE_SIZE + 10, TILE_SIZE + 10);
                    ctx.shadowBlur = 0;
                } else {
                    ctx.fillStyle = theme.colors.coin;
                    ctx.beginPath();
                    ctx.arc(tile.x + TILE_SIZE / 2, tile.y + TILE_SIZE / 2, 15, 0, Math.PI * 2);
                    ctx.fill();
                }
                continue;
            }

            if (tile.type === '^') {
                ctx.fillStyle = theme.colors.spike;
                ctx.beginPath();
                ctx.moveTo(tile.x, tile.y + TILE_SIZE);
                ctx.lineTo(tile.x + TILE_SIZE / 2, tile.y);
                ctx.lineTo(tile.x + TILE_SIZE, tile.y + TILE_SIZE);
                ctx.fill();
                continue;
            }

            if (tile.type === 'G') {
                ctx.fillStyle = theme.colors.goal;
                ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
                continue;
            }

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

            if (tile.type === 'B') {
                const bossImg = preloadedImages['boss_attack'];
                if (bossImg && bossImg.complete) {
                    const sheet = SPRITE_SHEETS.boss.attack;
                    const frameWidth = sheet.frameWidth;
                    const frame = (tile.animFrame || 0) % 3;
                    const sx = frame * frameWidth;
                    ctx.drawImage(bossImg, sx, 0, frameWidth, bossImg.height, tile.x - 30, tile.y - 40, 120, 100);
                } else {
                    ctx.fillStyle = '#880E4F';
                    ctx.fillRect(tile.x, tile.y, 60, 60);
                }
                continue;
            }
        }

        // Draw Player with Squash & Glow
        if (!game.current.player.isDead) {
            const p = game.current.player;
            const isMoving = Math.abs(p.vx) > 0.5;
            const playerImg = playerSpriteRef.current;

            // Squash Pivot (Bottom Center)
            const squashX = p.x + p.width / 2;
            const squashY = p.y + p.height;

            ctx.save();
            ctx.translate(squashX, squashY);
            ctx.scale(game.current.scaleX, game.current.squashY);
            ctx.translate(-squashX, -squashY);

            // Glow Effect
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 10;

            if (playerImg && playerImg.complete) {
                const totalFrames = 4;
                const frameWidth = playerImg.width / totalFrames;
                const frameHeight = playerImg.height;
                const frame = isMoving ? game.current.playerAnimFrame % totalFrames : 0;
                const sx = frame * frameWidth;

                ctx.save();
                if (!game.current.facingRight) {
                    ctx.translate(p.x + p.width, p.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(playerImg, sx, 0, frameWidth, frameHeight, 0, -20, 80, 100);
                } else {
                    ctx.drawImage(playerImg, sx, 0, frameWidth, frameHeight, p.x - 10, p.y - 20, 80, 100);
                }
                ctx.restore();
            } else {
                ctx.fillStyle = selectedCharacter.color;
                ctx.fillRect(p.x, p.y, p.width, p.height);
            }
            ctx.shadowBlur = 0;
            ctx.restore(); // Restore squash
        }

        // Particles
        for (const p of game.current.particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, 6, 6);
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }, [theme, selectedCharacter]);

    const animateRef = useRef<() => void>(() => { });

    const animate = useCallback(() => {
        update();
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) draw(ctx);
        }
        game.current.animationFrame = requestAnimationFrame(animateRef.current);
    }, [update, draw]);

    useEffect(() => {
        animateRef.current = animate;
    }, [animate]);

    const nextLevel = useCallback(() => {
        if (currentLevelIdx < levels.length - 1) {
            setCurrentLevelIdx(prev => prev + 1);
        } else {
            setGameState('CAMPAIGN_WIN');
            saveProgress();
        }
    }, [currentLevelIdx, levels.length, saveProgress]);

    // Effects
    useEffect(() => {
        // Apply transparency processing to the selected character sprite
        const processedImg = createTransparentImage(selectedCharacter.sprite);
        playerSpriteRef.current = processedImg;
    }, [selectedCharacter]);

    useEffect(() => {
        if (gameState === 'GAMEOVER' || gameState === 'CAMPAIGN_WIN') {
            fetchLeaderboard();
        }
    }, [gameState, fetchLeaderboard]);

    useEffect(() => {
        if (gameState === 'PLAYING') {
            initLevel(currentLevelIdx);
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

            game.current.animationFrame = requestAnimationFrame(animate);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
                // eslint-disable-next-line react-hooks/exhaustive-deps
                cancelAnimationFrame(game.current.animationFrame);
            };
        }
    }, [currentLevelIdx, initLevel, handleKeyDown, handleKeyUp, animate, gameState]);

    // --- RENDER UI ---
    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-950 to-gray-900 z-50 flex flex-col items-center justify-center p-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
                
                .font-Orbitron { font-family: 'Orbitron', sans-serif; }
                
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
                
                @keyframes shine {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
                .animate-shine {
                    background-size: 200% auto;
                    animation: shine 3s linear infinite;
                }
                
                .glitch-effect {
                    text-shadow: 2px 0 #ff0000, -2px 0 #00ffff;
                }
            `}</style>

            {/* CHARACTER SELECTION SCREEN (PREMIUM REDESIGN) */}
            {gameState === 'SELECT_CHARACTER' && (
                <div className="relative z-10 flex flex-col items-center justify-center w-full h-full max-w-5xl">
                    {/* Background Ambience */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="z-10 text-center mb-8 animate-fade-in-down">
                        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] tracking-tighter mb-2 font-Orbitron">
                            ART RUN
                        </h2>
                        <p className="text-blue-200 text-lg uppercase tracking-[0.3em] font-light">Museum Guardian Edition</p>
                    </div>

                    {/* Character Cards Carousel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full px-4">
                        {CHARACTERS.slice(0, 3).map((char) => ( // Showing top 3 for layout symmetry, or mapped properly
                            <div
                                key={char.id}
                                onClick={() => setSelectedCharacter(char)}
                                className={`
                                    group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
                                    hover:transform hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]
                                    ${selectedCharacter.id === char.id
                                        ? 'ring-4 ring-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.4)] scale-105 bg-gradient-to-b from-gray-800/90 to-black/90'
                                        : 'bg-gray-900/60 border border-white/10 hover:border-white/30'}
                                `}
                            >
                                {/* Card Content */}
                                <div className="p-6 flex flex-col items-center">
                                    <div className={`
                                        w-24 h-24 rounded-full mb-4 flex items-center justify-center relative
                                        ${selectedCharacter.id === char.id ? 'bg-yellow-400/20' : 'bg-white/5'}
                                    `}>
                                        <div className="absolute inset-0 rounded-full border border-white/10"></div>
                                        <img src={char.sprite} alt={char.name} className="w-16 h-16 object-contain drop-shadow-lg group-hover:scale-110 transition-transform" />
                                    </div>

                                    <h3 className={`text-xl font-bold mb-1 ${selectedCharacter.id === char.id ? 'text-yellow-400' : 'text-white'}`}>
                                        {char.name}
                                    </h3>
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(3)].map((_, i) => (
                                            <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />
                                        ))}
                                    </div>

                                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-3/4"></div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">Speed Class A</p>
                                </div>

                                {/* Selection Overlay */}
                                {selectedCharacter.id === char.id && (
                                    <div className="absolute top-2 right-2">
                                        <CheckCircle className="text-yellow-400 w-6 h-6" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col gap-4 items-center w-full max-w-md z-20">
                        <button
                            onClick={() => {
                                setCurrentLevelIdx(0);
                                initLevel(0);
                            }}
                            className="w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-xl font-black rounded-lg 
                            hover:from-yellow-400 hover:to-amber-500 transition-all transform hover:scale-[1.02] hover:-translate-y-1 shadow-[0_0_20px_rgba(234,179,8,0.4)]
                            flex items-center justify-center gap-3 uppercase tracking-wider"
                        >
                            <GamePadIcon /> START MISSION
                        </button>

                        <button onClick={onClose} className="text-gray-400 hover:text-white text-sm uppercase tracking-widest hover:underline transition-all">
                            Exit to Exhibition
                        </button>
                    </div>
                </div>
            )}

            {/* GAME UI (only show when not selecting character) */}
            {gameState !== 'SELECT_CHARACTER' && (
                <>
                    {/* PREMIUM HUD */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 flex justify-between items-start pointer-events-none z-20">
                        {/* Score Card */}
                        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-2 flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                            <span className="text-xs text-blue-200 uppercase tracking-widest font-bold">Score</span>
                            <span className="text-2xl font-black text-white font-mono drop-shadow-md">{score.toLocaleString()}</span>
                        </div>

                        {/* Level Progress */}
                        <div className="flex-1 mx-8 pt-2">
                            <div className="flex justify-between text-xs text-white uppercase font-bold mb-1 opacity-80 tracking-wider">
                                <span>Coins: {coins}</span>
                                <span>Level {currentLevelIdx + 1} / {levels.length}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                {/* Fake progress for visual - could be linked to x pos if we knew level length in pixels */}
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]"
                                    style={{ width: `${((currentLevelIdx + 1) / levels.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Controls / Exit */}
                        <button onClick={onClose} className="pointer-events-auto bg-red-500/10 hover:bg-red-500/30 text-red-200 border border-red-500/20 p-2 rounded-xl backdrop-blur-md transition-all">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Game Canvas */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={450}
                            className="bg-sky-300 max-w-full h-auto"
                        />

                        {/* Overlays - PREMIUM REDESIGN */}
                        {gameState === 'GAMEOVER' && (
                            <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center text-white p-4 backdrop-blur-sm z-30 animate-fade-in">
                                <div className="absolute inset-0 bg-[url('/assets/pattern_grid.png')] opacity-10"></div>

                                <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] mb-2 font-Orbitron glitch-effect">
                                    SECURITY BREACH
                                </h2>
                                <p className="mb-8 font-mono text-xl text-red-200 tracking-[0.5em] uppercase">Session Terminated</p>

                                {/* Stats Panel */}
                                <div className="bg-black/60 border border-red-500/30 p-8 rounded-2xl mb-8 w-full max-w-md backdrop-blur-xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scanline"></div>

                                    <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 uppercase tracking-widest">Final Score</span>
                                            <span className="text-4xl font-mono font-bold text-white">{score.toLocaleString()}</span>
                                        </div>
                                        <Trophy className="text-red-500 w-8 h-8 opacity-50" />
                                    </div>

                                    {/* Mini Leaderboard */}
                                    <h3 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Star size={12} /> Elite Agents
                                    </h3>
                                    <div className="space-y-3">
                                        {leaderboard.slice(0, 3).map((p, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm group">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-black' :
                                                        i === 1 ? 'bg-gray-400 text-black' :
                                                            'bg-orange-700 text-white'
                                                        }`}>{i + 1}</span>
                                                    <span className="text-gray-300 group-hover:text-white transition-colors">{p.name}</span>
                                                </div>
                                                <span className="font-mono text-red-200">{p.xp.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => initLevel(currentLevelIdx)}
                                        className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)] uppercase tracking-wider"
                                    >
                                        <RefreshCw size={20} /> Retry Mission
                                    </button>
                                    <button onClick={onClose} className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/10 text-gray-300 rounded-xl font-bold uppercase tracking-wider transition-all">
                                        Abort
                                    </button>
                                </div>
                            </div>
                        )}

                        {gameState === 'WIN' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 to-black/95 flex flex-col items-center justify-center text-center p-8 backdrop-blur-md z-30">
                                <div className="bg-gradient-to-b from-yellow-400/20 to-transparent p-10 rounded-full mb-6 animate-pulse">
                                    <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                                </div>
                                <h2 className="text-5xl font-black mb-2 text-white font-Orbitron">MISSION COMPLETE</h2>
                                <p className="mb-8 text-blue-200 text-lg tracking-widest uppercase">Sector {currentLevelIdx + 1} Secured</p>

                                <div className="flex gap-8 mb-10">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 uppercase mb-1">Score</p>
                                        <p className="text-3xl font-mono font-bold text-yellow-400">{score}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 uppercase mb-1">Coins</p>
                                        <p className="text-3xl font-mono font-bold text-yellow-400">{coins}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => nextLevel()}
                                    className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:scale-105 font-bold shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center gap-3 text-black uppercase tracking-wider transition-all"
                                >
                                    Next Sector <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {gameState === 'CAMPAIGN_WIN' && (
                            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-white text-center p-8 z-30">
                                {/* Confetti Effect (CSS only for now) */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="absolute w-2 h-2 bg-yellow-500 rounded-full animate-ping" style={{
                                            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                                            animationDuration: `${1 + Math.random()}s`
                                        }}></div>
                                    ))}
                                </div>

                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                                    <Star className="w-32 h-32 text-yellow-400 relative z-10 animate-spin-slow drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]" />
                                    <Trophy className="w-16 h-16 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" />
                                </div>

                                <h2 className="text-6xl md:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 animate-shine font-Orbitron">
                                    LEGENDARY
                                </h2>
                                <p className="mb-8 text-xl text-gray-300 max-w-lg">You have recovered all artifacts and secured the museum. Your name will be etched in history.</p>

                                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl mb-10 w-full max-w-md backdrop-blur-md">
                                    <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-2">Total Experience</p>
                                    <p className="text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-emerald-600 drop-shadow-sm">
                                        {(score + 1000).toLocaleString()}
                                    </p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="px-12 py-5 bg-white text-black rounded-full hover:scale-105 transition-all font-black shadow-[0_0_40px_rgba(255,255,255,0.3)] text-xl uppercase tracking-widest"
                                >
                                    Claim Victory
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

interface ControlBtnProps {
    onDown: () => void;
    onUp: () => void;
    icon: React.ReactNode;
    large?: boolean;
}

const ControlBtn: React.FC<ControlBtnProps> = ({ onDown, onUp, icon, large }) => (
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
