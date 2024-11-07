/**
 * @author Jefferson Alves Reis (jefaokpta) < jefaokpta@hotmail.com >
 * Date: 11/7/24
 */
const fs = require('fs');
const dgram = require('dgram');
const DatagramStream = require('datagram-stream');
const lame = require('lame');

const PORT = 9999;
const HOST = '0.0.0.0';
const OUTPUT_FILE = 'audios/audio.mp3';

// Create a UDP socket
const server = dgram.createSocket('udp4');

// Create a datagram stream
const stream = new DatagramStream();

// Create a writable stream for the output MP3 file
const fileStream = fs.createWriteStream(OUTPUT_FILE);

// Create a LAME encoder stream
const encoder = new lame.Encoder({
    channels: 1,        // 1 channel (mono)
    bitDepth: 16,       // 16-bit samples
    sampleRate: 8000,   // 8 kHz sample rate
    bitRate: 128,       // 128 kbps MP3 bitrate
    outSampleRate: 8000,
    mode: lame.MONO     // Mono mode
});

// Pipe the datagram stream to the LAME encoder, then to the file stream
stream.pipe(encoder).pipe(fileStream);

// Handle incoming messages
server.on('message', (msg) => {
    // Remove the RTP header (12 bytes)
    const audioData = msg.slice(12);
    // Write the audio data to the datagram stream
    stream.write(audioData);
});

// Handle server errors
server.on('error', (err) => {
    console.error(`Server error: ${err}`);
    server.close();
});

// Handle server start
server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening mp3 on ${address.address}:${address.port}`);
});

// Start the server
server.bind(PORT, HOST);