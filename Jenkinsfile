pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Cloud Native E-Commerce Pipeline Started'
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                docker build -t frontend-app:latest ./frontend
                '''
            }
        }

        stage('Build User Service') {
            steps {
                sh '''
                docker build -t user-service:latest ./services/user-service
                '''
            }
        }

        stage('Build Product Service') {
            steps {
                sh '''
                docker build -t product-service:latest ./services/product-service
                '''
            }
        }

        stage('Build Cart Service') {
            steps {
                sh '''
                docker build -t cart-service:latest ./services/cart-service
                '''
            }
        }

        stage('Build Order Service') {
            steps {
                sh '''
                docker build -t order-service:latest ./services/order-service
                '''
            }
        }

        stage('Build Notification Service') {
            steps {
                sh '''
                docker build -t notification-service:latest ./services/notification-service
                '''
            }
        }

        stage('Build API Gateway') {
            steps {
                sh '''
                docker build -t api-gateway:latest ./services/api-gateway
                '''
            }
        }

        stage('Verify Images') {
            steps {
                sh '''
                docker images
                '''
            }
        }
    }
}
