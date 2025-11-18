import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme, colors, commonStyles } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [achievementsNotifications, setAchievementsNotifications] = useState(true);
  const [challengesNotifications, setChallengesNotifications] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [selectedFontSize, setSelectedFontSize] = useState("Médio");
  const [selectedPrivacy, setSelectedPrivacy] = useState("Público");
  const [selectedLanguage, setSelectedLanguage] = useState("Português");
  const [selectedDateFormat, setSelectedDateFormat] = useState("DD/MM/AAAA");
  const [selectedTimeZone, setSelectedTimeZone] = useState("São Paulo (GMT-3)");

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={[commonStyles.text, styles.pageTitle]}>Configurações</Text>
          <Text style={[commonStyles.text, styles.subtitle]}>Personalize sua experiência e configure suas preferências.</Text>
          
          {/* Seção de Aparência */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="color-palette" size={20} color={colors.primary} />
              </View>
              <Text style={[commonStyles.text, styles.sectionTitle]}>Aparência</Text>
            </View>
            
            <View style={styles.settingCard}>
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Tema</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Escolha entre modo claro ou escuro</Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Tamanho da Fonte</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Ajuste o tamanho do texto para melhor legibilidade</Text>
                </View>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedFontSize}
                    style={[styles.picker, {color: colors.text, backgroundColor: isDarkMode ? colors.card : 'transparent'}]}
                    dropdownIconColor={colors.primary}
                    onValueChange={(itemValue) => setSelectedFontSize(itemValue)}
                    mode="dropdown"
                  >
                    <Picker.Item label="Pequeno" value="Pequeno" />
                    <Picker.Item label="Médio" value="Médio" />
                    <Picker.Item label="Grande" value="Grande" />
                  </Picker>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Alto Contraste</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Melhora a visibilidade com cores de alto contraste</Text>
                </View>
                <Switch
                  value={false}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={'#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Animações</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Ativa ou desativa animações na interface</Text>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={'#f4f3f4'}
                />
              </View>
            </View>
          </View>
          
          {/* Seção de Notificações */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
              </View>
              <Text style={[commonStyles.text, styles.sectionTitle]}>Notificações</Text>
            </View>
            
            <View style={styles.settingCard}>
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Notificações por Email</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Receba atualizações importantes por email</Text>
                </View>
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={emailNotifications ? '#fff' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Notificações Push</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Ativa notificações no navegador</Text>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={pushNotifications ? '#fff' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Conquistas</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Seja notificado quando ganhar novas conquistas</Text>
                </View>
                <Switch
                  value={achievementsNotifications}
                  onValueChange={setAchievementsNotifications}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={achievementsNotifications ? '#fff' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Novos Desafios</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Receba notificações sobre novos desafios disponíveis</Text>
                </View>
                <Switch
                  value={challengesNotifications}
                  onValueChange={setChallengesNotifications}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={challengesNotifications ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>
          
          {/* Seção de Privacidade */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="privacy-tip" size={20} color={colors.primary} />
              </View>
              <Text style={[commonStyles.text, styles.sectionTitle]}>Privacidade</Text>
            </View>
            
            <View style={styles.settingCard}>
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Visibilidade do Perfil</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Quem pode ver seu perfil</Text>
                </View>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedPrivacy}
                    style={[styles.picker, {color: colors.text, backgroundColor: isDarkMode ? colors.card : 'transparent'}]}
                    dropdownIconColor={colors.primary}
                    onValueChange={(itemValue) => setSelectedPrivacy(itemValue)}
                    mode="dropdown"
                  >
                    <Picker.Item label="Público" value="Público" />
                    <Picker.Item label="Amigos" value="Amigos" />
                    <Picker.Item label="Privado" value="Privado" />
                  </Picker>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Mostrar Email</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Exibe seu email no perfil público</Text>
                </View>
                <Switch
                  value={showEmail}
                  onValueChange={setShowEmail}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={showEmail ? '#fff' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Mostrar Estatísticas</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Exibe suas estatísticas de progresso</Text>
                </View>
                <Switch
                  value={showStats}
                  onValueChange={setShowStats}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={showStats ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>
          
          {/* Seção de Preferências */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="settings-sharp" size={20} color={colors.primary} />
              </View>
              <Text style={[commonStyles.text, styles.sectionTitle]}>Preferências</Text>
            </View>
            
            <View style={styles.settingCard}>
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Idioma</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Idioma da interface</Text>
                </View>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedLanguage}
                    style={[styles.picker, {color: colors.text, backgroundColor: isDarkMode ? colors.card : 'transparent'}]}
                    dropdownIconColor={colors.primary}
                    onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                    mode="dropdown"
                  >
                    <Picker.Item label="Português" value="Português" />
                    <Picker.Item label="English" value="English" />
                    <Picker.Item label="Español" value="Español" />
                  </Picker>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Fuso Horário</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Seu fuso horário local</Text>
                </View>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedTimeZone}
                    style={[styles.picker, {color: colors.text, backgroundColor: isDarkMode ? colors.card : 'transparent'}]}
                    dropdownIconColor={colors.primary}
                    onValueChange={(itemValue) => setSelectedTimeZone(itemValue)}
                    mode="dropdown"
                  >
                    <Picker.Item label="São Paulo (GMT-3)" value="São Paulo (GMT-3)" />
                    <Picker.Item label="Lisboa (GMT+0)" value="Lisboa (GMT+0)" />
                    <Picker.Item label="New York (GMT-5)" value="New York (GMT-5)" />
                  </Picker>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View>
                  <Text style={[commonStyles.text, styles.settingLabel]}>Formato de Data</Text>
                  <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>Como as datas são exibidas</Text>
                </View>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedDateFormat}
                    style={[styles.picker, {color: colors.text, backgroundColor: isDarkMode ? colors.card : 'transparent'}]}
                    dropdownIconColor={colors.primary}
                    onValueChange={(itemValue) => setSelectedDateFormat(itemValue)}
                    mode="dropdown"
                  >
                    <Picker.Item label="DD/MM/AAAA" value="DD/MM/AAAA" />
                    <Picker.Item label="MM/DD/AAAA" value="MM/DD/AAAA" />
                    <Picker.Item label="AAAA-MM-DD" value="AAAA-MM-DD" />
                  </Picker>
                </View>
              </View>
            </View>
          </View>
          
          {/* Seção de Conta */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="user-circle" size={20} color={colors.primary} />
              </View>
              <Text style={[commonStyles.text, styles.sectionTitle]}>Conta</Text>
            </View>
            
            <View style={styles.settingCard}>
              <TouchableOpacity style={styles.accountButton}>
                <Text style={[styles.accountButtonText, {color: colors.primary}]}>Alterar Senha</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.accountButton}>
                <Text style={[styles.accountButtonText, {color: colors.primary}]}>Exportar Dados</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.accountButton} onPress={logout}>
                <Text style={styles.deleteAccountText}>Excluir Conta</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Seção Sobre */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
              </View>
              <Text style={[commonStyles.text, styles.sectionTitle]}>Sobre</Text>
            </View>
            
            <View style={styles.settingCard}>
              <View style={styles.aboutItem}>
                <Text style={[commonStyles.text, styles.aboutLabel]}>Versão</Text>
                <Text style={[styles.aboutValue, {color: colors.textSecondary}]}>1.0.0</Text>
              </View>
              
              <View style={styles.aboutItem}>
                <Text style={[commonStyles.text, styles.aboutLabel]}>Última Atualização</Text>
                <Text style={[styles.aboutValue, {color: colors.textSecondary}]}>15 de Janeiro, 2024</Text>
              </View>
              
              <View style={styles.aboutItem}>
                <Text style={[commonStyles.text, styles.aboutLabel]}>Suporte</Text>
                <Text style={[styles.aboutValue, {color: colors.primary}]}>suporte@exemplo.com</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.saveButton, {backgroundColor: colors.primary}]}>
            <Text style={styles.saveButtonText}>Salvar Configurações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  settingCard: {
    borderRadius: 12,
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  pickerContainer: {
    width: 120,
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 40,
  },
  accountButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: 'transparent',
  },
  accountButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ff4757",
  },
  aboutItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  aboutLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  aboutValue: {
    fontSize: 14,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
