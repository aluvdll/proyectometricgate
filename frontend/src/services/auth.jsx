import axios from "axios";
import { API_URL } from "./apiBase";

const AUTH_LOGIN_URL = `${API_URL}/api/login`;

// Funcion que llama al backend para login
export const loginUsuario = async (data) => {
  try {
    const response = await axios.post(AUTH_LOGIN_URL, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Error enviado por el backend
      throw new Error(error.response.data.error);
    }

    // Error de conexión
    throw new Error("Error de conexión con el servidor");
  }
};
