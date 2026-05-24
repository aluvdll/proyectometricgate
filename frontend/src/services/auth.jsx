import axios from "axios";
import { API_URL } from "./apiBase";

const AUTH_LOGIN_URL = `${API_URL}/api/login`;

// Funcion que llama al backend para login
export const loginUsuario = async (data) => {
  try {
    const response = await axios.post(AUTH_LOGIN_URL, data);
    return response.data; // { mensaje, usuario }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Error enviado por el backend
      throw new Error(error.response.data.error);
    }

    // Error de conexion
    throw new Error("Error de conexion con el servidor");
  }
};

export const addUsuario = async (data, file) => {
  try {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("apellido1", data.apellido1);
    formData.append("apellido2", data.apellido2);
    formData.append("email", data.email);
    formData.append("password", data.password || "");

    if (file) {
      formData.append("avatar", file);
    }

    const response = await axios.post(AUTH_LOGIN_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }

    throw new Error("Error de conexion con el servidor");
  }
};
