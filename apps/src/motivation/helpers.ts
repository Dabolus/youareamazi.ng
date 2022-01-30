export const random =
  'crypto' in window || 'msCrypto' in window
    ? () => {
        const arr = new Uint32Array(1);
        (window.crypto || (window as any).msCrypto).getRandomValues(arr);
        // This jazz is necessary to translate from a random integer to a floating point from 0 to 1
        return arr[0] / (0xffffffff + 1);
      }
    : Math.random;

export const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};

export const fitText = (
  elementOrElements: HTMLElement | HTMLElement[],
  compressor: number = 1,
  {
    minFontSize = -Infinity,
    maxFontSize = Infinity,
  }: {
    minFontSize?: number;
    maxFontSize?: number;
  } = {},
) => {
  const fit = (element: HTMLElement) => {
    const resizer = () => {
      element.style.fontSize =
        Math.max(
          Math.min(element.clientWidth / (compressor * 10), maxFontSize),
          minFontSize,
        ) + 'px';
    };

    // Call once to set.
    resizer();

    window.addEventListener('resize', resizer);
    window.addEventListener('orientationchange', resizer);
  };

  if (Array.isArray(elementOrElements)) {
    elementOrElements.forEach(element => fit(element));
  } else {
    fit(elementOrElements);
  }

  // return set of elements
  return elementOrElements;
};
