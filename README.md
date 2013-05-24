rockpool
========

JavaScript project to synchronise audio files. Rockpool hashes audio files by looking at the time differences. See http://youtu.be/5BqXFRQbajE for a video explanation.

There is no server side code, but for the XMLHTTP requests which load the audio files to work, you need to be running over http:// protocol, so to get started just put the files on the path of your favourite webserver and hit 'index.html'. I use

cd rockpool
python -m SimpleHTTPServer

To see spectrograms over the waveforms, look in main.js and change showSpectrograms to true.

Credits
----------
Thanks to Jens Nockert for the FFT library. https://github.com/JensNockert/fft.js
