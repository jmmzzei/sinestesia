/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState, useEffect, useRef, ReactNode } from "react";
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
  { value: 'acido', label: 'Ácido', color: '#cafe21' },
  { value: 'amargo', label: 'Amargo', color: '#625258' },
  { value: 'dulce', label: 'Dulce', color: '#19e5d6' },
  { value: 'salado', label: 'Salado', color: '#ffffff' },
  { value: 'picante', label: 'Picante', color: '#f21e69' }
]

const stationOptions = [
  { value: 'primavera', label: 'Primavera', color: '#519d62' },
  { value: 'verano', label: 'Verano', color: '#6495ed' },
  { value: 'otoño', label: 'Otoño', color: '#8b4513' },
  { value: 'invierno', label: 'Invierno', color: '#ffffff' },
]

const breathingOptions = [
  { value: 'Exhalación', label: 'Exhalación', color: '#0f5b3e', fontColor: '#fff' },
  { value: 'Apnea', label: 'Apnea', color: '#d95645', fontColor: '#fff' },
  { value: 'Inhalación', label: 'Inhalación', color: '#fff', fontColor: '#111' },
]


const DEFAULT_METRICS = {};
const DEFAULT_PAGES_TEXT = {};
const DEFAULT_PAGE = 1;
const LOCAL_STORAGE_KEY = 'sinestesiaLiteraria-userProgress';

// Función para cargar el progreso desde el localStorage
const loadProgress = () => {
  const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedProgress) {
    return JSON.parse(savedProgress);
  }
  return { page: DEFAULT_PAGE, metrics: DEFAULT_METRICS, pagesText: DEFAULT_PAGES_TEXT };  // Estado por defecto
};

// Función para guardar el progreso en el localStorage
const saveProgress = (progress) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
};

interface PagesText {
  [key: number]: string;
}

// Componente de acordeón para FAQ
interface FAQItem {
  question: string;
  answer: ReactNode;
}

// Utilidad para renderizar saltos de línea en las respuestas
function renderWithLineBreaks(text: string | ReactNode) {
  if (typeof text !== 'string') return text;
  return text.split(/\n/g).map((line, idx, arr) =>
    <span key={idx}>
      {line}
      {idx < arr.length - 1 ? <br /> : null}
    </span>
  );
}

const FAQAccordion = ({ items }: { items: FAQItem[] }) => {
  // Todos desplegados por defecto
  const [openIndexes, setOpenIndexes] = useState(items.map((_, i) => i));

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx)
        ? prev.filter((i) => i !== idx)
        : [...prev, idx]
    );
  };

  return (
    <div className="faq-accordion">
      {items.map((item, idx) => (
        <div key={idx} className="faq-item">
          <button className="faq-question" onClick={() => toggleIndex(idx)}>
            <span>{item.question}</span>
            <span style={{ color: "#808080", marginLeft: 15, transition: 'transform 0.2s', display: 'inline-block', transform: openIndexes.includes(idx) ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
          </button>
          {openIndexes.includes(idx) && (
            <div className="faq-answer">{renderWithLineBreaks(item.answer)}</div>
          )}
        </div>
      ))}
    </div>
  );
};

// Componente toggle para Prospecto y FAQ
const ProspectoToggle = () => {
  const [open, setOpen] = useState(false);
  const faqItems: FAQItem[] = [
    {
      question: "Letra (no tan) chica…",
      answer: "Esta WebApp nace como complemento del libro “Sinestesia literaria: Mezclar los sentidos para encontrar el libro”, de Tomás Debeljuh (publicado por Vagus Ediciones). De hecho, fue creada como catalizador de su sección práctica. En dicha sección el autor desarrolla una suerte de método de autoedición lúdica. Método que tiene por fin encontrar el libro que late dentro de un borrador; como así también secundar a quien escribe, para que se convierta en autora o autor.",
    },
    {
      question: "De receta libre",
      answer: "Si bien esta WebApp es de acceso libre y de uso gratuito, se sugiere leer previamente el libro para poder utilizarla, porque -de nuevo-, lo complementa, no lo reemplaza.\n Nota: el que avisa no traiciona y el que traiciona… debe estar en cualquier lugar menos leyendo esto.",
    },
    {
      question: "Indicaciones",
      answer: "Sirve para transformar borradores de escritos en gráficos. “¿O sea que es para quienes están escribiendo un libro?” Sí… y para quienes están editando materiales de terceros, pero esto lo veremos más abajo.\n El gráfico resultante nos permitirá vislumbrar rincones del “manuscrito” que antes pasábamos por alto.",
    },
    {
      question: "Principios activos",
      answer: "Nos hemos basado SOLO en cuatro de las más de quince herramientas, de autoedición lúdica, propuestas en Sinestesia literaria: \n• Orografía del libro y oleaje de lectura \n• Respiración literaria \n• Sabores \n• Estaciones y paleta de colores"
    }, {
      question: "Mecanismo de acción",
      answer: "La WebApp invita a leer con los sentidos bien despiertos; a pasar el texto por el cuerpo y descubrir su relieve, su apnea y su jadeo, sus rincones dulces o amargos, su región cálida y sus latitudes tanto frías como templadas. \nUna vez obtenido el gráfico podemos descargarlo, compartirlo y analizarlo de manera solitaria o colectiva. Podríamos, incluso, pedirles a distintas personas que lean nuestros “manuscritos” a través de la WebApp, y recolectar así la mirada impropia. Acto seguido, tal vez, realizar sucesivos ajustes en el borrador original, hasta convertirlo en aquel libro que estábamos buscando (o que ni siquiera esperábamos). \nCon ánimo de lograr la sinergia colectiva propia del cruce de miradas y de la edición cooperativa, esta WebApp deja su puerta abierta tanto a quienes escriben, como así también a quienes desean dar una devolución no tradicional -ya sean estos últimos editores, críticos literarios o lectores en general-. En fin, en un mundo donde lo digital nos invita silenciosamente a perder el tacto y el contacto, esta WebApp, paradójicamente invita a sentir, a hacer con lo sentido y a compartirlo."
    },
    {
      question: "Posología",
      answer: "1) Subir archivo en pdf.\n 2) Al finalizar la lectura de cada página: tildar lo sentido (solo es obligatoria la Orografía).\n 3) Descargar gráfico y analizarlo (o guardarlo para cuando necesitemos encender el termotanque, la salamandra o hacer un asado)."
    },
    {
      question: "Advertencias",
      answer: "• Solo admite formato pdf.\n • La línea curva de la herramienta Orografía genera un corte en el gráfico (en el libro Sinestesia literaria esto está descripto como Cortocircuito y graficado de otra manera).\n• Destinado a borradores en proceso de construcción escritos en prosa. Es decir, a aquellos borradores en ojotas o de entrecasa, crudos en cuanto a su maquetación; materiales preferentemente sin fotos, sin juegos tipográficos, sin índice. En otras palabras, es para borradores con movimiento, aquellos que aún están a varios kilómetros de ripio de tener definido su diseño interior. \n • La WebApp lanza el gráfico solo al terminar la lectura del material subido. En caso de no terminar la lectura, lo hecho quedará guardado y al reingresar se abrirá justo en donde habíamos dejado. Para esto es imprescindible entrar y salir desde el mismo dispositivo. \n• “¿Se puede usar desde cualquier tipo de dispositivo?”:\n Sí, del mismo modo que es posible pero incómodo dormir en el piso. \nSi bien se puede usar desde celulares o tablets, la WebApp, fue ideada para ser utilizada desde computadoras. El motivo es simple y sencillo: mientras mayor sea el tamaño de la pantalla, mayor será el tamaño y la nitidez del gráfico.Por otro lado, dicha nitidez no solo depende del tamaño de la pantalla del dispositivo, sino que además es inversamente proporcional al número de páginas del archivo en cuestión. Quiero decir, mientras mayor sea la cantidad de páginas, más compactado quedará el gráfico. De aquí se desprende la siguiente recomendación:  \nSubir archivos de hasta 100 páginas. \nEn caso de que el borrador sea más extenso se sugiere subdividirlo en partes iguales -o lo más parecidas posible-. Por ejemplo, si tiene 300 páginas, fraccionarlo en 3 archivos de 100; si tiene 150 páginas, en 2 archivos de 75; si posee 143, dividirlo en un archivo de 72 y otro de 71. Esto permitirá sostener la escala en los gráficos resultantes, de manera tal de poder finalmente colocarlos uno al lado del otro, aunándolos en un gráfico que contemple a todo el borrador inicial."
    },
    {
      question: "Efectos colaterales",
      answer: "La WebApp no respeta la maquetación original, por lo que habrá corrimientos en el texto que no impedirán su lectura. Tampoco registra las fotos o los juegos tipográficos exuberantes."
    },
    {
      question: "Contraindicaciones",
      answer: "No apto para personas que tengan cuatro ángulos rectos (y no deseen desestructurarse). Puede causar confusión mental, taquicardia emocional y reacciones anafilácticas varias. En tal caso, recurrir a la guardia más cercana, que bien podría ser la tecla Esc de su PC."
    },
    {
      question: "Conservación",
      answer: "Se puede dejar afuera de la heladera, es más… sería complicado usarla del lado de adentro."
    },
    {
      question: "Fecha de vencimiento",
      answer: "Impreso en el revés de tu cansancio. Pero antes, ¡Anímate, vamos a intentarlo!"
    }
    // Agrega más preguntas y respuestas aquí
  ];

  return (
    <div style={{ marginBottom: '2em', padding: '0 1em', maxWidth: '800px', width: '100%' }}>
      <button
        className="very-btn"
        onClick={() => setOpen((o) => !o)}
      >
        Prospecto
        <span style={{ color: "#808080", marginLeft: 10, transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
      </button>
      {open && (
        <div style={{ marginTop: '1.5em', marginBottom: '2em', background: '#222', borderRadius: 8, padding: '1.5em', boxShadow: '0 2px 8px #00000030' }}>
          <FAQAccordion items={faqItems} />
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState(loadProgress().page);
  const [pagesText, setPagesText] = useState<PagesText>(loadProgress().pagesText);
  const [metrics, setMetrics] = useState<any>(loadProgress().metrics);

  useEffect(() => {
    // Guardar los cambios en localStorage cada vez que el estado cambie
    saveProgress({ page, metrics, pagesText });
  }, [page, metrics, pagesText]);

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
  const isInResultPage = page > pagesQtty && hasFileLoaded

  useEffect(() => {
    if (isInResultPage) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isInResultPage]);


  if (!hasFileLoaded) {
    return <div>
      <div className="header">
        <h1 className="title">Sinestesia Literaria <span className="very-red"> (Autoedición Lúdica)</span></h1>
      </div>
      <div className="container empty">
        <div className="initial-text-container">
          <div className="subtitle">
            Convertí tu borrador en gráfico, para ver lo que a simple vista solemos pasar por alto.
          </div>
          <ol
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              margin: '1.5em 0 2.5em 0',
              fontSize: '1.1em',
              listStyle: 'none',
              padding: '24px',
              background: '#222',
              borderRadius: '16px',
              gap: '1rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            {[
              'Subir pdf',
              'Aplicar herramientas lúdicas',
              'Descargar gráfico'
            ].map((text, idx) => (
              <li
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  width: '100%',
                  maxWidth: 480,
                  background: '#111',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#fff',
                  fontWeight: 500,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1a1a1a'
                  e.currentTarget.style.transform = 'scale(1.01)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#111'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    minHeight: 32,
                    borderRadius: '50%',
                    background: '#fff',
                    color: '#000',
                    fontWeight: 600,
                    fontSize: '1em',
                    marginRight: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {idx + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>



        </div>

        <div className="input-container">
          <FileUpload onFileChange={handleFileChange2} />
        </div>

        <ProspectoToggle />

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
          hasFileLoaded ? <button className="very-btn"
            onClick={() => {
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              window.location.reload();
            }}
          >Recargar</button> :
            <input type="file" accept="application/pdf" onChange={handleFileChange2} />
        }
        <div className="page-content" >
          {
            isInResultPage
              ? <div><div id="results">
                <LineChart dataToneX={x} dataToneY={tonesChartY} />
                <div className="result-list-container">
                  <div className="result-section-title">Respiración: <span className="section-index">{breathingOptions.map(el => <span className="index-name"><span className="index-color" style={{ backgroundColor: el.color }}></span>{el.label} </span>)}</span></div>
                  <div className="result-list">
                    {Object.values(metrics).map(item => item.breathing).map((el) => <span className={"result-list-item " + (100 / pagesQtty < 20 ? 'zoom' : '')} style={{ width: 100 / pagesQtty + "%", backgroundColor: breathingOptions.find(e => e.value === el)?.color, color: breathingOptions.find(e => e.value === el)?.fontColor }}></span>)}
                  </div>

                  <div className="result-section-title">Estaciones: <span className="section-index">{stationOptions.map(el => <span className="index-name"><span className="index-color" style={{ backgroundColor: el.color }}></span>{el.label} </span>)}</span></div>
                  <div className="result-list">
                    {Object.values(metrics).map(item => item.station).map((el) => <span className={"result-list-item " + (100 / pagesQtty < 20 ? 'zoom' : '')} style={{ width: 100 / pagesQtty + "%", backgroundColor: stationOptions.find(e => e.value === el)?.color }}></span>)}
                  </div>

                  <div className="result-section-title">Sabores: <span className="section-index">{options.map(el => <span className="index-name"><span className="index-color" style={{ backgroundColor: el.color }}></span>{el.label} </span>)}</span></div>
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
          isInResultPage
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

interface FileUploadProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload = ({ onFileChange }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <button type="button" className="very-btn"
        style={{ background: '#d95645', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 6, padding: '0.7em 1.5em', cursor: 'pointer' }}
        onClick={handleButtonClick}>
        Subir archivo
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFileChange}
      />
    </div>
  );
};

export default App;
