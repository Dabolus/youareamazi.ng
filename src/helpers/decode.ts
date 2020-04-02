import { decode as decodeFromPunycode } from 'punycode';

const decode = (encoded: string) =>
  encoded
    .split('.')
    .map(word => {
      const decoded = decodeFromPunycode(word);
      return decoded.charAt(0).toUpperCase() + decoded.slice(1);
    })
    .join(' ');

export default decode;
