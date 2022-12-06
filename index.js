//modulos externos
import inquirer from 'inquirer'
import chalk from 'chalk'

import fs from 'fs'
import express from 'express'

const app = express()
app.use(express.json())

app.get('/:name',(req,res)=>{
  let name = req.params.name; 
  
  let accountData = fs.readFileSync(`accounts/${name}.json`,{
    encoding: 'utf8',
    flag: 'r'
  })
  accountData = JSON.parse(accountData)
  res.send(`Olá ${name}, O seu Saldo é de ${accountData.balance } reais`)
})
app.listen(3000)

operation()

function operation() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
          'Criar conta',
          'Consultar Saldo',
          'Depositar',
          'Sacar',
          'Sair',
        ],
      },
    ])
    .then((answer) => {
      const action = answer['action']

      if (action === 'Criar conta') {
        createAccount()
      } else if (action === 'Depositar') {
        deposit()
      } else if (action === 'Consultar Saldo') {
        getAccountBalance()
      } else if (action === 'Sacar') {
        withdraw()
      } else if (action === 'Sair') {
        console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
        process.exit()
      }
    })
}



// Criando conta


function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'))
  console.log(chalk.green('Defina as opções da sua conta a seguir'))

  buildAccount()
}

// create user account
function buildAccount() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Digite um nome para a sua conta:',
      },
    ])
    .then((answer) => {
      console.info(answer['accountName'])

      const accountName = answer['accountName']

      if (!fs.existsSync('accounts')) {
        fs.mkdirSync('accounts')
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black('Esta conta já existe, escolha outro nome!'),
        )
        buildAccount(accountName)
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance":0}',
        function (err) {
          console.log(err)
        },
      )

      console.log(chalk.green('Parabéns, sua conta foi criada!'))
      operation()
    })
}

// add an amount to user account

function deposit(){

  inquirer.prompt([{

    name: 'accountName',
    message:'Qual o nome da sua conta?'
  }])
.then((answer)=>{

  const accountName = answer['accountName']

  //verificar se conta existe
  if(!checkAccount(accountName)){
    return deposit()
  }

  inquirer.prompt([{
    name:'amount',
    message:'Quanto você quer depositar?'
  },
]).then((answer)=>{
  const amount = answer['amount']

  addAmount(accountName,amount)
  operation()
})

})

.catch(err => console.log(err))

}

//Consultar saldo




//Funções

function checkAccount(accountName){


  if(!fs.existsSync(`accounts/${accountName}.json`)){

    console.log(chalk.bgRed.black('Esta conta não existe,escolha outro nome!'))
    return false

  }
  return true

}

function addAmount(accountName,amount){

  const accountData = getAccount(accountName)

  if(!amount){
    chalk.bgRed.black('Ocorreu um erro,tente novamente!')
    return deposit()
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
  fs.writeFileSync(`accounts/${accountName}.json`,
  JSON.stringify(accountData),
    function(err){
      console.log(err)
    },)
    console.log(chalk.green(`Foram depositados R$${amount} na sua conta`))

    
  

}

function getAccount(accountName){

  const accountJson = fs.readFileSync(`accounts/${accountName}.json`,{
    encoding: 'utf8',
    flag: 'r'
  })
  return JSON.parse(accountJson)
}


// show account


function getAccountBalance(){
  inquirer.prompt([{
    name : "accountName",
    message: 'Qual o nome da sua conta?'
  },
  ]).then((answer)=>{
    const accountName = answer["accountName"]

    if(!checkAccount(accountName)){
      return getAccountBalance()
    }

    const accountData = getAccount(accountName)

    console.log(chalk.bgBlue.black(
      `Olá ${accountName}, o seu saldo é de R$${accountData.balance} `
    ))
      operation()
  }).catch(err => console.log(err))
}


function withdraw(){

  inquirer.prompt([{
    name :"accountName",
    message:'Qual o nome da sua conta?'
  },
])
  .then((answer)=>{

    const accountName = answer['accountName']
    if(!checkAccount(accountName)){

      return withdraw()


    }

    inquirer.prompt([{

        name : 'amount',
        message:'Quanto você deseja sacar?'
    }])
    .then((answer)=>{
      
      const amount = answer['amount']
      removeAmount(accountName,amount)
     

    }).catch((err)=> console.log(err))
  })

}

function removeAmount(accountName,amount){

  const accountData = getAccount(accountName)

  if(!amount){
    console.log(
      chalk.bgRed.black('Ocorreu um erro,Tente novamente!')
    )
    return withdraw()
  }

  if(accountData.balance < amount){

    console.log(
      chalk.bgRed.black('Valor Indisponivel!')
    )
    return withdraw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    },
  )
  console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta `))
  operation()
}