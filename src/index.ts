import axios from 'axios'
import * as cheerio from 'cheerio'

import { DisplayPattern } from './terminal-styles'

interface MeaningItem {
  definition: string
  examples: string[]
}

interface MeaningEntry {
  PoS: string
  meaningItems: MeaningItem[]
}

interface WordEntry {
  spelling: string
  pronunciation?: string
  brief: MeaningEntry | null
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
    sectionTitle: DisplayPattern
  }
}

interface DictionaryOptions {
  dictionary: 'Merriam-Webster'
  word: string
}

type ArgvOptions = DictionaryOptions | {
  dictionary: 'help' | 'version'
}

function mw_url (word: string): string {
  const urlTemplate = 'https://www.merriam-webster.com/dictionary/'
  return urlTemplate + word
}

function mw_parse (html: string): WordEntry {
  const $ = cheerio.load(html)

  $('div.more_defs').remove() // Remove kids definition, which also contains div.entry-header
  const PoSList: string[] = $('div.entry-header').find('span.fl a').map((_, el) => $(el).text()).get()
  const spelling = $('.hword').first().text()
  const pronunciation = $('span.pr').first().text().trim()

  const parse_from_dt = (_: number, el: cheerio.Element) => ({
    definition: $(el).children('.dtText').first().text(),
    examples: $(el).children('.ex-sent').map((_, el) => $(el).text()).get() as string[]
  })

  /**
   * Assuming each word page has at most one essential meaning section.
   * (It is possible that there may be one essential section for each PoS,
   * but I have not found any such examples.)
   */
  const essentials = $('div.learners-essential-meaning span.dt').map(parse_from_dt).get() as MeaningItem[]
  const brief = essentials.length ? {
    PoS: PoSList[0],
    meaningItems: essentials
  } : null

  const meanings = $('div[id^=dictionary-entry-]').map((i, el) => ({
    PoS: PoSList[i],
    meaningItems: $(el).find('span.dt').map(parse_from_dt).get()
  })).get() as MeaningEntry[]

  return {
    spelling,
    pronunciation,
    brief,
    meanings
  }
}

function show_word (entry: WordEntry, config: DisplayConfig = {
  exampleCount: 2,
  displayPattern: {
    PoS: (new DisplayPattern()).italic().bold().foreground('BRIGHT_WHITE'),
    definition: new DisplayPattern(),
    examples: new DisplayPattern(),
    index: new DisplayPattern(),
    pronunciation: new DisplayPattern().center(),
    spelling: (new DisplayPattern()).foreground('BRIGHT_WHITE').bold().center(),
    sectionTitle: (new DisplayPattern()).center().background('BRIGHT_YELLOW').foreground('BLACK')
  }
}): void {
  const show_meaning_entry = (entry: MeaningEntry) => {
    displayPattern.PoS.print(entry.PoS)
    let index = 1
    for (const meaningItem of entry.meaningItems) {
    // `${index++}. ${meaning.PoS} ${meaning.definition}`
      if (index < 10) {
        process.stdout.write(' ')
      }
      displayPattern.index.print(`${index++}`, { ending: '' })

      displayPattern.definition.print(meaningItem.definition)

      const exampleCount = Math.min(config.exampleCount, meaningItem.examples.length)
      for (let i = 0; i < exampleCount; ++i) {
        process.stdout.write( (i === 0) ? '    eg. ' : '        ')
        displayPattern.examples.print(meaningItem.examples[i])
      }
      console.log()
    }
  }
  const displayPattern = config.displayPattern
  displayPattern.spelling.print(entry.spelling)
  displayPattern.pronunciation.print(`/${entry.pronunciation}/`)
  console.log()

  if (entry.brief) {
    displayPattern.sectionTitle.print('Brief Meaning')
    show_meaning_entry(entry.brief)
  }

  displayPattern.sectionTitle.print('Full Meaning')
  entry.meanings.forEach(meaningEntry => show_meaning_entry(meaningEntry))
}



function parse_arguments (): ArgvOptions {
  // TODO: parse dictionary
  // TODO: verbose
  const flags = process.argv.slice(2)
  const abbrPairs = [
    ['-h', '--help'],
    ['-V', '--version']
  ]
  abbrPairs.forEach(abbrPair => {
    if (flags.includes(abbrPair[0])) {
      flags.unshift(abbrPair[1]) // the last one of flags is the word to look up
    }
  })

  if (flags.includes('--help')) {
    return {
      dictionary: 'help'
    }
  }
  if (flags.includes('--version')) {
    return {
      dictionary: 'version'
    }
  }
  return {
    dictionary: 'Merriam-Webster',
    word: flags[flags.length - 1]
  }
}

function show_help (): void {
  // TODO: help content
  console.log('Sorry, no help at present.')
}

function show_version (): void {
  console.log('Dictionary-cli v0.0.1')
}

async function handle_search (option: DictionaryOptions): Promise<void> {
  const html: string = await axios.get(mw_url(option.word)).then(res => res.data)
  const wordEntry = mw_parse(html)
  show_word(wordEntry)
}

async function main () {
  const option = parse_arguments()
  switch (option.dictionary) {
  case 'help':
    show_help()
    break
  case 'version':
    show_version()
    break
  default:
    await handle_search(option)
    break
  }
}

main()
