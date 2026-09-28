import Dexie from 'dexie';

export const db = new Dexie('LilyLuzDB');

db.version(1).stores({
  citas: '++id, nombrePerro, tutor, fecha, hora, estado, notas',
  perros: '++id, nombrePerro, tutor, historial',
  finanzas: '++id, tipo, monto, metodo, fecha'
});
