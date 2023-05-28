import { StatusBar } from "expo-status-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  TouchableOpacity,
  View,
  Text,
  Dimensions,
  Modal,
} from "react-native";
import { Camera } from "expo-camera";
import { useRef, useState } from "react";
import * as ImageManipulator from "expo-image-manipulator";
import Animated, {
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
import { CameraFullScreen } from "./components/CameraFullScreen";
import { SafeAreaView } from "react-native";
import ModalComponent from "./components/Modal";
import styles from "./styles";
import { Countdown } from "./components/Countdown";

const PanAnimatedView = Animated.createAnimatedComponent(View);
const PinchAnimatedView = Animated.createAnimatedComponent(View);

export default function App() {
  const [capturing, setCapturing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef<Camera | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timer | null>(null);
  const [timeLapseDurationInSeconds, setTimeLapseDurationInSeconds] =
    useState(5);
  const [timeStepInSeconds, setTimeStepInSeconds] = useState(1);

  const [remainingTime, setRemainingTime] = useState(5);
  const poi = { x: 10, y: 10, width: 200, height: 200 };

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
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      left: translateX.value,
      top: translateY.value,
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

      const screenOrientation = await ScreenOrientation.getOrientationAsync();
      const isPortrait =
        screenOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
        screenOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN;

      const screenWidth = isPortrait
        ? Dimensions.get("window").width
        : Dimensions.get("window").height;
      const screenHeight = isPortrait
        ? Dimensions.get("window").height
        : Dimensions.get("window").width;

      const imageWidth = data.width;
      const imageHeight = data.height;

      const cropWidth = (width.value / screenWidth) * imageWidth;
      const cropHeight = (height.value / screenHeight) * imageHeight;
      const originX = (translateX.value / screenWidth) * imageWidth;
      const originY = (translateY.value / screenHeight) * imageHeight;

      const result = await ImageManipulator.manipulateAsync(
        data.uri,
        [
          {
            crop: {
              originX,
              originY,
              width: cropWidth,
              height: cropHeight,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
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
    <SafeAreaView style={{ flex: 1 }}>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.information}>
          <View style={styles.informationItem}>
            <Text style={styles.informationText}>Capture Settings:</Text>
            <View>
              <Text style={styles.informationText}>
                Duration: {timeLapseDurationInSeconds}s
              </Text>
              <Text style={styles.informationText}>
                Timestep: {timeStepInSeconds}s
              </Text>
            </View>
          </View>
          <View style={styles.informationItem}>
            {capturing && <Countdown time={remainingTime} capturing={capturing} />}
          </View>
        </View>
        <CameraFullScreen ref={cameraRef}>
          <PinchGestureHandler onGestureEvent={onPinch}>
            <PinchAnimatedView
              style={{
                position: "absolute",
                zIndex: 900,
                width: "100%",
                height: "100%",
                top: poi.y,
                left: poi.x,
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
                      borderWidth: 2,
                      borderRadius: 2,
                      borderColor: "red",
                    },
                  ]}
                />
              </PanGestureHandler>
            </PinchAnimatedView>
          </PinchGestureHandler>
        </CameraFullScreen>
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
    </SafeAreaView>
  );
}