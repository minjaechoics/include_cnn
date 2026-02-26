// 초고정확도 CNN - 50K 샘플 + 100 Epochs + 최고 품질 패턴
class UltraMNISTTrainer {
    generateSyntheticData(numSamples = 50000) {
        console.log(`🎨 ${numSamples}개 초고품질 데이터 생성 중...`);
        const xs = [];
        const ys = [];
        
        for (let i = 0; i < numSamples; i++) {
            const digit = Math.floor(Math.random() * 10);
            
            // 5가지 다양한 스타일로 생성
            const styleVariant = Math.floor(Math.random() * 5);
            const image = this.createUltraRealisticDigit(digit, styleVariant);
            
            xs.push(...image);
            
            const label = new Array(10).fill(0);
            label[digit] = 1;
            ys.push(...label);
            
            if (i % 5000 === 0) console.log(`  ${i}/${numSamples} 완료`);
        }
        
        console.log('✅ 데이터 생성 완료!');
        return {
            xs: tf.tensor4d(xs, [numSamples, 28, 28, 1]),
            ys: tf.tensor2d(ys, [numSamples, 10])
        };
    }
    
    createUltraRealisticDigit(digit, style) {
        const img = new Array(784).fill(0);
        const thick = 1.2 + Math.random() * 2.0; // 1.2~3.2
        const slant = (Math.random() - 0.5) * 0.25;
        const rotation = (Math.random() - 0.5) * 0.15;
        
        switch(digit) {
            case 0:
                switch(style) {
                    case 0: // 정원
                        this.drawCircle(img, 14, 14, 7, thick);
                        break;
                    case 1: // 타원 세로
                        this.drawEllipse(img, 14, 14, 5.5, 8, thick);
                        break;
                    case 2: // 타원 가로
                        this.drawEllipse(img, 14, 14, 7, 6.5, thick);
                        break;
                    case 3: // 각진 0
                        this.drawLine(img, 10, 7, 18, 7, thick);
                        this.drawLine(img, 18, 7, 18, 21, thick);
                        this.drawLine(img, 18, 21, 10, 21, thick);
                        this.drawLine(img, 10, 21, 10, 7, thick);
                        break;
                    default: // 이중 원
                        this.drawCircle(img, 14, 14, 7, thick);
                        this.drawCircle(img, 14, 14, 5.5, thick * 0.7);
                }
                break;
                
            case 1:
                const x1 = 14 + slant * 6;
                switch(style) {
                    case 0: // 단순 세로선
                        this.drawLine(img, x1, 5, x1, 23, thick);
                        break;
                    case 1: // 상단 꺾기
                        this.drawLine(img, x1 - 3, 8, x1, 5, thick);
                        this.drawLine(img, x1, 5, x1, 23, thick);
                        break;
                    case 2: // 하단 밑줄
                        this.drawLine(img, x1, 5, x1, 23, thick);
                        this.drawLine(img, x1 - 4, 23, x1 + 4, 23, thick);
                        break;
                    case 3: // 상단 + 하단
                        this.drawLine(img, x1 - 2, 8, x1, 5, thick);
                        this.drawLine(img, x1, 5, x1, 23, thick);
                        this.drawLine(img, x1 - 3, 23, x1 + 3, 23, thick);
                        break;
                    default: // 굵은 세로
                        this.drawLine(img, x1 - 0.5, 5, x1 - 0.5, 23, thick);
                        this.drawLine(img, x1 + 0.5, 5, x1 + 0.5, 23, thick);
                }
                break;
                
            case 2:
                switch(style) {
                    case 0: // 곡선 상단
                        this.drawArc(img, 14, 10, 6, 0, Math.PI, thick);
                        this.drawLine(img, 20, 10, 8, 22, thick);
                        this.drawLine(img, 8, 22, 20, 22, thick);
                        break;
                    case 1: // 완전 각진
                        this.drawLine(img, 8, 8, 20, 8, thick);
                        this.drawLine(img, 20, 8, 20, 15, thick);
                        this.drawLine(img, 20, 15, 8, 22, thick);
                        this.drawLine(img, 8, 22, 20, 22, thick);
                        break;
                    case 2: // 중간 곡선
                        this.drawLine(img, 8, 9, 18, 9, thick);
                        this.drawArc(img, 18, 12, 3, -Math.PI/2, Math.PI/2, thick);
                        this.drawLine(img, 18, 15, 8, 22, thick);
                        this.drawLine(img, 8, 22, 20, 22, thick);
                        break;
                    case 3: // S자 곡선
                        this.drawArc(img, 13, 10, 5, 0, Math.PI, thick);
                        this.drawArc(img, 15, 18, 5, Math.PI, 2 * Math.PI, thick);
                        break;
                    default:
                        this.drawArc(img, 14, 9, 5.5, 0, Math.PI, thick);
                        this.drawLine(img, 19.5, 9, 8.5, 21, thick);
                        this.drawLine(img, 8.5, 21, 19.5, 21, thick);
                }
                break;
                
            case 3:
                switch(style) {
                    case 0: // 이중 곡선
                        this.drawArc(img, 14, 9, 6, -Math.PI/2, Math.PI/2, thick);
                        this.drawArc(img, 14, 19, 6, -Math.PI/2, Math.PI/2, thick);
                        break;
                    case 1: // 완전 각진
                        this.drawLine(img, 8, 7, 20, 7, thick);
                        this.drawLine(img, 20, 7, 20, 14, thick);
                        this.drawLine(img, 11, 14, 20, 14, thick);
                        this.drawLine(img, 20, 14, 20, 21, thick);
                        this.drawLine(img, 8, 21, 20, 21, thick);
                        break;
                    case 2: // 반곡선
                        this.drawLine(img, 8, 8, 19, 8, thick);
                        this.drawLine(img, 19, 8, 19, 14, thick);
                        this.drawLine(img, 12, 14, 19, 14, thick);
                        this.drawArc(img, 14, 18, 5, -Math.PI/2, Math.PI/2, thick);
                        break;
                    case 3: // 위아래 평행
                        this.drawArc(img, 13, 9, 5, -Math.PI/2, Math.PI/2, thick);
                        this.drawLine(img, 13, 14, 18, 14, thick * 0.9);
                        this.drawArc(img, 13, 19, 5, -Math.PI/2, Math.PI/2, thick);
                        break;
                    default:
                        this.drawArc(img, 14, 10, 5.5, -Math.PI/2, Math.PI/2, thick);
                        this.drawLine(img, 12, 14, 19.5, 14, thick);
                        this.drawArc(img, 14, 18, 5.5, -Math.PI/2, Math.PI/2, thick);
                }
                break;
                
            case 4:
                const x4 = 18 + slant * 4;
                switch(style) {
                    case 0: // 표준
                        this.drawLine(img, 10, 5, 8, 17, thick);
                        this.drawLine(img, 8, 17, 22, 17, thick);
                        this.drawLine(img, x4, 9, x4, 23, thick);
                        break;
                    case 1: // 각진
                        this.drawLine(img, 10, 7, 10, 17, thick);
                        this.drawLine(img, 10, 17, 21, 17, thick);
                        this.drawLine(img, x4, 5, x4, 23, thick);
                        break;
                    case 2: // 대각선 강조
                        this.drawLine(img, 12, 6, 7, 18, thick * 1.2);
                        this.drawLine(img, 7, 18, 22, 18, thick);
                        this.drawLine(img, x4, 8, x4, 23, thick);
                        break;
                    case 3: // 이중 가로선
                        this.drawLine(img, 10, 6, 9, 17, thick);
                        this.drawLine(img, 9, 16, 21, 16, thick);
                        this.drawLine(img, 9, 18, 21, 18, thick);
                        this.drawLine(img, x4, 8, x4, 23, thick);
                        break;
                    default:
                        this.drawLine(img, 11, 6, 8, 16, thick);
                        this.drawLine(img, 8, 16, 20, 16, thick);
                        this.drawLine(img, x4, 10, x4, 22, thick);
                }
                break;
                
            case 5:
                switch(style) {
                    case 0: // 곡선 하단
                        this.drawLine(img, 8, 6, 20, 6, thick);
                        this.drawLine(img, 8, 6, 8, 14, thick);
                        this.drawArc(img, 14, 18, 6, -Math.PI/2, Math.PI/2, thick);
                        break;
                    case 1: // 완전 각진
                        this.drawLine(img, 8, 6, 20, 6, thick);
                        this.drawLine(img, 8, 6, 8, 15, thick);
                        this.drawLine(img, 8, 15, 20, 15, thick);
                        this.drawLine(img, 20, 15, 20, 22, thick);
                        this.drawLine(img, 8, 22, 20, 22, thick);
                        break;
                    case 2: // S형
                        this.drawLine(img, 8, 7, 19, 7, thick);
                        this.drawLine(img, 8, 7, 8, 13, thick);
                        this.drawArc(img, 13, 17, 6, Math.PI, Math.PI * 2, thick);
                        this.drawLine(img, 19, 17, 19, 21, thick);
                        break;
                    case 3: // 중간 강조
                        this.drawLine(img, 9, 7, 20, 7, thick);
                        this.drawLine(img, 9, 7, 9, 14, thick);
                        this.drawLine(img, 9, 14, 20, 14, thick * 1.2);
                        this.drawLine(img, 20, 14, 20, 21, thick);
                        this.drawLine(img, 9, 21, 20, 21, thick);
                        break;
                    default:
                        this.drawLine(img, 9, 7, 19, 7, thick);
                        this.drawLine(img, 9, 7, 9, 14, thick);
                        this.drawLine(img, 9, 14, 19, 14, thick);
                        this.drawArc(img, 14, 18, 5, -Math.PI/2, Math.PI/2, thick);
                }
                break;
                
            case 6:
                switch(style) {
                    case 0: // 원 + 선
                        this.drawCircle(img, 14, 17, 6, thick);
                        this.drawLine(img, 9, 9, 9, 17, thick);
                        this.drawArc(img, 14, 9, 5, Math.PI/2, Math.PI, thick);
                        break;
                    case 1: // 나선형
                        this.drawArc(img, 14, 10, 6, Math.PI/2, Math.PI * 2.3, thick);
                        this.drawCircle(img, 14, 17, 5.5, thick);
                        break;
                    case 2: // 각진
                        this.drawCircle(img, 14, 17, 6, thick);
                        this.drawLine(img, 8, 8, 8, 17, thick);
                        this.drawLine(img, 8, 8, 16, 8, thick);
                        break;
                    case 3: // 이중 원
                        this.drawCircle(img, 14, 17, 6, thick);
                        this.drawCircle(img, 14, 17, 4.5, thick * 0.7);
                        this.drawLine(img, 10, 9, 10, 17, thick);
                        break;
                    default:
                        this.drawCircle(img, 14, 18, 6, thick);
                        this.drawLine(img, 9, 8, 9, 18, thick);
                        this.drawLine(img, 9, 8, 15, 8, thick);
                }
                break;
                
            case 7:
                const slant7 = 12 - slant * 6;
                switch(style) {
                    case 0: // 표준
                        this.drawLine(img, 7, 6, 21, 6, thick);
                        this.drawLine(img, 21, 6, slant7, 22, thick);
                        break;
                    case 1: // 중간선
                        this.drawLine(img, 7, 6, 21, 6, thick);
                        this.drawLine(img, 21, 6, slant7, 22, thick);
                        this.drawLine(img, 9, 13, 18, 13, thick * 0.8);
                        break;
                    case 2: // 꺾인
                        this.drawLine(img, 7, 7, 21, 7, thick);
                        this.drawLine(img, 21, 7, 21, 13, thick);
                        this.drawLine(img, 21, 13, 11, 22, thick);
                        break;
                    case 3: // 유럽식
                        this.drawLine(img, 7, 7, 21, 7, thick);
                        this.drawLine(img, 21, 7, 14, 22, thick);
                        this.drawLine(img, 8, 14, 17, 14, thick * 0.7);
                        break;
                    default:
                        this.drawLine(img, 8, 7, 20, 7, thick);
                        this.drawLine(img, 20, 7, 13, 21, thick);
                }
                break;
                
            case 8:
                switch(style) {
                    case 0: // 위아래 원
                        this.drawCircle(img, 14, 9, 5, thick);
                        this.drawCircle(img, 14, 19, 6, thick);
                        break;
                    case 1: // 눈사람
                        this.drawCircle(img, 14, 9, 4.5, thick);
                        this.drawCircle(img, 14, 19, 6.5, thick);
                        break;
                    case 2: // 같은 크기
                        this.drawCircle(img, 14, 10, 5.5, thick);
                        this.drawCircle(img, 14, 18, 5.5, thick);
                        break;
                    case 3: // 각진 8
                        this.drawLine(img, 9, 6, 19, 6, thick);
                        this.drawLine(img, 19, 6, 19, 13, thick);
                        this.drawLine(img, 19, 13, 9, 13, thick);
                        this.drawLine(img, 9, 13, 9, 6, thick);
                        this.drawLine(img, 9, 13, 19, 13, thick);
                        this.drawLine(img, 19, 13, 19, 22, thick);
                        this.drawLine(img, 19, 22, 9, 22, thick);
                        this.drawLine(img, 9, 22, 9, 13, thick);
                        break;
                    default:
                        this.drawCircle(img, 14, 10, 5, thick);
                        this.drawCircle(img, 14, 10, 3.5, thick * 0.6);
                        this.drawCircle(img, 14, 18, 6, thick);
                        this.drawCircle(img, 14, 18, 4.5, thick * 0.6);
                }
                break;
                
            case 9:
                switch(style) {
                    case 0: // 원 + 직선
                        this.drawCircle(img, 14, 10, 6, thick);
                        this.drawLine(img, 20, 10, 20, 21, thick);
                        this.drawLine(img, 13, 21, 20, 21, thick);
                        break;
                    case 1: // 원 + 긴 선
                        this.drawCircle(img, 14, 11, 6, thick);
                        this.drawLine(img, 20, 11, 20, 22, thick);
                        break;
                    case 2: // 나선
                        this.drawCircle(img, 14, 11, 6, thick);
                        this.drawArc(img, 14, 18, 6, -Math.PI/2, Math.PI/3, thick);
                        break;
                    case 3: // 이중 원
                        this.drawCircle(img, 14, 11, 6, thick);
                        this.drawCircle(img, 14, 11, 4.5, thick * 0.7);
                        this.drawLine(img, 19, 11, 19, 21, thick);
                        break;
                    default:
                        this.drawCircle(img, 14, 12, 6, thick);
                        this.drawLine(img, 19, 12, 19, 21, thick);
                        this.drawLine(img, 14, 21, 19, 21, thick);
                }
                break;
        }
        
        // 매우 현실적인 노이즈
        for (let i = 0; i < 784; i++) {
            if (img[i] > 0) {
                // 잉크 번짐
                img[i] = Math.min(1, img[i] * (0.88 + Math.random() * 0.12));
            } else if (Math.random() < 0.002) {
                // 종이 질감
                img[i] = Math.random() * 0.06;
            }
        }
        
        return this.applyAdvancedTransform(img, slant, rotation);
    }
    
    drawLine(img, x1, y1, x2, y2, w) {
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const steps = Math.ceil(dist * 3);
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            this.dot(img, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, w);
        }
    }
    
    drawCircle(img, cx, cy, r, w) {
        const steps = Math.ceil(r * 2 * Math.PI * 1.5);
        for (let i = 0; i < steps; i++) {
            const a = (i / steps) * 2 * Math.PI;
            this.dot(img, cx + r * Math.cos(a), cy + r * Math.sin(a), w);
        }
    }
    
    drawEllipse(img, cx, cy, rx, ry, w) {
        const steps = Math.ceil((rx + ry) * Math.PI * 1.5);
        for (let i = 0; i < steps; i++) {
            const a = (i / steps) * 2 * Math.PI;
            this.dot(img, cx + rx * Math.cos(a), cy + ry * Math.sin(a), w);
        }
    }
    
    drawArc(img, cx, cy, r, start, end, w) {
        const steps = Math.ceil(r * Math.abs(end - start) * 1.5);
        for (let i = 0; i <= steps; i++) {
            const a = start + (end - start) * (i / steps);
            this.dot(img, cx + r * Math.cos(a), cy + r * Math.sin(a), w);
        }
    }
    
    dot(img, x, y, r) {
        for (let dy = -r - 0.5; dy <= r + 0.5; dy++) {
            for (let dx = -r - 0.5; dx <= r + 0.5; dx++) {
                const d = Math.hypot(dx, dy);
                if (d <= r + 0.5) {
                    const px = Math.round(x + dx);
                    const py = Math.round(y + dy);
                    if (px >= 0 && px < 28 && py >= 0 && py < 28) {
                        const intensity = Math.max(0, 1 - d / (r + 0.5) * 0.25);
                        img[py * 28 + px] = Math.max(img[py * 28 + px], intensity);
                    }
                }
            }
        }
    }
    
    applyAdvancedTransform(img, slant, rotation) {
        const out = new Array(784).fill(0);
        const sx = Math.floor(Math.random() * 9) - 4; // -4 ~ +4
        const sy = Math.floor(Math.random() * 9) - 4;
        const scale = 0.80 + Math.random() * 0.40; // 0.8 ~ 1.2
        
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        
        for (let y = 0; y < 28; y++) {
            for (let x = 0; x < 28; x++) {
                let tx = (x - 14) / scale;
                let ty = (y - 14) / scale;
                
                // 회전
                const rx = tx * cos - ty * sin;
                const ry = tx * sin + ty * cos;
                
                // 기울기
                tx = rx - ry * slant + 14 + sx;
                ty = ry + 14 + sy;
                
                const ix = Math.round(tx);
                const iy = Math.round(ty);
                
                if (ix >= 0 && ix < 28 && iy >= 0 && iy < 28) {
                    out[y * 28 + x] = img[iy * 28 + ix];
                }
            }
        }
        return out;
    }
}

class CNNVisualizer {
    constructor() {
        this.model = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        this.drawCanvas = document.getElementById('drawCanvas');
        this.drawCtx = this.drawCanvas.getContext('2d');
        this.drawCtx.fillStyle = 'white';
        this.drawCtx.fillRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        this.drawCtx.strokeStyle = 'black';
        this.drawCtx.lineWidth = 20;
        this.drawCtx.lineCap = 'round';
        this.drawCtx.lineJoin = 'round';
        
        this.setupEventListeners();
        this.loadModel();
    }
    
    setupEventListeners() {
        this.drawCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.drawCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.drawCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.drawCanvas.addEventListener('mouseout', () => this.stopDrawing());
        
        this.drawCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.drawCanvas.dispatchEvent(new MouseEvent('mousedown', {
                clientX: touch.clientX, clientY: touch.clientY
            }));
        });
        
        this.drawCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.drawCanvas.dispatchEvent(new MouseEvent('mousemove', {
                clientX: touch.clientX, clientY: touch.clientY
            }));
        });
        
        this.drawCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.drawCanvas.dispatchEvent(new MouseEvent('mouseup'));
        });
        
        document.getElementById('predictBtn').addEventListener('click', () => this.predict());
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.predict();
            } else if (e.key === 'c' || e.key === 'C') {
                this.clear();
            }
        });
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.drawCanvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        const rect = this.drawCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.drawCtx.beginPath();
        this.drawCtx.moveTo(this.lastX, this.lastY);
        this.drawCtx.lineTo(x, y);
        this.drawCtx.stroke();
        this.lastX = x;
        this.lastY = y;
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    clear() {
        this.drawCtx.fillStyle = 'white';
        this.drawCtx.fillRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        document.querySelector('.predicted-digit').textContent = '?';
        document.querySelector('.confidence').textContent = '확신도: --';
        document.getElementById('probabilityBars').innerHTML = '';
        document.getElementById('conv1Features').innerHTML = '';
        document.getElementById('conv2Features').innerHTML = '';
        document.getElementById('conv3Features').innerHTML = '';
        const inputCanvas = document.getElementById('inputImage');
        const ctx = inputCanvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, inputCanvas.width, inputCanvas.height);
    }
    
    async loadModel() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = loadingOverlay.querySelector('p');
        const loadingDetail = loadingOverlay.querySelector('.loading-detail');
        
        try {
            loadingText.textContent = '초고정확도 모델 확인 중...';
            const saved = await this.tryLoad();
            
            if (!saved) {
                this.model = this.createUltraModel();
                loadingText.textContent = '초대용량 데이터 생성 중...';
                loadingDetail.textContent = '50,000개 초고품질 패턴 (5분)';
                await this.ultraTrain(loadingText, loadingDetail);
            }
            
            console.log('✅ 초고정확도 모델 준비 완료!');
            loadingOverlay.classList.add('hidden');
        } catch (e) {
            console.error(e);
            if (!this.model) this.model = this.createUltraModel();
            setTimeout(() => loadingOverlay.classList.add('hidden'), 2000);
        }
    }
    
    async tryLoad() {
        try {
            this.model = await tf.loadLayersModel('indexeddb://mnist-ultimate-v1');
            console.log('✅ 초고정확도 모델 로드!');
            return true;
        } catch {
            return false;
        }
    }
    
    createUltraModel() {
        const m = tf.sequential();
        
        // 더 깊고 강력한 아키텍처
        m.add(tf.layers.conv2d({inputShape: [28,28,1], filters: 32, kernelSize: 3, activation: 'relu', padding: 'same', name: 'conv1'}));
        m.add(tf.layers.batchNormalization());
        m.add(tf.layers.conv2d({filters: 32, kernelSize: 3, activation: 'relu', padding: 'same'}));
        m.add(tf.layers.maxPooling2d({poolSize: 2}));
        m.add(tf.layers.dropout({rate: 0.25}));
        
        m.add(tf.layers.conv2d({filters: 64, kernelSize: 3, activation: 'relu', padding: 'same', name: 'conv2'}));
        m.add(tf.layers.batchNormalization());
        m.add(tf.layers.conv2d({filters: 64, kernelSize: 3, activation: 'relu', padding: 'same'}));
        m.add(tf.layers.maxPooling2d({poolSize: 2}));
        m.add(tf.layers.dropout({rate: 0.25}));
        
        m.add(tf.layers.conv2d({filters: 128, kernelSize: 3, activation: 'relu', padding: 'same', name: 'conv3'}));
        m.add(tf.layers.batchNormalization());
        m.add(tf.layers.maxPooling2d({poolSize: 2}));
        m.add(tf.layers.dropout({rate: 0.25}));
        
        m.add(tf.layers.flatten());
        m.add(tf.layers.dense({units: 256, activation: 'relu'}));
        m.add(tf.layers.batchNormalization());
        m.add(tf.layers.dropout({rate: 0.5}));
        m.add(tf.layers.dense({units: 128, activation: 'relu'}));
        m.add(tf.layers.dropout({rate: 0.5}));
        m.add(tf.layers.dense({units: 10, activation: 'softmax'}));
        
        m.compile({
            optimizer: tf.train.adam(0.0003),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        return m;
    }
    
    async ultraTrain(loadingText, loadingDetail) {
        const trainer = new UltraMNISTTrainer();
        const data = trainer.generateSyntheticData(50000);
        
        loadingText.textContent = '초고정확도 학습 중...';
        loadingDetail.textContent = '2-5분 소요 (100 epochs, 최고 품질)';
        
        console.log('🚀 100 epoch 학습 시작...');
        
        await this.model.fit(data.xs, data.ys, {
            epochs: 100,
            batchSize: 512,
            validationSplit: 0.15,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    const p = ((epoch + 1) / 100 * 100).toFixed(0);
                    const a = (logs.acc * 100).toFixed(2);
                    const v = (logs.val_acc * 100).toFixed(2);
                    loadingDetail.textContent = `진행: ${p}% | 학습: ${a}% | 검증: ${v}%`;
                    
                    if ((epoch + 1) % 10 === 0) {
                        console.log(`Epoch ${epoch + 1}/100: acc=${a}%, val_acc=${v}%`);
                    }
                }
            }
        });
        
        data.xs.dispose();
        data.ys.dispose();
        
        console.log('💾 모델 저장 중...');
        try {
            await this.model.save('indexeddb://mnist-ultimate-v1');
            console.log('✅ 초고정확도 모델 저장 완료!');
        } catch {
            console.log('⚠️ 저장 실패 (시크릿 모드)');
        }
    }
    
    preprocessCanvas() {
        const s = document.createElement('canvas');
        s.width = s.height = 28;
        const sc = s.getContext('2d');
        sc.fillStyle = 'white';
        sc.fillRect(0, 0, 28, 28);
        sc.drawImage(this.drawCanvas, 0, 0, 28, 28);
        
        const ic = document.getElementById('inputImage').getContext('2d');
        ic.imageSmoothingEnabled = false;
        ic.drawImage(s, 0, 0, 140, 140);
        
        const d = sc.getImageData(0, 0, 28, 28).data;
        const inp = [];
        for (let i = 0; i < d.length; i += 4) {
            inp.push((255 - (d[i] + d[i + 1] + d[i + 2]) / 3) / 255);
        }
        return tf.tensor4d(inp, [1, 28, 28, 1]);
    }
    
    async predict() {
        if (!this.model) return alert('모델 준비 중');
        
        try {
            const inp = this.preprocessCanvas();
            const out = await this.getOutputs(inp);
            const pred = this.model.predict(inp);
            const probs = await pred.data();
            
            this.displayPred(probs);
            this.visualize(out);
            this.displayProbs(probs);
            
            inp.dispose();
            pred.dispose();
        } catch (e) {
            console.error(e);
        }
    }
    
    async getOutputs(inp) {
        const o = {};
        try {
            o.conv1 = tf.model({inputs: this.model.inputs, outputs: this.model.getLayer('conv1').output}).predict(inp);
            o.conv2 = tf.model({inputs: this.model.inputs, outputs: this.model.getLayer('conv2').output}).predict(inp);
            o.conv3 = tf.model({inputs: this.model.inputs, outputs: this.model.getLayer('conv3').output}).predict(inp);
        } catch {}
        return o;
    }
    
    displayPred(probs) {
        const digit = probs.indexOf(Math.max(...probs));
        const conf = (Math.max(...probs) * 100).toFixed(2);
        document.querySelector('.predicted-digit').textContent = digit;
        document.querySelector('.confidence').textContent = `확신도: ${conf}%`;
        const pc = document.querySelector('.prediction-container');
        pc.classList.add('predicting');
        setTimeout(() => pc.classList.remove('predicting'), 1500);
    }
    
    displayProbs(probs) {
        const c = document.getElementById('probabilityBars');
        c.innerHTML = '';
        const max = Math.max(...probs);
        
        for (let i = 0; i < 10; i++) {
            const p = probs[i];
            const pct = (p * 100).toFixed(2);
            
            const bc = document.createElement('div');
            bc.className = 'prob-bar-container';
            
            const l = document.createElement('div');
            l.className = 'prob-label';
            l.textContent = i;
            
            const bw = document.createElement('div');
            bw.className = 'prob-bar-wrapper';
            
            const b = document.createElement('div');
            b.className = 'prob-bar';
            if (p === max) b.classList.add('max-prob');
            b.style.width = '0%';
            
            const v = document.createElement('span');
            v.className = 'prob-value';
            v.textContent = `${pct}%`;
            
            b.appendChild(v);
            bw.appendChild(b);
            bc.appendChild(l);
            bc.appendChild(bw);
            c.appendChild(bc);
            
            setTimeout(() => b.style.width = `${p * 100}%`, 50 + i * 50);
        }
    }
    
    async visualize(out) {
        if (out.conv1) await this.visLayer(out.conv1, 'conv1Features', 70);
        if (out.conv2) await this.visLayer(out.conv2, 'conv2Features', 35);
        if (out.conv3) await this.visLayer(out.conv3, 'conv3Features', 17);
    }
    
    async visLayer(tensor, id, size) {
        const c = document.getElementById(id);
        c.innerHTML = '';
        const d = await tensor.array();
        const b = d[0];
        const h = b.length, w = b[0].length, ch = b[0][0].length;
        const maxCh = Math.min(16, ch);
        
        for (let i = 0; i < maxCh; i++) {
            const cv = document.createElement('canvas');
            cv.className = 'feature-map';
            cv.width = cv.height = size;
            const ctx = cv.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            
            const tmp = document.createElement('canvas');
            tmp.width = w;
            tmp.height = h;
            const tc = tmp.getContext('2d');
            const img = tc.createImageData(w, h);
            const px = img.data;
            
            let min = Infinity, max = -Infinity;
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const v = b[y][x][i];
                    if (v < min) min = v;
                    if (v > max) max = v;
                }
            }
            const rng = max - min || 1;
            
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const v = b[y][x][i];
                    const n = (v - min) / rng;
                    const it = Math.floor(n * 255);
                    const idx = (y * w + x) * 4;
                    px[idx] = 255 - it;
                    px[idx + 1] = 255 - it * 0.5;
                    px[idx + 2] = 255;
                    px[idx + 3] = 255;
                }
            }
            
            tc.putImageData(img, 0, 0);
            ctx.drawImage(tmp, 0, 0, size, size);
            c.appendChild(cv);
            await new Promise(r => setTimeout(r, 30));
        }
        tensor.dispose();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CNNVisualizer();
    console.log('%c🏆 초고정확도 CNN (50K 샘플 + 100 epochs)', 'font-size: 20px; color: #667eea; font-weight: bold');
    console.log('%c⚡ 최대 성능 모드 - 검증 정확도 목표: 95%+', 'font-size: 14px; color: #ffd43b');
    console.log('TensorFlow.js:', tf.version.tfjs);
});
