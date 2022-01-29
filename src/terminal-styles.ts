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
}

interface DisplayPattern {
  bold: boolean
  italic: boolean
  underline: boolean
  foreground: number | string
  background: number | string
}

export function reset_display_pattern (): void {
  process.stdout.write('\033[m')
}

export function set_display_pattern (pattern: DisplayPattern): void {
  let sequence = ''
  if (pattern.bold) {
    sequence += styleCodes.BOLD
  }
  if (pattern.italic) {
    sequence += styleCodes.ITALIC
  }
  if (pattern.underline) {
    sequence += styleCodes.UNDERLINE
  }

  sequence += styleCodes.FG
  if (typeof pattern.foreground === 'number') {
    sequence += pattern.foreground.toString()
  } else {
    sequence += colorCodes[pattern.foreground]
  }

  sequence += styleCodes.BG
  if (typeof pattern.background === 'number') {
    sequence += pattern.background.toString()
  } else {
    sequence += colorCodes[pattern.background]
  }

  process.stdout.write('\033[' + sequence + 'm')
}