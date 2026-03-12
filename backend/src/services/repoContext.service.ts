import fs from 'fs/promises';
import path from 'path';
import logger from '../config/logger.js';

/**
 * Service to handle high-performance scanning of cloned repositories.
 * - Iterative Walk: Prevents Stack Overflow on deep structures.
 * - Concurrent Processing: Reads files in parallel batches.
 * - Size Filtering: Skips blobs/large artifacts.
 */
export class FileService {
  private static IGNORE_LIST = new Set([
    '.git',
    'node_modules',
    '.gitignore',
    'dist',
    'build',
    '.next',
    'artifacts',
    'cache',
    'typechain-types',
    'out',
    'broadcast',
    'lib',
    'coverage',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.DS_Store',
    'public',
  ]);

  private static ALLOWED_EXTENSIONS = new Set([
    '.ts',
    '.js',
    '.tsx',
    '.jsx',
    '.json',
    '.md',
    '.py',
    '.go',
    '.rs',
    '.java',
    '.c',
    '.cpp',
    '.h',
    '.html',
    '.css',
    '.yaml',
    '.yml',
    '.toml',
    '.sol',
    '.sh',
  ]);

  private static MAX_FILE_SIZE = 100 * 1024;
  private static CONCURRENCY_LIMIT = 20; // Number of files to read simultaneously

  /**
   * Scans a directory and returns a formatted string of all relevant code.
   * Uses an iterative approach and parallel reading for performance.
   */
  static async getProjectContext(directoryPath: string): Promise<string> {
    logger.info(
      `Starting high-performance context assembly for: ${directoryPath}`
    );

    const validFilePaths: string[] = [];
    const queue: string[] = [directoryPath];

    while (queue.length > 0) {
      const currentDir = queue.shift()!;
      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);

          if (this.IGNORE_LIST.has(entry.name)) continue;

          if (entry.isDirectory()) {
            queue.push(fullPath);
          } else {
            const ext = path.extname(entry.name).toLowerCase();
            if (this.ALLOWED_EXTENSIONS.has(ext)) {
              validFilePaths.push(fullPath);
            }
          }
        }
      } catch (err) {
        logger.warn(`Failed to traverse directory ${currentDir}: ${err}`);
      }
    }

    let totalContext = '';
    for (let i = 0; i < validFilePaths.length; i += this.CONCURRENCY_LIMIT) {
      const batch = validFilePaths.slice(i, i + this.CONCURRENCY_LIMIT);

      const results = await Promise.all(
        batch.map(async filePath => {
          try {
            const stats = await fs.stat(filePath);
            if (stats.size > this.MAX_FILE_SIZE) return null;

            const content = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(directoryPath, filePath);
            return `\n--- FILE: ${relativePath} ---\n${content}\n`;
          } catch (err) {
            logger.warn(`Failed to read file ${filePath}: ${err}`);
            return null;
          }
        })
      );
      totalContext += results.filter(Boolean).join('');
    }

    logger.info(
      `Ingestion complete. Processed ${validFilePaths.length} candidate files.`
    );
    return totalContext;
  }
}
