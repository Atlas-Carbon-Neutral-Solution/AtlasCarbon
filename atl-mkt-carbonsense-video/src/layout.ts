import {useVideoConfig} from 'remotion';

export type Layout = {
  width: number;
  height: number;
  portrait: boolean;
  square: boolean;
  /** Formati stretti: i contenuti si impilano e sotto restano i sottotitoli. */
  stacked: boolean;
  /** Scala tipografica: 1 sul master 1920×1080, ridotta sui formati stretti. */
  scale: number;
  /** Da px del master a px del formato corrente. */
  px: (value: number) => number;
  /** Margine di sicurezza laterale. */
  pad: number;
};

/**
 * Un solo punto di verità per il dimensionamento: le scene chiamano `px()` e
 * restano identiche in 16:9, 9:16 e 1:1.
 */
export const useLayout = (): Layout => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const square = Math.abs(width - height) < 1;
  const base = Math.min(width, height) / 1080;
  // In verticale la larghezza utile è un terzo del master: si scende poco, e
  // i titoli vanno a capo invece di rimpicciolirsi fino a diventare illeggibili.
  const scale = base * (portrait ? 0.92 : square ? 0.9 : 1);
  const px = (value: number) => value * scale;

  return {
    width,
    height,
    portrait,
    square,
    stacked: portrait || square,
    scale,
    px,
    pad: portrait ? width * 0.08 : width * 0.09,
  };
};
