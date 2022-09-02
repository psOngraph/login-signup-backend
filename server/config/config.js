module.exports = {
    secretkey :"ILOVEINDIA",

    dbconfig : {
        development: {
            //url to be used in link generation
            url: '',
            //mongodb connection settings
            database: {
                host: '127.0.0.1',
                port: '27017',
                db: 'nmux'
            },
            //server details
            server: {
                host: '127.0.0.1',
                port: '1300'
            }
        },
        production: {
            //url to be used in link generation
            url: '',
            //mongodb connection settings
            database: {
                HOST_PATH: '',
                HOST: '',
                PORT: '',
                MONGO_USERNAME: '',
                MONGO_PASSWORD: '',
                MONGO_PORT: 27017,
                MONGO_AUTH_DB: '',
                MONGO_DB: '',
                uri: "mongodb://admin:Admin123@cluster0-shard-00-00-nceia.mongodb.net:27017,cluster0-shard-00-01-nceia.mongodb.net:27017,cluster0-shard-00-02-nceia.mongodb.net:27017/nmux?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority"
            },
            //server details
            server: {
                host: '127.0.0.1',
                port: '1300'
            }
        }
    }
}
