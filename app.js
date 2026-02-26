// MNIST 데이터 로더 (Google CDN 사용)
class MNISTData {
    constructor() {
        this.shuffledTrainIndex = 0;
        this.shuffledTestIndex = 0;
    }
    
    async load() {
        // MNIST sprite 이미지와 레이블 로드
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        try {
            const [imgResponse, labelsResponse] = await Promise.all([
                fetch('https://storage.googleapis.com/tfjs-tutorials/mnist_images.png'),
                fetch('https://storage.googleapis.com/tfjs-tutorials/mnist_labels_uint8')
            ]);
            
            const labelsBuffer = await labelsResponse.arrayBuffer();
            this.datasetLabels = new Uint8Array(labelsBuffer);
            
            const imgBlob = await imgResponse.blob();
            
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    this.datasetImages = ctx.getImageData(0, 0, img.width, img.height).data;
                    
                    this.trainIndices = tf.util.createShuffledIndices(55000);
                    this.testIndices = tf.util.createShuffledIndices(10000);
                    
                    this.trainImages = this.datasetImages.slice(0, 55000 * 28 * 28 * 4);
                    this.testImages = this.datasetImages.slice(55000 * 28 * 28 * 4);
                    this.trainLabels = this.datasetLabels.slice(0, 55000);
                    this.testLabels = this.datasetLabels.slice(55000);
                    
                    resolve();
                };
                img.onerror = reject;
                img.src = URL.createObjectURL(imgBlob);
            });
        } catch (error) {
            console.error('MNIST 데이터 로드 실패:', error);
            throw error;
        }
    }
    
    nextTrainBatch(batchSize) {
        return this.nextBatch(
            batchSize, this.trainImages, this.trainLabels,
            () => {
                this.shuffledTrainIndex = (this.shuffledTrainIndex + 1) % this.trainIndices.length;
                return this.trainIndices[this.shuffledTrainIndex];
            }
        );
    }
    
    nextBatch(batchSize, data, labels, index) {
        const batchImagesArray = new Float32Array(batchSize * 28 * 28);
        const batchLabelsArray = new Uint8Array(batchSize * 10);
        
        for (let i = 0; i < batchSize; i++) {
            const idx = index();
            const image = data.slice(idx * 28 * 28 * 4, (idx + 1) * 28 * 28 * 4);
            
            // 그레이스케일 변환
            for (let j = 0; j < 28 * 28; j++) {
                batchImagesArray[i * 28 * 28 + j] = image[j * 4] / 255;
            }
            
            // 원핫 인코딩
            const label = labels[idx];
            batchLabelsArray[i * 10 + label] = 1;
        }
        
        const xs = tf.tensor4d(batchImagesArray, [batchSize, 28, 28, 1]);
        const ys = tf.tensor2d(batchLabelsArray, [batchSize, 10]);
        
        return { xs, ys };
    }
}

// CNN 시각화 애플리케이션
class CNNVisualizer {
    constructor() {
        this.model = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // 캔버스 초기화
        this.drawCanvas = document.getElementById('drawCanvas');
        this.drawCtx = this.drawCanvas.getContext('2d');
        this.drawCtx.fillStyle = 'white';
        this.drawCtx.fillRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        this.drawCtx.strokeStyle = 'black';
        this.drawCtx.lineWidth = 20;
        this.drawCtx.lineCap = 'round';
        this.drawCtx.lineJoin = 'round';
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 모델 로드
        this.loadModel();
    }
    
    setupEventListeners() {
        // 마우스 이벤트
        this.drawCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.drawCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.drawCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.drawCanvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // 터치 이벤트
        this.drawCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.drawCanvas.getBoundingClientRect();
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
        
        // 버튼 이벤트
        document.getElementById('predictBtn').addEventListener('click', () => this.predict());
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        
        // 키보드
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
            
            // 저장된 모델 로드 시도
            const hasSavedModel = await this.loadSavedModel();
            
            if (!hasSavedModel) {
                // 모델 생성
                this.model = this.createModel();
                
                loadingText.textContent = 'MNIST 데이터 다운로드 중...';
                loadingDetail.textContent = '약 10MB, 최초 1회만 다운로드합니다';
                
                // 학습 진행
                await this.trainModel(loadingText, loadingDetail);
            }
            
            console.log('✓ 모델 준비 완료!');
            loadingOverlay.classList.add('hidden');
            
        } catch (error) {
            console.error('오류 발생:', error);
            loadingText.textContent = '데모 모드로 시작';
            loadingDetail.textContent = '랜덤 가중치 사용 (정확도 낮음, 시각화는 정상)';
            
            // 에러 발생 시에도 랜덤 가중치로라도 진행
            if (!this.model) {
                this.model = this.createModel();
            }
            
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 2000);
        }
    }
    
    async loadSavedModel() {
        try {
            this.model = await tf.loadLayersModel('indexeddb://mnist-cnn-kaist');
            console.log('✓ 저장된 모델 로드 완료!');
            return true;
        } catch (e) {
            console.log('저장된 모델 없음');
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
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
        
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        return model;
    }
    
    async trainModel(loadingText, loadingDetail) {
        const mnistData = new MNISTData();
        await mnistData.load();
        
        loadingText.textContent = '모델 학습 중...';
        const BATCH_SIZE = 128;
        const EPOCHS = 3;
        const BATCHES_PER_EPOCH = 100;
        
        for (let epoch = 0; epoch < EPOCHS; epoch++) {
            for (let batch = 0; batch < BATCHES_PER_EPOCH; batch++) {
                const batchData = mnistData.nextTrainBatch(BATCH_SIZE);
                
                await this.model.fit(batchData.xs, batchData.ys, {
                    batchSize: BATCH_SIZE,
                    epochs: 1,
                    verbose: 0
                });
                
                batchData.xs.dispose();
                batchData.ys.dispose();
                
                const progress = ((epoch * BATCHES_PER_EPOCH + batch + 1) / (EPOCHS * BATCHES_PER_EPOCH) * 100).toFixed(0);
                loadingDetail.textContent = `학습 진행: ${progress}% (Epoch ${epoch + 1}/${EPOCHS})`;
            }
        }
        
        loadingText.textContent = '모델 저장 중...';
        loadingDetail.textContent = '다음 방문부터는 즉시 시작됩니다';
        await this.model.save('indexeddb://mnist-cnn-kaist');
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
    console.log('TensorFlow.js 버전:', tf.version.tfjs);
});
