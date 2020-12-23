import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ToastAndroid,
  Alert,
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as firebase from "firebase";
import db from "../config";

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermission: null,
      scanned: false,
      scannedBookId: "",
      scannedStudentId: "",
      buttonState: "normal",
    };
  }

  getCameraPermission = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === "granted",
      buttonState: id,
      scanned: false,
    });
  };

  handleBarcodeScanned = async ({ type, data }) => {
    const buttonState = this.state.buttonState;
    if (buttonState === "bookId") {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: "normal",
      });
    } else if (buttonState === "studentId") {
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: "normal",
      });
    }
  };

  handleTransaction = async () => {
    db.collection("books")
      .doc(this.state.scannedBookId)
      .get()
      .then((doc) => {
        var book = doc.data();
        if (book.bookAvailability) {
          this.initiateBookIssue();
          Alert.alert("Book is issued!!");
          // ToastAndroid.show("Book is issued",ToastAndroid.SHORT);
        } else {
          this.initiateBookReturn();
          Alert.alert("Book is returned!!");
          //ToastAndroid.show("Book is returned!!",ToastAndroid.SHORT);
        }
      });
  };

  handleTransaction = async () => {
    var transactionType = await this.checkBookEligibility();
    if (!transactionType) {
      Platform.OS === "ios"
        ? Alert.alert("This Book is doesn't exist in the library database")
        : ToastAndroid.show(
            "This Book is doesn't exist in the library database",
            ToastAndroid.SHORT
          );
      this.setState({
        scannedBookId: "",
        scannedStudentId: "",
      });
    } else if (transactionType === "Issue") {
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if (isStudentEligible) {
        this.initiateBookIssue();
        Platform.OS === "ios"
          ? Alert.alert("Book issued to the student")
          : ToastAndroid.show("Book issued to the student", ToastAndroid.SHORT);
      }
    } else {
      var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
      if (isStudentEligible) {
        this.initiateBookReturn();
        Platform.OS === "ios"
          ? Alert.alert("Book returned to the library")
          : ToastAndroid.show(
              "Book returned to the library",
              ToastAndroid.SHORT
            );
      }
    }
  };

  checkStudentEligibilityForBookIssue = async () => {
    const studentRef = await db
      .collection("students")
      .where("studentId", "==", this.state.scannedStudentId)
      .get();
    var isStudentEligible = null;
    if (studentRef.docs.length === 0) {
      this.setState({
        scannedBookId: "",
        scannedStudentId: "",
      });
      isStudentEligible = false;
      Platform.OS === "ios"
        ? Alert.alert("Student ID  does not exist in the database")
        : ToastAndroid.show(
            "student ID  does not exist in the database",
            ToastAndroid.SHORT
          );
    } else {
      studentRef.docs.map((doc) => {
        var student = doc.data();
        if (student.numberOfBooksIssued < 2) {
          isStudentEligible = true;
        } else {
          this.setState({
            scannedBookId: "",
            scannedStudentId: "",
          });
          isStudentEligible = false;
          Platform.OS === "ios"
            ? Alert.alert("Student has already issued 2 books")
            : ToastAndroid.show(
                "Student has already issued 2 books",
                ToastAndroid.SHORT
              );
        }
      });
    }
    return isStudentEligible;
  };

  checkStudentEligibilityForBookReturn = async () => {
    const transactionRef = await db
      .collection("transactions")
      .where("bookId", "==", this.state.scannedBookId)
      .limit(1)
      .get();
    var isStudentEligible = null;
    transactionRef.docs.map((doc) => {
      var lastBookTransaction = doc.data();
      if (lastBookTransaction.studentId === this.state.scannedStudentId) {
        isStudentEligible = true;
      } else {
        this.setState({
          scannedBookId: "",
          scannedStudentId: "",
        });
        isStudentEligible = false;
        Platform.OS === "ios"
          ? Alert.alert("The Book was not issued  by this student")
          : ToastAndroid.show(
              "The Book was not issued  by this student",
              ToastAndroid.SHORT
            );
      }
    });

    return isStudentEligible;
  };

  checkBookEligibility = async () => {
    const bookRef = await db
      .collection("books")
      .where("bookId", "==", this.state.scannedBookId)
      .get();
    var transactionType = null;
    if (bookRef.docs.length === 0) {
      transactionType = false;
    } else {
      bookRef.docs.map((doc) => {
        var book = doc.data();
        if (book.bookAvailability) {
          transactionType = "Issue";
        } else {
          transactionType = "Return";
        }
      });
    }
    return transactionType;
  };

  initiateBookIssue = async () => {
    db.collection("transactions").add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "issue",
    });
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: false,
    });
    db.collection("students")
      .doc(this.state.scannedStudentId)
      .update({
        bookIssued: firebase.firestore.FieldValue.increment(1),
      });
    this.setState({
      scannedBookId: "",
      scannedStudentId: "",
    });
  };

  initiateBookReturn = async () => {
    db.collection("transactions").add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "return",
    });
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: true,
    });
    db.collection("students")
      .doc(this.state.scannedStudentId)
      .update({
        bookIssued: firebase.firestore.FieldValue.increment(-1),
      });
    this.setState({
      scannedBookId: "",
      scannedStudentId: "",
    });
  };

  render() {
    const hasCameraPermission = this.state.hasCameraPermission;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;
    if (buttonState !== "normal" && hasCameraPermission) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarcodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (buttonState === "normal") {
      return (
        <View style={styles.container}>
          <View style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <Image
                  style={styles.logoContainer}
                  source={require("../assets/booklogo.jpg")}
                />
                <Text style={styles.logoName}>Wily</Text>
                <View style={styles.inputView}>
                  <TextInput
                    style={styles.inputBox}
                    placeholder="Book Id"
                    onChangeText={(txt) => {
                      this.setState({
                        scannedBookId: txt,
                      });
                    }}
                    value={this.state.scannedBookId}
                  />
                  <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => {
                      this.getCameraPermission("bookId");
                    }}
                  >
                    <Text style={styles.buttonText}>Scan</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputView}>
                  <TextInput
                    style={styles.inputBox}
                    placeholder="Student Id"
                    onChangeText={(txt) => {
                      this.setState({
                        scannedStudentId: txt,
                      });
                    }}
                    value={this.state.scannedStudentId}
                  />
                  <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => {
                      this.getCameraPermission("studentId");
                    }}
                  >
                    <Text style={styles.buttonText}>Scan</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={this.handleTransaction}>
                  <Text>Submit</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    backgroundColor: "green",

    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0,
  },
  buttonText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
  },
  displayText: {
    textDecorationLine: "underline",
    fontSize: 15,
  },
  logoContainer: {
    width: 200,
    height: 200,
    marginLeft: 15,
  },
  logoName: {
    fontSize: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  inputView: {
    flexDirection: "row",
    margin: 20,
  },
  inputBox: {
    width: 200,
    height: 50,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20,
  },
});
