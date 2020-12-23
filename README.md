# c69
<ScrollView>
         {this.state.allTransactions.map((transaction,index)=>{
           return (<View key={index}>
             <Text>{transaction.transactionType}</Text>
           <Text>{"date: "+transaction.date.toDate()}</Text>
           </View>)
         })}
       </ScrollView>