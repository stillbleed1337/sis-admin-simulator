const fs = require('fs');
let code = fs.readFileSync('c:/Users/ropzr/Desktop/igra-sisadmin/sis-admin-simulator/testprak/js/game.js', 'utf8');

const target1 = "          let m1 = this.add.rectangle(830, 300, 780, 480, 0x111111).setDepth(1).setStrokeStyle(4, 0x333333);\r\n          let m2 = this.add.rectangle(830, 560, 150, 40, 0x111111).setDepth(1);\r\n          let m3 = this.add.rectangle(830, 580, 250, 20, 0x111111).setDepth(1);\r\n          let mShadow = this.add.rectangle(830, 595, 270, 15, 0x000000, 0.6).setDepth(1);\r\n  \r\n          let termHTML = '<div id=\"terminal-container\" style=\"width: 750px; height: 450px; background-color: #000; padding: 15px 25px 15px 15px; border: 3px solid #333; overflow: hidden; user-select: text; box-sizing: border-box;\"></div>';";
const target2 = target1.replace(/\r\n/g, '\n');

const replacement = "          // Улучшенный дизайн терминального монитора\n          let m1 = this.add.rectangle(830, 300, 780, 480, 0x111111).setDepth(1).setStrokeStyle(4, 0x333333);\n          // Нижняя рамка монитора, где будет надпись sys-admin\n          let mBezelBottom = this.add.rectangle(830, 530, 775, 20, 0x1a1d21).setDepth(1);\n          let monitorLogo = this.add.text(830, 530, 'sys-admin', { font: 'bold 13px monospace', fill: '#555555', letterSpacing: 2 }).setOrigin(0.5).setDepth(1);\n          let monitorLed = this.add.circle(1200, 530, 3, 0x00ff00).setDepth(1);\n\n          // Стойка монитора\n          let m2 = this.add.rectangle(830, 560, 60, 40, 0x15181a).setDepth(1);\n          let m3 = this.add.rectangle(830, 585, 260, 15, 0x111111).setDepth(1);\n          let mShadow = this.add.ellipse(830, 595, 280, 20, 0x000000, 0.6).setDepth(1);\n  \n          let termHTML = '<div id=\"terminal-container\" style=\"width: 760px; height: 440px; background-color: #050505; padding: 15px; border: 2px solid #222; box-shadow: inset 0 0 15px rgba(0,0,0,0.8); overflow: hidden; user-select: text; box-sizing: border-box; border-radius: 4px;\"></div>';";

if (code.includes(target1)) { code = code.replace(target1, replacement); console.log('Replaced target1'); }
else if (code.includes(target2)) { code = code.replace(target2, replacement); console.log('Replaced target2'); }
else { console.log('Target not found!'); }

fs.writeFileSync('c:/Users/ropzr/Desktop/igra-sisadmin/sis-admin-simulator/testprak/js/game.js', code, 'utf8');
