import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  buttonWrapper: {
    display: "flex",
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 1000,
    flexDirection: "row",
  },
  button: {
    flexGrow: 1,
    backgroundColor: "lightgreen",
    padding: 20,
    alignItems: "center",
  },
  settingsButton: {
    backgroundColor: "yellow",
  },
  stopButton: {
    backgroundColor: "red",
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  openButton: {
    backgroundColor: "lightgreen",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    textAlign: "center",
  },
  textInput: {
    textAlign: "center",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    marginBottom: 15,
    width: 100,
  },
});

export default styles;
