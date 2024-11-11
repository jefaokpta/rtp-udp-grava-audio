/**
 * @author Jefferson Alves Reis (jefaokpta) < jefaokpta@hotmail.com >
 * Date: 11/7/24
 */
const fs = require('fs');
const dgram = require('dgram');
const DatagramStream = require('datagram-stream');
const provider= require('./google-speech-provider');

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

// Evento de mensagem recebida
server.on('message', (msg) => {
    // Remove o cabeçalho RTP (12 bytes)
    const audioData = msg.subarray(12);
    //swap 16 bits se codec for SLIN pq SLIN é big-endian e providers STT esperam little-endian
    // if (this.swap16) {
    //     buf.swap16();
    // }
    // Escreve os dados de áudio no stream de datagramas
    stream.write(audioData);
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'pt-BR',
    };
    new provider.GoogleSpeechProvider(config, server, (transcript, isFinal) => {
        console.log(transcript);
    }, (results) => {
        console.log(results);
    })
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