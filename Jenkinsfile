pipeline {
    agent any

    triggers {
        // Triggered only when a PR is merged into main.
        // GitHub sends a push event to main when a PR is merged — this catches that.
        // Requires: GitHub repo → Settings → Webhooks → http://<vm-ip>:8080/github-webhook/
        // Requires: Jenkins → Manage Jenkins → Plugins → "GitHub" plugin installed.
        githubPush()
    }

    parameters {
        // Set your Azure VM public IP here once — Jenkins saves it for future builds
        string(name: 'AZURE_VM_IP', defaultValue: '20.219.111.205', description: 'Azure VM public IP address')
    }

    environment {
        IMAGE_BACKEND  = "mini-portal-backend"
        IMAGE_FRONTEND = "mini-portal-frontend"
        DEPLOY_BRANCH  = "main"
        KUBECONFIG     = "/etc/rancher/k3s/k3s.yaml"
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
            // Only deploy when the push is to main (i.e. a PR was merged).
            // Any push to feature/dev/hotfix branches is ignored — pipeline aborts early.
            steps {
                script {
                    def branch = env.GIT_BRANCH ?: ''
                    if (!branch.endsWith(env.DEPLOY_BRANCH)) {
                        echo "Push is to '${branch}', not '${env.DEPLOY_BRANCH}' — skipping deploy."
                        currentBuild.result = 'ABORTED'
                        error("Not a main branch push. Stopping pipeline.")
                    }
                    echo "PR merged to main. Proceeding with deployment."
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

        stage('Restart Deployments') {
            steps {
                sh 'sudo kubectl rollout restart deployment/backend  -n mini-portal'
                sh 'sudo kubectl rollout restart deployment/frontend -n mini-portal'
                sh 'sudo kubectl rollout restart deployment/mongodb  -n mini-portal'
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
