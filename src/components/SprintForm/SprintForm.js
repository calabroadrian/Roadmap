import { useState } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import './SprintForm.css';

const SPREADSHEET_ID = '1FLc7zZF5jLw_yZv6QU-3T-2yxmFyfxgueqr6GMTJPuc';
const CLIENT_EMAIL = 'prueba-sheet@test-agent-assist-351420.iam.gserviceaccount.com';
const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCSJdebGa6rEI/Z\nnbX2nbbUXgun9Q8UOs88Rqetl6D03sBxFITnM57karPgWKaeUxpH2RU4HpEYLadg\npdnVPgKcAQ1Cb1P4f8uv3Anj6JqmFIwNTq1tVuF/jCHoBnI+AqcFrTH7c83awcmu\nfyXyBIi7xZ1epsz9bymjWoCfVmAhxEABIhSzf54d77xPTDOFssTl6lo+ijjTvEX5\nozM8W4FGAAIIhr7rxSYwFtBt4lTKw0YBG3TNuyKOJjxoeCWnWp2X7n6t5W8d0brN\n5xb68MY+hwqjOEItliDXVf3/TDQNGKZR6bKF64DHeMuoAIsPyPp0y/2tsRTQzBAw\n+OINuyCtAgMBAAECggEAAlhURJNDASXaTQwHCgPqAFqES4e23CSnw8hAHgdfaDZ1\nIOC1qOO5kmGKQoNhpGDh0dJ6+5l1S2Lw0IVGFhzGhsbMi0BFOROh4CVCzQhOh54v\nnhy2Uy6687nlpwxdbmnKpiBrO3qWTG2MxShEoq9txeeL7iN1NBbXH0gkkAn0hRjT\nwfGXDopGKiU4p3cmjWEaLk8lQP5vSSlXrvJHTqQRKX4z/eKU+VnHqB8tdNTkMupw\n6htX4pJ/HLw4vmVAAqEW+yiZI3a9Tbat9aQT7XQBccUxDRdQfZyOUfOMnX9yYQ4P\nuuhLMGSsjHgp49wO0dyihuGatCNhFhyrMN2dBWotSQKBgQDC789BeCCOvDi029Kd\n3XzRFYQfpQaIT9UnHfPc7/3DAxbpbyhq29/xiga6EA7nLDWrR6uHE2gCkIwz77co\n2p9VCY32JsHCs7//mEedTsla+s4XtXY2790uTMTR3EVK7m2mxDgZfFVL8lJN975G\nV8r6synGzJoNrfFbNyDltho0iQKBgQC/7ZhJiJVwnbC/lxCoFy7RKlUsLq2tFWja\nLXh10swcdX+MF0/L9B8kpV9za458ajMBBPadeSbLN1u3igT94lAPjOrbpfwcIBEf\nAPL6ynVi1tR7KtqsLLC/dQivue0IxFMglo2lcrTAkwEI+PWZ7D3uBZAOpvfaZ953\nqSEbWqTKBQKBgQCBofQTt4z/HpAfRafUL3xXlpVcbePgNiarcrG/FSGN07oi1jbs\niPdtqro6dX9ToAS4uFqK4w7h1bpGt3z4ABrA9C+hp7hmgB6IHH5TUBd7FxqCjbvl\nYLGXnpmsbWzvHYtxwT8FQ7d9X9H34253XN6wxQBdIaa4vhmo7QpFeEoI8QKBgBEk\nyfuXhbG/hDA48DXzjC0G2QDPUpgpV2pVsXLk13KbVD9RPcF8FuQRGYuXyex3GAM5\nTEYYskxor3qfi36aHoilD717ACALBTx9uzaHqyCfC+/Mjife/hK8A4Ce3PtxffNl\nP1XN/zNMbkU858NOBOIkARAt/em2aXrK0rg8yod5AoGAO0BT7XCpMAeU5k4ELsON\nier5IyjYWWkSr6S3Ut82mo4V7qvI1YFgJFpQ/qG/ayY+2w/ybyPXf7LjwitXUaka\nyuQiJ8TMnKvVKB//nyJu9RNeDe0VvWOfjPFzsiFHs7UDfNCNKldu4Mdoamp3Dn1m\nWH4ubYBRXKIBLniMaIOYQss=\n-----END PRIVATE KEY-----\n';

function SprintForm({ onCloseModal }) {
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nombre || !fechaInicio || !fechaFin) {
      console.error('Faltan campos obligatorios.');
      return;
    }

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Sprints']; // Obtén la hoja existente por su título

    const id = sheet.rowCount + 1;
    const diffInDays = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24));

    const newRow = await sheet.addRow({
      ID: id,
      Nombre: nombre,
      FechaDeInicio: fechaInicio,
      FechaDeFin: fechaFin,
      Dias: diffInDays,
    });

    console.log(`Se agregó un nuevo sprint con ID ${id}`);

    setNombre('');
    setFechaInicio('');
    setFechaFin('');

    onCloseModal();
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="form-header">
        <h2>Agregar Sprint</h2>
          <button className="form-close" onClick={onCloseModal}>
            X
          </button>
        </div>
    <form className="sprint-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="nombre">Nombre:</label>
        <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="fechaInicio">Fecha de inicio:</label>
        <input type="date" id="fechaInicio" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="fechaFin">Fecha de fin:</label>
        <input type="date" id="fechaFin" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
      </div>
      <div className="form-group">
        <button type="submit">Agregar Sprint</button>
      </div>
    </form>
    </div>
    </div>
  );
}

export default SprintForm;
