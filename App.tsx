import { StatusBar } from "expo-status-bar";
import { TouchableOpacity, StyleSheet, View, Text, Modal } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { SetStateAction, useRef, useState } from "react";
import * as ImageManipulator from "expo-image-manipulator";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import { saveImage } from "./saveImage";
import ModalComponent from "./components/Modal";
import styles from "./styles";
import { Countdown } from "./components/Countdown";

const PanAnimatedView = Animated.createAnimatedComponent(View);
const PinchAnimatedView = Animated.createAnimatedComponent(View);

export default function App() {
  const [capturing, setCapturing] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef<Camera | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timer | null>(null);
  const [timeLapseDurationInSeconds, setTimeLapseDurationInSeconds] =
    useState(5);
  const [timeStepInSeconds, setTimeStepInSeconds] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [poi, setPoi] = useState({ x: 100, y: 100, width: 100, height: 100 });
  const [remainingTime, setRemainingTime] = useState(5);

  const translateX = useSharedValue(poi.x);
  const translateY = useSharedValue(poi.y);
  const width = useSharedValue(poi.width);
  const height = useSharedValue(poi.height);

  const onDrag = useAnimatedGestureHandler({
    onStart: (event, context: any) => {
      context.translateX = translateX.value;
      context.translateY = translateY.value;
    },
    onActive: (event, context) => {
      translateX.value = event.translationX + context.translateX;
      translateY.value = event.translationY + context.translateY;
    },
    onEnd: () => {
      runOnJS(setPoi)({
        ...poi,
        x: translateX.value,
        y: translateY.value,
      });
    },
  });

  const onPinch = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    any
  >({
    onStart: (event, context: any) => {
      context.width = width.value;
      context.height = height.value;
    },
    onActive: (event, context) => {
      width.value = event.scale * context.width;
      height.value = event.scale * context.height;
    },
    onEnd: (event, context) => {
      runOnJS(setPoi)({
        ...poi,
        width: context.width,
        height: context.height,
      });
    },
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
      ],
    };
  });

  const sizeStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      height: height.value,
    };
  });

  if (!permission || !permission.granted) {
    requestPermission();
    return <View />;
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      const options = { quality: 1, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);

      const multiplierX = 5;
      const multiplierY = 5;

      const result = await ImageManipulator.manipulateAsync(
        data.uri,
        [
          {
            crop: {
              originX: poi.x * multiplierX,
              originY: poi.y * multiplierY,
              width: poi.width * multiplierX,
              height: poi.height * multiplierY,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      saveImage(result.uri);
    }
  };

  const startCapture = () => {
    setCapturing(true);
    let counter = 0;
    captureIntervalRef.current = setInterval(() => {
      handleCapture();
      counter = counter + timeStepInSeconds;
      if (counter >= timeLapseDurationInSeconds) {
        stopCapture();
      }
    }, timeStepInSeconds * 1000);
  };

  const stopCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      setCapturing(false);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.information}>
        Duration: {timeLapseDurationInSeconds}s Timestep: {timeStepInSeconds}s
      </Text>
      {capturing && <Countdown time={remainingTime} capturing={capturing} />}
      <Camera style={styles.camera} type={CameraType.back} ref={cameraRef} />
      <PinchGestureHandler onGestureEvent={onPinch}>
        <PinchAnimatedView
          style={{
            position: "absolute",
            zIndex: 900,
            width: "100%",
            height: "100%",
          }}
        >
          <PanGestureHandler onGestureEvent={onDrag}>
            <PanAnimatedView
              style={[
                containerStyle,
                sizeStyle,
                {
                  position: "absolute",
                  zIndex: 100,
                  top: 0,
                  left: 0,
                  borderWidth: 2,
                  borderRadius: 2,
                  borderColor: "red",
                },
              ]}
            />
          </PanGestureHandler>
        </PinchAnimatedView>
      </PinchGestureHandler>
      {!modalVisible && (
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={capturing ? stopCapture : startCapture}
            style={capturing ? styles.stopButton : styles.button}
          >
            <Text>{capturing ? "Stop Capture" : "Start Capture"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{ ...styles.button, ...styles.settingsButton }}
          >
            <Text>Open Settings</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <ModalComponent
          setVisible={setModalVisible}
          visible={modalVisible}
          setTimeLapseDurationInSeconds={setTimeLapseDurationInSeconds}
          setTimeStepInSeconds={setTimeStepInSeconds}
          setRemainingTime={setRemainingTime}
        />
      </Modal>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
