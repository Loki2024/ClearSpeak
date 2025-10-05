export async function translateText(text: string, sourceLang: string, targetLang: string) {
  try {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: sourceLang.split('-')[0], // e.g. "en" from "en-US"
        target: targetLang.split('-')[0], // e.g. "es" from "es-ES"
        format: "text"
      })
    })
    const data = await res.json()
    return data.translatedText
  } catch (err) {
    console.error("Translation failed:", err)
    return text // fallback to original if translation fails
  }
}
