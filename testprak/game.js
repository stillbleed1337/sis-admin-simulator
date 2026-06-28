// ==========================================
// 1. СЦЕНА ЗАГРУЗКИ (BootScene)
// ==========================================
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }
    preload() {}
    create() {
        this.scene.start('IntroScene');
    }
}

// ==========================================
// 2. ВХОДНОЙ ТЕСТ (IntroScene) - Мороженое
// ==========================================
class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }
    
    create() {
        this.cameras.main.setBackgroundColor('#5D8AA8');

        this.correctOrder = [
            { id: 'wo', name: 'Бело-оранжевое', color: 0xffcc99 },
            { id: 'o',  name: 'Оранжевое',      color: 0xff8800 },
            { id: 'wg', name: 'Бело-зеленое',   color: 0xccffcc },
            { id: 'b',  name: 'Синее',          color: 0x0066ff },
            { id: 'wb', name: 'Бело-синее',     color: 0x99ccff },
            { id: 'g',  name: 'Зеленое',        color: 0x009900 },
            { id: 'wbr',name: 'Бело-коричневое',color: 0xd2b48c },
            { id: 'br', name: 'Коричневое',     color: 0x8b4513 }
        ];

        this.score = 30; 
        this.mistakesCount = 0;
        this.playerSelection = []; 
        this.interactiveItems = []; 
        this.isLocked = false; 

        // UI Баллов и текстов
        this.scoreText = this.add.text(30, 30, 'Баллы: ' + this.score, { font: '28px Arial', fill: '#ffff00', fontStyle: 'bold' });
        
        // --- ВРЕМЕННАЯ КНОПКА ПРОПУСКА ---
        const skipBtn = this.add.text(1250, 30, '[ ПРОПУСТИТЬ ТЕСТ ]', { font: '18px Arial', fill: '#dddddd' })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true });
            
        skipBtn.on('pointerdown', () => {
            this.scene.start('MainWorkspaceScene', { currentScore: 30 });
        });

        this.add.text(640, 60, 'ПРОВЕРКА КВАЛИФИКАЦИИ', { font: '32px Arial', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
        this.add.text(640, 100, 'В какой последовательности вы порекомендуете мороженое друзьям?', { font: '22px Arial', fill: '#222222', fontStyle: 'bold' }).setOrigin(0.5);
        this.selectionText = this.add.text(640, 560, 'Ваш выбор: ', { font: '20px Courier', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
        this.statusText = this.add.text(640, 640, '', { font: '26px Arial', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5);

        const phone = this.add.rectangle(1180, 580, 100, 200, 0x333333);
        this.add.text(1180, 580, 'ТЕЛЕФОН', { font: '18px Arial', fill: '#fff' }).setOrigin(0.5);

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
        this.isGameOverState = isGameOver;
        this.activeMessages = messages;
        this.currentMessageIndex = 0;
        
        this.dialogSenderText.setText(sender);
        
        if (sender === 'Анти-Гуру') this.dialogSenderText.setFill('#ff5555');
        else if (sender === 'Гуру') this.dialogSenderText.setFill('#55aaff');
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
            
            if (this.isGameOverState) {
                this.scene.restart();
            } else {
                this.initTest();
            }
        }
    }

    initTest() {
        this.playerSelection = [];
        this.selectionText.setText('Ваш выбор: ');
        this.statusText.setText('');
        this.isLocked = false; 
        
        this.interactiveItems.forEach(item => item.destroy());
        this.interactiveItems = [];

        let shuffled = [...this.correctOrder].sort(() => Math.random() - 0.5);
        const startX = 230;
        const spacing = 115;

        shuffled.forEach((wire, index) => {
            let container = this.add.container(startX + (index * spacing), 360);
            
            let cup = this.add.rectangle(0, 40, 60, 60, 0xcccccc);
            let scoop = this.add.circle(0, -10, 40, wire.color);
            let hitArea = this.add.rectangle(0, 15, 80, 120, 0x000000, 0).setInteractive({ useHandCursor: true });
            let label = this.add.text(0, -90, wire.name, { font: '14px Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setRotation(-Math.PI / 4);

            container.add([cup, scoop, hitArea, label]);
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
        } else {
            this.playerSelection.push(wire.id);
            container.setAlpha(0.2); 
        }

        let currentString = this.playerSelection
            .map(id => this.correctOrder.find(w => w.id === id).name)
            .join(' -> ');
        this.selectionText.setText('Ваш выбор: ' + currentString);

        if (this.playerSelection.length === 8) {
            this.validateResult();
        }
    }

    validateResult() {
        this.isLocked = true; 
        let isSuccess = this.playerSelection.every((id, index) => id === this.correctOrder[index].id);

        if (isSuccess) {
            this.statusText.setText('УСПЕХ! ВЫ ПРОШЛИ ТЕСТ.').setFill('#00ff00');
            this.time.delayedCall(1500, () => {
                this.scene.start('MainWorkspaceScene', { currentScore: this.score });
            });
        } else {
            this.mistakesCount++;
            
            if (this.mistakesCount === 1) {
                this.score -= 5;
                this.scoreText.setText('Баллы: ' + this.score);
                this.showDialog('Анти-Гуру', [
                    'Привет бро, смотри какой роутер купил!',
                    '[ФОТО wifi роутера]',
                    'Смотри какой стремный кабель мне подкинули...\n[ФОТО 4-ёх жильного кабеля]',
                    'Давай бро, увидимся на работе.'
                ]);
            } 
            else if (this.mistakesCount === 2) {
                this.score -= 10;
                this.scoreText.setText('Баллы: ' + this.score);
                this.showDialog('Гуру', [
                    'Мороженое порекомендовать хочешь ты?',
                    'Это так же просто, как Ethernet кабель обжать.'
                ]);
            } 
            else {
                this.score -= 5;
                this.scoreText.setText('Баллы: ' + this.score);
                
                if (this.score <= 0) {
                    this.scoreText.setText('Баллы: 0');
                    this.showDialog('Директор', [
                        'Ты еще не готов стать сисадмином.',
                        'Приходи позже, когда наберешься знаний и опыта.'
                    ], true); 
                } else {
                    this.statusText.setText('ОШИБКА! Штраф -5 баллов.').setFill('#ff0000');
                    this.time.delayedCall(1500, () => {
                        this.initTest();
                    });
                }
            }
        }
    }
}

// ==========================================
// 3. ГЛАВНАЯ СЦЕНА (MainWorkspaceScene)
// ==========================================
class MainWorkspaceScene extends Phaser.Scene {
    constructor() {
        super('MainWorkspaceScene');
    }
    
    init(data) {
        this.totalScore = data.currentScore || 0; 
    }

    create() {
        this.cameras.main.setBackgroundColor('#5D8AA8');
        this.add.rectangle(640, 600, 1280, 240, 0x8b4513); 
        this.add.text(1250, 30, 'Общий счет: ' + this.totalScore, { font: '24px Arial', fill: '#ffff00', fontStyle: 'bold' }).setOrigin(1, 0);

        // 1. Канбан доска
        const board = this.add.rectangle(250, 200, 350, 220, 0xffffff).setInteractive({ useHandCursor: true });
        this.add.text(250, 200, 'КАНБАН-ДОСКА', { font: '22px Arial', fill: '#000' }).setOrigin(0.5);

        // 2. Справочник (сдвинут левее)
        const book = this.add.rectangle(120, 600, 140, 100, 0x0055aa).setInteractive({ useHandCursor: true });
        this.add.text(120, 600, 'СПРАВОЧНИК', { font: '16px Arial', fill: '#fff' }).setOrigin(0.5);

        // 3. Схема сети 
        const networkMap = this.add.rectangle(300, 600, 160, 120, 0xffffee).setInteractive({ useHandCursor: true });
        this.add.text(300, 600, 'СХЕМА СЕТИ', { font: '18px Arial', fill: '#000' }).setOrigin(0.5);

        // 4. Терминал
        this.add.rectangle(780, 300, 600, 420, 0x000000);
        this.add.text(780, 300, 'ШИРОКОФОРМАТНЫЙ\nxterm.js', { font: '24px Courier', fill: '#00ff00', align: 'center' }).setOrigin(0.5);

        // 5. Телефон 
        const phone = this.add.rectangle(1180, 580, 100, 200, 0x333333).setInteractive({ useHandCursor: true });
        this.add.text(1180, 580, 'ТЕЛЕФОН', { font: '18px Arial', fill: '#fff' }).setOrigin(0.5);

        // --- ЛОГИКА ОТКРЫТИЯ СХЕМЫ СЕТИ ---
        this.createNetworkMapOverlay();
        
        networkMap.on('pointerdown', () => {
            this.mapOverlay.setVisible(true);
        });
    }

    createNetworkMapOverlay() {
        // Контейнер поверх всего
        this.mapOverlay = this.add.container(640, 360).setDepth(100).setVisible(false);
        
        // Темный фон (блокирует клики сзади)
        let bg = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive();
        
        // Большой лист для схемы
        let paper = this.add.rectangle(0, 0, 900, 600, 0xffffee);
        
        // Временный текст-заглушка
        let placeholderText = this.add.text(0, 0, '[ ЗДЕСЬ БУДЕТ КАРТИНКА СХЕМЫ СЕТИ ]', { font: '32px Arial', fill: '#aaaaaa' }).setOrigin(0.5);
        
        // Кнопка закрытия
        let closeBtn = this.add.text(420, -270, '✖', { font: '36px Arial', fill: '#ff0000' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
            
        closeBtn.on('pointerdown', () => {
            this.mapOverlay.setVisible(false);
        });

        this.mapOverlay.add([bg, paper, placeholderText, closeBtn]);
    }
}

// ==========================================
// ИНИЦИАЛИЗАЦИЯ ДВИЖКА
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    scene: [BootScene, IntroScene, MainWorkspaceScene]
};

const game = new Phaser.Game(config);