import { saveData, cards, learnCards, renderTones, playlists } from './rendering-cards.js';
import { audio } from './audio-actions.js'
import { playToneOnClick } from './event-listeners.js';

export var learnMode = false;
var isEditingCard = false
export var cardID = ''


export function editCard(event, me){
    event.stopPropagation(); // impede que o evento "suba" para o elemento pai

    isEditingCard = true

    const id = me.id
    const nameCard = me.name
    const imagePath = me.image
    const audioPath = me.audio


    //Ativar Tela de editar cards
    document.getElementById('shadowForm').style.display = 'block'
    document.getElementById('formContainer').style.display = 'flex'

    //Renomear Tela de editar cards
    document.getElementById('h1text').textContent = 'Editar Cartão';
    document.getElementById('previewCardName').textContent = nameCard;
    document.getElementById('name').placeholder = nameCard;
    document.getElementById('name').removeAttribute('required');
    document.getElementById('excluirCardContainer').style.display = 'flex';
    document.getElementById('deleteCard').style.display = 'flex';
    document.getElementById('deleteCard').addEventListener('click', confirmDellCard)
    document.getElementById('img0').style.backgroundImage = `url(${imagePath})`;
    document.getElementById('audioPlayer').src = audioPath;
    document.getElementById('card0').addEventListener('click', playToneOnClick);// Adiciona um eventListener para tocar o áudio ao clicar no card
    document.getElementById('slider-container').style.display = 'flex';//Ativar volume

    //Pegar o volume do ID
    const volume = volumeRead(id);
    document.getElementById('volumeSliderContent').style.height = `${volume}%`;

    
    cardID = `${String(id)}`; //Muda ID do card pra função saveOrEditCard saber que é uma alteração no id em especifico, o saveOrEditCard é chamado no event-listeners.js ao final da função setupForm, em que a linha diz que ao apertar o botão de salvar ele chama a função saveOrEditCard
    // console.log(document.querySelector('#card0 > div').id);
    //salvar a edição--é salva atraves do event--listener que chama a função saveOrEditCard

    
}




export async function saveOrEditCard(event, id) {
    event.preventDefault();
    
    if (isEditingCard) {
        
        const cardIndex = cards.findIndex(card => card.id === id);
        if (cardIndex === -1) return;// Se o ID não for encontrado, encerra a função
        
        const card = cards[cardIndex]

        const volume = Number(volumeRead(id))

        const nameInputed = document.getElementById('name').value;
        const imagePathInputed = document.getElementById('image').files.length > 0 ? document.getElementById('image').files[0] : '';
        const audioPathInputed = document.getElementById('audio').files.length > 0 ? document.getElementById('audio').files[0] : '';
        const volumeInputed = document.getElementById('volumeSliderContent').style.height;

        // Verificações e atualizações no card

        if (nameInputed.trim()) {
            card.name = nameInputed;
        }
        if (volumeInputed !== volume) {
            card.volume = parseInt(volumeInputed); // Convertendo o valor para número, caso necessário
        }

        const saveBlob = async (file, type) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    try {
                        const sanitizeFileName = (fileName) => {
                            return fileName.replace(/\s+/g, '_').replace(/[^\w\-_\.]/g, '').toLowerCase();
                        };

                        const blobUrl = reader.result;
                        const sanitizedFileName = sanitizeFileName(file.name);

                        const savedPath = await window.electronAPI.saveFile(blobUrl, sanitizedFileName, type);
                        resolve(savedPath);
                    } catch (error) {
                        console.error(`Erro ao salvar o arquivo ${type}:`, error);
                        reject(error);
                    }
                };
                reader.readAsDataURL(file);
            });
        };

        // Salva arquivos se foram adicionados e atualiza as chaves
        if (audioPathInputed) {
            console.log('volume no json é diferente do que ta aq')
            const audioPath = (await saveBlob(audioPathInputed, 'audio')).replace(/\\/g, '/');
            card.audio = audioPath;
        }
        if (imagePathInputed) {
            console.log('volume no json é diferente do que ta aq')
            const imagePath = (await saveBlob(imagePathInputed, 'image')).replace(/\\/g, '/');
            card.image = imagePath;
        }

    } else {// Lógica para adicionar um novo card
        const name = document.getElementById('name').value;
        let audioFile, imageFile;

        // Verifica se o áudio foi selecionado
        if (document.getElementById('audio').files.length > 0) {
            audioFile = document.getElementById('audio').files[0];
        } else {
            alert('Selecione um arquivo de áudio antes de salvar');
            return;
        }

        // Verifica se a imagem foi selecionada; caso contrário, usa o caminho da imagem padrão
        if (document.getElementById('image').files.length > 0) {
            imageFile = document.getElementById('image').files[0];
        } else {
            imageFile = './assets/images/cards/notamusical.png';
        }

        // Função auxiliar para salvar arquivos blob
        const saveBlob = async (file, type) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    try {
                        // Função auxiliar para limpar o nome do arquivo
                        const sanitizeFileName = (fileName) => {
                            return fileName
                                .replace(/\s+/g, '_') // Substitui espaços por underscores
                                .replace(/[^\w\-_\.]/g, '') // Remove caracteres especiais, permitindo letras, números, underscores, traços e pontos
                                .toLowerCase(); // Opcional: transforma o nome em minúsculas
                        };

                        const blobUrl = reader.result;

                        // Chama a função para limpar o nome do arquivo
                        const sanitizedFileName = sanitizeFileName(file.name);

                        const savedPath = await window.electronAPI.saveFile(blobUrl, sanitizedFileName, type);
                        resolve(savedPath);
                    } catch (error) {
                        console.error(`Erro ao salvar o arquivo ${type}:`, error);
                        reject(error);
                    }
                };
                reader.readAsDataURL(file);
            });
        };

        // Salva o áudio e define o caminho da imagem (se necessário) 
        const audioPath = (await saveBlob(audioFile, 'audio')).replace(/\\/g, '/');
        const imagePath = typeof imageFile === 'string' ? imageFile : (await saveBlob(imageFile, 'image')).replace(/\\/g, '/');

        // Adiciona o novo card com ID único
        const newCard = {
            id: `card-${Date.now()}`,
            name: name,
            image: imagePath,
            audio: audioPath,
            volume: 50
        };

        if (learnMode) {
            learnCards.push(newCard);
        } else {
            cards.push(newCard);
        }
    }

    await saveData();

    resetForm()

    if(isEditingCard){
        //Fechar aba de editar
        document.getElementById('shadowForm').style.display = 'none'
        document.getElementById('formContainer').style.display = 'none'
        document.getElementById('slider-container').style.display = 'none';//Desativar volume card, todos os audio sao salvos com 100% de audio se quiser baixar depois tem como na edição
        isEditingCard = false
    }

    renderTones();
}


export function volumeRead(id){

    let index = cards.findIndex(allCards => allCards.id === id)
    let card = cards[index]

    let value = card.volume;

    // console.log(volume)
    return Number(value)
}

export function resetForm(){
    // Limpar o formulário e as configurações de pré-visualização
    document.getElementById('h1text').textContent = 'Criar Novo Cartão';
    document.getElementById('name').setAttribute('required', 'required');
    document.getElementById('name').placeholder = 'Sentido';
    document.getElementById('excluirCardContainer').style.display = 'none';
    document.getElementById('cardForm').reset();
    document.getElementById('audio').value = ''; 
    document.getElementById('image').value = '';
    document.getElementById('audioFile').textContent = 'Nenhum Arquivo Selecionado';
    document.getElementById('imageFile').textContent = 'Nenhum Arquivo Selecionado';
    document.getElementById('testPlayAudio').style.top = '-60px';
    document.getElementById('img0').style.backgroundImage = 'url("./assets/images/cards/sentido.png")';
    document.getElementById('previewCardName').textContent = 'Sentido';

    // Reseta o áudio para não tocar novamente após importar
    audio.src = '';
    audio.load();
    document.getElementById('audioPlayer').src = '';
    document.getElementById('card0').style.border = '2px solid rgba(255, 255, 255, 0.2)';
    document.getElementById('card0').removeEventListener('click', playToneOnClick);
}

function confirmDellCard(){
    document.getElementById('deleteCard').style.display = 'none';
    document.getElementById('confirmDeleteCard').style.display = 'block';

    document.getElementById('cancelDellCard').addEventListener('click', () =>{
        document.getElementById('deleteCard').style.display = 'flex';
        document.getElementById('confirmDeleteCard').style.display = 'none';
    })

    document.getElementById('simDellCard').addEventListener('click', () =>{
        //Encontra o cartão apartir do id do shadowCard
        let thisCardId = cardID

        //Exclui o elemento de cards e de todas as playlists existentes
        const cardIndex = cards.findIndex(card => card.id === thisCardId);// Encontra o índice do cartão em `cards` pelo ID
        
        if (cardIndex !== -1) { // Confirma que o cartão foi encontrado
            console.log(cards[cardIndex]); // Exibe o cartão a ser excluído no console

            // Remove o cartão do array `cards`
            cards.splice(cardIndex, 1);

            // Para cada playlist, remova o elemento `thisCardId` de `cardsID`
            playlists.forEach(playlist => {
                playlist.cardsID = playlist.cardsID.filter(card => card !== thisCardId);
            });

            // Atualize o display ou faça qualquer ação adicional necessária após a exclusão
            console.log("Cartão removido com sucesso!");
        } else {
            console.log("Cartão não encontrado!");
        }

        saveData();
        resetForm()//Reseta o formulario/tela de editar/criar
        renderTones()

        //Fecha o cardForm
        document.getElementById('shadowForm').style.display = 'none'
        document.getElementById('formContainer').style.display = 'none'
        document.getElementById('slider-container').style.display = 'none'
    })
}