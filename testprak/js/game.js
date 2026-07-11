// ==========================================
// ОСНОВНАЯ ИГРА (game.js) - ИДЕАЛЬНЫЙ HTML UI
// ==========================================

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        // --- КАРТИНКИ ---
        this.load.html('phoneUI', 'phone.html');
        this.load.image('fon', 'assets/images/fon.png');
        this.load.image('network_map', 'assets/images/network_map.png');
        this.load.image('blue2', 'assets/images/blue2.png');
        this.load.image('blue', 'assets/images/blue.png');
        this.load.image('orange', 'assets/images/orange.png');
        this.load.image('orange2', 'assets/images/orange2.png');
        this.load.image('brown', 'assets/images/brown.png');
        this.load.image('brown2', 'assets/images/brown2.png');
        this.load.image('green', 'assets/images/green.png');
        this.load.image('green2', 'assets/images/green2.png');
        this.load.image('stol', 'assets/images/cafetery.png');
        this.load.image('barmen', 'assets/images/barmen.png');
        this.load.image('bg_loading', 'assets/images/zagruz.png');
        this.load.image('btn_start', 'assets/images/button-start.png');
        this.load.image('title_img', 'assets/images/hroniki.png');

        // === ИСПРАВЛЕНИЕ: ДОБАВЛЕНЫ ИКОНКИ РАБОЧЕГО СТОЛА ===
        this.load.image('spravochnik', 'assets/images/spravochnik.png');
        this.load.image('shemaseti', 'assets/images/shemaseti.png');
        // =====================================================

        // --- АВАТАРКИ ПЕРСОНАЖЕЙ ---
        this.load.image('ava_director', 'assets/images/director.png');
        this.load.image('ava_buhgalter', 'assets/images/buhgalter.png');
        this.load.image('ava_magistr', 'assets/images/magistr.png');
        this.load.image('ava_jora', 'assets/images/jora.png');

        // --- ЗВУКИ ---
        this.load.audio('clickIce', 'assets/sounds/click_icecream.wav');
        this.load.audio('unclickIce', 'assets/sounds/Close_Click_icecream.wav');
        this.load.audio('dzin', 'assets/sounds/dzin.mp3');
        this.load.audio('openClick', 'assets/sounds/Open_Click_1.wav');
        this.load.audio('closeClick', 'assets/sounds/Close_Click_1.wav');
        this.load.audio('popMsg', 'assets/sounds/pop_mesg.wav');
        this.load.audio('keyTap', 'assets/sounds/keyboard-tap.wav');
        this.load.audio('mumble', 'assets/sounds/mumble-male.mp3');

        // --- ФОНОВАЯ МУЗЫКА ---
        this.load.audio('bgm', 'assets/sounds/track-back.mp3');
    }

    create() {
        // Запускаем нашу новую сцену вместо IntroScene
        this.scene.start('LoadingScene');
        this.scene.launch('UIScene');
    }
}

class LoadingScene extends Phaser.Scene {
    constructor() { super('LoadingScene'); }

    create() {
        // 1. Команда fadeIn делает плавное появление из черного экрана. 
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // 2. Добавляем фон экрана загрузки
        this.add.image(640, 360, 'bg_loading').setDisplaySize(1280, 720);

        // === ДОБАВЛЯЕМ ЗАГОЛОВОК И СВЕЧЕНИЕ ===
        // Создаем "ауру" свечения под заголовком
        // === ДОБАВЛЯЕМ ЗАГОЛОВОК И ТЕНЬ ===
        // === НАСТРОЙКИ ===
        let titleScale = 0.3;

        // 1. ПУЛЬСИРУЮЩАЯ ТЕНЬ (самый нижний слой)
        // Она будет немного "дышать" за текстом
        let titleGlow = this.add.image(640, 200, 'title_img')
            .setTint(0x000000)
            .setAlpha(0.5)
            .setScale(titleScale);

        // 2. СТАТИЧНАЯ ОБВОДКА
        // Делаем её чуть-чуть больше основного текста (например, на 0.02)
        // И окрашиваем в черный цвет для контраста
        let titleOutline = this.add.image(640, 200, 'title_img')
            .setTint(0x000000)
            .setScale(titleScale + 0.002);

        // 3. ОСНОВНОЙ ТЕКСТ (верхний слой)
        let title = this.add.image(640, 200, 'title_img')
            .setScale(titleScale);

        // Анимация пульсации только для тени (она будет выходить из-под обводки)
        this.tweens.add({
            targets: titleGlow,
            scale: titleScale + 0.008, // Пульсирует чуть сильнее, чем статичная обводка
            alpha: 0.2,               // Растворяется до полупрозрачности
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        // =====================================

        // 3. Добавляем кнопку (чуть ниже заголовка)
        let startBtn = this.add.image(640, 550, 'btn_start')
            .setInteractive({ useHandCursor: true })
            .setScale(0.13);

        // Плавная анимация при наведении (Tween)
        startBtn.on('pointerover', () => {
            this.tweens.add({ targets: startBtn, scale: 0.14, duration: 150, ease: 'Power2' });
        });

        // Плавное возвращение обратно, когда убираем мышь
        startBtn.on('pointerout', () => {
            this.tweens.add({ targets: startBtn, scale: 0.13, duration: 150, ease: 'Power2' });
        });

        // 4. Логика перехода при клике
        startBtn.on('pointerdown', () => {
            this.sound.play('openClick'); // Звук клика

            // Отключаем кнопку, чтобы игрок не прокликал её дважды во время анимации
            startBtn.disableInteractive();

            // Запускаем плавное затухание экрана (в черный)
            this.cameras.main.fadeOut(1000, 0, 0, 0);

            // Слушатель события: ждем, когда анимация затухания полностью завершится
            this.cameras.main.once('camerafadeoutcomplete', () => {
                // Убиваем эту сцену и стартуем сцену с мороженым
                this.scene.start('IntroScene');
            });
        });
    }
}

class UIScene extends Phaser.Scene {
    constructor() { super('UIScene'); }
    create() {
        this.bgm = this.sound.add('bgm', { loop: true, volume: 0.3 });
        this.sound.volume = 0.5;

        window.addEventListener('click', () => {
            if (!this.bgm.isPlaying) {
                this.bgm.play();
            }
        }, { once: true });

        const sliderX = 1120;
        const sliderY = 30;
        const sliderWidth = 120;

        this.add.text(sliderX - 35, sliderY - 12, '🔊', { font: '20px Arial' });

        let track = this.add.rectangle(sliderX, sliderY, sliderWidth, 6, 0x555555).setOrigin(0, 0.5);
        let fill = this.add.rectangle(sliderX, sliderY, sliderWidth * 0.5, 6, 0x4fc3f7).setOrigin(0, 0.5);

        let knob = this.add.circle(sliderX + sliderWidth * 0.5, sliderY, 10, 0xffffff).setInteractive({ useHandCursor: true });
        this.input.setDraggable(knob);

        knob.on('pointerover', () => knob.setScale(1.2));
        knob.on('pointerout', () => knob.setScale(1));

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject !== knob) return;
            let newX = Phaser.Math.Clamp(dragX, sliderX, sliderX + sliderWidth);
            knob.x = newX;
            let percent = (newX - sliderX) / sliderWidth;
            fill.width = sliderWidth * percent;
            this.sound.volume = percent;
        });
    }
}

class IntroScene extends Phaser.Scene {
    constructor() { super('IntroScene'); }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.add.image(640, 360, 'stol').setDisplaySize(1280, 720);
        // === ДОБАВЛЯЕМ БАРМЕНА ЗА СТОЙКУ ===
        let maskShape = this.make.graphics();
        maskShape.fillRect(0, 0, 1280, 518);
        let barmenMask = maskShape.createGeometryMask();

        this.barmen = this.add.image(250, 525, 'barmen').setDepth(1).setScale(0.4);

        // --- РАБОТА СО СВЕТОМ ---
        // Накладываем теплый золотисто-оранжевый оттенок, имитируя свет из окна
        this.barmen.setTint(0xffdfb3);

        // Если на оригинальной картинке свет падает с другой стороны, 
        // раскомментируй строку ниже, чтобы развернуть бармена лицом к свету:
        // this.barmen.setFlipX(true); 

        // Надеваем маску
        this.barmen.setMask(barmenMask);

        // --- НОВОЕ ДЫХАНИЕ (под масштаб 0.4) ---
        this.tweens.add({
            targets: this.barmen,
            scaleY: 0.404,  // Очень мягкое растяжение (отталкиваемся от базовых 0.4)
            y: 523,         // Приподнимается всего на 2 пикселя (от 525)
            duration: 2500, // Медленный, спокойный вдох
            yoyo: true,     // Плавный возврат
            repeat: -1,     // Бесконечно
            ease: 'Sine.easeInOut' // Смягчение в начале и конце
        });

        this.wires = [
            { id: 'wo', name: 'БО', texture: 'orange' },
            { id: 'o', name: 'О', texture: 'orange2' },
            { id: 'wg', name: 'БЗ', texture: 'green' },
            { id: 'b', name: 'С', texture: 'blue2' },
            { id: 'wb', name: 'БС', texture: 'blue' },
            { id: 'g', name: 'З', texture: 'green2' },
            { id: 'wbr', name: 'БК', texture: 'brown' },
            { id: 'br', name: 'К', texture: 'brown2' }
        ];

        this.solutionT568B = ['wo', 'o', 'wg', 'b', 'wb', 'g', 'wbr', 'br'];
        this.solutionT568A = ['wg', 'g', 'wo', 'b', 'wb', 'o', 'wbr', 'br'];

        this.score = GAME_CONFIG.SCORES.initialScore;
        this.mistakesCount = 0;
        this.playerSelection = [];
        this.interactiveItems = [];
        this.isLocked = false;

        this.scoreText = this.add.text(30, 30, 'Баллы: ' + this.score, { font: GAME_CONFIG.FONTS.large, fill: GAME_CONFIG.COLORS.yellow, fontStyle: 'bold' });
        const skipBtn = this.add.text(1250, 70, '[ ПРОПУСТИТЬ ТЕСТ ]', { font: '18px Arial', fill: '#dddddd' }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        skipBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainWorkspaceScene', { currentScore: this.score });
            });
        });
        this.add.text(640, 60, 'ПРОВЕРКА КВАЛИФИКАЦИИ', { font: '32px Arial', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
        this.add.text(640, 100, 'В какой последовательности ты бы попробовал представленное мороженное?', { font: '22px Arial', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);

        this.selectionText = this.add.text(640, 560, 'Ваш выбор: ', {
            fontFamily: 'Arial', fontSize: '24px', fontWeight: 'bold', fill: '#ffffff', stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4, true, true);

        this.statusText = this.add.text(640, 640, '', { font: '26px Arial', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5);

        this.createDialogUI();
        this.initTest();

        this.cameras.main.once('camerafadeincomplete', () => {
            // Как только сцена появилась, запускаем таймер на 2 секунды (2000 мс)
            this.time.delayedCall(2000, () => {
                this.showDialog('Бармен', [
                    'Привет! Добро пожаловать в наше кафе.',
                    'Админы обычно заказывают это мороженое.',
                    'В какой последовательности ты бы его попробовал?',
                    'Кликай по стаканчикам в правильном порядке!'
                ]);
            });
        });
    }

    // === 1. СОЗДАНИЕ ЧИСТОГО HTML ДИАЛОГА ===
    createDialogUI() {
        this.dialogOverlay = this.add.container(640, 360).setDepth(100).setVisible(false);
        this.isDialogClosing = false;

        this.dialogBg = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6).setInteractive();
        this.dialogBg.on('pointerdown', () => this.advanceDialog());
        this.dialogOverlay.add(this.dialogBg);

        let dialogHTML = `
        <div id="html-dialog-box" style="width: 460px; background: #17212b; border: 2px solid #2b5278; border-radius: 16px; box-shadow: 12px 12px 0px rgba(0,0,0,0.4); display: flex; flex-direction: column; align-items: center; position: relative; font-family: 'Segoe UI', Arial, sans-serif; box-sizing: border-box; padding: 25px 20px 45px 20px;">
            <div style="display: flex; align-items: center; width: 100%; margin-bottom: 20px;">
                <div id="html-dialog-avatar" style="width: 72px; height: 72px; border-radius: 50%; border: 3px solid #555555; overflow: hidden; position: relative; flex-shrink: 0; margin-left: 10px;">
                    <div id="html-dialog-avatar-img" style="position: absolute; top: 50%; left: 50%; width: 145%; height: 145%; transform: translate(-50%, -50%); background-size: cover; background-position: center;"></div>
                </div>
                <div id="html-dialog-sender" style="font-size: 24px; font-weight: bold; color: #ffffff; margin-left: 20px;">Отправитель</div>
            </div>
            <div style="width: 100%; height: 1px; background: #242f3d; margin-bottom: 25px;"></div>
            <div id="html-dialog-text" style="font-size: 20px; color: #e4e6eb; text-align: center; width: 95%; line-height: 1.5; transition: all 0.15s ease-out; transform: scale(1); opacity: 1; min-height: 80px; display: flex; align-items: center; justify-content: center;">Текст сообщения...</div>
            <div style="position: absolute; bottom: 15px; font-size: 14px; color: #6ab2f2; font-style: italic; animation: pulse 1.5s infinite; cursor: pointer; user-select: none;">Кликни, чтобы продолжить ▼</div>
        </div>
        <style>@keyframes pulse { 0% {opacity: 0.3;} 50% {opacity: 1;} 100% {opacity: 0.3;} }</style>
        `;

        this.htmlDialogDOM = this.add.dom(640, 360).createFromHTML(dialogHTML).setDepth(101).setVisible(false);
    }

    // === 2. ВЫЗОВ HTML ДИАЛОГА (С ПОДДЕРЖКОЙ КАРТИНОК) ===
    showDialog(sender, messages, isGameOver = false) {
        this.isGameOverState = isGameOver;
        this.activeMessages = messages;
        this.currentMessageIndex = 0;
        this.isDialogClosing = false;

        let avatarEl = document.getElementById('html-dialog-avatar');
        let avatarImgEl = document.getElementById('html-dialog-avatar-img');
        let senderEl = document.getElementById('html-dialog-sender');
        let textEl = document.getElementById('html-dialog-text');

        senderEl.innerText = sender;

        avatarImgEl.style.backgroundPosition = "center";
        avatarImgEl.style.backgroundSize = "cover";

        // ... (твоя логика смены аватарок остается без изменений) ...
        if (sender === 'Жорик') {
            senderEl.style.color = '#ff8a65';
            avatarEl.style.borderColor = '#ff8a65';
            avatarImgEl.style.backgroundImage = "url('assets/images/jora.png')";
        } else if (sender === 'Магистр') {
            senderEl.style.color = '#4fc3f7';
            avatarEl.style.borderColor = '#4fc3f7';
            avatarImgEl.style.backgroundImage = "url('assets/images/magistr.png')";
        } else if (sender === 'Директор') {
            senderEl.style.color = '#ffd54f';
            avatarEl.style.borderColor = '#ffd54f';
            avatarImgEl.style.backgroundImage = "url('assets/images/director.png')";
        } else if (sender === 'Гл. Бухгалтер') {
            senderEl.style.color = '#e57373';
            avatarEl.style.borderColor = '#e57373';
            avatarImgEl.style.backgroundImage = "url('assets/images/buhgalter.png')";
        } else if (sender === 'Бармен') {
            senderEl.style.color = '#ffb74d';
            avatarEl.style.borderColor = '#ffb74d';
            avatarImgEl.style.backgroundImage = "url('assets/images/barmen.png')";
            avatarImgEl.style.backgroundPosition = "center 20px";
            avatarImgEl.style.backgroundSize = "150%";
        } else {
            senderEl.style.color = '#ffffff';
            avatarEl.style.borderColor = '#555555';
            avatarImgEl.style.backgroundImage = "none";
        }

        // === ИЗМЕНЕНИЕ ТУТ: ЛОГИКА ОТОБРАЖЕНИЯ КАРТИНКИ ===
        let msg = this.activeMessages[0];
        if (msg === '[ФОТО wifi роутера]') {
            textEl.innerHTML = '<img src="assets/images/router.png" style="width: 250px; border-radius: 10px; border: 2px solid #555;">';
        } else if (msg === '[ФОТО 4-ёх жильного кабеля]') {
            textEl.innerHTML = '<img src="assets/images/cable.png" style="width: 250px; border-radius: 10px; border: 2px solid #555;">';
        } else {
            textEl.innerText = msg;
        }

        textEl.style.transform = 'scale(1)';
        textEl.style.opacity = '1';

        this.sound.play('openClick');
        this.sound.play('popMsg');

        this.dialogOverlay.setVisible(true);
        this.dialogBg.setAlpha(0);

        this.htmlDialogDOM.setVisible(true).setAlpha(0).setScale(0.7).setY(400);

        this.tweens.add({ targets: this.dialogBg, alpha: 1, duration: 250 });
        this.tweens.add({
            targets: this.htmlDialogDOM, scale: 1, alpha: 1, y: 360,
            duration: 400, ease: 'Back.out'
        });
    }

    // === 3. ПЕРЕКЛЮЧЕНИЕ ФРАЗ ===
    advanceDialog() {
        if (this.isDialogClosing) return;

        this.currentMessageIndex++;
        let textEl = document.getElementById('html-dialog-text');

        if (this.currentMessageIndex < this.activeMessages.length) {
            this.sound.play('popMsg');

            // CSS-микроанимация текста
            textEl.style.transform = 'scale(0.95)';
            textEl.style.opacity = '0.5';

            setTimeout(() => {
                let nextMsg = this.activeMessages[this.currentMessageIndex];
                if (nextMsg === '[ФОТО wifi роутера]') {
                    textEl.innerHTML = '<img src="assets/images/router.png" style="width: 250px; border-radius: 10px; border: 2px solid #555;">';
                } else if (nextMsg === '[ФОТО 4-ёх жильного кабеля]') {
                    textEl.innerHTML = '<img src="assets/images/cable.png" style="width: 250px; border-radius: 10px; border: 2px solid #555;">';
                } else {
                    textEl.innerText = nextMsg;
                }
                textEl.style.transform = 'scale(1)';
                textEl.style.opacity = '1';
            }, 150);

        } else {
            this.sound.play('closeClick');
            this.isDialogClosing = true;

            this.tweens.add({ targets: this.dialogBg, alpha: 0, duration: 200 });
            this.tweens.add({
                targets: this.htmlDialogDOM, scale: 0.8, alpha: 0, y: 380,
                duration: 200, ease: 'Power2',
                onComplete: () => {
                    this.dialogOverlay.setVisible(false);
                    this.htmlDialogDOM.setVisible(false);
                    if (this.isGameOverState) this.scene.restart(); else this.initTest();
                }
            });
        }
    }

    initTest() {
        this.playerSelection = [];
        this.selectionText.setText('Ваш выбор: ');
        this.statusText.setText('');
        this.isLocked = false;
        this.interactiveItems.forEach(item => item.destroy());
        this.interactiveItems = [];

        let shuffled = [...this.wires].sort(() => Math.random() - 0.5);

        const startX = 255;
        const spacing = 110;
        const targetY = 500;

        shuffled.forEach((wire, index) => {
            let container = this.add.container(startX + (index * spacing), targetY);
            container.setDepth(2);

            let shadow = this.add.image(4, 6, wire.texture);
            shadow.setDisplaySize(75, 75);
            shadow.setTint(0x000000);
            shadow.setAlpha(0.35);

            let iceCream = this.add.image(0, 0, wire.texture);
            iceCream.setDisplaySize(75, 75);

            let hitArea = this.add.rectangle(0, 0, 75, 75, 0x000000, 0).setInteractive({ useHandCursor: true });

            container.add([shadow, iceCream, hitArea]);

            this.interactiveItems.push(container);
            hitArea.on('pointerdown', () => this.handleSelection(wire, container));
        });
    }

    handleSelection(wire, container) {
        if (this.isLocked) return;
        const index = this.playerSelection.indexOf(wire.id);
        if (index > -1) {
            this.playerSelection.splice(index, 1);
            container.setAlpha(1);
            this.sound.play('unclickIce');
        }
        else {
            this.playerSelection.push(wire.id);
            container.setAlpha(0.2);
            this.sound.play('clickIce');
        }

        let currentString = this.playerSelection.map(id => this.wires.find(w => w.id === id).name).join('-');
        this.selectionText.setText('Ваш выбор: ' + currentString);

        if (this.playerSelection.length === 8) {
            this.isLocked = true;
            let isSuccessB = this.playerSelection.every((id, index) => id === this.solutionT568B[index]);
            let isSuccessA = this.playerSelection.every((id, index) => id === this.solutionT568A[index]);

            if (isSuccessB || isSuccessA) {
                this.statusText.setText('УСПЕХ! ВЫ ПРОШЛИ ТЕСТ.').setFill('#00ff00');

                this.time.delayedCall(1000, () => {
                    this.cameras.main.fadeOut(1000, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('MainWorkspaceScene', { currentScore: this.score });
                    });
                });
            } else {
                this.mistakesCount++;
                if (this.mistakesCount === 1) {
                    this.score -= GAME_CONFIG.SCORES.mistakePenalty1; this.scoreText.setText('Баллы: ' + this.score);
                    this.showDialog('Жорик', ['Привет бро, смотри какой роутер купил!', '[ФОТО wifi роутера]', 'Смотри какой стремный кабель мне подкинули...\n[ФОТО 4-ёх жильного кабеля]', 'Давай бро, увидимся на работе.']);
                } else if (this.mistakesCount === 2) {
                    this.score -= GAME_CONFIG.SCORES.mistakePenalty2; this.scoreText.setText('Баллы: ' + this.score);
                    this.showDialog('Магистр', ['Мороженое порекомендовать хочешь ты?', 'Это так же просто, как Ethernet кабель обжать.']);
                } else {
                    this.score -= GAME_CONFIG.SCORES.mistakePenalty1; this.scoreText.setText('Баллы: ' + this.score);
                    if (this.score <= 0) {
                        this.scoreText.setText('Баллы: 0');
                        this.showDialog('Директор', ['Ты еще не готов стать сисадмином.', 'Приходи позже, когда наберешься знаний и опыта.'], true);
                    } else {
                        this.statusText.setText('ОШИБКА! Штраф -5 баллов.').setFill('#ff0000');
                        this.time.delayedCall(1500, () => this.initTest());
                    }
                }
            }
        }
    }
}

class ServerRackScene extends Phaser.Scene {
    constructor() { super('ServerRackScene'); }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.mainScene = this.scene.get('MainWorkspaceScene');
        this.ports = {};
        this.portOccupancy = {};
        this.cables = [];
        this.leds = []; // Массив для моргающих лампочек

        // ==========================================
        // ЗАГРУЗКА СОХРАНЕННЫХ СОСТОЯНИЙ (ФИКС БАГА)
        // ==========================================
        let st = this.mainScene && this.mainScene.sysState ? this.mainScene.sysState : {};

        this.router1On = st.inc3Router1On !== undefined ? st.inc3Router1On : true;
        this.router2On = st.inc3Router2On !== undefined ? st.inc3Router2On : false;

        // Если прогресс 13 (INC3_CHECKING) или выше, значит инцидент уже решен
        this.solved = (st.progress >= 13);

        // Загружаем сохраненные позиции подвижных концов проводов (или ставим дефолтные)
        let red_B = st.inc3_red_B || 'r1_wan_0';
        let y1_B = st.inc3_y1_B || 'r1_lan_0';
        let y2_B = st.inc3_y2_B || 'r1_lan_1';

        // ==========================================
        // ФОН И ДИЗАЙН ШКАФА
        // ==========================================
        this.add.rectangle(640, 360, 1280, 720, 0x111417);
        let titleText = this.solved ? 'СЕРВЕРНАЯ (Штатный режим)' : 'СЕРВЕРНАЯ (Инцидент)';
        let titleColor = this.solved ? '#00ff00' : '#ffaa00';
        this.add.text(640, 22, titleText, { font: 'bold 22px Arial', fill: titleColor }).setOrigin(0.5);

        if (!this.solved) {
            this.add.text(640, 45, 'Основной маршрутизатор вышел из строя. Перейдите на холодный резерв.', { font: '14px Arial', fill: '#aaaaaa' }).setOrigin(0.5);
        }

        // Внешний корпус шкафа
        this.add.rectangle(640, 390, 700, 660, 0x171a1c).setStrokeStyle(6, 0x2a2e33);
        // Внутренняя темнота (глубина)
        this.add.rectangle(640, 390, 640, 640, 0x07080a);

        // Рельсы (органайзеры)
        this.add.rectangle(320, 390, 40, 640, 0x101214).setStrokeStyle(2, 0x222222).setDepth(3);
        this.add.rectangle(960, 390, 40, 640, 0x101214).setStrokeStyle(2, 0x222222).setDepth(3);

        // Отрисовка отверстий для крепления оборудования (U-слоты) на рельсах
        for (let y = 85; y < 700; y += 15) {
            this.add.rectangle(320, y, 10, 6, 0x000000).setDepth(3);
            this.add.rectangle(960, y, 10, 6, 0x000000).setDepth(3);
        }

        // ==========================================
        // ФУНКЦИИ ОТРИСОВКИ ОБОРУДОВАНИЯ
        // ==========================================
        const createDevice = (cx, cy, w, h, color, name, ledColor = 0x00ff00) => {
            let bg = this.add.rectangle(cx, cy, w, h, color).setStrokeStyle(2, 0x000000);
            // Стеклянный блик сверху для объема
            this.add.rectangle(cx, cy - h / 2 + 6, w - 4, 10, 0xffffff, 0.04);
            this.add.text(cx - w / 2 + 15, cy - h / 2 + 4, name, { font: 'bold 12px Arial', fill: '#eeeeee' }).setOrigin(0, 0);

            // Добавляем лампочку активности (Status LED) справа
            let led = this.add.circle(cx + w / 2 - 20, cy, 3, ledColor);
            this.leds.push(led);
            return bg;
        };

        const addPortGroup = (x, y, count, spacing, bgColor, prefix) => {
            if (bgColor) {
                this.add.rectangle(x + ((count - 1) * spacing) / 2, y, count * spacing + 4, 18, bgColor);
            }
            for (let i = 0; i < count; i++) {
                let px = x + (i * spacing);
                this.add.rectangle(px, y, 14, 14, 0x050505).setStrokeStyle(1, 0x333333);
                this.add.rectangle(px, y - 4, 8, 4, 0x1a1a1a);
                this.ports[`${prefix}_${i}`] = { x: px, y: y };
            }
        };

        const createPowerBtn = (x, y) => {
            this.add.circle(x, y, 10, 0x111111).setStrokeStyle(2, 0x000000); // База кнопки
            let btn = this.add.circle(x, y, 6, 0x00ff00).setInteractive({ useHandCursor: true });
            return btn;
        };

        this.dropHighlight = this.add.rectangle(0, 0, 18, 18, 0xffffff, 0.8)
            .setStrokeStyle(2, 0xff0000).setDepth(10).setVisible(false);

        // ==========================================
        // РАЗМЕЩЕНИЕ ОБОРУДОВАНИЯ
        // ==========================================
        createDevice(640, 100, 560, 45, 0x242a30, 'Маршрутизатор Провайдера');
        addPortGroup(890, 108, 1, 20, null, 'provider');

        createDevice(490, 160, 250, 55, 0x282c2f, 'Маршрутизатор 1 (ОСНОВНОЙ)', 0xff0000);
        this.router1PowerBtn = createPowerBtn(380, 172);
        addPortGroup(450, 172, 4, 20, 0xffeb3b, 'r1_lan');
        addPortGroup(545, 172, 1, 20, 0x03a9f4, 'r1_wan');

        createDevice(790, 160, 250, 55, 0x282c2f, 'Маршрутизатор 2 (РЕЗЕРВ)');
        this.router2PowerBtn = createPowerBtn(680, 172);

        // --- Восстановление фичей ---
        this.router1PowerBtn.disableInteractive();


        addPortGroup(750, 172, 4, 20, 0xffeb3b, 'r2_lan');
        addPortGroup(845, 172, 1, 20, 0x03a9f4, 'r2_wan');

        createDevice(490, 230, 250, 55, 0x224982, 'VipNet Coordinator HW100');
        addPortGroup(450, 242, 4, 20, 0x111111, 'vipnet');

        createDevice(790, 230, 250, 55, 0x1c1e20, 'VoIP Шлюз');
        addPortGroup(680, 242, 2, 20, 0x03a9f4, 'voip_wan');
        addPortGroup(730, 242, 8, 20, 0x8bc34a, 'voip_fxs');

        createDevice(640, 310, 560, 45, 0x151719, 'Патч-панель 2');
        addPortGroup(385, 323, 24, 18, null, 'pp2');

        createDevice(640, 370, 560, 45, 0x151719, 'Патч-панель 1');
        addPortGroup(385, 383, 24, 18, null, 'pp1');

        createDevice(640, 460, 560, 75, 0x222a33, 'Коммутатор 1 (10.138.10.0/24)');
        addPortGroup(385, 455, 24, 18, null, 'sw1a');
        addPortGroup(385, 478, 24, 18, null, 'sw1b');

        createDevice(640, 550, 560, 75, 0x222a33, 'Коммутатор 2 (10.138.5.0/24)');
        addPortGroup(385, 545, 24, 18, null, 'sw2a');
        addPortGroup(385, 568, 24, 18, null, 'sw2b');

        createDevice(640, 655, 560, 65, 0x0f0f0f, 'ИБП Стоечный');
        this.add.rectangle(640, 665, 120, 30, 0x002200).setStrokeStyle(1, 0x333333);
        let upsText = this.add.text(640, 665, '220V | 45%', { font: 'bold 16px Courier', fill: '#00ff00' }).setOrigin(0.5, 0.5);

        this.time.addEvent({
            delay: 1500, loop: true,
            callback: () => {
                let voltage = Phaser.Math.Between(218, 223);
                let load = Phaser.Math.Between(42, 48);
                upsText.setText(`${voltage}V | ${load}%`);
            }
        });

        // ==========================================
        // ПРОКЛАДКА КАБЕЛЕЙ
        // ==========================================
        let decoWireIndex = 0;

        for (let i = 0; i < 3; i++) this.createCable(`blue_pp2_${i}`, 0x29b6f6, `voip_fxs_${i}`, `pp2_${23 - i}`, 'none', 'orthogonal', decoWireIndex++);
        for (let i = 0; i < 5; i++) this.createCable(`blue_pp1_${i}`, 0x29b6f6, `voip_fxs_${3 + i}`, `pp1_${23 - i}`, 'none', 'orthogonal', decoWireIndex++);

        this.createCable('green_sw1', 0x66bb6a, 'vipnet_0', 'sw1a_0', 'none', 'orthogonal', decoWireIndex++);
        this.createCable('green_sw2', 0x66bb6a, 'vipnet_1', 'sw2a_0', 'none', 'orthogonal', decoWireIndex++);
        for (let i = 0; i < 3; i++) {
            this.createCable(`red_pp1_${i}`, 0xff0000, `pp1_${23 - i}`, `sw1b_${23 - i}`, 'none', 'zmeika', i);
        }

        // ИНТЕРАКТИВНЫЕ КАБЕЛИ ДЛЯ ЗАДАНИЯ
        // Теперь параметр 'B' означает, что только конец B (подключенный к Маршрутизатору) можно дергать мышой!
        let cableState = this.solved ? 'none' : 'B';
        this.cableRed = this.createCable('red', 0xe53935, 'provider_0', red_B, cableState, 'bezier');
        this.cableYellow1 = this.createCable('yellow1', 0xfdd835, 'vipnet_2', y1_B, cableState, 'bezier');
        this.cableYellow2 = this.createCable('yellow2', 0xfdd835, 'voip_wan_0', y2_B, cableState, 'bezier');

        // ==========================================
        // АНИМАЦИЯ ЛАМПОЧЕК (ЖИВОЙ ШКАФ)
        // ==========================================
        this.time.addEvent({
            delay: 400, loop: true,
            callback: () => {
                this.leds.forEach(led => {
                    // Лампочки мигают хаотично, создавая эффект передачи данных
                    led.setAlpha(Math.random() > 0.3 ? 1 : 0.2);
                });
            }
        });

        // ==========================================
        // ЛОГИКА ПИТАНИЯ
        // ==========================================
        this.updatePowerVisuals();

        this.router1PowerBtn.on('pointerdown', () => {
            if (this.solved) return;
            this.sound.play('closeClick');
            this.router1On = !this.router1On;
            this.updatePowerVisuals();
            this.checkSolution();
        });

        this.router2PowerBtn.on('pointerdown', () => {
            if (this.solved) return;
            this.sound.play('closeClick');
            this.router2On = !this.router2On;
            this.updatePowerVisuals();
            this.checkSolution();
        });

        let backBtn = this.add.text(45, 25, '◀ В КАБИНЕТ', {
            font: '18px Arial', fill: '#ffffff', backgroundColor: '#555555', padding: { x: 14, y: 9 }
        }).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => {
            this.sound.play('closeClick');
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.wake('MainWorkspaceScene');
                if (this.mainScene && this.mainScene.cameras && this.mainScene.cameras.main) {
                    this.mainScene.cameras.main.fadeIn(400, 0, 0, 0);
                }
                this.scene.stop('ServerRackScene');
            });
        });
    }

    // ---------- ЛОГИКА КАБЕЛЕЙ ----------

    createCable(id, color, endAPortId, endBPortId, interactiveMode, routingStyle, index = 0) {
        this.occupyPort(endAPortId, id);
        this.occupyPort(endBPortId, id);

        let cable = {
            id, color, routingStyle, index,
            ends: { A: { portId: endAPortId }, B: { portId: endBPortId } },
            wobbleAmt: 0, wobbleTween: null, dragging: false,
            graphics: this.add.graphics().setDepth(1)
        };
        cable.redraw = () => { if (!cable.dragging) this.redrawCable(cable); };
        this.cables.push(cable);
        this.redrawCable(cable);

        const wobble = () => {
            if (cable.dragging || cable.wobbleTween) return;
            cable.wobbleTween = this.tweens.add({
                targets: cable, wobbleAmt: 1, duration: 150, yoyo: true, repeat: 1,
                onUpdate: () => cable.redraw(),
                onComplete: () => { cable.wobbleAmt = 0; cable.wobbleTween = null; cable.redraw(); }
            });
        };

        let pA = this.ports[endAPortId], pB = this.ports[endBPortId];

        // Отрисовка концов. Делаем интерактивным ТОЛЬКО нужный конец.
        if (interactiveMode === 'A' || interactiveMode === 'both') {
            cable.endAHandle = this.createHandle(pA.x, pA.y, color, cable, 'A', wobble);
        } else {
            this.add.zone(pA.x, pA.y, 20, 20).setInteractive().on('pointerover', wobble);
        }

        if (interactiveMode === 'B' || interactiveMode === 'both') {
            cable.endBHandle = this.createHandle(pB.x, pB.y, color, cable, 'B', wobble);
        } else {
            this.add.zone(pB.x, pB.y, 20, 20).setInteractive().on('pointerover', wobble);
        }

        return cable;
    }

    createHandle(x, y, color, cable, endName, wobbleFn) {
        let handle = this.add.circle(x, y, 5, color, 1).setStrokeStyle(1, 0xffffff, 0.8)
            .setInteractive(new Phaser.Geom.Circle(5, 5, 12), Phaser.Geom.Circle.Contains).setDepth(4);

        this.input.setDraggable(handle);
        handle.on('pointerover', wobbleFn);
        this.setupCableEndDrag(cable, endName, handle);
        return handle;
    }

    redrawCable(cable, liveEnd, liveX, liveY) {
        let pA = (liveEnd === 'A') ? { x: liveX, y: liveY } : this.ports[cable.ends.A.portId];
        let pB = (liveEnd === 'B') ? { x: liveX, y: liveY } : this.ports[cable.ends.B.portId];
        if (!pA || !pB) return;

        cable.graphics.clear();
        // Красивая тень под проводом
        cable.graphics.lineStyle(4, 0x000000, 0.5);
        this.drawPath(cable, pA, pB, liveEnd, 2);
        // Сам цветной провод
        cable.graphics.lineStyle(3, cable.color, 1);
        this.drawPath(cable, pA, pB, liveEnd, 0);
    }

    drawPath(cable, pA, pB, liveEnd, offsetY) {
        cable.graphics.beginPath();
        cable.graphics.moveTo(pA.x, pA.y + offsetY);

        if (cable.routingStyle === 'zmeika' && !cable.dragging && !liveEnd) {
            let dropOffset = 25 + (cable.index * 5); // чуть вниз
            let rightShift = 880 - (cable.index * 10); // направо в дальние порты

            cable.graphics.lineTo(pA.x, pA.y + dropOffset + offsetY);
            cable.graphics.lineTo(rightShift, pA.y + dropOffset + offsetY);
            cable.graphics.lineTo(rightShift, pB.y - 15 + offsetY);
            cable.graphics.lineTo(pB.x, pB.y - 15 + offsetY);
            cable.graphics.lineTo(pB.x, pB.y + offsetY);
        } else if (cable.routingStyle === 'orthogonal' && !cable.dragging && !liveEnd) {
            let isLeftSide = (pA.x + pB.x) / 2 < 640;
            let sideXBase = isLeftSide ? 330 : 950;
            let sideX = sideXBase + (isLeftSide ? -(cable.index * 3) : (cable.index * 3));
            let dropOffset = 15 + (cable.index % 4) * 4;

            cable.graphics.lineTo(pA.x, pA.y + dropOffset + offsetY);
            cable.graphics.lineTo(sideX, pA.y + dropOffset + offsetY);
            cable.graphics.lineTo(sideX, pB.y + dropOffset + offsetY);
            cable.graphics.lineTo(pB.x, pB.y + dropOffset + offsetY);
            cable.graphics.lineTo(pB.x, pB.y + offsetY);
        } else {
            let midX = (pA.x + pB.x) / 2;
            let midY = (pA.y + pB.y) / 2;
            let sagBias = 40 + Math.sin(this.time.now * 0.006) * 5 * cable.wobbleAmt;

            const STEPS = 20;
            for (let i = 1; i <= STEPS; i++) {
                let t = i / STEPS;
                let x = (1 - t) * (1 - t) * pA.x + 2 * (1 - t) * t * midX + t * t * pB.x;
                let y = (1 - t) * (1 - t) * pA.y + 2 * (1 - t) * t * (midY + sagBias) + t * t * pB.y;
                cable.graphics.lineTo(x, y + offsetY);
            }
        }
        cable.graphics.strokePath();
    }

    setupCableEndDrag(cable, endName, handle) {
        handle.on('dragstart', () => {
            if (this.solved) return;
            cable.dragging = true;
            if (cable.wobbleTween) { cable.wobbleTween.stop(); cable.wobbleTween = null; cable.wobbleAmt = 0; }
            this.sound.play('clickIce');
        });

        handle.on('drag', (pointer) => {
            if (this.solved) return;
            handle.x = pointer.x;
            handle.y = pointer.y;
            this.redrawCable(cable, endName, pointer.x, pointer.y);

            let nearest = this.findNearestFreePort(pointer.x, pointer.y, cable);
            if (nearest && nearest !== cable.ends[endName].portId) {
                this.dropHighlight.setPosition(this.ports[nearest].x, this.ports[nearest].y).setVisible(true);
            } else {
                this.dropHighlight.setVisible(false);
            }
        });

        handle.on('dragend', (pointer) => {
            if (this.solved) return;
            cable.dragging = false;
            this.dropHighlight.setVisible(false);

            let nearest = this.findNearestFreePort(pointer.x, pointer.y, cable);
            if (nearest) {
                this.freePort(cable.ends[endName].portId);
                cable.ends[endName].portId = nearest;
                this.occupyPort(nearest, cable.id);
            }

            let p = this.ports[cable.ends[endName].portId];
            handle.x = p.x;
            handle.y = p.y;
            cable.redraw();

            this.sound.play('closeClick');
            this.checkSolution();
        });
    }

    findNearestFreePort(x, y, cable) {
        let bestId = null, bestDist = 45;
        for (let id in this.ports) {
            let occ = this.portOccupancy[id];
            if (occ && occ !== cable.id) continue;
            let p = this.ports[id];
            let d = Phaser.Math.Distance.Between(x, y, p.x, p.y);
            if (d < bestDist) { bestDist = d; bestId = id; }
        }
        return bestId;
    }

    occupyPort(id, cableId) { this.portOccupancy[id] = cableId; }
    freePort(id) { if (this.portOccupancy[id]) delete this.portOccupancy[id]; }

    // ---------- ПРОВЕРКА ЗАДАНИЯ ----------

    updatePowerVisuals() {
        // Основной маршрутизатор сломан - кнопка всегда серая
        this.router1PowerBtn.setFillStyle(0x808080);
        // Резервный маршрутизатор - серая когда выключен, зеленая когда включен
        this.router2PowerBtn.setFillStyle(this.router2On ? 0x00ff00 : 0x808080);
    }

    checkSolution() {
        if (this.solved) return;

        // Сохраняем позиции в стейт-машину на каждое действие!
        if (this.mainScene && this.mainScene.sysState) {
            this.mainScene.sysState.inc3Router1On = this.router1On;
            this.mainScene.sysState.inc3Router2On = this.router2On;
            this.mainScene.sysState.inc3_red_B = this.cableRed.ends.B.portId;
            this.mainScene.sysState.inc3_y1_B = this.cableYellow1.ends.B.portId;
            this.mainScene.sysState.inc3_y2_B = this.cableYellow2.ends.B.portId;
        }

        // Проверяем концы B, так как концы A теперь жестко зафиксированы!
        const redOk = this.cableRed.ends.B.portId === 'r2_wan_0';
        const y1Ok = this.cableYellow1.ends.B.portId.startsWith('r2_lan');
        const y2Ok = this.cableYellow2.ends.B.portId.startsWith('r2_lan');
        const powerOk = this.router2On;

        if (redOk && y1Ok && y2Ok && powerOk) {
            this.onSolved();
        }
    }

    onSolved() {
        this.solved = true;
        this.sound.play('dzin');

        this.add.text(640, 690, '✔ Трафик переведен. Резервный маршрутизатор запущен!', {
            font: 'bold 18px Arial', fill: '#00ff00', backgroundColor: '#000000aa', padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setDepth(300);

        this.router1PowerBtn.disableInteractive();
        this.router2PowerBtn.disableInteractive();
        this.cables.forEach(c => {
            if (c.endAHandle) c.endAHandle.disableInteractive();
            if (c.endBHandle) c.endBHandle.disableInteractive();
        });

        this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.wake('MainWorkspaceScene');
                if (this.mainScene) {
                    if (this.mainScene.cameras && this.mainScene.cameras.main) this.mainScene.cameras.main.fadeIn(500, 0, 0, 0);
                    if (this.mainScene.sysState) this.mainScene.sysState.progress = GAME_STAGE.INC3_CHECKING;
                    if (typeof this.mainScene.checkTerminalProgress === 'function') this.mainScene.checkTerminalProgress();
                }
                this.scene.stop('ServerRackScene');
            });
        });
    }
}

class MainWorkspaceScene extends Phaser.Scene {
    constructor() { super('MainWorkspaceScene'); }

    init(data) { this.totalScore = data.currentScore || 0; }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        // === ВМЕЩАЕМ ВЕСЬ ФОН В ЭКРАН ===
        let mainBg = this.add.image(640, 360, 'fon').setDepth(-1);
        mainBg.setDisplaySize(1280, 720);
        // ======================================
        this.sysState = {
            progress: GAME_STAGE.INTRO,
            handbookRead: false,
            pingAccDone: false,
            pingNeighborDone: false,
            pingYaRuDone: false,
            helpThoughtShown: false,
            inc3PingFailedDone: false,
            inc3ThoughtShown: false,
            inc3Router1On: true,
            inc3Router2On: false
        };



        this.chatData = {
            'Гл. Бухгалтер': { history: '', queue: [], hintBought: false, isTyping: false, waitingForNext: false },
            'Директор': { history: '', queue: [], hintBought: false, isTyping: false, waitingForNext: false },
            'Магистр': { history: '', queue: [], hintBought: false, isTyping: false, waitingForNext: false },
            'Жорик': { history: '', queue: [], hintBought: false, isTyping: false, waitingForNext: false },
            'Общий чат': { history: '', queue: [], hintBought: false, isTyping: false, waitingForNext: false }
        };

        this.scoreText = this.add.text(30, 30, 'Баллы: ' + this.totalScore, { font: 'bold 24px Arial', fill: '#ffff00' }).setOrigin(0, 0).setDepth(20);



        // === КАНБАН-ДОСКА (В КОНТЕЙНЕРЕ) ===
        // Чтобы опустить доску еще ниже, увеличь цифру 80. Чтобы поднять — уменьши.
        const boardContainer = this.add.container(25, 35);
        boardContainer.setScale(0.85);

        let shadowK = this.add.rectangle(235, 225, 380, 250, 0x000000, 0.2);
        const board = this.add.rectangle(230, 220, 380, 250, 0x3a3f44).setInteractive({ useHandCursor: true });
        let bgWhiteK = this.add.rectangle(230, 220, 360, 230, 0xffffff);
        let line1K = this.add.rectangle(140, 220, 2, 230, 0xe0e6ed);
        let line2K = this.add.rectangle(230, 220, 2, 230, 0xe0e6ed);
        let line3K = this.add.rectangle(320, 220, 2, 230, 0xe0e6ed);

        let header1K = this.add.rectangle(95, 120, 76, 14, 0xf0f2f5);
        let header2K = this.add.rectangle(185, 120, 76, 14, 0xf0f2f5);
        let header3K = this.add.rectangle(275, 120, 76, 14, 0xf0f2f5);
        let header4K = this.add.rectangle(365, 120, 76, 14, 0xf0f2f5);

        let note1K = this.add.rectangle(95, 150, 70, 28, 0xffeb3b).setAngle(-2);
        let note2K = this.add.rectangle(95, 185, 70, 28, 0xffeb3b).setAngle(1);
        let note3K = this.add.rectangle(185, 155, 70, 28, 0x4fc3f7).setAngle(3);
        let note4K = this.add.rectangle(275, 145, 70, 28, 0xffb74d).setAngle(-1);
        let note5K = this.add.rectangle(365, 150, 70, 28, 0x81c784).setAngle(2);
        let note6K = this.add.rectangle(365, 185, 70, 28, 0x81c784).setAngle(-2);
        let note7K = this.add.rectangle(365, 220, 70, 28, 0x81c784).setAngle(1);

        boardContainer.add([shadowK, board, bgWhiteK, line1K, line2K, line3K, header1K, header2K, header3K, header4K, note1K, note2K, note3K, note4K, note5K, note6K, note7K]);
        // ===================================

        // === ВИЗУАЛ НОВОГО СПРАВОЧНИКА ===
        const book = this.add.container(105, 610).setDepth(2);

        let baseScale = 0.33;

        // --- СОЗДАЕМ ТЕНЬ ---
        const bookShadow = this.add.image(6, 8, 'spravochnik'); // Сдвиг (6, 8)
        bookShadow.setScale(baseScale);
        bookShadow.setTint(0x000000);
        bookShadow.setAlpha(0.35);

        // --- САМА КНИГА ---
        const bookImg = this.add.image(0, 0, 'spravochnik');
        bookImg.setScale(baseScale);

        // Добавляем тень ПЕРВОЙ в контейнер, чтобы она была под картинкой
        book.add([bookShadow, bookImg]);

        // Автоматически вычисляем зону для клика на основе финального размера картинки
        const hitW = bookImg.displayWidth;
        const hitH = bookImg.displayHeight;
        book.setInteractive(new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        book.input.cursor = 'pointer';

        // Плавная анимация при наведении
        book.on('pointerover', () => {
            this.tweens.add({ targets: [bookImg, bookShadow], scale: baseScale + 0.03, duration: 150, ease: 'Sine.easeOut' });
        });
        book.on('pointerout', () => {
            this.tweens.add({ targets: [bookImg, bookShadow], scale: baseScale, duration: 150, ease: 'Sine.easeOut' });
        });
        // ===================================
        // === ВИЗУАЛ НОВОЙ СХЕМЫ СЕТИ ===
        const networkMap = this.add.container(280, 610).setDepth(2);

        let mapBaseScale = 0.24;

        // --- СОЗДАЕМ ТЕНЬ ---
        const mapShadow = this.add.image(5, 7, 'shemaseti'); // Сдвиг (5, 7)
        mapShadow.setScale(mapBaseScale);
        mapShadow.setTint(0x000000);
        mapShadow.setAlpha(0.35);

        // --- САМА СХЕМА ---
        const mapImg = this.add.image(0, 0, 'shemaseti');
        mapImg.setScale(mapBaseScale);

        // Добавляем тень ПЕРВОЙ в контейнер
        networkMap.add([mapShadow, mapImg]);

        // Автоматически вычисляем зону для клика
        const mapHitW = mapImg.displayWidth;
        const mapHitH = mapImg.displayHeight;
        networkMap.setInteractive(new Phaser.Geom.Rectangle(-mapHitW / 2, -mapHitH / 2, mapHitW, mapHitH), Phaser.Geom.Rectangle.Contains);
        networkMap.input.cursor = 'pointer';

        // Плавная анимация при наведении
        networkMap.on('pointerover', () => {
            this.tweens.add({ targets: [mapImg, mapShadow], scale: mapBaseScale + 0.03, duration: 150, ease: 'Sine.easeOut' });
        });
        networkMap.on('pointerout', () => {
            this.tweens.add({ targets: [mapImg, mapShadow], scale: mapBaseScale, duration: 150, ease: 'Sine.easeOut' });
        });
        // ===================================

        // При наведении мыши книга чуть увеличивается (+5%)
        book.on('pointerover', () => { bookImg.setScale(baseScale + 0.05); });
        // При отведении возвращается к базовому размеру
        book.on('pointerout', () => { bookImg.setScale(baseScale); });
        // При наведении мыши схема чуть увеличивается (+5%)
        networkMap.on('pointerover', () => { mapImg.setScale(mapBaseScale + 0.05); });
        // При отведении возвращается к базовому размеру
        networkMap.on('pointerout', () => { mapImg.setScale(mapBaseScale); });

        this.phoneObj = this.add.container(1200, 620);
        this.phoneObj.add([
            this.add.rectangle(5, 5, 100, 180, 0x000000, 0.3),
            this.add.rectangle(0, 0, 100, 180, 0x1c1c1e),
            this.add.rectangle(0, 0, 90, 160, 0x000000),
            this.add.rectangle(0, -75, 30, 4, 0x333333),
            this.add.text(0, 0, '💬', { font: '32px Arial' }).setOrigin(0.5)
        ]);
        this.phoneObj.setSize(100, 180).setInteractive({ useHandCursor: true });
        this.phoneShake = this.tweens.add({ targets: this.phoneObj, angle: { from: -5, to: 5 }, duration: 50, yoyo: true, repeat: -1, paused: true });

        // ВАЖНО: Сначала создаем оверлеи
        this.createOverlays();

        // Потом вешаем на кнопки логику появления окон и анимаций
        networkMap.on('pointerdown', () => {
            this.openOverlay(this.overlayMap);
            this.overlayMap.setAlpha(0);
            this.overlayMap.contentContainer.setScale(0.9);
            this.overlayMap.contentContainer.setY(20);
            this.tweens.add({ targets: this.overlayMap, alpha: 1, duration: 250 });
            this.tweens.add({ targets: this.overlayMap.contentContainer, scale: 1, y: 0, duration: 400, ease: 'Back.out' });
        });

        this.phoneObj.on('pointerdown', () => {
            this.phoneShake.pause();
            this.phoneObj.setAngle(0);
            this.openOverlay(this.overlayPhone);
        });

        board.on('pointerdown', () => {
            this.openOverlay(this.overlayKanban);
            this.updateKanbanBoard();
        });

        book.on('pointerdown', () => {
            this.openOverlay(this.overlayBook);
            this.overlayBook.setAlpha(0);
            this.bookDOM.node.style.opacity = 0;
            this.bookDOM.setScale(0.9);
            this.bookDOM.setY(20);
            this.tweens.add({ targets: this.overlayBook, alpha: 1, duration: 250 });
            this.tweens.addCounter({
                from: 0, to: 1, duration: 250,
                onUpdate: (tween) => { this.bookDOM.node.style.opacity = tween.getValue(); }
            });
            this.tweens.add({ targets: this.bookDOM, scale: 1, y: 0, duration: 400, ease: 'Back.out' });
        });


        // Монитор для терминала (Depth 1, под серверной, но над столом)
        // Улучшенный дизайн терминального монитора
        let m1 = this.add.rectangle(800, 280, 780, 480, 0x111111).setDepth(1).setStrokeStyle(4, 0x333333);
        // Нижняя рамка монитора, где будет надпись "sys-admin"
        let mBezelBottom = this.add.rectangle(800, 510, 775, 20, 0x1a1d21).setDepth(1);
        let monitorLogo = this.add.text(800, 510, 'SYS-ADMIN', { font: 'bold 13px monospace', fill: '#555555', letterSpacing: 2 }).setOrigin(0.5).setDepth(1);
        let monitorLed = this.add.circle(1170, 510, 3, 0x00ff00).setDepth(1);

        // Стойка монитора
        let m2 = this.add.rectangle(800, 540, 60, 40, 0x15181a).setDepth(1);
        let m3 = this.add.rectangle(800, 565, 260, 15, 0x111111).setDepth(1);
        let mShadow1 = this.add.ellipse(800, 572, 280, 20, 0x000000, 0.4).setDepth(1);
        let mShadow2 = this.add.ellipse(800, 575, 300, 30, 0x000000, 0.2).setDepth(1);

        let termHTML = '<div id="terminal-container" style="width: 760px; height: 440px; background-color: #050505; padding: 15px; border: 2px solid #222; box-shadow: inset 0 0 15px rgba(0,0,0,0.8); overflow: hidden; user-select: text; box-sizing: border-box; border-radius: 4px;"></div>';
        this.terminalDOM = this.add.dom(800, 280).createFromHTML(termHTML);

        if (typeof Terminal !== 'undefined') {
            let xterm = new Terminal({ cursorBlink: true, cols: 74, theme: { background: '#000000' } });
            const termElement = document.getElementById('terminal-container');
            if (termElement) {
                xterm.open(termElement);
                xterm.write('Welcome to Linux-Server v2.4\r\nuser@sysadmin:/home/sysadmin$ ');
                this.vTerm = new VirtualTerminal(xterm, this);

                termElement.addEventListener('click', () => {
                    if (this.sysState.progress === GAME_STAGE.DIR_WORKING && !this.sysState.helpThoughtShown) {
                        this.sysState.helpThoughtShown = true;
                        this.showToast('💬 Вы: Задание сложное, наверное нужно набрать команду help в терминале и посмотреть, какие команды доступны...');
                    }
                });
            }
        }

        this.terminalDOM.setAlpha(0);
        this.tweens.add({
            targets: this.terminalDOM, alpha: 1, duration: 1000, ease: 'Power2'
        });

        this.startWorkingDay();



        // === ПАНЕЛЬ ДЛЯ ТЕСТИРОВАНИЯ (ДЕБАГ МЕНЮ) ===
        let debugBtn = this.add.text(20, 150, '⚙️ ТЕСТ', {
            font: '14px Arial', fill: '#ffffff', backgroundColor: '#aa0000', padding: { x: 10, y: 10 }
        }).setInteractive({ useHandCursor: true }).setDepth(200);

        this.debugMenu = this.add.container(95, 150).setDepth(200).setVisible(false);
        let debugBg = this.add.rectangle(0, 0, 140, 150, 0x2b2b2b).setOrigin(0, 0).setStrokeStyle(2, 0x555555);

        let btnLvl1 = this.add.text(15, 20, '▶ Уровень 1', { font: '16px Arial', fill: '#00ff00' }).setInteractive({ useHandCursor: true });
        let btnLvl2 = this.add.text(15, 60, '▶ Уровень 2', { font: '16px Arial', fill: '#00ff00' }).setInteractive({ useHandCursor: true });
        let btnLvl3 = this.add.text(15, 100, '▶ Уровень 3', { font: '16px Arial', fill: '#00ff00' }).setInteractive({ useHandCursor: true });
        let btnCloseDebug = this.add.text(115, 5, '✖', { font: '14px Arial', fill: '#ff5555' }).setInteractive({ useHandCursor: true });

        this.debugMenu.add([debugBg, btnLvl1, btnLvl2, btnLvl3, btnCloseDebug]);

        // Логика открытия/закрытия
        debugBtn.on('pointerdown', () => this.debugMenu.setVisible(!this.debugMenu.visible));
        btnCloseDebug.on('pointerdown', () => this.debugMenu.setVisible(false));
        // Логика кнопок уровней
        btnLvl1.on('pointerdown', () => this.jumpToLevel(1));
        btnLvl2.on('pointerdown', () => this.jumpToLevel(2));
        btnLvl3.on('pointerdown', () => this.jumpToLevel(3));
        // ============================================
    }

    startWorkingDay() {
        this.time.delayedCall(1000, () => this.showToast('💬 Вы: Фух, начался первый рабочий день...'));
        this.time.delayedCall(6500, () => this.showToast('💬 Вы: Надо бы заглянуть в справочник.'));
    }
    jumpToLevel(level) {
        this.debugMenu.setVisible(false);
        this.sound.play('openClick');

        // 1. Сбрасываем терминал (если уже что-то вводили)
        if (this.vTerm) {
            this.vTerm.keslStarted = false;
            this.vTerm.isSSH = false;
            this.vTerm.currentPath = '/home/sysadmin';
            this.vTerm.term.write('\r\n[SYSTEM] Терминал сброшен.\r\n' + this.vTerm.getPrompt());
        }

        // 2. Очищаем историю всех чатов для чистого старта уровня
        for (let key in this.chatData) {
            this.chatData[key].history = '';
            this.chatData[key].queue = [];
            this.chatData[key].isTyping = false;
            this.chatData[key].waitingForNext = false;
            this.chatData[key].hintBought = false;
        }

        // 3. Сбрасываем визуальные статусы (кружочки) в телефонной книге
        this.accStatus.setText('Гл. Бухгалтер ⚪').setFill('#888888');
        this.dirStatus.setText('Директор ⚪').setFill('#888888');
        this.generalChatStatus.setText('Общий чат ⚪').setFill('#888888');
        this.guruStatus.setText('Магистр ⚪').setFill('#888888');
        this.antiGuruStatus.setText('Жорик ⚪').setFill('#888888');

        // 4. Подготавливаем стейт-машину под конкретный уровень
        if (level === 1) {
            this.sysState.progress = GAME_STAGE.INTRO;
            this.sysState.handbookRead = true; // Сразу "читаем" справочник, чтобы не отвлекал
            this.phoneShake.resume();
            this.accStatus.setText('Гл. Бухгалтер 🔴').setFill('#ff5555');
            this.chatData['Гл. Бухгалтер'].queue = [...DIALOGS.accountant.intro];
            this.showToast('🛠 ПЕРЕХОД: Уровень 1 (Коммутатор)');
        }
        else if (level === 2) {
            this.sysState.progress = GAME_STAGE.DIR_INTRO;
            this.sysState.pingYaRuDone = false;
            this.phoneShake.resume();
            this.dirStatus.setText('Директор 🔴').setFill('#ff5555');
            this.chatData['Директор'].queue = [...DIALOGS.director.intro, 'Админ: Уже смотрю.'];
            this.showToast('🛠 ПЕРЕХОД: Уровень 2 (Антивирус)');
        }
        else if (level === 3) {
            this.sysState.progress = GAME_STAGE.INC3_INTRO;
            this.sysState.inc3PingFailedDone = false;
            this.sysState.inc3Router1On = true;
            this.sysState.inc3Router2On = false;
            this.phoneShake.resume();
            this.generalChatStatus.setText('Общий чат 🔴').setFill('#ff5555');
            this.chatData['Общий чат'].queue = [...DIALOGS.generalChat.intro];
            this.showToast('🛠 ПЕРЕХОД: Уровень 3 (Отвал сети)');
        }

        // 5. Проматываем Канбан-доску. 
        // Если прыгаем на 3 уровень, 1 и 2 задания автоматом прыгнут в "Готово"
        this.updateKanbanBoard();

        // 6. Если мы нажали кнопку дебага, пока сидели в телефоне — обновляем чат на лету
        if (this.overlayPhone.visible && this.activeContact) {
            this.renderChat();
            this.processChatQueue(this.activeContact);
        }
    }
    showToast(msg) {
        if (this.currentToast) {
            this.currentToast.destroy();
            if (this.currentToastTween) this.currentToastTween.stop();
        }

        if (msg.startsWith('💬 Вы:')) {
            try { this.sound.play('mumble', { volume: 0.8 }); } catch (e) { }
        }

        this.currentToast = this.add.text(640, 680, msg, {
            font: '20px Arial', fill: '#fff', backgroundColor: '#000000aa', padding: { x: 10, y: 10 }
        }).setOrigin(0.5).setDepth(200);

        this.currentToastTween = this.tweens.add({
            targets: this.currentToast, alpha: 0, delay: 4000, duration: 1000,
            onComplete: () => {
                if (this.currentToast) this.currentToast.destroy();
                this.currentToast = null;
            }
        });
    }

    playDing() {
        try { this.sound.play('dzin'); } catch (e) { }
        let flash = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.1).setDepth(500);
        this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
    }

    updateScore(amount) {
        this.totalScore += amount;
        if (this.scoreText) {
            this.scoreText.setText('Баллы: ' + this.totalScore);
            if (amount < 0) {
                this.scoreText.setFill('#ff5555');
                this.time.delayedCall(1000, () => this.scoreText.setFill('#ffff00'));
            }
        }
    }

    checkTerminalProgress() {
        if (this.sysState.progress === GAME_STAGE.WORKING && this.sysState.pingAccDone && this.sysState.pingNeighborDone) {
            this.sysState.progress = GAME_STAGE.CHECKING;
            this.playDing();
            this.showToast('Проблема найдена! Ответьте Бухгалтеру в чате.');
            this.accStatus.setText('Гл. Бухгалтер 🔴').setFill('#ff5555');
            this.chatData['Гл. Бухгалтер'].queue = [...DIALOGS.accountant.outro];
            this.updateKanbanBoard();
            if (this.overlayPhone.visible && this.activeContact === 'Гл. Бухгалтер') this.processChatQueue('Гл. Бухгалтер');
        }

        if (this.sysState.progress === GAME_STAGE.DIR_CHECKING) {
            this.playDing();
            if (!this.sysState.pingYaRuDone) {
                this.updateScore(-GAME_CONFIG.SCORES.mistakePenalty1);
                this.showToast(`Штраф -${GAME_CONFIG.SCORES.mistakePenalty1} баллов: Не проверен ping интернета с вашего ПК!`);
            } else {
                this.showToast('Антивирус запущен! Сообщите Директору в чате.');
            }

            this.dirStatus.setText('Директор 🔴').setFill('#ff5555');
            this.chatData['Директор'].queue = [...DIALOGS.director.outro];
            this.updateKanbanBoard();

            if (this.overlayPhone.visible && this.activeContact === 'Директор') this.processChatQueue('Директор');
        }

        // Инцидент 3: игрок обязательным пингом (192.168.1.1) подтвердил отвал маршрутизатора -
        // подсказываем сходить в серверную. Показываем один раз.
        if (this.sysState.progress === GAME_STAGE.INC3_WORKING && this.sysState.inc3PingFailedDone && !this.sysState.inc3ThoughtShown) {
            this.sysState.inc3ThoughtShown = true;
            this.time.delayedCall(800, () => this.showToast('💬 Вы: Хм, нужно сходить в серверную...'));
        }

        // Инцидент 3: серверная починена (переключение на резерв), ServerRackScene выставила
        // progress = INC3_CHECKING и дёрнула этот метод - пишем в общий чат компании.
        if (this.sysState.progress === GAME_STAGE.INC3_CHECKING) {
            this.playDing();
            this.showToast('Интернет восстановлен! Сообщите об этом в общем чате.');

            this.generalChatStatus.setText('Общий чат 🔴').setFill('#ff5555');
            this.chatData['Общий чат'].queue = [...DIALOGS.generalChat.outro];
            this.updateKanbanBoard();

            if (this.overlayPhone.visible && this.activeContact === 'Общий чат') this.processChatQueue('Общий чат');
        }
    }

    openOverlay(overlayTarget) {
        this.sound.play('openClick');

        this.tweens.add({
            targets: this.terminalDOM, alpha: 0, duration: 150, ease: 'Power2',
            onComplete: () => { this.terminalDOM.setVisible(false); }
        });

        this.scene.setVisible(false, 'UIScene');

        overlayTarget.setAlpha(0);
        overlayTarget.setVisible(true);
        this.tweens.add({ targets: overlayTarget, alpha: 1, duration: 250, ease: 'Power2' });

        if (overlayTarget === this.overlayPhone) {
            if (this.chatDOM) {
                this.chatDOM.setAlpha(0).setVisible(true);
                this.tweens.add({ targets: this.chatDOM, alpha: 1, duration: 250, ease: 'Power2' });
            }
            // ПОКАЗЫВАЕМ HTML СПИСОК КОНТАКТОВ
            if (this.contactsDOM) {
                this.contactsDOM.setAlpha(0).setVisible(true);
                this.tweens.add({ targets: this.contactsDOM, alpha: 1, duration: 250, ease: 'Power2' });
            }

            if (this.activeContact) {
                this.renderChat();
                this.processChatQueue(this.activeContact);
            }
        }
    }

    closeOverlay(overlayTarget) {
        this.sound.play('closeClick');

        if (overlayTarget === this.overlayPhone) {
            if (this.chatDOM) this.tweens.add({ targets: this.chatDOM, alpha: 0, duration: 150 });
            // ПРЯЧЕМ HTML СПИСОК КОНТАКТОВ
            if (this.contactsDOM) this.tweens.add({ targets: this.contactsDOM, alpha: 0, duration: 150 });
        }

        this.terminalDOM.setAlpha(0);
        this.terminalDOM.setVisible(true);
        this.tweens.add({
            targets: this.terminalDOM, alpha: 1, duration: 250, ease: 'Power2'
        });

        this.tweens.add({
            targets: overlayTarget,
            alpha: 0,
            duration: 150,
            onComplete: () => {
                overlayTarget.setVisible(false);
                overlayTarget.setAlpha(1);

                if (overlayTarget === this.overlayPhone) {
                    if (this.chatDOM) { this.chatDOM.setVisible(false); this.chatDOM.setAlpha(1); }
                    if (this.contactsDOM) { this.contactsDOM.setVisible(false); this.contactsDOM.setAlpha(1); }
                }

                this.scene.setVisible(true, 'UIScene');

                if (overlayTarget === this.overlayBook && this.sysState.progress === GAME_STAGE.INTRO && !this.sysState.handbookRead) {
                    this.sysState.handbookRead = true;
                    this.time.delayedCall(1500, () => {
                        this.playDing();
                        if (!this.overlayPhone.visible) {
                            this.phoneShake.resume();
                        }
                        this.accStatus.setText('Гл. Бухгалтер 🔴').setFill('#ff5555');
                        this.chatData['Гл. Бухгалтер'].queue = [...DIALOGS.accountant.intro];
                        if (this.overlayPhone.visible && this.activeContact === 'Гл. Бухгалтер') {
                            this.processChatQueue('Гл. Бухгалтер');
                        }
                    });
                }
            }
        });
    }

    createOverlays() {
        this.overlayMap = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bgMap = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.85).setInteractive();

        let contentContainer = this.add.container(0, 0);

        // 1. Создаем графику
        let schemeImg = this.add.image(0, 0, 'network_map');
        schemeImg.setDisplaySize(1000, 562);
        let frameMap = this.add.rectangle(0, 0, 1004, 566).setStrokeStyle(4, 0x2b5278);

        // 2. Создаем кнопку закрытия ДО добавления в контейнер
        let closeMap = this.add.text(530, -290, '✖', { font: '36px Arial', fill: '#ff5555' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeMap.on('pointerover', () => closeMap.setScale(1.2).setFill('#ff7777'));
        closeMap.on('pointerout', () => closeMap.setScale(1).setFill('#ff5555'));
        closeMap.on('pointerdown', () => {
            this.tweens.add({ targets: this.overlayMap.contentContainer, scale: 0.9, y: 20, duration: 150, ease: 'Power2' });
            this.closeOverlay(this.overlayMap);
        });

        // 3. Создаем невидимую зону клика для серверной
        let routerHitZone = this.add.rectangle(0, -60, 150, 100, 0xff0000, 0)
            .setInteractive({ useHandCursor: true });

        routerHitZone.on('pointerdown', () => {
            if (this.sysState.progress >= GAME_STAGE.INC3_TASK_RECEIVED) {
                this.sound.play('openClick');
                this.closeOverlay(this.overlayMap);

                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    // ВАЖНО: launch(), а не start(). start() сам останавливает вызвавшую
                    // сцену (это и вызывало "чёрный экран" - MainWorkspaceScene не засыпала,
                    // а полностью уничтожалась, и разбудить её потом было нечем).
                    // launch() запускает ServerRackScene ПАРАЛЛЕЛЬНО, не трогая спящую MainWorkspaceScene.
                    this.scene.sleep('MainWorkspaceScene');
                    this.scene.launch('ServerRackScene');
                });
            } else {
                this.showToast('💬 Вы: Пока там делать нечего, работает и ладно.');
            }
        });

        // 4. ОДИН РАЗ собираем всё в контейнер
        contentContainer.add([schemeImg, frameMap, routerHitZone, closeMap]);

        this.overlayMap.add([bgMap, contentContainer]);
        this.overlayMap.contentContainer = contentContainer;


        this.overlayBook = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bgBook = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.85).setInteractive();

        let bookHTML = `
        <div class="book-window">
            <div class="book-header">
                <div class="book-title">📘 СПРАВОЧНИК СИСАДМИНА</div>
                <div class="book-close-btn" id="book-close-x">✖</div>
            </div>
            <div class="book-content">
                <div class="book-section">
                    <h3>🎮 ПРАВИЛА ИГРЫ</h3>
                    <ol class="book-list">
                        <li><strong>Получайте задачи:</strong> Следите за входящими сообщениями от сотрудников.</li>
                        <li><strong>Управляйте Канбан-доской:</strong> Обязательно переносите задачи в работу.</li>
                        <li><strong>Решайте инциденты:</strong> Проводите диагностику через Linux-терминал.</li>
                    </ol>
                </div>
                <div class="book-section" style="border-left-color: #4fc3f7;">
                    <h3>🖥️ ИНФОРМАЦИЯ ПО СЕРВЕРАМ</h3>
                    <ul class="book-list">
                        <li><strong>Proxy:</strong> служит для раздачи интернета пользователям.</li>
                        <li style="color: #ff8a65;"><strong>Внимание:</strong> Если не установлен или не запущен антивирус Касперского на рабочей станции, доступ к интернету прекращается.</li>
                        <li><strong>SSH-доступ:</strong> Для входа по ssh на компьютеры пользователей используется учётная запись <code>admin</code>.</li>
                    </ul>
                </div>
                <div class="book-section" style="border-left-color: #ff8a65;">
                    <h3>🧙‍♂️ ПОМОЩЬ ЭКСПЕРТОВ</h3>
                    <div class="colleague-card">
                        <img src="assets/images/jora.png" class="colleague-avatar" style="border: 2px solid #ff8a65;" alt="Жорик">
                        <div class="colleague-info">
                            <h4>Жорик <span class="badge-penalty" style="background: rgba(249, 115, 22, 0.15); color: #ffb74d; border-color: rgba(249, 115, 22, 0.3);">Минус 5 баллов</span></h4>
                            <p>Весельчак и душа компании. Отлично шарит в компьютерах, но часто подходит к работе слишком легкомысленно.</p>
                        </div>
                    </div>
                    <div class="colleague-card">
                        <img src="assets/images/magistr.png" class="colleague-avatar" style="border: 2px solid #4fc3f7;" alt="Магистр">
                        <div class="colleague-info">
                            <h4>Магистр <span class="badge-penalty">Минус 10 баллов</span></h4>
                            <p>Строгий профессионал, мастер своего дела. Знает архитектуру систем наизусть.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        this.bookDOM = this.add.dom(0, 0).createFromHTML(bookHTML);
        this.bookDOM.addListener('click');

        this.bookDOM.on('click', (event) => {
            if (event.target.id === 'book-close-x') {
                this.tweens.add({ targets: this.bookDOM, scale: 0.9, y: 20, duration: 150, ease: 'Power2' });
                this.closeOverlay(this.overlayBook);
            }
        });

        this.overlayBook.add([bgBook, this.bookDOM]);

        this.createMessengerUI();
        this.createKanbanUI();
    }

    createKanbanUI() {
        this.overlayKanban = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bgK = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive();
        let closeK = this.add.text(520, -320, '✖', { font: '36px Arial', fill: '#ff0000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeK.on('pointerdown', () => this.closeOverlay(this.overlayKanban));

        let kanbanHTML = `
        <div class="kanban-board">
            <div class="kanban-column" data-col="Очередь"><div class="kanban-header">Очередь <span class="task-count">0</span></div>
                <div class="kanban-tasks">
                    <div class="kanban-task" id="task-1" style="display: none;">Не работает 1С</div>
                    <div class="kanban-task" id="task-2" style="display: none; border-left-color: #ba68c8;">Нет интернета (Директор)</div>
                    <div class="kanban-task" id="task-3" style="display: none; border-left-color: #ff5555;">Глобально пропал интернет</div>
                </div>
            </div>
            <div class="kanban-column" data-col="В работе"><div class="kanban-header">В работе <span class="task-count">0</span></div><div class="kanban-tasks"></div></div>
            <div class="kanban-column" data-col="Проверка"><div class="kanban-header">Проверка <span class="task-count">0</span></div><div class="kanban-tasks"></div></div>
            <div class="kanban-column" data-col="Готово"><div class="kanban-header">Готово <span class="task-count">0</span></div><div class="kanban-tasks"></div></div>
        </div>`;

        this.kanbanDOM = this.add.dom(0, 0).createFromHTML(kanbanHTML);
        this.kanbanDOM.addListener('click');
        this.kanbanDOM.on('click', (event) => {
            if (event.target.id === 'task-1' || event.target.closest('#task-1')) {
                if (this.sysState.progress === GAME_STAGE.TASK_RECEIVED) {

                    // === ДОБАВЛЯЕМ ЗВУК ТУТ ===
                    this.sound.play('popMsg');

                    this.sysState.progress = GAME_STAGE.WORKING;
                    this.updateKanbanBoard();
                    this.guruStatus.setText('Магистр 🟢').setFill('#00ff00');
                    this.antiGuruStatus.setText('Жорик 🟢').setFill('#00ff00');
                    this.showToast('Задача в работе. Подсказки в чате разблокированы.');
                }
            }
            if (event.target.id === 'task-2' || event.target.closest('#task-2')) {
                if (this.sysState.progress === GAME_STAGE.DIR_TASK_RECEIVED) {

                    // === И ТУТ ТОЖЕ ===
                    this.sound.play('popMsg');

                    this.sysState.progress = GAME_STAGE.DIR_WORKING;
                    this.updateKanbanBoard();
                    this.guruStatus.setText('Магистр 🟢').setFill('#00ff00');
                    this.antiGuruStatus.setText('Жорик 🟢').setFill('#00ff00');
                }
            }
            if (event.target.id === 'task-3' || event.target.closest('#task-3')) {
                if (this.sysState.progress === GAME_STAGE.INC3_TASK_RECEIVED) {
                    this.sound.play('popMsg');

                    this.sysState.progress = GAME_STAGE.INC3_WORKING;
                    this.updateKanbanBoard();
                    this.guruStatus.setText('Магистр 🟢').setFill('#00ff00');
                    this.antiGuruStatus.setText('Жорик 🟢').setFill('#00ff00');
                    this.showToast('Задача в работе. Проверьте сеть через терминал.');
                }
            }
        });

        this.overlayKanban.add([bgK, this.kanbanDOM, closeK]);
    }

    updateKanbanBoard() {
        const task1 = document.getElementById('task-1');
        const task2 = document.getElementById('task-2');
        const task3 = document.getElementById('task-3');

        if (typeof moveTask !== 'undefined') {
            if (task1 && this.sysState.progress >= GAME_STAGE.TASK_RECEIVED) {
                task1.style.display = 'block';
                if (this.sysState.progress === GAME_STAGE.TASK_RECEIVED) moveTask(task1, 'Очередь');
                if (this.sysState.progress === GAME_STAGE.WORKING) moveTask(task1, 'В работе');
                if (this.sysState.progress === GAME_STAGE.CHECKING) moveTask(task1, 'Проверка');
                if (this.sysState.progress >= GAME_STAGE.FINISHED) moveTask(task1, 'Готово');
            }

            if (task2 && this.sysState.progress >= GAME_STAGE.DIR_TASK_RECEIVED) {
                task2.style.display = 'block';
                if (this.sysState.progress === GAME_STAGE.DIR_TASK_RECEIVED) moveTask(task2, 'Очередь');
                if (this.sysState.progress === GAME_STAGE.DIR_WORKING) moveTask(task2, 'В работе');
                if (this.sysState.progress === GAME_STAGE.DIR_CHECKING) moveTask(task2, 'Проверка');
                if (this.sysState.progress >= GAME_STAGE.DIR_FINISHED) moveTask(task2, 'Готово');
            }

            if (task3 && this.sysState.progress >= GAME_STAGE.INC3_TASK_RECEIVED) {
                task3.style.display = 'block';
                if (this.sysState.progress === GAME_STAGE.INC3_TASK_RECEIVED) moveTask(task3, 'Очередь');
                if (this.sysState.progress === GAME_STAGE.INC3_WORKING) moveTask(task3, 'В работе');
                if (this.sysState.progress === GAME_STAGE.INC3_CHECKING) moveTask(task3, 'Проверка');
                if (this.sysState.progress >= GAME_STAGE.INC3_FINISHED) moveTask(task3, 'Готово');
            }
        }

        document.querySelectorAll('.kanban-column').forEach(col => {
            let countSpan = col.querySelector('.task-count');
            if (countSpan) {
                let visibleCount = Array.from(col.querySelectorAll('.kanban-task')).filter(t => t.style.display !== 'none').length;
                countSpan.innerText = visibleCount;
            }
        });
    }

    createMessengerUI() {
        const phone = new PhoneMessenger(this);
        phone.bindToScene();
    }

    openChat(contactName) {
        this.activeContact = contactName;
        this.chatHeader.setText(contactName);

        if (contactName === 'Гл. Бухгалтер' && (this.sysState.progress === GAME_STAGE.INTRO || this.sysState.progress === GAME_STAGE.CHECKING)) {
            this.accStatus.setText('Гл. Бухгалтер 🟢').setFill('#00ff00');
        }

        if (contactName === 'Директор' && (this.sysState.progress === GAME_STAGE.DIR_INTRO || this.sysState.progress === GAME_STAGE.DIR_CHECKING)) {
            this.dirStatus.setText('Директор 🟢').setFill('#00ff00');
        }

        this.renderChat();
        this.processChatQueue(contactName);
    }

    processChatQueue(contactName) {
        if (this.activeContact !== contactName || !this.overlayPhone.visible) return;
        let data = this.chatData[contactName];

        if (data && data.queue && data.queue.length > 0 && !data.isTyping) {
            data.isTyping = true;
            this.renderChat();

            this.time.delayedCall(1500, () => {
                if (this.activeContact !== contactName || !this.overlayPhone.visible) {
                    data.isTyping = false;
                    return;
                }

                let msg = data.queue.shift();
                if (msg) {
                    data.history += (data.history === '' ? '' : '\n\n') + msg;
                    this.sound.play('popMsg');
                }

                data.isTyping = false;
                this.renderChat();

                if (data.queue.length === 0) {
                    this.finishDialog(contactName);
                } else {
                    this.processChatQueue(contactName);
                }
            });
        }
    }

    renderChat() {
        let data = this.chatData[this.activeContact];
        let element = document.getElementById('chat-body');
        if (!element || !data) return;

        let typingIndicator = data.isTyping ? '\n\n<div class="typing-indicator"><span></span><span></span><span></span></div>' : '';
        element.innerHTML = this.buildChatHTML(data) + typingIndicator;

        try { element.scrollTop = element.scrollHeight; } catch (e) { }

        this.chatHintBtn.setVisible(false);
        if (this.chatNextBtn) this.chatNextBtn.setVisible(false);

        if (data.waitingForNext) {
            this.chatNextBtn.setVisible(true);
            this.chatNextBtn.removeAllListeners('pointerdown');
            this.chatNextBtn.on('pointerdown', () => {
                data.waitingForNext = false;
                this.handleDialogNext(this.activeContact);
            });
        }
        else if (data.queue.length === 0 && !data.hintBought && (this.sysState.progress === GAME_STAGE.WORKING || this.sysState.progress === GAME_STAGE.DIR_WORKING || this.sysState.progress === GAME_STAGE.INC3_WORKING) && (this.activeContact === 'Магистр' || this.activeContact === 'Жорик')) {
            this.chatHintBtn.setVisible(true);
            this.chatHintBtn.removeAllListeners('pointerdown');
            this.chatHintBtn.on('pointerdown', () => this.buyHint(data));
        }
    }

    buildChatHTML(data) {
        if (!data.history && data.queue.length === 0 && !data.hintBought) return '<div style="text-align: center; color: #8b9eb0; margin-top: 50px;">Сообщений пока нет...</div>';
        let htmlContent = '';
        if (data.history) {
            data.history.split('\n\n').forEach(msg => {
                if (msg.trim()) htmlContent += this.formatChatMessage(msg);
            });
        }
        return htmlContent;
    }

    formatChatMessage(msg) {
        let isOutgoing = msg.startsWith('Админ:');
        let isSystem = msg.startsWith('[');

        let text = msg, senderName = '';
        if (!isSystem) {
            let splitIndex = msg.indexOf(': ');
            if (splitIndex !== -1) { senderName = msg.substring(0, splitIndex); text = msg.substring(splitIndex + 2).trim(); }
        }

        if (isSystem) {
            return `<div style="text-align: center; color: #8b9eb0; margin: 10px 0; font-size: 14px; font-style: italic;">${text}</div>`;
        }

        let directionClass = isOutgoing ? 'right' : 'left';

        let avatarHTML = '';
        if (!isOutgoing) {
            let avatarFile = 'assets/images/obshchat.png';
            if (senderName.includes('Магистр')) avatarFile = 'assets/images/magistr.png';
            else if (senderName.includes('Жорик') || senderName.includes('Жора')) avatarFile = 'assets/images/jora.png';
            else if (senderName.includes('Главный бухгалтер') || senderName.includes('Гл. Бухгалтер')) avatarFile = 'assets/images/buhgalter.png';
            else if (senderName.includes('Бухгалтер 1') || senderName.includes('Бух 1')) avatarFile = 'assets/images/buhgalter1.png';
            else if (senderName.includes('Секретарь')) avatarFile = 'assets/images/sekretar.png';
            else if (senderName.includes('Директор')) avatarFile = 'assets/images/director.png';

            avatarHTML = `<img src="${avatarFile}" class="chat-msg-avatar" alt="avatar">`;
        }

        return `
        <div class="msg-wrapper ${directionClass}">
            ${avatarHTML}
            <div class="msg-bubble ${directionClass}">
                ${text}
            </div>
        </div>`;
    }

    buyHint(data) {
        data.hintBought = true;
        this.chatHintBtn.setVisible(false);

        // ВАЖНО: проверяем от старшего уровня к младшему. INC3_* стадии тоже >= DIR_TASK_RECEIVED,
        // поэтому если бы isLevel2 проверялась первой/единственной, на 3 задании игроку
        // ошибочно показывалась бы подсказка про антивирус со 2 задания.
        let isLevel3 = (this.sysState.progress >= GAME_STAGE.INC3_TASK_RECEIVED);
        let isLevel2 = !isLevel3 && (this.sysState.progress >= GAME_STAGE.DIR_TASK_RECEIVED);

        if (this.activeContact === 'Магистр') {
            this.updateScore(-GAME_CONFIG.SCORES.hintGuruCost);
            data.queue.push("Админ: Магистр, дайте совет. Не могу с задачей справиться.");
            data.queue.push(isLevel3 ? DIALOGS.hints.guruInc3 : (isLevel2 ? DIALOGS.hints.guruDir : DIALOGS.hints.guru));
        } else {
            this.updateScore(-GAME_CONFIG.SCORES.hintAntiGuruCost);
            data.queue.push("Админ: Привет! Не могу понять, как задачу выполнить.");
            data.queue.push(isLevel3 ? DIALOGS.hints.antiGuruInc3 : (isLevel2 ? DIALOGS.hints.antiGuruDir : DIALOGS.hints.antiGuru));
        }

        this.renderChat();
        this.processChatQueue(this.activeContact);
    }

    finishDialog(contactName) {
        let data = this.chatData[contactName];
        if (contactName === 'Гл. Бухгалтер' && (this.sysState.progress === GAME_STAGE.INTRO || this.sysState.progress === GAME_STAGE.CHECKING)) {
            data.waitingForNext = true;
            this.renderChat();
        }
        if (contactName === 'Директор' && (this.sysState.progress === GAME_STAGE.DIR_INTRO || this.sysState.progress === GAME_STAGE.DIR_CHECKING)) {
            data.waitingForNext = true;
            this.renderChat();
        }
        if (contactName === 'Общий чат' && (this.sysState.progress === GAME_STAGE.INC3_INTRO || this.sysState.progress === GAME_STAGE.INC3_CHECKING)) {
            data.waitingForNext = true;
            this.renderChat();
        }
    }

    handleDialogNext(contactName) {
        let data = this.chatData[contactName];

        if (contactName === 'Гл. Бухгалтер') {
            if (this.sysState.progress === GAME_STAGE.INTRO) {
                this.sysState.progress = GAME_STAGE.TASK_RECEIVED;
                this.showToast('Проверь задачи на доске и возьми задачу в работу');
                this.playDing();
                this.updateKanbanBoard();
                this.renderChat();
            } else if (this.sysState.progress === GAME_STAGE.CHECKING) {
                this.sysState.progress = GAME_STAGE.FINISHED;
                this.showToast('Задание 1 успешно выполнено!');
                this.playDing();
                data.history = '[ Чат заархивирован. Задание успешно выполнено. ]';
                this.accStatus.setText('Гл. Бухгалтер ⚪').setFill('#888888');
                this.renderChat();
                this.updateKanbanBoard();

                this.time.delayedCall(4000, () => {
                    this.sysState.progress = GAME_STAGE.DIR_INTRO;
                    this.playDing();
                    if (!this.overlayPhone.visible) {
                        this.phoneShake.resume();
                    }

                    this.chatData['Магистр'].hintBought = false;
                    this.chatData['Жорик'].hintBought = false;
                    this.guruStatus.setText('Магистр ⚪').setFill('#888888');
                    this.antiGuruStatus.setText('Жорик ⚪').setFill('#888888');

                    this.dirStatus.setText('Директор 🔴').setFill('#ff5555');

                    this.chatData['Директор'].queue = [...DIALOGS.director.intro, 'Админ: Уже смотрю.'];

                    if (this.overlayPhone.visible && this.activeContact === 'Директор') {
                        this.processChatQueue('Директор');
                    }
                });
            }
        }

        if (contactName === 'Директор') {
            if (this.sysState.progress === GAME_STAGE.DIR_INTRO) {
                this.sysState.progress = GAME_STAGE.DIR_TASK_RECEIVED;
                this.showToast('Проверь задачи на доске и возьми задачу Директора в работу');
                this.playDing();
                this.updateKanbanBoard();
                this.renderChat();
            } else if (this.sysState.progress === GAME_STAGE.DIR_CHECKING) {
                this.sysState.progress = GAME_STAGE.DIR_FINISHED;
                this.showToast('Задание 2 успешно выполнено! Вы великолепны!');
                this.playDing();
                data.history = '[ Чат заархивирован. Задание успешно выполнено. ]';
                this.dirStatus.setText('Директор ⚪').setFill('#888888');
                this.renderChat();
                this.updateKanbanBoard();

                this.time.delayedCall(4000, () => {
                    this.sysState.progress = GAME_STAGE.INC3_INTRO;
                    this.playDing();
                    if (!this.overlayPhone.visible) {
                        this.phoneShake.resume();
                    }

                    this.chatData['Магистр'].hintBought = false;
                    this.chatData['Жорик'].hintBought = false;
                    this.guruStatus.setText('Магистр ⚪').setFill('#888888');
                    this.antiGuruStatus.setText('Жорик ⚪').setFill('#888888');

                    this.generalChatStatus.setText('Общий чат 🔴').setFill('#ff5555');
                    this.chatData['Общий чат'].queue = [...DIALOGS.generalChat.intro];

                    if (this.overlayPhone.visible && this.activeContact === 'Общий чат') {
                        this.processChatQueue('Общий чат');
                    }
                });
            }
        }

        if (contactName === 'Общий чат') {
            if (this.sysState.progress === GAME_STAGE.INC3_INTRO) {
                this.sysState.progress = GAME_STAGE.INC3_TASK_RECEIVED;
                this.showToast('Проверь задачи на доске и возьми задачу в работу');
                this.playDing();
                this.updateKanbanBoard();
                this.renderChat();
            } else if (this.sysState.progress === GAME_STAGE.INC3_CHECKING) {
                this.sysState.progress = GAME_STAGE.INC3_FINISHED;
                this.showToast('Задание 3 успешно выполнено! Интернет восстановлен во всей компании.');
                this.playDing();
                data.history = '[ Чат заархивирован. Задание успешно выполнено. ]';
                this.generalChatStatus.setText('Общий чат ⚪').setFill('#888888');
                this.renderChat();
                this.updateKanbanBoard();
            }
        }
    }

    shutdown() {
        if (this.vTerm && this.vTerm.term) this.vTerm.term.dispose();
        let chatBody = document.getElementById('chat-body');
        if (chatBody) chatBody.innerHTML = '';
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    dom: { createContainer: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, LoadingScene, IntroScene, MainWorkspaceScene, ServerRackScene, UIScene]
};
const game = new Phaser.Game(config);






