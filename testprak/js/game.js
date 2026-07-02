// ==========================================
// ОСНОВНАЯ ИГРА (game.js) - ИСПРАВЛЕННЫЙ UI И ЧАТ
// ==========================================

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        // --- КАРТИНКИ ---
        this.load.image('blue2', 'assets/images/blue2.png');
        this.load.image('blue', 'assets/images/blue.png');
        this.load.image('orange', 'assets/images/orange.png');
        this.load.image('orange2', 'assets/images/orange2.png');
        this.load.image('brown', 'assets/images/brown.png');
        this.load.image('brown2', 'assets/images/brown2.png');
        this.load.image('green', 'assets/images/green.png');
        this.load.image('green2', 'assets/images/green2.png');
        this.load.image('stol', 'assets/images/stol.png');
        
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
        skipBtn.on('pointerdown', () => { this.scene.start('MainWorkspaceScene', { currentScore: this.score }); });

        this.add.text(640, 60, 'ПРОВЕРКА КВАЛИФИКАЦИИ', { font: '32px Arial', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
        this.add.text(640, 100, 'В какой последовательности вы порекомендуете мороженое друзьям?', { font: '22px Arial', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
        this.selectionText = this.add.text(640, 560, 'Ваш выбор: ', { font: '24px Courier', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
        this.statusText = this.add.text(640, 640, '', { font: '26px Arial', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5);

        this.createDialogUI();
        this.initTest();
    }

    createDialogUI() {
        this.dialogOverlay = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bg = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive();
        let phoneBg = this.add.rectangle(0, 0, 350, 500, 0x2b2b2b);
        phoneBg.setStrokeStyle(4, 0x555555);
        this.dialogSenderText = this.add.text(0, -200, 'Отправитель', { font: '24px Arial', fill: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5);
        this.dialogMessageText = this.add.text(0, 0, 'Текст сообщения', { font: '20px Arial', fill: '#ffffff', wordWrap: { width: 300 } }).setOrigin(0.5);
        this.dialogHint = this.add.text(0, 220, '(Кликни по экрану, чтобы читать дальше)', { font: '14px Arial', fill: '#888888' }).setOrigin(0.5);
        this.dialogOverlay.add([bg, phoneBg, this.dialogSenderText, this.dialogMessageText, this.dialogHint]);
        bg.on('pointerdown', () => this.advanceDialog());
    }

    showDialog(sender, messages, isGameOver = false) {
        this.isGameOverState = isGameOver; this.activeMessages = messages; this.currentMessageIndex = 0;
        this.dialogSenderText.setText(sender);
        if (sender === 'Жорик') this.dialogSenderText.setFill('#ff5555');
        else if (sender === 'Магистр') this.dialogSenderText.setFill('#55aaff');
        else this.dialogSenderText.setFill('#ffff00');
        this.dialogMessageText.setText(this.activeMessages[0]);
        
        this.sound.play('openClick');
        this.sound.play('popMsg');
        this.dialogOverlay.setAlpha(0);
        this.dialogOverlay.setVisible(true);
        this.tweens.add({ targets: this.dialogOverlay, alpha: 1, duration: 250, ease: 'Power2' });
    }

    advanceDialog() {
        this.currentMessageIndex++;
        if (this.currentMessageIndex < this.activeMessages.length) {
            this.dialogMessageText.setText(this.activeMessages[this.currentMessageIndex]);
            this.sound.play('popMsg'); 
        } else {
            this.sound.play('closeClick');
            this.tweens.add({
                targets: this.dialogOverlay,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                    this.dialogOverlay.setVisible(false);
                    this.dialogOverlay.setAlpha(1); 
                    if (this.isGameOverState) this.scene.restart(); else this.initTest();
                }
            });
        }
    }

    initTest() {
        this.playerSelection = []; this.selectionText.setText('Ваш выбор: '); this.statusText.setText(''); this.isLocked = false; 
        this.interactiveItems.forEach(item => item.destroy()); this.interactiveItems = [];
        let shuffled = [...this.wires].sort(() => Math.random() - 0.5);
        const startX = 150; const spacing = 140; const targetY = 450; 

        shuffled.forEach((wire, index) => {
            let container = this.add.container(startX + (index * spacing), targetY);
            let iceCream = this.add.image(0, 0, wire.texture);
            iceCream.setDisplaySize(185, 185);
            let hitArea = this.add.rectangle(0, 0, 185, 185, 0x000000, 0).setInteractive({ useHandCursor: true });
            let label = this.add.text(0, -110, wire.name, { font: 'bold 20px Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
            container.add([iceCream, hitArea, label]);
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
                this.time.delayedCall(1500, () => { this.scene.start('MainWorkspaceScene', { currentScore: this.score }); });
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
        this.cameras.main.fadeIn(1500, 0, 0, 0);
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

        const createUIButton = (x, y, width, height, bgColor, text, iconEmoji, textColor) => {
            const container = this.add.container(x, y);

            const shadow = this.add.graphics();
            shadow.fillStyle(0x000000, 0.4);
            shadow.fillRoundedRect(-width / 2 + 6, -height / 2 + 6, width, height, 12);

            const bg = this.add.graphics();
            const drawBg = (strokeAlpha) => {
                bg.clear();
                bg.fillStyle(bgColor, 1);
                bg.lineStyle(2, 0xffffff, strokeAlpha); 
                bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
                bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
            };
            drawBg(0.2); 

            const icon = this.add.text(0, -15, iconEmoji, { font: '32px Arial' }).setOrigin(0.5);
            const labelText = this.add.text(0, 25, text, { font: 'bold 15px Arial', fill: textColor }).setOrigin(0.5);

            container.add([shadow, bg, icon, labelText]);
            
            const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
            container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
            container.input.cursor = 'pointer';
            
            container.on('pointerover', () => {
                this.tweens.add({ targets: container, y: y - 5, duration: 150, ease: 'Power2' });
                drawBg(0.8); 
            });
            container.on('pointerout', () => {
                this.tweens.add({ targets: container, y: y, duration: 150, ease: 'Power2' });
                drawBg(0.2); 
            });
            container.on('pointerdown', () => {
                container.setScale(0.95);
                shadow.clear();
                shadow.fillStyle(0x000000, 0.2); 
                shadow.fillRoundedRect(-width / 2 + 2, -height / 2 + 2, width, height, 12); 
            });
            container.on('pointerup', () => {
                container.setScale(1);
                shadow.clear();
                shadow.fillStyle(0x000000, 0.4);
                shadow.fillRoundedRect(-width / 2 + 6, -height / 2 + 6, width, height, 12);
            });
            return container;
        };

        const book = createUIButton(130, 600, 140, 100, 0x1d4ed8, 'СПРАВОЧНИК', '📘', '#ffffff');
        const networkMap = createUIButton(310, 600, 160, 120, 0xf8fafc, 'СХЕМА СЕТИ', '🗺️', '#0f172a');

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

        this.createOverlays();

        networkMap.on('pointerdown', () => this.openOverlay(this.overlayMap));
        this.phoneObj.on('pointerdown', () => {
            this.phoneShake.pause();
            this.phoneObj.setAngle(0);
            this.openOverlay(this.overlayPhone);
        });
        board.on('pointerdown', () => {
            this.openOverlay(this.overlayKanban);
            this.updateKanbanBoard();
        });
        book.on('pointerdown', () => this.openOverlay(this.overlayBook));

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

        this.startWorkingDay();
    }

    startWorkingDay() {
        this.time.delayedCall(1000, () => this.showToast('💬 Вы: Фух, начался первый рабочий день...'));
        this.time.delayedCall(6500, () => this.showToast('💬 Вы: Надо бы заглянуть в справочник.'));
    }

    showToast(msg) {
        // Если это мысль героя, проигрываем звук бормотания (громкость можно подкрутить)
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

    // ИСПРАВЛЕНИЕ: Прячем микшер при открытии ЛЮБОГО окна
    openOverlay(overlayTarget) { 
        this.sound.play('openClick'); 
        this.terminalDOM.setVisible(false); 
        
        // Отключаем видимость сцены UIScene
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
    
    // ИСПРАВЛЕНИЕ: Возвращаем микшер при закрытии окна
    closeOverlay(overlayTarget) { 
        this.sound.play('closeClick'); 

        if (overlayTarget === this.overlayPhone && this.chatDOM) {
            this.tweens.add({ targets: this.chatDOM, alpha: 0, duration: 150 });
        }

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
                
                this.terminalDOM.setVisible(true); 
                this.scene.setVisible(true, 'UIScene');

                if (overlayTarget === this.overlayBook && this.sysState.progress === GAME_STAGE.INTRO && !this.sysState.handbookRead) {
                    this.sysState.handbookRead = true; 
                    this.time.delayedCall(1500, () => {
                        this.playDing();
                        
                        // ИСПРАВЛЕНИЕ: Трясем телефон, только если он закрыт
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
        let bgMap = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive();
        let closeMap = this.add.text(420, -270, '✖', { font: '36px Arial', fill: '#ff0000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeMap.on('pointerdown', () => this.closeOverlay(this.overlayMap));
        this.overlayMap.add([bgMap, this.add.rectangle(0, 0, 900, 600, 0xffffee), this.add.text(0, 0, '[ ТУТ БУДЕТ КАРТИНКА СХЕМЫ ]', { font: '32px Arial', fill: '#aaaaaa' }).setOrigin(0.5), closeMap]);

        this.overlayBook = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bgBook = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.85).setInteractive();

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
                    </ol>
                </div>
                <div class="book-section" style="border-left-color: #ff8a65;">
                    <h3>🧙‍♂️ ПОДСКАЗКИ КОЛЛЕГ</h3>
                    <div class="colleague-card">
                        <div class="colleague-avatar">👾</div>
                        <div class="colleague-info">
                            <h4>Жорик <span class="badge-penalty">Штраф: 5 баллов</span></h4>
                            <p>Весельчак и душа компании. Отлично шарит в компьютерах, но жуткий раздолбай.</p>
                        </div>
                    </div>
                    <div class="colleague-card">
                        <div class="colleague-avatar">🧙‍♂️</div>
                        <div class="colleague-info">
                            <h4>Магистр <span class="badge-penalty" style="background: rgba(249, 115, 22, 0.15); color: #ffb74d; border-color: rgba(249, 115, 22, 0.3);">Штраф: 10 баллов</span></h4>
                            <p>Строгий профессионал, мастер своего дела. Знает архитектуру систем наизусть.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        this.bookDOM = this.add.dom(0, 0).createFromHTML(bookHTML);
        this.bookDOM.addListener('click');
        this.bookDOM.on('click', (event) => { if (event.target.id === 'book-close-x') this.closeOverlay(this.overlayBook); });
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
                    <div class="kanban-task" id="task-1" style="display: none;">Задача 1:<br>Не работает 1С</div>
                    <div class="kanban-task" id="task-2" style="display: none; border-left-color: #ba68c8;">Задача 2:<br>Нет интернета (Директор)</div>
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

    // ИСПРАВЛЕНИЕ: Интеллектуальная пауза чата, если закрыт телефон
    processChatQueue(contactName) {
        // Если игрок закрыл телефон, мы не продолжаем очередь (Она на паузе)
        if (this.activeContact !== contactName || !this.overlayPhone.visible) return; 
        let data = this.chatData[contactName];
        
        if (data && data.queue && data.queue.length > 0 && !data.isTyping) {
            data.isTyping = true;
            this.renderChat(); 
            
            this.time.delayedCall(1500, () => {
                // Если за время таймера (1.5 сек) игрок успел закрыть окно - СТОП!
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
                    
                    // ИСПРАВЛЕНИЕ: Трясем телефон, только если он закрыт
                    if (!this.overlayPhone.visible) {
                        this.phoneShake.resume();
                    }
                    
                    this.chatData['Магистр'].hintBought = false;
                    this.chatData['Жорик'].hintBought = false;
                    this.guruStatus.setText('Магистр ⚪').setFill('#888888');
                    this.antiGuruStatus.setText('Жорик ⚪').setFill('#888888');

                    this.dirStatus.setText('Директор 🔴').setFill('#ff5555');
                    this.chatData['Директор'].queue = [...DIALOGS.director.intro];
                    
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