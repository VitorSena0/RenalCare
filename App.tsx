import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  Platform,
  Image,
} from 'react-native';

// ---------- TIPOS ----------
type StatusType = 'success' | 'warning' | 'danger';
type HistoryType = 'weight' | 'pressure' | 'labs';

interface Indicator {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: StatusType;
  history: number[];
}

interface HistoryItem {
  type: HistoryType;
  label: string;
  value: string;
  date: string;
  status: StatusType;
}

interface GamificationData {
  weeklyPoints: number;
  goals: {
    pressao: { current: number; target: number; points: number };
    sodio: { current: number; target: number; points: number };
    peso: { current: number; target: number; points: number };
  };
}

interface AppStateData {
  user: { name: string; age: number; stage: string };
  indicators: Indicator[];
  history: HistoryItem[];
  gamification: GamificationData;
}

// ---------- DADOS MOCK ----------
const initialData: AppStateData = {
  user: { name: 'João Silva', age: 56, stage: '3A' },
  indicators: [
    {
      id: 'tfg',
      label: 'TFG (Rins)',
      value: '58',
      unit: 'mL/min',
      status: 'warning',
      history: [65, 63, 64, 61, 60, 58],
    },
    {
      id: 'pa',
      label: 'Pressão Arterial',
      value: '132/85',
      unit: 'mmHg',
      status: 'success',
      history: [130, 135, 128, 133, 130, 132],
    },
    {
      id: 'peso',
      label: 'Peso Corporal',
      value: '88.5',
      unit: 'kg',
      status: 'danger',
      history: [87.5, 87.8, 88.0, 87.9, 88.2, 88.5],
    },
  ],
  history: [
    { type: 'weight', label: 'Peso Corporal', value: '88.5 kg', date: 'Hoje, 08:16', status: 'danger' },
    { type: 'pressure', label: 'Pressão Arterial', value: '132/85 mmHg', date: 'Hoje, 08:15', status: 'success' },
    { type: 'weight', label: 'Peso Corporal', value: '88.2 kg', date: 'Ontem, 08:00', status: 'danger' },
    { type: 'labs', label: 'Exame de Sangue (TFG)', value: '58 mL/min', date: '25 Jun', status: 'warning' },
    { type: 'pressure', label: 'Pressão Arterial', value: '135/88 mmHg', date: '24 Jun', status: 'warning' },
  ],
  gamification: {
    weeklyPoints: 120,
    goals: {
      pressao: { current: 3, target: 5, points: 40 },
      sodio: { current: 2, target: 4, points: 30 },
      peso: { current: 1, target: 3, points: 20 },
    },
  },
};

// ---------- HELPERS VISUAIS ----------
const statusLabel = (status: StatusType) =>
  status === 'success' ? 'Ok' : status === 'warning' ? 'Atenção' : 'Alerta';

const statusColors = (status: StatusType) => {
  switch (status) {
    case 'success':
      return { bg: '#dcfce7', text: '#166534' };
    case 'warning':
      return { bg: '#fef9c3', text: '#854d0e' };
    case 'danger':
    default:
      return { bg: '#fee2e2', text: '#b91c1c' };
  }
};

const typeIconLabel = (type: HistoryType) => {
  if (type === 'weight') return 'KG';
  if (type === 'pressure') return 'PA';
  if (type === 'labs') return 'EX';
  return '??';
};

const typeColors = (type: HistoryType) => {
  if (type === 'weight') return { bg: '#fef2f2', text: '#b91c1c' };
  if (type === 'pressure') return { bg: '#ecfdf5', text: '#15803d' };
  return { bg: '#eff6ff', text: '#1d4ed8' };
};

// ---------- "GRÁFICO" FAKE ----------
const MiniSparkline: React.FC<{ values: number[] }> = ({ values }) => {
  if (!values || values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <View style={{ flexDirection: 'row', height: 32, marginTop: 8 }}>
      {values.map((v, i) => {
        const h = 8 + ((v - min) / range) * 20; // 8–28px
        return (
          <View
            key={i}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <View
              style={{
                width: 4,
                height: h,
                borderRadius: 999,
                backgroundColor: '#2563eb',
              }}
            />
          </View>
        );
      })}
    </View>
  );
};

// ---------- TELAS ----------
interface HomeProps {
  data: AppStateData;
  onOpenGamificationInfo: () => void;
  onAskAI: (indicator: string, value: string) => void;
  onAnalyzeMeal: () => void;
}

const HomeScreen: React.FC<HomeProps> = ({
  data,
  onOpenGamificationInfo,
  onAskAI,
  onAnalyzeMeal,
}) => {
  const g = data.gamification;
  const totalGoals = 3;
  const completedRatio =
    (g.goals.pressao.current / g.goals.pressao.target +
      g.goals.sodio.current / g.goals.sodio.target +
      g.goals.peso.current / g.goals.peso.target) /
    totalGoals;
  const percent = Math.min(100, Math.round(completedRatio * 100));

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      {/* Hoje */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hoje</Text>

        <View style={styles.cardMedication}>
          <View style={styles.cardIconCircle}>
            <Text style={{ color: '#1d4ed8', fontWeight: '700' }}>Rx</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardMedicationTitle}>Losartana 50mg</Text>
            <Text style={styles.cardMedicationSubtitle}>
              Próxima dose às <Text style={{ color: '#2563eb', fontWeight: '700' }}>14:00</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.primaryPill}>
            <Text style={styles.primaryPillText}>Tomar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cardMeal} onPress={onAnalyzeMeal}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardMealTitle}>Analisar Refeição</Text>
            <Text style={styles.cardMealSubtitle}>
              Tire uma foto da refeição para receber uma análise simulada de sódio e potássio.
            </Text>
          </View>
          <View style={styles.cardMealCamera}>
            <Text style={{ color: 'white', fontWeight: '700' }}>📷</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Gamificação */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Desafio da Semana</Text>
          <View style={styles.badgePoints}>
            <Text style={styles.badgePointsText}>{g.weeklyPoints} pts</Text>
          </View>
        </View>

        <View style={styles.cardWhite}>
          <Text style={styles.smallMuted}>
            Metas pensadas para ajudar você a se organizar e cuidar dos rins no dia a dia.
          </Text>

          <View style={{ marginTop: 8, marginBottom: 4 }}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.progressLabel}>Progresso semanal</Text>
              <Text style={styles.progressValue}>{percent}%</Text>
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            {/* Pressão */}
            <View style={styles.goalRow}>
              <View style={styles.goalLeft}>
                <View style={[styles.goalIcon, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={{ color: '#15803d', fontWeight: '700', fontSize: 11 }}>PA</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalTitle}>Registrar pressão 5x na semana</Text>
                  <Text style={styles.goalSubtitle}>
                    {g.goals.pressao.current} de {g.goals.pressao.target} feitos
                  </Text>
                </View>
              </View>
              <View style={[styles.goalBadge, { backgroundColor: '#ecfdf5' }]}>
                <Text style={[styles.goalBadgeText, { color: '#15803d' }]}>
                  +{g.goals.pressao.points} pts
                </Text>
              </View>
            </View>

            {/* Sódio */}
            <View style={styles.goalRow}>
              <View style={styles.goalLeft}>
                <View style={[styles.goalIcon, { backgroundColor: '#eff6ff' }]}>
                  <Text style={{ color: '#1d4ed8', fontWeight: '700', fontSize: 11 }}>H2O</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalTitle}>Controlar alimentos ricos em sódio 4 dias</Text>
                  <Text style={styles.goalSubtitle}>
                    {g.goals.sodio.current} de {g.goals.sodio.target} dias concluídos
                  </Text>
                </View>
              </View>
              <View style={[styles.goalBadge, { backgroundColor: '#eff6ff' }]}>
                <Text style={[styles.goalBadgeText, { color: '#1d4ed8' }]}>
                  +{g.goals.sodio.points} pts
                </Text>
              </View>
            </View>

            {/* Peso */}
            <View style={styles.goalRow}>
              <View style={styles.goalLeft}>
                <View style={[styles.goalIcon, { backgroundColor: '#fff7ed' }]}>
                  <Text style={{ color: '#ea580c', fontWeight: '700', fontSize: 11 }}>KG</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalTitle}>Registrar peso 3x na semana</Text>
                  <Text style={styles.goalSubtitle}>
                    {g.goals.peso.current} de {g.goals.peso.target} feitos
                  </Text>
                </View>
              </View>
              <View style={[styles.goalBadge, { backgroundColor: '#fff7ed' }]}>
                <Text style={[styles.goalBadgeText, { color: '#ea580c' }]}>
                  +{g.goals.peso.points} pts
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.infoButton} onPress={onOpenGamificationInfo}>
            <Text style={styles.infoButtonText}>Como essas metas podem te ajudar?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicadores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meus Indicadores</Text>

        {data.indicators.map((ind) => {
          const colors = statusColors(ind.status);
          return (
            <View key={ind.id} style={styles.cardWhite}>
              <View style={styles.indicatorHeader}>
                <View>
                  <Text style={styles.indicatorLabel}>{ind.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 }}>
                    <Text style={styles.indicatorValue}>{ind.value}</Text>
                    <Text style={styles.indicatorUnit}>{ind.unit}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => onAskAI(ind.label, ind.value)}
                >
                  <Text style={styles.aiButtonText}>?</Text>
                </TouchableOpacity>
              </View>

              <MiniSparkline values={ind.history} />

              <View style={[styles.statusPill, { backgroundColor: colors.bg }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text }}>
                  {statusLabel(ind.status)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

interface RecordsProps {
  history: HistoryItem[];
  filter: 'all' | HistoryType;
  onChangeFilter: (f: 'all' | HistoryType) => void;
  onOpenReport: () => void;
}

const RecordsScreen: React.FC<RecordsProps> = ({ history, filter, onChangeFilter, onOpenReport }) => {
  const filtered =
    filter === 'all' ? history : history.filter((h) => h.type === filter);

  const filters: Array<'all' | HistoryType> = ['all', 'pressure', 'weight', 'labs'];

  const mapFilterToLabel = (f: 'all' | HistoryType) => {
    if (f === 'all') return 'Todos';
    if (f === 'pressure') return 'Pressão';
    if (f === 'weight') return 'Peso';
    if (f === 'labs') return 'Exames';
    return '';
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.recordsHeader}>
        <Text style={styles.recordsTitle}>Histórico</Text>
        <Text style={styles.recordsSubtitle}>
          Aqui ficam os registros que você faz para acompanhar sua própria saúde.
        </Text>

        <TouchableOpacity style={styles.reportButton} onPress={onOpenReport}>
          <Text style={styles.reportButtonIcon}>📝</Text>
          <Text style={styles.reportButtonText}>Gerar relatório para consulta</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((f) => {
            const active = f === filter;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => onChangeFilter(f)}
              >
                <Text
                  style={[styles.filterChipText, active && styles.filterChipTextActive]}
                >
                  {mapFilterToLabel(f)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyList}>
            <Text style={{ fontSize: 32, opacity: 0.4 }}>📄</Text>
            <Text style={{ color: '#9ca3af', marginTop: 4 }}>Nenhum registro encontrado.</Text>
          </View>
        ) : (
          filtered.map((item, idx) => {
            const colors = statusColors(item.status);
            const tColors = typeColors(item.type);
            return (
              <View key={idx} style={styles.recordCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View
                    style={[
                      styles.recordIconCircle,
                      { backgroundColor: tColors.bg },
                    ]}
                  >
                    <Text style={{ color: tColors.text, fontWeight: '700', fontSize: 11 }}>
                      {typeIconLabel(item.type)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.recordLabel}>{item.label}</Text>
                    <Text style={styles.recordDate}>{item.date}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.recordValue}>{item.value}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: colors.bg, marginTop: 4 },
                    ]}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text }}>
                      {statusLabel(item.status)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

interface WearableProps {
  wearableConnected: boolean;
  onToggleWearable: (v: boolean) => void;
}

const WearableScreen: React.FC<WearableProps> = ({
  wearableConnected,
  onToggleWearable,
}) => {
  const statusColorsLocal = wearableConnected
    ? { bg: '#dcfce7', text: '#166534', label: 'Online' }
    : { bg: '#e5e7eb', text: '#4b5563', label: 'Offline' };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <Text style={styles.screenTitle}>Wearable</Text>
      <Text style={styles.screenSubtitle}>
        Conecte seu relógio inteligente para usar os dados a seu favor: passos, batimentos e,
        quando disponível, pressão.
      </Text>

      <View style={styles.cardWhite}>
        <View style={styles.wearableHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.wearableIconCircle}>
              <Text style={{ color: '#2563eb', fontWeight: '700' }}>⌚</Text>
            </View>
            <View>
              <Text style={styles.wearableTitle}>Relógio Inteligente</Text>
              <Text style={styles.wearableSubtitle}>
                {wearableConnected
                  ? 'Conectado a "RenalWatch 1.0" (simulação)'
                  : 'Nenhum dispositivo conectado'}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: statusColorsLocal.bg },
            ]}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: statusColorsLocal.text }}>
              {statusColorsLocal.label}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {!wearableConnected && (
            <TouchableOpacity
              style={[styles.primaryButtonFull, { flex: 1 }]}
              onPress={() => onToggleWearable(true)}
            >
              <Text style={styles.primaryButtonFullText}>Procurar dispositivos</Text>
            </TouchableOpacity>
          )}
          {wearableConnected && (
            <TouchableOpacity
              style={[styles.secondaryButtonFull, { flex: 1 }]}
              onPress={() => onToggleWearable(false)}
            >
              <Text style={styles.secondaryButtonFullText}>Desconectar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.wearableInfoBox}>
          <Text style={styles.smallMuted}>
            Quando conectado, o app pode:
          </Text>
          <Text style={styles.smallMuted}>• Ajudar você a ver se está se movimentando ao longo do dia.</Text>
          <Text style={styles.smallMuted}>• Relacionar passos e batimentos com seus registros.</Text>
          <Text style={styles.smallMuted}>• Sugerir lembretes de registro (simulação).</Text>
          <Text style={[styles.smallMuted, { marginTop: 4 }]}>
            Nenhum profissional de saúde acessa seu app. Use esses dados para conversar com seu
            médico nas consultas.
          </Text>
        </View>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          Integração simulada para protótipo. A conexão real usaria Bluetooth / app do fabricante
          do smartwatch.
        </Text>
      </View>
    </ScrollView>
  );
};

interface ProfileProps {
  user: AppStateData['user'];
}

const ProfileScreen: React.FC<ProfileProps> = ({ user }) => {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{user.name[0]}</Text>
        </View>
        <View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileSubtitle}>
            DRC Estágio {user.stage} • {user.age} Anos
          </Text>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <View style={styles.cardWhite}>
          <TouchableOpacity style={styles.profileRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.profileRowIcon}>
                <Text style={{ color: '#2563eb', fontWeight: '700' }}>👤</Text>
              </View>
              <Text style={styles.profileRowText}>Dados Pessoais</Text>
            </View>
            <Text style={{ color: '#d1d5db' }}>›</Text>
          </TouchableOpacity>

          <View style={styles.profileDivider} />

          <TouchableOpacity style={styles.profileRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.profileRowIcon, { backgroundColor: '#f3e8ff' }]}>
                <Text style={{ color: '#7c3aed', fontWeight: '700' }}>💊</Text>
              </View>
              <Text style={styles.profileRowText}>Medicamentos em uso</Text>
            </View>
            <Text style={{ color: '#d1d5db' }}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.profileInfoText}>
          Este app não substitui seu médico. Use-o para lembrar, registrar e levar informações
          organizadas para a consulta.
        </Text>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ---------- APP PRINCIPAL ----------
export default function TabIndex() {
  const [data, setData] = useState<AppStateData>(initialData);
  const [currentScreen, setCurrentScreen] =
    useState<'inicio' | 'registros' | 'wearable' | 'perfil'>('inicio');
  const [online, setOnline] = useState(true);
  const [wearableConnected, setWearableConnected] = useState(false);
  const [historyFilter, setHistoryFilter] =
    useState<'all' | HistoryType>('all');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [modalKind, setModalKind] = useState<'default' | 'report' | 'newRecord'>('default');

  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [mealImageUri, setMealImageUri] = useState<string | null>(null);

  const [formType, setFormType] = useState<'pressure' | 'weight' | 'labs'>('pressure');
  const [formSist, setFormSist] = useState('');
  const [formDiast, setFormDiast] = useState('');
  const [formPeso, setFormPeso] = useState('');
  const [formLabName, setFormLabName] = useState('');
  const [formLabValue, setFormLabValue] = useState('');

  const showModal = (title: string, body: string, kind: 'default' | 'report' | 'newRecord' = 'default') => {
    setModalTitle(title);
    setModalBody(body);
    setModalKind(kind);
    setModalVisible(true);
  };

  const openNotifications = () => {
    const g = data.gamification;

    const conteudo = [
      'Lembretes de autocuidado nesta semana:',
      '',
      `- Registrar pressão 5x na semana (você já fez ${g.goals.pressao.current} de ${g.goals.pressao.target}).`,
      `- Registrar peso 3x na semana (você já fez ${g.goals.peso.current} de ${g.goals.peso.target}).`,
      `- Controlar alimentos ricos em sódio em ${g.goals.sodio.target} dias (você já completou ${g.goals.sodio.current}).`,
      '',
      'Use estes lembretes como apoio para lembrar do que é importante no seu dia a dia.',
    ].join('\n');

    showModal('Notificações e Lembretes', conteudo, 'default');
  };

  const inferStatus = (type: 'pressure' | 'weight' | 'labs', payload: any): StatusType => {
    if (type === 'pressure') {
      const s = Number(payload.sist);
      const d = Number(payload.diast);
      if (s < 140 && d < 90) return 'success';
      if (s < 160 && d < 100) return 'warning';
      return 'danger';
    }
    if (type === 'weight') {
      const p = payload.peso;
      if (p <= 88) return 'success';
      if (p <= 90) return 'warning';
      return 'danger';
    }
    return 'warning';
  };

  const handleOpenNewRecord = () => {
    setFormType('pressure');
    setFormSist('');
    setFormDiast('');
    setFormPeso('');
    setFormLabName('');
    setFormLabValue('');
    setModalTitle('Novo Registro');
    setModalBody('');
    setModalKind('newRecord');
    setModalVisible(true);
  };

  const handleSaveNewRecord = () => {
    let newItem: HistoryItem | null = null;
    const nowDate = new Date();
    const dateLabel =
      'Hoje, ' +
      nowDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (formType === 'pressure') {
      if (!formSist || !formDiast) {
        console.log('Preencha sistólica e diastólica.');
        return;
      }
      const val = `${formSist}/${formDiast} mmHg`;
      newItem = {
        type: 'pressure',
        label: 'Pressão Arterial',
        value: val,
        date: dateLabel,
        status: inferStatus('pressure', { sist: formSist, diast: formDiast }),
      };
      const g = data.gamification;
      const newGam: GamificationData = {
        ...g,
        goals: {
          ...g.goals,
          pressao: {
            ...g.goals.pressao,
            current: Math.min(g.goals.pressao.target, g.goals.pressao.current + 1),
          },
        },
      };
      setData((prev) => ({ ...prev, gamification: newGam }));
    } else if (formType === 'weight') {
      if (!formPeso) {
        console.log('Informe o peso.');
        return;
      }
      const pNumber = parseFloat(formPeso);
      const val = `${pNumber.toFixed(1)} kg`;
      newItem = {
        type: 'weight',
        label: 'Peso Corporal',
        value: val,
        date: dateLabel,
        status: inferStatus('weight', { peso: pNumber }),
      };
      const g = data.gamification;
      const newGam: GamificationData = {
        ...g,
        goals: {
          ...g.goals,
          peso: {
            ...g.goals.peso,
            current: Math.min(g.goals.peso.target, g.goals.peso.current + 1),
          },
        },
      };
      setData((prev) => ({ ...prev, gamification: newGam }));
    } else if (formType === 'labs') {
      if (!formLabName || !formLabValue) {
        console.log('Informe nome do exame e valor.');
        return;
      }
      newItem = {
        type: 'labs',
        label: `Exame de Sangue (${formLabName})`,
        value: formLabValue,
        date: dateLabel,
        status: inferStatus('labs', { nome: formLabName, valor: formLabValue }),
      };
    }

    if (!newItem) return;

    setData((prev) => ({
      ...prev,
      history: [newItem as HistoryItem, ...prev.history],
    }));
    setModalVisible(false);
  };

  const handleAskAI = (indicator: string, value: string) => {
    const body = `Sugestão de perguntas sobre ${indicator} (${value}):

1. Esse valor é adequado para a minha condição atual?
2. O que posso fazer em casa para manter esse indicador mais estável?
3. Com que frequência devo repetir esse exame ou medida?
4. Existe algum sinal de alerta que eu deva observar junto com esse número?

Anote as respostas no app, se achar útil. Isso ajuda a lembrar depois.`;
    showModal('Perguntas para levar à consulta', body, 'default');
  };

  const handleGamificationInfo = () => {
    const body = `Por que usar metas semanais?

- Ajudam você a lembrar de se pesar, medir pressão e cuidar da alimentação.
- Transformam pequenas ações do dia a dia em hábitos de autocuidado.
- Você acompanha sua própria disciplina, sem precisar compartilhar com ninguém.

Use os pontos apenas como motivação pessoal. Em caso de dúvida, sempre converse com o profissional que te acompanha.`;
    showModal('Metas Semanais', body, 'default');
  };

  const handleOpenReport = () => {
    const { user, indicators, history } = data;

    const totalRegistros = history.length;
    const pressao = history.filter(h => h.type === 'pressure');
    const peso = history.filter(h => h.type === 'weight');
    const exames = history.filter(h => h.type === 'labs');

    const ultimo = (items: HistoryItem[]) =>
      items.length > 0 ? `${items[0].value} (${items[0].date})` : '—';

    const tfg = indicators.find(i => i.id === 'tfg');
    const pa = indicators.find(i => i.id === 'pa');
    const pesoAtual = indicators.find(i => i.id === 'peso');

    const linhas: string[] = [];

    linhas.push('RELATÓRIO DE AUTOCUIDADO RENAL');
    linhas.push('---------------------------------------------');
    linhas.push('');
    linhas.push(`Paciente: ${user.name}`);
    linhas.push(`Idade: ${user.age} anos`);
    linhas.push(`Estágio da DRC: ${user.stage}`);
    linhas.push('');
    linhas.push('Indicadores atuais:');
    if (tfg) linhas.push(`- TFG: ${tfg.value} ${tfg.unit}`);
    if (pa) linhas.push(`- Pressão arterial (última): ${pa.value} ${pa.unit}`);
    if (pesoAtual) linhas.push(`- Peso corporal (atual): ${pesoAtual.value} ${pesoAtual.unit}`);
    linhas.push('');
    linhas.push('Resumo de registros no app:');
    linhas.push(`- Total de registros: ${totalRegistros}`);
    linhas.push(`- Registros de pressão: ${pressao.length}`);
    linhas.push(`- Registros de peso: ${peso.length}`);
    linhas.push(`- Registros de exames: ${exames.length}`);
    linhas.push('');
    linhas.push('Últimas medidas registradas:');
    linhas.push(`- Pressão arterial: ${ultimo(pressao)}`);
    linhas.push(`- Peso corporal: ${ultimo(peso)}`);
    linhas.push(`- Exame laboratorial: ${ultimo(exames)}`);
    linhas.push('');
    linhas.push('Observações para consulta:');
    linhas.push('- Este relatório foi gerado pelo próprio paciente a partir dos dados registrados no app.');
    linhas.push('- Os valores devem ser interpretados exclusivamente pelo profissional de saúde.');
    linhas.push('');
    linhas.push('Assinatura do paciente: ______________________________');
    linhas.push('Data: ____/____/________');

    const corpo = linhas.join('\n');

    showModal('Relatório para levar à consulta', corpo, 'report');

    if (Platform.OS === 'web') {
      setTimeout(() => {
        (window as any).print?.();
      }, 500);
    }
  };

  const handleAnalyzeMeal = async () => {
    if (Platform.OS === 'web') {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = (e: any) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          setMealImageUri(url);
          setMealModalVisible(true);
        };
        document.body.appendChild(input);
        input.click();
        setTimeout(() => input.remove(), 1000);
      } catch (err) {
        showModal('Erro', 'Não foi possível abrir o seletor de arquivos no navegador.', 'default');
      }
      return;
    }

    try {
      const ImagePicker = await import('expo-image-picker');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showModal(
          'Permissão necessária',
          'Para analisar a refeição, precisamos de permissão para acessar suas fotos.',
          'default',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (result.canceled) return;

      const uri = result.assets && result.assets[0] && result.assets[0].uri;
      if (!uri) return;
      setMealImageUri(uri);
      setMealModalVisible(true);
    } catch (err) {
      console.error('Erro importando expo-image-picker:', err);
      showModal('Erro', 'Não foi possível acessar a galeria. Verifique se o módulo está instalado.', 'default');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'inicio':
        return (
          <HomeScreen
            data={data}
            onOpenGamificationInfo={handleGamificationInfo}
            onAskAI={handleAskAI}
            onAnalyzeMeal={handleAnalyzeMeal}
          />
        );
      case 'registros':
        return (
          <RecordsScreen
            history={data.history}
            filter={historyFilter}
            onChangeFilter={setHistoryFilter}
            onOpenReport={handleOpenReport}
          />
        );
      case 'wearable':
        return (
          <WearableScreen
            wearableConnected={wearableConnected}
            onToggleWearable={setWearableConnected}
          />
        );
      case 'perfil':
        return <ProfileScreen user={data.user} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header com conexão + notificações */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>RenalCare</Text>
          <Text style={styles.headerSubtitle}>
            Olá, {data.user.name.split(' ')[0]}
          </Text>
          <Text style={styles.headerMiniSubtitle}>
            App pessoal para organizar seu autocuidado renal.
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <TouchableOpacity
            style={[
              styles.connectionBadge,
              { backgroundColor: online ? '#dcfce7' : '#e5e7eb' },
            ]}
            onPress={() => setOnline((o) => !o)}
          >
            <View
              style={[
                styles.connectionDot,
                { backgroundColor: online ? '#22c55e' : '#9ca3af' },
              ]}
            />
            <Text style={styles.connectionText}>
              {online ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.notifButton} onPress={openNotifications}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo */}
      <View style={{ flex: 1 }}>{renderScreen()}</View>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleOpenNewRecord}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation simples */}
      <View style={styles.bottomNav}>
        {[
          { id: 'inicio', label: 'Início', icon: '🏠' },
          { id: 'registros', label: 'Registros', icon: '📊' },
          { id: 'wearable', label: 'Wearable', icon: '⌚' },
          { id: 'perfil', label: 'Perfil', icon: '👤' },
        ].map((tab) => {
          const active = currentScreen === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.bottomNavItem}
              onPress={() => setCurrentScreen(tab.id as any)}
            >
              <Text
                style={[
                  styles.bottomNavIcon,
                  active && { color: '#2563eb' },
                ]}
              >
                {tab.icon}
              </Text>
              <Text
                style={[
                  styles.bottomNavText,
                  active && { color: '#2563eb', fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal genérico */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              {modalKind === 'newRecord' ? (
                <View>
                  <Text style={styles.smallMuted}>
                    Use este formulário para registrar seus próprios dados. Eles
                    ficam só com você neste dispositivo.
                  </Text>

                  <Text style={styles.inputLabel}>Tipo de Registro</Text>
                  <View style={styles.typeSelectorRow}>
                    {[
                      { id: 'pressure', label: 'Pressão' },
                      { id: 'weight', label: 'Peso' },
                      { id: 'labs', label: 'Exame' },
                    ].map((t) => {
                      const active = t.id === formType;
                      return (
                        <TouchableOpacity
                          key={t.id}
                          style={[styles.typeChip, active && styles.typeChipActive]}
                          onPress={() => setFormType(t.id as any)}
                        >
                          <Text
                            style={[
                              styles.typeChipText,
                              active && styles.typeChipTextActive,
                            ]}
                          >
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {formType === 'pressure' && (
                    <View>
                      <Text style={styles.inputLabel}>Sistólica (mmHg)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={formSist}
                        onChangeText={setFormSist}
                        placeholder="Ex: 130"
                      />
                      <Text style={styles.inputLabel}>Diastólica (mmHg)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={formDiast}
                        onChangeText={setFormDiast}
                        placeholder="Ex: 85"
                      />
                    </View>
                  )}

                  {formType === 'weight' && (
                    <View>
                      <Text style={styles.inputLabel}>Peso (kg)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        value={formPeso}
                        onChangeText={setFormPeso}
                        placeholder="Ex: 88.5"
                      />
                    </View>
                  )}

                  {formType === 'labs' && (
                    <View>
                      <Text style={styles.inputLabel}>Nome do exame</Text>
                      <TextInput
                        style={styles.input}
                        value={formLabName}
                        onChangeText={setFormLabName}
                        placeholder="Ex: TFG, Creatinina..."
                      />
                      <Text style={styles.inputLabel}>Valor</Text>
                      <TextInput
                        style={styles.input}
                        value={formLabValue}
                        onChangeText={setFormLabValue}
                        placeholder="Ex: 58 mL/min"
                      />
                    </View>
                  )}

                  <View style={styles.modalFooterButtons}>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={styles.secondaryButtonFull}
                    >
                      <Text style={styles.secondaryButtonFullText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveNewRecord}
                      style={styles.primaryButtonFull}
                    >
                      <Text style={styles.primaryButtonFullText}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: 13,
                    color: '#374151',
                    lineHeight: 20,
                    whiteSpace: 'pre-line' as any,
                  }}
                >
                  {modalBody}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de análise de refeição */}
      <Modal
        animationType="fade"
        transparent
        visible={mealModalVisible}
        onRequestClose={() => setMealModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Análise da Refeição (Simulação)</Text>
              <TouchableOpacity onPress={() => setMealModalVisible(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              {mealImageUri && (
                <Image
                  source={{ uri: mealImageUri }}
                  style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 12 }}
                  resizeMode="cover"
                />
              )}
              <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
                Esta é uma análise simulada apenas para fins de protótipo:
                {'\n\n'}
                • Itens que parecem proteína magra (ex.: frango grelhado) são, em geral, positivos.
                {'\n'}
                • Molhos densos podem ter muito sódio (use com moderação).
                {'\n'}
                • Itens fritos costumam ter mais sal e gordura (tente limitar).
                {'\n\n'}
                Use essas informações apenas como apoio e sempre leve dúvidas para a consulta com
                o profissional que te acompanha.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  scroll: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1d4ed8' },
  headerSubtitle: { fontSize: 12, color: '#6b7280' },
  headerMiniSubtitle: { fontSize: 10, color: '#9ca3af' },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  connectionDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  connectionText: { fontSize: 10, fontWeight: '600', color: '#374151' },
  notifButton: { marginTop: 8 },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  cardMedication: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardMedicationTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cardMedicationSubtitle: { fontSize: 11, color: '#6b7280' },
  primaryPill: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  primaryPillText: { color: 'white', fontSize: 11, fontWeight: '600' },

  cardMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardMealTitle: { color: 'white', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  cardMealSubtitle: { color: '#e9d5ff', fontSize: 11 },
  cardMealCamera: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgePoints: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#eff6ff',
  },
  badgePointsText: { fontSize: 10, fontWeight: '700', color: '#1d4ed8' },

  cardWhite: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
  },

  smallMuted: { fontSize: 11, color: '#6b7280', marginBottom: 2 },

  progressBackground: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#22c55e',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: { fontSize: 10, color: '#9ca3af' },
  progressValue: { fontSize: 10, color: '#374151', fontWeight: '600' },

  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  goalLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  goalIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  goalTitle: { fontSize: 12, fontWeight: '600', color: '#111827' },
  goalSubtitle: { fontSize: 11, color: '#6b7280' },
  goalBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  goalBadgeText: { fontSize: 10, fontWeight: '700' },

  infoButton: {
    marginTop: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  infoButtonText: { fontSize: 11, fontWeight: '600', color: '#2563eb' },

  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicatorLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  indicatorValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  indicatorUnit: { fontSize: 12, color: '#6b7280', marginLeft: 4, marginBottom: 2 },
  aiButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButtonText: { color: '#7c3aed', fontWeight: '700' },

  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },

  // Records
  recordsHeader: { paddingHorizontal: 16, paddingTop: 16, backgroundColor: '#f3f4f6' },
  recordsTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  recordsSubtitle: { fontSize: 11, color: '#6b7280', marginBottom: 8 },
  filterChip: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  filterChipText: { fontSize: 12, color: '#4b5563' },
  filterChipTextActive: { color: '#2563eb', fontWeight: '600' },
  emptyList: { marginTop: 40, alignItems: 'center' },
  recordCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  recordIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  recordLabel: { fontSize: 13, fontWeight: '600', color: '#111827' },
  recordDate: { fontSize: 11, color: '#9ca3af' },
  recordValue: { fontSize: 13, fontWeight: '700', color: '#111827' },

  // Botão de relatório
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
  },
  reportButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  reportButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4f46e5',
  },

  // Wearable
  screenTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  screenSubtitle: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  wearableHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  wearableIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    marginRight: 8,
  },
  wearableTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  wearableSubtitle: { fontSize: 11, color: '#6b7280' },
  wearableInfoBox: { marginTop: 12 },
  warningBox: {
    marginTop: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 8,
  },
  warningText: { fontSize: 11, color: '#92400e' },

  // Perfil
  profileHeader: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: 'white',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: { fontSize: 24, fontWeight: '800', color: '#2563eb' },
  profileName: { fontSize: 20, fontWeight: '700', color: 'white' },
  profileSubtitle: { fontSize: 12, color: '#bfdbfe' },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    alignItems: 'center',
  },
  profileRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  profileRowText: { fontSize: 13, color: '#111827' },
  profileDivider: { height: 1, backgroundColor: '#e5e7eb', marginHorizontal: 12 },
  profileInfoText: { fontSize: 11, color: '#6b7280', marginTop: 8 },
  logoutButton: {
    marginTop: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#b91c1c', fontWeight: '600', fontSize: 13 },

  // FAB + Bottom Nav
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 64,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: 'white', fontSize: 28, fontWeight: '700' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  bottomNavItem: { paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center' },
  bottomNavIcon: { fontSize: 18, color: '#9ca3af', marginBottom: 2 },
  bottomNavText: { fontSize: 11, color: '#6b7280' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  modalClose: { fontSize: 20, color: '#6b7280' },
  modalFooterButtons: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  primaryButtonFull: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonFullText: { color: 'white', fontSize: 13, fontWeight: '600' },
  secondaryButtonFull: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonFullText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  inputLabel: { fontSize: 11, color: '#6b7280', marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  typeSelectorRow: { flexDirection: 'row', marginTop: 4 },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: '#2563eb',
  },
  typeChipText: { fontSize: 11, color: '#4b5563' },
  typeChipTextActive: { color: 'white', fontWeight: '600' },
});