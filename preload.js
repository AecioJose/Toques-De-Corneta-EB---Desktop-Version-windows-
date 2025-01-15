const { contextBridge, ipcRenderer, dialog} = require('electron');
//const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
    loadData: () => ipcRenderer.invoke('load-data'),
    saveData: (newData) => ipcRenderer.invoke('save-data', newData),
    copyFile: (filePath, type) => ipcRenderer.invoke('copy-file', filePath, type),
    saveFile: (blobDataURL, fileName, fileType) => ipcRenderer.invoke('save-file', blobDataURL, fileName, fileType),
    getFilePath: async (type) => {
        return await ipcRenderer.invoke('get-file-path', type);
    }
});
