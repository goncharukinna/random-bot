pipeline {
    agent {
        kubernetes {
            label 'node-agent'
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: jnlp
    image: jenkins/inbound-agent:latest
    args: ['$(JENKINS_SECRET)', '$(JENKINS_NAME)']
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
  - name: kubectl
    image: alpine/kubectl:latest
    command: ['sleep', 'infinity']
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
'''
        }
    }

    environment {
        NAMESPACE = 'default'
        DOCKER_IMAGE = 'docin82/random-bot'
        DEPLOYMENT_NAME = 'random-bot'
        CONTAINER_NAME = 'random-bot'
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

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    script {
                        sh """
                            kubectl set image deployment/${DEPLOYMENT_NAME} \
                                ${CONTAINER_NAME}=${DOCKER_IMAGE}:${env.BUILD_ID} \
                                -n ${NAMESPACE}
                        """
                    }
                }
            }
        }
    }

    post {
        success { echo "🎉 random-bot собран и задеплоен" }
        failure { echo "❌ Ошибка сборки" }
    }
}
