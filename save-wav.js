/**
 * @author Jefferson Alves Reis (jefaokpta) < jefaokpta@hotmail.com >
 * Date: 11/7/24
 */
const fs = require('fs');
const dgram = require('dgram');
const DatagramStream = require('datagram-stream');
const wav = require('wav');

const PORT = 5000;
const HOST = '0.0.0.0';
const OUTPUT_FILE = 'audios/audio.wav';

// Cria um socket UDP
const server = dgram.createSocket('udp4');

// Cria um stream de datagramas
const stream = new DatagramStream();

// Cria um buffer de escrita para o arquivo de saída WAV
const fileStream = fs.createWriteStream(OUTPUT_FILE);
const wavWriter = new wav.FileWriter(fileStream, {
    sampleRate: 8000, // Taxa de amostragem para uLaw
    channels: 1, // Áudio mono
    bitDepth: 8, // Profundidade de bits para uLaw
    audioFormat: 7 // Formato de áudio para uLaw
});

// Conecta o stream de datagramas ao stream de escrita do arquivo WAV
stream.pipe(wavWriter);

// Evento de mensagem recebida
server.on('message', (msg) => {
    // Remove o cabeçalho RTP (12 bytes)
    const audioData = msg.slice(12);
    // Escreve os dados de áudio no stream de datagramas
    stream.write(audioData);
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