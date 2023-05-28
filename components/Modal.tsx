import { Text, TextInput, TouchableOpacity, View } from "react-native";
import styles from "../styles";

interface modalProps {
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  visible: boolean;
  setTimeLapseDurationInSeconds: React.Dispatch<React.SetStateAction<number>>;
  setTimeStepInSeconds: React.Dispatch<React.SetStateAction<number>>;
  setRemainingTime: React.Dispatch<React.SetStateAction<number>>;
}

export default function ModalComponent(props: modalProps) {
  const setVisible = props.setVisible;
  const visible = props.visible;
  const setTimeLapseDurationInSeconds = props.setTimeLapseDurationInSeconds;
  const setTimeStepInSeconds = props.setTimeStepInSeconds;
  const setRemainingTime = props.setRemainingTime;

  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Time Lapse (s)</Text>
        <TextInput
          onChangeText={(text) => {
            setTimeLapseDurationInSeconds(parseInt(text));
            setRemainingTime(parseInt(text));
          }}
          keyboardType="numeric"
          style={styles.textInput}
        />
        <Text style={styles.modalText}>Time Step</Text>
        <TextInput
          onChangeText={(text) => setTimeStepInSeconds(parseInt(text))}
          keyboardType="numeric"
          style={styles.textInput}
        />
        <TouchableOpacity
          style={{ ...styles.openButton }}
          onPress={() => setVisible(!visible)}
        >
          <Text style={styles.textStyle}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
