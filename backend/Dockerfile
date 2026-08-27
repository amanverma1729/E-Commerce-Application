# Multi-stage Dockerfile for Spring Boot Backend

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
VOLUME /tmp
COPY --from=builder /app/target/*.jar app.jar

ENV SERVER_PORT=9090
ENV DB_URL=jdbc:mysql://mysql:3306/ecommerce_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
ENV DB_USERNAME=root
ENV DB_PASSWORD=rootpassword

EXPOSE 9090

ENTRYPOINT ["java", "-jar", "app.jar"]
