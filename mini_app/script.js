// Оновлений JavaScript для Mini App з API інтеграцією

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
            totalPoints: 0
        };
        this.apiBase = window.location.origin + '/api';
        this.watchId = null;

        this.init();
    }

    init() {
        // Ініціалізація Telegram Mini App
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.setupTheme();
        }

        // Налаштування обробників подій
        this.setupEventListeners();

        // Завантаження даних користувача з API
        this.loadUserData();

        console.log('🚀 Fitness App ініціалізовано з API інтеграцією');
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
            console.error(`API request failed: ${error}`);
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
        document.getElementById('start-tracking')?.addEventListener('click', () => {
            this.startTracking();
        });

        document.getElementById('stop-tracking')?.addEventListener('click', () => {
            this.stopTracking();
        });

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

        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        document.getElementById(tabName)?.classList.add('active');

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
            const stats = await this.apiRequest('/user/stats');
            this.userStats = {
                totalDistance: stats.total_distance,
                totalSteps: stats.total_steps,
                currentRank: stats.rank_level,
                totalPoints: stats.total_points,
                rankPosition: stats.rank_position
            };

            this.updateStatsDisplay();
        } catch (error) {
            console.error('Помилка завантаження даних користувача:', error);
            this.showNotification('Помилка', 'Не вдалося завантажити дані користувача');
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
            const rankings = await this.apiRequest('/leaderboard?limit=10');

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
            console.error('Помилка завантаження рейтингу:', error);
            leaderboard.innerHTML = '<p>Помилка завантаження рейтингу</p>';
        }
    }

    async loadCompetitions() {
        try {
            const competitions = await this.apiRequest('/competitions');

            // Оновлення інформації про активні змагання
            if (competitions.length > 0) {
                console.log(`Завантажено ${competitions.length} змагань`);
            }

        } catch (error) {
            console.error('Помилка завантаження змагань:', error);
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
            console.error('Помилка завантаження рейтингу:', error);
        }
    }

    startTracking() {
        this.isTracking = true;
        document.getElementById('start-tracking').disabled = true;
        document.getElementById('stop-tracking').disabled = false;

        // Запит дозволу на геолокацію
        if (navigator.geolocation) {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    this.handleLocationUpdate(position);
                },
                (error) => {
                    console.error('Помилка геолокації:', error);
                    this.showNotification('Помилка', 'Не вдалося отримати доступ до геолокації');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }

        this.showNotification('Відстеження розпочато', '📍 GPS відстеження активовано!');
    }

    stopTracking() {
        this.isTracking = false;
        document.getElementById('start-tracking').disabled = false;
        document.getElementById('stop-tracking').disabled = true;

        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
        }

        this.showNotification('Відстеження зупинено', '⏹️ GPS відстеження деактивовано.');
    }

    async handleLocationUpdate(position) {
        const { latitude, longitude, speed, accuracy } = position.coords;

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
                    console.log(`✅ Збережено: ${response.distance_added.toFixed(2)} км`);
                }
            }

        } catch (error) {
            console.error('Помилка збереження локації:', error);
        }
    }

    async startCompetition(type) {
        try {
            // Тут можна створити змагання через API
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
            console.error('Помилка запуску змагання:', error);
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
            alert(`${title}: ${message}`);
        }
    }

    centerMapOnLocation() {
        if (navigator.geolocation && window.mapInstance) {
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