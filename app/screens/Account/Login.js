import React, { useRef } from "react";
import { StyleSheet, View, ScrollView, Image, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LoginForm from "../../components/Account/LoginForm";
import LoginFacebook from "../../components/Account/LoginFacebook";
import Toast from "react-native-easy-toast";

export default function Login() {
  const toastRef = useRef();
  //const navigation = useNavigation();

  return (
    <ScrollView>
      <Image
        source={require("../../../assets/img/icono-logo.png")}
        resizeMode="contain"
        style={styles.logo}
      />
      <View style={styles.viewContainer}>
        <LoginForm toastRef={toastRef} />
      </View>
      <View style={styles.viewContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          <View
            style={{ flexGrow: 1, backgroundColor: "#e5e5e5", height: 2 }}
          ></View>
          <Text
            style={{
              color: "#afafaf",
              flexGrow: 0,
              paddingRight: 8,
              paddingLeft: 8,
              fontSize: 15,
              fontWeight: "bold",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            O
          </Text>
          <View
            style={{ flexGrow: 1, backgroundColor: "#e5e5e5", height: 2 }}
          ></View>
        </View>
      </View>
      <View style={styles.viewContainer}>
        {/*<LoginFacebook toastRef={toastRef} />*/}
        <CreateAccount />
      </View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
}

function CreateAccount() {
  const navigation = useNavigation();
  return (
    <Text style={styles.textRegister}>
      ¿Aún no tienes una cuente?{" "}
      <Text
        onPress={() => navigation.navigate("register")}
        style={styles.btnRegister}
      >
        Registrate
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    height: 150,
    marginTop: 20,
  },
  viewContainer: {
    marginRight: 40,
    marginLeft: 40,
    marginTop: 10,
  },
  textRegister: {
    marginBottom: 30,
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    color: "#AFAFAF",
  },
  btnRegister: {
    color: "#5fbdff",
    fontWeight: "bold",
  },
  divider: {
    backgroundColor: "#5fbdff",
    margin: 40,
  },
});
