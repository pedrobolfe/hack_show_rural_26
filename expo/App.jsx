import { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
import { getUserByEmail } from './apirequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
const AppNavigator = ({ initialRoute, userData }) => (
  <AppStack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="Dashboard">
      {(props) => <Dashboard {...props} userData={userData} />}
    </AppStack.Screen>
    <AppStack.Screen name="Questionario">
      {(props) => <QuestionarioCO2 {...props} userData={userData} />}
    </AppStack.Screen>
    <AppStack.Screen name="Propriedade" component={PropriedadeCO2} />
    <AppStack.Screen name="Satelite" component={SateliteCO2} />
    <AppStack.Screen name="Relatorio">
      {(props) => <RelatorioFinalCO2 {...props} userData={userData} />}
    </AppStack.Screen>
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
  const [userData, setUserData] = useState(null);
  const [initialRoute, setInitialRoute] = useState('Dashboard');
  const [loadingUserData, setLoadingUserData] = useState(false);

  // Monitora o estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = watchAuthState(async (authenticatedUser) => {
      setUser(authenticatedUser);

      if (authenticatedUser) {
        // Usuário logado: buscar dados do backend para verificar questionário
        setLoadingUserData(true);
        try {
          const apiUser = await getUserByEmail(authenticatedUser.email);
          const data = apiUser?.data || apiUser;
          setUserData(data);
          await AsyncStorage.setItem(`user_${authenticatedUser.uid}`, JSON.stringify(data));

          // Verificar se o usuário já respondeu o questionário
          const hasAnswered = data?.questionsAndResponses && data.questionsAndResponses.length > 0;
          setInitialRoute(hasAnswered ? 'Dashboard' : 'Questionario');
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          // Tentar cache local
          try {
            const cached = await AsyncStorage.getItem(`user_${authenticatedUser.uid}`);
            if (cached) {
              const data = JSON.parse(cached);
              setUserData(data);
              const hasAnswered = data?.questionsAndResponses && data.questionsAndResponses.length > 0;
              setInitialRoute(hasAnswered ? 'Dashboard' : 'Questionario');
            } else {
              setInitialRoute('Questionario');
            }
          } catch {
            setInitialRoute('Questionario');
          }
        } finally {
          setLoadingUserData(false);
        }
      } else {
        // Usuário deslogado
        setUserData(null);
        setInitialRoute('Dashboard');
      }

      if (initializing) {
        setInitializing(false);
      }
    });
    
    // Limpa a inscrição ao desmontar o componente
    return unsubscribe;
  }, [initializing]);

  // Esconde a tela de splash quando as fontes e a verificação de auth estiverem concluídas
  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && !initializing && !loadingUserData) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, initializing, loadingUserData]);

  // Não renderiza nada até que tudo esteja carregado
  if ((!fontsLoaded && !fontError) || initializing || loadingUserData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#06402B" />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <NavigationContainer>
        {user ? <AppNavigator initialRoute={initialRoute} userData={userData} /> : <AuthNavigator />}
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});