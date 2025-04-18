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
  { value: 'acido', label: 'Acido', color: '#cafe21' },
  { value: 'amargo', label: 'Amargo', color: '#492734' },
  { value: 'dulce', label: 'Dulce', color: '#19e5d6' },
  { value: 'salado', label: 'Salado', color: '#383a3d' },
  { value: 'picante', label: 'Picante', color: '#f21e69' }
]

const stationOptions = [
  { value: 'primavera', label: 'Primavera', color: '#519d62' },
  { value: 'verano', label: 'Verano', color: '#6495ed' },
  { value: 'otoño', label: 'Otoño', color: '#8b4513' },
  { value: 'invierno', label: 'Invierno', color: '#383a3d' },
]

const breathingOptions = [
  { value: 'Exhalación', label: 'Exhalación', color: '#111', fontColor: '#fff' },
  { value: 'Apnea', label: 'Apnea', color: '#d95645', fontColor: '#fff' },
  { value: 'Inhalación', label: 'Inhalación', color: '#fff', fontColor: '#111' },
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

  const pagesQtty = Object.keys(pagesText).length

  const [error, setError] = useState('')


  const nextPage = () => {
    if (metrics[page]?.tone === 0 || metrics[page]?.tone) {
      setPage(prevPage => prevPage + 1)

      setError('')
    } else {
      setError('Debe estar seleccionado para continuar.')
    }
  }

  const prevPage = () => {
    setPage(prevPage => prevPage - 1 > 1 ? prevPage - 1 : 1)
    setError('')
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

  const captureAndSave = async () => {
    const element = document.getElementById('results')
    if (!element) return

    const canvas = await html2canvas(element, { useCORS: true })
    const imgData = canvas.toDataURL('image/jpeg', 0.9)


    const link = document.createElement('a')
    link.href = imgData
    link.download = 'sinestesia-literaria.jpg'
    link.click()
  }

  const tonesChartY = [0, ...Object.values(metrics).map(item => item.tone)]

  const hasFileLoaded = pagesQtty > 0

  if (!hasFileLoaded) {
    return <div>
      <div className="header">
        <h1 className="title">Sinestesia Literaria <span className="very-red"> (Autoedición Lúdica)</span></h1>
      </div>
      <div className="container empty">
        <div className="initial-text-container">
          <div className="subtitle">Destinado a borradores en proceso de construcción, preferentemente sin fotos, sin maquetación final y sin índice. Sólo admite formato pdf.
          </div>

          <div className="recommendation">
            Recomendación: subir pdf de hasta 100 páginas. En caso de que el borrador sea más extenso se sugiere subdividirlo en partes "iguales", por ejemplo: si tiene 300 páginas, fraccionarlo en 3 archivos de 100 páginas cada uno; si tiene 150 páginas, en 2 archivos de 75; si tiene 143, dividirlo en un archivo de 72 y otro de 71. Es importante dividir en partes lo más parecidas posibles. Esto permitirá sostener la misma escala en los gráficos resultantes, para analizarlos con mayor comodidad y precisión.
          </div>
        </div>

        <div className="input-container">
          <input type="file" accept="application/pdf" onChange={handleFileChange2} className="input" />
        </div>
      </div>
    </div>
  }

  const x = [0, ...new Array(pagesQtty).fill(100 / (pagesQtty))]

  return (
    <div>
      <div className="header">
        <h1 className="title">Sinestesia Literaria <span className="very-red"> (Autoedición Lúdica)</span></h1>
      </div>
      <div className="container">
        {
          hasFileLoaded ? <button className="very-btn" onClick={() => window.location.reload()}>Recargar</button> :
            <input type="file" accept="application/pdf" onChange={handleFileChange2} />
        }
        <div className="page-content" >
          {
            page > pagesQtty && hasFileLoaded
              ? <div><div id="results">
                <LineChart dataToneX={x} dataToneY={tonesChartY} />
                <div className="result-list-container">
                  <div className="result-section-title">Respiración <span className="section-index">{breathingOptions.map(el => <span className="index-name"><span className="index-color" style={{ backgroundColor: el.color }}></span>{el.label} </span>)}</span></div>
                  <div className="result-list">
                    {Object.values(metrics).map(item => item.breathing).map((el) => <span className={"result-list-item " + (100 / pagesQtty < 20 ? 'zoom' : '')} style={{ width: 100 / pagesQtty + "%", backgroundColor: breathingOptions.find(e => e.value === el)?.color, color: breathingOptions.find(e => e.value === el)?.fontColor }}></span>)}
                  </div>

                  <div className="result-section-title">Estaciones <span className="section-index">{stationOptions.map(el => <span className="index-name"><span className="index-color" style={{ backgroundColor: el.color }}></span>{el.label} </span>)}</span></div>
                  <div className="result-list">
                    {Object.values(metrics).map(item => item.station).map((el) => <span className={"result-list-item " + (100 / pagesQtty < 20 ? 'zoom' : '')} style={{ width: 100 / pagesQtty + "%", backgroundColor: stationOptions.find(e => e.value === el)?.color }}></span>)}
                  </div>

                  <div className="result-section-title">Sabores <span className="section-index">{options.map(el => <span className="index-name"><span className="index-color" style={{ backgroundColor: el.color }}></span>{el.label} </span>)}</span></div>
                  <div className="result-list">
                    {Object.values(metrics).map(item => item.taste).map((el) => <span className={"result-list-item " + (100 / pagesQtty < 20 ? 'zoom' : '')} style={{ width: 100 / pagesQtty + "%", backgroundColor: options.find(e => e.value === el)?.color }}></span>)}
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
                  <button className={metrics[page]?.tone == 3 ? 'selected' : null} onClick={() => setTone(3)}>{'~'}</button>
                  <button className={metrics[page]?.tone == -1 ? 'selected' : null} onClick={() => setTone(-1)}>{'\\'}</button>
                </div>
                <div className="page-error" >{error}</div>
              </div>

              <div className="opt-section">
                <div className="section-title">Respiración</div>
                <div className="tone-container">
                  <button className={metrics[page]?.breathing == 'Inhalación' ? 'selected' : null} onClick={() => setBreathing('Inhalación')}>{'Inhalación'}</button>
                  <button className={metrics[page]?.breathing == 'Apnea' ? 'selected' : null} onClick={() => setBreathing('Apnea')}>{'Apnea'}</button>
                  <button className={metrics[page]?.breathing == 'Exhalación' ? 'selected' : null} onClick={() => setBreathing('Exhalación')}>{'Exhalación'}</button>
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

              <div className="book-ref"><a href="https://vagusediciones.com/producto/sinestesia-literaria/">Ir al libro &#8658;</a></div>
            </div>
        }
      </div>
    </div>
  );
};

export default App;
