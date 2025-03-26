import './DesignThinkingSidebar.css';
import React, { useState, useEffect } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import config from '../../config/config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const CLIENT_EMAIL = config.CLIENT_EMAIL;
const PRIVATE_KEY = config.PRIVATE_KEY;


const DesignThinkingSidebar = ({ taskId }) => {
  const [sections, setSections] = useState([
    { title: 'Empatía', expanded: false, text: '', currentState: '' },
    { title: 'Definición del Problema', expanded: false, text: '', currentState: '' },
    { title: 'Ideación', expanded: false, text: '', currentState: '' },
    { title: 'Prototipado', expanded: false, text: '', currentState: '' },
    { title: 'Pruebas', expanded: false, text: '', currentState: '' },
    { title: 'Implementación', expanded: false, text: '', currentState: '' }
  ]);

  const fetchDesignThinkingData = async () => {
    try {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      await doc.loadInfo();

      const sheet = doc.sheetsByTitle['DesignThinking'];
      const rows = await sheet.getRows({ query: `TareaID = ${taskId}` });

      const dataBySection = {};

      rows.forEach((row) => {
        const [currentTaskId, sectionTitle, text, currentState] = row._rawData;
        if (!dataBySection[sectionTitle]) {
          dataBySection[sectionTitle] = [];
        }
        dataBySection[sectionTitle].push({ taskId: currentTaskId, text, sectionTitle, currentState });
      });

      const updatedSections = sections.map((section) => {
        const sectionData = dataBySection[section.title];
        if (sectionData && sectionData.length > 0) {
          const matchingRow = sectionData.find((data) => data.taskId === taskId);
          if (matchingRow) {
            return { ...section, text: matchingRow.text, currentState: matchingRow.currentState };
          }
        }
        return section;
      });

      setSections(updatedSections);
    } catch (error) {
      console.error('Error al obtener los datos de Design Thinking:', error);
    }
  };

  useEffect(() => {
    fetchDesignThinkingData();
  }, [taskId]);

  const saveDesignThinkingData = async () => {
    try {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      await doc.loadInfo();

      const sheet = doc.sheetsByTitle['DesignThinking'];

      for (const section of sections) {
        const row = [taskId, section.title, section.text, section.currentState];
        await sheet.addRow(row);
      }

      console.log('Datos de Design Thinking guardados exitosamente.');
    } catch (error) {
      console.error('Error al guardar los datos de Design Thinking:', error);
    }
  };

  const toggleSection = (index) => {
    const updatedSections = sections.map((section, i) => {
      if (i === index) {
        return { ...section, expanded: !section.expanded };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const handleInputChange = (index, value) => {
    const updatedSections = [...sections];
    updatedSections[index].text = value;
    setSections(updatedSections);
  };

  const handleStateChange = (index, newState) => {
    const updatedSections = sections.map((section, i) => {
      if (i === index) {
        return { ...section, currentState: newState };
      }
      return section;
    });
    setSections(updatedSections);
  };

  return (
    <div className="design-thinking-sidebar">
      <h2 className="sidebar-title">Proceso de Design Thinking</h2>
      
      <div className="design-thinking-flow">
        {sections.map((section, index) => (
          <div className={`flow-step ${section.currentState}`} key={index}>
            <div className="step-state-circle">
            <div className={`step-state ${section.currentState === 'Hecho' ? 'step-state-green' : (section.currentState === 'En Progreso' ? 'step-state-yellow' : 'step-state-red')}`}></div>
            </div>
            <div className="step-content">
              <p className="step-title" onClick={() => toggleSection(index)}>{section.title}</p>
              {section.expanded && (
                <div className="step-details">
<ReactQuill
  className="step-input"
  value={section.text}
  onChange={(value) => handleInputChange(index, value)}
  placeholder="Añadir notas..."
/>
                  <select
                    className="step-select"
                    value={section.currentState}
                    onChange={(event) => handleStateChange(index, event.target.value)}
                    required
                  >
                    <option value="Por hacer">Por hacer</option>
                    <option value="En Progreso">En progreso</option>
                    <option value="Hecho">Hecho</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
              <button className="step-button" onClick={saveDesignThinkingData}>Guardar</button>
      </div>
    </div>
  );
};

export default DesignThinkingSidebar;
