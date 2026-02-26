// 최고 정확도 CNN - 20K 샘플 + 50 Epochs + 현실적 패턴
class AdvancedMNISTTrainer {
    generateSyntheticData(numSamples = 20000) {
        console.log(`🎨 ${numSamples}개 고품질 데이터 생성 중...`);
        const xs = [];
        const ys = [];
        
        for (let i = 0; i < numSamples; i++) {
            const digit = Math.floor(Math.random() * 10);
            const image = this.createRealisticDigit(digit);
            xs.push(...image);
            
            const label = new Array(10).fill(0);
            label[digit] = 1;
            ys.push(...label);
            
            if (i % 2000 === 0) console.log(`  ${i}/${numSamples} 완료`);
        }
        
        return {
            xs: tf.tensor4d(xs, [numSamples, 28, 28, 1]),
            ys: tf.tensor2d(ys, [numSamples, 10])
        };
    }
    
    createRealisticDigit(digit) {
        const img = new Array(784).fill(0);
        const style = Math.random();
        const thick = 1.5 + Math.random() * 1.5;
        const slant = (Math.random() - 0.5) * 0.2;
        
        switch(digit) {
            case 0:
                if (style < 0.5) {
                    this.drawEllipse(img, 14, 14, 6, 8, thick);
                } else {
                    this.drawCircle(img, 14, 14, 6.5, thick);
                }
                break;
            case 1:
                this.drawLine(img, 14, 6, 14, 22, thick);
                if (style < 0.3) this.drawLine(img, 12, 8, 14, 6, thick);
                if (style > 0.7) this.drawLine(img, 11, 22, 17, 22, thick * 0.8);
                break;
            case 2:
                this.drawArc(img, 14, 10, 5, 0, Math.PI, thick);
                this.drawLine(img, 19, 10, 9, 21, thick);
                this.drawLine(img, 9, 21, 19, 21, thick);
                break;
            case 3:
                this.drawArc(img, 14, 10, 5, -Math.PI/2, Math.PI/2, thick);
                this.drawArc(img, 14, 18, 5, -Math.PI/2, Math.PI/2, thick);
                break;
            case 4:
                this.drawLine(img, 10, 6, 8, 17, thick);
                this.drawLine(img, 8, 17, 20, 17, thick);
                this.drawLine(img, 18, 10, 18, 22, thick);
                break;
            case 5:
                this.drawLine(img, 9, 7, 19, 7, thick);
                this.drawLine(img, 9, 7, 9, 14, thick);
                this.drawArc(img, 14, 17, 5, -Math.PI/2, Math.PI/2, thick);
                break;
            case 6:
                this.drawCircle(img, 14, 17, 5, thick);
                this.drawLine(img, 10, 9, 10, 17, thick);
                this.drawArc(img, 14, 9, 4, Math.PI/2, Math.PI, thick * 0.8);
                break;
            case 7:
                this.drawLine(img, 8, 7, 20, 7, thick);
                this.drawLine(img, 20, 7, 13, 21, thick);
                if (style > 0.6) this.drawLine(img, 10, 13, 17, 13, thick * 0.7);
                break;
            case 8:
                this.drawCircle(img, 14, 10, 4.5, thick);
                this.drawCircle(img, 14, 18, 5, thick);
                break;
            case 9:
                this.drawCircle(img, 14, 11, 5, thick);
                this.drawLine(img, 19, 11, 19, 21, thick);
                if (style > 0.5) this.drawLine(img, 14, 21, 19, 21, thick * 0.8);
                break;
        }
        
        // 노이즈
        for (let i = 0; i < 784; i++) {
            if (img[i] > 0) {
                img[i] = Math.min(1, img[i] * (0.85 + Math.random() * 0.15));
            } else if (Math.random() < 0.003) {
                img[i] = Math.random() * 0.08;
            }
        }
        
        return this.transform(img, slant);
    }
    
    drawLine(img, x1, y1, x2, y2, w) {
        const dist = Math.hypot(x2 - x1, y2 - y1);
        for (let i = 0; i <= dist * 2; i++) {
            const t = i / (dist * 2);
            this.dot(img, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, w);
        }
    }
    
    drawCircle(img, cx, cy, r, w) {
        const steps = Math.ceil(r * 2 * Math.PI);
        for (let i = 0; i < steps; i++) {
            const a = (i / steps) * 2 * Math.PI;
            this.dot(img, cx + r * Math.cos(a), cy + r * Math.sin(a), w);
        }
    }
    
    drawEllipse(img, cx, cy, rx, ry, w) {
        const steps = Math.ceil((rx + ry) * Math.PI);
        for (let i = 0; i < steps; i++) {
            const a = (i / steps) * 2 * Math.PI;
            this.dot(img, cx + rx * Math.cos(a), cy + ry * Math.sin(a), w);
        }
    }
    
    drawArc(img, cx, cy, r, start, end, w) {
        const steps = Math.ceil(r * Math.abs(end - start));
        for (let i = 0; i <= steps; i++) {
            const a = start + (end - start) * (i / steps);
            this.dot(img, cx + r * Math.cos(a), cy + r * Math.sin(a), w);
        }
    }
    
    dot(img, x, y, r) {
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const d = Math.hypot(dx, dy);
                if (d <= r) {
                    const px = Math.round(x + dx);
                    const py = Math.round(y + dy);
                    if (px >= 0 && px < 28 && py >= 0 && py < 28) {
                        img[py * 28 + px] = Math.max(img[py * 28 + px], 1 - d / r * 0.3);
                    }
                }
            }
        }
    }
    
    transform(img, slant) {
        const out = new Array(784).fill(0);
        const sx = Math.floor(Math.random() * 7) - 3;
        const sy = Math.floor(Math.random() * 7) - 3;
        const scale = 0.85 + Math.random() * 0.3;
        
        for (let y = 0; y < 28; y++) {
            for (let x = 0; x < 28; x++) {
                let tx = (x - 14) / scale - (y - 14) * slant + 14 + sx;
                let ty = (y - 14) / scale + 14 + sy;
                tx = Math.round(tx);
                ty = Math.round(ty);
                if (tx >= 0 && tx < 28 && ty >= 0 && ty < 28) {
                    out[y * 28 + x] = img[ty * 28 + tx];
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
            loadingText.textContent = '고정확도 모델 확인 중...';
            const saved = await this.tryLoad();
            
            if (!saved) {
                this.model = this.createModel();
                loadingText.textContent = '고품질 데이터 생성 중...';
                loadingDetail.textContent = '20,000개 현실적인 숫자 패턴';
                await this.train(loadingText, loadingDetail);
            }
            
            console.log('✅ 준비 완료!');
            loadingOverlay.classList.add('hidden');
        } catch (e) {
            console.error(e);
            if (!this.model) this.model = this.createModel();
            setTimeout(() => loadingOverlay.classList.add('hidden'), 2000);
        }
    }
    
    async tryLoad() {
        try {
            this.model = await tf.loadLayersModel('indexeddb://mnist-ultra-v1');
            console.log('✅ 저장된 모델 로드!');
            return true;
        } catch {
            return false;
        }
    }
    
    createModel() {
        const m = tf.sequential();
        m.add(tf.layers.conv2d({inputShape: [28,28,1], filters: 16, kernelSize: 3, activation: 'relu', padding: 'same', name: 'conv1'}));
        m.add(tf.layers.maxPooling2d({poolSize: 2}));
        m.add(tf.layers.dropout({rate: 0.2}));
        m.add(tf.layers.conv2d({filters: 32, kernelSize: 3, activation: 'relu', padding: 'same', name: 'conv2'}));
        m.add(tf.layers.maxPooling2d({poolSize: 2}));
        m.add(tf.layers.dropout({rate: 0.2}));
        m.add(tf.layers.conv2d({filters: 32, kernelSize: 3, activation: 'relu', padding: 'same', name: 'conv3'}));
        m.add(tf.layers.maxPooling2d({poolSize: 2}));
        m.add(tf.layers.dropout({rate: 0.2}));
        m.add(tf.layers.flatten());
        m.add(tf.layers.dense({units: 128, activation: 'relu'}));
        m.add(tf.layers.dropout({rate: 0.4}));
        m.add(tf.layers.dense({units: 64, activation: 'relu'}));
        m.add(tf.layers.dropout({rate: 0.3}));
        m.add(tf.layers.dense({units: 10, activation: 'softmax'}));
        m.compile({optimizer: tf.train.adam(0.0005), loss: 'categoricalCrossentropy', metrics: ['accuracy']});
        return m;
    }
    
    async train(loadingText, loadingDetail) {
        const trainer = new AdvancedMNISTTrainer();
        const data = trainer.generateSyntheticData(20000);
        
        loadingText.textContent = '고정확도 학습 중...';
        loadingDetail.textContent = '60-90초 소요 (최초 1회)';
        
        await this.model.fit(data.xs, data.ys, {
            epochs: 50,
            batchSize: 256,
            validationSplit: 0.15,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    const p = ((epoch + 1) / 50 * 100).toFixed(0);
                    const a = (logs.acc * 100).toFixed(1);
                    const v = (logs.val_acc * 100).toFixed(1);
                    loadingDetail.textContent = `${p}% | 학습: ${a}% | 검증: ${v}%`;
                    console.log(`Epoch ${epoch + 1}/50: acc=${a}%, val_acc=${v}%`);
                }
            }
        });
        
        data.xs.dispose();
        data.ys.dispose();
        
        try {
            await this.model.save('indexeddb://mnist-ultra-v1');
            console.log('✅ 모델 저장!');
        } catch {}
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
        const conf = (Math.max(...probs) * 100).toFixed(1);
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
            const pct = (p * 100).toFixed(1);
            
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
    console.log('%c🚀 고정확도 CNN (20K샘플 + 50epochs)', 'font-size: 18px; color: #667eea; font-weight: bold');
    console.log('TensorFlow.js:', tf.version.tfjs);
});
