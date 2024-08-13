import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';

// Passport size dimensions in mm
const passportWidthMM = 35; 
const passportHeightMM = 45; 
const stampWidthMM = 20; 
const stampHeightMM = 25; 
const columns = 5;
const rows = 6;

// Padding values in mm
const paddingMM = 5; 
const pagePaddingMM = 10; 

const App = () => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  
  const clearError = () => setError('');

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setError(''); // Clear any previous errors
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  const generatePDF = async () => {
    if (!image) {
      setError('Please select an image before generating the PDF.');
      // Clear the error message after 5 seconds
      setTimeout(clearError, 5000);
      return;
    }

    try {
      // Create a new PDF 
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([210, 297]);        // A4 size in mm

      // Convert data URL to Uint8Array
      const imgData = image.split(',')[1];
      const imgBytes = Uint8Array.from(atob(imgData), c => c.charCodeAt(0));

      // Check image format (e.g., png, jpeg)
      const imgFormat = image.split(';')[0].split('/')[1]; 

      // Embed the image into the PDF
      let img;
      if (imgFormat === 'png') {
        img = await pdfDoc.embedPng(imgBytes);
      } else if (imgFormat === 'jpeg' || imgFormat === 'jpg') {
        img = await pdfDoc.embedJpg(imgBytes);
      } else {
        throw new Error('Unsupported image format');
      }

      const imgWidth = passportWidthMM  
      const imgHeight = passportHeightMM 
      const margin = 4 
      const pageMargin = 0.23

      // Draw images onto the page
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          page.drawImage(img, {
            x: (pageMargin+col) * (imgWidth + margin),
            y: page.getHeight() - (row + 1) * (imgHeight + margin),
            width: imgWidth,
            height: imgHeight,
          });
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'passport_photos.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error generating PDF: ' + error.message);
      setTimeout(clearError, 5000);
    }
  };

  const generateMultiSizePhotoPDF = async () => {
    if (!image) {
      setError('Please select an image before generating the PDF.');
      // Clear the error message after 5 seconds
      setTimeout(clearError, 5000);
      return;
    }

    try {
      // Create a new PDF 
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([210, 297]);        // A4 size in mm

      // Convert data URL to Uint8Array
      const imgData = image.split(',')[1];
      const imgBytes = Uint8Array.from(atob(imgData), c => c.charCodeAt(0));

      // Check image format (e.g., png, jpeg)
      const imgFormat = image.split(';')[0].split('/')[1]; 

      // Embed the image into the PDF
      let img;
      if (imgFormat === 'png') {
        img = await pdfDoc.embedPng(imgBytes);
      } else if (imgFormat === 'jpeg' || imgFormat === 'jpg') {
        img = await pdfDoc.embedJpg(imgBytes);
      } else {
        throw new Error('Unsupported image format');
      }

      const imgWidth = passportWidthMM  
      const imgHeight = passportHeightMM 
      var margin = 4 
      const pageMargin = 0.23

      // Draw images onto the page
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < columns; col++) {
          if(row < 4){
          page.drawImage(img, {
            x: (pageMargin+col) * (imgWidth + margin),
            y: page.getHeight() - (row) * (imgHeight + margin),
            width: imgWidth,
            height: imgHeight,
          });
        }
        else{
          page.drawImage(img, {
            x: (pageMargin+col) * (stampWidthMM + margin),
            y: row/2 + page.getHeight() - (row + 1.15) * (imgHeight),
            width: stampWidthMM,
            height: stampHeightMM,
          });
          margin = 2
        }
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'passport_photos.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error generating PDF: ' + error.message);
      setTimeout(clearError, 5000);
    }
  };

  return (
    <div className="container text-center my-5">
      <h1 className="display-4 mb-5">GoodLuck Xerox Passport Photo Generator</h1>
      <div className="mx-auto w-75" {...getRootProps()} style={{ border: '2px dashed #000', padding: '20px', marginBottom: '20px' }}>
        <input {...getInputProps()} />
        <p>Drag & drop a photo here, or click to select one</p>
      </div>
      <button
        onClick={generatePDF}
        className="btn btn-primary mt-4 me-4"
      >
        Generate PDF
      </button>
      <button
        onClick={generateMultiSizePhotoPDF}
        className="btn btn-success mt-4"
      >
        Multi Photo PDF
      </button>
      {error && (
        <div className="alert alert-danger w-75 mx-auto mt-3" role="alert">
          {error}
        </div>
      )}

      {image && (
        <div className="position-relative d-none d-md-grid gap-2 mx-auto" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, ${passportWidthMM * 3.7795}px)`,
          gridTemplateRows: `repeat(${rows}, ${passportHeightMM * 3.7795}px)`,
          gap: '10px',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#fff',
        }}>
          {[...Array(columns * rows)].map((_, index) => (
            <img
              key={index}
              src={image}
              alt="Passport"
              style={{
                width: `${passportWidthMM * 3.7795}px`,
                height: `${passportHeightMM * 3.7795}px`,
                objectFit: 'cover',
              }}
            />
          ))}

          <button
            className="btn btn-light position-absolute top-0 end-0 mt-3 me-5"
            onClick={() => setImage(null)}
            aria-label="Remove preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 0 24 24" width="30px" fill="#5f6368"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
