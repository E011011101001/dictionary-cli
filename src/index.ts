import axios from 'axios'
import * as cheerio from 'cheerio'

import { DisplayPattern } from './terminal-styles'

interface MeaningEntry {
  PoS?: string
  definition: string
  examples: string[]
}

interface WordEntry {
  spelling: string
  pronunciation?: string
  brief: MeaningEntry[]
  meanings: MeaningEntry[]
}

interface DisplayConfig {
  exampleCount: number
  displayPattern: {
    spelling: DisplayPattern
    pronunciation: DisplayPattern
    index: DisplayPattern
    PoS: DisplayPattern
    definition: DisplayPattern
    examples: DisplayPattern
  }
}

function mw_url (word: string): string {
  const urlTemplate = 'https://www.merriam-webster.com/dictionary/'
  return urlTemplate + word
}

function mw_parse (html: string): WordEntry {
  const $ = cheerio.load(html)
  const spelling = $('.hword').first().text()
  const pronunciation = $('span.pr').first().text().trim()

  const parse_from_dt = (_: number, el: cheerio.Element) => ({
    PoS: $('span.fl a').first().text(),
    definition: $(el).children('.dtText').first().text(),
    examples: $(el).children('.ex-sent').map((_, el) => $(el).text()).get() as string[]
  })
  const essentials = $('div.learners-essential-meaning span.dt')
    .map(parse_from_dt)
    .get() as MeaningEntry[]


  const entries = $('div[id^=dictionary-entry-] span.dt')
    .map(parse_from_dt)
    .get() as MeaningEntry[]

  return {
    spelling,
    pronunciation,
    brief: essentials,
    meanings: entries
  }
}

function show_word (entry: WordEntry, config: DisplayConfig = {
  exampleCount: 2,
  displayPattern: {
    PoS: (new DisplayPattern()).italic(),
    definition: new DisplayPattern(),
    examples: new DisplayPattern(),
    index: new DisplayPattern(),
    pronunciation: new DisplayPattern(),
    spelling: (new DisplayPattern()).foreground('BRIGHT_WHITE').bold()
  }
}): void {
  const show_meaning_entry = (entries: MeaningEntry[]) => {
    let index = 1
    for (const meaning of entries) {
    // `${index++}. ${meaning.PoS} ${meaning.definition}`
      if (index < 10) {
        process.stdout.write(' ')
      }
      displayPattern.index.print(`${index++}`, { ending: '' })

      process.stdout.write('. ')
      if (meaning.PoS) {
        displayPattern.PoS.print(meaning.PoS, { ending: '' })
        process.stdout.write(' ')
      }
      displayPattern.definition.print(meaning.definition)

      const exampleCount = Math.min(config.exampleCount, meaning.examples.length)
      for (let i = 0; i < exampleCount; ++i) {
        process.stdout.write( (i === 0) ? '    eg. ' : '         ')
        displayPattern.examples.print(meaning.examples[i])
      }
      console.log()
    }
  }
  const displayPattern = config.displayPattern
  displayPattern.spelling.print(entry.spelling)
  displayPattern.pronunciation.print(`/${entry.pronunciation}/`)
  console.log()

  console.log('-+-+-+-+-+- Brief Meaning -+-+-+-+-+-')
  show_meaning_entry(entry.brief)

  console.log('-+-+-+-+-+- Full Meaning -+-+-+-+-+-')
  show_meaning_entry(entry.meanings)
}

async function main () {
  const word = 'word'
  const html: string = await axios.get(mw_url(word)).then(res => res.data)
  const wordEntry = mw_parse(html)
  show_word(wordEntry)
}

main()
