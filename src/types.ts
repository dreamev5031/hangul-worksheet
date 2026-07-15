export type LetterSize = 'xlarge' | 'large' | 'normal'
export type PracticeMode = 'trace' | 'balanced' | 'independent'
export type RepeatRows = 3 | 5

export interface WorksheetSettings {
  rawWords: string
  letterSize: LetterSize
  practiceMode: PracticeMode
  repeatRows: RepeatRows
  showNameField: boolean
  showDateField: boolean
  includeBlank: boolean
  includePraise: boolean
}
