import fs from "fs";
import path from "path";
import crypto from "crypto";
import { promises as fsPromises } from "fs";

// Interface for cache entry metadata
interface CacheEntryMetadata {
  key: string;
  size: number;
  lastAccessed: number;
  filePath: string;
}

// Class to manage the LRU file cache
export class FileCache {
  private cacheDir: string;
  private maxSizeBytes: number;
  private entries: Map<string, CacheEntryMetadata>;
  private currentSizeBytes: number;
  private indexFilePath: string;
  private lockFilePath: string;

  constructor(maxSizeMB = 0) {
    // Default cache directory is in the OS temp directory
    this.cacheDir = path.join(process.env.TEMP || "/tmp", "file-storage-cache");
    this.maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    this.entries = new Map<string, CacheEntryMetadata>();
    this.currentSizeBytes = 0;
    this.indexFilePath = path.join(this.cacheDir, "cache-index.json");
    this.lockFilePath = path.join(this.cacheDir, "cache.lock");

    // If caching is disabled, we don't need to initialize
    if (this.maxSizeBytes <= 0) return;

    // Create cache directory if it doesn't exist
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    // Load existing cache index if it exists
    this.loadCacheIndex();
  }

  // Generate a unique key for a file
  private generateKey(storageType: string, container: string, filename: string): string {
    return crypto
      .createHash("sha512")
      .update(`${storageType}:${container}:${filename}`)
      .digest("hex");
  }

  // Load the cache index from disk
  private loadCacheIndex(): void {
    if (this.maxSizeBytes <= 0) return;

    try {
      if (fs.existsSync(this.indexFilePath)) {
        const data = fs.readFileSync(this.indexFilePath, "utf8");
        const index = JSON.parse(data);

        // Validate and load entries
        this.entries.clear();
        this.currentSizeBytes = 0;

        for (const entry of index.entries) {
          // Skip entries with missing files
          if (!fs.existsSync(entry.filePath)) continue;

          // Get actual file size
          const stats = fs.statSync(entry.filePath);
          entry.size = stats.size;

          this.entries.set(entry.key, entry);
          this.currentSizeBytes += entry.size;
        }

        // Enforce size limit
        this.enforceSizeLimit();

        // Save the corrected index
        this.saveCacheIndex();
      }
    } catch (error) {
      console.error("Error loading cache index:", error);
      // If there's an error, reset the cache
      this.entries.clear();
      this.currentSizeBytes = 0;
      this.saveCacheIndex();
    }
  }

  // Save the cache index to disk
  private saveCacheIndex(): void {
    if (this.maxSizeBytes <= 0) return;

    try {
      const index = {
        entries: Array.from(this.entries.values()),
      };
      fs.writeFileSync(this.indexFilePath, JSON.stringify(index), "utf8");
    } catch (error) {
      console.error("Error saving cache index:", error);
    }
  }

  // Acquire a lock for cache operations
  private async acquireLock(): Promise<boolean> {
    if (this.maxSizeBytes <= 0) return true;

    try {
      // Try to create the lock file
      await fsPromises.writeFile(this.lockFilePath, process.pid.toString(), {
        flag: "wx", // Fail if file exists
      });
      return true;
    } catch (error) {
      // Check if lock is stale (older than 30 seconds)
      try {
        const stats = await fsPromises.stat(this.lockFilePath);
        const lockAge = Date.now() - stats.mtime.getTime();

        if (lockAge > 30000) {
          // 30 seconds
          // Force remove stale lock
          await fsPromises.unlink(this.lockFilePath);
          // Try again
          return this.acquireLock();
        }
      } catch (statError) {
        // Lock file disappeared, try again
        return this.acquireLock();
      }

      return false;
    }
  }

  // Release the lock
  private async releaseLock(): Promise<void> {
    if (this.maxSizeBytes <= 0) return;

    try {
      await fsPromises.unlink(this.lockFilePath);
    } catch (error) {
      // Ignore errors when releasing lock
    }
  }

  // Enforce the size limit by removing least recently used entries
  private enforceSizeLimit(): void {
    if (this.maxSizeBytes <= 0) return;

    if (this.currentSizeBytes <= this.maxSizeBytes) return;

    // Sort entries by last accessed time (oldest first)
    const sortedEntries = Array.from(this.entries.values()).sort(
      (a, b) => a.lastAccessed - b.lastAccessed
    );

    // Remove entries until we're under the limit
    for (const entry of sortedEntries) {
      if (this.currentSizeBytes <= this.maxSizeBytes) break;

      try {
        // Remove the file
        if (fs.existsSync(entry.filePath)) {
          fs.unlinkSync(entry.filePath);
        }

        // Update tracking
        this.currentSizeBytes -= entry.size;
        this.entries.delete(entry.key);
      } catch (error) {
        console.error(`Error removing cache entry ${entry.key}:`, error);
      }
    }
  }

  // Get a file from the cache
  async get(storageType: string, container: string, filename: string): Promise<string | null> {
    if (this.maxSizeBytes <= 0) return null;

    const key = this.generateKey(storageType, container, filename);

    // Try to acquire lock
    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      // If we can't acquire the lock, just return null
      return null;
    }

    try {
      const entry = this.entries.get(key);

      if (!entry || !fs.existsSync(entry.filePath)) {
        if (entry) {
          // File is missing, remove from cache
          this.currentSizeBytes -= entry.size;
          this.entries.delete(key);
          this.saveCacheIndex();
        }
        return null;
      }

      // Update last accessed time
      entry.lastAccessed = Date.now();
      this.saveCacheIndex();

      return entry.filePath;
    } finally {
      await this.releaseLock();
    }
  }

  // Put a file in the cache
  async put(
    storageType: string,
    container: string,
    filename: string,
    sourcePath: string
  ): Promise<void> {
    if (this.maxSizeBytes <= 0) return;

    const key = this.generateKey(storageType, container, filename);

    // Try to acquire lock
    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      // If we can't acquire the lock, just skip caching
      return;
    }

    try {
      // Get file stats
      const stats = await fsPromises.stat(sourcePath);

      // If the file is larger than our max cache size, don't cache it
      if (stats.size > this.maxSizeBytes) {
        return;
      }

      // Remove existing entry if it exists
      const existingEntry = this.entries.get(key);
      if (existingEntry) {
        if (fs.existsSync(existingEntry.filePath)) {
          await fsPromises.unlink(existingEntry.filePath);
        }
        this.currentSizeBytes -= existingEntry.size;
        this.entries.delete(key);
      }

      // Ensure we have enough space
      while (this.currentSizeBytes + stats.size > this.maxSizeBytes && this.entries.size > 0) {
        // Find the least recently used entry
        let oldestEntry: CacheEntryMetadata | null = null;
        let oldestTime = Infinity;

        for (const entry of this.entries.values()) {
          if (entry.lastAccessed < oldestTime) {
            oldestTime = entry.lastAccessed;
            oldestEntry = entry;
          }
        }

        if (oldestEntry) {
          // Remove the oldest entry
          if (fs.existsSync(oldestEntry.filePath)) {
            await fsPromises.unlink(oldestEntry.filePath);
          }
          this.currentSizeBytes -= oldestEntry.size;
          this.entries.delete(oldestEntry.key);
        }
      }

      // Create a unique filename in the cache directory
      const cachedFilePath = path.join(this.cacheDir, `${key}`);

      // Copy the file to the cache
      await fsPromises.copyFile(sourcePath, cachedFilePath);

      // Add to cache
      const entry: CacheEntryMetadata = {
        key,
        size: stats.size,
        lastAccessed: Date.now(),
        filePath: cachedFilePath,
      };

      this.entries.set(key, entry);
      this.currentSizeBytes += stats.size;

      // Save the index
      this.saveCacheIndex();
    } catch (error) {
      console.error("Error putting file in cache:", error);
    } finally {
      await this.releaseLock();
    }
  }

  // Put a buffer directly in the cache
  async putBuffer(
    storageType: string,
    container: string,
    filename: string,
    buffer: Buffer
  ): Promise<void> {
    if (this.maxSizeBytes <= 0) return;

    const key = this.generateKey(storageType, container, filename);

    // Try to acquire lock
    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      // If we can't acquire the lock, just skip caching
      return;
    }

    try {
      const size = buffer.length;

      // If the buffer is larger than our max cache size, don't cache it
      if (size > this.maxSizeBytes) {
        return;
      }

      // Remove existing entry if it exists
      const existingEntry = this.entries.get(key);
      if (existingEntry) {
        if (fs.existsSync(existingEntry.filePath)) {
          await fsPromises.unlink(existingEntry.filePath);
        }
        this.currentSizeBytes -= existingEntry.size;
        this.entries.delete(key);
      }

      // Ensure we have enough space
      while (this.currentSizeBytes + size > this.maxSizeBytes && this.entries.size > 0) {
        // Find the least recently used entry
        let oldestEntry: CacheEntryMetadata | null = null;
        let oldestTime = Infinity;

        for (const entry of this.entries.values()) {
          if (entry.lastAccessed < oldestTime) {
            oldestTime = entry.lastAccessed;
            oldestEntry = entry;
          }
        }

        if (oldestEntry) {
          // Remove the oldest entry
          if (fs.existsSync(oldestEntry.filePath)) {
            await fsPromises.unlink(oldestEntry.filePath);
          }
          this.currentSizeBytes -= oldestEntry.size;
          this.entries.delete(oldestEntry.key);
        }
      }

      // Create a unique filename in the cache directory
      const cachedFilePath = path.join(this.cacheDir, `${key}`);

      // Write the buffer to the cache
      await fsPromises.writeFile(cachedFilePath, buffer);

      // Add to cache
      const entry: CacheEntryMetadata = {
        key,
        size,
        lastAccessed: Date.now(),
        filePath: cachedFilePath,
      };

      this.entries.set(key, entry);
      this.currentSizeBytes += size;

      // Save the index
      this.saveCacheIndex();
    } catch (error) {
      console.error("Error putting buffer in cache:", error);
    } finally {
      await this.releaseLock();
    }
  }

  // Clear the entire cache
  async clear(): Promise<void> {
    if (this.maxSizeBytes <= 0) return;

    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      return;
    }

    try {
      // Delete all cached files
      for (const entry of this.entries.values()) {
        if (fs.existsSync(entry.filePath)) {
          await fsPromises.unlink(entry.filePath);
        }
      }

      // Reset tracking
      this.entries.clear();
      this.currentSizeBytes = 0;

      // Save empty index
      this.saveCacheIndex();
    } catch (error) {
      console.error("Error clearing cache:", error);
    } finally {
      await this.releaseLock();
    }
  }
}
