/**
 * @author Jefferson Alves Reis (jefaokpta) < jefaokpta@hotmail.com >
 * Date: 11/18/24
 */

const { RtpUdpServerSocket } = require('./rtp-udp-server');
const { GoogleSpeechProvider } = require('./google-speech-provider');

// Configuration for the RTP server
const HOST = '0.0.0.0:9999';
const SWAP16 = true;
const OUTPUT_FILE = 'audios/audio.raw';


// Create an instance of RtpUdpServerSocket
const rtpServer = new RtpUdpServerSocket(HOST, SWAP16, OUTPUT_FILE);

// Configuration for Google Speech API
const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'pt-BR',
};

// Callback function to handle transcription results
const transcriptCallback = (transcript, isFinal) => {
    if (isFinal) {
        console.log(`Final transcription: ${transcript}`);
    } else {
        console.log(`Partial transcription: ${transcript}`);
    }
};

// Callback function to handle full results
const resultsCallback = (results) => {
    console.log('Full results:', results[0].alternatives[0].transcript)
};

// Create an instance of GoogleSpeechProvider
    const googleSpeechProvider = new GoogleSpeechProvider(config, rtpServer, transcriptCallback, resultsCallback);


// mantendo o servidor ativo
process.stdin.resume();