// Виправлений JavaScript з правильною детекцією мобільного

class FitnessApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentTab = 'home';
        this.isTracking = false;
        this.activeCompetition = null;
        this.userStats = {
            totalDistance: 0,
            totalSteps: 0,
            currentRank: 'bronze',
            totalPoints: 0,
            rankPosition: 1
        };
        this.apiBase = window.location.origin + '/api';
        this.watchId = null;
        this.isMobile = this.detectMobile();

        this.init();
    }

    detectMobile() {
        // Покращена детекція мобільного пристрою

        // 1. Якщо це Telegram Mini App - то це мобільний
        if (this.tg && this.tg.platform) {
            console.log(`📱 Telegram platform: ${this.tg.platform}`);
            return true; // Telegram Mini App завжди мобільний
        }

        // 2. Перевірка наявності touch events
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // 3. Перевірка розміру екрану
        const smallScreen = window.innerWidth <= 768;

        // 4. Перевірка User Agent на мобільні ключові слова
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'mobile', 'android', 'iphone', 'ipad', 'ipod', 
            'blackberry', 'windows phone', 'webos'
        ];
        const hasMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));

        // 5. Перевірка orientation API (є тільки на мобільних)
        const hasOrientation = 'orientation' in window;

        // Логіка: якщо хоча б 2 з критеріїв true - це мобільний
        const mobileScore = [hasTouch, smallScreen, hasMobileUA, hasOrientation].filter(Boolean).length;
        const isMobile = mobileScore >= 2;

        console.log(`🔍 Mobile detection:`, {
            hasTouch, smallScreen, hasMobileUA, hasOrientation,
            mobileScore, isMobile,
            userAgent: userAgent.substring(0, 100)
        });

        return isMobile;
    }

    init() {
        // Ініціалізація Telegram Mini App
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.setupTheme();

            console.log('📱 Telegram Mini App ініціалізовано');
            console.log('📊 Platform info:', {
                platform: this.tg.platform,
                version: this.tg.version,
                isMobile: this.isMobile
            });
        } else {
            console.log('💻 Запуск у веб-браузері (тестовий режим)');
        }

        // Налаштування обробників подій
        this.setupEventListeners();

        // Завантаження даних користувача з API
        this.loadUserData();

        // Показуємо повідомлення тільки для справжнього десктопу
        if (!this.isMobile && !this.tg) {
            this.showDesktopInfo();
        }

        console.log('🚀 Fitness App ініціалізовано з API інтеграцією');
    }

    showDesktopInfo() {
        // Показуємо інформацію про обмеження десктопної версії (тільки для браузера)
        setTimeout(() => {
            const infoElement = document.createElement('div');
            infoElement.style.cssText = `
                position: fixed;
                top: 60px;
                left: 20px;
                right: 20px;
                background: #ff6b35;
                color: white;
                padding: 12px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 1000;
                text-align: center;
            `;
            infoElement.innerHTML = `
                💻 Браузерна версія: GPS може бути недоступний.<br>
                📱 Використовуйте Telegram на мобільному для повного функціоналу!
            `;
            document.body.appendChild(infoElement);

            // Прибираємо через 5 секунд
            setTimeout(() => {
                if (document.body.contains(infoElement)) {
                    document.body.removeChild(infoElement);
                }
            }, 5000);
        }, 1000);
    }

    setupTheme() {
        const root = document.documentElement;

        if (this.tg?.themeParams) {
            root.style.setProperty('--tg-theme-bg-color', this.tg.themeParams.bg_color || '#ffffff');
            root.style.setProperty('--tg-theme-text-color', this.tg.themeParams.text_color || '#000000');
            root.style.setProperty('--tg-theme-button-color', this.tg.themeParams.button_color || '#0088cc');
        }
    }

    getAuthHeaders() {
        // Отримуємо initData для автентифікації
        const initData = this.tg?.initData || '';
        return {
            'Authorization': `tma ${initData}`,
            'Content-Type': 'application/json'
        };
    }

    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`❌ API request failed: ${error}`);
            throw error;
        }
    }

    setupEventListeners() {
        // Навігація по вкладках
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Кнопки відстеження
        const startBtn = document.getElementById('start-tracking');
        const stopBtn = document.getElementById('stop-tracking');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTracking());
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopTracking());
        }

        // Фільтри рейтингу
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterRankings(e.target.dataset.filter);
            });
        });

        // Кнопки карти
        document.getElementById('center-location')?.addEventListener('click', () => {
            this.centerMapOnLocation();
        });

        document.getElementById('show-route')?.addEventListener('click', () => {
            this.showRoute();
        });
    }

    switchTab(tabName) {
        // Зміна активної вкладки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContent = document.getElementById(tabName);

        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');

        this.currentTab = tabName;

        // Завантаження даних залежно від вкладки
        if (tabName === 'rankings') {
            this.loadRankings();
        } else if (tabName === 'competitions') {
            this.loadCompetitions();
        } else if (tabName === 'map') {
            setTimeout(() => {
                if (window.mapInstance) {
                    window.mapInstance.invalidateSize();
                }
            }, 100);
        }
    }

    async loadUserData() {
        try {
            console.log('📊 Завантаження статистики користувача...');
            const stats = await this.apiRequest('/user/stats');

            this.userStats = {
                totalDistance: stats.total_distance || 0,
                totalSteps: stats.total_steps || 0,
                currentRank: stats.rank_level || 'bronze',
                totalPoints: stats.total_points || 0,
                rankPosition: stats.rank_position || 1
            };

            this.updateStatsDisplay();
            console.log('✅ Статистику користувача завантажено:', this.userStats);

        } catch (error) {
            console.error('❌ Помилка завантаження даних користувача:', error);

            // Показуємо дефолтні значення при помилці
            this.userStats = {
                totalDistance: 0,
                totalSteps: 0,
                currentRank: 'bronze',
                totalPoints: 0,
                rankPosition: 1
            };
            this.updateStatsDisplay();

            this.showNotification('Увага', 'Не вдалося завантажити дані. Перевірте підключення до інтернету.');
        }
    }

    updateStatsDisplay() {
        const elements = {
            'total-distance': `${this.userStats.totalDistance.toFixed(1)} км`,
            'total-steps': this.userStats.totalSteps.toLocaleString(),
            'total-points': this.userStats.totalPoints.toLocaleString()
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        const rankEmojis = {
            bronze: '🥉',
            silver: '🥈', 
            gold: '🥇',
            platinum: '💎',
            diamond: '👑'
        };

        const rankElement = document.getElementById('current-rank');
        if (rankElement) {
            rankElement.textContent = rankEmojis[this.userStats.currentRank] || '🥉';
        }

        // Оновлення позиції в рейтингу
        const positionElements = document.querySelectorAll('.rank-position');
        positionElements.forEach(el => {
            if (this.userStats.rankPosition) {
                el.textContent = `#${this.userStats.rankPosition}`;
            }
        });
    }

    async loadRankings() {
        const leaderboard = document.getElementById('leaderboard');
        if (!leaderboard) return;

        try {
            console.log('🏆 Завантаження рейтингу...');
            const rankings = await this.apiRequest('/leaderboard?limit=10');

            if (rankings.length === 0) {
                leaderboard.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <p>🏆 Рейтинг поки що порожній</p>
                        <p>Почніть відстежувати активність, щоб з'явитися тут!</p>
                    </div>
                `;
                return;
            }

            leaderboard.innerHTML = rankings.map(leader => `
                <div class="leader-item">
                    <div class="leader-rank">#${leader.rank}</div>
                    <div class="leader-info">
                        <div class="leader-name">${leader.name}</div>
                        <div class="leader-details">${leader.level} Активний гравець</div>
                    </div>
                    <div class="leader-points">${leader.points} очок</div>
                </div>
            `).join('');

            console.log(`✅ Завантажено ${rankings.length} записів рейтингу`);

        } catch (error) {
            console.error('❌ Помилка завантаження рейтингу:', error);
            leaderboard.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p>❌ Помилка завантаження рейтингу</p>
                    <p>Спробуйте перезавантажити сторінку</p>
                </div>
            `;
        }
    }

    async loadCompetitions() {
        try {
            console.log('🏆 Завантаження змагань...');
            const competitions = await this.apiRequest('/competitions');

            if (competitions.length > 0) {
                console.log(`✅ Завантажено ${competitions.length} змагань`);
            } else {
                console.log('📋 Активних змагань не знайдено');
            }

        } catch (error) {
            console.error('❌ Помилка завантаження змагань:', error);
        }
    }

    filterRankings(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Завантаження рейтингу з фільтром
        const groupId = filter === 'group' ? this.tg?.initDataUnsafe?.chat?.id : null;
        this.loadRankingsWithFilter(groupId);
    }

    async loadRankingsWithFilter(groupId = null) {
        const leaderboard = document.getElementById('leaderboard');
        if (!leaderboard) return;

        try {
            const endpoint = groupId ? `/leaderboard?group_id=${groupId}&limit=10` : '/leaderboard?limit=10';
            const rankings = await this.apiRequest(endpoint);

            if (rankings.length === 0) {
                leaderboard.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <p>🏆 ${groupId ? 'Груповий рейтинг' : 'Рейтинг'} порожній</p>
                        <p>Почніть відстежувати активність!</p>
                    </div>
                `;
                return;
            }

            leaderboard.innerHTML = rankings.map(leader => `
                <div class="leader-item">
                    <div class="leader-rank">#${leader.rank}</div>
                    <div class="leader-info">
                        <div class="leader-name">${leader.name}</div>
                        <div class="leader-details">${leader.level} Активний гравець</div>
                    </div>
                    <div class="leader-points">${leader.points} очок</div>
                </div>
            `).join('');

        } catch (error) {
            console.error('❌ Помилка завантаження рейтингу:', error);
            leaderboard.innerHTML = '<p>❌ Помилка завантаження</p>';
        }
    }

    startTracking() {
        // Перевірка доступності геолокації
        if (!navigator.geolocation) {
            this.showNotification('Помилка', 'Ваш пристрій не підтримує геолокацію');
            return;
        }

        this.isTracking = true;
        const startBtn = document.getElementById('start-tracking');
        const stopBtn = document.getElementById('stop-tracking');

        if (startBtn) startBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;

        // Запит дозволу на геолокацію
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.handleLocationUpdate(position);
            },
            (error) => {
                console.error('❌ Помилка геолокації:', error);
                let errorMessage = 'Не вдалося отримати доступ до геолокації';

                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Дозвіл на геолокацію відхилено. Увімкніть у налаштуваннях.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Геолокація недоступна на цьому пристрої.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Тайм-аут запиту геолокації.';
                        break;
                }

                this.showNotification('Помилка геолокації', errorMessage);
                this.stopTracking();
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000
            }
        );

        this.showNotification('GPS активовано', '📍 Відстеження розпочато!');
    }

    stopTracking() {
        this.isTracking = false;
        const startBtn = document.getElementById('start-tracking');
        const stopBtn = document.getElementById('stop-tracking');

        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;

        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        this.showNotification('GPS зупинено', '⏹️ Відстеження деактивовано');
    }

    async handleLocationUpdate(position) {
        const { latitude, longitude, speed, accuracy } = position.coords;

        console.log(`📍 GPS оновлення: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, точність: ${accuracy?.toFixed(0)}м`);

        // Оновлення карти
        if (window.updateMapLocation) {
            window.updateMapLocation(latitude, longitude);
        }

        // Оновлення швидкості в UI
        const speedKmh = speed ? (speed * 3.6).toFixed(1) : '0';
        const speedElement = document.getElementById('current-speed');
        if (speedElement) {
            speedElement.textContent = `${speedKmh} км/год`;
        }

        // Відправка локації до API
        try {
            const locationData = {
                latitude,
                longitude,
                timestamp: Date.now(),
                accuracy
            };

            const response = await this.apiRequest('/location', {
                method: 'POST',
                body: JSON.stringify(locationData)
            });

            if (response.success) {
                // Оновлюємо статистику
                await this.loadUserData();

                // Показуємо повідомлення про збережену відстань
                if (response.distance_added > 0) {
                    console.log(`✅ Збережено: +${response.distance_added} км`);
                }
            }

        } catch (error) {
            console.error('❌ Помилка збереження локації:', error);
        }
    }

    async startCompetition(type) {
        try {
            this.activeCompetition = {
                type: type,
                startTime: Date.now(),
                duration: type === 'sprint' ? 30 : 90 // хвилин
            };

            const activeCompElement = document.getElementById('active-competition');
            const compTypeElement = document.getElementById('comp-type');
            const compPositionElement = document.getElementById('comp-position');

            if (activeCompElement) {
                activeCompElement.style.display = 'block';
            }
            if (compTypeElement) {
                compTypeElement.textContent = type === 'sprint' ? 'Sprint забіг ⚡' : 'Endurance забіг 🏃‍♂️';
            }
            if (compPositionElement) {
                compPositionElement.textContent = '1-е місце';
            }

            this.startCompetitionTimer();
            this.showNotification('Змагання розпочато!', `🏆 ${type === 'sprint' ? 'Sprint' : 'Endurance'} забіг активовано!`);

        } catch (error) {
            console.error('❌ Помилка запуску змагання:', error);
            this.showNotification('Помилка', 'Не вдалося розпочати змагання');
        }
    }

    startCompetitionTimer() {
        if (!this.activeCompetition) return;

        this.competitionInterval = setInterval(() => {
            const elapsed = Date.now() - this.activeCompetition.startTime;
            const remaining = (this.activeCompetition.duration * 60 * 1000) - elapsed;

            if (remaining <= 0) {
                this.finishCompetition();
                return;
            }

            const minutes = Math.floor(remaining / (60 * 1000));
            const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

            const timerElement = document.getElementById('comp-timer');
            if (timerElement) {
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    finishCompetition() {
        if (this.competitionInterval) {
            clearInterval(this.competitionInterval);
        }

        const activeCompElement = document.getElementById('active-competition');
        if (activeCompElement) {
            activeCompElement.style.display = 'none';
        }
        this.activeCompetition = null;

        this.showNotification('Змагання завершено!', '🎉 Вітаємо! Ви завершили змагання.');
    }

    showNotification(title, message) {
        console.log(`📢 ${title}: ${message}`);

        // Використання Telegram haptic feedback
        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.notificationOccurred('success');
        }

        // Показ повідомлення через Telegram
        if (this.tg?.showPopup) {
            this.tg.showPopup({
                title: title,
                message: message
            });
        } else {
            // Fallback для веб-браузера
            alert(`${title}: ${message}`);
        }
    }

    centerMapOnLocation() {
        if (!navigator.geolocation) {
            this.showNotification('Увага', 'Геолокація недоступна на цьому пристрої');
            return;
        }

        if (window.mapInstance) {
            navigator.geolocation.getCurrentPosition((position) => {
                window.mapInstance.setView([position.coords.latitude, position.coords.longitude], 16);
            });
        }
    }

    showRoute() {
        this.showNotification('Маршрут', '🛣️ Функція відображення маршруту активна');
    }
}

// Ініціалізація додатку
document.addEventListener('DOMContentLoaded', () => {
    window.fitnessApp = new FitnessApp();
});

// Глобальні функції
window.startCompetition = (type) => {
    if (window.fitnessApp) {
        window.fitnessApp.startCompetition(type);
    }
};