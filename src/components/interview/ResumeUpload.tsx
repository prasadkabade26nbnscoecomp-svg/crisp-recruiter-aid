import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { resumeParser, ParsedResumeData } from '@/services/resumeParser';
import { setCurrentCandidate } from '@/store/slices/candidateSlice';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploadProps {
  onComplete: () => void;
}

const ResumeUpload = ({ onComplete }: ResumeUploadProps) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF or DOCX file only.');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB.');
      }

      setUploadedFile(file);
      
      // Simulate upload progress
      for (let i = 0; i <= 50; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Parse the resume
      const data = await resumeParser.parseFile(file);
      setParsedData(data);
      
      // Complete progress
      setUploadProgress(100);
      
      // Create candidate profile
      const candidateId = `candidate_${Date.now()}`;
      const candidateProfile = {
        id: candidateId,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        resumeFile: file,
        createdAt: Date.now(),
      };

      dispatch(setCurrentCandidate(candidateProfile));

      const validation = resumeParser.validateRequiredFields(data);
      
      if (validation.isValid) {
        toast({
          title: "Resume Processed Successfully",
          description: "All information extracted. Starting interview...",
        });
      } else {
        toast({
          title: "Resume Uploaded Successfully",
          description: "Some information is missing. Please complete your profile.",
        });
      }

      // Wait a moment before proceeding
      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload resume');
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload resume',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  if (isUploading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-primary animate-pulse" />
            <div>
              <h3 className="text-lg font-semibold">Processing Resume...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we extract your information
              </p>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (parsedData && uploadedFile) {
    const validation = resumeParser.validateRequiredFields(parsedData);
    
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-success" />
            <div>
              <h3 className="text-lg font-semibold">Resume Processed Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                File: {uploadedFile.name}
              </p>
            </div>
            
            <div className="text-left space-y-2">
              <h4 className="font-medium">Extracted Information:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className={parsedData.name ? 'text-success' : 'text-error'}>
                    {parsedData.name || 'Not found'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className={parsedData.email ? 'text-success' : 'text-error'}>
                    {parsedData.email || 'Not found'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className={parsedData.phone ? 'text-success' : 'text-error'}>
                    {parsedData.phone || 'Not found'}
                  </span>
                </div>
              </div>
            </div>

            {!validation.isValid && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some information is missing: {validation.missingFields.join(', ')}. 
                  Don't worry, our chatbot will help you complete your profile.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={onComplete}
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              Continue to Profile Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card
        className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
          isDragging ? 'border-primary bg-primary/5' : 'border-dashed border-2'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Upload className={`h-12 w-12 mx-auto ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <h3 className="text-lg font-semibold">
                {isDragging ? 'Drop your resume here' : 'Upload Your Resume'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop your PDF or DOCX file, or click to browse
              </p>
            </div>
            
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
              
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOCX • Max size: 10MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeUpload;