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
        this.isSSH = false; 
        this.keslStarted = false; 
        
        this.files = {
            '1.sh': { content: '#!/bin/bash\r\necho "Hello, world!"\r\n', size: '128B', hidden: false, perms: '-rwxr-xr-x' },
            '1.txt': { content: 'Test file content.\r\n', size: '14B', hidden: false, perms: '-rw-r--r--' },
            '.bash_history': { content: 'ping 10.138.5.105\r\nls -lah\r\n', size: '2.1K', hidden: true, perms: '-rw-r--r--' }
        };

        this.setupInput();
    }

    getPrompt() {
        return this.isSSH ? '[admin@10.138.10.101 ~]$ ' : `user@sysadmin:${this.currentPath}$ `;
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
                    this.term.write(`\r\n${this.getPrompt()}`);
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
        const availableCommands = ['ping', 'help', 'clear', 'ls', 'cat', 'cd', 'pwd', 'touch', 'rm', 'mv', 'wget', 'unzip', 'ssh', 'systemctl', 'exit'];
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
            // Вот он, наш обновленный help!
            help: () => {
                let progress = this.scene ? this.scene.sysState.progress : 0;
                let out = 'Доступные команды:\r\n ping, clear, ls, cd, pwd, cat, touch, rm, mv, wget, unzip, ssh, systemctl, exit\r\n';
                
                // Подсказка про Касперского появляется ТОЛЬКО на 2 задании (прогресс от 6 до 9)
                if (progress >= 6 && progress <= 9) {
                    out += '\r\nПроверка листов блокировки интернета на сервере Касперского:\r\n wget http://ksc.domain.loc/list.zip\r\n';
                }
                
                this.term.write(out);
            },
            clear: () => this.term.clear(),
            pwd: () => this.term.write(this.isSSH ? '/home/admin\r\n' : `${this.currentPath}\r\n`),
            ls: (args) => this.cmdLS(args),
            cat: (args) => this.cmdCAT(args),
            cd: (args) => this.cmdCD(args),
            touch: (args) => this.cmdFileMgmt(args, 'touch'),
            rm: (args) => this.cmdFileMgmt(args, 'rm'),
            mv: (args) => this.cmdFileMgmt(args, 'mv'),
            ping: (args) => this.cmdPing(args),
            wget: (args) => this.cmdWget(args),
            unzip: (args) => this.cmdUnzip(args),
            ssh: (args) => this.cmdSSH(args),
            systemctl: (args) => this.cmdSystemctl(args),
            exit: () => this.cmdExit()
        };
        
        if (commands[baseCmd]) commands[baseCmd](args);
        else this.term.write(`bash: ${baseCmd}: command not found\r\n`);

        if (this.scene && typeof this.scene.checkTerminalProgress === 'function') {
            this.scene.checkTerminalProgress();
        }
    }

    cmdLS(args) {
        if (this.isSSH) return this.term.write('\r\n');
        let flags = args.filter(a => a.startsWith('-')).join('');
        let hasA = flags.includes('a'), hasL = flags.includes('l');
        let fileNames = Object.keys(this.files);
        if (!hasA) fileNames = fileNames.filter(name => !this.files[name].hidden);

        if (hasL) {
            this.term.write('total 1.2M\r\n');
            fileNames.forEach(name => {
                let f = this.files[name];
                this.term.write(`${f.perms} 1 sysadmin sysadmin ${f.size} Jun 30 14:00 ${name}\r\n`);
            });
        } else {
            if (fileNames.length > 0) this.term.write(fileNames.join('   ') + '\r\n');
        }
    }

    cmdCAT(args) {
        let target = args[0];
        if (!target) return this.term.write('cat: missing operand\r\n');
        if (this.isSSH) return this.term.write(`cat: ${target}: No such file or directory\r\n`);
        
        if (this.files[target]) this.term.write(this.files[target].content);
        else this.term.write(`cat: ${target}: No such file or directory\r\n`);
    }

    cmdCD(args) {
        if (this.isSSH) return;
        let path = args[0] || '~';
        if (path === '/root') this.term.write('bash: cd: /root: Permission denied\r\n');
    }

    cmdFileMgmt(args, cmd) {
        if (this.isSSH) return this.term.write(`${cmd}: Permission denied\r\n`);
        let target = args.find(a => !a.startsWith('-')); 
        if (!target && cmd !== 'mv') return this.term.write(`${cmd}: missing file operand\r\n`);

        if (cmd === 'touch') {
            if (!this.files[target]) this.files[target] = { content: '', size: '0B', hidden: target.startsWith('.'), perms: '-rw-r--r--' };
        } 
        else if (cmd === 'rm') {
            if (this.files[target]) delete this.files[target];
            else this.term.write(`rm: cannot remove '${target}': No such file or directory\r\n`);
        } 
    }

    cmdWget(args) {
        if (this.isSSH) return this.term.write('wget: command not found\r\n');
        let url = args[0];
        if (url === 'http://ksc.domain.loc/list.zip') {
            // Красивый, ровный лог скачивания под наши реалии
            let out = `--2026-07-01 10:03:21--  http://ksc.domain.loc/list.zip\r\n`;
            out += `Распознаётся ksc.domain.loc (10.160.0.30)… соединение установлено.\r\n`;
            out += `HTTP-запрос отправлен. Ожидание ответа… 200 OK\r\n`;
            out += `Длина: 186 [application/x-zip-compressed]\r\n`;
            out += `Сохранение в: «list.zip»\r\n\r\n`;
            out += `list.zip                    100%[===================>]     186  --.-KB/s    за 0s\r\n\r\n`;
            out += `2026-07-01 10:03:21 (24,9 MB/s) - «list.zip» сохранён [186/186]\r\n`;
            this.term.write(out);
            
            this.files['list.zip'] = { content: 'PK\x03\x04... binary data ...', size: '186B', hidden: false, perms: '-rw-r--r--' };
        } else {
            this.term.write('wget: missing URL or 404 Not Found\r\n');
        }
    }



    cmdUnzip(args) {
        if (this.isSSH) return this.term.write('unzip: command not found\r\n');
        let target = args[0];
        if (target === 'list.zip' && this.files['list.zip']) {
            this.term.write('Archive:  list.zip\r\n  inflating: list.txt\r\n');
            this.files['list.txt'] = { content: '10.138.10.101\r\n', size: '14B', hidden: false, perms: '-rw-r--r--' };
        } else {
            this.term.write(`unzip: cannot find or open ${target || 'archive'}\r\n`);
        }
    }

    cmdSSH(args) {
        let target = args[0];
        if (target === 'admin@10.138.10.101') {
            // Реалистичная имитация входа по ключам (без зависаний на yes/no)
            let out = `Warning: Permanently added '10.138.10.101' (ED25519) to the list of known hosts.\r\n`;
            out += `Authenticating with public key "sysadmin_rsa"...\r\n`;
            
            // ИСПРАВЛЕНИЕ: Указан правильный IP админа из схемы сети (10.138.10.105)
            out += `Last login: Wed Jul 01 09:15:22 2026 from 10.138.10.105\r\n`; 
            
            this.term.write(out);
            this.isSSH = true;
        } else {
            this.term.write(`ssh: Could not resolve hostname ${target || ''}: Name or service not known\r\n`);
        }
    }

    cmdSystemctl(args) {
        let action = args[0];
        let service = args[1];

        if (service !== 'kesl') return this.term.write(`Unit ${service}.service could not be found.\r\n`);

        if (action === 'status') {
            if (!this.isSSH) {
                let out = `● kesl.service - kesl\r\n`;
                out += `     Loaded: loaded (/usr/lib/systemd/system/kesl.service; enabled; preset: disabled)\r\n`;
                out += `     Active: active (running) since Fri 2026-06-26 04:03:20 MSK; 5 days ago\r\n`;
                out += `   Main PID: 1483 (wdserver)\r\n`;
                out += `      Tasks: 116 (limit: 18834)\r\n`;
                out += `     Memory: 1.2G\r\n`;
                this.term.write(out);
            } else {
                if (this.keslStarted) {
                    let out = `● kesl.service - kesl\r\n     Loaded: loaded (/usr/lib/systemd/system/kesl.service; enabled; preset: disabled)\r\n     Active: active (running) since Wed 2026-07-01 10:33:10 MSK; 1s ago\r\n`;
                    this.term.write(out);
                } else {
                    let out = `● kesl.service - kesl\r\n     Loaded: loaded (/usr/lib/systemd/system/kesl.service; disabled; preset: disabled)\r\n     Active: inactive (dead)\r\n`;
                    this.term.write(out);
                }
            }
        } 
        else if (action === 'start') {
            if (this.isSSH) {
                this.keslStarted = true;
                this.term.write('\r\n');
                // ИСПРАВЛЕНИЕ: Добавляем подсказку игроку о том, что нужно ввести exit
                if (this.scene) this.scene.showToast('💬 Вы: Антивирус запущен. Теперь нужно выйти из сессии (команда exit)');
            } else {
                this.term.write('==== AUTHENTICATING FOR org.freedesktop.systemd1.manage-units ====\r\nAuthentication is required to start \'kesl.service\'.\r\n');
            }
        }
    }

    cmdExit() {
        if (this.isSSH) {
            this.isSSH = false;
            this.term.write('logout\r\nConnection to 10.138.10.101 closed.\r\n');
            
            // Если мы всё починили и вернулись на свой комп, игра переходит к проверке
            if (this.keslStarted && this.scene && this.scene.sysState.progress === GAME_STAGE.DIR_WORKING) {
                this.scene.sysState.progress = GAME_STAGE.DIR_CHECKING;
                this.scene.checkTerminalProgress();
            }
        } else {
            this.term.write('exit\r\n');
        }
    }

    cmdPing(args) {
        let progress = this.scene ? this.scene.sysState.progress : 0;
        let targetIp = args[0];

        if (!targetIp) return this.term.write('ping: missing host operand\r\n');

        const internetHosts = [
            'ya.ru', 'yandex.ru', 'google.com', 'google.ru', 'vk.com', 
            'mail.ru', 'youtube.com', 'github.com', 'habr.com', 
            '8.8.8.8', '1.1.1.1'
        ];

        // 1. Проверка Пинга на внешний адрес (Интернет)
        if (internetHosts.includes(targetIp)) {
            if (this.isSSH && !this.keslStarted) {
                // Имитация: с компа Директора без антивируса в инет не пускает
                let out = `PING ${targetIp} 56(84) bytes of data.\r\n`;
                out += `From 10.138.10.101 icmp_seq=1 Destination Net Unreachable\r\n`;
                out += `From 10.138.10.101 icmp_seq=2 Destination Net Unreachable\r\n`;
                out += `From 10.138.10.101 icmp_seq=3 Destination Net Unreachable\r\n`;
                out += `^C\r\n--- ${targetIp} ping statistics ---\r\n`;
                out += `3 packets transmitted, 0 received, +3 errors, 100% packet loss, time 2005ms\r\n`;
                this.term.write(out);
            } else {
                // Инет работает (у нас или у Директора с запущенным Касперским)
                let out = `PING ${targetIp} 56(84) bytes of data.\r\n`;
                out += `64 bytes from ${targetIp}: icmp_seq=1 ttl=53 time=15.9 ms\r\n`;
                out += `64 bytes from ${targetIp}: icmp_seq=2 ttl=53 time=16.2 ms\r\n`;
                out += `64 bytes from ${targetIp}: icmp_seq=3 ttl=53 time=15.7 ms\r\n`;
                out += `^C\r\n--- ${targetIp} ping statistics ---\r\n`;
                out += `3 packets transmitted, 3 received, 0% packet loss, time 2002ms\r\n`;
                out += `rtt min/avg/max/mdev = 15.695/15.913/16.184/0.202 ms\r\n`;
                this.term.write(out);
                
                if (this.scene && !this.isSSH) this.scene.sysState.pingYaRuDone = true;
            }
            return;
        }

        if (progress < 2) return this.term.write('Ошибка: У вас нет активных задач в сети.\r\n');

        // ИСПРАВЛЕНИЕ: Берем правильный IP из схемы сети (10.138.10.105) 
        // или IP Директора, если мы сидим через SSH
        let myIp = this.isSSH ? '10.138.10.101' : '10.138.10.105'; 
        
        const offlineIps = ['10.138.5.103', '10.138.5.104', '10.138.5.105'];
        const onlineIps = ['10.138.5.101', '10.138.5.102', '10.138.5.51', '10.138.5.1', '10.160.0.30'];

        if (offlineIps.includes(targetIp)) {
            let out = `PING ${targetIp} (${targetIp}) 56(84) bytes of data.\r\n`;
            out += `From ${myIp} icmp_seq=1 Destination Host Unreachable\r\n`;
            out += `From ${myIp} icmp_seq=2 Destination Host Unreachable\r\n`;
            out += `From ${myIp} icmp_seq=3 Destination Host Unreachable\r\n`;
            out += `^C\r\n--- ${targetIp} ping statistics ---\r\n`;
            out += `3 packets transmitted, 0 received, +3 errors, 100% packet loss, time 2005ms\r\n`;
            this.term.write(out);
            
            if (this.scene && progress === 2 && targetIp === '10.138.5.105') this.scene.sysState.pingAccDone = true;
        } 
        else if (onlineIps.includes(targetIp)) {
            let out = `PING ${targetIp} (${targetIp}) 56(84) bytes of data.\r\n`;
            out += `64 bytes from ${targetIp}: icmp_seq=1 ttl=128 time=0.236 ms\r\n`;
            out += `64 bytes from ${targetIp}: icmp_seq=2 ttl=128 time=0.225 ms\r\n`;
            out += `64 bytes from ${targetIp}: icmp_seq=3 ttl=128 time=0.301 ms\r\n`;
            out += `^C\r\n--- ${targetIp} ping statistics ---\r\n`;
            out += `3 packets transmitted, 3 received, 0% packet loss, time 2000ms\r\n`;
            out += `rtt min/avg/max/mdev = 0.225/0.254/0.301/0.033 ms\r\n`;
            this.term.write(out);
            
            if (this.scene && progress === 2 && targetIp !== '10.138.5.1') this.scene.sysState.pingNeighborDone = true;
        }
        else {
            this.term.write(`ping: ${targetIp}: Name or service not known\r\n`);
        }
    }
}