import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import { validateEmail } from "../../utils/validation";
//////// firebase
import firebase from "firebase";
import { firebaseApp } from "../../utils/firebase";
import "firebase/firestore";
//////// firebase
import { isEmpty } from "lodash";
import { useNavigation } from "@react-navigation/native";
import Loading from "../Loading";

const db = firebase.firestore(firebaseApp);

export default function LoginForm(props) {
  const { toastRef } = props;
  const [showPassword, setshowPassword] = useState(false);
  const [formData, setFormData] = useState(defaultFormValue());
  const navigation = useNavigation();
  const [flagUserInfo, setflagUserInfo] = useState(0);
  const [flagTemas, setflagTemas] = useState(0);
  const [flagLogros, setflagLogros] = useState(0);
  const [flagTienda, setflagTienda] = useState(0);
  const [loading, setloading] = useState(false);

  const onSubmit = () => {
    if (isEmpty(formData.email) || isEmpty(formData.password)) {
      toastRef.current.show("Todos los campos son obligatorios.");
    } else if (!validateEmail(formData.email)) {
      toastRef.current.show("email invalido.");
    } else {
      setloading(true);
      // Verifico si el usuario y contraseña son correctos
      firebase
        .auth()
        .signInWithEmailAndPassword(formData.email, formData.password)
        .then((userCredential) => {
          var user = userCredential.user;
          console.log(user);
          // obtengo el uid del usuario que acaba de iniciar sesion
          const uid = firebase.auth().currentUser.uid;
          console.log("///////////////////////  ", uid);
          // consulta en la base de datos si dicho usuario ya tiene información de perfil
          db.collection("info_user")
            .where("id_user", "==", uid)
            .get()
            .then((response) => {
              // si la respuesta es 0 quiere decir que no tiene
              if (response.docs.length === 0) {
                //agrego la información de usuario correspondiente
                const payload = {
                  EXP: 0,
                  coronas: 0,
                  dias_racha: 0,
                  division: "bronce",
                  gemas: 0,
                  id_user: uid,
                  primer_ingreso: true,
                  ultima_clase: null,
                  vidas: 5,
                  modulos_desbloqueados: 1,
                  displayName: user.email,
                  email: user.email,
                  photoURL:
                    "https://firebasestorage.googleapis.com/v0/b/tenedores-d1e09.appspot.com/o/avatar%2Fmascota_saludo.png?alt=media&token=b75dd4dd-b269-40e6-a265-607ffa09ecd5",
                  objetos_comprados: [],
                };
                if (flagUserInfo < 1) {
                  db.collection("info_user")
                    .add(payload)
                    .then(() => {
                      setflagUserInfo(flagUserInfo + 1);
                      // ingresas los documentos de tema a mis_temas
                      if (flagTemas < 1) {
                        db.collection("tema")
                          .get()
                          .then((response) => {
                            let promesas = [];
                            response.forEach((doc) => {
                              let payload = {
                                tema: doc.data(),
                                veces_completado: 0,
                                coronas: 0,
                                completado: false,
                                id_tema: doc.id,
                                id_user: uid,
                                default: true,
                              };
                              promesas.push(
                                db.collection("mis_temas").add(payload)
                              );
                            });
                            Promise.all(promesas).then(
                              () => {
                                setflagTemas(flagTemas + 1);
                                console.log("se crearon todos lo temas");
                              },
                              (err) => {
                                console.log("algo salio mal: ", err);
                              }
                            );
                          });
                      } else {
                        console.log(
                          "estas intentando crear mas de los temas correspondientes"
                        );
                      }
                      //--------------------------------ahora debo hacer lo mismo para mis_logros -------------------------/

                      if (flagLogros < 1) {
                        db.collection("logros")
                          .get()
                          .then((response) => {
                            let promesas = [];
                            response.forEach((doc) => {
                              let payload = {
                                logro: doc.data(),
                                nivel: 1,
                                mi_puntaje: 0,
                                id_logro: doc.id,
                                id_user: uid,
                              };
                              promesas.push(
                                db.collection("mis_logros").add(payload)
                              );
                            });
                            Promise.all(promesas).then(
                              () => {
                                setflagLogros(flagLogros + 1);
                                console.log("se crearon todos lo temas");
                              },
                              (err) => {
                                console.log("algo salio mal: ", err);
                              }
                            );
                          });
                      } else {
                        console.log(
                          "estas intentando crear mas de los logros correspondientes"
                        );
                      }
                      //--------------------------------ahora debo hacer lo mismo para mis_logros -------------------------/
                      if (flagTienda < 1) {
                        db.collection("objetos_tienda")
                          .get()
                          .then((response) => {
                            let promesas = [];
                            response.forEach((doc) => {
                              let payload = {
                                objeto_tienda: doc.data(),
                                comprado: false,
                                id_objeto_tienda: doc.id,
                                id_user: uid,
                              };
                              promesas.push(
                                db.collection("objetos_comprados").add(payload)
                              );
                            });

                            Promise.all(promesas).then(
                              () => {
                                setflagTienda(flagTienda + 1);
                                console.log("se crearon todos lo temas");
                              },
                              (err) => {
                                console.log("algo salio mal: ", err);
                              }
                            );
                          });
                      } else {
                        console.log(
                          "intentas crear mas objetos de tienda de los correspondientes"
                        );
                      }
                    })
                    .catch(() => {
                      toastRef.current.show("Un error a ocurrido");
                      setIsLoading(false);
                    });
                } else {
                  console.log(
                    "estas intentando crear el usuario mas de una vez"
                  );
                }
              } else {
                response.forEach((doc) => {
                  db.collection("info_user")
                    .doc(doc.id)
                    .get()
                    .then((info_user) => {
                      let now = new Date();
                      const oneDay = 24 * 60 * 60 * 1000;
                      var last_class =
                        info_user.data().ultima_clase != null
                          ? new Date(
                              info_user.data().ultima_clase.seconds * 1000
                            )
                          : now;
                      const diffDays = Math.round(
                        Math.abs((now - last_class) / oneDay)
                      );

                      let objetosAux = [];

                      info_user.data().objetos_comprados.map((x) => {
                        if (x.nombre.toLowerCase() == "protector") {
                          diffDays = 0;
                          // actualizo los objetos
                          db.collection("objetos_comprados")
                            .where("id_user", "==", info_user.data().id_user)
                            .where("objeto_tienda.nombre", "==", "Protector")
                            .get()
                            .then((res) => {
                              res.forEach((doc) => {
                                doc
                                  .collection(objetos_comprados)
                                  .doc(doc.id)
                                  .update({ comprado: false });
                              });
                            });
                        } else {
                          objetosAux.push(x);
                        }
                      });

                      if (
                        diffDays == 0 &&
                        info_user.data().primer_ingreso &&
                        info_user.data().ultima_clase != null
                      ) {
                        db.collection("info_user")
                          .doc(idUserAux)
                          .update({
                            dias_racha: info_user.data().dias_racha + 1,
                            primer_ingreso: false,
                          });
                      } else if (diffDays > 1) {
                        db.collection("info_user")
                          .doc(doc.id)
                          .update({
                            dias_racha: 0,
                            objetos_comprados: objetosAux,
                          })
                          .then(() => alert("Perdiste tu racha :c"));
                      } else if (
                        info_user.data().dias_racha >= 7 &&
                        info_user
                          .data()
                          .objetos_comprados.find(
                            (x) => x.nombre.toLowerCase() == "todo o nada"
                          ) != undefined
                      ) {
                        db.collection("info_user")
                          .doc(idUserAux)
                          .update({
                            gemas: info_user.data() * 2,
                          })
                          .then(() => {
                            db.collection("objetos_comprados")
                              .where("id_user", "==", info_user.data().id_user)
                              .where(
                                "objeto_tienda.nombre",
                                "==",
                                "Todo o nada"
                              )
                              .get()
                              .then((res) => {
                                res.forEach((doc) => {
                                  doc
                                    .collection(objetos_comprados)
                                    .doc(doc.id)
                                    .update({ comprado: false });
                                });
                              });
                            alert(
                              "Todo o nada! ganaste tu apuesta toma tu premio: " +
                                info_user.data() * 2 +
                                " gemas."
                            );
                          });
                      }
                    });
                });
                /** aca voy agregar el primer ingreso en false y hago otras validaciones mas */
              }
              setloading(false);
              //navigation.navigate("account");
            });
          setloading(false);
          navigation.navigate("account");
        })
        .catch(() => {
          setloading(false);
          toastRef.current.show("Datos incorrectos.");
        });
    }
  };

  const onChange = (e, type) => {
    // con "...formData" le estoy diciendo que mantenga las propiedades
    // anteriores y con "[type]: e.nativeEvent.text" actualizao ese componente
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  return (
    <View style={styles.formContainer}>
      <Input
        placeholder="Correo Electronico"
        labelStyle={{ fontWeight: "bold", fontSize: 10 }}
        containerStyle={styles.inputForm}
        inputContainerStyle={styles.input}
        onChange={(e) => onChange(e, "email")}
        rightIcon={
          <Icon
            type="material-community"
            name="at"
            iconStyle={styles.iconRight}
          />
        }
      />
      <Input
        placeholder="Contraseña"
        password={true}
        secureTextEntry={showPassword ? false : true}
        containerStyle={styles.inputForm}
        inputContainerStyle={styles.input}
        onChange={(e) => onChange(e, "password")}
        rightIcon={
          <Icon
            type="material-community"
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            iconStyle={styles.iconRight}
            onPress={() => setshowPassword(!showPassword)}
          />
        }
      />
      <Button
        title="INGRESAR"
        titleStyle={{ fontWeight: "bold", fontSize: 20 }}
        containerStyle={styles.btnContainerLogin}
        buttonStyle={styles.btnLogin}
        onPress={onSubmit}
      />
      <Loading isVisible={loading} text="Iniciando Sesion" />
    </View>
  );
}

function defaultFormValue() {
  return {
    email: "",
    password: "",
  };
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  input: {
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    borderColor: "#E5E5E5",
    borderWidth: 2,
    borderBottomWidth: 2,
    paddingLeft: 10,
    paddingRight: 10,
  },
  inputForm: {
    width: "100%",
  },
  btnContainerLogin: {
    width: "95%",
    borderColor: "#62B2EF",
    borderTopWidth: 0.5,
    borderLeftWidth: 1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomEndRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  btnLogin: {
    backgroundColor: "#5fbdff",
    borderRadius: 10,
    padding: 15,
  },
  iconRight: {
    color: "#c1c1c1",
  },
});
