// ==========================================
// 1. СЦЕНА ЗАГРУЗКИ (BootScene)
// ==========================================
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }
    
    preload() {
        // Место для загрузки изображений
    }
    
    create() {
        this.scene.start('IntroScene');
    }
}

// ==========================================
// 2. ВХОДНОЙ ТЕСТ (IntroScene) - Обжим T568B
// ==========================================
class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }
    
    create() {
        this.correctOrder = [
            { id: 'wo', name: 'Бело-оранжевый', color: 0xffcc99 },
            { id: 'o',  name: 'Оранжевый',      color: 0xff8800 },
            { id: 'wg', name: 'Бело-зеленый',   color: 0xccffcc },
            { id: 'b',  name: 'Синий',          color: 0x0066ff },
            { id: 'wb', name: 'Бело-синий',     color: 0x99ccff },
            { id: 'g',  name: 'Зеленый',        color: 0x009900 },
            { id: 'wbr',name: 'Бело-коричневый',color: 0xd2b48c },
            { id: 'br', name: 'Коричневый',     color: 0x8b4513 }
        ];

        this.playerSelection = []; 
        this.interactiveColumns = []; 
        this.mistakesCount = 0; 

        this.add.text(640, 60, 'ПРОВЕРКА КВАЛИФИКАЦИИ', { font: '32px Arial', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(640, 100, 'Собери кабель (T568B), выбирая цвета в правильном порядке:', { font: '20px Arial', fill: '#aaaaaa' }).setOrigin(0.5);
        
        this.selectionText = this.add.text(640, 580, 'Порядок: ', { font: '20px Courier', fill: '#00ff00' }).setOrigin(0.5);
        this.statusText = this.add.text(640, 640, '', { font: '26px Arial', fontStyle: 'bold' }).setOrigin(0.5);

        this.initTest();
    }

    initTest() {
        this.playerSelection = [];
        this.selectionText.setText('Порядок: ');
        this.statusText.setText('');
        
        this.interactiveColumns.forEach(col => col.destroy());
        this.interactiveColumns = [];

        let shuffled = [...this.correctOrder].sort(() => Math.random() - 0.5);

        const startX = 230;
        const spacing = 115;

        shuffled.forEach((wire, index) => {
            let container = this.add.container(startX + (index * spacing), 340);
            
            let rect = this.add.rectangle(0, 0, 90, 280, wire.color)
                .setInteractive({ useHandCursor: true });
                
            let label = this.add.text(0, -160, wire.name, { font: '14px Arial', fill: '#ffffff' })
                .setOrigin(0.5)
                .setRotation(-Math.PI / 4);

            container.add([rect, label]);
            this.interactiveColumns.push(container);

            rect.on('pointerdown', () => this.handleSelection(wire, rect));
        });
    }

    // --- ОБНОВЛЕННАЯ ЛОГИКА КЛИКА (ДОБАВЛЕНА ОТМЕНА ВЫБОРА) ---
    handleSelection(wire, rect) {
        // Ищем, есть ли уже этот цвет в нашем выборе
        const index = this.playerSelection.indexOf(wire.id);

        if (index > -1) {
            // ЕСЛИ УЖЕ БЫЛ ВЫБРАН: Отменяем выбор
            this.playerSelection.splice(index, 1); // Удаляем из массива
            rect.setAlpha(1); // Возвращаем нормальную яркость цвета
        } else {
            // ЕСЛИ ЕЩЕ НЕ ВЫБРАН: Добавляем в выбор
            this.playerSelection.push(wire.id);
            rect.setAlpha(0.2); // Делаем полупрозрачным, чтобы было видно, что нажато
        }

        // Обновляем текст на экране с текущим порядком
        let currentString = this.playerSelection
            .map(id => this.correctOrder.find(w => w.id === id).name)
            .join(' -> ');
        this.selectionText.setText('Порядок: ' + currentString);

        // Проверяем результат, только если выбрано ровно 8 цветов
        if (this.playerSelection.length === 8) {
            this.validateResult();
        }
    }

    validateResult() {
        let isSuccess = this.playerSelection.every((id, index) => id === this.correctOrder[index].id);

        if (isSuccess) {
            this.statusText.setText('ОБЖИМ УСПЕШЕН. ДОСТУП ОТКРЫТ.').setFill('#00ff00');
            this.time.delayedCall(1500, () => {
                this.scene.start('MainWorkspaceScene');
            });
        } else {
            this.mistakesCount++; 

            if (this.mistakesCount >= 3) {
                this.statusText.setText('ОШИБКА! ПОДСКАЗКА: БО-О-БЗ-С-БС-З-БК-К').setFill('#ffff00');
                this.mistakesCount = 0; 
                
                this.time.delayedCall(4000, () => {
                    this.initTest();
                });
            } else {
                let attemptsLeft = 3 - this.mistakesCount;
                this.statusText.setText(`ОШИБКА! Попыток до подсказки: ${attemptsLeft}`).setFill('#ff0000');
                
                this.time.delayedCall(1500, () => {
                    this.initTest();
                });
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
    
    create() {
        this.cameras.main.setBackgroundColor('#5D8AA8');
        this.add.rectangle(640, 600, 1280, 240, 0x8b4513); 

        const board = this.add.rectangle(250, 200, 350, 220, 0xffffff).setInteractive({ useHandCursor: true });
        this.add.text(250, 200, 'КАНБАН-ДОСКА', { font: '22px Arial', fill: '#000' }).setOrigin(0.5);

        const book = this.add.rectangle(250, 600, 160, 100, 0x0055aa).setInteractive({ useHandCursor: true });
        this.add.text(250, 600, 'СПРАВОЧНИК', { font: '18px Arial', fill: '#fff' }).setOrigin(0.5);

        this.add.rectangle(720, 320, 500, 350, 0x000000);
        this.add.text(720, 320, 'Место под xterm.js', { font: '24px Courier', fill: '#00ff00' }).setOrigin(0.5);

        const phone = this.add.rectangle(1150, 560, 100, 200, 0x333333).setInteractive({ useHandCursor: true });
        this.add.text(1150, 560, 'ТЕЛЕФОН', { font: '18px Arial', fill: '#fff' }).setOrigin(0.5);

        board.on('pointerdown', () => console.log('Клик: Открыть Канбан-доску'));
        book.on('pointerdown', () => console.log('Клик: Открыть Справочник'));
        phone.on('pointerdown', () => console.log('Клик: Открыть Мессенджер'));
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