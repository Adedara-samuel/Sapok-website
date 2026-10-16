export const THEME_KEY = "sapok-theme";

/**
 * Runs before paint (inlined in <head>) so the saved or system theme applies with no flash.
 * A fixed string with no user input — safe to inline.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(!t){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}if(t==="light")document.documentElement.classList.add("light")}catch(e){}})();`;
