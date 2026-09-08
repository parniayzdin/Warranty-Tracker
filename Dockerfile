FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

COPY . .

RUN chmod +x mvnw && ./mvnw -q clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=12 CMD curl --fail --silent http://127.0.0.1:8080/api/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
