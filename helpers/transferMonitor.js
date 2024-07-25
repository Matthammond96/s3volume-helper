import { EventEmitter } from "events";

export class TransferMonitor extends EventEmitter {
  transferredObjectCount = 0;
  totalObjectCount = 0;
  transferredDataSize = 0;
  totalDataSize = 0;

  constructor() {
    super();
    this.on("metadata", this.setMetadata.bind(this));
    this.on("size", this.updateDataSize.bind(this));
    this.on("object", this.updateObjectCount.bind(this));
  }

  setMetadata(totalDataSize, totalObjectCount) {
    this.totalDataSize = totalDataSize;
    this.totalObjectCount = totalObjectCount;
  }

  updateDataSize(size) {
    this.transferredDataSize += size;
    this.emit("progress", this.getStatus());
  }

  updateObjectCount(count = 1) {
    this.transferredObjectCount += count;
    this.emit("progress", this.getStatus());
  }

  getStatus() {
    return {
      size: {
        current: this.transferredDataSize,
        total: this.totalDataSize,
      },
      count: {
        current: this.transferredObjectCount,
        total: this.totalObjectCount,
      },
      progress: `${(
        (this.transferredDataSize / this.totalDataSize) *
        100
      ).toFixed(2)}%`,
    };
  }
}

export default TransferMonitor;
