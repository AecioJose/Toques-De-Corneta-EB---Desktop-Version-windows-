import { volumeRead } from './edit-card.js';

const leftOutput = document.getElementById('barLeft');
const rightOutput = document.getElementById('barRight');

const currentTimeElem = document.getElementById('current-time');
const totalTimeElem = document.getElementById('total-time');
const containerprogress = document.getElementById('container-progress');
export const progress = document.getElementById('progress');
const playPause = document.getElementById('playPause');

export let audio = new Audio();
let audioContext;
let analyser;
var oldCard = null;

function getFileName(string) {
    let index = string.lastIndexOf("/");
    return string.substring(index + 1).toLowerCase();
}

async function setupAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;

        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }
}

function getByteFrequencyData(analyser) {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
}

function getMedia(dataArray) {
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    return sum / dataArray.length;
}

function mapToRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Formata o tempo em minutos e segundos
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Loop para atualizar e imprimir os valores LR e progressBar enquanto o áudio estiver tocando
function updateLRvaluesAndProgressBar() {
    if (!audio.paused) {
        const data = getByteFrequencyData(analyser);
        const leftData = data.slice(2, data.length / 2); // Canal esquerdo
        const rightData = data.slice(5, data.length / 2); // Canal direito

        const leftMediaValue = getMedia(leftData);
        const rightMediaValue = getMedia(rightData);

        const mappedLeftValue = Math.round(mapToRange(leftMediaValue, 0, 255, 5, 100));
        const mappedRightValue = Math.round(mapToRange(rightMediaValue, 0, 255, 5, 100));

        //console.log(`Left Value: ${mappedLeftValue}, Right Value: ${mappedRightValue}`);
        leftOutput.style.height = `${mappedLeftValue}%`
        rightOutput.style.height = `${mappedRightValue}%`

        //ProgressBar in real time
        currentTimeElem.textContent = formatTime(audio.currentTime);
        progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;

        requestAnimationFrame(updateLRvaluesAndProgressBar);
    }
}

export async function playTone(id, audioPath, jump=false) {

    if(!jump){//jump serve pra pular a verificação do arquivo se a função tiver sendo chamado pelo card de exemplo
        // Verifica se o arquivo de áudio existe antes de continuar
        try {
            const response = await fetch(audioPath, { method: 'HEAD' });
            if (!response.ok) {
                console.error("Arquivo de áudio não encontrado:", audioPath);
                return; // Interrompe a execução se o arquivo não existir
            }
        } catch (error) {
            console.error("Erro ao verificar o arquivo de áudio:", error);
            return; // Interrompe a execução se houver um erro
        }

        const volume = volumeRead(id) / 100; // Converte o volume de 0-100 para 0-1
        audio.volume = volume; // Define o volume do áudio
    }
    
    
    

    const card = document.getElementById(id);

    // Impede que o card mude enquanto o áudio ainda está tocando
    if (!audio.paused && card !== oldCard) {
        return;
    }

    // Quando o áudio terminou e o card é diferente do último, reseta a cor do último card
    if (audio.paused && card !== oldCard) {
        if (oldCard) {//se oldCard existir
            oldCard.style.borderColor = ""; // Reseta para a cor padrão
        }
        oldCard = card; // Atualiza oldCard para o novo card
    }

    await setupAudioContext();

    // Verifica se o áudio atual já está pausado e o reinicia do início
    if (!audio.paused) {
        //console.log("Is Playing");
        return;
    } else if (getFileName(audio.src) === getFileName(audioPath) && audio.paused) {
        audio.currentTime = 0;
        audio.play();
        return;
    }

    audio.src = audioPath; // Define o novo áudio

    // Colore o card atual de verde
    card.style.borderColor = "#1ed75f";
    audio.play();

}


// Evento para tocar o áudio quando estiver pronto
audio.addEventListener('canplay', (event) => {
    totalTimeElem.textContent = formatTime(audio.duration);
    event.target.play();
});

// Evento para pausar o áudio ao pressionar a barra de espaço
const playPauseAudio = () => {
    if (!audio.paused) {
        audio.pause();
    } else {
        audio.play();
    }
};

// Evento para pausar/reproduzir o áudio ao pressionar a barra de espaço
document.addEventListener('keydown', (e) => {
    // Verifica se o foco não está em um campo de entrada
    const isInputFocused = document.activeElement.tagName === 'INPUT';
    
    if (e.code === 'Space' && !isInputFocused) {
        e.preventDefault();
        playPauseAudio();
    }
});

// Evento para pausar/reproduzir o áudio ao clicar no elemento
const playPauseButton = document.getElementById('playPause');
playPauseButton.addEventListener('click', playPauseAudio);


// Evento para atualizar o progress e o LR durante a reprodução
audio.addEventListener('timeupdate', () => {
    if (!audio.paused) {
        //Muda o botão play e pause
        playPause.style.backgroundImage = 'url("./assets/icons/pause.png")';
        // Atualiza os valores do LR e a progressBar
        updateLRvaluesAndProgressBar();
        //console.log('audio tocando')
    } else {
        playPause.style.backgroundImage = 'url("./assets/icons/play.png")';
    }
});

containerprogress.addEventListener('click', (event) => {
    const rect = containerprogress.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const totalWidth = rect.width;
    const percentage = offsetX / totalWidth;
    audio.currentTime = percentage * audio.duration;

    if (audio.paused) {
        // Atualiza apenas a barra de progresso
        progress.style.width = `${percentage * 100}%`;
        currentTimeElem.textContent = formatTime(audio.currentTime);
    }
});
