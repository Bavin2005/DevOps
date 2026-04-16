pipeline {
    agent any

    triggers {
        // Automatically triggered when GitHub sends a webhook push event.
        // Requires: Jenkins → Manage Jenkins → Plugins → "GitHub" plugin installed.
        // Requires: GitHub repo → Settings → Webhooks → http://<vm-ip>:8080/github-webhook/
        githubPush()
    }

    parameters {
        // Set your Azure VM public IP here once — Jenkins saves it for future builds
        string(name: 'AZURE_VM_IP', defaultValue: '0.0.0.0', description: 'Azure VM public IP address')
    }

    environment {
        IMAGE_BACKEND  = "mini-portal-backend"
        IMAGE_FRONTEND = "mini-portal-frontend"
        VITE_API_URL   = "http://${params.AZURE_VM_IP}:30500"
        DEPLOY_BRANCH  = "main"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch:   ${GIT_BRANCH}"
                echo "Commit:   ${GIT_COMMIT}"
                echo "Frontend: http://${params.AZURE_VM_IP}:30080"
                echo "Backend:  http://${params.AZURE_VM_IP}:30500"
            }
        }

        stage('Branch Check') {
            // Only deploy when pushing to the development branch.
            // Pushes to other branches skip the build entirely.
            steps {
                script {
                    if (!env.GIT_BRANCH.endsWith(env.DEPLOY_BRANCH)) {
                        echo "Branch '${GIT_BRANCH}' is not '${DEPLOY_BRANCH}' — skipping deploy."
                        currentBuild.result = 'NOT_BUILT'
                        return
                    }
                    echo "Branch check passed. Proceeding with deployment."
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                    docker build \
                      -t ${IMAGE_BACKEND}:latest \
                      -t ${IMAGE_BACKEND}:${BUILD_NUMBER} \
                      ./backend
                """
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                    docker build \
                      --build-arg VITE_API_URL=${VITE_API_URL} \
                      -t ${IMAGE_FRONTEND}:latest \
                      -t ${IMAGE_FRONTEND}:${BUILD_NUMBER} \
                      ./frontend
                """
            }
        }

        stage('Import Images into K3s') {
            // K3s uses containerd — it cannot see Docker images directly.
            // We export from Docker and import into K3s's containerd store.
            steps {
                sh "docker save ${IMAGE_BACKEND}:latest  | sudo k3s ctr images import -"
                sh "docker save ${IMAGE_FRONTEND}:latest | sudo k3s ctr images import -"
                echo "Images imported into K3s containerd successfully"
            }
        }

        stage('Apply Kubernetes Manifests') {
            steps {
                sh 'sudo kubectl apply -f k8s/namespace.yaml'
                sh 'sudo kubectl apply -f k8s/secrets.yaml'
                sh 'sudo kubectl apply -f k8s/mongodb-pvc.yaml'
                sh 'sudo kubectl apply -f k8s/mongodb-deployment.yaml'
                sh 'sudo kubectl apply -f k8s/backend-deployment.yaml'
                sh 'sudo kubectl apply -f k8s/frontend-deployment.yaml'
                sh 'sudo kubectl apply -f k8s/hpa.yaml'
            }
        }

        stage('Wait for Rollout') {
            steps {
                sh 'sudo kubectl rollout status deployment/mongodb  -n mini-portal --timeout=120s'
                sh 'sudo kubectl rollout status deployment/backend  -n mini-portal --timeout=120s'
                sh 'sudo kubectl rollout status deployment/frontend -n mini-portal --timeout=120s'
            }
        }

        stage('Verify') {
            steps {
                sh 'sudo kubectl get pods     -n mini-portal'
                sh 'sudo kubectl get services -n mini-portal'
                echo "====================================="
                echo "Frontend: http://${params.AZURE_VM_IP}:30080"
                echo "Backend:  http://${params.AZURE_VM_IP}:30500"
                echo "====================================="
            }
        }
    }

    post {
        success {
            echo "Build #${BUILD_NUMBER} deployed successfully!"
        }
        failure {
            echo "Build #${BUILD_NUMBER} failed. Run: sudo kubectl describe pods -n mini-portal"
        }
        always {
            // Clean up old Docker images to save disk space
            sh 'docker image prune -f'
        }
    }
}
