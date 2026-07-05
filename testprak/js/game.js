// ==========================================
// ОСНОВНАЯ ИГРА (game.js) - ИСПРАВЛЕННЫЙ UI И АНИМАЦИИ
// ==========================================

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    
    preload() {
        // --- КАРТИНКИ ---
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
        this.scene.start('IntroScene'); 
        this.scene.launch('UIScene'); 
    }
}

// ==========================================
// НОВАЯ СЦЕНА: ГЛОБАЛЬНЫЙ UI И ЗВУК
// ==========================================
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
        this.add.image(640, 360, 'stol').setDisplaySize(1280, 720);

        this.wires = [
            { id: 'wo',  name: 'БО', texture: 'orange' },
            { id: 'o',   name: 'О',  texture: 'orange2' },
            { id: 'wg',  name: 'БЗ', texture: 'green' },
            { id: 'b',   name: 'С',  texture: 'blue2' },
            { id: 'wb',  name: 'БС', texture: 'blue' },
            { id: 'g',   name: 'З',  texture: 'green2' },
            { id: 'wbr', name: 'БК', texture: 'brown' },
            { id: 'br',  name: 'К',  texture: 'brown2' }
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
            // Плавно уводим экран в черный за полсекунды
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainWorkspaceScene', { currentScore: this.score }); 
            });
        });
        this.add.text(640, 60, 'ПРОВЕРКА КВАЛИФИКАЦИИ', { font: '32px Arial', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
        this.add.text(640, 100, 'В какой последовательности вы порекомендуете мороженое друзьям?', { font: '22px Arial', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
        
        // ИСПРАВЛЕНИЕ: Улучшенное качество и стиль надписи
        this.selectionText = this.add.text(640, 560, 'Ваш выбор: ', { 
            fontFamily: 'Arial', 
            fontSize: '24px', 
            fontWeight: 'bold',
            fill: '#ffffff', 
            stroke: '#000000', 
            strokeThickness: 2 
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4, true, true);
        
        this.statusText = this.add.text(640, 640, '', { font: '26px Arial', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5);
        this.createDialogUI();
        this.initTest();
    }

    // === 1. СОЗДАНИЕ УЛУЧШЕННОГО ИНТЕРФЕЙСА ДИАЛОГОВ ===
    createDialogUI() {
        this.dialogOverlay = this.add.container(640, 360).setDepth(100).setVisible(false);
        this.isDialogClosing = false; // Блокировка от спам-кликов
        
        // Темный фон (чуть прозрачнее, чтобы не полностью перекрывать игру)
        this.dialogBg = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6).setInteractive();
        this.dialogBg.on('pointerdown', () => this.advanceDialog());

        // Внутренний контейнер для анимации самого окна
        this.dialogBox = this.add.container(0, 0);

        // Мягкая тень
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.4);
        shadow.fillRoundedRect(-220 + 12, -160 + 12, 440, 320, 16);

        // Основной фон (стиль темной темы Telegram/Discord)
        const boxBg = this.add.graphics();
        boxBg.fillStyle(0x17212b, 1); 
        boxBg.fillRoundedRect(-220, -160, 440, 320, 16);
        boxBg.lineStyle(2, 0x2b5278, 1);
        boxBg.strokeRoundedRect(-220, -160, 440, 320, 16);

        // Круглая подложка под аватарку
        this.dialogAvatarBg = this.add.circle(-150, -100, 32, 0x2b5278);
        this.dialogAvatarIcon = this.add.text(-150, -100, '👤', { font: '32px Arial' }).setOrigin(0.5);

        // Имя отправителя
        this.dialogSenderText = this.add.text(-100, -100, 'Отправитель', { 
            font: 'bold 24px Arial', fill: '#ffffff' 
        }).setOrigin(0, 0.5);

        // Тонкий разделитель
        const line = this.add.graphics();
        line.lineStyle(1, 0x242f3d, 1);
        line.lineBetween(-220, -45, 220, -45);

        // Текст сообщения
        this.dialogMessageText = this.add.text(0, 40, 'Текст сообщения', { 
            font: '20px Arial', fill: '#e4e6eb', wordWrap: { width: 380 }, align: 'center', lineSpacing: 6
        }).setOrigin(0.5);

        // Подсказка "Кликни дальше" (пульсирующая)
        this.dialogHint = this.add.text(0, 135, 'Кликни, чтобы продолжить ▼', { 
            font: 'italic 14px Arial', fill: '#6ab2f2' 
        }).setOrigin(0.5);

        // Анимация пульсации подсказки
        this.tweens.add({
            targets: this.dialogHint, alpha: 0.3, yoyo: true, repeat: -1, duration: 800
        });

        this.dialogBox.add([shadow, boxBg, this.dialogAvatarBg, this.dialogAvatarIcon, this.dialogSenderText, line, this.dialogMessageText, this.dialogHint]);
        this.dialogOverlay.add([this.dialogBg, this.dialogBox]);
    }

    // === 2. ВЫЗОВ ДИАЛОГА С АНИМАЦИЕЙ ===
    // === 2. ВЫЗОВ ДИАЛОГА С АНИМАЦИЕЙ ===
    showDialog(sender, messages, isGameOver = false) {
        this.isGameOverState = isGameOver; 
        this.activeMessages = messages; 
        this.currentMessageIndex = 0;
        this.isDialogClosing = false;

        this.dialogSenderText.setText(sender);
        
        // Настройка аватарок под персонажей (Game Juice)
        if (sender === 'Жорик') {
            this.dialogSenderText.setFill('#ff8a65');
            this.dialogAvatarBg.setFillStyle(0xff8a65, 0.15); // Полупрозрачный фон цвета персонажа
            this.dialogAvatarIcon.setText('👾');
        } else if (sender === 'Магистр') {
            this.dialogSenderText.setFill('#4fc3f7');
            this.dialogAvatarBg.setFillStyle(0x4fc3f7, 0.15);
            this.dialogAvatarIcon.setText('🧙‍♂️');
        } else if (sender === 'Директор') {
            this.dialogSenderText.setFill('#ffd54f');
            this.dialogAvatarBg.setFillStyle(0xffd54f, 0.15);
            this.dialogAvatarIcon.setText('💼');
        } else {
            this.dialogSenderText.setFill('#ffffff');
            this.dialogAvatarBg.setFillStyle(0x555555, 0.15);
            this.dialogAvatarIcon.setText('👤');
        }

        this.dialogMessageText.setText(this.activeMessages[0]);
        
        // ВОЗВРАЩАЕМ ЗВУКИ: Открытие окна и звук первого сообщения
        this.sound.play('openClick');
        this.sound.play('popMsg');

        // --- Анимация появления ---
        this.dialogOverlay.setVisible(true);
        this.dialogBg.setAlpha(0);
        this.dialogBox.setScale(0.7).setAlpha(0).setY(40); // Окно выплывает немного снизу

        this.tweens.add({ targets: this.dialogBg, alpha: 1, duration: 250 });
        this.tweens.add({ 
            targets: this.dialogBox, scale: 1, alpha: 1, y: 0, 
            duration: 400, ease: 'Back.out' // Эффект приятной отдачи
        });
    }

    // === 3. ПЕРЕКЛЮЧЕНИЕ ФРАЗ И ЗАКРЫТИЕ ===
    advanceDialog() {
        if (this.isDialogClosing) return; // Защита от спам-кликов

        this.currentMessageIndex++;
        
        if (this.currentMessageIndex < this.activeMessages.length) {
            // ВОЗВРАЩАЕМ ЗВУКИ: Звук каждого следующего сообщения
            this.sound.play('popMsg');

            // Микро-анимация смены текста ("вспышка" размера)
            this.dialogMessageText.setText(this.activeMessages[this.currentMessageIndex]);
            this.dialogMessageText.setScale(0.9);
            this.dialogMessageText.setAlpha(0.5);
            this.tweens.add({ 
                targets: this.dialogMessageText, scale: 1, alpha: 1, 
                duration: 200, ease: 'Back.out' 
            });
        } else {
            // ВОЗВРАЩАЕМ ЗВУКИ: Звук закрытия окна
            this.sound.play('closeClick');

            // --- Анимация закрытия ---
            this.isDialogClosing = true;
            this.tweens.add({ targets: this.dialogBg, alpha: 0, duration: 200 });
            this.tweens.add({
                targets: this.dialogBox, scale: 0.8, alpha: 0, y: 20, 
                duration: 200, ease: 'Power2',
                onComplete: () => {
                    this.dialogOverlay.setVisible(false);
                    // Возвращаем переменные в норму для следующих диалогов
                    this.dialogBox.setScale(1).setAlpha(1).setY(0); 
                    
                    // Логика игры после диалога
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
        
        // Идеальный центр для 8 элементов с отступом 110
        const startX = 255; 
        const spacing = 110; 
        const targetY = 500; 

        shuffled.forEach((wire, index) => {
            let container = this.add.container(startX + (index * spacing), targetY);
            container.setDepth(2); 

            // 1. Тень под размер 85
            let shadow = this.add.image(4, 6, wire.texture);
            shadow.setDisplaySize(75, 75);
            shadow.setTint(0x000000); 
            shadow.setAlpha(0.35);    

            // 2. Мороженое размером 85
            let iceCream = this.add.image(0, 0, wire.texture);
            iceCream.setDisplaySize(75, 75); 
            
            // 3. Зона клика размером 85
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
        
        // Тут логика поиска по имени для строки «Ваш выбор» работает отлично, 
        // так как данные берутся из оригинального массива this.wires в памяти
        let currentString = this.playerSelection.map(id => this.wires.find(w => w.id === id).name).join('-');
        this.selectionText.setText('Ваш выбор: ' + currentString);
        
        if (this.playerSelection.length === 8) {
            this.isLocked = true; 
            let isSuccessB = this.playerSelection.every((id, index) => id === this.solutionT568B[index]);
            let isSuccessA = this.playerSelection.every((id, index) => id === this.solutionT568A[index]);

            if (isSuccessB || isSuccessA) {
                this.statusText.setText('УСПЕХ! ВЫ ПРОШЛИ ТЕСТ.').setFill('#00ff00');
                
                // ИСПРАВЛЕНИЕ: Плавный уход в темноту при победе
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
class MainWorkspaceScene extends Phaser.Scene {
    constructor() { super('MainWorkspaceScene'); }
    
    init(data) { this.totalScore = data.currentScore || 0; }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.cameras.main.setBackgroundColor(GAME_CONFIG.COLORS.bg);

        this.sysState = { 
            progress: GAME_STAGE.INTRO, 
            handbookRead: false,
            pingAccDone: false,
            pingNeighborDone: false,
            pingYaRuDone: false 
        };

        this.chatData = {
            'Гл. Бухгалтер': { history: '', queue: [], hintBought: false, isTyping: false, waitingForNext: false },
            'Директор': { history: '', queue: [], hintBought: false, isTyping: false, waitingForNext: false },
            'Магистр': { history: '', queue: [], hintBought: false, isTyping: false, waitingForNext: false },
            'Жорик': { history: '', queue: [], hintBought: false, isTyping: false, waitingForNext: false }
        };

        this.scoreText = this.add.text(30, 30, 'Баллы: ' + this.totalScore, { font: 'bold 24px Arial', fill: '#ffff00' }).setOrigin(0, 0).setDepth(20);

        this.add.rectangle(640, 600, 1280, 240, 0x8b4513); 

        this.add.rectangle(235, 225, 380, 250, 0x000000, 0.2); 
        const board = this.add.rectangle(230, 220, 380, 250, 0x3a3f44).setInteractive({ useHandCursor: true });
        this.add.rectangle(230, 220, 360, 230, 0xffffff); 
        this.add.rectangle(140, 220, 2, 230, 0xe0e6ed); 
        this.add.rectangle(230, 220, 2, 230, 0xe0e6ed); 
        this.add.rectangle(320, 220, 2, 230, 0xe0e6ed); 

        this.add.rectangle(95, 120, 76, 14, 0xf0f2f5);
        this.add.rectangle(185, 120, 76, 14, 0xf0f2f5);
        this.add.rectangle(275, 120, 76, 14, 0xf0f2f5);
        this.add.rectangle(365, 120, 76, 14, 0xf0f2f5);

        this.add.rectangle(95, 150, 70, 28, 0xffeb3b).setAngle(-2); 
        this.add.rectangle(95, 185, 70, 28, 0xffeb3b).setAngle(1);  
        this.add.rectangle(185, 155, 70, 28, 0x4fc3f7).setAngle(3); 
        this.add.rectangle(275, 145, 70, 28, 0xffb74d).setAngle(-1); 
        this.add.rectangle(365, 150, 70, 28, 0x81c784).setAngle(2);  
        this.add.rectangle(365, 185, 70, 28, 0x81c784).setAngle(-2); 
        this.add.rectangle(365, 220, 70, 28, 0x81c784).setAngle(1);

        const book = this.add.container(150, 610).setDepth(2);
        const bookBg = this.add.rectangle(0, 0, 140, 100, 0x2b2b2b).setStrokeStyle(2, 0x555555);
        const bookSpine = this.add.rectangle(-60, 0, 20, 100, 0x1a1a1a); 
        const bookText = this.add.text(10, 0, 'СПРАВОЧНИК', { font: 'bold 16px Courier', fill: '#cccccc' }).setOrigin(0.5);
        book.add([bookBg, bookSpine, bookText]);
        book.setInteractive(new Phaser.Geom.Rectangle(-70, -50, 140, 100), Phaser.Geom.Rectangle.Contains).input.cursor = 'pointer';

        const networkMap = this.add.container(320, 610).setDepth(2);
        const mapBg = this.add.rectangle(0, 0, 160, 100, 0x0a1910).setStrokeStyle(2, 0x00aa00);
        const mapTextHeader = this.add.text(0, -15, 'СХЕМА СЕТИ', { font: 'bold 18px Courier', fill: '#00ff00' }).setOrigin(0.5);
        const mapTextIP = this.add.text(0, 20, '192.168.8.x', { font: '14px Courier', fill: '#008800' }).setOrigin(0.5);
        networkMap.add([mapBg, mapTextHeader, mapTextIP]);
        networkMap.setInteractive(new Phaser.Geom.Rectangle(-80, -50, 160, 100), Phaser.Geom.Rectangle.Contains).input.cursor = 'pointer';

        book.on('pointerover', () => { bookBg.setStrokeStyle(2, 0xffa500); bookText.setColor('#ffa500'); });
        book.on('pointerout', () => { bookBg.setStrokeStyle(2, 0x555555); bookText.setColor('#cccccc'); });
        
        networkMap.on('pointerover', () => { mapBg.setStrokeStyle(2, 0xffffff); mapTextHeader.setColor('#ffffff'); });
        networkMap.on('pointerout', () => { mapBg.setStrokeStyle(2, 0x00aa00); mapTextHeader.setColor('#00ff00'); });

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

        let termHTML = '<div id="terminal-container" style="width: 750px; height: 450px; background-color: #000; padding: 15px 25px 15px 15px; border: 3px solid #333; overflow: hidden; user-select: text; box-sizing: border-box;"></div>';
        this.terminalDOM = this.add.dom(830, 300).createFromHTML(termHTML);
        
        if (typeof Terminal !== 'undefined') {
            let xterm = new Terminal({ cursorBlink: true, cols: 74, theme: { background: '#000000' } });
            const termElement = document.getElementById('terminal-container');
            if (termElement) {
                xterm.open(termElement);
                xterm.write('Welcome to Linux-Server v2.4\r\nuser@sysadmin:/home/sysadmin$ ');
                this.vTerm = new VirtualTerminal(xterm, this); 
            }
        }

        // ИСПРАВЛЕНИЕ: Терминал стартует прозрачным и появляется синхронно с камерой (1000 мс)
        this.terminalDOM.setAlpha(0);
        this.tweens.add({
            targets: this.terminalDOM,
            alpha: 1,
            duration: 1000,
            ease: 'Power2' // Power2 делает эффект растворения более мягким
        });

        this.startWorkingDay();
    }

    startWorkingDay() {
        this.time.delayedCall(1000, () => this.showToast('💬 Вы: Фух, начался первый рабочий день...'));
        this.time.delayedCall(6500, () => this.showToast('💬 Вы: Надо бы заглянуть в справочник.'));
    }

    showToast(msg) {
        if (msg.startsWith('💬 Вы:')) {
            try { this.sound.play('mumble', { volume: 0.8 }); } catch(e) {}
        }
        let toast = this.add.text(640, 680, msg, { font: '20px Arial', fill: '#fff', backgroundColor: '#000000aa', padding: { x: 10, y: 10 } }).setOrigin(0.5).setDepth(200);
        this.tweens.add({ targets: toast, alpha: 0, delay: 4000, duration: 1000, onComplete: () => toast.destroy() });
    }

    playDing() {
        try { this.sound.play('dzin'); } catch(e) {}
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
                this.updateScore(-5);
                this.showToast('Штраф -5 баллов: Не проверен ping интернета с вашего ПК!');
            } else {
                this.showToast('Антивирус запущен! Сообщите Директору в чате.');
            }

            this.dirStatus.setText('Директор 🔴').setFill('#ff5555');
            this.chatData['Директор'].queue = [...DIALOGS.director.outro];
            this.updateKanbanBoard();
            
            if (this.overlayPhone.visible && this.activeContact === 'Директор') this.processChatQueue('Директор');
        }
    }

    openOverlay(overlayTarget) { 
        this.sound.play('openClick'); 
        
        this.tweens.add({
            targets: this.terminalDOM,
            alpha: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                this.terminalDOM.setVisible(false);
            }
        });
        
        this.scene.setVisible(false, 'UIScene');
        
        overlayTarget.setAlpha(0);
        overlayTarget.setVisible(true); 
        this.tweens.add({ targets: overlayTarget, alpha: 1, duration: 250, ease: 'Power2' });

        if (overlayTarget === this.overlayPhone && this.chatDOM) {
            this.chatDOM.setAlpha(0);
            this.chatDOM.setVisible(true);
            this.tweens.add({ targets: this.chatDOM, alpha: 1, duration: 250, ease: 'Power2' });

            if (this.activeContact) {
                this.renderChat();
                this.processChatQueue(this.activeContact);
            }
        }
    }
    
    closeOverlay(overlayTarget) { 
        this.sound.play('closeClick'); 

        if (overlayTarget === this.overlayPhone && this.chatDOM) {
            this.tweens.add({ targets: this.chatDOM, alpha: 0, duration: 150 });
        }

        this.terminalDOM.setAlpha(0);
        this.terminalDOM.setVisible(true);
        this.tweens.add({
            targets: this.terminalDOM,
            alpha: 1,
            duration: 250,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: overlayTarget,
            alpha: 0,
            duration: 150,
            onComplete: () => {
                overlayTarget.setVisible(false); 
                overlayTarget.setAlpha(1); 
                
                if (overlayTarget === this.overlayPhone && this.chatDOM) {
                    this.chatDOM.setVisible(false);
                    this.chatDOM.setAlpha(1);
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

        let schemeImg = this.add.image(0, 0, 'network_map');
        schemeImg.setDisplaySize(1000, 562); 
        let frameMap = this.add.rectangle(0, 0, 1004, 566).setStrokeStyle(4, 0x2b5278);
        let closeMap = this.add.text(530, -290, '✖', { font: '36px Arial', fill: '#ff5555' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeMap.on('pointerover', () => closeMap.setScale(1.2).setFill('#ff7777'));
        closeMap.on('pointerout', () => closeMap.setScale(1).setFill('#ff5555'));
        
        contentContainer.add([schemeImg, frameMap, closeMap]);
        this.overlayMap.add([bgMap, contentContainer]);
        
        this.overlayMap.contentContainer = contentContainer;

        closeMap.on('pointerdown', () => {
            this.tweens.add({ targets: this.overlayMap.contentContainer, scale: 0.9, y: 20, duration: 150, ease: 'Power2' });
            this.closeOverlay(this.overlayMap);
        });

        this.overlayBook = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bgBook = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.85).setInteractive();

        // ИСПРАВЛЕНИЕ: Добавлен 4-й пункт с локальным администратором
        let bookHTML = `
        <div class="book-window">
            <div class="book-header"><div class="book-title">📘 СПРАВОЧНИК СИСАДМИНА</div><div class="book-close-btn" id="book-close-x">✖</div></div>
            <div class="book-content">
                <div class="book-section">
                    <h3>🎮 ПРАВИЛА ИГРЫ</h3>
                    <ol class="book-list">
                        <li><strong>Получайте задачи:</strong> Следите за входящими сообщениями от сотрудников.</li>
                        <li><strong>Управляйте Канбан-доской:</strong> Обязательно переносите задачи в работу.</li>
                        <li><strong>Решайте инциденты:</strong> Проводите диагностику через Linux-терминал.</li>
                        <li><strong>Локальный администратор:</strong> Используйте логин <code>admin</code>.</li>
                    </ol>
                </div>
                <div class="book-section" style="border-left-color: #ff8a65;">
                    <h3>🧙‍♂️ ПОМОЩЬ ЭКСПЕРТОВ</h3>
                    <div class="colleague-card">
                        <div class="colleague-avatar">👾</div>
                        <div class="colleague-info">
                            <h4>Жорик <span class="badge-penalty" style="background: rgba(249, 115, 22, 0.15); color: #ffb74d; border-color: rgba(249, 115, 22, 0.3);">Минус 5 баллов</span></h4>
                            <p>Весельчак и душа компании. Отлично шарит в компьютерах, но часто подходит к работе слишком легкомысленно.</p>
                        </div>
                    </div>
                    <div class="colleague-card">
                        <div class="colleague-avatar">🧙‍♂️</div>
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
        
        // ИСПРАВЛЕНИЕ: Убрали текст "Задача 1" и "Задача 2" с карточек
        let kanbanHTML = `
        <div class="kanban-board">
            <div class="kanban-column" data-col="Очередь"><div class="kanban-header">Очередь <span class="task-count">0</span></div>
                <div class="kanban-tasks">
                    <div class="kanban-task" id="task-1" style="display: none;">Не работает 1С</div>
                    <div class="kanban-task" id="task-2" style="display: none; border-left-color: #ba68c8;">Нет интернета (Директор)</div>
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
                    this.sysState.progress = GAME_STAGE.WORKING; 
                    this.updateKanbanBoard();
                    this.guruStatus.setText('Магистр 🟢').setFill('#00ff00');
                    this.antiGuruStatus.setText('Жорик 🟢').setFill('#00ff00');
                    this.showToast('Задача в работе. Подсказки в чате разблокированы.');
                }
            }
            if (event.target.id === 'task-2' || event.target.closest('#task-2')) {
                if (this.sysState.progress === GAME_STAGE.DIR_TASK_RECEIVED) {
                    this.sysState.progress = GAME_STAGE.DIR_WORKING; 
                    this.updateKanbanBoard();
                    this.guruStatus.setText('Магистр 🟢').setFill('#00ff00');
                    this.antiGuruStatus.setText('Жорик 🟢').setFill('#00ff00');
                    this.showToast('💬 Вы: Задание сложное, наверное нужно набрать команду help в терминале и посмотреть, какие команды доступны...');
                }
            }
        });

        this.overlayKanban.add([bgK, this.kanbanDOM, closeK]);
    }

    updateKanbanBoard() {
        const task1 = document.getElementById('task-1');
        const task2 = document.getElementById('task-2');

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
                if (this.sysState.progress === GAME_STAGE.DIR_FINISHED) moveTask(task2, 'Готово');
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
        this.overlayPhone = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bgPhone = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.85).setInteractive();
        let appBg = this.add.rectangle(0, 0, 1000, 600, 0x0e1621).setStrokeStyle(1, 0x2b3e51); 
        let leftPanel = this.add.rectangle(-350, 0, 300, 600, 0x17212b); 
        let chatHeaderBg = this.add.rectangle(150, -270, 700, 60, 0x17212b); 
        
        let closePhone = this.add.text(470, -270, '✖', { font: '24px Arial', fill: '#ff5555' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closePhone.on('pointerdown', () => this.closeOverlay(this.overlayPhone));

        this.add.text(-480, -270, 'КОНТАКТЫ', { font: '14px Arial', fill: '#6ab2f2', fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.rectangle(-350, -240, 300, 1, 0x242f3d);
        
        const contacts = this.createContactList();
        this.chatHeader = this.add.text(-170, -270, 'Выберите чат', { font: '20px Arial', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
        
        let chatHTML = `<div id="chat-body" style="width: 630px; height: 430px; overflow-y: auto; color: #e4e6eb; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; padding: 10px 20px; box-sizing: border-box; text-align: left; white-space: pre-wrap;"></div>`;
        this.chatDOM = this.add.dom(775, 340).createFromHTML(chatHTML).setVisible(false);

        this.chatHintBtn = this.add.text(150, 250, '💡 ВЗЯТЬ ПОДСКАЗКУ', { 
            font: '14px Arial', fill: '#ffffff', backgroundColor: '#2b5278', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        this.chatNextBtn = this.add.text(150, 250, '➤ ДАЛЕЕ', { 
            font: '14px Arial', fill: '#ffffff', backgroundColor: '#2b5278', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        this.overlayPhone.add([
            bgPhone, appBg, leftPanel, chatHeaderBg, closePhone, 
            contacts.guru.bg, contacts.guru.avatarBg, contacts.guru.avatarIcon, contacts.guru.statusText, contacts.guru.separator,
            contacts.antiGuru.bg, contacts.antiGuru.avatarBg, contacts.antiGuru.avatarIcon, contacts.antiGuru.statusText, contacts.antiGuru.separator,
            contacts.acc.bg, contacts.acc.avatarBg, contacts.acc.avatarIcon, contacts.acc.statusText, contacts.acc.separator,
            contacts.dir.bg, contacts.dir.avatarBg, contacts.dir.avatarIcon, contacts.dir.statusText, contacts.dir.separator,
            this.chatHeader, this.chatHintBtn, this.chatNextBtn
        ]);
    }

    createContactList() {
        const createContact = (y, name, color, avatarColor, emoji) => {
            let bg = this.add.rectangle(-350, y, 300, 65, 0x17212b).setInteractive({ useHandCursor: true });
            let avatarBg = this.add.circle(-455, y, 22, avatarColor);
            let avatarIcon = this.add.text(-455, y, emoji, { font: '22px Arial' }).setOrigin(0.5);
            let statusText = this.add.text(-415, y, name, { font: '17px Arial', fill: color, fontStyle: 'bold' }).setOrigin(0, 0.5);
            let separator = this.add.rectangle(-350, y + 32, 270, 1, 0x0e1621);
            return { bg, avatarBg, avatarIcon, statusText, separator };
        };

        let guru = createContact(-200, 'Магистр ⚪', '#888888', 0x4fc3f7, '🧙‍♂️');
        this.guruStatus = guru.statusText;
        guru.bg.on('pointerdown', () => this.openChat('Магистр'));

        let antiGuru = createContact(-135, 'Жорик ⚪', '#888888', 0xff8a65, '👾');
        this.antiGuruStatus = antiGuru.statusText;
        antiGuru.bg.on('pointerdown', () => this.openChat('Жорик'));

        let acc = createContact(-70, 'Гл. Бухгалтер 🟢', '#00ff00', 0xe57373, '👩‍💼');
        this.accStatus = acc.statusText;
        acc.bg.on('pointerdown', () => this.openChat('Гл. Бухгалтер'));

        let dir = createContact(-5, 'Директор ⚪', '#888888', 0xba68c8, '👔');
        this.dirStatus = dir.statusText;
        dir.bg.on('pointerdown', () => this.openChat('Директор'));

        return { guru, antiGuru, acc, dir };
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

        let typingIndicator = data.isTyping ? '\n\n<span style="color:#8b9eb0; font-style:italic;">печатает...</span>' : '';
        element.innerHTML = this.buildChatHTML(data) + typingIndicator;
        
        try { element.scrollTop = element.scrollHeight; } catch(e){}

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
        else if (data.queue.length === 0 && !data.hintBought && (this.sysState.progress === GAME_STAGE.WORKING || this.sysState.progress === GAME_STAGE.DIR_WORKING) && (this.activeContact === 'Магистр' || this.activeContact === 'Жорик')) {
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

        let avatarIcon = '👤', avatarColor = '#555555';
        if (senderName === 'Гл. Бухгалтер') { avatarIcon = '👩‍💼'; avatarColor = '#e57373'; }
        else if (senderName === 'Директор') { avatarIcon = '👔'; avatarColor = '#ba68c8'; }
        else if (senderName === 'Магистр') { avatarIcon = '🧙‍♂️'; avatarColor = '#4fc3f7'; }
        else if (senderName === 'Жорик') { avatarIcon = '👾'; avatarColor = '#ff8a65'; }

        if (isSystem) return `<div style="text-align: center; margin: 15px 0;"><span style="background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 12px; font-size: 13px; color: #8b9eb0;">${text}</span></div>`;
        if (isOutgoing) return `<div style="display: flex; justify-content: flex-end; align-items: flex-end; margin-bottom: 12px;"><div style="background: #2b5278; color: #fff; padding: 10px 14px; border-radius: 14px 14px 0 14px; max-width: 65%; font-size: 15px;">${text}</div><div style="width: 36px; height: 36px; border-radius: 50%; background: #1e88e5; display: flex; justify-content: center; align-items: center; margin-left: 10px; flex-shrink: 0; font-size: 18px;">👨‍💻</div></div>`;
        return `<div style="display: flex; justify-content: flex-start; align-items: flex-end; margin-bottom: 12px;"><div style="width: 36px; height: 36px; border-radius: 50%; background: ${avatarColor}; display: flex; justify-content: center; align-items: center; margin-right: 10px; flex-shrink: 0; font-size: 18px;">${avatarIcon}</div><div style="background: #182533; color: #e4e6eb; padding: 10px 14px; border-radius: 14px 14px 14px 0; max-width: 65%; font-size: 15px; border: 1px solid #22303f;">${text}</div></div>`;
    }

    buyHint(data) {
        data.hintBought = true; 
        this.chatHintBtn.setVisible(false);
        
        let isLevel2 = (this.sysState.progress >= GAME_STAGE.DIR_TASK_RECEIVED);
        
        if (this.activeContact === 'Магистр') {
            this.updateScore(-GAME_CONFIG.SCORES.hintGuruCost);
            data.queue.push("Админ: Магистр, дайте совет. Не могу с задачей справиться.");
            data.queue.push(isLevel2 ? DIALOGS.hints.guruDir : DIALOGS.hints.guru);
        } else {
            this.updateScore(-GAME_CONFIG.SCORES.hintAntiGuruCost);
            data.queue.push("Админ: Привет! Не могу понять, как задачу выполнить.");
            data.queue.push(isLevel2 ? DIALOGS.hints.antiGuruDir : DIALOGS.hints.antiGuru);
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
                    
                    // ИСПРАВЛЕНИЕ: Добавлено сообщение "Админ: Уже смотрю."
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
    scene: [BootScene, IntroScene, MainWorkspaceScene, UIScene] 
};
const game = new Phaser.Game(config);