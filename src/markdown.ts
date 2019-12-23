import { createIndentedFilter } from 'indented-filter'
import h from 'hyperscript'

declare global {
  interface Window {
    revealMd: any;
    speak(s: string, lang?: string): void;
  }
}

window.revealMd.plugins.markdown.speak = {
  type: 'lang',
  filter: createIndentedFilter('^^speak', (s, attrs) => {
    return h('.speak', {attrs: {
      'onclick': `window.speak('${attrs.s || s}', ${attrs.lang || ''})`
    }}, s).outerHTML
  })
}

export function speak(s: string, lang?: string) {
  lang = lang || "zh-CN";

  let trueLang = "";

  const voices = speechSynthesis.getVoices();
  const [la1, la2] = lang.split(/-_/);
  if (la2) {
    const langRegex = new RegExp(`${la1}[-_]${la2}`, "i");
    const matchedLang = voices.filter((v) => langRegex.test(v.lang));
    if (matchedLang.length > 0) {
      trueLang = matchedLang.sort((v1, v2) => v1.localService
      ? -1 : v2.localService ? 1 : 0)[0].lang;
    }
  }
  if (!trueLang) {
    const langRegex = new RegExp(`^${la1}`, "i");
    const matchedLang = voices.filter((v) => langRegex.test(v.lang));
    if (matchedLang.length > 0) {
      trueLang = matchedLang.sort((v1, v2) => v1.localService
      ? -1 : v2.localService ? 1 : 0)[0].lang;
    }
  }

  if (trueLang) {
    const u = new SpeechSynthesisUtterance(s);
    u.lang = trueLang;
    speechSynthesis.speak(u);
  }
}

window.speak = speak;

document.body.addEventListener("keydown", (evt) => {
  if (evt.code === "KeyS") {
    const s = getSelection();
    if (s) {
      speak(s.toString());
    }
  }
});
