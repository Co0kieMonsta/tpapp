'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function DownloadPDFButton({ quoteId, customerName }: { quoteId: string, customerName: string }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    try {
      setIsGenerating(true)
      const input = document.getElementById('quote-content')
      if (!input) {
        console.error('Quote content not found')
        return
      }

      // Use a higher scale for better quality
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200, // Force desktop viewport width
        onclone: (clonedDoc) => {
          const element = clonedDoc.getElementById('quote-content')
          if (element) {
            // Force the container to be desktop width (Letter size ratio approx)
            element.style.width = '816px' 
            element.style.padding = '0'
            element.style.margin = '0 auto'
          }
        }
      })

      const imgData = canvas.toDataURL('image/png')
      
      // Letter size dimensions in mm: 215.9 x 279.4
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'letter'
      })
      const pdfWidth = 215.9
      const pdfHeight = 279.4
      
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // Calculate ratio to fit width
      const ratio = pdfWidth / imgWidth
      const finalHeight = imgHeight * ratio

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight)
      
      const fileName = `Quote_${quoteId.slice(0, 8)}_${customerName.replace(/[^a-z0-9]/gi, '_')}.pdf`
      pdf.save(fileName)

    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-70 w-full sm:w-auto"
    >
      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      Download PDF
    </button>
  )
}
