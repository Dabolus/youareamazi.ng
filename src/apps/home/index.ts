import WebFont from 'webfontloader';
import './main.scss';
import { encode as encodeToPunycode } from 'punycode';

const name = document.querySelector<HTMLInputElement>('#name');

const encode = (pretty: string) =>
  pretty
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => encodeToPunycode(word.toLowerCase()))
    .join('.');

const redirect = () => {
  if (name.value) {
    document.body.className = 'loading';
    setTimeout(() => {
      /* EXAMPLE RESULT */
      // Input value:          Foo Bar
      // RESULT:               https://foo.bar.youareamazi.ng
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
    if (event.key === 'Enter') {
      redirect();
    }
  });
  document.getElementById('start').addEventListener('click', redirect);
};

WebFont.load({
  google: {
    families: ['Product Sans'],
  },
  active: start,
});

if (typeof window !== 'undefined' && window.document) {
  start();
} else {
  window.addEventListener('load', start);
}
