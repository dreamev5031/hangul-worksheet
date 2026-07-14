export type Age = '5세' | '6세' | '7세' | '초등 입학 전'
export type Template = 'basic' | 'name' | 'large'
export type LetterSize = 'large' | 'normal'
export type RepeatRows = 3 | 5

export interface WorksheetSettings {
  rawWords: string
  age: Age
  template: Template
  letterSize: LetterSize
  repeatRows: RepeatRows
  includeBlank: boolean
  includePraise: boolean
}
