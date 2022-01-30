import WebFont from 'webfontloader';
import { shuffle, fitText } from './helpers';
import phrases from './phrases.yml';

const shuffledPhrases = shuffle(phrases);
const textElement = document.querySelector<HTMLDivElement>('#text')!;
const authorElement = document.querySelector<HTMLDivElement>('#author')!;
const name = document.querySelector<HTMLHeadingElement>('#name')!;
let domReady = false;
let fontsReady = false;
let index = 0;

const loop = () => {
  textElement.className = 'hidden';
  authorElement.className = 'hidden';

  setTimeout(() => {
    const {
      [index]: [text, author],
    } = shuffledPhrases;

    textElement.textContent = text;
    authorElement.textContent = author;

    textElement.className = '';
    authorElement.className = '';

    index = (index + 1) % shuffledPhrases.length;
  }, 1000);
};

const start = () => {
  if (!domReady || !fontsReady) {
    return;
  }

  fitText(name);
  document.body.className = '';

  setTimeout(() => {
    loop();
    setInterval(loop, 12000);
  }, 9000);
};

WebFont.load({
  google: {
    families: ['Google Sans:bold', 'Roboto', 'Homemade Apple'],
  },
  active: () => {
    fontsReady = true;
    start();
  },
});

if (typeof window !== 'undefined' && window.document) {
  domReady = true;
  start();
} else {
  window.onload = () => {
    domReady = true;
    start();
  };
}
