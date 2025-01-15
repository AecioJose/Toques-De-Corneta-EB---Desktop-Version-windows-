import { buttonContainer } from './dom-elements.js';
import { activePlaylist } from './menu.js';
import { dragStart, dragOver, drop, dragEnd } from './drag-and-drop.js';
import { playTone } from './audio-actions.js'
import { isAddingTones, isChangingOrder } from './event-listeners.js';
import {editCard} from './edit-card.js'

//if se modo learn estiver ativado vai mudar a referencia dos negócios aqui
export const data = await window.electronAPI.loadData();
export let cards = data.Cards;
export let learnCards = data.learnCards;
export let playlists = data.playlists;



export async function saveData() {
    const data = {
        Cards: cards,
        learnCards: learnCards,
        playlists: playlists
    };
    await window.electronAPI.saveData(data);
}


// Função para alternar a seleção de um toque // reordena a lista
function toggleToneSelection(cardID) {
    const actual = playlists.findIndex(playlist => playlist.name === activePlaylist);
    if (actual === -1) return; // Valida a existência da playlist ativa
    let arrayCardsOfActualPlaylist = playlists[actual].cardsID;

    if (arrayCardsOfActualPlaylist.includes(cardID)) {
        // Retira o card da lista (deseleciona)
        const index = arrayCardsOfActualPlaylist.indexOf(cardID);
        if (index !== -1) arrayCardsOfActualPlaylist.splice(index, 1);
    } else {
        // Inclui um card na lista (seleciona)
        arrayCardsOfActualPlaylist.push(cardID);
    }

    saveData();
    renderTones();
}


// Função para renderizar os botões de toques
export function renderTones() {
    buttonContainer.innerHTML = '';

    //Analisa qual Playlist está ativa
    const index = playlists.findIndex(playlist => playlist.name === activePlaylist);
    const actualPlaylist = playlists[index].cardsID//a lista com id dos cards

    const allCards = cards;

    var wichCards;

    let tempArray = []

    actualPlaylist.forEach(cardID => {
        let index = allCards.findIndex(allCards => allCards.id === cardID)
        let card = cards[index]

        //Adiciona no novo array
        tempArray.push(card)
    })

    // console.log(tempArray)
    wichCards = tempArray
    

    if (isAddingTones) {
        // Exibe todos os toques, com os não selecionados no final
        //selected cards
        let selectedCards = tempArray
        //deselected cards
        const deselectedCards = allCards.filter(card => !selectedCards.includes(card)); // [1, 3, 4]

        // Combinar selectedCards e deselectedCards em um novo array ordenado
        const orderedCards = [...selectedCards, ...deselectedCards];

        //join them
        wichCards = orderedCards

    } else {
        // Exibe apenas os toques da playlist atual na ordem definida
        wichCards = tempArray
    }

    wichCards.forEach(card => {
        
        // Criando o Card
        const button = document.createElement('div');
        button.classList.add('tone-button');
        button.id = card.id;

        if(actualPlaylist.some(item => item === card.id )){
            button.classList.add('selected');
        }
        

        button.innerHTML = `
            <div class="editMoveCard" > 
                <div id="pencil-${card.id}" class="editMoveCard-pencil" alt="lapis para editar card"></div>
                <div class="editMoveCard-MoveIcon" alt="icone indicando que pode mover o card de lugar"></div> 
            </div>
            <div id="img${card.id}" class="img-container"></div>
            <span>${card.name}</span>
        `;
        const img = button.querySelector(`#img${card.id}`)
        img.style.backgroundImage = `url('${card.image}')`;
        img.style.backgroundRepeat = "no-repeat";
        img.style.backgroundSize = "contain";
        img.style.backgroundPosition = "50% 50%"
        

    

        // Eventos de clique
        if (isAddingTones) {
            button.addEventListener('click', () => toggleToneSelection(card.id));//Reorganiza a ordem
        } else {
            button.addEventListener('click', () => playTone(card.id, card.audio));
        }

        // Eventos de drag and drop
        if (isChangingOrder) {
            button.setAttribute('draggable', true);
            button.addEventListener('dragstart', dragStart);
            button.addEventListener('dragover', dragOver);
            button.addEventListener('drop', drop);
            button.addEventListener('dragend', dragEnd);

            button.addEventListener('touchstart', dragStart);
            button.addEventListener('touchmove', dragOver);  // Permiti que o item siga o dedo durante o toque
            button.addEventListener('touchend', dragEnd);
            
            //Ativando icones de mover e editar card quando o editButton for ativado
            button.querySelector('.editMoveCard').style.display = 'flex';

        } else {
            //Desativando icones de mover e editar card
            button.querySelector('.editMoveCard').style.display = 'none';
        }

        buttonContainer.appendChild(button);

        //Adiciona o eventlistener para o pencil para poder editar o cartão
        const pencilButton = document.getElementById(`pencil-${card.id}`);
        if (pencilButton) { // Verifica se o elemento existe
            pencilButton.addEventListener('click', (event) => editCard(event, card));
        }
    });

}
