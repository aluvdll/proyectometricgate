import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Definimos la interfaz según tu tabla
interface Usuario {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  correo_electronico: string;
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); // estado para guardar usuarios
  const [loading, setLoading] = useState<boolean>(true);

  // useEffect se ejecuta al montar el componente
  useEffect(() => {
    // Petición Axios al backend
    axios.get<Usuario[]>('http://localhost:3001/usuario')
      .then(response => {
        setUsuarios(response.data); // guardamos los datos en el estado
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al obtener usuarios:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <div>
      <h2>Lista de usuarios</h2>
      {usuarios.map(u => (
        <div key={u.id}>
          {u.nombre} {u.apellido1} {u.apellido2} - {u.correo_electronico}
        </div>
      ))}
    </div>
  );
};

export default Usuarios;
