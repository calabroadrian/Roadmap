import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import html2canvas from 'html2canvas';
import Draggable from 'react-draggable';

function App() {
  const [linkedinId, setLinkedinId] = useState('');
  const [profileImage, setProfileImage] = useState(''); // Nuevo estado para la imagen de perfil
  const [uploadedImage, setUploadedImage] = useState(false);
  const badgeElmRef = useRef(null);
  const waitObserver = useRef(null);
  const [output] = useState('');
  const [json, setJson] = useState({
    id: "",
    img: "#",
    name: "Not available",
    title: "Not available",
    info: "Not available",
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [url, setUrl] = useState('');
  
  

  const handleDrag = (e, ui) => {
    const { x, y } = ui;
    setPosition({ x, y });
  };

  const handleMove = (direction) => {
    const increment = 2; // Puedes ajustar este valor según tu preferencia
    let x = position.x;
    let y = position.y;

    if (direction === 'up') y -= increment;
    if (direction === 'down') y += increment;
    if (direction === 'left') x -= increment;
    if (direction === 'right') x += increment;

    setPosition({ x, y });
  };

  const handleScaleUp = () => {
    setScale(Math.min(scale + 0.01, 2)); // Escala máxima: 2
    generateBadge()
  };

  const handleScaleDown = () => {
    setScale(Math.max(scale - 0.01, 1)); // Escala mínima: 0.1
    generateBadge()
  };

  function handleScaleChange(event) {
    setScale(parseFloat(event.target.value));
  }


  function getData(lknid) {
    console.log("getData");
    setLinkedinId(lknid);
    const badgeHTMLContent = `<div class="badge-base LI-profile-badge" data-locale="es_ES" data-size="large" data-theme="light" data-type="HORIZONTAL" data-vanity="${lknid}" data-version="v1"><a class="badge-base__link LI-simple-link" href="https://ar.linkedin.com/in/${lknid}?trk=profile-badge"></a></div>`;
    badgeElmRef.current.innerHTML = badgeHTMLContent;
    setUrl(badgeHTMLContent);
    console.log(url);
    loadProfileJs();
  }

  function loadProfileJs() {
    console.log("loadProfileJs");
    var script = document.createElement("script");
    script.onload = function () {
      waitObserver.current = setInterval(domObserve, 1000);
    };
    script.src = "https://platform.linkedin.com/badges/js/profile.js";
    document.head.appendChild(script);
  }

  function domObserve() {
    console.log("domObserve");
    let badgeElm = badgeElmRef.current;
    console.log(badgeElm);
    
    // Verificar si badgeElm no es null
    if (badgeElm) {
        clearInterval(waitObserver.current);

        // Obtener el iframe dentro de badgeElm
        const iframe = badgeElm.querySelector("iframe");

        if (iframe) {
            // Acceder al contenido del iframe
            const iframeContent = iframe.contentDocument || iframe.contentWindow.document;

            // Buscar la etiqueta img dentro del contenido del iframe
            const profileImage1 = iframeContent.querySelector("img.artdeco-entity-image");
            const profileImage = profileImage1.getAttribute("src");

            if (profileImage1) {
                const imgSrc = profileImage1.getAttribute("src");
                console.log(imgSrc); // Agregar este console.log para verificar el valor de imgSrc
                const newJson = {
                    id: linkedinId,
                    img: imgSrc || "Not available",
                };
                setJson(newJson);
                console.log(profileImage);
                handleLinkedInProfileImage(imgSrc);
            }
        }
    }
}

function generateBadge() {
  const badgeText = document.getElementById('badgeText').value;
  const badgeColor = document.getElementById('badgeColor').value;
  const textColor = document.getElementById('textColor').value;
  const strokeWidth = document.getElementById('strokeWidth').value;
  const fontSize = document.getElementById('fontSize').value;
  const fontFamily = document.getElementById('fontFamily').value;

  const badgeContainer = document.createElement('div');
  const jsonImg = json.img;

  const profileImg = new Image();
  profileImg.crossOrigin = "Anonymous";
  profileImg.src = jsonImg;

  badgeContainer.id = 'badgeContainer';
  badgeContainer.classList.add('badge-container');

  const badge = document.createElement('div');
  badge.classList.add('badge');

  const profileImage = document.querySelector('.card-body img');
  const imageSize = parseInt(profileImage.style.height, 10);

  const existingBadge = document.getElementById('badgeContainer');

  if (existingBadge) {
      existingBadge.remove();
  }

  badge.innerHTML = `
  <div class="main_circle_text">
      <svg viewBox="0 0 ${imageSize} ${imageSize}" style="border-radius: 100%;" width="${imageSize}" height="${imageSize}">
          <defs>
              <path id="circle" d="
                  M ${imageSize / 2}, ${imageSize / 2}
                  m 0, -${imageSize / 2 - 2}
                  a ${imageSize / 2 - 2},${imageSize / 2 - 2} 0 0,0 0,${imageSize - 4}
                  a ${imageSize / 2 - 2},${imageSize / 2 - 2} 0 0,0 0,-${imageSize - 4}"></path>
              <linearGradient id="grad1" x1="80%" y1="60%" x2="60%" y2="100%">
                  <stop offset="0%" style="stop-color:${badgeColor};stop-opacity:0" />
                  <stop offset="100%" style="stop-color:${badgeColor};stop-opacity:1" />
              </linearGradient>
          </defs>
          <circle cx="${imageSize / 2}" cy="${imageSize / 2}" r="${imageSize / 2 - 2}" fill="transparent" stroke="url(#grad1)" stroke-width="${strokeWidth}" />
          <text font-size="${fontSize}" font-family="${fontFamily}" font-weight="bold" text-anchor="middle" dy="-2" letter-spacing="2">
              <textPath xlink:href="#circle" startOffset="40%" direction="ltr">
                  <tspan fill="${textColor}">${badgeText}</tspan>
              </textPath>
          </text>
      </svg>
  </div>
`;

  // Agrega el badge al contenedor
  badgeContainer.appendChild(badge);

  // Agrega el badge al DOM
  profileImage.style.position = 'relative';
  profileImage.parentElement.insertBefore(badgeContainer, profileImage);
}



  function exportImage() {
    const profileImg = new Image();
    profileImg.crossOrigin = "Anonymous";
    profileImg.src = profileImage;
  
    profileImg.onload = function () {
      const imageSize = 200; // Tamaño del círculo
  
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      // Establecemos el tamaño del canvas
      canvas.width = imageSize;
      canvas.height = imageSize;
  
      // Dibujamos la imagen de perfil
      ctx.drawImage(profileImg, position.x, position.y, imageSize, imageSize); // Usamos las coordenadas de la posición
  
      // Obtener el elemento SVG
      const badgeContainer = document.querySelector('.main_circle_text');
  
      // Crear una imagen a partir del SVG
      html2canvas(badgeContainer, { backgroundColor: null }).then(canvasBadge => {
  
        // Crear un canvas para combinar las imágenes
        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.width = imageSize;
        combinedCanvas.height = imageSize;
        const combinedCtx = combinedCanvas.getContext('2d');
  
        // Mejorar la calidad de interpolación
        combinedCtx.imageSmoothingQuality = 'high';
  
        // Dibujar la imagen de perfil y el círculo
        combinedCtx.drawImage(canvas, 0, 0);
  
        // Dibujar el badge con el texto
        combinedCtx.drawImage(canvasBadge, 0, 0, 205, 205);
  
        // Convertir el canvas combinado a una imagen data URL (en formato JPEG)
        const imgDataCombined = combinedCanvas.toDataURL('image/jpeg', 0.9); // Cambiamos a formato JPEG
  
        // Iniciar la descarga de la imagen
        const a = document.createElement('a');
        a.href = imgDataCombined;
        a.download = 'badge.jpg'; // Cambiamos la extensión del archivo a .jpg
        a.click();
      });
    };
  }
  

  // Agregamos una función para manejar la subida de la imagen
  function handleImageUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = function (e) {
      const imageSrc = e.target.result;
      setProfileImage(imageSrc);
      setUploadedImage(true); // Aquí establecemos uploadedImage a true
    };
  
    reader.readAsDataURL(file);
  }

  function preloadExampleImage() {
    const exampleImageUrl = '/logo-header.jpg'; // Reemplaza esto con la URL de la imagen de ejemplo
    const img = new Image();
    img.onload = function() {
      setProfileImage(exampleImageUrl);
      setUploadedImage(true);
    };
    img.src = exampleImageUrl;
  }
  
  useEffect(() => {
    preloadExampleImage();
  }, []);

  const buttonStyle = {
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#007BFF',
    color: '#FFFFFF'
  };


  function handleLinkedInProfileImage(imageUrl) {
    setProfileImage(imageUrl);
    setUploadedImage(true);
  }
  
  return (
    <div className="app-container">
<header className="app-header">
  <img src=  '/logo-header.jpg'  alt="Logo" className="app-logo" />
  <h1 className="app-title">Profile Badge Generator</h1>
</header>
      <div className="app-content">
        <div className="card-form">
          <div className="card-body">
            <form className="search-form">
              <div className="form-group">
                <label htmlFor="lknid">Usar imagen de perfil Linkedin</label>
                <div className="input-group">
                  <input className="form-control" type="text" id="lknid" placeholder='Username'/>
                  <button onClick={() => getData(document.getElementById('lknid').value)} className="btn btn-primary-large" type="button">Search </button>
                  <div className="form-group">
                      <label htmlFor="profileImage">Subir Imagen de Perfil</label>
                      <input
                        type="file"
                        className="form-control"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                </div>
              </div>
            </form>
            <div className="badge-form">
              <div className="form-row">
                <div className="col">
                  <label htmlFor="badgeText">Badge Text</label>
                  <input className="form-control" type="text" id="badgeText" />
                </div>
                <div className="col">
                  <label htmlFor="badgeColor">Badge Color</label>
                  <input className="form-control" type="color" id="badgeColor" defaultValue="#FF5722" />
                </div>
                <div className="col">
                  <label htmlFor="textColor">Text Color</label>
                  <input className="form-control" type="color" id="textColor" defaultValue="#FFFFFF" />
                </div>
                <div className="col">
                  <label htmlFor="strokeWidth">Stroke Width:</label>
                  <input className="form-control" type="number" id="strokeWidth" min="1" max="100" defaultValue="50" />
                </div>
                <div className="form-group">
                            <label htmlFor="fontSize">Tamaño de la Fuente</label>
                            <input className="form-control" type="number" id="fontSize" defaultValue="20" min="1" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fontFamily">Tipo de Fuente</label>
                            <select className="form-control" id="fontFamily" defaultValue="Verdana">
                                <option value="Arial">Arial</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Tahoma">Tahoma</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Times New Roman">Times New Roman</option>
                            </select>
                        </div>
              </div>
              <div className="form-row">
                <div className="col2">
                  
                  <button onClick={generateBadge} className="btn btn-primary" type="button">Generate Badge</button>
                  <button onClick={exportImage} className="btn btn-secondary" type="button">Exportar Imagen</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="form-container">
          <div className="info-container">
            <h2>Badges para LinkedIn</h2>
            <p>Nuestra herramienta de creación de badges para LinkedIn es una manera efectiva de destacar tus logros, valores y afiliaciones de manera visualmente atractiva y significativa.</p>
          </div>
          <div className="controls-container">
  <div className="move-buttons">
    <button className="move-button" onClick={() => handleMove('up')}>↑</button>
    <button className="move-button" onClick={() => handleMove('left')}>←</button>
    <button className="move-button" onClick={() => handleMove('right')}>→</button>
    <button className="move-button" onClick={() => handleMove('down')}>↓</button>
  </div>
  <div className="scale-controls">
  <button className="scale-button" onClick={handleScaleDown}>-</button>
    {/* <label className="scale-label">
      <input
        type="range"
        className="scale-input"
        min="0.1"
        max="2"
        step="0.1"
        value={scale}
        onChange={handleScaleChange}
      />
    </label> */}
    <button className="scale-button" onClick={handleScaleUp}>+</button>
  </div>
</div>

          {profileImage && uploadedImage && (
  <div className="card" style={{ margin: '24px', border: '2px solid #ccc', borderRadius: '8px', padding: '16px', boxShadow: '0px 18px 80px rgba(0,0,0,0.22)' }}>
    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="profile-image" style={{ textAlign: 'center', marginBottom: '16px' }}>
        {profileImage && (
          <Draggable
            bounds="parent"
            position={position}
            onDrag={handleDrag}
          >
            <img
              src={profileImage}
              style={{
                height: `${200 * scale}px`,
                width: `${200 * scale}px`,
                borderRadius: '50%',
                cursor: 'move'
              }}
              alt="Profile"
            />
          </Draggable>
        )}
      </div>
    </div>
  </div>
)}


        </div>  

        <div class="usos">
  <h2>Usos Potenciales</h2>
  <ul class="badge-list">
  <li>Badges Comunitarios: #Hearing, #TechForGood, #GreenInitiative</li>
  <img src="community_badges_image.jpg" alt="Community Badges Image"/>
    <li>Badges Ecológicos: #EcoFriendly, #ZeroWaste, #RenewableEnergy</li>
    <img src='/eco_badges_image.jpg' alt="Eco Badges Image"/>
    <li>Badges de Empresas: #Globytes, #TechInnovator, #GreenCompany</li>
    <img src="company_badges_image.jpg" alt="Company Badges Image"/>
    <li>Reconocimientos y Logros: #TopPerformer, #TeamPlayer, #Innovator</li>
    <img src="achievements_badges_image.jpg" alt="Achievements Badges Image"/>
</ul>
  </div>            
      </div>

      <div class="beneficios">
      <div dangerouslySetInnerHTML={{ __html: url }} />
  <div class="beneficios1">      
  <ul>
    <li>Aumenta la visibilidad y credibilidad del perfil de LinkedIn.</li>
    <li>Facilita la conexión con comunidades afines y el establecimiento de redes profesionales.</li>
    <li>Potencia la imagen de marca personal o empresarial.</li>
    <li>Fomenta la participación y el reconocimiento dentro de la comunidad LinkedIn.</li>
  </ul>
  </div>   
</div>
      <div id="output" className="output" dangerouslySetInnerHTML={{ __html: output }} />
      <div id="hideBadgeElm" style={{ display: 'none' }} ref={badgeElmRef}></div>

      {/* Agregamos el campo de entrada de archivo para subir la imagen */}
      
      {/* Mostramos la imagen de perfil seleccionada */}


    </div>
    
  );

}

export default App;
