import * as React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
 
  Alert,
} from "react-native";
import firebase, { auth } from "firebase";

export default class LoginScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      emailId: "",
      password: "",
    };
  }

  login = async (email, password) => {
    if (email && password) {
      try {
        const response = await firebase
          .auth()
          .signInWithEmailAndPassword(email, password);
        if (response) {
          this.props.navigation.navigate("Transaction");
        }
      } catch (error) {
        switch (error.code) {
          case "auth/user-not-found":
            Alert.alert("User dosen't exist");
            break;
          case "auth/invalid-email":
            Alert.alert("incorrect email or password");
            break;
        }
      }
    }
    else{
        Alert.alert("enter email and password")
    }
  };
  render() {
    return (
      <KeyboardAvoidingView style={{ alignItems: "center", marginTop: 20 }}>
        <View>
          <Image
            style={styles.logoContainer}
            source={require("../assets/booklogo.jpg")}
          />
          <Text style={styles.logoName}>Wily</Text>
        </View>
        <View>
          <TextInput
            style={styles.loginBox}
            placeholder="abc@example.com"
            keyboardType="email-address"
            onChangeText={(text) => {
              this.setState({
                emailId: text,
              });
            }}
          />

          <TextInput
            style={styles.loginBox}
            placeholder="enter password"
            secureTextEntry={true}
            onChangeText={(text) => {
              this.setState({
                password: text,
              });
            }}
          />
        </View>
        <View>
          <TouchableOpacity
            style={{
              height: 30,
              width: 90,
              borderWidth: 1,
              marginTop: 20,
              paddingTop: 5,
              borderRadius: 10,
            }}
            onPress={() => {
              this.login(this.state.emailId, this.state.password);
            }}
          >
            <Text style={{ textAlign: "center" }}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  loginBox: {
    width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    paddingLeft: 10,
    margin: 10,
  },
});
