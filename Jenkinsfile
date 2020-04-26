pipeline {
    agent any
    environment {
        //Docker Hub
        DISPLAY_NAME = "Trains Schedule Apps"
        APP = "train.foobz.com.au"
        FQDN = "train.foobz.com.au"
        DOCKER_IMAGE_NAME = "reg.foobz.com.au/foobz/train-schedule-sc"
    }
    stages {
        stage('Build Apps and Test') {
            steps {
                echo 'Running build automation'
                sh './gradlew build --no-daemon'
                archiveArtifacts artifacts: 'dist/trainSchedule.zip'
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Build and Test Apps '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Build and Test Apps '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
        stage('Build Docker Image') {
            when {
                branch 'master'
            }
            steps {
                script {
                    app = docker.build(DOCKER_IMAGE_NAME)
                    app.inside {
                        sh 'echo Hello, World!'
                    }
                }
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Build Docker Image '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Build Docker Image '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
        stage('Push Docker Image') {
            when {
                branch 'master'
            }
            steps {
                script {
                    docker.withRegistry('https://reg.foobz.com.au', 'harbor_login') {
                        app.push("${env.BUILD_NUMBER}")
                        app.push("latest")
                    }
                }
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Push Docker Image to Private Repo '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Push Docker Image to Private Repo '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
        stage('Deploy To Prod - K8S Cluster1') {
            when {
                branch 'master'
            }
            steps {
                milestone(2)
                    kubernetesDeploy(
                    kubeconfigId: 'foobz-mellab-k8s1',
                    configs: 'train-schedule-sc-kube.yaml',
                    enableConfigSubstitution: false
                )
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Deploy to Production Kubernetes '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Deploy to Production Kubernetes '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            } 
        }
        stage('On-board NGINX App Protect') {
            steps {
                // Configure NGINX App Protect
                milestone(3)
                build (job: "nginx-app-protect-Onboarding")
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: On-board NGINX App Protect '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: On-board NGINX App Protect '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
        stage('Publish App - NGINX App Protect Policy') {
            steps {
                // Deploy AppServices with NGINX App Protect
                milestone(4)
                build (job: "nginx-app-protect-DevOps")
            }
            post {
                // only triggered when blue or green sign
                success {
                    slackSend (color: '#00FF00', message: "SUCCESSFUL: Published Apps and protected by NGINX App Protect '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
                // triggered when red sign
                failure {
                    slackSend (color: '#FF0000', message: "FAILED: Published Apps and protected NGINX App Protect '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                }
            }
        }
    }
}
