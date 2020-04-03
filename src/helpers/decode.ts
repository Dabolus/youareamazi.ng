import { decode as decodeFromPunycode } from 'punycode';

const decode = (encoded: string) => {
  let decodedString = encoded;

  // If the string is an IDN, then we need to decode it using punycode
  if (decodedString.startsWith('xn--')) {
    try {
      decodedString = decodeFromPunycode(encoded.slice(4));
    } catch {}
  }

  return (
    decodedString
      // Split the string into words separated by a dash
      .split('-')
      // Remove the empty words (i.e. when there are multiple adjacent dashes)
      .filter(Boolean)
      // Capitalize each word
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      // Join them back together with a space
      .join(' ')
  );
};

export default decode;
