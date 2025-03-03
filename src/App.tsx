/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import Select from 'react-select'
import LineChart from "./LineChart";
import html2canvas from 'html2canvas'

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#1a1a1a',
    borderColor: 'transparent',
    padding: 10,
    borderRadius: 8,
    color: 'white',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#1a1a1a',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'black' : '#1a1a1a',
    color: 'white',
    '&:hover': {
      backgroundColor: '#3e3e3e',
    },
  }),
}

const options = [
  { value: 'acido', label: 'Acido' },
  { value: 'amargo', label: 'Amargo' },
  { value: 'dulce', label: 'Dulce' },
  { value: 'salado', label: 'Salado' },
  { value: 'picante', label: 'Picante' }
]

const stationOptions = [
  { value: 'primavera', label: 'Primavera', color: '#519d62' },
  { value: 'verano', label: 'Verano', color: '#6495ed' },
  { value: 'otoño', label: 'Otoño', color: '#8b4513' },
  { value: 'invierno', label: 'Invierno', color: '#383a3d' },
]

interface PagesText {
  [key: number]: string;
}

const App = () => {
  const [page, setPage] = useState(1)
  const [pagesText, setPagesText] = useState<PagesText>({});
  const [metrics, setMetrics] = useState<any>({});

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

  const pagesQtty = Object.keys(pagesText).length

  const nextPage = () => {
    // setPage(prevPage => prevPage + 1 >= pagesQtty ? prevPage : prevPage + 1)
    setPage(prevPage => prevPage + 1)
  }

  const prevPage = () => {
    setPage(prevPage => prevPage - 1 > 1 ? prevPage - 1 : 1)
  }

  const setTone = (tone: number) => {
    setMetrics(prevMetrics => ({ ...prevMetrics, [page]: { ...prevMetrics[page], tone } }))
  }


  const setBreathing = (breathing: number) => {
    setMetrics(prevMetrics => ({ ...prevMetrics, [page]: { ...prevMetrics[page], breathing } }))
  }

  const setTaste = (taste: any) => {
    setMetrics(prevMetrics => ({ ...prevMetrics, [page]: { ...prevMetrics[page], taste: taste.value } }))
  }

  const setStation = (station: any) => {
    setMetrics(prevMetrics => ({ ...prevMetrics, [page]: { ...prevMetrics[page], station: station.value } }))
  }

  const breathingChartY = Object.values(metrics).map(item => item.breathing)
  const tonesChartY = Object.values(metrics).map(item => item.tone)

  // const tonesChartX = num =>
  //   Array.from({ length: num }, (_, i) => (i / (num - 1)) * 100)


  console.log({ page, pagesQtty })
  console.log(metrics)

  const hasFileLoaded = pagesQtty > 0

  const captureAndSave = async () => {
    const element = document.getElementById('results')
    if (!element) return

    const canvas = await html2canvas(element, { useCORS: true })
    const imgData = canvas.toDataURL('image/jpeg', 0.9)

    console.log(imgData)

    const link = document.createElement('a')
    link.href = imgData
    link.download = 'sinestesia-literaria.jpg'
    link.click()
  }

  if (!hasFileLoaded) {
    return <div>
      <div className="header">
        <h1 className="title">Sinestesia Literaria <span style={{ color: '#d95645' }}> (Autoedición Lúdica)</span></h1>
      </div>
      <div className="container empty">
        <input type="file" accept="application/pdf" onChange={handleFileChange2} />
      </div>
    </div>
  }

  const x = new Array(pagesQtty).fill(100 / (pagesQtty - 1)).map((e, i) => i === 0 ? 0 : e)

  return (
    <div>
      <div className="header">
        <h1 className="title">Sinestesia Literaria <span style={{ color: '#d95645' }}> (Autoedición Lúdica)</span></h1>
      </div>
      <div className="container">
        {
          hasFileLoaded ? <button onClick={() => window.location.reload()}>Recargar</button> :
            <input type="file" accept="application/pdf" onChange={handleFileChange2} />
        }
        <div className="page-content" >
          {
            page > pagesQtty && hasFileLoaded
              ? <div><div id="results">
                <LineChart dataX={x} dataY={breathingChartY} dataToneX={x} dataToneY={tonesChartY} />
                <div className="result-list-container">
                  <div>Sabores</div>
                  <div className="result-list">
                    {Object.values(metrics).map(item => item.taste).map((el) => <span className="result-list-item" style={{ width: 100 / pagesQtty + "%", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{el}</span>)}
                  </div>

                  <div>Estaciones</div>
                  <div className="result-list">
                    {Object.values(metrics).map(item => item.station).map((el) => <span className={"result-list-item " + (100 / pagesQtty < 20 ? 'zoom' : '')} style={{ width: 100 / pagesQtty + "%", backgroundColor: stationOptions.find(e => e.value === el)?.color }}>{el}</span>)}
                  </div>
                </div>
              </div>

                <button className="save-button" onClick={captureAndSave}>Guardar como imagen</button>
              </div>
              : pagesText[page]}
        </div>

        {
          page > pagesQtty && hasFileLoaded
            ? null
            : <div className="options-container">
              <div className="opt-section">
                <div className="section-title">Orografía</div>
                <div className="tone-container">
                  <button className={metrics[page]?.tone == 1 ? 'selected' : null} onClick={() => setTone(1)}>{'/'}</button>
                  <button className={metrics[page]?.tone == 0 ? 'selected' : null} onClick={() => setTone(0)}>{'-'}</button>
                  <button className={metrics[page]?.tone == -1 ? 'selected' : null} onClick={() => setTone(-1)}>{'\\'}</button>
                </div>
              </div>

              <div className="opt-section">
                <div className="section-title">Respiración</div>
                <div className="tone-container">
                  <button className={metrics[page]?.breathing == 1 ? 'selected' : null} onClick={() => setBreathing(1)}>{'Inhalación'}</button>
                  <button className={metrics[page]?.breathing == 0 ? 'selected' : null} onClick={() => setBreathing(0)}>{'Apnea'}</button>
                  <button className={metrics[page]?.breathing == -1 ? 'selected' : null} onClick={() => setBreathing(-1)}>{'Exhalación'}</button>
                </div>
              </div>


              <div className="opt-section">
                <div className="section-title">Sabor</div>
                <Select menuPlacement="top" options={options} styles={customStyles} value={metrics[page]?.taste ? { value: metrics[page]?.taste, label: options.find(el => el.value == metrics[page]?.taste)?.label } : ''} onChange={setTaste} />
              </div>

              <div className="opt-section">
                <div className="section-title">Estación</div>
                <Select menuPlacement="top" options={stationOptions} styles={customStyles} value={metrics[page]?.station ? { value: metrics[page]?.station, label: stationOptions.find(el => el.value == metrics[page]?.station)?.label } : ''} onChange={setStation} />
              </div>

              <div className="opt-section">
                <div className="section-title">Página</div>
                <div className="page-btn-container">
                  <button disabled={page === 1} onClick={prevPage}>{'<'}</button>
                  <div className="page">
                    {page}
                  </div>
                  <button
                    disabled={page === Object.keys(pagesText).length + 1}
                    onClick={nextPage}>{'>'}</button>
                </div>
              </div>

              <div className="book-ref"><a href="https://vagusediciones.com/producto/sinestesia-literaria/">Ir al libro</a></div>
            </div>
        }
      </div>
    </div>
  );
};

export default App;
