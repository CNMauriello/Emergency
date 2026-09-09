FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -pl RegistryService -am -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/RegistryService/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
