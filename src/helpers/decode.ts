import { toUnicode } from 'punycode';

const decode = (encoded: string) =>
  encoded
    .split('.')
    .map(word => {
      const decoded = toUnicode(word);
      return decoded.charAt(0).toUpperCase() + decoded.slice(1);
    })
    .join(' ');

export default decode;
