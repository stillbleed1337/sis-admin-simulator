// ==========================================
// 1. СЦЕНА ЗАГРУЗКИ (BootScene)
// ==========================================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {}
    create() { this.scene.start('IntroScene'); }
}

// ==========================================
// 2. ВХОДНОЙ ТЕСТ (IntroScene)
// ==========================================
class IntroScene extends Phaser.Scene {
    constructor() { super('IntroScene'); }
    
    create() {
        this.cameras.main.setBackgroundColor('#5D8AA8');
        this.wires = [
            { id: 'wo', name: 'БО', color: 0xffcc99 }, { id: 'o',  name: 'О',  color: 0xff8800 },
            { id: 'wg', name: 'БЗ', color: 0xccffcc }, { id: 'b',  name: 'С',  color: 0x0066ff },
            { id: 'wb', name: 'БС', color: 0x99ccff }, { id: 'g',  name: 'З',  color: 0x009900 },
            { id: 'wbr',name: 'БК', color: 0xd2b48c }, { id: 'br', name: 'К',  color: 0x8b4513 }
        ];
        this.solutionT568B = ['wo', 'o', 'wg', 'b', 'wb', 'g', 'wbr', 'br'];
        this.solutionT568A = ['wg', 'g', 'wo', 'b', 'wb', 'o', 'wbr', 'br'];

        this.score = 30; this.mistakesCount = 0; this.playerSelection = []; 
        this.interactiveItems = []; this.isLocked = false; 

        this.scoreText = this.add.text(30, 30, 'Баллы: ' + this.score, { font: '28px Arial', fill: '#ffff00', fontStyle: 'bold' });
        
        const skipBtn = this.add.text(1250, 30, '[ ПРОПУСТИТЬ ТЕСТ ]', { font: '18px Arial', fill: '#dddddd' }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        skipBtn.on('pointerdown', () => { this.scene.start('MainWorkspaceScene', { currentScore: 30 }); });

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
        if (this.playerSelection.length === 8) this.validateResult();
    }

    validateResult() {
        this.isLocked = true; 
        let isSuccessB = this.playerSelection.every((id, index) => id === this.solutionT568B[index]);
        let isSuccessA = this.playerSelection.every((id, index) => id === this.solutionT568A[index]);

        if (isSuccessB || isSuccessA) {
            this.statusText.setText('УСПЕХ! ВЫ ПРОШЛИ ТЕСТ.').setFill('#00ff00');
            this.time.delayedCall(1500, () => { this.scene.start('MainWorkspaceScene', { currentScore: this.score }); });
        } else {
            this.mistakesCount++;
            if (this.mistakesCount === 1) {
                this.score -= 5; this.scoreText.setText('Баллы: ' + this.score);
                this.showDialog('Анти-Гуру', ['Привет бро, смотри какой роутер купил!', '[ФОТО wifi роутера]', 'Смотри какой стремный кабель мне подкинули...\n[ФОТО 4-ёх жильного кабеля]', 'Давай бро, увидимся на работе.']);
            } else if (this.mistakesCount === 2) {
                this.score -= 10; this.scoreText.setText('Баллы: ' + this.score);
                this.showDialog('Гуру', ['Мороженое порекомендовать хочешь ты?', 'Это так же просто, как Ethernet кабель обжать.']);
            } else {
                this.score -= 5; this.scoreText.setText('Баллы: ' + this.score);
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

// ==========================================
// 3. ГЛАВНАЯ СЦЕНА (MainWorkspaceScene)
// ==========================================
class MainWorkspaceScene extends Phaser.Scene {
    constructor() { super('MainWorkspaceScene'); }
    
    init(data) { this.totalScore = data.currentScore || 0; }

    create() {
        this.cameras.main.fadeIn(1500, 0, 0, 0);
        this.cameras.main.setBackgroundColor('#5D8AA8');

        this.sysState = { progress: 0, commCheckDone: false };

        this.chatData = {
            'Гл. Бухгалтер': { history: '', queue: [], hintBought: false },
            'Гуру': { history: '', queue: [], hintBought: false },
            'Анти-Гуру': { history: '', queue: [], hintBought: false }
        };

        this.chatData['Гл. Бухгалтер'].queue = [
            "Гл. Бухгалтер: Коллега, добрый день. У меня ничего не работает",
            "Админ: А что конкретно?",
            "Гл. Бухгалтер: 1С отвалилась",
            "Гл. Бухгалтер: Что ты глупые вопросы задаёшь, ты админ или я?",
            "Гл. Бухгалтер: Ты должен знать что у меня не работает, за это тебе деньги платят"
        ];

        this.add.rectangle(640, 600, 1280, 240, 0x8b4513); 

        const board = this.add.rectangle(230, 220, 380, 250, 0xffffff).setInteractive({ useHandCursor: true });
        this.add.text(230, 220, 'КАНБАН-ДОСКА', { font: '22px Arial', fill: '#000' }).setOrigin(0.5);

        const book = this.add.rectangle(120, 600, 140, 100, 0x0055aa).setInteractive({ useHandCursor: true });
        this.add.text(120, 600, 'СПРАВОЧНИК', { font: '16px Arial', fill: '#fff' }).setOrigin(0.5);

        const networkMap = this.add.rectangle(300, 600, 160, 120, 0xffffee).setInteractive({ useHandCursor: true });
        this.add.text(300, 600, 'СХЕМА СЕТИ', { font: '18px Arial', fill: '#000' }).setOrigin(0.5);

        this.phoneObj = this.add.rectangle(1200, 620, 100, 180, 0x333333).setInteractive({ useHandCursor: true });
        this.add.text(1200, 620, 'ТЕЛЕФОН', { font: '16px Arial', fill: '#fff' }).setOrigin(0.5);

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

        this.command = ''; this.commandHistory = []; this.historyIndex = 0;

        let termHTML = '<div id="terminal-container" style="width: 750px; height: 450px; background-color: #000; padding: 15px; border: 3px solid #333; overflow: hidden; user-select: text; box-sizing: border-box;"></div>';
        this.terminalDOM = this.add.dom(830, 300).createFromHTML(termHTML);
        
        if (typeof Terminal !== 'undefined') {
            this.term = new Terminal({ cursorBlink: true, theme: { background: '#000000' } });
            const termElement = document.getElementById('terminal-container');
            if (termElement) {
                this.term.open(termElement);
                this.term.write('Welcome to Linux-Server v2.4\r\nuser@sysadmin:~$ ');
                this.setupTerminalInput();
            }
        }

        this.startWorkingDay();
    }

    startWorkingDay() {
        // Первая фраза
        this.time.delayedCall(1000, () => { 
            this.showToast('💬 Вы: Фух, начался рабочий день...'); 
        });
        
        // Вторая фраза (через 4.5 секунды)
        this.time.delayedCall(4550, () => {
            this.showToast('💬 Вы: Надо бы заглянуть в справочник.');
        });
        
        // Звонок телефона мы отсюда УБРАЛИ! 
    }

    showToast(msg) {
        let toast = this.add.text(640, 680, msg, { font: '20px Arial', fill: '#fff', backgroundColor: '#000000aa', padding: { x: 10, y: 10 } }).setOrigin(0.5).setDepth(200);
        this.tweens.add({ targets: toast, alpha: 0, delay: 3000, duration: 1000, onComplete: () => toast.destroy() });
    }

    playDing() {
        let flash = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.1).setDepth(500);
        this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
    }

    updateScore(amount) {
        this.totalScore += amount;
    }

    setupTerminalInput() {
        this.term.attachCustomKeyEventHandler((e) => {
            if (e.ctrlKey && e.code === 'KeyC' && e.type === 'keydown') { if (this.term.hasSelection()) navigator.clipboard.writeText(this.term.getSelection()); return false; }
            if (e.ctrlKey && e.code === 'KeyV' && e.type === 'keydown') return false; 
            if (e.ctrlKey && e.code === 'KeyA' && e.type === 'keydown') { this.term.selectAll(); return false; }
            return true;
        });

        this.term.onData(e => {
            if (e.length > 1 && !e.includes('\x1b')) { let cleanText = e.replace(/[\r\n]+/g, ''); this.command += cleanText; this.term.write(cleanText); return; }
            switch (e) {
                case '\r': 
                    this.term.write('\r\n');
                    if (this.command.trim() !== '') this.commandHistory.push(this.command);
                    this.historyIndex = this.commandHistory.length;
                    this.executeCommand(this.command);
                    this.command = '';
                    this.term.write('\r\nuser@sysadmin:~$ ');
                    break;
                case '\u007F': 
                    if (this.command.length > 0) { this.command = this.command.slice(0, -1); this.term.write('\b \b'); } break;
                case '\t': 
                    if (this.command.trim() === '') break;
                    const availableCommands = ['ping', 'help', 'clear'];
                    const match = availableCommands.find(cmd => cmd.startsWith(this.command));
                    if (match) { const remainder = match.slice(this.command.length); this.command = match; this.term.write(remainder); }
                    break;
                case '\x1b[A': 
                    if (this.historyIndex > 0) { this.historyIndex--; this.replaceTerminalInput(this.commandHistory[this.historyIndex]); } break;
                case '\x1b[B': 
                    if (this.historyIndex < this.commandHistory.length - 1) { this.historyIndex++; this.replaceTerminalInput(this.commandHistory[this.historyIndex]); } 
                    else if (this.historyIndex === this.commandHistory.length - 1) { this.historyIndex++; this.replaceTerminalInput(''); } break;
                case '\x1b[C': case '\x1b[D': break; 
                default: 
                    if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E)) { this.command += e; this.term.write(e); }
            }
        });
    }

    replaceTerminalInput(newCmd) {
        for (let i = 0; i < this.command.length; i++) this.term.write('\b \b');
        this.command = newCmd; this.term.write(this.command);
    }

    executeCommand(cmd) {
        cmd = cmd.trim(); 
        if (cmd === '') return;

        // Разбиваем введенный текст на команду и аргументы
        let parts = cmd.split(' ').filter(p => p !== '');
        let baseCmd = parts[0];
        let args = parts.slice(1);

        // --- БАЗОВЫЕ УТИЛИТЫ LINUX ---
        if (baseCmd === 'help') { 
            this.term.write('Доступные команды:\r\n ping, clear, ls, cd, pwd, cat, touch, rm, mv\r\n'); 
            return; 
        }
        if (baseCmd === 'clear') { this.term.clear(); return; }
        
        if (baseCmd === 'pwd') {
            this.term.write('/home/sysadmin\r\n');
            return;
        }

        if (baseCmd === 'ls') {
            // Собираем все ключи (аргументы, начинающиеся с дефиса) в одну строку
            let flags = args.filter(a => a.startsWith('-')).join('');
            let hasL = flags.includes('l');
            let hasA = flags.includes('a');
            let hasH = flags.includes('h');

            if (hasL) {
                // Имитация вывода ls -l с учетом ключей -a и -h
                this.term.write('total ' + (hasH ? '1.2M' : '1254096') + '\r\n');
                if (hasA) {
                    this.term.write('drwxr-xr-x 2 sysadmin sysadmin ' + (hasH ? '4.0K' : '4096') + ' Jun 29 09:00 .\r\n');
                    this.term.write('drwxr-xr-x 3 root     root     ' + (hasH ? '4.0K' : '4096') + ' Jun 29 08:50 ..\r\n');
                    this.term.write('-rw-r--r-- 1 sysadmin sysadmin ' + (hasH ? '2.1K' : '2140') + ' Jun 29 09:15 .bash_history\r\n');
                }
                this.term.write('-rwxr-xr-x 1 sysadmin sysadmin ' + (hasH ? '128B' : '128') + ' Jun 29 14:45 1.sh\r\n');
                this.term.write('-rw-r--r-- 1 sysadmin sysadmin ' + (hasH ? '14B'  : '14')  + ' Jun 29 14:47 1.txt\r\n');
            } else {
                // Обычный вывод ls
                let out = '1.sh   1.txt';
                if (hasA) out = '.   ..   .bash_history   ' + out;
                this.term.write(out + '\r\n');
            }
            return;
        }

        if (baseCmd === 'cat') {
            let target = args[0];
            if (target === '1.sh') this.term.write('#!/bin/bash\r\necho "Hello, world!"\r\n');
            else if (target === '1.txt') this.term.write('Test file content.\r\n');
            else if (target) this.term.write(`cat: ${target}: No such file or directory\r\n`);
            else this.term.write('cat: missing operand\r\n');
            return;
        }

        if (baseCmd === 'cd') {
            // Фейковая навигация (просто ничего не выводим, как при успешном cd)
            let path = args[0] || '~';
            if (path === '/root') this.term.write('bash: cd: /root: Permission denied\r\n');
            return;
        }

        if (baseCmd === 'touch' || baseCmd === 'rm' || baseCmd === 'mv') {
            // В Linux успешные операции с файлами выполняются молча
            if (args.length === 0) {
                this.term.write(`${baseCmd}: missing file operand\r\n`);
            }
            return; 
        }

        // --- ИГРОВАЯ ЛОГИКА (PING) ---
        if (baseCmd === 'ping') {
            if (this.sysState.progress < 2) {
                this.term.write('Ошибка: У вас нет активных задач в сети.\r\n');
                return;
            }

            let targetIp = args[0];

            if (targetIp === '10.138.5.105') {
                this.term.write('Pinging 10.138.5.105 with 32 bytes of data:\r\nRequest timed out.\r\nRequest timed out.\r\n');
            } 
            else if (targetIp === '10.138.5.101') {
                this.term.write('Pinging 10.138.5.101 with 32 bytes of data:\r\nRequest timed out.\r\nRequest timed out.\r\n');
                if (this.sysState.progress === 2) this.sysState.commCheckDone = true;
            }
            else if (targetIp === '10.138.5.1') {
                this.term.write('Pinging 10.138.5.1 with 32 bytes of data:\r\nReply from 10.138.5.1: bytes=32 time<1ms TTL=64\r\n');
            }
            else if (targetIp) {
                this.term.write(`Pinging ${targetIp} ... Destination Host Unreachable.\r\n`);
            }
            else {
                this.term.write('ping: missing host operand\r\n');
            }
        } 
        else {
            this.term.write(`bash: ${baseCmd}: command not found\r\n`);
        }

        // Проверяем, выполнил ли игрок условия задания
        this.checkTerminalProgress();
    }

    checkTerminalProgress() {
        if (this.sysState.progress === 2 && this.sysState.commCheckDone) {
            this.sysState.progress = 3;
            this.playDing();
            this.showToast('Задача обновлена на Канбан-доске');
            this.accStatus.setText('Гл. Бухгалтер 🔴').setFill('#ff5555');
            
            this.chatData['Гл. Бухгалтер'].queue = [
                "Админ: Простите, у меня такое впечатление, что у вас выключен коммутатор. Можете проверить это?",
                "Гл. Бухгалтер: А что это такое? Ты можешь понятно разговаривать?",
                "Админ: Ну, маленькая коробочка с проводами на стенке висит. Там огоньки зелёные мигают. Я ещё показывал Вам и говорил, что не отключали.",
                "Гл. Бухгалтер: Ой. Да, мы выключили. Сейчас включим. Но это ты виноват всё равно! Нужно было написать на нём \"не выключать\".",
                "Админ: И так написано было на листе А4 и наклеено над ним.",
                "Гл. Бухгалтер: Мы отодрали этот лист и выкинули. Он ауру нам портит.",
                "Админ: Подпишите сами и больше не выключайте!!!"
            ];
            
            this.updateKanbanBoard();
        }
    }

    openOverlay(overlayTarget) { 
        this.terminalDOM.setVisible(false); 
        overlayTarget.setVisible(true); 
        if (overlayTarget === this.overlayPhone) {
            if (this.chatDOM) this.chatDOM.setVisible(true);
        }
    }
    
    closeOverlay(overlayTarget) { 
        overlayTarget.setVisible(false); 
        this.terminalDOM.setVisible(true); 
        
        if (overlayTarget === this.overlayPhone) {
            if (this.chatDOM) this.chatDOM.setVisible(false);
        }

        // --- ЛОГИКА СТАРТА ЗАДАНИЯ ПОСЛЕ СПРАВОЧНИКА ---
        // Проверяем: если закрыли справочник, прогресс нулевой, и мы еще не читали его
        if (overlayTarget === this.overlayBook && this.sysState.progress === 0 && !this.sysState.handbookRead) {
            
            this.sysState.handbookRead = true; // Запоминаем, что мы его уже читали (чтобы не звонило каждый раз)
            
            // Даем игроку 2 секунды после закрытия окна, и запускаем звонок Бухгалтера!
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

        this.overlayBook = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bgBook = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive();
        let closeBook = this.add.text(320, -220, '✖', { font: '36px Arial', fill: '#ff0000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBook.on('pointerdown', () => this.closeOverlay(this.overlayBook));
        
        // Вынес текст правил в отдельную переменную для удобства
        let bookStr = 'СПРАВОЧНИК СИСАДМИНА\n\nПРАВИЛА ИГРЫ:\n1. Получайте задачи в мессенджере.\n2. Перемещайте задачи по Канбан-доске.\n3. Решайте инциденты через терминал.\n\nПОДСКАЗКА: Введите команду help\nв терминале для просмотра списка\nвсех доступных команд.';
        let txtBook = this.add.text(0, 0, bookStr, { font: '24px Arial', fill: '#000', align: 'center' }).setOrigin(0.5);
        
        this.overlayBook.add([bgBook, this.add.rectangle(0, 0, 700, 500, 0xffffff), txtBook, closeBook]);

        this.createMessengerUI();
        this.createKanbanUI();
    }
    createKanbanUI() {
        this.overlayKanban = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bgK = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive();
        let paper = this.add.rectangle(0, 0, 1000, 600, 0xe0e0e0);
        let closeK = this.add.text(470, -270, '✖', { font: '36px Arial', fill: '#ff0000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeK.on('pointerdown', () => this.closeOverlay(this.overlayKanban));
        
        let l1 = this.add.rectangle(-250, 0, 4, 600, 0x999999);
        let l2 = this.add.rectangle(0, 0, 4, 600, 0x999999);
        let l3 = this.add.rectangle(250, 0, 4, 600, 0x999999);

        let t1 = this.add.text(-375, -270, 'ОЧЕРЕДЬ', { font: '22px Arial', fill: '#333' }).setOrigin(0.5);
        let t2 = this.add.text(-125, -270, 'В РАБОТЕ', { font: '22px Arial', fill: '#333' }).setOrigin(0.5);
        let t3 = this.add.text(125, -270, 'ПРОВЕРКА', { font: '22px Arial', fill: '#333' }).setOrigin(0.5);
        let t4 = this.add.text(375, -270, 'ГОТОВО', { font: '22px Arial', fill: '#333' }).setOrigin(0.5);

        this.taskSticker = this.add.container(-375, -150).setVisible(false);
        let stickerBg = this.add.rectangle(0, 0, 200, 100, 0xffff88).setInteractive({ useHandCursor: true });
        let stickerText = this.add.text(0, 0, 'Задача 1:\nНе работает 1С', { font: '18px Arial', fill: '#000', align: 'center' }).setOrigin(0.5);
        this.taskSticker.add([stickerBg, stickerText]);

        stickerBg.on('pointerdown', () => {
            if (this.sysState.progress === 1) {
                this.sysState.progress = 2; 
                this.updateKanbanBoard();
                this.guruStatus.setText('Гуру 🟢').setFill('#00ff00');
                this.antiGuruStatus.setText('Анти-Гуру 🟢').setFill('#00ff00');
                this.showToast('Задача в работе. Подсказки в чате разблокированы.');
            }
        });

        this.overlayKanban.add([bgK, paper, l1, l2, l3, t1, t2, t3, t4, closeK, this.taskSticker]);
    }

    updateKanbanBoard() {
        if (this.sysState.progress >= 1) this.taskSticker.setVisible(true);
        if (this.sysState.progress === 1) this.taskSticker.setPosition(-375, -150); 
        if (this.sysState.progress === 2) this.taskSticker.setPosition(-125, -150); 
        if (this.sysState.progress === 3) this.taskSticker.setPosition(125, -150);  
        if (this.sysState.progress === 4) this.taskSticker.setPosition(375, -150);  
    }

    createMessengerUI() {
        this.overlayPhone = this.add.container(640, 360).setDepth(100).setVisible(false);
        let bgPhone = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive();
        
        let appBg = this.add.rectangle(0, 0, 1000, 600, 0x2b2b2b);
        let leftPanel = this.add.rectangle(-350, 0, 300, 600, 0x1a1a1a);
        let closePhone = this.add.text(470, -270, '✖', { font: '36px Arial', fill: '#ff0000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closePhone.on('pointerdown', () => this.closeOverlay(this.overlayPhone));

        this.add.text(-470, -270, 'КОНТАКТЫ', { font: '20px Arial', fill: '#aaa' }).setOrigin(0, 0.5);
        
        this.guruStatus = this.add.text(-470, -200, 'Гуру ⚪', { font: '24px Arial', fill: '#888' }).setInteractive({ useHandCursor: true });
        this.antiGuruStatus = this.add.text(-470, -150, 'Анти-Гуру ⚪', { font: '24px Arial', fill: '#888' }).setInteractive({ useHandCursor: true });
        this.accStatus = this.add.text(-470, -100, 'Гл. Бухгалтер 🟢', { font: '24px Arial', fill: '#00ff00' }).setInteractive({ useHandCursor: true });

        this.chatHeader = this.add.text(100, -270, 'Выберите чат', { font: '24px Arial', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        
        let chatHTML = '<div id="chat-body" style="width: 610px; height: 410px; overflow-y: auto; color: #fff; font-family: Arial; font-size: 18px; text-align: left; white-space: pre-wrap; padding-right: 10px; box-sizing: border-box;"></div>';
        this.chatDOM = this.add.dom(785, 330).createFromHTML(chatHTML).setVisible(false);

        this.chatNextBtn = this.add.text(100, 250, '[ ДАЛЕЕ ]', { font: '24px Arial', fill: '#ffff00' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        this.accStatus.on('pointerdown', () => this.openChat('Гл. Бухгалтер'));
        this.guruStatus.on('pointerdown', () => this.openChat('Гуру'));
        this.antiGuruStatus.on('pointerdown', () => this.openChat('Анти-Гуру'));

        this.overlayPhone.add([bgPhone, appBg, leftPanel, closePhone, this.guruStatus, this.antiGuruStatus, this.accStatus, this.chatHeader, this.chatNextBtn]);
    }

    openChat(contactName) {
        this.activeContact = contactName;
        this.chatHeader.setText(contactName);
        
        if (contactName === 'Гл. Бухгалтер' && (this.sysState.progress === 0 || this.sysState.progress === 3)) {
            this.accStatus.setText('Гл. Бухгалтер 🟢').setFill('#00ff00'); 
        }

        this.renderChat();
    }

    renderChat() {
        let data = this.chatData[this.activeContact];
        let element = document.getElementById('chat-body');
        if (!element) return;

        let txt = data.history || (data.queue.length === 0 && !data.hintBought ? 'Сообщений пока нет.' : '');
        element.innerText = txt;
        element.scrollTop = element.scrollHeight; 

        if (data.queue.length > 0) {
            this.chatNextBtn.setText('[ ДАЛЕЕ ]').setVisible(true);
            this.chatNextBtn.removeAllListeners('pointerdown');
            
            this.chatNextBtn.on('pointerdown', () => {
                let msg = data.queue.shift(); 
                data.history += (data.history === '' ? '' : '\n\n') + msg; 
                this.renderChat(); 
                
                if (data.queue.length === 0) {
                    this.finishDialog(this.activeContact);
                }
            });
        } 
        else {
            if ((this.activeContact === 'Гуру' || this.activeContact === 'Анти-Гуру') && this.sysState.progress === 2 && !data.hintBought) {
                element.innerText = data.history + (data.history ? '\n\n' : '') + 'Системное сообщение: Хотите получить подсказку?\n(Спишется баллов: ' + (this.activeContact === 'Гуру' ? '10' : '5') + ')';
                element.scrollTop = element.scrollHeight;
                
                this.chatNextBtn.setText('[ КУПИТЬ ПОДСКАЗКУ ]').setVisible(true);
                this.chatNextBtn.removeAllListeners('pointerdown');
                this.chatNextBtn.on('pointerdown', () => {
                    data.hintBought = true; 
                    if (this.activeContact === 'Гуру') {
                        this.updateScore(-10);
                        data.history += (data.history ? '\n\n' : '') + 'Гуру: Хм. Чтобы сисадмином быть, нужно команду ping прежде всего освоить';
                    } else {
                        this.updateScore(-5);
                        data.history += (data.history ? '\n\n' : '') + 'Анти-Гуру: Бро, там дрова одни. Проверь, может сдохло что?';
                    }
                    this.renderChat();
                });
            } else {
                this.chatNextBtn.setVisible(false);
            }
        }
    }

    finishDialog(contactName) {
        if (contactName === 'Гл. Бухгалтер') {
            if (this.sysState.progress === 0) {
                this.sysState.progress = 1;
                this.showToast('Новое задание на Канбан-доске!');
                this.playDing();
                this.updateKanbanBoard();
            } else if (this.sysState.progress === 3) {
                this.sysState.progress = 4;
                this.showToast('Задание успешно выполнено!');
                this.playDing();
                
                this.chatData['Гл. Бухгалтер'].history = '[ Чат заархивирован. Задание успешно выполнено. ]';
                this.renderChat();
                
                this.updateKanbanBoard();
            }
        }
    }
}

// === ЗАПУСК ДВИЖКА (ТО, ЧТО ПОТЕРЯЛОСЬ В ПРОШЛЫЙ РАЗ) ===
const config = {
    type: Phaser.AUTO, width: 1280, height: 720, parent: 'game-container',
    dom: { createContainer: true }, scene: [BootScene, IntroScene, MainWorkspaceScene]
};
const game = new Phaser.Game(config);