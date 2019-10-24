pipeline {
    agent any
    environment {
        //Docker Hub
        APPS_NAME = "train"
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
        }
        stage('Container Security Scan') {
            steps {
                echo 'Scanning container image for vulnerability ....'
                sh 'echo "${DOCKER_IMAGE_NAME} `pwd`/Dockerfile" > anchore_images'
                anchore name: 'anchore_images'
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
        }
        stage('DeployToProduction - Kubernetes Cluster1') {
            when {
                branch 'master'
            }
            steps {
                milestone(2)
                kubernetesDeploy(
                    kubeconfigId: 'foobz-mellab-k8s1',
                    configs: 'train-schedule-sc-kube.yaml',
                    enableConfigSubstitution: true
                )
            }
        }
    }
}
