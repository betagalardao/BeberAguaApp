//contexto e o provedor para gerenciar o tema do app
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_PATH = "beberagua:notificationSettings";
const ThemeContext = createContext(); //cria um contexto para o tema.

//ThemeProvider usa o useColorScheme para inicializar o tema e AsyncStorage para persistência.
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeName] = useState(systemColorScheme || "light");
  //theme define cores para os modos claro e escuro.
  const theme = themes[themeName];

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_PATH);
        const settings = savedSettings ? JSON.parse(savedSettings) : {};
        setThemeName(settings.theme || systemColorScheme || "light");
      } catch (error) {
        console.error("Erro ao carregar tema:", error);
        setThemeName(systemColorScheme || "light");
      }
    };
    loadTheme(); //carrega o tema salvo ou usa o esquema padrão do sistema.
  }, []);

  //setTheme é uma função para mudar o tema manualmente e salvar a escolha.
  const setTheme = async (newTheme) => {
    setThemeName(newTheme);
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_PATH);
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      await AsyncStorage.setItem(SETTINGS_PATH, JSON.stringify({ ...settings, theme: newTheme }));
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

//useTheme é um hook para acessar o tema e a função de mudança.
export const useTheme = () => useContext(ThemeContext);

//Definição dos Temas
export const themes = {
    light: {
      background: "#E3F2FD",
      cardBackground: "#FFF",
      primary: "#2196F3",
      primaryDark: "#1976D2",
      text: "#333",
      secondaryText: "#666",
      error: "#D32F2F",
      tabBarBackground: "#FFF",
      tabBarBorder: "#E3F2FD",
      headerColor: "#fff"
    },
    dark: {
      background: "#1E1E1E",
      cardBackground: "#2C2C2C",
      primary: "#42A5F5",
      primaryDark: "#90CAF9",
      text: "#E0E0E0",
      secondaryText: "#B0B0B0",
      error: "#EF5350",
      tabBarBackground: "#2C2C2C",
      tabBarBorder: "#424242",
      headerColor: "#2C2C2C"
    }
  };