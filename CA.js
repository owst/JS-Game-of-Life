/*
 * Copyright (c) 2011, Owen Stephens
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Owen Stephens nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Owen Stephens BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

function CA(canvas, width, height, pixelSize, startTimeout) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    // canvas.width (height) must be width * pixelSize (height * pixelSize).
    this.pixelSize = pixelSize;
    this.timeoutTime = startTimeout;
    this.pixelsLive = [];

    for (var x = 0; x < width; x++) {
        this.pixelsLive[x] = [];
        for (var y = 0; y < height; y++) {
            this.pixelsLive[x][y] = false;
        }
    }

    // Create a copy of the pixels to use as a buffer.
    this.bufferPixelsLive = this.pixelsLive.map(function(row) {
        return row.slice();
    });
}

CA.prototype.setupTimeout = function () {
    var thisObj = this;

    this.timeout = setTimeout(function () {
        thisObj.timeoutHandler();
    }, this.timeoutTime);
};

CA.prototype.timeoutHandler = function () {
    // Write each pixel into the buffer, to ensure we only use the old values
    // to determine the new values.
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.bufferPixelsLive[x][y] = this.shouldLive(x, y);
        }
    }

    // Swap buffers
    var temp = this.pixelsLive;
    this.pixelsLive = this.bufferPixelsLive;
    this.bufferPixelsLive = temp;

    this.paintImage();

    this.setupTimeout();
};

CA.prototype.offsets = (function () {
    var coordOffsets = [-1, 0, 1];
    var offsets = [];

    coordOffsets.map(function(xOffset) {
        coordOffsets.map(function(yOffset) {
            if (xOffset != 0 || yOffset != 0) {
                offsets.push({x: xOffset, y: yOffset});
            }
        });
    });

    return offsets;
})();

// Returns true if the pixel should be live next, false otherwise.
CA.prototype.shouldLive = function (x, y) {
    var neighboursLive = 0;

    // Calculate the number of neighbours that are live.
    this.offsets.forEach(function(offsets) {
        if (this.isPixelSet(x + offsets.x, y + offsets.y)) {
            neighboursLive++;
        }
    }, this);

    if (neighboursLive == 3 || (this.isPixelSet(x, y) && neighboursLive == 2)) {
        return true;
    } else {
        return false;
    }
};

CA.prototype.isPixelSet = function (x, y) {
    // Wrap positions, creating a toroidal array.
    x = x % this.width;
    if (x < 0) {
        x += this.width;
    }

    y = y % this.height;
    if (y < 0) {
        y += this.height;
    }

    return this.pixelsLive[x][y];
};

CA.prototype.paintImage = function (x, y) {
    var size = this.pixelSize;

    // First, clear exisiting image.
    this.canvas.clearRect(0, 0, this.width * size, this.height * size);

    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            if (this.pixelsLive[x][y]) {
                this.canvas.fillRect(x * size, y * size, size, size);
            }
        }
    }
};

CA.prototype.clear = function () {
    this.setEach(function (x, y) {
        return false;
    });
};

CA.prototype.randomData = function () {
    var live = this.pixelsLive;

    this.setEach(function (x, y) {
        return live[x][y] || Math.random() < 0.1;
    });
}

CA.prototype.setEach = function (shouldSetFunction) {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.pixelsLive[x][y] = shouldSetFunction(x, y);
        }
    }

    this.paintImage();
};

CA.prototype.initGliderGun = function (x, y) {
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

    coords.forEach(function(offsets) {
        this.pixelsLive[x + offsets[0]][y + offsets[1]] = true;
    }, this);

    this.paintImage();
};

