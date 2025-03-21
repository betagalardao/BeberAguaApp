//estrutura do layout das telas relacionadas às configurações no aplicativo
import { Stack } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../../utils/ThemeContext";

//layout principal para as telas de configurações
export default function SettingsLayout() {
    const { theme } = useTheme();
  
    //Stack: navegação aninhada para "Configurações" e "Sobre"
    return (
      <Stack
        screenOptions={{
          headerStyle: [styles.header, { backgroundColor: theme.primary }],
          headerTintColor: theme.headerColor,
          headerTitleStyle: styles.headerTitle,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Configurações",
            headerRight: () => ( //link: "Sobre" 
              <Link href="/settings/about" asChild>
                <Text style={styles.headerIcon}>📄</Text>
              </Link>
            ),
          }}
        />
        <Stack.Screen name="about" options={{ title: "Sobre" }} />
      </Stack>
    );
  }

  //estilos para o cabeçalho
  const styles = StyleSheet.create({
    headerTitle: {
      fontWeight: "bold",
      fontSize: 20,
    },
    headerIcon: {
      fontSize: 22,
    },
  });