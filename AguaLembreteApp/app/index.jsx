//tela inicial do aplicativo
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AguaContador from "../components/agua_contador";
import { setupNotifications, updateNotifications } from "../utils/notifications";
import { useTheme } from "../utils/ThemeContext"

const HISTORICO_AGUA = "waterHistory"; //mesma chave usada no componente AguaContador

//lógica Principal
export default function HomeScreen() {
    const { theme } = useTheme();
    const [copos, setCopos] = useState(0);
  
    useEffect(() => {
      const initialize = async () => {
        await setupNotifications();
        await carregar();
        await updateNotifications();
      };
      initialize(); //configura notificações e carrega o histórico ao iniciar
    }, []);
  
    useFocusEffect(
      useCallback(() => {
        const recarregarAoVoltar = async () => { 
          await carregar(); //carrega o histórico de consumo de água e atualiza o contador de copos
        };
        recarregarAoVoltar(); //recarrega os dados ao voltar para a tela
      }, [])
    );
  
    // Carregar histórico de consumo de água hoje e atualizar o contador
    const carregar = async () => {
      try {
        const historico_salvo = await AsyncStorage.getItem(HISTORICO_AGUA);
        const historico_parsed = historico_salvo ? JSON.parse(historico_salvo) : [];
        const dtAtual = new Date().toLocaleDateString("pt-BR");
        const coposHoje = historico_parsed.find(entry => entry.date === dtAtual);
        setCopos(coposHoje ? coposHoje.count : 0);
      } catch (e) {
        console.error("Erro ao carregar contagem do dia:", e);
      }
    };
  
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.primaryDark }]}>
          Lembrete de Água
        </Text>
        <AguaContador copos={copos} setCopos={setCopos} />
      </View>
    );
  }

  //estilos
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
      justifyContent: "flex-start",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      marginTop: 10,
      marginBottom: 20,
    },
  });