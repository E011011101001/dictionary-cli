import axios from 'axios'
import * as cheerio from 'cheerio'

interface MeaningEntry {
  PoS?: string
  definition: string
  examples?: string[]
}

interface WordEntry {
  spelling: string
  pronunciation?: string
  brief?: MeaningEntry[]
}

interface DisplayConfig {
  exampleCount: number
}

function mw_url (word: string): string {
  const urlTemplate = 'https://www.merriam-webster.com/dictionary/'
  return urlTemplate + word
}

function mw_parse (html: string): WordEntry {
  const $ = cheerio.load(html)
  const spelling = $('.hword').first().text()
  const pronunciation = $('span.pr').first().text()
  const essentials = $('div.learners-essential-meaning span.dt')
    .map((_, el) => ({
      PoS: $('span.fl a').first().text(),
      definition: $(el).children('.dtText').first().text(),
      examples: $(el).children('.ex-sent').map((_, el) => $(el).text()).get() as string[]
    }))
    .get() as MeaningEntry[]


  // const entries = $('div[id^=dictionary-entry-]')
  // console.log(entries)
  return {
    spelling,
    pronunciation,
    brief: essentials
  }
}

function show_word (entry: WordEntry, config: DisplayConfig): void {
  console.log(entry.spelling)
  console.log(`/${entry.pronunciation}/`)

  for (const i in entry.brief) {
    console.log(`${i}. ${entry.brief[i].PoS} ${entry.brief[i].definition}`)
    const exampleCount = Math.min(config.exampleCount, entry.brief[i].examples.length)
    if (exampleCount) {
      let examplesToShow = 'eg. '
      for (let j = 0; j < exampleCount; ++j) {
        examplesToShow += entry.brief[i].examples[j] + '\n    '
      }
      console.log(examplesToShow)
    }
  }
}

async function main () {
  const word = 'word'
  const html: string = await axios.get(mw_url(word)).then(res => res.data)
  const wordEntry = mw_parse(html)
  show_word(wordEntry, {
    exampleCount: 2
  })
}

main()
