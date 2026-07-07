// ==========================================
// ОСНОВНАЯ ИГРА (game.js) - ИДЕАЛЬНЫЙ HTML UI
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
        this.load.image('barmen', 'assets/images/barmen.png');
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
        this.scene.start('IntroScene'); 
        this.scene.launch('UIScene'); 
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
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainWorkspaceScene', { currentScore: this.score }); 
            });
        });
        this.add.text(640, 60, 'ПРОВЕРКА КВАЛИФИКАЦИИ', { font: '32px Arial', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
        this.add.text(640, 100, 'В какой последовательности вы порекомендуете мороженое друзьям?', { font: '22px Arial', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
        
        this.selectionText = this.add.text(640, 560, 'Ваш выбор: ', { 
            fontFamily: 'Arial', fontSize: '24px', fontWeight: 'bold', fill: '#ffffff', stroke: '#000000', strokeThickness: 2 
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4, true, true);
        
        this.statusText = this.add.text(640, 640, '', { font: '26px Arial', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5);
        
        this.createDialogUI();
        this.initTest();

        this.time.delayedCall(500, () => {
            this.showDialog('Бармен', [
                'Привет! Добро пожаловать в наше IT-кафе при дата-центре.',
                'Слушай, тут твои друзья-сисадмины заказали фирменный сет мороженого из 8 шариков.',
                'Просили расставить цвета строго в правильной последовательности, иначе, говорят, "линк не поднимется".',
                'Поможешь собрать заказ? Кликай по стаканчикам в правильном порядке!'
            ]);
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

    // === 2. ВЫЗОВ HTML ДИАЛОГА ===
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
        
        // === ВАЖНО: Сбрасываем позицию для всех остальных! ===
        avatarImgEl.style.backgroundPosition = "center";
        avatarImgEl.style.backgroundSize = "cover";

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
            
            // === ЖЕСТКАЯ ПРИВЯЗКА В ПИКСЕЛЯХ ===
            // Сдвигаем фон вниз ровно на 20 пикселей, чтобы вытащить макушку из-под обрезки
            avatarImgEl.style.backgroundPosition = "center 20px"; 
            
            // Настраиваем зум (если лицо мелкое — ставь 180%, если крупное — 120%)
            avatarImgEl.style.backgroundSize = "150%"; 
            
        } else {
            senderEl.style.color = '#ffffff';
            avatarEl.style.borderColor = '#555555';
            avatarImgEl.style.backgroundImage = "none";
        }

        // Подставляем текст и сбрасываем стили
        textEl.innerText = this.activeMessages[0];
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
                textEl.innerText = this.activeMessages[this.currentMessageIndex];
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
            pingYaRuDone: false,
            helpThoughtShown: false
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
    }

    startWorkingDay() {
        this.time.delayedCall(1000, () => this.showToast('💬 Вы: Фух, начался первый рабочий день...'));
        this.time.delayedCall(6500, () => this.showToast('💬 Вы: Надо бы заглянуть в справочник.'));
    }

    showToast(msg) {
        if (this.currentToast) {
            this.currentToast.destroy();
            if (this.currentToastTween) this.currentToastTween.stop();
        }

        if (msg.startsWith('💬 Вы:')) {
            try { this.sound.play('mumble', { volume: 0.8 }); } catch(e) {}
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
                    </ul>
                </div>
                <div class="book-section" style="border-left-color: #ff8a65;">
                    <h3>🧙‍♂️ ПОМОЩЬ ЭКСПЕРТОВ</h3>
                    <div class="colleague-card">
                        <div class="colleague-avatar" style="width: 72px; height: 72px; border: 2px solid #ff8a65; overflow: hidden; position: relative;"><div style="position: absolute; top: 50%; left: 50%; width: 145%; height: 145%; transform: translate(-50%, -50%); background-image: url('assets/images/jora.png'); background-size: cover; background-position: center;"></div></div>
                        <div class="colleague-info">
                            <h4>Жорик <span class="badge-penalty" style="background: rgba(249, 115, 22, 0.15); color: #ffb74d; border-color: rgba(249, 115, 22, 0.3);">Минус 5 баллов</span></h4>
                            <p>Весельчак и душа компании. Отлично шарит в компьютерах, но часто подходит к работе слишком легкомысленно.</p>
                        </div>
                    </div>
                    <div class="colleague-card">
                        <div class="colleague-avatar" style="width: 72px; height: 72px; border: 2px solid #4fc3f7; overflow: hidden; position: relative;"><div style="position: absolute; top: 50%; left: 50%; width: 145%; height: 145%; transform: translate(-50%, -50%); background-image: url('assets/images/magistr.png'); background-size: cover; background-position: center;"></div></div>
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
        
        this.createContactList(); // Создаст HTML Список контактов поверх левой панели
        
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
            this.chatHeader, this.chatHintBtn, this.chatNextBtn
        ]);
    }

    // === 4. ЧИСТЫЙ HTML ДЛЯ СПИСКА КОНТАКТОВ ВМЕСТО CANVAS ===
    createContactList() {
        let html = `
        <style>
            .contact-list-container { width: 300px; padding-top: 10px; font-family: 'Segoe UI', Arial, sans-serif; user-select: none; }
            .contact-item { display: flex; align-items: center; padding: 10px 20px; cursor: pointer; border-bottom: 1px solid #0e1621; transition: background 0.15s; height: 75px; box-sizing: border-box; }
            .contact-item:hover { background: #202e3d; }
            .contact-ava { width: 54px; height: 54px; border-radius: 50%; margin-right: 15px; border: 2px solid; flex-shrink: 0; overflow: hidden; position: relative; }
            .contact-ava-img { position: absolute; top: 50%; left: 50%; width: 145%; height: 145%; transform: translate(-50%, -50%); background-size: cover; background-position: center; }
            .contact-name { font-size: 18px; font-weight: bold; }
        </style>
        <div class="contact-list-container">
            <div class="contact-item" id="btn-magistr">
                <div class="contact-ava" style="border-color: #4fc3f7;"><div class="contact-ava-img" style="background-image: url('assets/images/magistr.png');"></div></div>
                <div class="contact-name" id="status-magistr" style="color: #888888;">Магистр ⚪</div>
            </div>
            <div class="contact-item" id="btn-jora">
                <div class="contact-ava" style="border-color: #ff8a65;"><div class="contact-ava-img" style="background-image: url('assets/images/jora.png');"></div></div>
                <div class="contact-name" id="status-jora" style="color: #888888;">Жорик ⚪</div>
            </div>
            <div class="contact-item" id="btn-acc">
                <div class="contact-ava" style="border-color: #e57373;"><div class="contact-ava-img" style="background-image: url('assets/images/buhgalter.png');"></div></div>
                <div class="contact-name" id="status-acc" style="color: #00ff00;">Гл. Бухгалтер 🟢</div>
            </div>
            <div class="contact-item" id="btn-dir">
                <div class="contact-ava" style="border-color: #ba68c8;"><div class="contact-ava-img" style="background-image: url('assets/images/director.png');"></div></div>
                <div class="contact-name" id="status-dir" style="color: #888888;">Директор ⚪</div>
            </div>
        </div>
        `;
        
        // Размещаем HTML ровно поверх левой панели телефона.
        // Разделитель под шапкой "КОНТАКТЫ" находится на y=120, блок из 4 карточек
        // высотой 75px каждая (итого 300px) должен начинаться сразу под ним,
        // поэтому центр блока = 120 + 300/2 = 270.
        this.contactsDOM = this.add.dom(290, 270).createFromHTML(html).setVisible(false);
        
        // Вешаем слушатель кликов браузера
        this.contactsDOM.addListener('click');
        this.contactsDOM.on('click', (event) => {
            let item = event.target.closest('.contact-item');
            if (!item) return;
            if (item.id === 'btn-magistr') this.openChat('Магистр');
            if (item.id === 'btn-jora') this.openChat('Жорик');
            if (item.id === 'btn-acc') this.openChat('Гл. Бухгалтер');
            if (item.id === 'btn-dir') this.openChat('Директор');
        });

        // УМНЫЕ ОБЕРТКИ: Позволяют старой логике игры менять текст в новом HTML без переписывания кода!
        const createStatusWrapper = (id) => {
            return {
                setText: function(t) { let el = document.getElementById(id); if(el) el.innerText = t; return this; },
                setFill: function(c) { let el = document.getElementById(id); if(el) el.style.color = c; return this; }
            };
        };

        this.guruStatus = createStatusWrapper('status-magistr');
        this.antiGuruStatus = createStatusWrapper('status-jora');
        this.accStatus = createStatusWrapper('status-acc');
        this.dirStatus = createStatusWrapper('status-dir');
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

        let avatarImgPath = ''; 
        let avatarColor = '#555555';
        
        if (senderName === 'Гл. Бухгалтер') { avatarImgPath = 'assets/images/buhgalter.png'; avatarColor = '#e57373'; }
        else if (senderName === 'Директор') { avatarImgPath = 'assets/images/director.png'; avatarColor = '#ba68c8'; }
        else if (senderName === 'Магистр') { avatarImgPath = 'assets/images/magistr.png'; avatarColor = '#4fc3f7'; }
        else if (senderName === 'Жорик') { avatarImgPath = 'assets/images/jora.png'; avatarColor = '#ff8a65'; }

        // Системные сообщения
        if (isSystem) return `<div style="text-align: center; margin: 10px 0;"><span style="background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 12px; font-size: 13px; color: #8b9eb0;">${text}</span></div>`;
        
        // ИСХОДЯЩИЕ СООБЩЕНИЯ (Аватарка Админа)
        if (isOutgoing) return `<div style="display: flex; justify-content: flex-end; align-items: flex-end; margin-bottom: 8px;"><div style="background: #2b5278; color: #fff; padding: 10px 14px; border-radius: 16px 16px 0 16px; max-width: 65%; font-size: 16px;">${text}</div><div style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #1e88e5; overflow: hidden; position: relative; flex-shrink: 0; margin-left: 12px;"><div style="position: absolute; top: 50%; left: 50%; width: 145%; height: 145%; transform: translate(-50%, -50%); background-image: url('assets/images/sisadmin.png'); background-size: cover; background-position: center;"></div></div></div>`;
        
        // ВХОДЯЩИЕ СООБЩЕНИЯ (Аватарки NPC)
        return `<div style="display: flex; justify-content: flex-start; align-items: flex-end; margin-bottom: 8px;"><div style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid ${avatarColor}; overflow: hidden; position: relative; flex-shrink: 0; margin-right: 12px;"><div style="position: absolute; top: 50%; left: 50%; width: 145%; height: 145%; transform: translate(-50%, -50%); background-image: url('${avatarImgPath}'); background-size: cover; background-position: center;"></div></div><div style="background: #182533; color: #e4e6eb; padding: 10px 14px; border-radius: 16px 16px 16px 0; max-width: 65%; font-size: 16px; border: 1px solid #22303f;">${text}</div></div>`;
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