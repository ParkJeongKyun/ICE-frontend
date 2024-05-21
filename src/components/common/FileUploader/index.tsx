import { ChangeEvent } from 'react';

interface FileUploaderProps {
  onFileSelect: (arrayBuffer: ArrayBuffer) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result;
        if (arrayBuffer instanceof ArrayBuffer) {
          onFileSelect(arrayBuffer);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
};

export default FileUploader;
