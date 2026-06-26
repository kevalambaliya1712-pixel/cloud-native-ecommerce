pipeline {
    agent any

    parameters {
        choice(name: 'DEPLOY_ENV', choices: ['dev', 'staging', 'production'], description: 'Kubernetes overlay to deploy.')
        string(name: 'IMAGE_TAG', defaultValue: '', description: 'Image tag to build and deploy. Defaults to the Jenkins build number.')
        string(name: 'ACR_NAME', defaultValue: '', description: 'Optional Azure Container Registry name override.')
        string(name: 'AKS_RESOURCE_GROUP', defaultValue: '', description: 'Optional AKS resource group override.')
        string(name: 'AKS_CLUSTER_NAME', defaultValue: '', description: 'Optional AKS cluster name override.')
    }

    environment {
        PROJECT_NAME = 'cloudcommerce'
    }

    stages {
        stage('Resolve Deployment Settings') {
            steps {
                script {
                    def suffixByEnvironment = [
                        dev: 'dev',
                        staging: 'stg',
                        production: 'prod'
                    ]
                    def namespaceByEnvironment = [
                        dev: 'cloudcommerce-dev',
                        staging: 'cloudcommerce-staging',
                        production: 'cloudcommerce-prod'
                    ]

                    env.ENV_SUFFIX = suffixByEnvironment[params.DEPLOY_ENV]
                    env.KUBE_NAMESPACE = namespaceByEnvironment[params.DEPLOY_ENV]
                    env.KUSTOMIZE_OVERLAY = params.DEPLOY_ENV
                    env.IMAGE_TAG = params.IMAGE_TAG?.trim() ?: env.BUILD_NUMBER
                    env.ACR_NAME = params.ACR_NAME?.trim() ?: "${env.PROJECT_NAME}${env.ENV_SUFFIX}cr"
                    env.ACR_LOGIN_SERVER = "${env.ACR_NAME}.azurecr.io"
                    env.AKS_RESOURCE_GROUP = params.AKS_RESOURCE_GROUP?.trim() ?: "rg-${env.PROJECT_NAME}-${env.ENV_SUFFIX}"
                    env.AKS_CLUSTER_NAME = params.AKS_CLUSTER_NAME?.trim() ?: "aks-${env.PROJECT_NAME}-${env.ENV_SUFFIX}"
                }
            }
        }

        stage('Build Images') {
            steps {
                script {
                    services().each { service ->
                        sh """
                            docker build -t ${env.ACR_LOGIN_SERVER}/${service.image}:${env.IMAGE_TAG} ${service.path}
                        """
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                sh """
                    az acr login --name ${env.ACR_NAME}
                """
                script {
                    services().each { service ->
                        sh """
                            docker push ${env.ACR_LOGIN_SERVER}/${service.image}:${env.IMAGE_TAG}
                        """
                    }
                }
            }
        }

        stage('Deploy to AKS') {
            steps {
                sh """
                    az aks get-credentials \
                        --resource-group ${env.AKS_RESOURCE_GROUP} \
                        --name ${env.AKS_CLUSTER_NAME} \
                        --overwrite-existing

                    kubectl apply -k kubernetes/overlays/${env.KUSTOMIZE_OVERLAY}

                    TENANT_ID=\$(az account show --query tenantId -o tsv)
                    CSI_CLIENT_ID=\$(az aks show \
                        --resource-group ${env.AKS_RESOURCE_GROUP} \
                        --name ${env.AKS_CLUSTER_NAME} \
                        --query addonProfiles.azureKeyvaultSecretsProvider.identity.clientId \
                        -o tsv)

                    cat > secretprovider-patch.json <<EOF
{"spec":{"parameters":{"tenantId":"\$TENANT_ID","userAssignedIdentityID":"\$CSI_CLIENT_ID"}}}
EOF
                    kubectl -n ${env.KUBE_NAMESPACE} patch secretproviderclass azure-kv-secrets \
                        --type merge \
                        --patch "\$(cat secretprovider-patch.json)"

                    kubectl -n ${env.KUBE_NAMESPACE} set image deployment/api-gateway \
                        api-gateway=${env.ACR_LOGIN_SERVER}/api-gateway:${env.IMAGE_TAG}
                    kubectl -n ${env.KUBE_NAMESPACE} set image deployment/user-service \
                        user-service=${env.ACR_LOGIN_SERVER}/user-service:${env.IMAGE_TAG}
                    kubectl -n ${env.KUBE_NAMESPACE} set image deployment/product-service \
                        product-service=${env.ACR_LOGIN_SERVER}/product-service:${env.IMAGE_TAG}
                    kubectl -n ${env.KUBE_NAMESPACE} set image deployment/cart-service \
                        cart-service=${env.ACR_LOGIN_SERVER}/cart-service:${env.IMAGE_TAG}
                    kubectl -n ${env.KUBE_NAMESPACE} set image deployment/order-service \
                        order-service=${env.ACR_LOGIN_SERVER}/order-service:${env.IMAGE_TAG}
                    kubectl -n ${env.KUBE_NAMESPACE} set image deployment/notification-service \
                        notification-service=${env.ACR_LOGIN_SERVER}/notification-service:${env.IMAGE_TAG}
                    kubectl -n ${env.KUBE_NAMESPACE} set image deployment/frontend \
                        frontend=${env.ACR_LOGIN_SERVER}/frontend:${env.IMAGE_TAG}
                """
            }
        }

        stage('Verify Rollout') {
            steps {
                script {
                    services().each { service ->
                        sh """
                            kubectl -n ${env.KUBE_NAMESPACE} rollout status deployment/${service.image} --timeout=180s
                        """
                    }
                }
            }
        }
    }
}

def services() {
    return [
        [image: 'api-gateway', path: './services/api-gateway'],
        [image: 'user-service', path: './services/user-service'],
        [image: 'product-service', path: './services/product-service'],
        [image: 'cart-service', path: './services/cart-service'],
        [image: 'order-service', path: './services/order-service'],
        [image: 'notification-service', path: './services/notification-service'],
        [image: 'frontend', path: './frontend']
    ]
}
