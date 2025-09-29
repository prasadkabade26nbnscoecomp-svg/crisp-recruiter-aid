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
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const nameRegex = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;

    const email = text.match(emailRegex)?.[0];
    const phone = text.match(phoneRegex)?.[0];
    const name = text.match(nameRegex)?.[0];

    return {
      name,
      email,
      phone,
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