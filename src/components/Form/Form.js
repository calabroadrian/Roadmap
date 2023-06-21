import { useState, useEffect } from 'react';
import './Form.css';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const SPREADSHEET_ID = '1FLc7zZF5jLw_yZv6QU-3T-2yxmFyfxgueqr6GMTJPuc';
const CLIENT_EMAIL = 'prueba-sheet@test-agent-assist-351420.iam.gserviceaccount.com';
const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCSJdebGa6rEI/Z\nnbX2nbbUXgun9Q8UOs88Rqetl6D03sBxFITnM57karPgWKaeUxpH2RU4HpEYLadg\npdnVPgKcAQ1Cb1P4f8uv3Anj6JqmFIwNTq1tVuF/jCHoBnI+AqcFrTH7c83awcmu\nfyXyBIi7xZ1epsz9bymjWoCfVmAhxEABIhSzf54d77xPTDOFssTl6lo+ijjTvEX5\nozM8W4FGAAIIhr7rxSYwFtBt4lTKw0YBG3TNuyKOJjxoeCWnWp2X7n6t5W8d0brN\n5xb68MY+hwqjOEItliDXVf3/TDQNGKZR6bKF64DHeMuoAIsPyPp0y/2tsRTQzBAw\n+OINuyCtAgMBAAECggEAAlhURJNDASXaTQwHCgPqAFqES4e23CSnw8hAHgdfaDZ1\nIOC1qOO5kmGKQoNhpGDh0dJ6+5l1S2Lw0IVGFhzGhsbMi0BFOROh4CVCzQhOh54v\nnhy2Uy6687nlpwxdbmnKpiBrO3qWTG2MxShEoq9txeeL7iN1NBbXH0gkkAn0hRjT\nwfGXDopGKiU4p3cmjWEaLk8lQP5vSSlXrvJHTqQRKX4z/eKU+VnHqB8tdNTkMupw\n6htX4pJ/HLw4vmVAAqEW+yiZI3a9Tbat9aQT7XQBccUxDRdQfZyOUfOMnX9yYQ4P\nuuhLMGSsjHgp49wO0dyihuGatCNhFhyrMN2dBWotSQKBgQDC789BeCCOvDi029Kd\n3XzRFYQfpQaIT9UnHfPc7/3DAxbpbyhq29/xiga6EA7nLDWrR6uHE2gCkIwz77co\n2p9VCY32JsHCs7//mEedTsla+s4XtXY2790uTMTR3EVK7m2mxDgZfFVL8lJN975G\nV8r6synGzJoNrfFbNyDltho0iQKBgQC/7ZhJiJVwnbC/lxCoFy7RKlUsLq2tFWja\nLXh10swcdX+MF0/L9B8kpV9za458ajMBBPadeSbLN1u3igT94lAPjOrbpfwcIBEf\nAPL6ynVi1tR7KtqsLLC/dQivue0IxFMglo2lcrTAkwEI+PWZ7D3uBZAOpvfaZ953\nqSEbWqTKBQKBgQCBofQTt4z/HpAfRafUL3xXlpVcbePgNiarcrG/FSGN07oi1jbs\niPdtqro6dX9ToAS4uFqK4w7h1bpGt3z4ABrA9C+hp7hmgB6IHH5TUBd7FxqCjbvl\nYLGXnpmsbWzvHYtxwT8FQ7d9X9H34253XN6wxQBdIaa4vhmo7QpFeEoI8QKBgBEk\nyfuXhbG/hDA48DXzjC0G2QDPUpgpV2pVsXLk13KbVD9RPcF8FuQRGYuXyex3GAM5\nTEYYskxor3qfi36aHoilD717ACALBTx9uzaHqyCfC+/Mjife/hK8A4Ce3PtxffNl\nP1XN/zNMbkU858NOBOIkARAt/em2aXrK0rg8yod5AoGAO0BT7XCpMAeU5k4ELsON\nier5IyjYWWkSr6S3Ut82mo4V7qvI1YFgJFpQ/qG/ayY+2w/ybyPXf7LjwitXUaka\nyuQiJ8TMnKvVKB//nyJu9RNeDe0VvWOfjPFzsiFHs7UDfNCNKldu4Mdoamp3Dn1m\nWH4ubYBRXKIBLniMaIOYQss=\n-----END PRIVATE KEY-----\n';

function Form({ item, onAddItem, onDeselectItem, onUpdateItem, onDeleteItem, onCloseModal }) {
  const [Id, setId] = useState('');
  const [Descripcion, SetDescripcion] = useState('');
  const [Estado, setEstado] = useState('');
  const [Titulo, setTitulo] = useState('');
  const [idExists, setIdExists] = useState(false);

  useEffect(() => {
    if (item) {
      setId(item.Id);
      SetDescripcion(item.Descripcion);
      setEstado(item.Estado);
      setTitulo(item.Titulo);
      setIdExists(true);
    } else {
      setId('');
      SetDescripcion('');
      setEstado('');
      setTitulo('');
      setIdExists(false);
    }
  }, [item]);

  useEffect(() => {
    const checkIdExists = async () => {
      if (!Id) {
        return;
      }

      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      const rows = await sheet.getRows();
      const exists = rows.some(row => row.Id === Id);

      setIdExists(exists);
    };

    checkIdExists();
  }, [Id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (item) {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      const rows = await sheet.getRows();
      const rowToUpdate = rows.find(row => row.Id === item.Id);

      if (!rowToUpdate) {
        console.error('No se encontró el elemento a actualizar en el sheet.');
        return;
      }

      rowToUpdate.Id = Id;
      rowToUpdate.Descripcion = Descripcion;
      rowToUpdate.Estado = Estado;
      rowToUpdate.Titulo = Titulo;

      await rowToUpdate.save();

      onUpdateItem({
        id: item.id,
        Id,
        Descripcion,
        Estado,
        Titulo
      });
    } else {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      const rows = await sheet.getRows();
      const exists = rows.some(row => row.Id === Id);

      if (exists) {
        console.error('El ID ya existe en el sheet. Por favor, elige otro ID único.');
        return;
      }

      await sheet.addRow({ Id, Descripcion, Estado, Titulo });

      onAddItem({
        id: Date.now(),
        Id,
        Descripcion,
        Estado,
        Titulo
      });
    }

    onCloseModal();
    console.log("Formulario enviado");
    window.location.reload();
    console.log(item);
  };


  const handleDelete = async () => {
    onDeleteItem(item);
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(row => row._rawData[0] === item.Id);
    await rowToDelete.delete();
    onDeselectItem();
    onCloseModal();
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="form-header">
          <h2>Agregar nueva tarea</h2>
          <button className="form-close" onClick={onCloseModal}>X</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='form-group-1'>
            <div>
              <label>Id:</label>
              <input type="text" value={Id} onChange={(e) => setId(e.target.value)} required />
              {idExists && <p className="form-error">El ID ya existe en el sheet. Por favor, elige otro ID único.</p>}
            </div>
            <div>
              <label>Título:</label>
              <input type="text" value={Titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
            <div>
              <label>Descripción:</label>
              <textarea value={Descripcion} onChange={(e) => SetDescripcion(e.target.value)} required></textarea>
            </div>
            <div>
              <label>Estado:</label>
              <select value={Estado} onChange={(event) => setEstado(event.target.value)} required>
                <option value="">Select a status</option>
                <option value="to-do">Por hacer</option>
                <option value="in-progress">En progreso</option>
                <option value="done">Hecho</option>
              </select>
            </div>
          </div>
          <div className="form-group-2">
            <button className="form-submit" type="submit">{item ? 'Modificar' : 'Agregar'}</button>
            {item && <button className="form-delete" type="button" onClick={handleDelete}>Eliminar</button>}
            {item && <button className="form-cancel" type="button" onClick={onDeselectItem}>Cancelar</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;