var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const imagePaths = {
    fish: 'img/2x/fish_0.png',
    bubbles: [
        'img/2x/bubble_0.png',
        'img/2x/bubble_1.png',
        'img/2x/bubble_2.png'
    ]
};
function loadImageAsync(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}
class BubbleRow {
    constructor(images, wobbleArea, wobbleSpeed) {
        this.images = images;
        this.wobbleArea = wobbleArea;
        this.wobbleSpeed = wobbleSpeed;
    }
}
class FishRenderer {
    constructor(targetCanvas) {
        this.canvas = targetCanvas;
        this.context = targetCanvas.getContext('2d');
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.fishImage = yield loadImageAsync(imagePaths.fish);
            this.bubbleImages = [];
            for (let i = 0; i < imagePaths.bubbles.length; i++) {
                this.bubbleImages.push(yield loadImageAsync(imagePaths.bubbles[i]));
            }
            let maxBubbleWidth = Math.max(...this.bubbleImages.map((i) => i.width));
            let maxBubbleHeight = Math.max(...this.bubbleImages.map((i) => i.height));
            this.bubbleAreaWidth = maxBubbleWidth * 3;
            this.bubbleAreaHeight = maxBubbleHeight + (maxBubbleHeight / 16);
            this.bubbleRows = [
                new BubbleRow([
                    this.bubbleImages[0], this.bubbleImages[0], this.bubbleImages[2], this.bubbleImages[0]
                ], maxBubbleWidth * 0.5, 0.8),
                new BubbleRow([
                    this.bubbleImages[2], this.bubbleImages[1], this.bubbleImages[2], this.bubbleImages[1]
                ], maxBubbleWidth * 0.4, 0.6),
                new BubbleRow([
                    this.bubbleImages[2]
                ], maxBubbleWidth * 0.3, 0.7),
                new BubbleRow([], 0, 0),
                new BubbleRow([
                    this.bubbleImages[2], this.bubbleImages[0], this.bubbleImages[0], this.bubbleImages[0]
                ], maxBubbleWidth * 0.5, 1.6),
                new BubbleRow([
                    this.bubbleImages[2], this.bubbleImages[1], this.bubbleImages[1], this.bubbleImages[1]
                ], maxBubbleWidth * 0.4, 0.7),
                new BubbleRow([
                    this.bubbleImages[2]
                ], maxBubbleWidth * 0.3, 0.8),
                new BubbleRow([], 0, 0),
                new BubbleRow([
                    this.bubbleImages[0], this.bubbleImages[0], this.bubbleImages[0], this.bubbleImages[2]
                ], maxBubbleWidth * 0.7, 0.7),
                new BubbleRow([
                    this.bubbleImages[1], this.bubbleImages[1], this.bubbleImages[1], this.bubbleImages[2]
                ], maxBubbleWidth * 0.8, 0.5),
                new BubbleRow([
                    this.bubbleImages[2]
                ], maxBubbleWidth * 0.6, 0.2),
                new BubbleRow([], 0, 0),
            ];
            window.requestAnimationFrame(() => this.draw());
        });
    }
    draw() {
        this.resizeCanvas();
        this.context.beginPath();
        this.context.fillStyle = '#000040';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        let time = new Date();
        let seconds = time.getTime() / 1000;
        this.drawBubbles(seconds);
        this.drawFish(seconds);
        window.requestAnimationFrame(() => this.draw());
    }
    drawImageRow(images, xOffset, yBase, xSpacing, rowHeight) {
        const canvasWidth = this.canvas.width;
        const effectiveWidth = Math.ceil(canvasWidth / xSpacing) * xSpacing + (xSpacing * 2);
        const drawCount = effectiveWidth / xSpacing;
        for (let i = 0; i < drawCount; i++) {
            const image = images[i % images.length];
            const x = (i * xSpacing + xOffset) % effectiveWidth - xSpacing + (xSpacing - image.width) / 2;
            const y = yBase + (rowHeight - image.height) / 2;
            this.context.drawImage(images[i % images.length], x, y);
        }
    }
    resizeCanvas() {
        let width = this.canvas.clientWidth;
        let height = this.canvas.clientHeight;
        if (this.canvas.width != width || this.canvas.height != height) {
            this.canvas.width = width;
            this.canvas.height = height;
            return true;
        }
        return false;
    }
    drawFish(seconds) {
        let fishSpeed = 40;
        let fishWidth = this.fishImage.width;
        let fishHeight = this.fishImage.height;
        let fishBaseX = fishWidth * 2 - (seconds * fishSpeed % fishWidth * 2);
        for (let fishBaseY = 0; fishBaseY < this.canvas.height; fishBaseY += fishHeight * 2) {
            this.drawImageRow([this.fishImage], fishBaseX, fishBaseY, fishWidth * 2, fishHeight);
            this.drawImageRow([this.fishImage], fishBaseX + fishWidth, fishBaseY + fishHeight, fishWidth * 2, fishHeight);
        }
    }
    drawBubbles(seconds) {
        let bubbleSpeed = 80;
        let rowCount = Math.ceil((this.canvas.height + this.bubbleAreaHeight) / (this.bubbleAreaHeight * this.bubbleRows.length)) * this.bubbleRows.length;
        let effectiveHeight = rowCount * this.bubbleAreaHeight;
        for (let bubbleRowIndex = 0; bubbleRowIndex * this.bubbleAreaHeight < effectiveHeight; bubbleRowIndex++) {
            const bubbleRow = this.bubbleRows[bubbleRowIndex % this.bubbleRows.length];
            if (bubbleRow.images.length == 0)
                continue;
            let bubbleBaseY = ((bubbleRowIndex * this.bubbleAreaHeight) - (bubbleSpeed * seconds)) % effectiveHeight;
            if (bubbleBaseY < 0) {
                bubbleBaseY = effectiveHeight - Math.abs(bubbleBaseY);
            }
            bubbleBaseY -= this.bubbleAreaHeight;
            if (bubbleBaseY > this.canvas.height)
                continue;
            let bubbleBaseX = Math.sin(bubbleRow.wobbleSpeed * seconds) * bubbleRow.wobbleArea;
            this.drawImageRow(bubbleRow.images, bubbleBaseX, bubbleBaseY, this.bubbleAreaWidth, this.bubbleAreaHeight);
        }
    }
}
const canvas = document.getElementById('kf-background');
console.log(canvas);
const renderer = new FishRenderer(canvas);
renderer.start();
//# sourceMappingURL=fish.js.map