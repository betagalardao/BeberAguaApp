//tela de histórico do aplicativo
// app/history.jsx
import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../utils/ThemeContext";
import { useFocusEffect } from "expo-router";
import { BarChart, Grid, XAxis, YAxis } from "react-native-svg-charts"; //barras, linhas, eixo X Y, tipo da escala 
import * as scale from "d3-scale"; //grafico
import { Text as SVGText } from "react-native-svg"; //grafico

const HISTORICO_AGUA = "waterHistory"; //chave == AguaContador

//lógica principal
export default function HistoryScreen() {
    const { theme } = useTheme();
    const [historico, setHistorico] = useState([]);
  
    // useEffect(() => {
    //   carregar();
    // }, []);
  
    //recarrega os dados ao voltar para a tela
    useFocusEffect(
      useCallback(() => {
        carregar();
      }, [])
    );

// useeffect parar simular o histórico para teste, remover para histórico real de 7 dias marcados no histórico.
useEffect(() => {
  const simularHistorico = async () => {
    const hoje = new Date();
    const historicoFalso = [];

    for (let i = 0; i < 7; i++) {
      const data = new Date();
      data.setDate(hoje.getDate() - i);
      const dataStr = data.toLocaleDateString("pt-BR");
      historicoFalso.push({ date: dataStr, count: Math.floor(Math.random() * 8) }); // entre 0 e 7 copos
    }

    await AsyncStorage.setItem("waterHistory", JSON.stringify(historicoFalso));
    setHistorico(historicoFalso);
  };

  simularHistorico();
}, []); 

  //paleta para o gráfico
  const coresAzuis = [
    "#A3C9F9",
    "#89BDF3",
    "#6EAFF0",
    "#54A2EC",
    "#3996E9",
    "#1F8AE5",
    "#047EE2"
  ];

  
    const ordenarHistorico = (a, b) => { //ordena o histórico por data decrescente.
      const [diaA, mesA, anoA] = a.date.split("/");
      const [diaB, mesB, anoB] = b.date.split("/");
      return new Date(anoB, mesB - 1, diaB) - new Date(anoA, mesA - 1, diaA);
    };
  
    const carregar = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem(HISTORICO_AGUA);
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          const ordenado = parsed.sort(ordenarHistorico);
          setHistorico(ordenado);
        }
      } catch (e) {
        console.error("Erro ao carregar histórico:", e);
      }
    };
  
    const limparHistorico = () => {
      Alert.alert(
        "Limpar Histórico",
        "Tem certeza que deseja limpar todo o histórico de consumo?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Limpar",
            onPress: async () => {
              await AsyncStorage.removeItem(HISTORICO_AGUA);
              setHistorico([]);
            },
            style: "destructive",
          },
        ]
      );
    };

    //const para pegar os dados para criar o gráfico
    const prepararDadosGrafico = (dados) => {
      const hoje = new Date();
      const ultimos7Dias = [];//pega os últimos 7 dias do histórico 
    
      for (let i = 6; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() - i);
        const dataStr = data.toLocaleDateString("pt-BR");
        const dia = dataStr.split("/")[0]; // só o dia para o eixo X
    
        const entrada = dados.find((item) => item.date === dataStr);
        ultimos7Dias.push({
          dia,
          count: entrada ? entrada.count : 0,
        });
      }
      return ultimos7Dias;
    };

    const dadosGrafico = prepararDadosGrafico(historico);
    
    //renderização 
    const renderHistoryItem = ({ item }) => ( //renderiza um item do histórico com data e contagem de copos
    <View style={[styles.historyItem, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.historyText, { color: theme.secondaryText }]}>
        {item.date}: {item.count} copo(s) 💧
      </Text>
    </View>
    );

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.primaryDark }]}>
          Histórico de Consumo
        </Text>
        <TouchableOpacity style={styles.limparButton} onPress={limparHistorico}>
          <Text style={styles.limparButtonText}>Limpar Histórico</Text>
        </TouchableOpacity>
        {historico.length > 0 && (
        <View style={{ height: 200, flexDirection: "row", marginBottom: 20 }}>
          <YAxis //mostra os números do lado
            data={dadosGrafico.map(item => item.count)} //altura do gráfico
            contentInset={{ top: 10, bottom: 10 }} //espaçamento 
            svg={{ fontSize: 10, fill: theme.text }} //estilo do texto
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
          <BarChart 
            style={{ flex: 1 }}
              data={dadosGrafico.map((item, index) => ({ //array 
              value: item.count,
              svg: { fill: coresAzuis[index % coresAzuis.length], rx: 4, ry: 4 }, //const com as cores 
              }))}
            yAccessor={({ item }) => item.value} 
            spacingInner={0.5} //espaço das barras para deixar mais fina
            contentInset={{ top: 10, bottom: 10 }}
            >
          <Grid />
        </BarChart>
            <XAxis //dias
              style={{ marginTop: 5 }}
              data={dadosGrafico}
              formatLabel={(value, index) => dadosGrafico[index].dia}
              scale={scale.scaleBand}
              svg={{ fontSize: 10, fill: theme.text }}
            />
          </View>
        </View>
      )}
        <FlatList
          data={historico}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.date}
          style={styles.historyList}
          contentContainerStyle={styles.historyContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                Nenhum registro de consumo encontrado
              </Text>
            </View>
          )}
        />
    </View>
  );
}

//estilos
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginVertical: 20,
    },
    historyList: {
      flex: 1,
    },
    historyContent: {
      paddingBottom: 20,
    },
    historyItem: {
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    historyText: {
      fontSize: 16,
    },
    limparButton: {
      backgroundColor: "#FF5252",
      borderRadius: 10,
      padding: 12,
      marginBottom: 20,
      alignItems: "center",
    },
    limparButtonText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      fontSize: 16,
      textAlign: "center",
    },
  });