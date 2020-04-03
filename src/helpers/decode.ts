import { decode as decodeFromPunycode } from 'punycode';

const decode = (encoded: string) =>
  encoded
    .split('_')
    .map(word => {
      let decodedWord = word;

      if (decodedWord.startsWith('xn--')) {
        try {
          decodedWord = decodeFromPunycode(word.slice(4));
        } catch {}
      }

      return decodedWord.charAt(0).toUpperCase() + decodedWord.slice(1);
    })
    .join(' ');

export default decode;
