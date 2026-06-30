// ==========================================
// ЛОГИКА ТЕРМИНАЛА (terminal.js)
// ==========================================

class VirtualTerminal {
    constructor(termInstance, scene) {
        this.term = termInstance;
        this.scene = scene;
        this.command = '';
        this.commandHistory = [];
        this.historyIndex = 0;
        this.currentPath = '/home/sysadmin';
        
        this.files = {
            '1.sh': { content: '#!/bin/bash\r\necho "Hello, world!"\r\n', size: '128B', hidden: false, perms: '-rwxr-xr-x' },
            '1.txt': { content: 'Test file content.\r\n', size: '14B', hidden: false, perms: '-rw-r--r--' },
            '.bash_history': { content: 'ping 10.138.5.105\r\nls -lah\r\n', size: '2.1K', hidden: true, perms: '-rw-r--r--' }
        };

        this.setupInput();
    }

    setupInput() {
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
                    this.term.write(`\r\nuser@sysadmin:${this.currentPath}$ `);
                    break;
                case '\u007F': 
                    if (this.command.length > 0) { this.command = this.command.slice(0, -1); this.term.write('\b \b'); } break;
                case '\t': 
                    this.handleTabCompletion(); break;
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

    handleTabCompletion() {
        if (this.command.trim() === '') return;
        const availableCommands = ['ping', 'help', 'clear', 'ls', 'cat', 'cd', 'pwd', 'touch', 'rm', 'mv'];
        const match = availableCommands.find(cmd => cmd.startsWith(this.command));
        if (match) { const remainder = match.slice(this.command.length); this.command = match; this.term.write(remainder); }
    }

    replaceTerminalInput(newCmd) {
        for (let i = 0; i < this.command.length; i++) this.term.write('\b \b');
        this.command = newCmd; this.term.write(this.command);
    }

    executeCommand(cmd) {
        cmd = cmd.trim(); 
        if (cmd === '') return;

        let parts = cmd.split(' ').filter(p => p !== '');
        let baseCmd = parts[0];
        let args = parts.slice(1);

        const commands = {
            help: () => this.term.write('Доступные команды:\r\n ping, clear, ls, cd, pwd, cat, touch, rm, mv\r\n'),
            clear: () => this.term.clear(),
            pwd: () => this.term.write(`${this.currentPath}\r\n`),
            ls: (args) => this.cmdLS(args), cat: (args) => this.cmdCAT(args), cd: (args) => this.cmdCD(args),
            touch: (args) => this.cmdFileMgmt(args, 'touch'), rm: (args) => this.cmdFileMgmt(args, 'rm'),
            mv: (args) => this.cmdFileMgmt(args, 'mv'), ping: (args) => this.cmdPing(args),
        };
        
        if (commands[baseCmd]) commands[baseCmd](args);
        else this.term.write(`bash: ${baseCmd}: command not found\r\n`);

        if (this.scene && typeof this.scene.checkTerminalProgress === 'function') {
            this.scene.checkTerminalProgress();
        }
    }

    cmdLS(args) {
        let flags = args.filter(a => a.startsWith('-')).join('');
        let hasL = flags.includes('l'), hasA = flags.includes('a'), hasH = flags.includes('h');
        let fileNames = Object.keys(this.files);
        if (!hasA) fileNames = fileNames.filter(name => !this.files[name].hidden);

        if (hasL) {
            this.term.write('total ' + (hasH ? '1.2M' : '1254096') + '\r\n');
            if (hasA) {
                this.term.write('drwxr-xr-x 2 sysadmin sysadmin ' + (hasH ? '4.0K' : '4096') + ' Jun 29 09:00 .\r\n');
                this.term.write('drwxr-xr-x 3 root     root     ' + (hasH ? '4.0K' : '4096') + ' Jun 29 08:50 ..\r\n');
            }
            fileNames.forEach(name => {
                let f = this.files[name];
                let sizeStr = hasH ? f.size : parseInt(f.size) || '0';
                this.term.write(`${f.perms} 1 sysadmin sysadmin ${sizeStr} Jun 29 14:00 ${name}\r\n`);
            });
        } else {
            if (fileNames.length > 0) this.term.write(fileNames.join('   ') + '\r\n');
        }
    }

    cmdCAT(args) {
        let target = args[0];
        if (!target) return this.term.write('cat: missing operand\r\n');
        if (this.files[target]) this.term.write(this.files[target].content);
        else this.term.write(`cat: ${target}: No such file or directory\r\n`);
    }

    cmdCD(args) {
        let path = args[0] || '~';
        if (path === '/root') this.term.write('bash: cd: /root: Permission denied\r\n');
    }

    cmdFileMgmt(args, cmd) {
        let target = args.find(a => !a.startsWith('-')); 
        if (!target && cmd !== 'mv') return this.term.write(`${cmd}: missing file operand\r\n`);

        if (cmd === 'touch') {
            if (!this.files[target]) this.files[target] = { content: '', size: '0B', hidden: target.startsWith('.'), perms: '-rw-r--r--' };
        } 
        else if (cmd === 'rm') {
            if (this.files[target]) delete this.files[target];
            else this.term.write(`rm: cannot remove '${target}': No such file or directory\r\n`);
        } 
        else if (cmd === 'mv') {
            let dest = args[1];
            if (!target || !dest) return this.term.write(`mv: missing file operand\r\n`);
            if (this.files[target]) {
                this.files[dest] = this.files[target];
                this.files[dest].hidden = dest.startsWith('.'); 
                delete this.files[target];
            } else {
                this.term.write(`mv: cannot stat '${target}': No such file or directory\r\n`);
            }
        }
    }

   // РЕАЛИСТИЧНЫЙ ВЫВОД PING С ФЛАГАМИ ДЛЯ СЮЖЕТА
    cmdPing(args) {
        let progress = this.scene ? this.scene.sysState.progress : 0;
        if (progress < 2) { // 2 - это GAME_STAGE.WORKING
            this.term.write('Ошибка: У вас нет активных задач в сети.\r\n');
            return;
        }

        let targetIp = args[0];
        let myIp = '10.150.58.104'; // Имитация нашего IP

        // Выключенный 2-й коммутатор (Гл.бух и её соседи)
        const offlineIps = ['10.138.5.103', '10.138.5.104', '10.138.5.105'];
        
        // Работающий 1-й коммутатор (и шлюз .1)
        const onlineIps = ['10.138.5.101', '10.138.5.102', '10.138.5.51', '10.138.5.1'];

        if (offlineIps.includes(targetIp)) {
            // Пинг НЕ проходит
            let out = `PING ${targetIp} (${targetIp}) 56(84) bytes of data.\r\n`;
            out += `From ${myIp} icmp_seq=1 Destination Host Unreachable\r\n`;
            out += `From ${myIp} icmp_seq=2 Destination Host Unreachable\r\n`;
            out += `From ${myIp} icmp_seq=3 Destination Host Unreachable\r\n`;
            out += `--- ${targetIp} ping statistics ---\r\n`;
            out += `3 packets transmitted, 0 received, +3 errors, 100% packet loss, time 3045ms\r\n`;
            this.term.write(out);
            
            // Если пинганули недоступный комп (фиксируем для сюжета)
            if (this.scene && progress === 2) {
                if (targetIp === '10.138.5.105') {
                    this.scene.sysState.pingAccDone = true;
                }
            }
        } 
        else if (onlineIps.includes(targetIp)) {
            // Пинг ПРОХОДИТ успешно
            let out = `PING ${targetIp} (${targetIp}) 56(84) bytes of data.\r\n`;
            out += `64 bytes from ${targetIp}: icmp_seq=1 ttl=128 time=0.236 ms\r\n`;
            out += `64 bytes from ${targetIp}: icmp_seq=2 ttl=128 time=0.225 ms\r\n`;
            out += `64 bytes from ${targetIp}: icmp_seq=3 ttl=128 time=0.301 ms\r\n`;
            out += `--- ${targetIp} ping statistics ---\r\n`;
            out += `3 packets transmitted, 3 received, 0% packet loss, time 2071ms\r\n`;
            out += `rtt min/avg/max/mdev = 0.225/0.251/0.301/0.029 ms\r\n`;
            this.term.write(out);

            // Если пинганули работающий комп из 1-го коммутатора (кроме шлюза .1)
            if (this.scene && progress === 2 && targetIp !== '10.138.5.1') {
                this.scene.sysState.pingNeighborDone = true;
            }
        }
        else if (targetIp) {
            // Для любых других IP адресов
            this.term.write(`ping: connect: Network is unreachable\r\n`);
        }
        else {
            this.term.write('ping: usage error: Destination address required\r\n');
        }
    }
}