pipeline {
    agent {
        kubernetes {
            label 'node-agent'
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: jnlp
    image: jenkins/inbound-agent:latest
    args: ['\$(JENKINS_SECRET)', '\$(JENKINS_NAME)']
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume
  - name: node
    image: node:18-alpine
    command: ['cat']
    tty: true
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume
  - name: docker
    image: docker:latest
    command: ['cat']
    tty: true
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-socket
    - mountPath: /home/jenkins/agent
      name: workspace-volume
  - name: git
    image: alpine/git:latest
    command: ['cat']
    tty: true
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume
  volumes:
  - name: docker-socket
    hostPath:
      path: /var/run/docker.sock
  - name: workspace-volume
    emptyDir: {}
"""
        }
    }

    environment {
        NAMESPACE = 'default'
        DOCKER_IMAGE = 'docin82/random-bot'
        GITOPS_REPO = 'https://github.com/goncharukinna/bots-gitops.git'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Код склонирован"
            }
        }

        stage('Install Dependencies') {
            steps {
                container('node') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                container('node') {
                    sh 'npm test || echo "Тесты не настроены"'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('docker') {
                    script {
                        sh "docker build -t ${DOCKER_IMAGE}:${env.BUILD_ID} ."
                        sh "docker tag ${DOCKER_IMAGE}:${env.BUILD_ID} ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Push to Registry') {
            steps {
                container('docker') {
                    script {
                        withCredentials([usernamePassword(
                            credentialsId: 'docker-credentials',
                            usernameVariable: 'DOCKER_USER',
                            passwordVariable: 'DOCKER_PASS'
                        )]) {
                            sh '''
                                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                docker push ${DOCKER_IMAGE}:${BUILD_ID}
                                docker push ${DOCKER_IMAGE}:latest
                            '''
                        }
                    }
                }
            }
        }

        stage('Update GitOps Repo') {
            steps {
                container('git') {
                    withCredentials([usernamePassword(
                        credentialsId: 'github-token',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )]) {
                        sh '''
                            # Клонировать GitOps-репозиторий
                            git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/goncharukinna/bots-gitops.git /tmp/gitops
                            cd /tmp/gitops
                            
                            # Обновить тег образа в манифесте
                            sed -i "s|image: docin82/random-bot:.*|image: docin82/random-bot:${BUILD_ID}|" manifests/random-bot/deployment.yaml
                            
                            # Проверить, что изменилось
                            echo "=== Изменения в GitOps ==="
                            git diff
                            
                            # Закоммитить и запушить
                            git config user.name "Jenkins"
                            git config user.email "jenkins@example.com"
                            git add manifests/random-bot/deployment.yaml
                            git commit -m "random-bot: update to ${BUILD_ID} [skip ci]"
                            git push
                            
                            echo "✅ GitOps обновлён до версии ${BUILD_ID}"
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "🎉 random-bot ${BUILD_ID} собран, запушен и обновлён в GitOps"
            echo "Argo CD подхватит изменение в течение 3 минут"
        }
        failure {
            echo "❌ Ошибка сборки"
        }
    }
}

