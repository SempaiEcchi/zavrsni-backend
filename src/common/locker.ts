import logger from "../logger.js";

export class Locker {
    private locks: Map<string, boolean> = new Map<string, boolean>();

    public lock(key: string) {
        if (!this.isLocked(key)) {
            logger.info("Locking", key);

            this.setLocked(key, true);
            return;
        }
    }

    public isLocked(key: string): boolean {
        return this.locks.get(key) || false;
    }

    private setLocked(key: string, locked: boolean): void {
        this.locks.set(key, locked);
    }

    public releaseLock(key: string): void {
        logger.info("Releasing lock for", key);
        this.setLocked(key, false);
    }
}
