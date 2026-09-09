FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -pl EmergencyService -am -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/EmergencyService/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
