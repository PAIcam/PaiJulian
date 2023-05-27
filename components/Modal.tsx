import { Text, TextInput, TouchableOpacity, View } from "react-native";
import styles from "../styles";

interface modalProps {
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    visible: boolean,
    setTimeLapseDurationInSeconds: React.Dispatch<React.SetStateAction<number>>,
    setTimeStepInSeconds: React.Dispatch<React.SetStateAction<number>>,
}

export default function ModalComponent(props: modalProps) {
    const setVisible = props.setVisible;
    const visible = props.visible;
    const setTimeLapseDurationInSeconds = props.setTimeLapseDurationInSeconds;
    const setTimeStepInSeconds = props.setTimeStepInSeconds;

  return <View style={styles.centeredView}>
    <View style={styles.modalView}>
      <Text style={styles.modalText}>Settings:</Text>
      <Text>Time Lapse Duration:</Text>
      <TextInput 
        onChangeText={(text) => setTimeLapseDurationInSeconds(parseInt(text))}
        keyboardType="numeric"
      />
      <Text>Time Step:</Text>
      <TextInput 
        onChangeText={(text) => setTimeStepInSeconds(parseInt(text))}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
        onPress={() => setVisible(!visible)}
      >
        <Text style={styles.textStyle}>Hide Modal</Text>
      </TouchableOpacity>
    </View>
  </View>
};