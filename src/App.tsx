/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

interface PagesText {
  [key: number]: string;
}

const App = () => {

  const [pagesText, setPagesText] = useState<PagesText>({});

  const extractTextFromPDF = async (file: File) => {
    const fileReader = new FileReader();
    const textByPage = {};

    fileReader.onload = async (e) => {

      const t = e?.target?.result as unknown as number
      const typedArray = new Uint8Array(t);
      const pdf = await getDocument(typedArray).promise;
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;

        let pageText = "";
        // Concatenate text from each item for the page
        textItems.forEach((item: any) => {
          pageText += item.str + " ";
        });

        // eslint-disable-next-line
        // @ts-ignore
        textByPage[pageNum] = pageText;
      }

      // Set the extracted text by page
      console.log(textByPage);
      setPagesText(textByPage);
    };

    fileReader.readAsArrayBuffer(file);
  };

  const handleFileChange2 = (event: any) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      extractTextFromPDF(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };


  // const handleFileChange = async (event: any) => {
  //   const file = event?.target.files[0];
  //   console.log('rqweqweqweqwe')
  //   console.log(file)
  //
  //   if (file && file.type === "application/pdf") {
  //     console.log(1)
  //     const fileReader = new FileReader();
  //     const textByPage = {};
  //
  //     fileReader.onload = async (e) => {
  //       const t = e?.target?.result as unknown as number
  //
  //       console.log(2)
  //       if (!t) {
  //         return
  //       }
  //       console.log(3)
  //
  //       const typedArray = new Uint8Array(t);
  //
  //       // Load the PDF document
  //       const pdf = await getDocument(typedArray).promise;
  //       console.log(pdf)
  //       setTotalPages(pdf.numPages);
  //       let fullText = "";
  //
  //
  //       console.log(4)
  //       // Render each page
  //       const pages = [];
  //       for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  //         const page = await pdf.getPage(pageNum);
  //         const textContent = await page.getTextContent();
  //         const textItems = textContent.items;
  //
  //         // Concatenate the text from the page
  //         textItems.forEach((item: any) => {
  //           fullText += item?.str + " ";
  //         });
  //
  //         // eslint-disable-next-line
  //         // @ts-ignore
  //         textByPage[pageNum] = fullText;
  //
  //         const viewport = page.getViewport({ scale: 1.5 });
  //         console.log(5)
  //
  //         const canvas = document.createElement("canvas");
  //         const context = canvas.getContext("2d");
  //         canvas.width = viewport.width;
  //         canvas.height = viewport.height;
  //
  //         console.log(6)
  //         if (!context) return
  //
  //         console.log(7)
  //         await page.render({
  //           canvasContext: context,
  //           viewport: viewport,
  //         }).promise;
  //
  //         console.log(8)
  //         pages.push(canvas.toDataURL()); // Convert canvas to a data URL
  //       }
  //       console.log(textByPage)
  //
  //       setText(fullText)
  //
  //       console.log(9)
  //       setPdfPages(pages); // Store rendered pages as images
  //     };
  //
  //     console.log(10)
  //     fileReader.readAsArrayBuffer(file);
  //   } else {
  //     alert("Please upload a valid PDF file.");
  //     console.log(11)
  //   }
  // };

  return (
    <div>
      <div>qweqwewqewqewqe</div>
      <div>
        {JSON.stringify(pagesText)}
      </div>
      <input type="file" accept="application/pdf" onChange={handleFileChange2} />
      {/* {totalPages > 0 && <p>Total Pages: {totalPages}</p>} */}
      {/* <div> */}
      {/*   {pdfPages.map((src: any, index: number) => ( */}
      {/*     <img key={index} src={src} alt={`Page ${index + 1}`} /> */}
      {/*   ))} */}
      {/* </div> */}
    </div>
  );
};

export default App;
