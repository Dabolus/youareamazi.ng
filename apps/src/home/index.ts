import WebFont from 'webfontloader';
import { encode as encodeToPunycode } from 'punycode';

const name = document.querySelector<HTMLInputElement>('#name')!;

const VALID_ASCII_REGEX = /^[a-z0-9 \-]+$/i;

const isValid = (str: string) => {
  const arr = str.split('');
  return arr.every(
    char => VALID_ASCII_REGEX.test(char) || char.charCodeAt(0) > 127,
  );
};

const encode = (pretty: string) => {
  const normalized = pretty
    // Remove leading and trailing whitespaces
    .trim()
    // Replace whitespaces with dashes and remove the extra ones
    .replace(/\s+/g, '-')
    // Make it all lower case
    .toLowerCase();

  // If the string is only ASCII we return it as it is
  // Otherwise, we need to encode it using punycode and make it an IDN
  return VALID_ASCII_REGEX.test(normalized)
    ? normalized
    : `xn--${encodeToPunycode(normalized)}`;
};

const redirect = () => {
  if (name.value && isValid(name.value)) {
    document.body.className = 'loading';
    setTimeout(() => {
      /* EXAMPLE RESULT */
      // Input value:          Foo Bar
      // RESULT:               https://foo_bar.youareamazi.ng
      window.location.href = `https://${encode(name.value)}.youareamazi.ng`;
    }, 2000);
  } else {
    name.className = 'shaking';
    setTimeout(() => {
      name.className = '';
    }, 820);
  }
};

const start = () => {
  name.addEventListener('keydown', event => {
    if (!isValid(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      redirect();
    }
  });
  document.getElementById('start')!.addEventListener('click', redirect);
};

WebFont.load({
  google: {
    families: ['Google Sans:bold'],
  },
  active: start,
});

if (typeof window !== 'undefined' && window.document) {
  start();
} else {
  window.addEventListener('load', start);
}
