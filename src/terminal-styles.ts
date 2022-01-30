const styleCodes = {
  BOLD            : ';1',
  ITALIC          : ';3',
  UNDERLINE       : ';4',
  FG              : ';38;5;',
  BG              : ';48;5;',
}

const colorCodes = {
  BLACK           : '0',
  RED             : '1',
  GREEN           : '2',
  YELLOW          : '3',
  BLUE            : '4',
  MAGENTA         : '5',
  CYAN            : '6',
  WHITE           : '7',
  BRIGHT_BLACK    : '8',
  BRIGHT_RED      : '9',
  BRIGHT_GREEN    : '10',
  BRIGHT_YELLOW   : '11',
  BRIGHT_BLUE     : '12',
  BRIGHT_MAGENTA  : '13',
  BRIGHT_CYAN     : '14',
  BRIGHT_WHITE    : '15',
} as { [key: string]: string }

export class DisplayPattern {
  _bold!: boolean
  _italic!: boolean
  _underline!: boolean
  _foreground!: number | string
  _background!: number | string

  constructor () {
    this._bold = false
    this._italic = false
    this._underline = false
    this._foreground = 'WHITE'
    this._background = 'BLACK'
  }

  bold () {
    this._bold = true
  }

  public italic () {
    this._italic = true
  }

  public underline () {
    this._underline = true
  }

  public set foreground (color: number | string) {
    this._foreground = color
  }

  public set background (color: number | string) {
    this._background = color
  }
}

export function reset_display_pattern (): void {
  process.stdout.write('\033[m')
}

export function set_display_pattern (pattern: DisplayPattern): void {
  let sequence = ''
  if (pattern._bold) {
    sequence += styleCodes.BOLD
  }
  if (pattern._italic) {
    sequence += styleCodes.ITALIC
  }
  if (pattern._underline) {
    sequence += styleCodes.UNDERLINE
  }

  sequence += styleCodes.FG
  if (typeof pattern._foreground === 'number') {
    sequence += pattern._foreground.toString()
  } else if (Object.keys(colorCodes).indexOf(pattern._foreground) >= 0) {
    sequence += colorCodes[pattern._foreground]
  } else {
    console.error(`Color '${pattern._foreground}' not valid.`)
  }

  sequence += styleCodes.BG
  if (typeof pattern._background === 'number') {
    sequence += pattern._background.toString()
  } else if (Object.keys(colorCodes).indexOf(pattern._background) >= 0) {
    sequence += colorCodes[pattern._background]
  } else {
    console.error(`Color '${pattern._background}' not valid.`)
  }

  process.stdout.write('\033[' + sequence + 'm')
}