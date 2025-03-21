//componente reutilizável para exibir um contador de copos de água
import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../utils/ThemeContext";

const HISTORICO_AGUA = "waterHistory";

//lógica e interface
//copos e setCopos controla o contador de copos de água
export default function AguaContador({ copos, setCopos }) {
    const { theme } = useTheme();
  
    const adicionar = async () => {
      const dtAtual = new Date().toLocaleDateString("pt-BR");
      setCopos(copos + 1);
      try {
        const historico = await AsyncStorage.getItem(HISTORICO_AGUA);
        const lista = historico ? JSON.parse(historico) : [];
        const coposHoje = lista.find(entry => entry.date === dtAtual);
        if (coposHoje) {
          coposHoje.count += 1;
        } else {
          lista.push({ date: dtAtual, count: 1 });
        }
        await AsyncStorage.setItem(HISTORICO_AGUA, JSON.stringify(lista));
      } catch (e) {
        console.error("Erro ao salvar histórico:", e);
      }
    };

    //adicionar: Incrementa o contador e salva no AsyncStorage
    return (
      <View style={[styles.counterCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.cardContent}>
          <Text style={[styles.counterText, { color: theme.primaryDark }]}>
            Copos Hoje
          </Text>
          <Button title="Bebi um copo!" onPress={adicionar} color={theme.primary} />
        </View>
        <View style={styles.cardFooter}>
          <Text style={[styles.counter, {color: theme.text}]}>{copos} 💧</Text>
        </View>
      </View>
    );
  }

  //estilos para o componente AguaContador
  const styles = StyleSheet.create({
    counterCard: {
      flexDirection: "row",
      padding: 20,
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardContent: {
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
    },
    counter: {
      fontSize: 46,
      fontWeight: "bold",
    },
    counterText: {
      fontSize: 24,
      fontWeight: "600",
    },
  });