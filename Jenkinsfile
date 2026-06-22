pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Cloud Native E-Commerce Pipeline Started'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh '''
                docker build -t frontend-app:latest ./frontend
                '''
            }
        }

        stage('Verify Docker Image') {
            steps {
                sh '''
                docker images
                '''
            }
        }

    }
}
