// ==========================================
// ОСНОВНАЯ ИГРА (game.js) - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ==========================================

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    // ВОЗВРАЩЕНО: Теперь игра стартует с теста!
    create() { this.scene.start('IntroScene'); }
}

// ВОЗВРАЩЕНО: Полный код входного теста (Мороженое)
class IntroScene extends Phaser.Scene {
    constructor() { super('IntroScene'); }
    
    create() {
        this.cameras.main.setBackgroundColor(GAME_CONFIG.COLORS.bg);
        this.wires = [
            { id: 'wo', name: 'БО', color: 0xffcc99 }, { id: 'o',  name: 'О',  color: 0xff8800 },
            { id: 'wg', name: 'БЗ', color: 0xccffcc }, { id: 'b',  name: 'С',  color: 0x0066ff },
            { id: 'wb', name: 'БС', color: 0x99ccff }, { id: 'g',  name: 'З',  color: 0x009900 },
            { id: 'wbr',name: 'БК', color: 0xd2b48c }, { id: 'br', name: 'К',  color: 0x8b4513 }
        ];
        this.solutionT568B = ['wo', 'o', 'wg', 'b', 'wb', 'g', 'wbr', 'br'];
        this.solutionT568A = ['wg', 'g', 'wo', 'b', 'wb', 'o', 'wbr', 'br'];

        this.score = GAME_CONFIG.SCORES.initialScore; 
        this.mistakesCount = 0; 
        this.playerSelection = []; 
        this.interactiveItems = []; 
        this.isLocked = false; 

        this.scoreText = this.add.text(30, 30, 'Баллы: ' + this.score, { font: GAME_CONFIG.FONTS.large, fill: GAME_CONFIG.COLORS.yellow, fontStyle: 'bold' });
        
        const skipBtn = this.add.text(1250, 30, '[ ПРОПУСТИТЬ ТЕСТ ]', { font: '18px Arial', fill: '#dddddd' }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        skipBtn.on('pointerdown', () => { this.scene.start('MainWorkspaceScene', { currentScore: this.score }); });

        this.add.text(640, 60, 'ПРОВЕРКА КВАЛИФИКАЦИИ', { font: '32px Arial', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
        this.add.text(640, 100, 'В какой последовательности вы порекомендуете мороженое друзьям?', { font: '22px Arial', fill: '#222222', fontStyle: 'bold' }).setOrigin(0.5);
        this.selectionText = this.add.text(640, 560, 'Ваш выбор: ', { font: '24px Courier', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
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
        this.dialogOverlay.setVisible(true);
    }

    advanceDialog() {
        this.currentMessageIndex++;
        if (this.currentMessageIndex < this.activeMessages.length) {
            this.dialogMessageText.setText(this.activeMessages[this.currentMessageIndex]);
        } else {
            this.dialogOverlay.setVisible(false);
            if (this.isGameOverState) this.scene.restart(); else this.initTest();
        }
    }

    initTest() {
        this.playerSelection = []; this.selectionText.setText('Ваш выбор: '); this.statusText.setText(''); this.isLocked = false; 
        this.interactiveItems.forEach(item => item.destroy()); this.interactiveItems = [];
        let shuffled = [...this.wires].sort(() => Math.random() - 0.5);
        const startX = 230; const spacing = 115;

        shuffled.forEach((wire, index) => {
            let container = this.add.container(startX + (index * spacing), 360);
            let cup = this.add.rectangle(0, 40, 60, 60, 0xcccccc);
            let scoop = this.add.circle(0, -10, 40, wire.color);
            let hitArea = this.add.rectangle(0, 15, 80, 120, 0x000000, 0).setInteractive({ useHandCursor: true });
            let label = this.add.text(0, -90, wire.name, { font: '20px Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
            container.add([cup, scoop, hitArea, label]);
            this.interactiveItems.push(container);
            hitArea.on('pointerdown', () => this.handleSelection(wire, container));
        });
    }

    handleSelection(wire, container) {
        if (this.isLocked) return; 
        const index = this.playerSelection.indexOf(wire.id);
        if (index > -1) { this.playerSelection.splice(index, 1); container.setAlpha(1); } 
        else { this.playerSelection.push(wire.id); container.setAlpha(0.2); }
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
            pingNeighborDone: false
        };

        this.chatData = {
            'Гл. Бухгалтер': { history: '', queue: [...DIALOGS.accountant.intro], hintBought: false, isTyping: false },
            'Магистр': { history: '', queue: [], hintBought: false, isTyping: false },
            'Жорик': { history: '', queue: [], hintBought: false, isTyping: false }
        };

        this.add.rectangle(640, 600, 1280, 240, 0x8b4513); 

        // Игровые объекты на столе
        this.add.rectangle(235, 225, 380, 250, 0x000000, 0.2); 
        const board = this.add.rectangle(230, 220, 380, 250, 0x3a3f44).setInteractive({ useHandCursor: true });
        this.add.rectangle(230, 220, 360, 230, 0xffffff); 
        this.add.rectangle(140, 220, 2, 230, 0xe0e6ed); 
        this.add.rectangle(230, 220, 2, 230, 0xe0e6ed); 
        this.add.rectangle(320, 220, 2, 230, 0xe0e6ed); 

        // Имитация заголовков колонок
        this.add.rectangle(95, 120, 76, 14, 0xf0f2f5);
        this.add.rectangle(185, 120, 76, 14, 0xf0f2f5);
        this.add.rectangle(275, 120, 76, 14, 0xf0f2f5);
        this.add.rectangle(365, 120, 76, 14, 0xf0f2f5);

        // Декоративные стикеры с задачами
        this.add.rectangle(95, 150, 70, 28, 0xffeb3b).setAngle(-2); 
        this.add.rectangle(95, 185, 70, 28, 0xffeb3b).setAngle(1);  
        this.add.rectangle(185, 155, 70, 28, 0x4fc3f7).setAngle(3); 
        this.add.rectangle(275, 145, 70, 28, 0xffb74d).setAngle(-1); 
        this.add.rectangle(365, 150, 70, 28, 0x81c784).setAngle(2);  
        this.add.rectangle(365, 185, 70, 28, 0x81c784).setAngle(-2); 
        this.add.rectangle(365, 220, 70, 28, 0x81c784).setAngle(1);

        // === УЛУЧШЕННЫЕ КНОПКИ (Справочник и Схема сети) ===
        // Вспомогательная функция для создания красивых интерактивных кнопок
        const createUIButton = (x, y, width, height, bgColor, text, iconEmoji, textColor) => {
            const container = this.add.container(x, y);

            // 1. Отрисовка тени со скруглениями
            const shadow = this.add.graphics();
            shadow.fillStyle(0x000000, 0.4);
            shadow.fillRoundedRect(-width / 2 + 6, -height / 2 + 6, width, height, 12);

            // 2. Отрисовка основного фона кнопки
            const bg = this.add.graphics();
            const drawBg = (strokeAlpha) => {
                bg.clear();
                bg.fillStyle(bgColor, 1);
                bg.lineStyle(2, 0xffffff, strokeAlpha); // Полупрозрачная обводка
                bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
                bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
            };
            drawBg(0.2); // Изначальная прозрачность обводки

            // 3. Контент кнопки (Иконка и текст)
            const icon = this.add.text(0, -15, iconEmoji, { font: '32px Arial' }).setOrigin(0.5);
            const labelText = this.add.text(0, 25, text, { 
                font: 'bold 15px Arial', 
                fill: textColor 
            }).setOrigin(0.5);

            container.add([shadow, bg, icon, labelText]);
            
            // 4. Настройка хитбокса (интерактивной зоны)
            const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
            container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
            container.input.cursor = 'pointer';

            // --- Анимации (Game Juice) ---
            
            // При наведении мыши (Hover)
            container.on('pointerover', () => {
                this.tweens.add({ targets: container, y: y - 5, duration: 150, ease: 'Power2' });
                drawBg(0.8); // Подсвечиваем рамку
            });

            // Когда мышь уходит (Mouse out)
            container.on('pointerout', () => {
                this.tweens.add({ targets: container, y: y, duration: 150, ease: 'Power2' });
                drawBg(0.2); // Возвращаем рамку в исходное состояние
            });

            // Эффект нажатия (Active / Pointer down)
            container.on('pointerdown', () => {
                container.setScale(0.95);
                shadow.clear();
                shadow.fillStyle(0x000000, 0.2); // Тень становится светлее
                shadow.fillRoundedRect(-width / 2 + 2, -height / 2 + 2, width, height, 12); // Тень прижимается
            });

            // Отпускание кнопки (Pointer up)
            container.on('pointerup', () => {
                container.setScale(1);
                shadow.clear();
                shadow.fillStyle(0x000000, 0.4);
                shadow.fillRoundedRect(-width / 2 + 6, -height / 2 + 6, width, height, 12);
            });

            return container;
        };

        // Создаем обновленные кнопки (я немного сдвинул их для идеального выравнивания)
        const book = createUIButton(130, 600, 140, 100, 0x1d4ed8, 'СПРАВОЧНИК', '📘', '#ffffff');
        const networkMap = createUIButton(310, 600, 160, 120, 0xf8fafc, 'СХЕМА СЕТИ', '🗺️', '#0f172a');
        // ========================================================

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

        let termHTML = '<div id="terminal-container" style="width: 750px; height: 450px; background-color: #000; padding: 15px; border: 3px solid #333; overflow: hidden; user-select: text; box-sizing: border-box;"></div>';
        this.terminalDOM = this.add.dom(830, 300).createFromHTML(termHTML);
        
        if (typeof Terminal !== 'undefined') {
            let xterm = new Terminal({ cursorBlink: true, theme: { background: '#000000' } });
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
        this.time.delayedCall(4500, () => this.showToast('💬 Вы: Надо бы заглянуть в справочник.'));
    }

    showToast(msg) {
        let toast = this.add.text(640, 680, msg, { font: '20px Arial', fill: '#fff', backgroundColor: '#000000aa', padding: { x: 10, y: 10 } }).setOrigin(0.5).setDepth(200);
        this.tweens.add({ targets: toast, alpha: 0, delay: 3000, duration: 1000, onComplete: () => toast.destroy() });
    }

    playDing() {
        let flash = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.1).setDepth(500);
        this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
    }

    updateScore(amount) { this.totalScore += amount; }

    checkTerminalProgress() {
        if (this.sysState.progress === GAME_STAGE.WORKING && this.sysState.pingAccDone && this.sysState.pingNeighborDone) {
            this.sysState.progress = GAME_STAGE.CHECKING;
            this.playDing();
            this.showToast('Проверь задачи на доске и возьми задачу в работу');
            this.accStatus.setText('Гл. Бухгалтер 🔴').setFill('#ff5555');
            
            this.chatData['Гл. Бухгалтер'].queue = [...DIALOGS.accountant.outro];
            this.updateKanbanBoard();
        }
    }

    openOverlay(overlayTarget) { 
        this.terminalDOM.setVisible(false); 
        overlayTarget.setVisible(true); 
        if (overlayTarget === this.overlayPhone && this.chatDOM) this.chatDOM.setVisible(true);
    }
    
    closeOverlay(overlayTarget) { 
        overlayTarget.setVisible(false); 
        this.terminalDOM.setVisible(true); 
        if (overlayTarget === this.overlayPhone && this.chatDOM) this.chatDOM.setVisible(false);

        if (overlayTarget === this.overlayBook && this.sysState.progress === GAME_STAGE.INTRO && !this.sysState.handbookRead) {
            this.sysState.handbookRead = true; 
            this.time.delayedCall(2000, () => {
                this.playDing();
                this.phoneShake.resume(); 
                this.accStatus.setText('Гл. Бухгалтер 🔴').setFill('#ff5555'); 
            });
        }
    }

    createOverlays() {
        this.overlayMap = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bgMap = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive();
        let closeMap = this.add.text(420, -270, '✖', { font: '36px Arial', fill: '#ff0000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeMap.on('pointerdown', () => this.closeOverlay(this.overlayMap));
        this.overlayMap.add([bgMap, this.add.rectangle(0, 0, 900, 600, 0xffffee), this.add.text(0, 0, '[ ТУТ БУДЕТ КАРТИНКА СХЕМЫ ]', { font: '32px Arial', fill: '#aaaaaa' }).setOrigin(0.5), closeMap]);

        // === УЛУЧШЕННОЕ ОКНО СПРАВОЧНИКА (HTML-верстка) ===
        this.overlayBook = this.add.container(640, 360).setDepth(100).setVisible(false);
        
        // Затемняющий фон заднего плана
        let bgBook = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.85).setInteractive();

        // HTML-структура и встроенные стили для Справочника
        let bookHTML = `
        <style>
            .book-window {
                width: 760px;
                height: 520px;
                background: #141b24;
                border: 2px solid #2b5278;
                border-radius: 12px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #e4e6eb;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                user-select: none;
                text-align: left;
            }
            .book-header {
                background: #17212b;
                padding: 14px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #242f3d;
            }
            .book-title {
                font-size: 18px;
                font-weight: bold;
                color: #6ab2f2;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .book-close-btn {
                color: #ff5555;
                font-size: 22px;
                cursor: pointer;
                transition: transform 0.15s ease, color 0.15s ease;
                line-height: 1;
            }
            .book-close-btn:hover {
                transform: scale(1.2);
                color: #ff7777;
            }
            .book-content {
                padding: 25px;
                overflow-y: auto;
                flex: 1;
            }
            /* Кастомный скроллбар в стиле интерфейса */
            .book-content::-webkit-scrollbar {
                width: 8px;
            }
            .book-content::-webkit-scrollbar-track {
                background: #0e1621;
            }
            .book-content::-webkit-scrollbar-thumb {
                background: #242f3d;
                border-radius: 4px;
            }
            .book-content::-webkit-scrollbar-thumb:hover {
                background: #2b5278;
            }
            .book-section {
                background: #182533;
                border-left: 4px solid #2b5278;
                padding: 16px;
                border-radius: 0 8px 8px 0;
                margin-bottom: 24px;
                border: 1px solid #22303f;
                border-left: 4px solid #6ab2f2;
            }
            .book-section h3 {
                margin-top: 0;
                margin-bottom: 12px;
                color: #ffffff;
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .book-list {
                margin: 0;
                padding-left: 20px;
                line-height: 1.6;
            }
            .book-list li {
                margin-bottom: 10px;
                color: #ced4da;
            }
            .book-list strong {
                color: #6ab2f2;
            }
            .colleague-card {
                display: flex;
                align-items: center;
                background: #0e1621;
                padding: 14px;
                border-radius: 8px;
                margin-bottom: 12px;
                border: 1px solid #242f3d;
            }
            .colleague-avatar {
                font-size: 32px;
                margin-right: 16px;
                background: #17212b;
                width: 48px;
                height: 48px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 50%;
                flex-shrink: 0;
            }
            .colleague-info {
                flex: 1;
            }
            .colleague-info h4 {
                margin: 0 0 6px 0;
                font-size: 16px;
                color: #ffffff;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .colleague-info p {
                margin: 0;
                font-size: 14px;
                color: #94a3b8;
                line-height: 1.4;
            }
            .badge-penalty {
                background: rgba(239, 68, 68, 0.15);
                color: #ff5555;
                padding: 3px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                border: 1px solid rgba(239, 68, 68, 0.3);
            }
        </style>
        <div class="book-window">
            <div class="book-header">
                <div class="book-title">📘 СПРАВОЧНИК СИСАДМИНА</div>
                <div class="book-close-btn" id="book-close-x">✖</div>
            </div>
            <div class="book-content">
                <div class="book-section">
                    <h3>🎮 ПРАВИЛА ИГРЫ</h3>
                    <ol class="book-list">
                        <li><strong>Получайте задачи:</strong> Следите за входящими сообщениями от сотрудников в мессенджере.</li>
                        <li><strong>Управляйте Канбан-доской:</strong> Обязательно переносите новые задачи в работу, чтобы разблокировать подсказки.</li>
                        <li><strong>Решайте инциденты:</strong> Проводите диагностику сетей и серверов через Linux-терминал.</li>
                    </ol>
                </div>
                
                <div class="book-section" style="border-left-color: #ff8a65;">
                    <h3>🧙‍♂️ ПОДСКАЗКИ КОЛЛЕГ</h3>
                    
                    <div class="colleague-card">
                        <div class="colleague-avatar">👾</div>
                        <div class="colleague-info">
                            <h4>Жорик <span class="badge-penalty">Штраф: 5 баллов</span></h4>
                            <p>Весельчак и душа компании. Отлично шарит в компьютерах, но жуткий раздолбай. Его советы простые, но могут быть поверхностными.</p>
                        </div>
                    </div>

                    <div class="colleague-card">
                        <div class="colleague-avatar">🧙‍♂️</div>
                        <div class="colleague-info">
                            <h4>Магистр <span class="badge-penalty" style="background: rgba(249, 115, 22, 0.15); color: #ffb74d; border-color: rgba(249, 115, 22, 0.3);">Штраф: 10 баллов</span></h4>
                            <p>Строгий профессионал, мастер своего дела. Знает архитектуру систем наизусть. Его подсказки — это стопроцентное и глубокое решение инцидента.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        // Создаем DOM-элемент окна
        this.bookDOM = this.add.dom(0, 0).createFromHTML(bookHTML);

        // Слушатель клика на крестик закрытия внутри HTML
        this.bookDOM.addListener('click');
        this.bookDOM.on('click', (event) => {
            if (event.target.id === 'book-close-x') {
                this.closeOverlay(this.overlayBook);
            }
        });

        // Собираем контейнер (DOM элемент центрируется автоматически внутри контейнера)
        this.overlayBook.add([bgBook, this.bookDOM]);
        // ==========================================================
        this.createMessengerUI();
        this.createKanbanUI();
    }

    createKanbanUI() {
        this.overlayKanban = this.add.container(640, 360).setDepth(100).setVisible(false);
        
        // Темный фон позади доски
        let bgK = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive();
        
        // Кнопка закрытия
        let closeK = this.add.text(520, -320, '✖', { font: '36px Arial', fill: '#ff0000' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeK.on('pointerdown', () => this.closeOverlay(this.overlayKanban));
        
        // ВОЗВРАЩАЕМ ТОТ САМЫЙ КРАСИВЫЙ HTML-КОД ДЛЯ CSS
        let kanbanHTML = `
        <div class="kanban-board">
            <div class="kanban-column" data-col="Очередь">
                <div class="kanban-header">Очередь <span class="task-count">0</span></div>
                <div class="kanban-tasks">
                    <div class="kanban-task" id="task-1" style="display: none;">
                        Задача 1:<br>Не работает 1С
                    </div>
                </div>
            </div>
            <div class="kanban-column" data-col="В работе">
                <div class="kanban-header">В работе <span class="task-count">0</span></div>
                <div class="kanban-tasks"></div>
            </div>
            <div class="kanban-column" data-col="Проверка">
                <div class="kanban-header">Проверка <span class="task-count">0</span></div>
                <div class="kanban-tasks"></div>
            </div>
            <div class="kanban-column" data-col="Готово">
                <div class="kanban-header">Готово <span class="task-count">0</span></div>
                <div class="kanban-tasks"></div>
            </div>
        </div>`;

        // Создаем DOM элемент
        this.kanbanDOM = this.add.dom(0, 0).createFromHTML(kanbanHTML);

        // Вешаем слушатель клика на стикер
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
        });

        // Добавляем все в контейнер (kanbanDOM встанет ровно по центру)
        this.overlayKanban.add([bgK, this.kanbanDOM, closeK]);
    }

    updateKanbanBoard() {
        // Находим HTML-стикер
        const task = document.getElementById('task-1');
        if (!task) return;

        // Показываем стикер, если прогресс начался
        if (this.sysState.progress >= GAME_STAGE.TASK_RECEIVED) {
            task.style.display = 'block';
        }

        // Вызываем функцию moveTask из твоего файла kanban.js
        if (typeof moveTask !== 'undefined') {
            if (this.sysState.progress === GAME_STAGE.TASK_RECEIVED) moveTask(task, 'Очередь');
            if (this.sysState.progress === GAME_STAGE.WORKING) moveTask(task, 'В работе');
            if (this.sysState.progress === GAME_STAGE.CHECKING) moveTask(task, 'Проверка');
            if (this.sysState.progress === GAME_STAGE.FINISHED) moveTask(task, 'Готово');
        }
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
        
        // ИСПРАВЛЕНИЕ: Чат не должен перекрывать кнопку закрытия (уменьшена ширина/высота)
        let chatHTML = `<div id="chat-body" style="width: 630px; height: 430px; overflow-y: auto; color: #e4e6eb; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 16px; padding: 10px 20px; box-sizing: border-box; text-align: left; white-space: pre-wrap;"></div>`;
        this.chatDOM = this.add.dom(775, 340).createFromHTML(chatHTML).setVisible(false);

        this.chatHintBtn = this.add.text(150, 250, '💡 ВЗЯТЬ ПОДСКАЗКУ', { 
            font: '14px Arial', fill: '#ffffff', backgroundColor: '#2b5278', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        this.overlayPhone.add([
            bgPhone, appBg, leftPanel, chatHeaderBg, closePhone, 
            contacts.guru.bg, contacts.guru.avatarBg, contacts.guru.avatarIcon, contacts.guru.statusText, contacts.guru.separator,
            contacts.antiGuru.bg, contacts.antiGuru.avatarBg, contacts.antiGuru.avatarIcon, contacts.antiGuru.statusText, contacts.antiGuru.separator,
            contacts.acc.bg, contacts.acc.avatarBg, contacts.acc.avatarIcon, contacts.acc.statusText, contacts.acc.separator,
            this.chatHeader, this.chatHintBtn
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

        let guru = createContact(-190, 'Магистр ⚪', '#888888', 0x4fc3f7, '🧙‍♂️');
        this.guruStatus = guru.statusText;
        guru.bg.on('pointerdown', () => this.openChat('Магистр'));

        let antiGuru = createContact(-125, 'Жорик ⚪', '#888888', 0xff8a65, '👾');
        this.antiGuruStatus = antiGuru.statusText;
        antiGuru.bg.on('pointerdown', () => this.openChat('Жорик'));

        let acc = createContact(-60, 'Гл. Бухгалтер 🟢', '#00ff00', 0xe57373, '👩‍💼');
        this.accStatus = acc.statusText;
        acc.bg.on('pointerdown', () => this.openChat('Гл. Бухгалтер'));

        return { guru, antiGuru, acc };
    }

    openChat(contactName) {
        this.activeContact = contactName;
        this.chatHeader.setText(contactName);
        
        if (contactName === 'Гл. Бухгалтер' && (this.sysState.progress === GAME_STAGE.INTRO || this.sysState.progress === GAME_STAGE.CHECKING)) {
            this.accStatus.setText('Гл. Бухгалтер 🟢').setFill('#00ff00'); 
        }

        this.renderChat();
        this.processChatQueue(contactName);
    }

    // ИСПРАВЛЕНИЕ: Пуленепробиваемый таймер чата
    processChatQueue(contactName) {
        if (this.activeContact !== contactName) return; 
        let data = this.chatData[contactName];
        
        if (data && data.queue && data.queue.length > 0 && !data.isTyping) {
            data.isTyping = true;
            this.renderChat(); // Показываем "печатает..." сразу
            
            this.time.delayedCall(1500, () => {
                if (this.activeContact !== contactName) {
                    data.isTyping = false; 
                    return; 
                }

                let msg = data.queue.shift();
                if (msg) data.history += (data.history === '' ? '' : '\n\n') + msg;
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
        
        // Защита от сбоя при скрытом элементе
        try { element.scrollTop = element.scrollHeight; } catch(e){}

        if (data.queue.length === 0 && !data.hintBought && this.sysState.progress === GAME_STAGE.WORKING && (this.activeContact === 'Магистр' || this.activeContact === 'Жорик')) {
            this.chatHintBtn.setVisible(true);
            this.chatHintBtn.removeAllListeners('pointerdown');
            this.chatHintBtn.on('pointerdown', () => this.buyHint(data));
        } else {
            this.chatHintBtn.setVisible(false);
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
        else if (senderName === 'Магистр') { avatarIcon = '🧙‍♂️'; avatarColor = '#4fc3f7'; }
        else if (senderName === 'Жорик') { avatarIcon = '👾'; avatarColor = '#ff8a65'; }

        if (isSystem) return `<div style="text-align: center; margin: 15px 0;"><span style="background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 12px; font-size: 13px; color: #8b9eb0;">${text}</span></div>`;
        if (isOutgoing) return `<div style="display: flex; justify-content: flex-end; align-items: flex-end; margin-bottom: 12px;"><div style="background: #2b5278; color: #fff; padding: 10px 14px; border-radius: 14px 14px 0 14px; max-width: 65%; font-size: 15px;">${text}</div><div style="width: 36px; height: 36px; border-radius: 50%; background: #1e88e5; display: flex; justify-content: center; align-items: center; margin-left: 10px; flex-shrink: 0; font-size: 18px;">👨‍💻</div></div>`;
        return `<div style="display: flex; justify-content: flex-start; align-items: flex-end; margin-bottom: 12px;"><div style="width: 36px; height: 36px; border-radius: 50%; background: ${avatarColor}; display: flex; justify-content: center; align-items: center; margin-right: 10px; flex-shrink: 0; font-size: 18px;">${avatarIcon}</div><div style="background: #182533; color: #e4e6eb; padding: 10px 14px; border-radius: 14px 14px 14px 0; max-width: 65%; font-size: 15px; border: 1px solid #22303f;">${text}</div></div>`;
    }

    buyHint(data) {
        data.hintBought = true; 
        this.chatHintBtn.setVisible(false);
        
        if (this.activeContact === 'Магистр') {
            this.updateScore(-GAME_CONFIG.SCORES.hintGuruCost);
            data.queue.push("Админ: Магистр, дайте совет. Не могу с задачей справиться.");
            data.queue.push(DIALOGS.hints.guru);
        } else {
            this.updateScore(-GAME_CONFIG.SCORES.hintAntiGuruCost);
            data.queue.push("Админ: Привет! Не могу понять, как задачу выполнить.");
            data.queue.push(DIALOGS.hints.antiGuru);
        }
        
        this.renderChat();
        this.processChatQueue(this.activeContact); 
    }

    finishDialog(contactName) {
        if (contactName === 'Гл. Бухгалтер') {
            if (this.sysState.progress === GAME_STAGE.INTRO) {
                this.sysState.progress = GAME_STAGE.TASK_RECEIVED;
                this.showToast('Проверь задачи на доске и возьми задачу в работу');
                this.playDing();
                this.updateKanbanBoard();
            } else if (this.sysState.progress === GAME_STAGE.CHECKING) {
                this.sysState.progress = GAME_STAGE.FINISHED;
                this.showToast('Задание успешно выполнено!');
                this.playDing();
                this.chatData['Гл. Бухгалтер'].history = '[ Чат заархивирован. Задание успешно выполнено. ]';
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

// ИСПРАВЛЕНИЕ: Добавлена настройка масштабирования (scale) для четкой картинки!
const config = { 
    type: Phaser.AUTO, 
    width: 1280, 
    height: 720, 
    parent: 'game-container', 
    dom: { createContainer: true },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }, 
    scene: [BootScene, IntroScene, MainWorkspaceScene] 
};
const game = new Phaser.Game(config);