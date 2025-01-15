const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const audioDir = './assets/audio/';
const imageDir = './assets/images/cards/';


// Confirma a criação dos diretórios de áudio e imagem ao iniciar o aplicativo
const ensureDirectoriesExist = () => {
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
};

const dataPath = path.join(__dirname, './sources/json/database.json'); 

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 720,
    frame: false,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
      contextIsolation: true,                       // Melhora a segurança
      enableRemoteModule: false 
    },
    icon: './assets/icons/corneta.ico',
  });
  
  win.loadFile('index.html');
}

// Ouvintes para os eventos de minimizar, maximizar e fechar
ipcMain.on('minimize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.minimize();
});

ipcMain.on('maximize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window.isMaximized()) {
      window.unmaximize();
  } else {
      window.maximize();
  }
});

ipcMain.on('close-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.close();
});


// Função para carregar o JSON e enviar ao front-end
ipcMain.handle('load-data', async () => {
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
});
// Função para atualizar o JSON
ipcMain.handle('save-data', async (event, newData) => {
  fs.writeFileSync(dataPath, JSON.stringify(newData, null, 2));
  return { status: "success", message: "Dados salvos com sucesso" };
});


// Função para salvar blobs (áudio ou imagem) no diretório correspondente
ipcMain.handle('save-file', async (event, blobDataURL, fileName, fileType) => {
  const base64Data = blobDataURL.split(',')[1]; // Extrai dados base64 do Data URL
  const buffer = Buffer.from(base64Data, 'base64');
  const destDir = fileType === 'audio' ? audioDir : imageDir; 
  // Define o diretório de acordo com o tipo de arquivo
  const destPath = path.join(destDir, fileName); // Define o caminho final do arquivo


  try {
    // Salva o arquivo no diretório designado (áudio ou imagem)
    fs.writeFileSync(destPath, buffer);
    return `./${destPath}`; // Retorna o caminho onde o arquivo foi salvo
  } catch (error) {
    console.error('Erro ao salvar o arquivo:', error);
    throw error;
  }
});




app.whenReady().then(() => {
  ensureDirectoriesExist();
  createWindow()
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
