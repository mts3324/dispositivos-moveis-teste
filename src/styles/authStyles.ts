import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },

  blueShape: {
    position: "absolute",
    top: -100,
    right: -50,
    width: width * 0.8,
    height: height * 0.35,
    backgroundColor: "#A8D8EA",
    borderBottomLeftRadius: width * 0.8,
    borderBottomRightRadius: width * 0.8,
  },
  yellowShape: {
    position: "absolute",
    bottom: -50,
    left: -50,
    width: width * 0.8,
    height: height * 0.35,
    backgroundColor: "#FFE66D",
    borderTopLeftRadius: width * 0.8,
    borderTopRightRadius: width * 0.8,
  },

  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 3,
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 100,
    zIndex: 1,
  },
  contentSignup: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    zIndex: 1,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 40,
    lineHeight: 24,
    fontWeight: "400",
  },
  label: {
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 10,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  inputSignup: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  passwordContainerSignup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    paddingVertical: 10,
  },
  eyeIcon: {
    padding: 8,
  },

  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  selectPlaceholder: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "400",
  },
  selectText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#3B5BDB",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "400",
  },

  button: {
    backgroundColor: "#3B5BDB",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 4px 8px rgba(59, 91, 219, 0.3)",
    elevation: 5,
  },
  buttonSignup: {
    backgroundColor: "#3B5BDB",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#3B5BDB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    paddingBottom: 40,
    zIndex: 2,
  },
  footerText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "400",
  },
  footerLink: {
    fontSize: 16,
    color: "#3B5BDB",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  modalClose: {
    padding: 4,
  },
  collegeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  collegeItemText: {
    fontSize: 16,
    color: "#1A1A1A",
    flex: 1,
    fontWeight: "400",
  },

  cardSmall: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  message: {
    textAlign: "center",
    marginBottom: 12,
    color: "#ff3b30",
  },

  inputSmall: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },

  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  picker: {
    height: 44,
    width: "100%",
  },

  buttonPrimarySmall: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  buttonPrimary: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  linkText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    color: "#333",
  },
  linkHighlight: {
    color: "#007AFF",
    fontWeight: "bold",
  },

  socialContainerSmall: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  socialButtonSmall: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  socialTextSmall: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  pickerLabel: {
    fontSize: 14,
    color: "#333",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
});
