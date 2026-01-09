class VirtualJoystick {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.color = options.color || '#00f3ff';
        this.size = options.size || 150;
        this.handleSize = this.size * 0.4;
        
        this.active = false;
        this.currentPos = { x: 0, y: 0 };
        this.onMove = options.onMove || (() => {});
        this.onEnd = options.onEnd || (() => {});
        
        this.initUI();
        this.attachEvents();
    }

    initUI() {
        this.container.style.position = 'relative';
        this.container.style.width = this.size + 'px';
        this.container.style.height = this.size + 'px';
        this.container.style.borderRadius = '50%';
        this.container.style.background = 'rgba(255, 255, 255, 0.1)';
        this.container.style.border = `2px solid ${this.color}`;
        this.container.style.margin = '20px auto';
        this.container.style.touchAction = 'none'; // Prevenir scroll

        // Palanca
        this.handle = document.createElement('div');
        this.handle.style.width = this.handleSize + 'px';
        this.handle.style.height = this.handleSize + 'px';
        this.handle.style.borderRadius = '50%';
        this.handle.style.background = this.color;
        this.handle.style.position = 'absolute';
        this.handle.style.top = '50%';
        this.handle.style.left = '50%';
        this.handle.style.transform = 'translate(-50%, -50%)';
        this.handle.style.boxShadow = `0 0 15px ${this.color}`;
        this.handle.style.transition = 'transform 0.1s';
        
        this.container.appendChild(this.handle);
    }

    attachEvents() {
        const start = (e) => {
            e.preventDefault();
            this.active = true;
            this.handle.style.transition = 'none';
            this.update(e);
        };

        const move = (e) => {
            if (!this.active) return;
            e.preventDefault();
            this.update(e);
        };

        const end = (e) => {
            if (!this.active) return;
            e.preventDefault();
            this.active = false;
            this.handle.style.transition = 'transform 0.2s';
            this.handle.style.transform = 'translate(-50%, -50%)';
            this.onEnd();
        };

        this.container.addEventListener('mousedown', start);
        this.container.addEventListener('touchstart', start);

        window.addEventListener('mousemove', move);
        window.addEventListener('touchmove', move);

        window.addEventListener('mouseup', end);
        window.addEventListener('touchend', end);
    }

    update(e) {
        const rect = this.container.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = clientX - centerX;
        let dy = clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = this.size / 2 - this.handleSize / 2;

        if (distance > maxDist) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * maxDist;
            dy = Math.sin(angle) * maxDist;
        }

        this.handle.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        // Normalizar valores (-1 a 1)
        const x = dx / maxDist;
        const y = -(dy / maxDist); // Invertir Y porque arriba es negativo en pantalla

        this.onMove({ x, y });
    }
}
