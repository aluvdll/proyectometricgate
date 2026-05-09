import axios from "axios";
import type { Usuario } from "../types/Usuarios";

// Tipado para datos de login
interface LoginData {
  email: string;
  password: string;
}



// Función que llama al backend para login
export const loginUsuario = async (data: LoginData) => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/api/login", data);
    return response.data; // { mensaje, usuario }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      // Error enviado por el backend
      throw new Error(error.response.data.error);
    } else {
      // Error de conexión
      throw new Error("Error de conexión con el servidor");
    }
  }
};


export const addUsuario = async (data: Usuario, file?: File) => {
  try {
    const formData = new FormData();

    formData.append("name", data.nombre);
    formData.append("apellido1", data.apellido1);
    formData.append("apellido2", data.apellido2);
    formData.append("email", data.email);
    formData.append("password", data.password || "");

    
    if (file) {
      formData.append("avatar", file);
    }

    const response = await axios.post("http://127.0.0.1:8000/api/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error("Error de conexión con el servidor");
    }
  }
    
};

