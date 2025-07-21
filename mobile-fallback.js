// Mobile Fallback Script for Sahasam Game
// This script provides fallback solutions for mobile devices when assets fail to load

// Mobile-specific asset management
class MobileFallbackManager {
    constructor() {
        this.fallbackAssets = new Map();
        this.loadedAssets = new Set();
        this.failedAssets = new Set();
        this.isMobile = this.detectMobile();
        this.init();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    init() {
        // Create fallback textures for critical game assets
        this.createFallbackTextures();
        
        // Override Phaser's load error handling
        this.setupLoadErrorHandling();
        
        // Optimize for mobile performance
        if (this.isMobile) {
            this.optimizeForMobile();
        }
    }

    createFallbackTextures() {
        // Create a simple colored rectangle for player character
        this.createColorTexture('player_fallback', 48, 68, '#0066ff');
        this.createColorTexture('npc_fallback', 80, 140, '#ff6600');
        this.createColorTexture('action_button_fallback', 100, 100, '#ffdd00');
        this.createColorTexture('door_fallback', 400, 400, '#8b4513');
        this.createColorTexture('goal_fallback', 200, 200, '#ffd700');
        
        // Create a simple tilemap background
        this.createTilemapBackground();
    }

    createColorTexture(key, width, height, color) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Create gradient for better visual appeal
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.3));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add border
        ctx.strokeStyle = this.darkenColor(color, 0.5);
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);
        
        this.fallbackAssets.set(key, canvas.toDataURL());
    }

    createTilemapBackground() {
        const canvas = document.createElement('canvas');
        canvas.width = 3000;
        canvas.height = 3000;
        const ctx = canvas.getContext('2d');
        
        // Create a simple grass-like pattern
        const tileSize = 32;
        for (let y = 0; y < 3000; y += tileSize) {
            for (let x = 0; x < 3000; x += tileSize) {
                // Alternate between different shades of green
                const shade = (x / tileSize + y / tileSize) % 2;
                ctx.fillStyle = shade ? '#228B22' : '#32CD32';
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
        
        this.fallbackAssets.set('map_background_fallback', canvas.toDataURL());
    }

    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return '#' + 
            Math.floor(r * (1 - factor)).toString(16).padStart(2, '0') +
            Math.floor(g * (1 - factor)).toString(16).padStart(2, '0') +
            Math.floor(b * (1 - factor)).toString(16).padStart(2, '0');
    }

    setupLoadErrorHandling() {
        // Override XMLHttpRequest to catch asset loading errors
        const originalOpen = XMLHttpRequest.prototype.open;
        const manager = this;
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this.addEventListener('error', function() {
                manager.handleAssetLoadError(url);
            });
            
            this.addEventListener('load', function() {
                if (this.status >= 400) {
                    manager.handleAssetLoadError(url);
                }
            });
            
            return originalOpen.call(this, method, url, ...args);
        };
    }

    handleAssetLoadError(url) {
        console.warn('Asset failed to load:', url);
        this.failedAssets.add(url);
        
        // Try to provide fallback
        const filename = url.split('/').pop();
        const assetKey = filename.split('.')[0];
        
        // Trigger fallback loading
        this.loadFallbackAsset(assetKey);
    }

    loadFallbackAsset(key) {
        if (this.fallbackAssets.has(key + '_fallback')) {
            console.log('Loading fallback for:', key);
            // The fallback will be handled by the game code
            return true;
        }
        return false;
    }

    optimizeForMobile() {
        // Disable particle effects and heavy animations
        window.MOBILE_OPTIMIZATIONS = {
            disableParticles: true,
            reducedAnimations: true,
            lowerQualityAudio: true,
            simpleTextures: true
        };
        
        // Reduce memory usage
        this.optimizeMemoryUsage();
        
        // Touch-friendly controls
        this.setupTouchOptimizations();
    }

    optimizeMemoryUsage() {
        // Force garbage collection more frequently on mobile
        if (this.isMobile) {
            setInterval(() => {
                if (window.gc) {
                    window.gc();
                }
            }, 30000);
        }
    }

    setupTouchOptimizations() {
        // Prevent zoom on double tap
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    }

    // Method to check if an asset needs fallback
    needsFallback(key) {
        return this.failedAssets.has(key) || this.fallbackAssets.has(key + '_fallback');
    }

    // Get fallback asset data URL
    getFallbackAsset(key) {
        return this.fallbackAssets.get(key + '_fallback') || this.fallbackAssets.get('player_fallback');
    }
}

// Initialize mobile fallback manager
window.mobileFallbackManager = new MobileFallbackManager();

// Phaser-specific fallback extensions
window.PhaserMobileFallbacks = {
    // Create fallback texture in Phaser scene
    createFallbackTexture: function(scene, key, width, height, color) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(parseInt(color.replace('#', '0x')));
        graphics.fillRect(0, 0, width, height);
        graphics.lineStyle(2, parseInt(color.replace('#', '0x')) - 0x222222);
        graphics.strokeRect(0, 0, width, height);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
        return key;
    },
    
    // Handle sprite creation with fallback
    createSpriteWithFallback: function(scene, x, y, key) {
        try {
            return scene.add.sprite(x, y, key);
        } catch (error) {
            console.warn('Failed to create sprite with key:', key, 'using fallback');
            // Create fallback texture
            const fallbackKey = this.createFallbackTexture(scene, key + '_fallback', 48, 68, '#0066ff');
            return scene.add.sprite(x, y, fallbackKey);
        }
    },
    
    // Handle audio with mobile restrictions
    playAudioWithFallback: function(scene, key, config = {}) {
        try {
            if (scene.sound.get(key)) {
                return scene.sound.play(key, config);
            } else {
                console.warn('Audio not available:', key);
                return null;
            }
        } catch (error) {
            console.warn('Audio playback failed:', error);
            return null;
        }
    }
};

// Performance monitoring for mobile
window.MobilePerformanceMonitor = {
    fps: 60,
    lastTime: performance.now(),
    frameCount: 0,
    
    init: function() {
        this.monitor();
    },
    
    monitor: function() {
        const now = performance.now();
        this.frameCount++;
        
        if (now >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
            
            // Adjust quality based on performance
            if (this.fps < 30 && window.mobileFallbackManager.isMobile) {
                this.reduceQuality();
            }
        }
        
        requestAnimationFrame(() => this.monitor());
    },
    
    reduceQuality: function() {
        // Signal to reduce quality
        window.MOBILE_OPTIMIZATIONS = window.MOBILE_OPTIMIZATIONS || {};
        window.MOBILE_OPTIMIZATIONS.lowPerformanceMode = true;
        console.log('Low performance detected, reducing quality');
    }
};

// Initialize performance monitoring for mobile devices
if (window.mobileFallbackManager.isMobile) {
    window.MobilePerformanceMonitor.init();
}

// Console log for debugging
console.log('Mobile Fallback Manager initialized');
console.log('Device is mobile:', window.mobileFallbackManager.isMobile);
console.log('Mobile optimizations enabled:', !!window.MOBILE_OPTIMIZATIONS);