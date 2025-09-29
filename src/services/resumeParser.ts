export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  content: string;
}

export class ResumeParser {
  async parseFile(file: File): Promise<ParsedResumeData> {
    try {
      if (file.type === 'application/pdf') {
        return await this.parsePDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await this.parseDOCX(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
      }
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw error;
    }
  }

  private async parsePDF(file: File): Promise<ParsedResumeData> {
    // For now, we'll use a simple text extraction
    // In a real implementation, you'd use pdf-parse or similar
    const text = await this.extractTextFromFile(file);
    return this.extractDataFromText(text);
  }

  private async parseDOCX(file: File): Promise<ParsedResumeData> {
    // For now, we'll use a simple text extraction
    // In a real implementation, you'd use mammoth or similar
    const text = await this.extractTextFromFile(file);
    return this.extractDataFromText(text);
  }

  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // This is a simplified approach - in reality you'd need proper PDF/DOCX parsing
        const result = e.target?.result as string;
        resolve(result || '');
      };
      reader.readAsText(file);
    });
  }

  private extractDataFromText(text: string): ParsedResumeData {
    // Enhanced regex patterns for better extraction
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(?:\+91[-.\s]?)?[6-9]\d{9}/g;
    const nameRegex = /(?:^|\n)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\n|$)/m;
    
    // Try multiple patterns for name extraction
    const namePatterns = [
      /(?:^|\n)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\n|$)/m,
      /^([A-Z][A-Z\s]+)$/m,
      /Name[:\s]+([A-Za-z\s]+)/i,
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m
    ];

    // Extract email
    const emailMatches = text.match(emailRegex);
    const email = emailMatches?.[0];
    
    // Extract phone
    const phoneMatches = text.match(phoneRegex);
    const phone = phoneMatches?.[0];
    
    // Extract name using multiple patterns
    let name = null;
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }
    
    // Clean up extracted data
    const cleanedName = name ? name.replace(/[^\w\s]/g, '').trim() : undefined;
    const cleanedPhone = phone ? phone.replace(/[^\d+]/g, '') : undefined;

    return {
      name: cleanedName,
      email,
      phone: cleanedPhone,
      content: text
    };
  }

  validateRequiredFields(data: ParsedResumeData): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    
    if (!data.name) missingFields.push('name');
    if (!data.email) missingFields.push('email');
    if (!data.phone) missingFields.push('phone');

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
}

export const resumeParser = new ResumeParser();