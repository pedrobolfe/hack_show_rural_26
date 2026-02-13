import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '../../../firebaseConfig';
import { createPropriedade, getUserByEmail } from '../../../apirequest';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Input = ({ label, value, onChangeText, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputBox}>
      <TextInput
        style={styles.inputText}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#A1A1AA"
        {...props}
      />
    </View>
  </View>
);

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const SubSectionHeader = ({ title }) => (
  <Text style={styles.subSectionHeader}>{title}</Text>
);

export default function QuestionarioCO2({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tabela 2. Sistema de cultivo.
  const [dataPlantio, setDataPlantio] = useState('');
  const [dataColheita, setDataColheita] = useState('');
  const [classeTexturalSolo, setClasseTexturalSolo] = useState('Argiloso');
  const [teorArgila, setTeorArgila] = useState('Maior que 60%');
  const [usoAnteriorTerra, setUsoAnteriorTerra] = useState('Plantio direto');
  const [sistemaCultivoAtual, setSistemaCultivoAtual] = useState('Plantio direto');
  const [tempoAdocaoSistema, setTempoAdocaoSistema] = useState('Maior que 20 anos');
  const [areaQueimaResiduos, setAreaQueimaResiduos] = useState('0,00');
  const [areaManejoSolosOrganicos, setAreaManejoSolosOrganicos] = useState('0,00');
  const [areaCultivada, setAreaCultivada] = useState('5,69');
  const [produtividadeMedia, setProdutividadeMedia] = useState('3,40');

  // Tabela 3. Adubação.
  const [adubacaoNitrogenada, setAdubacaoNitrogenada] = useState('90,00');
  const [teorNitrogenioAdubo, setTeorNitrogenioAdubo] = useState('45,00');
  const [ureia, setUreia] = useState('200,00');
  const [calcarioCalcitico, setCalcarioCalcitico] = useState('1.500,00');
  const [calcarioDolomitico, setCalcarioDolomitico] = useState('0,00');
  const [gessoAgricola, setGessoAgricola] = useState('0,00');
  const [compostoOrganico, setCompostoOrganico] = useState('0,00');
  const [estercoBovino, setEstercoBovino] = useState('0,00');
  const [estercoAvicola, setEstercoAvicola] = useState('30.000,00');
  const [outrosAdubosOrganicos, setOutrosAdubosOrganicos] = useState('0,00');
  const [leguminosa, setLeguminosa] = useState('3.000,00');
  const [graminea, setGraminea] = useState('3.000,00');
  const [outrosAdubosVerdes, setOutrosAdubosVerdes] = useState('0,00');

  // Tabela 4. Consumo de combustível das operações mecanizadas.
  const [tipoCombustivelMecanizadas, setTipoCombustivelMecanizadas] = useState('Diesel puro');
  const [tipoQuantificacaoConsumo, setTipoQuantificacaoConsumo] = useState('Quantidade consumida');
  const [quantidadeConsumidaMecanizadas, setQuantidadeConsumidaMecanizadas] = useState('');

  // Tabela 4.1. Operações mecanizadas.
  const [repCalagem, setRepCalagem] = useState('');
  const [repHerbicidaPre, setRepHerbicidaPre] = useState('');
  const [repLimpeza, setRepLimpeza] = useState('');
  const [repPlantio, setRepPlantio] = useState('');
  const [repFungicida, setRepFungicida] = useState('');
  const [repInseticida, setRepInseticida] = useState('');
  const [repHerbicidaManutencao, setRepHerbicidaManutencao] = useState('');
  const [repColheita, setRepColheita] = useState('');

  // Tabela 5. Consumo de combustível nas operações internas da propriedade.
  const [consumoGasolina, setConsumoGasolina] = useState('84,00');
  const [consumoEtanol, setConsumoEtanol] = useState('0,00');

  // Tabela 6. Consumo de combustível no transporte da produção.
  const [tipoCombustivelTransporte, setTipoCombustivelTransporte] = useState('Diesel puro');
  const [quantidadeConsumidaTransporte, setQuantidadeConsumidaTransporte] = useState('600,00');

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          // Tenta buscar dados frescos da API
          const userData = await getUserByEmail(currentUser.email);
          setUser(userData);
          // Salva os dados frescos no cache
          await AsyncStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(userData));
        } catch (apiError) {
          console.error("Erro ao buscar dados do usuário da API:", apiError);
          // Se a API falhar, tenta carregar do cache
          try {
            const cachedUser = await AsyncStorage.getItem(`user_${currentUser.uid}`);
            if (cachedUser) {
              setUser(JSON.parse(cachedUser));
              Alert.alert('Aviso', 'Mostrando dados offline. Sua conexão com a internet parece estar com problemas.');
            } else {
              // Se não houver nem API nem cache, é um erro crítico
              throw new Error("Sem dados em cache disponíveis.");
            }
          } catch (cacheError) {
            console.error("Erro ao carregar dados do cache:", cacheError);
            Alert.alert('Erro Crítico', 'Não foi possível carregar seus dados online ou offline. Por favor, faça login novamente.');
            auth.signOut();
          }
        } finally {
          setLoading(false);
        }
      } else {
        // Se não houver usuário logado, volta para a tela de login.
        navigation.replace('Login');
      }
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!areaCultivada || !dataPlantio || !dataColheita) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha pelo menos a área cultivada e as datas de plantio e colheita.');
      return;
    }

    if (!user || !user.numCRA) {
      Alert.alert('Erro Crítico', 'O número do CAR não foi encontrado. Não é possível salvar a propriedade.');
      return;
    }

    setSaving(true);

    const questionnaireData = {
      sistemaCultivo: {
        dataPlantio,
        dataColheita,
        classeTexturalSolo,
        teorArgila,
        usoAnteriorTerra,
        sistemaCultivoAtual,
        tempoAdocaoSistema,
        areaQueimaResiduos: parseFloat(areaQueimaResiduos.replace(',', '.')) || 0,
        areaManejoSolosOrganicos: parseFloat(areaManejoSolosOrganicos.replace(',', '.')) || 0,
        areaCultivada: parseFloat(areaCultivada.replace(',', '.')) || 0,
        produtividadeMedia: parseFloat(produtividadeMedia.replace(',', '.')) || 0,
      },
      adubacao: {
        sintetica: {
          adubacaoNitrogenada: parseFloat(adubacaoNitrogenada.replace(',', '.')) || 0,
          teorNitrogenioAdubo: parseFloat(teorNitrogenioAdubo.replace(',', '.')) || 0,
          ureia: parseFloat(ureia.replace(',', '.')) || 0,
        },
        correcaoSolo: {
          calcarioCalcitico: parseFloat(calcarioCalcitico.replace(',', '.')) || 0,
          calcarioDolomitico: parseFloat(calcarioDolomitico.replace(',', '.')) || 0,
          gessoAgricola: parseFloat(gessoAgricola.replace(',', '.')) || 0,
        },
        organica: {
          compostoOrganico: parseFloat(compostoOrganico.replace(',', '.')) || 0,
          estercoBovino: parseFloat(estercoBovino.replace(',', '.')) || 0,
          estercoAvicola: parseFloat(estercoAvicola.replace(',', '.')) || 0,
          outros: parseFloat(outrosAdubosOrganicos.replace(',', '.')) || 0,
        },
        verde: {
          leguminosa: parseFloat(leguminosa.replace(',', '.')) || 0,
          graminea: parseFloat(graminea.replace(',', '.')) || 0,
          outros: parseFloat(outrosAdubosVerdes.replace(',', '.')) || 0,
        },
      },
      consumoCombustivelMecanizadas: {
        tipoCombustivel: tipoCombustivelMecanizadas,
        tipoQuantificacao: tipoQuantificacaoConsumo,
        quantidade: parseFloat(quantidadeConsumidaMecanizadas.replace(',', '.')) || 0,
      },
      operacoesMecanizadas: {
        preImplantacao: {
          calagem: parseInt(repCalagem, 10) || 0,
          aplicacaoHerbicida: parseInt(repHerbicidaPre, 10) || 0,
          limpeza: parseInt(repLimpeza, 10) || 0,
        },
        implantacao: {
          plantioComAdubacao: parseInt(repPlantio, 10) || 0,
        },
        manutencao: {
          aplicacaoFungicida: parseInt(repFungicida, 10) || 0,
          aplicacaoInseticida: parseInt(repInseticida, 10) || 0,
          aplicacaoHerbicida: parseInt(repHerbicidaManutencao, 10) || 0,
        },
        colheita: {
          colheita: parseInt(repColheita, 10) || 0,
        },
      },
      consumoCombustivelInterno: {
        gasolina: parseFloat(consumoGasolina.replace(',', '.')) || 0,
        etanol: parseFloat(consumoEtanol.replace(',', '.')) || 0,
      },
      consumoCombustivelTransporte: {
        tipoCombustivel: tipoCombustivelTransporte,
        quantidade: parseFloat(quantidadeConsumidaTransporte.replace(',', '.')) || 0,
      },
    };

    const propertyData = {
      ownerId: user.id,
      name: `Propriedade de ${user.name.split(' ')[0]}`,
      carData: {
        number: user.numCRA,
        legalReserve: 0, // Campo não presente no novo questionário
        app: 0, // Campo não presente no novo questionário
        validated: false
      },
      status: "Pending",
      areaDetails: {
        total: parseFloat(areaCultivada.replace(',', '.')) || 0,
        app: 0, // Campo não presente no novo questionário
        legalReserve: 0, // Campo não presente no novo questionário
      },
      questionnaire: questionnaireData
    };

    try {
      const newProperty = await createPropriedade(propertyData);
      Alert.alert('Sucesso!', 'Seu inventário foi salvo e a propriedade foi criada.');
      navigation.navigate('Propriedade', { propertyId: newProperty.id });
    } catch (error) {
      console.error("Erro ao salvar questionário:", error);
      Alert.alert('Erro ao Salvar', 'Ocorreu um erro ao salvar seu inventário. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#06402B" /></View>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inventário da Propriedade</Text>
          <Text style={styles.headerSubtitle}>Responda as perguntas para gerar seu primeiro relatório.</Text>
        </View>

        <View style={styles.formContainer}>
          <SectionHeader title="Tabela 2. Sistema de cultivo" />
          <Input label="Data de plantio" value={dataPlantio} onChangeText={setDataPlantio} placeholder="DD/MM/AAAA" />
          <Input label="Data de colheita" value={dataColheita} onChangeText={setDataColheita} placeholder="DD/MM/AAAA" />
          <Input label="Classe textural do solo" value={classeTexturalSolo} onChangeText={setClasseTexturalSolo} />
          <Input label="Teor de argila no solo" value={teorArgila} onChangeText={setTeorArgila} />
          <Input label="Uso anterior da terra" value={usoAnteriorTerra} onChangeText={setUsoAnteriorTerra} />
          <Input label="Sistema de cultivo atual" value={sistemaCultivoAtual} onChangeText={setSistemaCultivoAtual} />
          <Input label="Tempo de adoção do sistema" value={tempoAdocaoSistema} onChangeText={setTempoAdocaoSistema} />
          <Input label="Área de queima de resíduos da cultura (hectare)" value={areaQueimaResiduos} onChangeText={setAreaQueimaResiduos} keyboardType="numeric" />
          <Input label="Área de manejo de solos orgânicos (hectare)" value={areaManejoSolosOrganicos} onChangeText={setAreaManejoSolosOrganicos} keyboardType="numeric" />
          <Input label="Área cultivada (hectare)" value={areaCultivada} onChangeText={setAreaCultivada} keyboardType="numeric" />
          <Input label="Produtividade média (tonelada/hectare)" value={produtividadeMedia} onChangeText={setProdutividadeMedia} keyboardType="numeric" />

          <SectionHeader title="Tabela 3. Adubação" />
          <SubSectionHeader title="Adubação sintética" />
          <Input label="Adubação nitrogenada sintética (Exceto ureia) (kg/hectare)" value={adubacaoNitrogenada} onChangeText={setAdubacaoNitrogenada} keyboardType="numeric" />
          <Input label="Teor de nitrogênio no adubo sintético (%)" value={teorNitrogenioAdubo} onChangeText={setTeorNitrogenioAdubo} keyboardType="numeric" />
          <Input label="Ureia (kg/hectare)" value={ureia} onChangeText={setUreia} keyboardType="numeric" />

          <SubSectionHeader title="Correção e condicionamento de solo" />
          <Input label="Calcário calcítico (kg/hectare)" value={calcarioCalcitico} onChangeText={setCalcarioCalcitico} keyboardType="numeric" />
          <Input label="Calcário dolomítico (kg/hectare)" value={calcarioDolomitico} onChangeText={setCalcarioDolomitico} keyboardType="numeric" />
          <Input label="Gesso agrícola (kg/hectare)" value={gessoAgricola} onChangeText={setGessoAgricola} keyboardType="numeric" />
          
          <SubSectionHeader title="Adubação orgânica" />
          <Input label="Composto orgânico (kg/hectare)" value={compostoOrganico} onChangeText={setCompostoOrganico} keyboardType="numeric" />
          <Input label="Esterco (Bovino, equino, suino ou ovino) (kg/hectare)" value={estercoBovino} onChangeText={setEstercoBovino} keyboardType="numeric" />
          <Input label="Esterco (Avícola) (kg/hectare)" value={estercoAvicola} onChangeText={setEstercoAvicola} keyboardType="numeric" />
          <Input label="Outros (kg/hectare)" value={outrosAdubosOrganicos} onChangeText={setOutrosAdubosOrganicos} keyboardType="numeric" />

          <SubSectionHeader title="Adubação verde" />
          <Input label="Leguminosa (kg/hectare)" value={leguminosa} onChangeText={setLeguminosa} keyboardType="numeric" />
          <Input label="Gramínea (kg/hectare)" value={graminea} onChangeText={setGraminea} keyboardType="numeric" />
          <Input label="Outros (kg/hectare)" value={outrosAdubosVerdes} onChangeText={setOutrosAdubosVerdes} keyboardType="numeric" />

          <SectionHeader title="Tabela 4. Consumo de combustível das operações mecanizadas" />
          <Input label="Tipo de combustível" value={tipoCombustivelMecanizadas} onChangeText={setTipoCombustivelMecanizadas} />
          <Input label="Tipo de quantificação de consumo" value={tipoQuantificacaoConsumo} onChangeText={setTipoQuantificacaoConsumo} />
          <Input label="Quantidade consumida (litro)" value={quantidadeConsumidaMecanizadas} onChangeText={setQuantidadeConsumidaMecanizadas} keyboardType="numeric" />

          <SectionHeader title="Tabela 4.1. Operações mecanizadas" />
          <SubSectionHeader title="Pré-implantação" />
          <Input label="Calagem (Nº de repetições)" value={repCalagem} onChangeText={setRepCalagem} keyboardType="numeric" />
          <Input label="Aplicação de herbicida (Nº de repetições)" value={repHerbicidaPre} onChangeText={setRepHerbicidaPre} keyboardType="numeric" />
          <Input label="Limpeza (Nº de repetições)" value={repLimpeza} onChangeText={setRepLimpeza} keyboardType="numeric" />
          <SubSectionHeader title="Implantação" />
          <Input label="Plantio com adubação (Nº de repetições)" value={repPlantio} onChangeText={setRepPlantio} keyboardType="numeric" />
          <SubSectionHeader title="Manutenção" />
          <Input label="Aplicação de fungicida (Nº de repetições)" value={repFungicida} onChangeText={setRepFungicida} keyboardType="numeric" />
          <Input label="Aplicação de inseticida (Nº de repetições)" value={repInseticida} onChangeText={setRepInseticida} keyboardType="numeric" />
          <Input label="Aplicação de herbicida (Nº de repetições)" value={repHerbicidaManutencao} onChangeText={setRepHerbicidaManutencao} keyboardType="numeric" />
          <SubSectionHeader title="Colheita" />
          <Input label="Colheita (Nº de repetições)" value={repColheita} onChangeText={setRepColheita} keyboardType="numeric" />

          <SectionHeader title="Tabela 5. Consumo de combustível nas operações internas da propriedade" />
          <Input label="Gasolina (litro)" value={consumoGasolina} onChangeText={setConsumoGasolina} keyboardType="numeric" />
          <Input label="Etanol hidratado (litro)" value={consumoEtanol} onChangeText={setConsumoEtanol} keyboardType="numeric" />

          <SectionHeader title="Tabela 6. Consumo de combustível no transporte da produção" />
          <Input label="Tipo de combustível" value={tipoCombustivelTransporte} onChangeText={setTipoCombustivelTransporte} />
          <Input label="Quantidade consumida (litro)" value={quantidadeConsumidaTransporte} onChangeText={setQuantidadeConsumidaTransporte} keyboardType="numeric" />

          <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={saving ? undefined : handleSave}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Salvar e Continuar</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, lineHeight: 32, color: '#06402B' },
  headerSubtitle: { fontFamily: 'SpaceGrotesk_400Regular', fontSize: 16, lineHeight: 24, color: '#71717A', marginTop: 8 },
  formContainer: { paddingHorizontal: 24, gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14, lineHeight: 20, color: '#3F3F46' },
  inputBox: { width: '100%', height: 50, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 16, justifyContent: 'center', paddingHorizontal: 16 },
  inputText: { fontFamily: 'SpaceGrotesk_400Regular', fontSize: 16, color: '#27272A' },
  button: { width: '100%', height: 56, backgroundColor: '#06402B', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  buttonDisabled: { backgroundColor: '#0A5F41' },
  buttonText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#FFFFFF' },
  sectionHeader: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    lineHeight: 28,
    color: '#18181B',
    marginTop: 24,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
    paddingBottom: 8,
  },
  subSectionHeader: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: '#3F3F46',
    marginTop: 16,
    marginBottom: 8,
  },
});