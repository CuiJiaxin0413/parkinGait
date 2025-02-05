import { getAuth, onAuthStateChanged, signInWithEmailAndPassword,createUserWithEmailAndPassword  } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Dimensions,
  Vibration
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { auth } from "./firebase";

let ScreenHeight = Dimensions.get("window").height;

const LogIn = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const moveToForgetPassword = () => {
    navigation.navigate("ForgetPassword");
  }

  auth.onAuthStateChanged((user) =>{
    if (user) {
    } else {
    }
  });
  useEffect(() => {

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("SIGNING IN");
        navigation.navigate("MainPage"); 
      }
    });

    return unsubscribe;
  }, []);

  const handleSignUp = () => {
    console.log("goging to regiset");
    navigation.navigate("Register");
  };
  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log(user.email);
        if (user!= null){
          navigation.navigate("Calibration");
        }
        // ...
      })
      .catch((error) => {
        // Login failed, show prompt
        if (error.code === "auth/wrong-password") {
          Alert.alert("Invalid Password", "The password you entered is incorrect. Please try again.");
        } else {
          Alert.alert("Login Error", "Failed to log in. Please check your credentials and try again.");
        }
        console.error("Login error:", error);
      });
  };

  return (
    <KeyboardAwareScrollView
      resetScrollToCoords={{ x: 0, y: 0 }}
      contentContainerStyle={styles.container}
      scrollEnabled
    >
      <Image
        source={require("./assets/icon.png")}
        style={styles.logo}
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSignUp}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Create New User</Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity onPress={moveToForgetPassword}>
        <Text style={{ color: "#198fc2" , fontSize : 15, marginTop:ScreenHeight * 0.02}}>{'Forget Your Password?'}</Text>
        </TouchableOpacity>

        
      </View>

      



    </KeyboardAwareScrollView>
    
  );
};

export default LogIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dedad2",
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  button: {
    backgroundColor: "#198fc2",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "white",
    marginTop: 5,
    borderColor: "#198fc2",
    borderWidth: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonOutlineText: {
    color: "#198fc2",
    fontWeight: "700",
    fontSize: 16,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 15,
  },
});