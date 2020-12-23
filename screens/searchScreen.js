import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import db from "../config";

export default class SearchScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
      search: "",
    };
  }
  componentDidMount = async () => {
    const query = await db.collection("transactions").limit(2).get();
    query.docs.map((doc) => {
      this.setState({
        allTransactions: [],
        lastVisibleTransaction: doc,
      });
    });
  };

  fetchMoreTransactions = async () => {
    if (this.state.search.length > 0) {
      var text = this.state.search.toUpperCase();
      var enteredText = text.split("");
      if (enteredText[0].toUpperCase() === "B") {
        const query = await db
          .collection("transactions")
          .where("bookId", "==", text)
          .startAfter(this.state.lastVisibleTransaction)
          .limit(2)
          .get();
        query.docs.map((doc) => {
          this.setState({
            allTransactions: [...this.state.allTransactions, doc.data()],
            lastVisibleTransaction: doc,
          });
        });
      } else if (enteredText[0].toUpperCase() === "S") {
        const query = await db
          .collection("transactions")
          .where("studentId", "==", text)
          .startAfter(this.state.lastVisibleTransaction)
          .limit(2)
          .get();
        query.docs.map((doc) => {
          this.setState({
            allTransactions: [...this.state.allTransactions, doc.data()],
            lastVisibleTransaction: doc,
          });
        });
      }
    }
  };

  searchTransactions = async (text) => {
    if (text.length > 0) {
      var enteredText = text.split("");
      var text = text.toUpperCase();
      console.log(text)
      if (enteredText[0].toUpperCase() === "B") {
        const transaction = await db
          .collection("transactions")
          .where("bookId", "==", text)
          .get();
        transaction.docs.map((doc) => {
          this.setState({
            allTransactions: [...this.state.allTransactions, doc.data()],
            lastVisibleTransaction: doc,
          });
        });
      } else if (enteredText[0].toUpperCase() === "S") {
        const transaction = await db
          .collection("transactions")
          .where("studentId", "==", text)
          .get();
        transaction.docs.map((doc) => {
          this.setState({
            allTransactions: [...this.state.allTransactions, doc.data()],
            lastVisibleTransaction: doc,
          });
        });
      }
    }
    console.log(this.state.allTransactions);
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.bar}
            placeholder="Enter a Book Id or a Student Id"
            onChangeText={(text) => {
              this.setState({
                search: text,
              });
            }}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              this.searchTransactions(this.state.search);
            }}
          >
            <Text>search</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={this.state.allTransactions}
          renderItem={({ item }) => (
            <View style={{ borderBottomWidth: 2 }}>
              <Text>{"Book ID: " + item.bookId}</Text>
              <Text>{"Student ID: " + item.studentId}</Text>
              <Text>{"Transaction Type: " + item.transactionType}</Text>
              <Text>{"Date: " + item.date.toDate()}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={this.fetchMoreTransactions}
          onEndReachedThreshold={0.7}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: "row",
    width: "auto",
    height: 40,
    borderWidth: 0.5,
    backgroundColor: "lightgreen",
  },
  bar: {
    borderWidth: 2,
    width: 300,
    height: 30,
    paddingLeft: 10,
  },
  searchButton: {
    borderWidth: 1,
    height: 30,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "grey",
  },
});
