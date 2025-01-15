import { setupEditButton, setupForm } from './js/event-listeners.js';
import { renderTones } from './js/rendering-cards.js';
import {renderPlaylistsMenu} from './js/menu.js'
//Setup Event Listeners
setupEditButton();

//Setup Formulário
setupForm();


//Renderiza o menu na inicialização
renderPlaylistsMenu();

// Renderizar toques na inicialização
renderTones();

//escuta os negocio da tela pra minimizar maximizar e fechar
// Verifica se a API do Electron está disponível
// Verifica se a API do Electron está disponível
if (window.electronAPI) {
    document.getElementById('minimize').addEventListener('click', () => {
        window.electronAPI.minimize();
    });

    document.getElementById('maximize').addEventListener('click', () => {
        window.electronAPI.maximize();
    });

    document.getElementById('close').addEventListener('click', () => {
        window.electronAPI.close();
    });
} else {
    console.error("Electron API não está disponível.");
}