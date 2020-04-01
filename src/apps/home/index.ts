import WebFont from 'webfontloader';
import './main.scss';

const name = document.querySelector<HTMLInputElement>('#name');

const redirect = () => {
  if (name.value) {
    document.body.className = 'loading';
    setTimeout(function() {
      window.location.href =
        'http://' +
        name.value
          .replace(/^\s+|\s+$/g, '')
          .replace(/\./g, '')
          .replace(/ /g, '.') +
        '.youareamazi.ng';
    }, 2000);
  } else {
    name.className = 'shaking';
    setTimeout(function() {
      name.className = '';
    }, 820);
  }
};

const start = () => {
  name.addEventListener('keydown', function(e) {
    if (e.which === 13) redirect();
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
