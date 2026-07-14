/** 현재 A4 미리보기 요소를 캡처해 한 장짜리 PDF로 저장합니다. */
export async function downloadWorksheetPdf(element: HTMLElement): Promise<void> {
  // PDF 도구는 다운로드할 때만 불러와 첫 화면을 가볍게 유지합니다.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  })

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297)
  pdf.save('hangul-worksheet.pdf')
}
