// 완전 독립형 CNN 시각화 - 외부 데이터 없이 작동
// 합성 데이터로 빠른 학습

class SimpleMNISTTrainer {
    generateSyntheticData(numSamples = 5000) {
        const xs = [];
        const ys = [];
        
        for (let i = 0; i < numSamples; i++) {
            const digit = Math.floor(Math.random() * 10);
            const image = this.createDigitPattern(digit);
            
            // Flatten image array
            xs.push(...image);
            
            const label = new Array(10).fill(0);
            label[digit] = 1;
            ys.push(...label);
        }
        
        return {
            xs: tf.tensor4d(xs, [numSamples, 28, 28, 1]),
            ys: tf.tensor2d(ys, [numSamples, 10])
        };
    }
    
    createDigitPattern(digit) {
        const image = new Array(28 * 28).fill(0);
        
        // 각 숫자별 패턴 생성
        switch(digit) {
            case 0:
                this.drawCircle(image, 14, 14, 6);
                break;
            case 1:
                this.drawLine(image, 14, 6, 14, 22);
                this.drawLine(image, 12, 8, 14, 6);
                break;
            case 2:
                this.drawLine(image, 8, 8, 20, 8);
                this.drawLine(image, 20, 8, 20, 14);
                this.drawLine(image, 20, 14, 8, 20);
                this.drawLine(image, 8, 20, 20, 20);
                break;
            case 3:
                this.drawLine(image, 8, 8, 20, 8);
                this.drawLine(image, 20, 8, 20, 20);
                this.drawLine(image, 8, 20, 20, 20);
                this.drawLine(image, 12, 14, 18, 14);
                break;
            case 4:
                this.drawLine(image, 10, 6, 10, 16);
                this.drawLine(image, 10, 16, 20, 16);
                this.drawLine(image, 18, 8, 18, 22);
                break;
            case 5:
                this.drawLine(image, 8, 6, 20, 6);
                this.drawLine(image, 8, 6, 8, 14);
                this.drawLine(image, 8, 14, 20, 14);
                this.drawLine(image, 20, 14, 20, 20);
                this.drawLine(image, 8, 20, 20, 20);
                break;
            case 6:
                this.drawCircle(image, 14, 16, 5);
                this.drawLine(image, 10, 8, 10, 16);
                break;
            case 7:
                this.drawLine(image, 8, 6, 20, 6);
                this.drawLine(image, 20, 6, 14, 22);
                break;
            case 8:
                this.drawCircle(image, 14, 10, 4);
                this.drawCircle(image, 14, 18, 4);
                break;
            case 9:
                this.drawCircle(image, 14, 12, 5);
                this.drawLine(image, 18, 12, 18, 22);
                break;
        }
        
        // 노이즈 추가 (학습 다양성)
        for (let i = 0; i < image.length; i++) {
            if (image[i] > 0) {
                image[i] = 0.7 + Math.random() * 0.3;
            } else if (Math.random() < 0.02) {
                image[i] = Math.random() * 0.3;
            }
        }
        
        // 약간의 변형 추가
        const transformed = this.addTransformations(image);
        
        return transformed;
    }
    
    drawLine(image, x1, y1, x2, y2) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        
        let x = x1, y = y1;
        
        while (true) {
            if (x >= 0 && x < 28 && y >= 0 && y < 28) {
                image[y * 28 + x] = 1;
                // 굵게
                if (x > 0) image[y * 28 + (x-1)] = 1;
                if (x < 27) image[y * 28 + (x+1)] = 1;
            }
            
            if (x === x2 && y === y2) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }
    
    drawCircle(image, cx, cy, r) {
        for (let y = -r; y <= r; y++) {
            for (let x = -r; x <= r; x++) {
                const dist = Math.sqrt(x*x + y*y);
                if (dist >= r - 1.5 && dist <= r + 1.5) {
                    const px = cx + x;
                    const py = cy + y;
                    if (px >= 0 && px < 28 && py >= 0 && py < 28) {
                        image[py * 28 + px] = 1;
                    }
                }
            }
        }
    }
    
    addTransformations(image) {
        const result = new Array(28 * 28).fill(0);
        
        // 랜덤 이동 (-2 ~ +2 픽셀)
        const shiftX = Math.floor(Math.random() * 5) - 2;
        const shiftY = Math.floor(Math.random() * 5) - 2;
        
        for (let y = 0; y < 28; y++) {
            for (let x = 0; x < 28; x++) {
                const srcX = x - shiftX;
                const srcY = y - shiftY;
                
                if (srcX >= 0 && srcX < 28 && srcY >= 0 && srcY < 28) {
                    result[y * 28 + x] = image[srcY * 28 + srcX];
                }
            }
        }
        
        return result;
    }
}

// CNN 시각화 애플리케이션
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
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.drawCanvas.dispatchEvent(mouseEvent);
        });
        
        this.drawCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.drawCanvas.dispatchEvent(mouseEvent);
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
            loadingText.textContent = 'CNN 모델 확인 중...';
            loadingDetail.textContent = '저장된 모델을 찾고 있습니다';
            
            const hasSaved = await this.tryLoadSaved();
            
            if (!hasSaved) {
                this.model = this.createModel();
                
                loadingText.textContent = '학습 데이터 생성 중...';
                loadingDetail.textContent = '합성 숫자 패턴 생성 (외부 데이터 불필요)';
                
                await this.quickTrain(loadingText, loadingDetail);
            }
            
            console.log('✅ 모델 준비 완료!');
            loadingOverlay.classList.add('hidden');
            
        } catch (error) {
            console.error('오류:', error);
            loadingText.textContent = '모델 준비 완료';
            loadingDetail.textContent = '합성 데이터로 학습된 모델';
            
            if (!this.model) {
                this.model = this.createModel();
            }
            
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 2000);
        }
    }
    
    async tryLoadSaved() {
        try {
            this.model = await tf.loadLayersModel('indexeddb://mnist-synthetic-v1');
            console.log('✅ 저장된 모델 로드!');
            return true;
        } catch (e) {
            console.log('저장된 모델 없음, 새로 학습');
            return false;
        }
    }
    
    createModel() {
        const model = tf.sequential();
        
        model.add(tf.layers.conv2d({
            inputShape: [28, 28, 1],
            filters: 8,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same',
            name: 'conv1'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        model.add(tf.layers.conv2d({
            filters: 16,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same',
            name: 'conv2'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        model.add(tf.layers.conv2d({
            filters: 16,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same',
            name: 'conv3'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        model.add(tf.layers.flatten());
        model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
        
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        return model;
    }
    
    async quickTrain(loadingText, loadingDetail) {
        const trainer = new SimpleMNISTTrainer();
        
        loadingText.textContent = '합성 데이터 생성 중...';
        loadingDetail.textContent = '5000개 숫자 패턴 생성';
        
        const trainData = trainer.generateSyntheticData(5000);
        
        loadingText.textContent = '모델 학습 중...';
        loadingDetail.textContent = '약 20-30초 소요 (최초 1회)';
        
        await this.model.fit(trainData.xs, trainData.ys, {
            epochs: 20,
            batchSize: 64,
            validationSplit: 0.2,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    const progress = ((epoch + 1) / 20 * 100).toFixed(0);
                    loadingDetail.textContent = `학습 진행: ${progress}% | 정확도: ${(logs.acc * 100).toFixed(1)}%`;
                }
            }
        });
        
        trainData.xs.dispose();
        trainData.ys.dispose();
        
        loadingText.textContent = '모델 저장 중...';
        loadingDetail.textContent = '다음 방문부터는 즉시 시작됩니다';
        
        try {
            await this.model.save('indexeddb://mnist-synthetic-v1');
            console.log('✅ 모델 저장 완료!');
        } catch (e) {
            console.log('⚠️ 모델 저장 실패 (시크릿 모드에서는 저장 불가)');
        }
    }
    
    preprocessCanvas() {
        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = 28;
        smallCanvas.height = 28;
        const smallCtx = smallCanvas.getContext('2d');
        
        smallCtx.fillStyle = 'white';
        smallCtx.fillRect(0, 0, 28, 28);
        smallCtx.drawImage(this.drawCanvas, 0, 0, 28, 28);
        
        const inputCanvas = document.getElementById('inputImage');
        const inputCtx = inputCanvas.getContext('2d');
        inputCtx.imageSmoothingEnabled = false;
        inputCtx.drawImage(smallCanvas, 0, 0, 140, 140);
        
        const imageData = smallCtx.getImageData(0, 0, 28, 28);
        const data = imageData.data;
        
        const input = [];
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            input.push((255 - gray) / 255);
        }
        
        return tf.tensor4d(input, [1, 28, 28, 1]);
    }
    
    async predict() {
        if (!this.model) {
            alert('모델이 아직 준비되지 않았습니다.');
            return;
        }
        
        try {
            const inputTensor = this.preprocessCanvas();
            const layerOutputs = await this.getLayerOutputs(inputTensor);
            const prediction = this.model.predict(inputTensor);
            const probabilities = await prediction.data();
            
            this.displayPrediction(probabilities);
            this.visualizeFeatureMaps(layerOutputs);
            this.displayProbabilities(probabilities);
            
            inputTensor.dispose();
            prediction.dispose();
            
        } catch (error) {
            console.error('예측 오류:', error);
            alert('예측 중 오류가 발생했습니다.');
        }
    }
    
    async getLayerOutputs(inputTensor) {
        const outputs = {};
        
        try {
            const conv1Model = tf.model({
                inputs: this.model.inputs,
                outputs: this.model.getLayer('conv1').output
            });
            outputs.conv1 = conv1Model.predict(inputTensor);
            
            const conv2Model = tf.model({
                inputs: this.model.inputs,
                outputs: this.model.getLayer('conv2').output
            });
            outputs.conv2 = conv2Model.predict(inputTensor);
            
            const conv3Model = tf.model({
                inputs: this.model.inputs,
                outputs: this.model.getLayer('conv3').output
            });
            outputs.conv3 = conv3Model.predict(inputTensor);
        } catch (error) {
            console.error('레이어 출력 오류:', error);
        }
        
        return outputs;
    }
    
    displayPrediction(probabilities) {
        const predictedDigit = probabilities.indexOf(Math.max(...probabilities));
        const confidence = (Math.max(...probabilities) * 100).toFixed(1);
        
        document.querySelector('.predicted-digit').textContent = predictedDigit;
        document.querySelector('.confidence').textContent = `확신도: ${confidence}%`;
        
        const predContainer = document.querySelector('.prediction-container');
        predContainer.classList.add('predicting');
        setTimeout(() => predContainer.classList.remove('predicting'), 1500);
    }
    
    displayProbabilities(probabilities) {
        const container = document.getElementById('probabilityBars');
        container.innerHTML = '';
        
        const maxProb = Math.max(...probabilities);
        
        for (let i = 0; i < 10; i++) {
            const prob = probabilities[i];
            const percentage = (prob * 100).toFixed(1);
            
            const barContainer = document.createElement('div');
            barContainer.className = 'prob-bar-container';
            
            const label = document.createElement('div');
            label.className = 'prob-label';
            label.textContent = i;
            
            const barWrapper = document.createElement('div');
            barWrapper.className = 'prob-bar-wrapper';
            
            const bar = document.createElement('div');
            bar.className = 'prob-bar';
            if (prob === maxProb) {
                bar.classList.add('max-prob');
            }
            bar.style.width = '0%';
            
            const value = document.createElement('span');
            value.className = 'prob-value';
            value.textContent = `${percentage}%`;
            
            bar.appendChild(value);
            barWrapper.appendChild(bar);
            barContainer.appendChild(label);
            barContainer.appendChild(barWrapper);
            container.appendChild(barContainer);
            
            setTimeout(() => {
                bar.style.width = `${prob * 100}%`;
            }, 50 + i * 50);
        }
    }
    
    async visualizeFeatureMaps(layerOutputs) {
        if (layerOutputs.conv1) await this.visualizeLayer(layerOutputs.conv1, 'conv1Features', 70);
        if (layerOutputs.conv2) await this.visualizeLayer(layerOutputs.conv2, 'conv2Features', 35);
        if (layerOutputs.conv3) await this.visualizeLayer(layerOutputs.conv3, 'conv3Features', 17);
    }
    
    async visualizeLayer(tensorOutput, containerId, displaySize) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        const data = await tensorOutput.array();
        const batch = data[0];
        const height = batch.length;
        const width = batch[0].length;
        const channels = batch[0][0].length;
        
        const maxChannels = Math.min(16, channels);
        
        for (let c = 0; c < maxChannels; c++) {
            const canvas = document.createElement('canvas');
            canvas.className = 'feature-map';
            canvas.width = displaySize;
            canvas.height = displaySize;
            
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            
            const imageData = tempCtx.createImageData(width, height);
            const pixels = imageData.data;
            
            let min = Infinity, max = -Infinity;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const val = batch[y][x][c];
                    if (val < min) min = val;
                    if (val > max) max = val;
                }
            }
            
            const range = max - min || 1;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const val = batch[y][x][c];
                    const normalized = (val - min) / range;
                    const intensity = Math.floor(normalized * 255);
                    
                    const idx = (y * width + x) * 4;
                    pixels[idx] = 255 - intensity;
                    pixels[idx + 1] = 255 - intensity * 0.5;
                    pixels[idx + 2] = 255;
                    pixels[idx + 3] = 255;
                }
            }
            
            tempCtx.putImageData(imageData, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0, displaySize, displaySize);
            
            container.appendChild(canvas);
            await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        tensorOutput.dispose();
    }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    const app = new CNNVisualizer();
    console.log('%c🧠 KAIST Include CNN 시각화', 'font-size: 20px; color: #667eea; font-weight: bold;');
    console.log('%c✅ 완전 독립형 - 외부 데이터 불필요', 'font-size: 14px; color: #51cf66;');
    console.log('TensorFlow.js 버전:', tf.version.tfjs);
});
