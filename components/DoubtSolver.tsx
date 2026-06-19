import React, { useState, useRef, useCallback } from 'react';
import { solveDoubt, simplifyExplanation } from '../services/geminiService';
import { fileToDataUrl } from '../utils/fileUtils';
import Spinner from './Spinner';
import { ModelMessage } from './ChatMessage';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface DoubtSolverProps {
  onBack: () => void;
}

const DoubtSolver: React.FC<DoubtSolverProps> = ({ onBack }) => {
  const [problemText, setProblemText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [solution, setSolution] = useState<string | null>(null);
  const [simplifiedSolution, setSimplifiedSolution] = useState<string | null>(null);
  
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);
  const [isLoadingSimplification, setIsLoadingSimplification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSolve = async () => {
    if (!problemText.trim() && !selectedImage) return;

    setIsLoadingSolution(true);
    setError(null);
    setSolution(null);
    setSimplifiedSolution(null);

    let imagePayload: { base64: string, mimeType: string } | undefined = undefined;
    if (selectedImage) {
      try {
        const dataUrl = await fileToDataUrl(selectedImage);
        imagePayload = {
          base64: dataUrl.split(',')[1],
          mimeType: selectedImage.type
        };
      } catch (err) {
        setError('Failed to process image. Please try another file.');
        setIsLoadingSolution(false);
        return;
      }
    }

    try {
      const result = await solveDoubt(problemText, imagePayload);
      setSolution(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while solving.');
    } finally {
      setIsLoadingSolution(false);
    }
  };
  
  const handleSimplify = async () => {
      if (!solution) return;
      setIsLoadingSimplification(true);
      setError(null);
      try {
          const result = await simplifyExplanation(solution);
          setSimplifiedSolution(result);
      } catch (err: any) {
          setError(err.message || 'An unknown error occurred while simplifying.');
      } finally {
          setIsLoadingSimplification(false);
      }
  };
  
  const handleSolveAnother = () => {
      setProblemText('');
      setSelectedImage(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSolution(null);
      setSimplifiedSolution(null);
      setError(null);
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
        <header className="flex items-center justify-between mb-4">
             <button
                onClick={onBack}
                className="flex items-center gap-2 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition rounded-full hover:bg-[var(--color-surface-secondary)]"
                aria-label="Go back"
                title="Go back"
            >
                <ArrowUturnLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] text-center">Doubt Destroyer</h2>
            <div className="w-14"></div> {/* Spacer */}
        </header>

      {/* Input Section */}
      {!solution && !isLoadingSolution && (
         <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
            <p className="text-center text-[var(--color-text-secondary)]">Describe your problem or upload a photo.</p>
            <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="e.g., Explain the difference between meiosis and mitosis, or solve for x in 2x + 5 = 15"
                className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-primary)] resize-none focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-text)] transition"
                rows={4}
            />
            <div className="flex items-center justify-between">
                <div className="relative">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!!selectedImage}
                        className="flex items-center gap-2 bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] disabled:bg-[var(--color-surface-tertiary)] disabled:text-[var(--color-text-secondary)] text-[var(--color-text-primary)] font-semibold py-2 px-4 rounded-md transition duration-200"
                    >
                        <PaperclipIcon className="w-5 h-5" />
                        {selectedImage ? 'Image Attached' : 'Attach Image'}
                    </button>
                     <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                </div>
                 {previewUrl && (
                    <div className="relative">
                        <img src={previewUrl} alt="Preview" className="h-12 w-auto rounded" />
                        <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-[var(--color-surface-secondary)] rounded-full text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)]">
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
             <button
                onClick={handleSolve}
                disabled={!problemText.trim() && !selectedImage}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] disabled:bg-[var(--color-surface-tertiary)] text-[var(--color-text-on-accent)] font-bold py-2 px-4 rounded-md transition duration-200"
            >
                <SparklesIcon className="w-5 h-5" />
                Solve with AI
            </button>
         </div>
      )}

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          {error && (
                <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger-text)] p-3 rounded-md text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={solution ? handleSimplify : handleSolve}
                        className="font-semibold bg-[var(--color-danger-text)]/10 hover:bg-[var(--color-danger-text)]/20 text-[var(--color-danger-text)] py-1 px-3 rounded-md transition-colors ml-4"
                    >
                        Retry
                    </button>
                </div>
            )}
        
          {isLoadingSolution && <div className="flex justify-center items-center h-full"><Spinner /></div>}

          {solution && (
              <div className="space-y-4">
                  <div>
                      <h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-2">Step-by-Step Solution:</h3>
                      <ModelMessage>{solution}</ModelMessage>
                  </div>
                  
                  {!simplifiedSolution && (
                      <div className="text-center">
                          <button
                            onClick={handleSimplify}
                            disabled={isLoadingSimplification}
                            className="inline-flex items-center justify-center gap-2 bg-[var(--color-warning-bg)] hover:bg-[var(--color-warning-bg-hover)] disabled:bg-[var(--color-surface-tertiary)] text-white font-bold py-2 px-4 rounded-md transition duration-200"
                          >
                            {isLoadingSimplification ? <Spinner /> : <LightbulbIcon className="w-5 h-5" />}
                            {isLoadingSimplification ? 'Simplifying...' : "Explain Like I'm 10"}
                          </button>
                      </div>
                  )}

                  {isLoadingSimplification && <div className="flex justify-center"><Spinner /></div>}

                  {simplifiedSolution && (
                      <div>
                           <h3 className="text-lg font-semibold text-[var(--color-warning-text)] mb-2">Simplified Explanation:</h3>
                           <ModelMessage>{simplifiedSolution}</ModelMessage>
                      </div>
                  )}

                 <div className="pt-4 text-center">
                    <button
                        onClick={handleSolveAnother}
                        className="text-[var(--color-accent-text)] hover:underline font-semibold"
                    >
                       Solve Another Doubt
                    </button>
                 </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default DoubtSolver;