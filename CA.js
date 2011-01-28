function CA(ctx, width, height, startTimeout) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    // Must be an equal divisor of width and height.
    this.pixelSize = 4;
    this.timeoutTime = startTimeout;
}

CA.prototype.setupTimeout = function () {
    var thisObj = this;

    this.timeout = setTimeout(function () {
        thisObj.timeoutHandler();
    }, this.timeoutTime);
};

CA.prototype.timeoutHandler = function () {
    var imgData = this.ctx.getImageData(0, 0, this.width, this.height),
        x, y;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Check every pixel for liveness, for the next generation.
    for (y = 0; y < this.height; y += this.pixelSize) {
        for (x = 0; x < this.width; x += this.pixelSize) {
            if (this.shouldLive(imgData, x, y)) {
                this.setPixelBlack(x, y);
            }
        }
    }

    this.setupTimeout();
};

// Returns true if the pixel should be live next, false otherwise.
CA.prototype.shouldLive = function (imgData, x, y) {
    var setNeighbourCount = 0,
        offsets = [-this.pixelSize, 0, this.pixelSize],
        off, off2;

    for (off in offsets) {
        for (off2 in offsets) {
            // Don't count the current pixel.
            if (offsets[off] === 0 && offsets[off2] === 0) {
                continue;
            }

            if (this.isPixelBlack(imgData, x + offsets[off],
                        y + offsets[off2])) {
                setNeighbourCount++;
            }
        }
    }

    var isLive = this.isPixelBlack(imgData, x, y);

    if ((!isLive && setNeighbourCount === 3) ||
        (isLive && (setNeighbourCount === 2 || setNeighbourCount === 3))) {
        return true;
    }

    return false;
};

CA.prototype.isPixelBlack = function (imgData, x, y) {
    // Wrap positions, creating a toroidal array.
    x = x % this.width;
    if (x < 0) {
        x += this.width;
    }

    y = y % this.height;
    if (y < 0) {
        y += this.height;
    }

    // 4 bytes per pixel (rgba)
    var cell = (x + y * this.width) * 4;

    // Since we only use black and white, just check the red and alpha values.
    // N.B. only check the top left pixel values, we assume that real pixels are
    // only set in blocks of pixelSize.
    if (imgData.data[cell] === 0 && imgData.data[cell + 3] === 255) {
        return true;
    }

    return false;
};

CA.prototype.setPixelBlack = function (x, y) {
    this.ctx.fillRect(x, y, this.pixelSize, this.pixelSize);
};

CA.prototype.clearPixel = function (x, y) {
    this.ctx.clearRect(x, y, this.pixelSize, this.pixelSize);
};

CA.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
};

CA.prototype.randomData = function () {
    var x, y;
    for (y = 0; y < this.height; y += this.pixelSize) {
        for (x = 0; x < this.width; x += this.pixelSize) {
            if (Math.random() < 0.1) {
                this.setPixelBlack(x, y);
            }
        }
    }
};

CA.prototype.initGliderGun = function (x, y) {
    var thisObj = this;
    var setOffsetPixel = function (xOff, yOff) {
        thisObj.setPixelBlack(x + xOff * thisObj.pixelSize,
                y + yOff * thisObj.pixelSize);
    };

    var coords = [
        [24, 0], [22, 1], [24, 1], [12, 2], [13, 2],
        [20, 2], [21, 2], [34, 2], [35, 2], [11, 3],
        [15, 3], [20, 3], [21, 3], [34, 3], [35, 3],
        [0, 4], [1, 4], [10, 4], [16, 4], [20, 4],
        [21, 4], [0, 5], [1, 5], [10, 5], [14, 5],
        [16, 5], [17, 5], [22, 5], [24, 5], [10, 6],
        [16, 6], [24, 6], [11, 7], [15, 7], [12, 8],
        [13, 8]
    ];

    var i;
    for (var i in coords) {
        setOffsetPixel(coords[i][0], coords[i][1]);
    }
};

