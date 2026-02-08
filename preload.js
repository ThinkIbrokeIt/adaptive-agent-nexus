const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations for local disk storage
  fs: {
    // Read directory
    readdir: async (dirPath) => {
      try {
        return await fs.readdir(dirPath);
      } catch (error) {
        throw new Error(`Failed to read directory: ${error.message}`);
      }
    },

    // Read file
    readFile: async (filePath, options = {}) => {
      try {
        return await fs.readFile(filePath, options);
      } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
      }
    },

    // Write file
    writeFile: async (filePath, data, options = {}) => {
      try {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        return await fs.writeFile(filePath, data, options);
      } catch (error) {
        throw new Error(`Failed to write file: ${error.message}`);
      }
    },

    // Check if path exists
    exists: async (filePath) => {
      try {
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    },

    // Get file stats
    stat: async (filePath) => {
      try {
        const stats = await fs.stat(filePath);
        return {
          size: stats.size,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          mtime: stats.mtime,
          birthtime: stats.birthtime
        };
      } catch (error) {
        throw new Error(`Failed to get stats: ${error.message}`);
      }
    },

    // Create directory
    mkdir: async (dirPath, options = { recursive: true }) => {
      try {
        return await fs.mkdir(dirPath, options);
      } catch (error) {
        throw new Error(`Failed to create directory: ${error.message}`);
      }
    },

    // Delete file/directory
    unlink: async (filePath) => {
      try {
        return await fs.unlink(filePath);
      } catch (error) {
        throw new Error(`Failed to delete: ${error.message}`);
      }
    }
  },

  // Path utilities
  path: {
    join: (...paths) => path.join(...paths),
    dirname: (filePath) => path.dirname(filePath),
    basename: (filePath, ext) => path.basename(filePath, ext),
    extname: (filePath) => path.extname(filePath),
    resolve: (...paths) => path.resolve(...paths),
    relative: (from, to) => path.relative(from, to)
  },

  // OS information
  os: {
    homedir: () => os.homedir(),
    tmpdir: () => os.tmpdir(),
    platform: () => os.platform(),
    arch: () => os.arch()
  },

  // Dialog for selecting directories
  showDirectoryPicker: async () => {
    return await ipcRenderer.invoke('show-directory-picker');
  }
});