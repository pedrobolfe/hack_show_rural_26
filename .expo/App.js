import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Importação das telas
import Login from './FrontEnd/Telas/Login/Login';
import Cadastro from './FrontEnd/Telas/Login/Cadastro';
import EsqueciSenha from './FrontEnd/Telas/Login/EsqueciSenha';
import Perfil from './FrontEnd/Telas/Usuario/Perfil';
import PropriedadeCO2 from './FrontEnd/Telas/AcessoRapido/PropriedadeCO2';
import QuestionarioCO2 from './FrontEnd/Telas/AcessoRapido/QuestionarioCO2';
import SateliteCO2 from './FrontEnd/Telas/AcessoRapido/SateliteCO2';
import RelatorioFinalCO2 from './FrontEnd/Telas/AcessoRapido/RelatorioFinalCO2';

// Importação centralizada das fontes
import { 
  useFonts, 
  SpaceGrotesk_400Regular, 
  SpaceGrotesk_500Medium, 
  SpaceGrotesk_600SemiBold, 
  SpaceGrotesk_700Bold 
} from '@expo-google-fonts/space-grotesk';

// Impede a tela de splash de se esconder automaticamente
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  // Carrega todas as fontes usadas no aplicativo
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  // Esconde a tela de splash apenas quando as fontes estiverem carregadas (ou se der erro)
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Não renderiza nada até que as fontes estejam prontas
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastro" component={Cadastro} />
          <Stack.Screen name="EsqueciSenha" component={EsqueciSenha} />
          <Stack.Screen name="Perfil" component={Perfil} />
          <Stack.Screen name="Propriedade" component={PropriedadeCO2} />
          <Stack.Screen name="Questionario" component={QuestionarioCO2} />
          <Stack.Screen name="Satelite" component={SateliteCO2} />
          <Stack.Screen name="Relatorio" component={RelatorioFinalCO2} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});