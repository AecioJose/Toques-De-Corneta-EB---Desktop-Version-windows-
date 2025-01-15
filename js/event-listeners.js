import { addTonesBtn, editBtnNchangeOrder, changeOrderImg } from './dom-elements.js';
// import { saveData, cards, learnCards } from './rendering-cards.js';
import { renderTones } from './rendering-cards.js';
import { playTone, progress, audio } from './audio-actions.js'
import { saveOrEditCard, cardID, resetForm } from './edit-card.js';


const bulletProgress = document.getElementById('bulletProgress');
const containerProgress = document.getElementById('container-progress');


// Botoes de editar/mudar posição e adicionar toques
export let isAddingTones = false;
export let isChangingOrder = false;
export function setupEditButton() { 

    addTonesBtn.addEventListener('click', () => {
        isAddingTones = !isAddingTones;
        if (isAddingTones) {
            isChangingOrder = false;
            editBtnNchangeOrder.style.display = 'none';
            addTonesBtn.classList.add('active');
            addTonesBtn.innerHTML = '<img style="width: 65%; height: auto;" src="./assets/icons/white-check.png">';
            document.getElementById('addNewCard').style.display = "flex";
        } else {
            isChangingOrder = true;
            addTonesBtn.classList.remove('active');
            addTonesBtn.innerHTML = 'Adicionar Toques <span style="font-size: 3vw; margin-left: 0.5vw;">+</span>';
            editBtnNchangeOrder.style.display = 'inline-block';
            document.getElementById('addNewCard').style.display = "none";
        }
        renderTones();
    });

    editBtnNchangeOrder.addEventListener('click', () => {
        isChangingOrder = !isChangingOrder;
        if (isChangingOrder) {
            isAddingTones = false;
            addTonesBtn.style.display = 'none';
            editBtnNchangeOrder.classList.add('active');
            changeOrderImg.src = "./assets/icons/white-check.png";
            addTonesBtn.style.display = 'flex';
        } else {
            editBtnNchangeOrder.classList.remove('active');
            changeOrderImg.src = "./assets/icons/pencil.png";
            addTonesBtn.style.display = 'none';
        }
        renderTones();
    });

    let button = document.getElementById('addNewCard')

    button.addEventListener('click', () => {
    })
}



var audioUrl;
//Burocracia pra funcionar o remove eventlistener
export function playToneOnClick() {
    let audioUrl = document.getElementById('audioPlayer').src
    playTone(this.id, audioUrl, true);
}


//buracracia pra funcionar o id do elemento que vai ser editado
function funcCardId(){
    return cardID
}


export function setupForm(){

    //event listener para abrir a tela de adicionar cartão
    document.getElementById('addNewCard').addEventListener('click', () => {
        document.getElementById('shadowForm').style.display = 'block'
        document.getElementById('formContainer').style.display = 'flex'
        resetForm();
    })

    //event listener para fechar a tela de adicionar cartão
    document.getElementById('closeForm').addEventListener('click', () => {
        document.getElementById('shadowForm').style.display = 'none'
        document.getElementById('formContainer').style.display = 'none'
        document.getElementById('slider-container').style.display = 'none'
        document.getElementById('confirmDeleteCard').style.display = 'none'
    })

    //Event listener para mudar o nome do toque no preview em tempo real
    const input = document.getElementById('name');
    input.addEventListener('input', function() {
        // Atualiza o conteúdo do <span> com o valor atual do input
        document.getElementById('previewCardName').textContent = input.value;
    });


    //Mostra o nome do Arquivo Selecionado e mudar o diretorio do audio e imagem
    document.getElementById('image').addEventListener('change', function() {
        const file = this.files[0];
        const fileName = file ? file.name : 'Nenhum arquivo selecionado';
        
        // Mostra o nome do arquivo selecionado
        document.getElementById('imageFile').textContent = fileName;
    
        // Verifica se um arquivo foi selecionado e cria um URL temporário
        if (file) {
            const imgUrl = URL.createObjectURL(file);
            
            // Define a URL temporária como o backgroundImage do elemento
            document.getElementById('img0').style.backgroundImage = `url('${imgUrl}')`;
    
            // Opcional: libere o URL após o uso para evitar vazamento de memória
            this.addEventListener('load', () => URL.revokeObjectURL(imgUrl));
        }
    });


    //Event listener para mudar o audio do toque no preview em tempo real e permitir que ao clicar no card ele toque o audio
    document.getElementById('audio').addEventListener('change', function() {
        const file = this.files[0];
        const fileName = file ? file.name : 'Nenhum arquivo selecionado';
    
        // Exibe o nome do arquivo no elemento especificado
        document.getElementById('audioFile').textContent = fileName;
    
        // Verifica se um arquivo foi selecionado
        if (file) {
            audioUrl = URL.createObjectURL(file);
    
            // Define a URL do áudio no player e no card
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = audioUrl;
            audioPlayer.load(); // Carrega o novo áudio
    
            // Adiciona um eventListener para tocar o áudio ao clicar no card
            document.getElementById('card0').addEventListener('click', playToneOnClick);

            //Mostra mensagem de teste apertar no card
            document.getElementById('testPlayAudio').style.top = '10px'
    
            // Libera o URL após o uso para evitar vazamento de memória
            this.addEventListener('load', () => URL.revokeObjectURL(audioUrl));

            // Verifica se a imagem foi selecionada; caso contrário, usa a imagem padrão
            if (!document.getElementById('image').files.length) {
                document.getElementById('img0').style.backgroundImage = "url('./assets/images/cards/notamusical.png')";
            }
        }
    });
    

    //const cardID = document.querySelector('#card0 > div').id
    document.getElementById('cardForm').addEventListener('submit', async (event) => saveOrEditCard(event, funcCardId()))
    
    

}

//Hover no progress bar
containerProgress.addEventListener('mouseenter', () =>{
    bulletProgress.style.display = 'flex';
    progress.style.backgroundColor = "#007710"
})
containerProgress.addEventListener('mouseleave', () =>{
    bulletProgress.style.display = 'none';
    progress.style.backgroundColor = "#fffffe"
})

//Hover no volume
document.getElementById('volumeSliderFrame').addEventListener('mouseenter', () =>{
    document.getElementById('volumeSliderContent').style.backgroundColor = "#007710"
})
document.getElementById('volumeSliderFrame').addEventListener('mouseleave', () =>{
    document.getElementById('volumeSliderContent').style.backgroundColor = "#fffffe"
})

//Mudar volume ao clicar no slider
let isDragging = false; // Para rastrear se o mouse está sendo arrastado

function updateVolumeContent(event) {
    const container = document.getElementById('volumeSliderContainer');
    const containerHeight = container.clientHeight;

    // Calcular a posição do mouse em relação ao topo do container
    const rect = container.getBoundingClientRect();
    const clickY = event.clientY - rect.top; // Posição Y do clique em relação ao volumeSliderContainer
    const newHeightPercentage = (1 - (clickY / containerHeight)) * 100; // Converte a posição Y em uma porcentagem de altura

    // Limitar a altura a um valor mínimo de 0% e máximo de 100%
    const clampedHeight = Math.max(0, Math.min(100, newHeightPercentage));

    // Definir a altura do volumeSliderContent
    document.getElementById('volumeSliderContent').style.height = `${clampedHeight}%`;
}

// Evento de click
document.getElementById('volumeSliderContainer').addEventListener('click', updateVolumeContent);

// Eventos de mouse para arrastar
document.getElementById('volumeSliderContainer').addEventListener('mousedown', function() {
    isDragging = true; // Ativa o estado de arraste
    updateVolumeContent(event); // Atualiza imediatamente ao clicar
});

document.addEventListener('mouseup', function() {
    isDragging = false; // Desativa o estado de arraste
});

document.addEventListener('mousemove', function(event) {
    if (isDragging) {
        // Chama a função de atualizar o volume ao mover o mouse
        updateVolumeContent(event);
    }
});






  

