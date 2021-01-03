pipeline {
    agent {
        docker {
            image 'node:latest' 
            args '-p 3000:3000 -u 0:0' 
        }
    }
    environment {
        // Override HOME to WORKSPACE
        HOME = "${WORKSPACE}"
        // or override default cache directory (~/.npm)
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    }
    stages {
        stage('Installing required global packages'){
            steps{
                sh 'npm install tsc -g'
            }
        }
        stage('Running parse') { 
            steps {
                sh 'cd crawler/src && npm install --include=dev && npm start'
            }
        }
        stage('Commit & Push Results') { 
            steps {
                sh 'ls -R'
            }
        }
    }
}