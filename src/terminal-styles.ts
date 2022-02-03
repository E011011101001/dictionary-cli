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
  _align_center!: boolean
  _foreground!: number | string
  _background!: number | string

  constructor () {
    this._bold = false
    this._italic = false
    this._underline = false
    this._align_center = false
    this._foreground = ''
    this._background = ''
  }

  bold (): DisplayPattern {
    this._bold = true
    return this
  }

  public italic (): DisplayPattern {
    this._italic = true
    return this
  }

  public underline (): DisplayPattern {
    this._underline = true
    return this
  }

  public center (): DisplayPattern {
    this._align_center = true
    return this
  }

  public foreground (color: number | string): DisplayPattern {
    this._foreground = color
    return this
  }

  public background (color: number | string): DisplayPattern {
    this._background = color
    return this
  }

  private _set_display_pattern (): void {
    let sequence = ''
    if (this._bold) {
      sequence += styleCodes.BOLD
    }
    if (this._italic) {
      sequence += styleCodes.ITALIC
    }
    if (this._underline) {
      sequence += styleCodes.UNDERLINE
    }

    if (this._foreground !== '') {
      sequence += styleCodes.FG
      if (typeof this._foreground === 'number') {
        sequence += this._foreground.toString()
      } else if (Object.keys(colorCodes).indexOf(this._foreground) >= 0) {
        sequence += colorCodes[this._foreground]
      } else {
        console.error(`Color '${this._foreground}' not valid.`)
      }
    }

    if (this._background !== '') {
      sequence += styleCodes.BG
      if (typeof this._background === 'number') {
        sequence += this._background.toString()
      } else if (Object.keys(colorCodes).indexOf(this._background) >= 0) {
        sequence += colorCodes[this._background]
      } else {
        console.error(`Color '${this._background}' not valid.`)
      }
    }

    process.stdout.write('\x1b[' + sequence + 'm')
  }

  private _reset_display_pattern (): void {
    process.stdout.write('\x1b[m')
  }

  public print (str: string, config = { ending: '\n' }): void {
    const TerminalWidth = process.stdout.columns
    while (str.length) {
      const oneLine = str.slice(0, TerminalWidth)
      str = str.slice(TerminalWidth)
      const spaceCnt = this._align_center ? (TerminalWidth - oneLine.length) / 2 : 0
      process.stdout.write(' '.repeat(spaceCnt))

      this._set_display_pattern()
      process.stdout.write(oneLine)
      this._reset_display_pattern()
    }

    process.stdout.write(config.ending)
  }
}
