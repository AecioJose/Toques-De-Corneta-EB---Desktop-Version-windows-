import { renderTones, playlists, saveData } from './rendering-cards.js';
import { activePlaylist } from './menu.js';

let draggedToneId = null;
let halfWidth = 0;
let halfHeight = 0;
let dragPreview = null;


export function dragStart(e) {
    draggedToneId = e.currentTarget.id;
    e.currentTarget.classList.add('dragging');

    //----------preview card mobile
    if(e.type === 'touchstart'){
        //Largura para centralizar no meio do dedo
        const rect = e.currentTarget.getBoundingClientRect()
        halfHeight = rect.height/2
        halfWidth = rect.width/2

        // Clona o card arrastado para usar de preview para o toque
        dragPreview = e.currentTarget.cloneNode(true);
        dragPreview.style.position = 'absolute';
        dragPreview.style.opacity = '0.7'; 
        dragPreview.style.pointerEvents = 'none'; // Evita interferência do preview nos eventos touch
        dragPreview.style.zIndex = '1001';

        document.body.appendChild(dragPreview);

        const touch = e.touches[0];
        
        dragPreview.style.top = `${touch.clientY - halfHeight}px`;
        dragPreview.style.left = `${touch.clientX -  halfWidth}px`;



    }
    //-----------
}


export function dragOver(e) {
    e.preventDefault();

    const actual = playlists.findIndex(playlist => playlist.name === activePlaylist);
    let arrayCardsOfActualPlaylist = playlists[actual].cardsID
    var toneOrder = arrayCardsOfActualPlaylist
    
    if (e.type === 'touchmove') {
        //----preview card mobile moving with touch
        if (dragPreview) {
            const touch = e.touches[0];
            const rect = dragPreview.getBoundingClientRect()
            dragPreview.style.top = `${touch.clientY - halfHeight}px`;
            dragPreview.style.left = `${touch.clientX -  halfWidth}px`;
        }
        //-------

        const touch = e.changedTouches[0];
        const dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetToneId = dropElement.id;



        if (targetToneId && draggedToneId !== targetToneId) {
            const draggedIndex = toneOrder.indexOf(draggedToneId);
            const dropIndex = toneOrder.indexOf(targetToneId);

            toneOrder.splice(draggedIndex, 1);
            toneOrder.splice(dropIndex, 0, draggedToneId);

        }
        
    } else{
        const targetToneId = e.currentTarget.id;

        if (draggedToneId === targetToneId) return;

        const draggedIndex = toneOrder.indexOf(draggedToneId);
        const targetIndex = toneOrder.indexOf(targetToneId);

        toneOrder.splice(draggedIndex, 1);
        toneOrder.splice(targetIndex, 0, draggedToneId);
    }
    

    renderTones();
    saveData()
}


export function drop(e) {
    e.currentTarget.classList.remove('dragging');
    saveData()

    if (dragPreview) {
        document.body.removeChild(dragPreview);
        dragPreview = null;
    }
}

export function dragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    saveData()

    if (dragPreview) {
        document.body.removeChild(dragPreview);
        dragPreview = null;
    }
}
