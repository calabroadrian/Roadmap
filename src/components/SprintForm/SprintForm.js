// src/components/SprintManager.js
import React, { useState, useEffect } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Typography,
  Stack
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import config from '../../config/config';

const { SPREADSHEET_ID, CLIENT_EMAIL, PRIVATE_KEY } = config;

export default function SprintManager() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [current, setCurrent] = useState({ id: null, nombre: '', inicio: '', fin: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSprints();
  }, []);

  const authenticate = async () => {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    return doc.sheetsByTitle['Sprints'];
  };

  const fetchSprints = async () => {
    setLoading(true);
    try {
      const sheet = await authenticate();
      const rows = await sheet.getRows();
      setSprints(rows.map(r => ({
        id: r.ID,
        nombre: r.Nombre,
        inicio: r.FechaDeInicio,
        fin: r.FechaDeFin,
        dias: r.Dias
      })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openModal = (sprint = { id: null, nombre: '', inicio: '', fin: '' }) => {
    setCurrent(sprint);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrent({ id: null, nombre: '', inicio: '', fin: '' });
  };

  const getNextId = () => {
    const ids = sprints.map(s => parseInt(s.id, 10));
    return ids.length ? Math.max(...ids) + 1 : 1;
  };

  const saveSprint = async () => {
    if (!current.nombre || !current.inicio || !current.fin) return;
    setSaving(true);
    try {
      const sheet = await authenticate();
      const diff = Math.ceil((new Date(current.fin) - new Date(current.inicio)) / (1000 * 60 * 60 * 24));
      if (current.id) {
        const rows = await sheet.getRows();
        const row = rows.find(r => r.ID === current.id.toString());
        Object.assign(row, {
          Nombre: current.nombre,
          FechaDeInicio: current.inicio,
          FechaDeFin: current.fin,
          Dias: diff
        });
        await row.save();
      } else {
        await sheet.addRow({
          ID: getNextId(),
          Nombre: current.nombre,
          FechaDeInicio: current.inicio,
          FechaDeFin: current.fin,
          Dias: diff
        });
      }
      await fetchSprints();
      closeModal();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Sprints</Typography>
        <Tooltip title="Agregar Sprint">
          <IconButton onClick={() => openModal()}>
            <Add />
          </IconButton>
        </Tooltip>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Inicio</TableCell>
                  <TableCell>Fin</TableCell>
                  <TableCell>Días</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sprints.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.nombre}</TableCell>
                    <TableCell>{s.inicio}</TableCell>
                    <TableCell>{s.fin}</TableCell>
                    <TableCell>{s.dias}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar Sprint">
                        <IconButton size="small" onClick={() => openModal(s)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!sprints.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay sprints.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>{current.id ? 'Editar Sprint' : 'Nuevo Sprint'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
          <TextField
            label="Nombre"
            fullWidth
            value={current.nombre}
            onChange={e => setCurrent(c => ({ ...c, nombre: e.target.value }))}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Inicio"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={current.inicio}
              onChange={e => setCurrent(c => ({ ...c, inicio: e.target.value }))}
            />
            <TextField
              label="Fin"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={current.fin}
              onChange={e => setCurrent(c => ({ ...c, fin: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} disabled={saving}>Cancelar</Button>
          <Button onClick={saveSprint} variant="contained" disabled={saving || !current.nombre || !current.inicio || !current.fin}>
            {saving ? 'Guardando...' : (current.id ? 'Guardar Cambios' : 'Agregar Sprint')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SprintForm;
