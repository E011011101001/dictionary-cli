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
  const displayPattern = config.displayPattern
  displayPattern.spelling.print(entry.spelling)
  displayPattern.pronunciation.print(`/${entry.pronunciation}/`)
  console.log('')

  let index = 1
  for (const meaning of entry.brief) {
    // `${index++}. ${meaning.PoS} ${meaning.definition}`
    displayPattern.index.print(`${index++}`, { ending: '' })
    process.stdout.write('. ')
    if (meaning.PoS) {
      displayPattern.PoS.print(meaning.PoS, { ending: '' })
      process.stdout.write(' ')
    }
    displayPattern.definition.print(meaning.definition)

    const exampleCount = Math.min(config.exampleCount, meaning.examples.length)
    for (let i = 0; i < exampleCount; ++i) {
      process.stdout.write( (i === 0) ? 'eg. ' : '    ')
      displayPattern.examples.print(meaning.examples[i])
    }
    console.log('')
  }
}

async function main () {
  const word = 'word'
  const html: string = await axios.get(mw_url(word)).then(res => res.data)
  const wordEntry = mw_parse(html)
  show_word(wordEntry)
}

main()
