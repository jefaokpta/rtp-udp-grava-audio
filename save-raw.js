const fs = require('fs');
const dgram = require('dgram');
const DatagramStream = require('datagram-stream');
const { GoogleSpeechProvider } = require('./google-speech-provider');

const PORT = process.argv[2] || 9999;
const HOST = '0.0.0.0';
const OUTPUT_FILE = 'audios/audio.raw';

// Cria um socket UDP
const server = dgram.createSocket('udp4');

// Cria um stream de datagramas
const stream = new DatagramStream();

// Cria um stream de escrita para o arquivo de saída
const fileStream = fs.createWriteStream(OUTPUT_FILE, {
    autoClose: true
});

// Conecta o stream de datagramas ao stream de escrita do arquivo
stream.pipe(fileStream);

// Configuração do Google Speech API
const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'pt-BR',
};

// Função de callback para transcrição
const transcriptCallback = (transcript, isFinal) => {
    if (isFinal) {
        console.log(`Transcrição final: ${transcript}`);
    } else {
        console.log(`Transcrição parcial: ${transcript}`);
    }
};

// Função de callback para resultados completos
const resultsCallback = (results) => {
    console.log('Resultados completos:', results);
};

// Cria uma instância do GoogleSpeechProvider
const googleSpeechProvider = new GoogleSpeechProvider(config, stream, transcriptCallback, resultsCallback);

// Evento de mensagem recebida
server.on('message', (msg) => {
    // Remove o cabeçalho RTP (12 bytes)
    const audioData = msg.subarray(12);
    // Escreve os dados de áudio no stream de datagramas
    stream.write(audioData);
});

server.on('close', () => {
    if (fileStream) {
        fileStream.close();
    }
    console.log('Servidor encerrado');
});

// Evento de erro
server.on('error', (err) => {
    console.error(`Erro no servidor: ${err}`);
    server.close();
});

// Evento de inicialização do servidor
server.on('listening', () => {
    const address = server.address();
    console.log(`Servidor ouvindo em ${address.address}:${address.port}`);
});

// Inicia o servidor
server.bind(PORT, HOST);