import { useState } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import './SprintForm.css';
import { SPREADSHEET_ID, CLIENT_EMAIL, PRIVATE_KEY } from '../../config/config';
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
