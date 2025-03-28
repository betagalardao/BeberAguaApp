//tela de configurações
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Switch, ActivityIndicator, Button } from "react-native";
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
    const [metaDiaria, setMetaDiaria] = useState(0); //estado para o meta diaria iniciando com 0
    
    const toggleTheme = (value) => { //alterna os temas
      setIsDarkMode(value);
      setTheme(value ? "dark" : "light");
    };
  
    useEffect(() => {
      loadSettings(); //carrega as configurações salvas no AsyncStorage
      loadMetaDiaria();
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

    const loadMetaDiaria = async () => {
        try {
          const savedMeta = await AsyncStorage.getItem(META_DIARIA_KEY);
          if (savedMeta) {
            setMetaDiaria(parseInt(savedMeta, 10)); // Define a meta diária com o valor salvo
          }
        } catch (e) {
          console.error("Erro ao carregar a meta diária:", e);
        }
      };

    //usa parseInt(para converter uma string em int)
    const saveMeta = async () => {
        const parsedMeta = parseInt(metaDiaria, 10);
        if (!isNaN(parsedMeta) && parsedMeta > 0) {
            await AsyncStorage.setItem(META_DIARIA_KEY, parsedMeta.toString());
            setMetaDiaria(parsedMeta);
            alert("Meta diária salva!");
        } else {
            alert("Por favor, insira um número válido maior que zero.");
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
            Notificações
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#ccc", true: theme.primary }}
            thumbColor={notificationsEnabled ? theme.primaryDark : "#f4f3f4"}
          />
        </View>
        <View style={styles.sliderContainer}>
          <Text style={[styles.label, { color: theme.secondaryText }]}>
            Intervalo: {interval?.toFixed(2)} hora(s)
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={INTERVAL_MIN}
            maximumValue={INTERVAL_MAX}
            step={INTERVAL_STEP}
            value={interval}
            onValueChange={setInterval}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.secondaryText}
            thumbTintColor={theme.primaryDark}
          />
        <View style={styles.sliderContainer}>
          <Text style={[styles.label, { color: theme.secondaryText }]}>
            Meta Diaria de copos: {metaDiaria?.toFixed(0)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={metaDiaria}
            onValueChange={async (value) => {
                setMetaDiaria(value); //atualiza o valor na tela
                await AsyncStorage.setItem(META_DIARIA_KEY, value.toString());
            }}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.secondaryText}
            thumbTintColor={theme.primaryDark}
          />
            <Text style={[styles.label, { textAlign: "center", fontSize: 20, color: theme.primary }]}>
                {metaDiaria} copos/dia
            </Text>
         </View> 
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
sliderContainer: {
    marginVertical: 15,
  },
  slider: {
    width: "100%",
    height: 40,
  },
loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
},
});