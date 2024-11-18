const fs = require('fs');
const dgram = require('dgram');
const DatagramStream = require('datagram-stream');

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

    // Escreve os dados de áudio no stream de reconhecimento
    recognizeStream.write(audioData);
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