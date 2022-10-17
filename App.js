import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, StyleSheet, Text, View, Pressable } from "react-native";
import { Audio } from "expo-av";
import * as Sharing from "expo-sharing";

export default function App() {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [message, setMessage] = useState("");

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );

        setRecording(recording);
      } else {
        setMessage("Please grant permission to app to access microphone");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setRecording(null);
    await recording.stopAndUnloadAsync();

    const updatedRecordings = [...recordings];
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    updatedRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI(),
    });

    setRecordings(updatedRecordings);
  }

  function getDurationFormatted(milliseconds) {
    const minutes = milliseconds / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesDisplay) * 60);
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutesDisplay}:${secondsDisplay}`;
  }

  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <View style={styles.row}>
        <Pressable
          style={
            recording ? styles.recordingButtonRecording : styles.recordingButton
          }
          onPress={recording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>
            {recording ? "Stop Recording" : "Start Recording"}
          </Text>
        </Pressable>
      </View>
      <RecordingLines recordings={recordings} />
      <StatusBar style="auto" />
    </View>
  );
}

const RecordingLines = ({ recordings }) => {
  if (recordings.length < 1) return null;
  return recordings.map((recordingLine, index) => (
    <View key={index} style={styles.row}>
      <Text style={styles.fill}>
        Recording {index + 1} - {recordingLine.duration}
      </Text>
      <Button
        style={styles.playbackButton}
        onPress={() => recordingLine.sound.replayAsync()}
        title="Play"
      />
      <Button
        style={styles.playbackButton}
        onPress={() => Sharing.shareAsync(recordingLine.file)}
        title="Save"
      />
    </View>
  ));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fill: {
    flex: 1,
    margin: 16,
  },
  recordingButton: {
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
  },
  recordingButtonRecording: {
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "red",
  },
  playbackButton: {
    marginHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  recordingIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 10,
    backgroundColor: "red",
  },
});
