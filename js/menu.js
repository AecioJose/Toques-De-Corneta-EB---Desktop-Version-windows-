import { playlists, saveData, data, renderTones } from './rendering-cards.js';

export var activePlaylist = '';

// Função para exibir um menu de confirmação
function showConfirmationMenu(index) {
    // Cria o menu de confirmação
    const confirmationMenu = document.createElement('div');
    confirmationMenu.id = 'confirmationMenu';
    confirmationMenu.innerHTML = `
        <p id="confirmMessage" >Deseja realmente excluir a playlist "${playlists[index].name}"?</p>
        <div id="btnContainer">
            <button id="confirmDelete">Confirmar</button>
            <button id="cancelDelete">Cancelar</button>
        </div>
        
    `;
    

    // Posiciona o menu de confirmação em relação ao dropdown
    const dropdownContent = document.getElementById('dropdownContent');
    const rect = dropdownContent.getBoundingClientRect();
    confirmationMenu.style.top = `${rect.top + window.scrollY + 30}px`; // 30px abaixo do dropdown
    confirmationMenu.style.left = `${rect.left + window.scrollX}px`;

    document.getElementById('dropdownContent').appendChild(confirmationMenu);

    // Adiciona eventos para confirmar ou cancelar a exclusão
    document.getElementById('confirmDelete').addEventListener('click', () => {
        playlists.splice(index, 1); // Remove a playlist do array
        saveData(); // Salva as alterações
        renderPlaylistsMenu(); // Atualiza a visualização
        confirmationMenu.remove(); // Remove o menu de confirmação
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
        confirmationMenu.remove(); // Remove o menu de confirmação
    });
}

// Inicia o menu
export function renderPlaylistsMenu() {
    const dropdownContent = document.getElementById('dropdownContent');
    dropdownContent.innerHTML = '';

    playlists.forEach((playlist, index) => {
        const item = document.createElement('div');
        item.classList.add('playlist-item');
        item.innerHTML = `
            <span class="playlist-item" style="user-select: none">${playlist.name}</span>
            <div class="editPlaylist" style="user-select: none"></div>
            <button class="deleteButton" style="user-select: none;"></button> 
        `;
        item.addEventListener('click', () => setActivePlaylist(playlist.name));

        // Evento para editar o nome da playlist
        const editPlaylistDiv = item.querySelector('.editPlaylist');
        editPlaylistDiv.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede a propagação do evento para o item inteiro
            const playlistNameElement = item.querySelector('.playlist-item');

            // Cria um campo de entrada
            const input = document.createElement('input');
            input.type = 'text';
            input.value = playlist.name;
            input.className = 'playlist-edit-input';
            input.spellcheck = false;

            // Substitui o texto pelo campo de entrada
            playlistNameElement.innerHTML = '';
            playlistNameElement.appendChild(input);
            input.focus(); // Foca no campo de entrada

            // Evento para salvar a alteração ao pressionar Enter
            input.addEventListener('blur', () => {
                const newName = input.value.trim(); // O trim remove espaços no início e no fim
                if (newName.length > 0) { // Verifica se o novo nome não é vazio
                    playlists[index].name = newName; // Atualiza o nome da playlist no array
                    saveData(); // Salva as alterações
                }
                renderPlaylistsMenu(); // Atualiza a visualização
            });

            // Salva a alteração se o usuário pressionar Enter
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    input.blur(); // Perde o foco para salvar
                }
            });
        });

        // Evento para confirmar exclusão com clique no botão
        const deleteButton = item.querySelector('.deleteButton');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede a propagação do evento para o item inteiro
            showConfirmationMenu(index); // Exibe o menu de confirmação
        });

        dropdownContent.appendChild(item);
    });

    const newPlaylist = document.createElement('div');
    newPlaylist.id = 'new-playlist';
    newPlaylist.innerHTML = `
        <span style="user-select: none">Nova Lista</span>
        <div class="Sumicon" style="user-select: none"></div>
    `;
    newPlaylist.addEventListener('click', () => createNewPlaylist());
    dropdownContent.appendChild(newPlaylist);

    setActivePlaylist();
}

function createNewPlaylist() {
    // Cria um campo de entrada
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'Nova Playlist';
    input.className = 'playlist-edit-input';
    input.spellcheck = false;

    // Substitui o texto pelo campo de entrada
    const newPlaylist = document.querySelector('#new-playlist');
    newPlaylist.innerHTML = '';
    newPlaylist.appendChild(input);
    input.focus(); // Foca no campo de entrada

    // Adiciona a classe visible ao dropdown-content para mantê-lo visível
    const dropdownContent = document.getElementById('dropdownContent');
    dropdownContent.classList.add('visible');

    // Função para restaurar o estado original
    const restorePlaylistState = () => {
        newPlaylist.innerHTML = `
            <span>Nova Lista</span>
            <div class="Sumicon"></div>
        `;
        dropdownContent.classList.remove('visible'); // Remove a classe que mantém visível
        document.removeEventListener('mousedown', restorePlaylistState); // Remove o evento ao terminar
    };

    // Evento para salvar a alteração ao perder o foco
    const handleBlur = () => {
        const newName = input.value.trim(); // O trim remove espaços no início e no fim
        // Verifica se o novo nome não é vazio e se a playlist não existe
        if (newName.length > 0 && !playlists.some(playlist => playlist.name === newName)) { 
            playlists.push({ name: newName, cardsID: [] }); // Adiciona a nova playlist no array
            setActivePlaylist(newName);
            saveData();
            renderPlaylistsMenu(); // Atualiza a visualização
        } else if (playlists.some(playlist => playlist.name === newName)) {
            // Se a playlist já existe, você pode mostrar uma mensagem ou simplesmente ignorar
            alert('A playlist já existe. Escolha outro nome.');
        }
        restorePlaylistState(); // Restaura o estado original após salvar
    };

    // Salva a alteração se o usuário pressionar Enter
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleBlur(); // Salva a alteração
        }
    });

    // Restaura o estado original ao clicar fora do input
    document.addEventListener('mousedown', (event) => {
        // Verifica se o clique foi fora do dropdown ou do input
        if (!dropdownContent.contains(event.target) && !input.contains(event.target)) {
            restorePlaylistState();
        }
    });
}


export function setActivePlaylist(name = 'none') {
    if (name == 'none') {
        name = playlists[0].name;
    }
    activePlaylist = name;

    const btnName = document.getElementById('dropbtn');
    btnName.innerText = `${name}`;

    // Coloca sempre a playlist atual com índice 0, pra toda reinicialização ela ficar em primeiro
    const index = playlists.findIndex(playlist => playlist.name === name);
    moveElement(playlists, index, 0);

    // console.log(playlists);
    // Salva no Json esse estado das playlists
    saveData();
    renderTones();
}

function moveElement(array, fromIndex, toIndex) {
    const element = array.splice(fromIndex, 1)[0]; // Remove o elemento do índice original
    array.splice(toIndex, 0, element); // Adiciona o elemento na nova posição
}
