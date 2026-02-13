import { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Importação das telas de autenticação
import Login from './FrontEnd/Telas/Login/Login';
import Cadastro from './FrontEnd/Telas/Login/Cadastro';
import EsqueciSenha from './FrontEnd/Telas/Login/EsqueciSenha';

// Importação das telas principais do app
import Dashboard from './FrontEnd/Telas/Dashboard/HomeScreen';
import Perfil from './FrontEnd/Telas/Usuario/Perfil';
import PropriedadeCO2 from './FrontEnd/Telas/AcessoRapido/PropriedadeCO2';
import QuestionarioCO2 from './FrontEnd/Telas/AcessoRapido/QuestionarioCO2';
import SateliteCO2 from './FrontEnd/Telas/AcessoRapido/SateliteCO2';
import RelatorioFinalCO2 from './FrontEnd/Telas/AcessoRapido/RelatorioFinalCO2';

// Importação da configuração do Firebase e fontes
import { watchAuthState } from './firebaseConfig';
import { 
  useFonts, 
  SpaceGrotesk_400Regular, 
  SpaceGrotesk_500Medium, 
  SpaceGrotesk_600SemiBold, 
  SpaceGrotesk_700Bold 
} from '@expo-google-fonts/space-grotesk';

// Impede a tela de splash de se esconder automaticamente
SplashScreen.preventAutoHideAsync();

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

// Navegador para o fluxo de autenticação
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={Login} />
    <AuthStack.Screen name="Cadastro" component={Cadastro} />
    <AuthStack.Screen name="EsqueciSenha" component={EsqueciSenha} />
  </AuthStack.Navigator>
);

// Navegador para o fluxo principal do aplicativo
const AppNavigator = () => (
  // A `initialRouteName` define a "Dashboard" como a primeira tela a ser vista após o login.
  <AppStack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="Dashboard" component={Dashboard} />
        <AppStack.Screen name="Questionario" component={QuestionarioCO2} />
        <AppStack.Screen name="Propriedade" component={PropriedadeCO2} />
    {/* As demais telas ficam disponíveis para navegação a partir da tela inicial. */}
    <AppStack.Screen name="Satelite" component={SateliteCO2} />
    <AppStack.Screen name="Relatorio" component={RelatorioFinalCO2} />
    <AppStack.Screen name="Perfil" component={Perfil} />
  </AppStack.Navigator>
);

export default function App() {
  // Carrega as fontes
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  // Estados para controlar a inicialização e o usuário logado
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Monitora o estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = watchAuthState(authenticatedUser => {
      setUser(authenticatedUser);
      if (initializing) {
        setInitializing(false);
      }
    });
    
    // Limpa a inscrição ao desmontar o componente
    return unsubscribe;
  }, [initializing]);

  // Esconde a tela de splash quando as fontes e a verificação de auth estiverem concluídas
  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && !initializing) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, initializing]);

  // Não renderiza nada até que tudo esteja carregado
  if (!fontsLoaded && !fontError || initializing) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <NavigationContainer>
        {user ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});