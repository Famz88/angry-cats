
        class SoundFX {
            constructor() {
                this.ctx = null;
                this.muted = false;
                this.bgmPlaying = false;
                this.bgmTimer = null;
                this.bgmStep = 0;
            }

            init() {
                if (!this.ctx) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioCtx();
                }
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
                if (!this.bgmPlaying && !this.muted) {
                    this.startBGM();
                }
            }

            startBGM() {
                if (this.bgmPlaying || !this.ctx || this.muted) return;
                this.bgmPlaying = true;
                this.bgmStep = 0;
                this.scheduleNextBGMBeat();
            }

            stopBGM() {
                this.bgmPlaying = false;
                if (this.bgmTimer) {
                    clearTimeout(this.bgmTimer);
                    this.bgmTimer = null;
                }
            }

            scheduleNextBGMBeat() {
                if (!this.bgmPlaying || this.muted || !this.ctx) return;

                const melodySequence = [
                    { note: 523.25, dur: 0.14 },
                    { note: 0, dur: 0.08 },
                    { note: 587.33, dur: 0.12 },
                    { note: 659.25, dur: 0.20 },
                    { note: 783.99, dur: 0.16 },
                    { note: 659.25, dur: 0.16 },
                    { note: 587.33, dur: 0.22 },
                    { note: 523.25, dur: 0.24 },
                    { note: 440.00, dur: 0.14 },
                    { note: 493.88, dur: 0.12 },
                    { note: 523.25, dur: 0.18 },
                    { note: 659.25, dur: 0.22 },
                    { note: 587.33, dur: 0.32 },
                    { note: 0, dur: 0.16 },
                    { note: 659.25, dur: 0.14 },
                    { note: 698.46, dur: 0.12 },
                    { note: 783.99, dur: 0.22 },
                    { note: 880.00, dur: 0.18 },
                    { note: 783.99, dur: 0.14 },
                    { note: 659.25, dur: 0.16 },
                    { note: 523.25, dur: 0.28 },
                    { note: 587.33, dur: 0.15 },
                    { note: 659.25, dur: 0.15 },
                    { note: 587.33, dur: 0.20 },
                    { note: 493.88, dur: 0.22 },
                    { note: 523.25, dur: 0.38 }
                ];

                const bassNotes = [130.81, 196.00, 146.83, 196.00, 110.00, 164.81, 146.83, 196.00];
                const item = melodySequence[this.bgmStep % melodySequence.length];
                const now = this.ctx.currentTime;

                if (this.bgmStep % 2 === 0) {
                    const bassFreq = bassNotes[(Math.floor(this.bgmStep / 2)) % bassNotes.length];
                    const bassOsc = this.ctx.createOscillator();
                    const bassGain = this.ctx.createGain();
                    bassOsc.type = 'triangle';
                    bassOsc.frequency.setValueAtTime(bassFreq, now);
                    bassGain.gain.setValueAtTime(0.12, now);
                    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
                    bassOsc.connect(bassGain);
                    bassGain.connect(this.ctx.destination);
                    bassOsc.start(now);
                    bassOsc.stop(now + 0.26);

                    const woodOsc = this.ctx.createOscillator();
                    const woodGain = this.ctx.createGain();
                    woodOsc.type = 'sine';
                    woodOsc.frequency.setValueAtTime(900 + (this.bgmStep % 4) * 150, now);
                    woodGain.gain.setValueAtTime(0.04, now);
                    woodGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
                    woodOsc.connect(woodGain);
                    woodGain.connect(this.ctx.destination);
                    woodOsc.start(now);
                    woodOsc.stop(now + 0.05);
                }

                if (item.note > 0) {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = (this.bgmStep % 3 === 0) ? 'triangle' : 'sine';
                    osc.frequency.setValueAtTime(item.note, now);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + item.dur);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + item.dur);
                }

                const delayMs = Math.max(130, Math.floor(item.dur * 1000));
                this.bgmStep++;

                this.bgmTimer = setTimeout(() => {
                    this.scheduleNextBGMBeat();
                }, delayMs);
            }

            playSwoosh() {
                if (this.muted || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(450, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.22);
                gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.22);
            }

            playMeow(type = 'normal') {
                if (this.muted || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                const now = this.ctx.currentTime;
                let start = 550, mid = 850, end = 400;
                if (type === 'heavy') { start = 280; mid = 420; end = 190; }
                if (type === 'fast') { start = 750; mid = 1100; end = 550; }

                osc.frequency.setValueAtTime(start, now);
                osc.frequency.linearRampToValueAtTime(mid, now + 0.12);
                osc.frequency.linearRampToValueAtTime(end, now + 0.3);

                gain.gain.setValueAtTime(0.01, now);
                gain.gain.linearRampToValueAtTime(0.35, now + 0.08);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.3);
            }

            playImpact(material = 'wood') {
                if (this.muted || !this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                if (material === 'glass') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1100, now);
                    osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
                    gain.gain.setValueAtTime(0.25, now);
                } else if (material === 'stone') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(120, now);
                    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
                    gain.gain.setValueAtTime(0.4, now);
                } else {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(260, now);
                    osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);
                    gain.gain.setValueAtTime(0.35, now);
                }

                gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.18);
            }

            playExplosion() {
                if (this.muted || !this.ctx) return;
                const now = this.ctx.currentTime;
                const bufferSize = this.ctx.sampleRate * 0.45;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, now);
                filter.frequency.linearRampToValueAtTime(40, now + 0.45);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.8, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                noise.start(now);
            }

            playSqueak() {
                if (this.muted || !this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2200, now);
                osc.frequency.linearRampToValueAtTime(2900, now + 0.08);
                osc.frequency.linearRampToValueAtTime(1700, now + 0.16);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.16);
            }

            playVictory() {
                if (this.muted || !this.ctx) return;
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const now = this.ctx.currentTime + idx * 0.12;
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.25);
                });
            }
        }

        const audio = new SoundFX();
        const { Engine, Bodies, Composite, Events, Vector, Body, Runner } = Matter;

        let canvas, ctx;
        let engine, world;
        let paused = false;
        const gameTimers = new Map();
        let nextTimer = 0, lastFrame = performance.now();
        function gameDelay(fn, ms) { const id = ++nextTimer; gameTimers.set(id, {fn, ms}); return id; }
        function cancelGameDelay(id) { gameTimers.delete(id); }
        function clearTurns() { gameTimers.clear(); activePointers.clear(); isAiming = false; isPanning = false; }
        function setPaused(value) {
            paused = value;
            if (engine) engine.timing.timeScale = value ? 0 : 1;
            if (value) { audio.stopBGM(); if(audio.ctx) audio.ctx.suspend(); }
            else if (audio.ctx && !audio.muted) { audio.ctx.resume(); audio.startBGM(); }
        }
        function pauseGame() {
            if (!gameActive || levelFinished || paused) return;
            isAiming = false; activePointers.clear(); pullPos = {...slingshotPos};
            setPaused(true); showCard('card-pause');
        }
        function showCard(id) {
            for (const card of ['card-hero-play','card-levels','card-result','card-pause']) document.getElementById(card).classList.toggle('hidden',card !== id);
            document.getElementById('modal-overlay').classList.remove('hidden');
        }
        window.AngryCatsLifecycle = { pause() { pauseGame(); audio.stopBGM(); if(audio.ctx) audio.ctx.suspend(); }, back() { if(gameActive && !paused && !levelFinished) pauseGame(); else if(!document.getElementById('card-pause').classList.contains('hidden')) document.getElementById('btn-resume').click(); else { clearTurns(); gameActive=false; setPaused(true); showCard('card-hero-play'); } } };
        document.addEventListener('visibilitychange', () => { if(document.hidden) { pauseGame(); audio.stopBGM(); if(audio.ctx) audio.ctx.suspend(); } });

        const VIRTUAL_WIDTH = 700;
        const VIRTUAL_HEIGHT = 560;
        const VIRTUAL_GROUND_Y = 460;

        let baseScale = 1.0;
        let cameraScale = 1.0;
        let cameraOffsetX = 0;
        let cameraOffsetY = 0;
        let userZoomMultiplier = 1.0;
        let defaultCameraOffsetX = 0;
        let defaultCameraOffsetY = 0;

        const slingshotPos = { x: 110, y: VIRTUAL_GROUND_Y - 70 };
        const FORT_BASE_X = 530;

        let activeCatData = null;
        let isAiming = false;
        let isPanning = false;
        let panStartScreen = { x: 0, y: 0 };
        let panStartCameraOffset = { x: 0, y: 0 };
        let activePointers = new Map();
        let initialPinchDistance = 0;
        let initialPinchZoom = 1.0;
        let cameraFollowCat = false;

        let pullPos = { x: slingshotPos.x, y: slingshotPos.y - 10 };
        let launchedCatBody = null;
        let catAbilityUsed = false;
        let turnTimer = null;

        let currentLevelIndex = 0;
        let score = 0;
        let activeCatsQueue = [];
        let targetsRemaining = 0;
        let gameActive = false;
        let levelFinished = false;
        let shotsFired = 0;
        let levelStartTime = 0;

        let particles = [];
        let scorePopups = [];

        let playerProgress = {
            unlocked: 1,
            stars: {}, best: {}
        };

        function loadProgress() {
            try {
                const saved = JSON.parse(localStorage.getItem('angry_cats_progress') || '{}');
                playerProgress = {unlocked: Math.min(100, Math.max(1, Number(saved.unlocked) || 1)), stars: {}, best: {}};
                for(let n=1;n<=100;n++) {
                    playerProgress.stars[n] = Math.min(3, Math.max(0, Number(saved.stars?.[n]) || 0));
                    playerProgress.best[n] = Math.max(0, Number(saved.best?.[n]) || 0);
                }
                audio.muted = localStorage.getItem('angry_cats_muted') === 'true';
            } catch(e) { playerProgress = {unlocked:1, stars:{},best:{}}; }
        }

        function saveProgress() {
            try {
                localStorage.setItem('angry_cats_progress', JSON.stringify(playerProgress));
            } catch(e) {}
        }

        const CAT_TYPES = {
            TABBY: { type: 'TABBY', name: 'Orange Tabby', radius: 20, density: 0.0032, color: '#FF9F43', label: 'Direct Hitter' },
            NINJA: { type: 'NINJA', name: 'Ninja Cat', radius: 17, density: 0.0026, color: '#2D3436', label: 'Tap: Dash Forward' },
            BOMB:  { type: 'BOMB', name: 'Chonky Bomb', radius: 26, density: 0.0065, color: '#6C5CE7', label: 'Tap: Blast' },
            SPLIT: { type: 'SPLIT', name: 'Calico Splitter', radius: 18, density: 0.0028, color: '#EE5253', label: 'Tap: Triple Split' }
        };

        // Procedural Generator for 100 progressive levels
        function generateLevel(levelNum) {
            const bx = FORT_BASE_X;
            const gy = VIRTUAL_GROUND_Y;

            // Cat allocation based on difficulty tier
            let cats = [];
            if (levelNum <= 10) {
                cats = [CAT_TYPES.TABBY, CAT_TYPES.TABBY, CAT_TYPES.NINJA];
            } else if (levelNum <= 30) {
                cats = [CAT_TYPES.TABBY, CAT_TYPES.NINJA, CAT_TYPES.SPLIT, CAT_TYPES.BOMB];
            } else if (levelNum <= 60) {
                cats = [CAT_TYPES.BOMB, CAT_TYPES.NINJA, CAT_TYPES.SPLIT, CAT_TYPES.TABBY];
            } else if (levelNum <= 90) {
                cats = [CAT_TYPES.BOMB, CAT_TYPES.BOMB, CAT_TYPES.NINJA, CAT_TYPES.SPLIT, CAT_TYPES.TABBY];
            } else {
                cats = [CAT_TYPES.BOMB, CAT_TYPES.NINJA, CAT_TYPES.SPLIT, CAT_TYPES.TABBY, CAT_TYPES.BOMB];
            }

            const titles = [
                "Mouse Shed", "Stone Bunker", "Glass Tower", "Double Pillar", "TNT Intro",
                "Fort Bridge", "Triple Vault", "Pyramid Steps", "TNT Sandwich", "Stone Keep",
                "Tall Skyscraper", "Shield Bunker", "Suspended Bridge", "Chain Reaction", "Fortified Twin",
                "Double Citadel", "Grand Pyramid", "Sniper Gap", "Underground Vault", "Mouse King Fortress"
            ];

            const titleIndex = (levelNum - 1) % titles.length;
            const levelTitle = `${levelNum}: ${titles[titleIndex]}`;

            return {
                name: levelTitle,
                cats: cats,
                build: () => {
                    const pattern = (levelNum - 1) % 10;
                    const tier = Math.floor((levelNum - 1) / 10); // 0 to 9

                    const matBase = tier >= 4 ? 'stone' : (tier >= 2 ? 'wood' : 'glass');
                    const matPillar = tier >= 6 ? 'stone' : 'wood';
                    const matRoof = tier >= 8 ? 'stone' : 'glass';

                    if (pattern === 0) { // Classic shed
                        const w = 120 + tier * 5;
                        createBlock(bx - w/2, gy - 40, 18, 80, matPillar);
                        createBlock(bx + w/2, gy - 40, 18, 80, matPillar);
                        createBlock(bx, gy - 88, w + 30, 18, matBase);
                        createTarget(bx, gy - 25);
                        if (tier >= 2) createTNT(bx, gy - 110);
                        else createTarget(bx, gy - 110);
                    }
                    else if (pattern === 1) { // Bunker
                        createBlock(bx - 70, gy - 45, 22, 90, 'stone');
                        createBlock(bx + 70, gy - 45, 22, 90, 'stone');
                        createBlock(bx, gy - 98, 170, 22, 'stone');
                        createTarget(bx - 30, gy - 25);
                        createTarget(bx + 30, gy - 25);
                        if (tier >= 3) createTNT(bx, gy - 25);
                        createBlock(bx - 40, gy - 138, 16, 60, matPillar);
                        createBlock(bx + 40, gy - 138, 16, 60, matPillar);
                        createBlock(bx, gy - 172, 110, 16, matRoof);
                        createTarget(bx, gy - 120, tier >= 5);
                    }
                    else if (pattern === 2) { // Tower stack
                        const floors = Math.min(5, 3 + Math.floor(tier / 2));
                        for (let i = 0; i < floors; i++) {
                            let y = gy - 35 - (i * 70);
                            createBlock(bx - 40, y, 16, 65, i % 2 === 0 ? 'stone' : 'glass');
                            createBlock(bx + 40, y, 16, 65, i % 2 === 0 ? 'stone' : 'glass');
                            createBlock(bx, y - 38, 110, 16, 'wood');
                            createTarget(bx, y, i === floors - 1 && tier >= 6);
                            if (i === 1 && tier >= 1) createTNT(bx - 20, y);
                        }
                    }
                    else if (pattern === 3) { // Twin Pillars
                        [-50, 50].forEach((offX, idx) => {
                            createBlock(bx + offX - 20, gy - 40, 16, 80, matPillar);
                            createBlock(bx + offX + 20, gy - 40, 16, 80, matPillar);
                            createBlock(bx + offX, gy - 86, 65, 16, matBase);
                            createTarget(bx + offX, gy - 25, idx === 0 && tier >= 7);
                            if (tier >= 4) createTNT(bx + offX, gy - 110);
                        });
                    }
                    else if (pattern === 4) { // TNT Vault
                        createBlock(bx - 60, gy - 40, 20, 80, 'stone');
                        createBlock(bx + 60, gy - 40, 20, 80, 'stone');
                        createBlock(bx, gy - 86, 150, 18, 'wood');
                        createTNT(bx, gy - 25);
                        createTarget(bx - 30, gy - 25);
                        createTarget(bx + 30, gy - 25);
                        createBlock(bx - 30, gy - 128, 14, 60, 'glass');
                        createBlock(bx + 30, gy - 128, 14, 60, 'glass');
                        createBlock(bx, gy - 162, 90, 14, 'wood');
                        createTarget(bx, gy - 110);
                    }
                    else if (pattern === 5) { // Bridge fort
                        createBlock(bx - 95, gy - 55, 22, 110, 'stone');
                        createBlock(bx + 95, gy - 55, 22, 110, 'stone');
                        createBlock(bx, gy - 118, 220, 20, 'stone');
                        createTarget(bx - 55, gy - 25);
                        createTNT(bx, gy - 25);
                        createTarget(bx + 55, gy - 25);
                        createBlock(bx - 35, gy - 158, 16, 60, matPillar);
                        createBlock(bx + 35, gy - 158, 16, 60, matPillar);
                        createBlock(bx, gy - 192, 100, 16, 'wood');
                        createTarget(bx, gy - 140, tier >= 8);
                    }
                    else if (pattern === 6) { // Triple Vault
                        for (let i = 0; i < 3; i++) {
                            let x = (bx - 65) + (i * 65);
                            createBlock(x - 22, gy - 35, 14, 70, matPillar);
                            createBlock(x + 22, gy - 35, 14, 70, matPillar);
                            createBlock(x, gy - 75, 60, 14, matBase);
                            createTarget(x, gy - 25);
                            if (i === 1 || tier >= 5) createTNT(x, gy - 95);
                        }
                    }
                    else if (pattern === 7) { // Pyramid
                        createBlock(bx - 80, gy - 35, 18, 70, 'stone');
                        createBlock(bx, gy - 35, 18, 70, 'wood');
                        createBlock(bx + 80, gy - 35, 18, 70, 'stone');
                        createBlock(bx - 40, gy - 75, 100, 16, 'wood');
                        createBlock(bx + 40, gy - 75, 100, 16, 'wood');
                        createTarget(bx - 40, gy - 25);
                        createTarget(bx + 40, gy - 25);
                        createBlock(bx - 35, gy - 110, 16, 55, 'glass');
                        createBlock(bx + 35, gy - 110, 16, 55, 'glass');
                        createBlock(bx, gy - 142, 90, 16, 'wood');
                        createTarget(bx, gy - 95, tier >= 4);
                        if (tier >= 2) createTNT(bx, gy - 162);
                    }
                    else if (pattern === 8) { // Multi-layer citadel
                        createBlock(bx - 110, gy - 55, 22, 110, 'stone');
                        createBlock(bx - 35, gy - 55, 22, 110, 'stone');
                        createBlock(bx + 35, gy - 55, 22, 110, 'stone');
                        createBlock(bx + 110, gy - 55, 22, 110, 'stone');
                        createBlock(bx - 72, gy - 118, 100, 18, 'stone');
                        createBlock(bx + 72, gy - 118, 100, 18, 'stone');
                        createTarget(bx - 72, gy - 25);
                        createTarget(bx + 72, gy - 25);
                        createTNT(bx, gy - 25);
                        createTarget(bx - 72, gy - 145);
                        createTarget(bx + 72, gy - 145, tier >= 6);
                    }
                    else { // Grand Master Boss Citadel (Pattern 9)
                        createBlock(bx - 120, gy - 65, 26, 130, 'stone');
                        createBlock(bx + 120, gy - 65, 26, 130, 'stone');
                        createBlock(bx, gy - 138, 270, 22, 'stone');
                        createBlock(bx - 45, gy - 38, 18, 76, 'stone');
                        createBlock(bx + 45, gy - 38, 18, 76, 'stone');
                        createBlock(bx, gy - 82, 110, 18, 'stone');
                        createTarget(bx - 80, gy - 25);
                        createTarget(bx + 80, gy - 25);
                        createTarget(bx, gy - 25, true); // Mouse King!
                        createBlock(bx - 70, gy - 172, 16, 50, 'wood');
                        createBlock(bx + 70, gy - 172, 16, 50, 'wood');
                        createBlock(bx, gy - 200, 180, 14, 'wood');
                        createTarget(bx - 70, gy - 150);
                        createTarget(bx + 70, gy - 150);
                        createTNT(bx, gy - 160);
                    }
                }
            };
        }

        window.addEventListener('load', () => {
            loadProgress();

            canvas = document.getElementById('gameCanvas');
            ctx = canvas.getContext('2d');

            engine = Engine.create({ enableSleeping: false });
            world = engine.world;

            Events.on(engine, 'collisionStart', handleCollisions);

            const runner = Runner.create();
            Runner.run(runner, engine);

            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            setupControls();
            setupUI();
            buildLevelSelectGrid();

            requestAnimationFrame(gameLoop);
        });

        function resizeCanvas() {
            const container = document.getElementById('game-container');
            const w = container.clientWidth || window.innerWidth;
            const h = container.clientHeight || window.innerHeight;
            canvas.width = w;
            canvas.height = h;

            const scaleX = (w * 0.96) / VIRTUAL_WIDTH;
            const scaleY = (h * 0.70) / VIRTUAL_HEIGHT;
            baseScale = Math.min(scaleX, scaleY);
            if (w < 600 && h > w) {
                baseScale = w / VIRTUAL_WIDTH;
            }

            cameraScale = baseScale * userZoomMultiplier;

            defaultCameraOffsetX = (w - VIRTUAL_WIDTH * cameraScale) / 2;
            if (h > w) {
                defaultCameraOffsetY = h * 0.72 - VIRTUAL_GROUND_Y * cameraScale;
            } else {
                defaultCameraOffsetY = (h - VIRTUAL_HEIGHT * cameraScale) / 2;
            }

            if (!isPanning && !cameraFollowCat) {
                cameraOffsetX = defaultCameraOffsetX;
                cameraOffsetY = defaultCameraOffsetY;
            }

            clampCameraOffsets();

            if (!isAiming) {
                pullPos.x = slingshotPos.x;
                pullPos.y = slingshotPos.y - 10;
            }

            if (gameActive) {
                rebuildBoundaries();
            }
        }

        function resetCameraView() {
            userZoomMultiplier = 1.0;
            cameraFollowCat = false;
            resizeCanvas();
        }

        function zoomCamera(deltaFactor, centerScreenX = canvas.width / 2, centerScreenY = canvas.height / 2) {
            const oldScale = cameraScale;
            userZoomMultiplier = Math.max(0.55, Math.min(2.8, userZoomMultiplier * deltaFactor));
            cameraScale = baseScale * userZoomMultiplier;

            const virtualX = (centerScreenX - cameraOffsetX) / oldScale;
            const virtualY = (centerScreenY - cameraOffsetY) / oldScale;

            cameraOffsetX = centerScreenX - virtualX * cameraScale;
            cameraOffsetY = centerScreenY - virtualY * cameraScale;

            clampCameraOffsets();
        }

        function clampCameraOffsets() {
            const maxSlackX = canvas.width * 0.8;
            const maxSlackY = canvas.height * 0.8;
            const minX = -VIRTUAL_WIDTH * cameraScale + (canvas.width - maxSlackX);
            const maxX = maxSlackX;
            const minY = -VIRTUAL_HEIGHT * cameraScale + (canvas.height - maxSlackY);
            const maxY = maxSlackY;

            cameraOffsetX = Math.max(minX, Math.min(maxX, cameraOffsetX));
            cameraOffsetY = Math.max(minY, Math.min(maxY, cameraOffsetY));
        }

        function rebuildBoundaries() {
            const statics = world.bodies.filter(b => b.isStatic);
            statics.forEach(b => Composite.remove(world, b));

            const thick = 300;
            const ground = Bodies.rectangle(VIRTUAL_WIDTH / 2, VIRTUAL_GROUND_Y + thick / 2, VIRTUAL_WIDTH * 4, thick, {
                isStatic: true,
                friction: 0.8,
                label: 'ground'
            });

            const leftWall = Bodies.rectangle(-thick / 2, VIRTUAL_HEIGHT / 2, thick, VIRTUAL_HEIGHT * 4, { isStatic: true });
            const rightWall = Bodies.rectangle(VIRTUAL_WIDTH + thick / 2, VIRTUAL_HEIGHT / 2, thick, VIRTUAL_HEIGHT * 4, { isStatic: true });

            Composite.add(world, [ground, leftWall, rightWall]);
        }

        function screenToVirtual(screenX, screenY) {
            return {
                x: (screenX - cameraOffsetX) / cameraScale,
                y: (screenY - cameraOffsetY) / cameraScale
            };
        }

        function getEventScreenPoint(evt) {
            const rect = canvas.getBoundingClientRect();
            const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
            const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        }

        function setupControls() {
            const onPointerDown = (e) => {
                audio.init();
                activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                if (!gameActive || levelFinished || paused) return;

                if (activePointers.size === 2) {
                    isAiming = false;
                    isPanning = false;
                    canvas.classList.remove('grabbing');
                    const pts = Array.from(activePointers.values());
                    initialPinchDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                    initialPinchZoom = userZoomMultiplier;
                    return;
                }

                if (activePointers.size > 2) return;

                const screenPt = getEventScreenPoint(e);
                const virtualPt = screenToVirtual(screenPt.x, screenPt.y);

                if (launchedCatBody && !catAbilityUsed) {
                    triggerCatAbility();
                    return;
                }

                if (activeCatData && !launchedCatBody) {
                    const dist = Vector.magnitude(Vector.sub(virtualPt, slingshotPos));
                    if (dist < 110) {
                        isAiming = true;
                        cameraFollowCat = false;
                        canvas.classList.add('grabbing');
                        updatePullPosition(virtualPt);

                        const hint = document.getElementById('launch-hint');
                        if (hint) hint.style.display = 'none';

                        if (e.pointerId && canvas.setPointerCapture) {
                            try { canvas.setPointerCapture(e.pointerId); } catch(err){}
                        }
                        return;
                    }
                }

                isPanning = true;
                cameraFollowCat = false;
                panStartScreen = { x: screenPt.x, y: screenPt.y };
                panStartCameraOffset = { x: cameraOffsetX, y: cameraOffsetY };
            };

            const onPointerMove = (e) => {
                if (!gameActive || levelFinished || paused) return;
                if (activePointers.has(e.pointerId)) {
                    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
                }

                if (activePointers.size === 2) {
                    const pts = Array.from(activePointers.values());
                    const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                    if (initialPinchDistance > 10) {
                        const ratio = currentDist / initialPinchDistance;
                        userZoomMultiplier = Math.max(0.55, Math.min(2.8, initialPinchZoom * ratio));
                        cameraScale = baseScale * userZoomMultiplier;
                        clampCameraOffsets();
                    }
                    return;
                }

                if (isAiming) {
                    const screenPt = getEventScreenPoint(e);
                    const virtualPt = screenToVirtual(screenPt.x, screenPt.y);
                    updatePullPosition(virtualPt);
                } else if (isPanning) {
                    const screenPt = getEventScreenPoint(e);
                    const dx = screenPt.x - panStartScreen.x;
                    const dy = screenPt.y - panStartScreen.y;
                    cameraOffsetX = panStartCameraOffset.x + dx;
                    cameraOffsetY = panStartCameraOffset.y + dy;
                    clampCameraOffsets();
                }
            };

            const onPointerUp = (e) => {
                if (!gameActive || levelFinished || paused) { activePointers.delete(e.pointerId); return; }
                activePointers.delete(e.pointerId);

                if (activePointers.size === 0) {
                    if (isAiming) {
                        isAiming = false;
                        canvas.classList.remove('grabbing');
                        fireSlingshot();
                    }
                    isPanning = false;
                }
            };

            canvas.addEventListener('pointerdown', onPointerDown);
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
            window.addEventListener('pointercancel', (e) => { activePointers.delete(e.pointerId); isAiming=false; isPanning=false; pullPos={x:slingshotPos.x,y:slingshotPos.y-10}; canvas.classList.remove('grabbing'); });

            canvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                audio.init();
                const screenPt = getEventScreenPoint(e);
                const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
                zoomCamera(zoomFactor, screenPt.x, screenPt.y);
            }, { passive: false });

            document.addEventListener('gesturestart', (e) => e.preventDefault());
            document.addEventListener('gesturechange', (e) => e.preventDefault());
            document.addEventListener('gestureend', (e) => e.preventDefault());
        }

        function updatePullPosition(pt) {
            const maxStretch = 110;
            let offset = Vector.sub(pt, slingshotPos);
            const dist = Vector.magnitude(offset);

            if (dist > maxStretch) {
                offset = Vector.mult(Vector.normalise(offset), maxStretch);
            }

            pullPos = Vector.add(slingshotPos, offset);
        }

        function fireSlingshot() {
            if (!activeCatData) return;

            const pullDelta = Vector.sub(slingshotPos, pullPos);
            const pullDistance = Vector.magnitude(pullDelta);

            if (pullDistance < 18) {
                pullPos.x = slingshotPos.x;
                pullPos.y = slingshotPos.y - 10;
                return;
            }

            const cat = Bodies.circle(pullPos.x, pullPos.y, activeCatData.radius, {
                density: activeCatData.density,
                friction: 0.5,
                restitution: 0.45,
                label: 'cat',
                catData: activeCatData
            });

            const launchSpeedFactor = 0.22;
            const velocity = Vector.mult(pullDelta, launchSpeedFactor);

            Body.setVelocity(cat, velocity);
            Body.setAngularVelocity(cat, (Math.random() - 0.5) * 0.15);

            Composite.add(world, cat);
            launchedCatBody = cat;
            catAbilityUsed = false;
            shotsFired++;
            cameraFollowCat = true;
            audio.playSwoosh();

            pullPos.x = slingshotPos.x;
            pullPos.y = slingshotPos.y - 10;

            if (activeCatData.type !== 'TABBY') {
                showAbilityPrompt(activeCatData.label);
            }
            // The launched cat owns this turn, even after a bomb or split removes it.
            activeCatData = null;

            cancelGameDelay(turnTimer);
            turnTimer = gameDelay(() => {
                if (gameActive && !levelFinished) {
                    endTurn();
                }
            }, 5500);
        }

        function endTurn() {
            hideAbilityPrompt();
            cameraFollowCat = false;
            resetCameraView();

            if (launchedCatBody) {
                createSmokeParticles(launchedCatBody.position.x, launchedCatBody.position.y, 8);
                Composite.remove(world, launchedCatBody);
                launchedCatBody = null;
            }

            const targetsLeft = world.bodies.filter(b => b.label === 'target').length;
            if (targetsLeft <= 0) {
                triggerVictory();
            } else if (activeCatsQueue.length > 0) {
                loadNextCat();
            } else {
                gameDelay(() => {
                    const finalTargets = world.bodies.filter(b => b.label === 'target').length;
                    if (finalTargets <= 0) triggerVictory();
                    else triggerDefeat();
                }, 1800);
            }
        }

        function triggerCatAbility() {
            if (!launchedCatBody || catAbilityUsed) return;
            catAbilityUsed = true;
            hideAbilityPrompt();

            const type = launchedCatBody.catData.type;

            if (type === 'NINJA') {
                const vel = launchedCatBody.velocity;
                const dir = Vector.magnitude(vel) > 0.1 ? Vector.normalise(vel) : { x: 1, y: 0 };
                Body.setVelocity(launchedCatBody, Vector.mult(dir, 25));
                createSparkParticles(launchedCatBody.position.x, launchedCatBody.position.y, '#2D3436', 15);
                audio.playSwoosh();
            }
            else if (type === 'BOMB') {
                const pos = launchedCatBody.position;
                createExplosion(pos.x, pos.y, 140, 2.7);
                Composite.remove(world, launchedCatBody);
                launchedCatBody = null;
            }
            else if (type === 'SPLIT') {
                const pos = launchedCatBody.position;
                const vel = launchedCatBody.velocity;
                Composite.remove(world, launchedCatBody);

                [-0.2, 0, 0.2].forEach(angle => {
                    const splitVel = Vector.rotate(vel, angle);
                    const mini = Bodies.circle(pos.x, pos.y, 12, {
                        density: 0.003,
                        friction: 0.4,
                        restitution: 0.5,
                        label: 'cat',
                        catData: CAT_TYPES.SPLIT
                    });
                    Body.setVelocity(mini, Vector.mult(splitVel, 1.1));
                    Composite.add(world, mini);
                });

                audio.playMeow('fast');
                createSmokeParticles(pos.x, pos.y, 10);
                launchedCatBody = null;
            }
        }

        function createExplosion(x, y, radius, forceMagnitude) {
            audio.playExplosion();
            createSparkParticles(x, y, '#FF7675', 22);
            createSmokeParticles(x, y, 18);

            const bodies = Composite.allBodies(world);
            bodies.forEach(body => {
                if (body.isStatic) return;
                const dist = Vector.magnitude(Vector.sub(body.position, { x, y }));
                if (dist < radius && dist > 0) {
                    const dir = Vector.normalise(Vector.sub(body.position, { x, y }));
                    const factor = (1 - dist / radius) * forceMagnitude;
                    Body.applyForce(body, body.position, Vector.mult(dir, factor * body.mass * 0.05));
                    if (body.label === 'block') damageBlock(body, 80);
                    if (body.label === 'tnt') explodeTNT(body);
                    if (body.label === 'target') damageTarget(body, 60);
                }
            });
        }

        function explodeTNT(tntBody) {
            if (tntBody.exploded) return;
            tntBody.exploded = true;
            const pos = tntBody.position;
            Composite.remove(world, tntBody);
            addScore(250, pos.x, pos.y);
            createExplosion(pos.x, pos.y, 150, 3.0);
        }

        function createBlock(x, y, w, h, material) {
            let hp = 40, density = 0.0025;
            if (material === 'stone') { hp = 95; density = 0.006; }
            if (material === 'glass') { hp = 18; density = 0.0012; }

            const block = Bodies.rectangle(x, y, w, h, {
                density: density,
                friction: 0.6,
                restitution: 0.1,
                label: 'block',
                material: material,
                health: hp,
                maxHealth: hp,
                width: w,
                height: h
            });
            Composite.add(world, block);
            return block;
        }

        function createTNT(x, y) {
            const tnt = Bodies.rectangle(x, y, 30, 30, {
                density: 0.002,
                friction: 0.5,
                restitution: 0.2,
                label: 'tnt',
                health: 15,
                width: 30,
                height: 30,
                spawnTime: Date.now()
            });
            Composite.add(world, tnt);
            return tnt;
        }

        function createTarget(x, y, isKing = false) {
            const radius = isKing ? 23 : 17;
            const hp = isKing ? 80 : 35;

            const target = Bodies.circle(x, y, radius, {
                density: 0.002,
                friction: 0.5,
                restitution: 0.2,
                label: 'target',
                isKing: isKing,
                health: hp,
                maxHealth: hp,
                spawnTime: Date.now()
            });
            Composite.add(world, target);
            return target;
        }

        function handleCollisions(event) {
            const now = Date.now();
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                const relVel = Vector.magnitude(Vector.sub(bodyA.velocity, bodyB.velocity));

                [bodyA, bodyB].forEach(b => {
                    if (b.label === 'block') {
                        if (relVel < 2.0) return;
                        damageBlock(b, Math.pow(relVel, 1.4) * 2.2);
                    } else if (b.label === 'tnt') {
                        if (now - (b.spawnTime || levelStartTime) < 800) return;
                        if (relVel > 2.2) explodeTNT(b);
                    } else if (b.label === 'target') {
                        if (now - (b.spawnTime || levelStartTime) < 800) return;
                        if (relVel < 2.8) return;
                        damageTarget(b, Math.pow(relVel, 1.4) * 3.0);
                    }
                });
            });
        }

        function damageBlock(body, amount) {
            if (!body.health) return;
            body.health -= amount;
            audio.playImpact(body.material);

            if (body.health <= 0) {
                addScore(100, body.position.x, body.position.y);
                createDebrisParticles(body.position.x, body.position.y, body.material);
                Composite.remove(world, body);
            }
        }

        function damageTarget(body, amount) {
            if (!body.health) return;
            body.health -= amount;

            if (body.health <= 0) {
                audio.playSqueak();
                const bonus = body.isKing ? 2500 : 1000;
                addScore(bonus, body.position.x, body.position.y);
                createSparkParticles(body.position.x, body.position.y, '#FFD700', 18);
                createSmokeParticles(body.position.x, body.position.y, 12);
                Composite.remove(world, body);

                targetsRemaining--;
                if (targetsRemaining <= 0 && shotsFired > 0) {
                    gameDelay(triggerVictory, 700);
                }
            }
        }

        function addScore(pts, x, y) {
            score += pts;
            document.getElementById('score-display').innerText = score;
            scorePopups.push({ text: `+${pts}`, x: x, y: y, alpha: 1.0, life: 55 });
        }

        function startLevel(index) {
            clearTurns(); setPaused(false); resetCameraView(); audio.init();
            showCard('card-result');
            index = Math.max(0, Math.min(99, playerProgress.unlocked - 1, index));
            currentLevelIndex = index;
            score = 0;
            levelFinished = false;
            gameActive = true;
            shotsFired = 0;
            levelStartTime = Date.now();
            isAiming = false;
            launchedCatBody = null;

            document.getElementById('score-display').innerText = '0';

            const levelData = generateLevel(index + 1);
            document.getElementById('level-title').innerText = levelData.name;
            document.getElementById('modal-overlay').classList.add('hidden');

            Composite.clear(world, false);
            particles = [];
            scorePopups = [];

            rebuildBoundaries();

            activeCatsQueue = [...levelData.cats];
            levelData.build();

            targetsRemaining = world.bodies.filter(b => b.label === 'target').length;

            loadNextCat();
        }

        function loadNextCat() {
            if (activeCatsQueue.length === 0) {
                activeCatData = null;
                return;
            }

            activeCatData = activeCatsQueue.shift();
            pullPos = { x: slingshotPos.x, y: slingshotPos.y - 10 };
            updateCatQueueUI();

            const hint = document.getElementById('launch-hint');
            if (hint) hint.style.display = 'flex';

            audio.playMeow(activeCatData.type === 'BOMB' ? 'heavy' : (activeCatData.type === 'NINJA' ? 'fast' : 'normal'));
        }

        function triggerVictory() {
            if (levelFinished || shotsFired === 0) return;
            levelFinished = true;
            audio.playVictory();

            let stars = 1;
            if (activeCatsQueue.length >= 1) stars = 2;
            if (activeCatsQueue.length >= 2) stars = 3;

            score += activeCatsQueue.length * 1000;
            document.getElementById('score-display').innerText = score;

            const lvlNum = currentLevelIndex + 1;
            playerProgress.stars[lvlNum] = Math.max(playerProgress.stars[lvlNum] || 0, stars);
            if (lvlNum < 100) {
                playerProgress.unlocked = Math.max(playerProgress.unlocked, lvlNum + 1);
            }
            playerProgress.best[lvlNum] = Math.max(playerProgress.best[lvlNum] || 0, score);
            saveProgress();
            buildLevelSelectGrid();

            showResultModal("LEVEL CLEARED!", stars, score);
        }

        function triggerDefeat() {
            if (levelFinished) return;
            levelFinished = true;
            showResultModal("LEVEL FAILED", 0, score);
        }

        function showResultModal(title, stars, finalScore) {
            setPaused(true); clearTurns(); showCard('card-result');
            document.getElementById('best-score').textContent = Math.max(playerProgress.best[currentLevelIndex+1] || 0, finalScore).toLocaleString();
            const next = document.getElementById('btn-result-next');
            next.classList.toggle('hidden', stars === 0);
            next.textContent = currentLevelIndex === 99 ? '★ All levels complete!' : '▶ Next Level';
            const overlay = document.getElementById('modal-overlay');
            const cardLevels = document.getElementById('card-levels');
            const cardResult = document.getElementById('card-result');

            document.getElementById('result-title').innerText = title;
            document.getElementById('result-score').innerText = finalScore;

            for (let i = 1; i <= 3; i++) {
                const star = document.getElementById(`star-${i}`);
                if (i <= stars) {
                    star.classList.remove('text-gray-300');
                    star.classList.add('text-amber-400');
                } else {
                    star.classList.remove('text-amber-400');
                    star.classList.add('text-gray-300');
                }
            }

            cardLevels.classList.add('hidden');
            cardResult.classList.remove('hidden');
            overlay.classList.remove('hidden');
        }

        function gameLoop() {
            const frameNow = performance.now(), dt = Math.min(50, frameNow - lastFrame); lastFrame = frameNow;
            if (!paused && gameActive && !levelFinished) {
                for (const [id,timer] of [...gameTimers]) { timer.ms -= dt; if(timer.ms <= 0) { gameTimers.delete(id); timer.fn(); } }
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (cameraFollowCat && launchedCatBody) {
                const targetVirtX = launchedCatBody.position.x;
                const targetVirtY = launchedCatBody.position.y;
                const idealOffsetX = (canvas.width * 0.4) - (targetVirtX * cameraScale);
                const idealOffsetY = (canvas.height * 0.5) - (targetVirtY * cameraScale);

                cameraOffsetX += (idealOffsetX - cameraOffsetX) * 0.08;
                cameraOffsetY += (idealOffsetY - cameraOffsetY) * 0.08;
                clampCameraOffsets();
            }

            drawFullBackground();

            ctx.save();
            ctx.translate(cameraOffsetX, cameraOffsetY);
            ctx.scale(cameraScale, cameraScale);

            drawArenaGround();
            drawSlingshotBack();

            if (isAiming) {
                drawTrajectory();
            }

            const bodies = Composite.allBodies(world);
            bodies.forEach(body => {
                if (body.label === 'cat') drawCat(body.position.x, body.position.y, body.circleRadius, body.angle, body.catData);
                else if (body.label === 'block') drawBlock(body);
                else if (body.label === 'tnt') drawTNT(body);
                else if (body.label === 'target') drawTargetMouse(body);
            });

            if (activeCatData && !launchedCatBody) {
                drawCat(pullPos.x, pullPos.y, activeCatData.radius, 0, activeCatData);
            }

            drawSlingshotFront();

            updateAndRenderParticles();
            updateAndRenderPopups();

            ctx.restore();

            requestAnimationFrame(gameLoop);
        }

        function drawFullBackground() {
            const w=canvas.width,h=canvas.height;
            const sky=ctx.createLinearGradient(0,0,0,h);
            sky.addColorStop(0,'#ef9775');sky.addColorStop(.45,'#ffd591');sky.addColorStop(.72,'#afb66d');sky.addColorStop(1,'#2c613c');
            ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
            ctx.fillStyle='#ffe5a2';ctx.beginPath();ctx.arc(w*.65,h*.38,Math.min(w,h)*.13,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#ba9678';
            for(let i=0;i<16;i++){const bh=(.07+((i*17)%9)*.013)*h;ctx.fillRect(i*w/15,h*.59-bh,w*.055,bh);}
            ctx.fillStyle='#8a8260';
            for(let i=0;i<18;i++){const x=i*w/17;ctx.beginPath();ctx.moveTo(x,h*.73);ctx.lineTo(x,h*.52);ctx.lineTo(x+w*.025,h*.49);ctx.lineTo(x+w*.05,h*.52);ctx.lineTo(x+w*.05,h*.73);ctx.fill();}
            ctx.fillStyle='#568353';ctx.beginPath();ctx.ellipse(w*.5,h*.91,w*.9,h*.25,0,0,Math.PI*2);ctx.fill();
            for(let i=0;i<36;i++){const x=((i*137)%997)/997*w,y=h*(.81+((i*19)%17)/100);ctx.fillStyle=i%3?'#8ca75b':'#ffe5a5';ctx.beginPath();ctx.ellipse(x,y,3,2,0,0,7);ctx.fill();}
            for(let i=0;i<12;i++){ctx.fillStyle=i%2?'#366844':'#487c49';ctx.beginPath();ctx.arc(-w*.06+(i%3)*w*.06,h*.05+i*h*.025,w*.16,0,7);ctx.fill();}
            ctx.fillStyle='#254e37';ctx.beginPath();ctx.ellipse(0,h,w*.17,h*.23,-.3,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(w,h,w*.15,h*.2,.5,0,7);ctx.fill();
        }

        function drawArenaGround() {
            const gy = VIRTUAL_GROUND_Y;

            ctx.fillStyle = '#8B5A2B';
            ctx.fillRect(-200, gy + 12, VIRTUAL_WIDTH + 400, 200);

            ctx.fillStyle = '#6E431F';
            ctx.fillRect(-200, gy + 24, VIRTUAL_WIDTH + 400, 5);

            ctx.fillStyle = '#2ED573';
            ctx.fillRect(-200, gy, VIRTUAL_WIDTH + 400, 16);

            ctx.strokeStyle = '#26AF5F';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-200, gy + 2);
            ctx.lineTo(VIRTUAL_WIDTH + 200, gy + 2);
            ctx.stroke();
        }

        function drawSlingshotBack() {
            const sx = slingshotPos.x;
            const sy = slingshotPos.y;

            if (activeCatData && !launchedCatBody) {
                ctx.strokeStyle = '#7f1d1d';
                ctx.lineWidth = isAiming ? 6 : 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(sx - 16, sy - 28);
                ctx.lineTo(pullPos.x - 5, pullPos.y);
                ctx.stroke();
            }
        }

        function drawSlingshotFront() {
            const sx = slingshotPos.x;
            const sy = slingshotPos.y;

            ctx.fillStyle = '#793B18';
            ctx.strokeStyle = '#431407';
            ctx.lineWidth = 2.5;

            ctx.fillRect(sx - 8, sy, 16, 75);
            ctx.strokeRect(sx - 8, sy, 16, 75);

            ctx.beginPath();
            ctx.moveTo(sx - 8, sy + 4);
            ctx.lineTo(sx - 20, sy - 32);
            ctx.lineTo(sx - 10, sy - 34);
            ctx.lineTo(sx, sy + 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(sx, sy + 4);
            ctx.lineTo(sx + 20, sy - 32);
            ctx.lineTo(sx + 10, sy - 34);
            ctx.lineTo(sx + 8, sy + 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            if (activeCatData && !launchedCatBody) {
                ctx.strokeStyle = '#dc2626';
                ctx.lineWidth = isAiming ? 6 : 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(sx + 16, sy - 28);
                ctx.lineTo(pullPos.x + 5, pullPos.y);
                ctx.stroke();

                ctx.fillStyle = '#451A03';
                ctx.beginPath();
                ctx.arc(pullPos.x - 2, pullPos.y, 7, 0, Math.PI * 2);
                ctx.fill();
            }

            if (activeCatData && !launchedCatBody && !isAiming) {
                ctx.save();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = 'rgba(255, 159, 67, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(slingshotPos.x, slingshotPos.y - 10, 36, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }

        function drawTrajectory() {
            const pullDelta = Vector.sub(slingshotPos, pullPos);
            const dist = Vector.magnitude(pullDelta);
            if (dist < 15) return;

            const speedFactor = 0.25;
            let vx = pullDelta.x * speedFactor;
            let vy = pullDelta.y * speedFactor;
            let px = pullPos.x;
            let py = pullPos.y;
            const gravity = engine.gravity.y * engine.gravity.scale * 1000;

            for (let i = 0; i < 26; i++) {
                px += vx * 1.6;
                py += vy * 1.6;
                vy += gravity * 0.016;

                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.15, 1 - i / 26)})`;
                ctx.beginPath();
                ctx.arc(px, py, Math.max(2.5, 5 - i * 0.12), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function drawCat(x, y, r, angle, catData) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            ctx.fillStyle = catData.color;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-r * 0.7, -r * 0.55);
            ctx.lineTo(-r * 0.35, -r * 1.15);
            ctx.lineTo(-r * 0.1, -r * 0.65);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(r * 0.7, -r * 0.55);
            ctx.lineTo(r * 0.35, -r * 1.15);
            ctx.lineTo(r * 0.1, -r * 0.65);
            ctx.fill();

            ctx.fillStyle = '#FF7675';
            ctx.beginPath();
            ctx.moveTo(-r * 0.6, -r * 0.6);
            ctx.lineTo(-r * 0.35, -r * 1.0);
            ctx.lineTo(-r * 0.2, -r * 0.65);
            ctx.fill();

            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(-r * 0.3, -r * 0.1, r * 0.24, 0, Math.PI * 2);
            ctx.arc(r * 0.3, -r * 0.1, r * 0.24, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(-r * 0.25, -r * 0.1, r * 0.11, 0, Math.PI * 2);
            ctx.arc(r * 0.35, -r * 0.1, r * 0.11, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FF7675';
            ctx.beginPath();
            ctx.arc(0, r * 0.15, r * 0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#2D3436';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(-r * 0.3, r * 0.1); ctx.lineTo(-r * 0.95, 0);
            ctx.moveTo(-r * 0.3, r * 0.2); ctx.lineTo(-r * 0.95, r * 0.3);
            ctx.moveTo(r * 0.3, r * 0.1);  ctx.lineTo(r * 0.95, 0);
            ctx.moveTo(r * 0.3, r * 0.2);  ctx.lineTo(r * 0.95, r * 0.3);
            ctx.stroke();

            ctx.restore();
        }

        function drawTargetMouse(body) {
            const { x, y } = body.position;
            const r = body.circleRadius || 17;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(body.angle);

            ctx.save();
            ctx.rotate(-body.angle);
            ctx.fillStyle = body.isKing ? '#FFD700' : '#FF4757';
            ctx.beginPath();
            ctx.moveTo(0, -r - 8);
            ctx.lineTo(-5, -r - 15);
            ctx.lineTo(5, -r - 15);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            if (body.isKing) {
                ctx.save();
                ctx.rotate(-body.angle);
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#D97706';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(-10, -r - 2);
                ctx.lineTo(-10, -r - 14);
                ctx.lineTo(-5, -r - 7);
                ctx.lineTo(0, -r - 17);
                ctx.lineTo(5, -r - 7);
                ctx.lineTo(10, -r - 14);
                ctx.lineTo(10, -r - 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            ctx.fillStyle = '#FF6B81';
            ctx.strokeStyle = '#2F3542';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(-r * 0.68, -r * 0.65, r * 0.48, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(r * 0.68, -r * 0.65, r * 0.48, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

            ctx.fillStyle = '#FFA1B8';
            ctx.beginPath();
            ctx.arc(-r * 0.68, -r * 0.65, r * 0.28, 0, Math.PI * 2);
            ctx.arc(r * 0.68, -r * 0.65, r * 0.28, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = body.isKing ? '#64748b' : '#A4B0BE';
            ctx.strokeStyle = '#2F3542';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#CED6E0';
            ctx.beginPath();
            ctx.ellipse(0, r * 0.35, r * 0.55, r * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-r * 0.32, -r * 0.12, r * 0.26, 0, Math.PI * 2);
            ctx.arc(r * 0.32, -r * 0.12, r * 0.26, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1E272E';
            ctx.beginPath();
            ctx.arc(-r * 0.24, -r * 0.12, r * 0.13, 0, Math.PI * 2);
            ctx.arc(r * 0.40, -r * 0.12, r * 0.13, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FF4757';
            ctx.beginPath();
            ctx.ellipse(0, r * 0.14, r * 0.16, r * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(-2.5, r * 0.26, 2.5, 4.5);
            ctx.fillRect(0.5, r * 0.26, 2.5, 4.5);

            ctx.restore();
        }

        function drawTNT(body) {
            const { x, y } = body.position;
            const w = body.width;
            const h = body.height;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(body.angle);

            ctx.fillStyle = '#EF4444';
            ctx.fillRect(-w / 2, -h / 2, w, h);
            ctx.strokeStyle = '#B91C1C';
            ctx.lineWidth = 1.8;
            ctx.strokeRect(-w / 2, -h / 2, w, h);

            ctx.fillStyle = '#FBBF24';
            ctx.fillRect(-w / 2, -3.5, w, 7);

            ctx.font = 'bold 10px sans-serif';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('TNT', 0, 0);

            ctx.restore();
        }

        function drawBlock(body) {
            const { x, y } = body.position;
            const w = body.width;
            const h = body.height;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(body.angle);

            if (body.material === 'wood') {
                ctx.fillStyle = '#E17055';
                ctx.fillRect(-w / 2, -h / 2, w, h);
                ctx.strokeStyle = '#D63031';
                ctx.lineWidth = 1.8;
                ctx.strokeRect(-w / 2, -h / 2, w, h);
            } else if (body.material === 'stone') {
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(-w / 2, -h / 2, w, h);
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 1.8;
                ctx.strokeRect(-w / 2, -h / 2, w, h);
            } else if (body.material === 'glass') {
                ctx.fillStyle = 'rgba(125, 211, 252, 0.65)';
                ctx.fillRect(-w / 2, -h / 2, w, h);
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 1.4;
                ctx.strokeRect(-w / 2, -h / 2, w, h);
            }

            if (body.health < body.maxHealth * 0.6) {
                ctx.strokeStyle = 'rgba(0,0,0,0.35)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-w * 0.2, -h * 0.3);
                ctx.lineTo(w * 0.1, h * 0.2);
                ctx.stroke();
            }

            ctx.restore();
        }

        function createDebrisParticles(x, y, material) {
            let color = material === 'stone' ? '#64748b' : (material === 'glass' ? '#7dd3fc' : '#E17055');
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: x, y: y,
                    vx: (Math.random() - 0.5) * 7,
                    vy: (Math.random() - 0.5) * 7 - 2,
                    radius: Math.random() * 3 + 2,
                    color: color,
                    life: 30
                });
            }
        }

        function createSparkParticles(x, y, color, count) {
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: x, y: y,
                    vx: (Math.random() - 0.5) * 9,
                    vy: (Math.random() - 0.5) * 9,
                    radius: Math.random() * 3 + 2,
                    color: color,
                    life: 25
                });
            }
        }

        function createSmokeParticles(x, y, count) {
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: x, y: y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3 - 1,
                    radius: Math.random() * 6 + 4,
                    color: 'rgba(226, 232, 240, 0.6)',
                    life: 35
                });
            }
        }

        function updateAndRenderParticles() {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                if (p.life <= 0) particles.splice(i, 1);
            }
        }

        function updateAndRenderPopups() {
            for (let i = scorePopups.length - 1; i >= 0; i--) {
                const pop = scorePopups[i];
                pop.y -= 1.1;
                pop.life--;
                pop.alpha = pop.life / 55;

                ctx.font = 'bold 18px "Fredoka One", cursive';
                ctx.fillStyle = `rgba(234, 88, 12, ${pop.alpha})`;
                ctx.strokeStyle = `rgba(255, 255, 255, ${pop.alpha})`;
                ctx.lineWidth = 2.5;
                ctx.strokeText(pop.text, pop.x, pop.y);
                ctx.fillText(pop.text, pop.x, pop.y);

                if (pop.life <= 0) scorePopups.splice(i, 1);
            }
        }

        function updateCatQueueUI() {
            const crew = activeCatData ? [activeCatData, ...activeCatsQueue] : activeCatsQueue;
            const queueEl = document.getElementById('cat-queue'); queueEl.innerHTML='';
            crew.forEach(cat => { const badge=document.createElement('div'); badge.className='cat-badge'; badge.style.background=cat.color; badge.textContent=({TABBY:'🐱',NINJA:'⚡',BOMB:'💣',SPLIT:'🐾'})[cat.type]; badge.title=cat.name; queueEl.appendChild(badge); });
        }

        function showAbilityPrompt(text) {
            const prompt = document.getElementById('ability-prompt');
            document.getElementById('ability-text').innerText = text;
            prompt.classList.remove('opacity-0');
        }

        function hideAbilityPrompt() {
            document.getElementById('ability-prompt').classList.add('opacity-0');
        }

        function buildLevelSelectGrid() {
            const grid=document.getElementById('levels-grid'); grid.innerHTML='';
            for(let n=1;n<=100;n++) {
                const btn=document.createElement('button'), unlocked=n<=playerProgress.unlocked, stars=playerProgress.stars[n] || 0;
                btn.className='btn-level'+(unlocked?' unlocked':'');btn.disabled=!unlocked;
                btn.setAttribute('aria-label',`Level ${n}, ${unlocked ? stars+' stars' : 'locked'}`);
                btn.innerHTML=`<div>${unlocked?n:'▣'}</div><div class="level-stars">${unlocked ? [1,2,3].map(i=>`<span class="${i<=stars?'earned':''}">★</span>`).join('') : n}</div>`;
                btn.onclick=()=>startLevel(n-1);grid.appendChild(btn);
            }
            document.getElementById('total-stars').textContent=Object.values(playerProgress.stars).reduce((a,b)=>a+b,0);
        }

        function setupUI() {
            document.getElementById('btn-pause').onclick=pauseGame;
            document.getElementById('btn-resume').onclick=()=>{setPaused(false);document.getElementById('modal-overlay').classList.add('hidden');};
            document.getElementById('pause-levels').onclick=()=>document.getElementById('btn-menu').click();
            document.getElementById('levels-home').onclick=()=>{gameActive=false;setPaused(true);showCard('card-hero-play');};
            document.getElementById('home-sound').onclick=()=>{document.getElementById('btn-sound').click();document.getElementById('home-sound').textContent=audio.muted?'♫̸ Sound off':'♪ Sound on';};
            document.getElementById('home-sound').textContent=audio.muted?'♫̸ Sound off':'♪ Sound on';
            const heroStartBtn = document.getElementById('btn-hero-start');
            if (heroStartBtn) {
                heroStartBtn.onclick = () => {
                    audio.init();
                    const playIdx = Math.min(playerProgress.unlocked - 1, 99);
                    startLevel(playIdx);
                };
            }

            const heroSelectBtn = document.getElementById('btn-hero-select');
            if (heroSelectBtn) {
                heroSelectBtn.onclick = () => {
                    document.getElementById('card-hero-play').classList.add('hidden');
                    document.getElementById('card-levels').classList.remove('hidden');
                };
            }

            document.getElementById('btn-main-play').onclick = () => {
                audio.init();
                const playIdx = Math.min(playerProgress.unlocked - 1, 99);
                startLevel(playIdx);
            };

            document.getElementById('btn-reset-progress').onclick = () => {
                if (!confirm('Reset all stars, scores and unlocked levels?')) return;
                playerProgress = { unlocked: 1, stars: {}, best: {} };
                saveProgress();
                buildLevelSelectGrid();
            };

            document.getElementById('btn-zoom-in').onclick = () => {
                audio.init();
                zoomCamera(1.22);
            };

            document.getElementById('btn-zoom-out').onclick = () => {
                audio.init();
                zoomCamera(0.82);
            };

            document.getElementById('btn-camera-reset').onclick = () => {
                audio.init();
                resetCameraView();
            };

            const soundBtn = document.getElementById('btn-sound');
            soundBtn.onclick = () => {
                audio.init();
                audio.muted = !audio.muted;
                try { localStorage.setItem('angry_cats_muted', String(audio.muted)); } catch(e) {}
                if (audio.muted) {
                    audio.stopBGM();
                    soundBtn.textContent = '♫̸';
                } else {
                    audio.startBGM();
                    soundBtn.textContent = '♪';
                }
            };

            document.getElementById('btn-restart').onclick = () => {
                resetCameraView();
                startLevel(currentLevelIndex);
            };

            document.getElementById('btn-menu').onclick = () => {
                clearTurns(); setPaused(true); showCard('card-levels');
                gameActive = false;
                document.getElementById('modal-overlay').classList.remove('hidden');
                document.getElementById('card-hero-play').classList.add('hidden');
                document.getElementById('card-levels').classList.remove('hidden');
                document.getElementById('card-result').classList.add('hidden');
            };

            document.getElementById('btn-result-menu').onclick = () => document.getElementById('btn-menu').click();
            document.getElementById('btn-result-retry').onclick = () => {
                resetCameraView();
                startLevel(currentLevelIndex);
            };
            document.getElementById('btn-result-next').onclick = () => {
                resetCameraView();
                const nextIdx = Math.min(currentLevelIndex + 1, 99);
                startLevel(nextIdx);
            };
        }
