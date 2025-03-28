//tela de configurações
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Switch, ActivityIndicator, TextInput, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateNotifications } from "../../utils/notifications";
import Slider from "@react-native-community/slider";
import { useTheme, themes } from "../../utils/ThemeContext";

const SETTINGS_PATH = "beberagua:notificationSettings";
const INTERVAL_MIN = 0.01;
const INTERVAL_MAX = 4;
const INTERVAL_STEP = 0.01;
const META_DIARIA_KEY = "metaDiariaAgua"; // chave para a meta diária

//lógica principal
export default function SettingsScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [interval, setInterval] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { theme, setTheme } = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(theme === themes.dark);
    const [metaInput, setMetaInput] = useState(""); // estado para o input da meta
    
    const toggleTheme = (value) => { //alterna os temas
      setIsDarkMode(value);
      setTheme(value ? "dark" : "light");
    };
  
    useEffect(() => {
      loadSettings(); //carrega as configurações salvas no AsyncStorage
    }, []);

    const loadSettings = async () => {
      try {
          const savedSettings = await AsyncStorage.getItem(SETTINGS_PATH);
          if (savedSettings) {
              const { enabled, interval: savedInterval, theme: savedTheme } = JSON.parse(savedSettings);
              setNotificationsEnabled(enabled);
              setInterval(parseFloat(savedInterval) || 1);
              setIsDarkMode(savedTheme === "dark");
          } else {
              setInterval(1);
          }
      } catch (e) {
          console.error("Erro ao carregar configurações:", e);
      } finally {
          setIsLoading(false);
      }
  };
    const saveMeta = async () => {
      if (metaInput) {
        await AsyncStorage.setItem(META_DIARIA_KEY, metaInput);
          alert("Meta diária salva!");
      } else {
          alert("Por favor, insira uma meta válida.");
      }
  };

if (isLoading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.setting}>
                <Text style={[styles.label, { color: theme.secondaryText }]}>
                    Modo Escuro
                </Text>
                <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={{ false: "#ccc", true: theme.primary }}
                    thumbColor={isDarkMode ? theme.primaryDark : "#f4f3f4"}
                />
            </View>
            <View style={styles.setting}>
                <Text style={[styles.label, { color: theme.secondaryText }]}>
                    Meta Diária de Copos
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Defina sua meta diária"
                    keyboardType="numeric"
                    value={metaInput}
                    onChangeText={setMetaInput}
                />
                <Button title="Salvar Meta" onPress={saveMeta} />
            </View>
        </View>
    </View>
  );
}

//estilos
const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 15,
},
card: {
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
},
setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
},
label: {
    fontSize: 18,
    fontWeight: "500",
},
input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    flex: 1,
},
loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
},
});