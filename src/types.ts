export type Template = 'letter' | 'word' | 'sentence'
export type LetterSize = 'large' | 'normal'
export type PracticeMode = 'trace' | 'balanced' | 'independent'
export type RepeatRows = 3 | 5

export interface WorksheetSettings {
  rawWords: string
  template: Template
  letterSize: LetterSize
  practiceMode: PracticeMode
  repeatRows: RepeatRows
  includePraise: boolean
}
