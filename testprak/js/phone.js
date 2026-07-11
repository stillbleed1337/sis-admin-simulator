/**
 * PhoneMessenger — управляет телефоном-мессенджером.
 * Создаёт Phaser-контейнер (overlayPhone) с блокирующим фоном + DOM-элемент из phone.html.
 * Все обертки совместимы со старым кодом game.js (chatHeader, accStatus, chatDOM и т.д.)
 */
class PhoneMessenger {
    constructor(scene) {
        this.scene = scene;

        // Хранилище динамических колбэков для кнопок
        this._hintCallback = null;
        this._nextCallback = null;

        // 1. Создаём Phaser-контейнер (как в оригинале)
        this.container = scene.add.container(640, 360).setDepth(100).setVisible(false);

        // 2. Блокирующий фон — чёрный полупрозрачный прямоугольник, ловит все клики
        let bgPhone = scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.85).setInteractive();
        bgPhone.on('pointerdown', () => {}); // Блокируем проход кликов

        // 3. DOM-элемент из phone.html
        this.dom = scene.add.dom(640, 360).createFromCache('phoneUI').setDepth(101);
        this.dom.setVisible(false);

        // 4. Добавляем фон в контейнер (DOM нельзя в Phaser-контейнер, он отдельно)
        this.container.add([bgPhone]);

        // 5. Ссылки на ключевые HTML-элементы
        this.chatBody = this.dom.getChildByID('chat-body');
        this.chatName = this.dom.getChildByID('chat-name');
        this.btnHint = this.dom.getChildByID('btn-hint');
        this.btnNext = this.dom.getChildByID('btn-next');

        this.statusNodes = {
            'Общий чат': this.dom.getChildByID('status-general'),
            'Магистр': this.dom.getChildByID('status-magistr'),
            'Жорик': this.dom.getChildByID('status-jora'),
            'Гл. Бухгалтер': this.dom.getChildByID('status-acc'),
            'Директор': this.dom.getChildByID('status-dir')
        };
        this.itemNodes = {
            'Общий чат': this.dom.getChildByID('btn-general'),
            'Магистр': this.dom.getChildByID('btn-magistr'),
            'Жорик': this.dom.getChildByID('btn-jora'),
            'Гл. Бухгалтер': this.dom.getChildByID('btn-acc'),
            'Директор': this.dom.getChildByID('btn-dir')
        };

        // 6. Привязываем обработчики кликов к DOM
        const self = this;
        this.dom.addListener('click');
        this.dom.on('click', (event) => {
            const target = event.target;
            const item = target.closest ? target.closest('.contact-item') : null;

            // Кнопка закрытия
            if (target.id === 'btn-close-phone' || (target.closest && target.closest('#btn-close-phone'))) {
                scene.closeOverlay(scene.overlayPhone);
                return;
            }

            // Клик по контакту
            if (item) {
                if (item.id === 'btn-general') scene.openChat('Общий чат');
                if (item.id === 'btn-magistr') scene.openChat('Магистр');
                if (item.id === 'btn-jora') scene.openChat('Жорик');
                if (item.id === 'btn-acc') scene.openChat('Гл. Бухгалтер');
                if (item.id === 'btn-dir') scene.openChat('Директор');
                return;
            }

            // Кнопка подсказки — вызывает динамический callback
            if (target.id === 'btn-hint' || (target.closest && target.closest('#btn-hint'))) {
                if (self._hintCallback) self._hintCallback();
                return;
            }

            // Кнопка "Продолжить" — вызывает динамический callback
            if (target.id === 'btn-next' || (target.closest && target.closest('#btn-next'))) {
                if (self._nextCallback) self._nextCallback();
                return;
            }
        });
    }

    /**
     * Привязывает "обёртки" к scene, чтобы весь старый код game.js работал без изменений.
     */
    bindToScene() {
        const self = this;
        const scene = this.scene;

        // overlayPhone — Phaser-контейнер (поддерживает .visible, .setVisible, tweens)
        scene.overlayPhone = this.container;

        // Переопределяем setVisible чтобы синхронизировать DOM
        const originalSetVisible = this.container.setVisible.bind(this.container);
        this.container.setVisible = (val) => {
            originalSetVisible(val);
            self.dom.setVisible(val);
            if (val) {
                self.dom.setAlpha(1);
            }
            return self.container;
        };

        // Переопределяем setAlpha чтобы синхронизировать DOM
        const originalSetAlpha = this.container.setAlpha.bind(this.container);
        this.container.setAlpha = (val) => {
            originalSetAlpha(val);
            self.dom.setAlpha(val);
            return self.container;
        };

        // Синхронизация DOM с контейнером каждый кадр (tweens меняют .alpha напрямую)
        scene.events.on('update', () => {
            if (self.dom) {
                self.dom.setAlpha(self.container.alpha);
                if (!self.container.visible && self.dom.visible) {
                    self.dom.setVisible(false);
                }
            }
        });

        // chatHeader — обёртка для изменения имени в шапке чата
        scene.chatHeader = {
            setText: (text) => {
                if (self.chatName) self.chatName.innerText = text;
                // Подсветка активного контакта
                Object.values(self.itemNodes).forEach(node => {
                    if (node) node.classList.remove('active');
                });
                if (self.itemNodes[text]) {
                    self.itemNodes[text].classList.add('active');
                }
                return scene.chatHeader;
            }
        };

        // Статусы контактов
        scene.generalChatStatus = this._createStatusWrapper('Общий чат');
        scene.guruStatus        = this._createStatusWrapper('Магистр');
        scene.antiGuruStatus    = this._createStatusWrapper('Жорик');
        scene.accStatus         = this._createStatusWrapper('Гл. Бухгалтер');
        scene.dirStatus         = this._createStatusWrapper('Директор');

        // Кнопки hint/next — обёртки, вызываемые из renderChat()
        // ВАЖНО: .on('pointerdown', fn) сохраняет fn как динамический callback
        scene.chatHintBtn = {
            setVisible: (v) => {
                if (self.btnHint) self.btnHint.style.display = v ? 'block' : 'none';
                return scene.chatHintBtn;
            },
            setText: (t) => {
                if (self.btnHint) self.btnHint.innerText = t;
                return scene.chatHintBtn;
            },
            removeAllListeners: () => {
                self._hintCallback = null;
                return scene.chatHintBtn;
            },
            on: (event, fn) => {
                self._hintCallback = fn;
                return scene.chatHintBtn;
            }
        };

        scene.chatNextBtn = {
            setVisible: (v) => {
                if (self.btnNext) self.btnNext.style.display = v ? 'block' : 'none';
                return scene.chatNextBtn;
            },
            removeAllListeners: () => {
                self._nextCallback = null;
                return scene.chatNextBtn;
            },
            on: (event, fn) => {
                self._nextCallback = fn;
                return scene.chatNextBtn;
            }
        };

        // chatDOM — обёртка (game.js использует document.getElementById('chat-body') напрямую,
        // но также делает this.chatDOM tweens при закрытии)
        scene.chatDOM = {
            setVisible: () => { return scene.chatDOM; },
            setAlpha: () => { return scene.chatDOM; },
            getChildByID: (id) => {
                if (id === 'chat-body') return self.chatBody;
                return null;
            }
        };

        // contactsDOM — обёртка-заглушка
        scene.contactsDOM = {
            setVisible: () => { return scene.contactsDOM; },
            setAlpha: () => { return scene.contactsDOM; }
        };
    }

    _createStatusWrapper(contactName) {
        const self = this;
        const wrapper = {
            setText: (t) => {
                if (self.statusNodes[contactName]) self.statusNodes[contactName].innerText = t;
                return wrapper;
            },
            setFill: (c) => {
                if (self.statusNodes[contactName]) self.statusNodes[contactName].style.color = c;
                return wrapper;
            }
        };
        return wrapper;
    }
}
