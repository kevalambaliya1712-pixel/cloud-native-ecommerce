pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Cloud Native E-Commerce Pipeline Started'
            }
        }

        stage('Build') {
            steps {
                sh '''
                echo "Build Started"
                date
                hostname
                pwd
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                echo "Pipeline Working Successfully"
                '''
            }
        }
    }
}
