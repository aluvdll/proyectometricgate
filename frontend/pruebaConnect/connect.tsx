import axios from "axios";  
const endPointPrueba = "http://localhost:3001/usuario";

export interface Usuarios {
  id: number;
  nombre: string;       
    apellido1: string;
    apellido2: string;
    correo_electronico: string;
}

export const getUsuarios = async () => {
return axios.get<Usuarios[]>(endPointPrueba).then(response => response.data);  
};  


