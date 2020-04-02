import { decode as decodeFromPunycode } from 'punycode';

const decode = (encoded: string) =>
  encoded
    .split('.')
    .map(word => {
      let decodedWord = word;

      try {
        decodedWord = decodeFromPunycode(word);
      } catch {}

      return decodedWord.charAt(0).toUpperCase() + decodedWord.slice(1);
    })
    .join(' ');

export default decode;
