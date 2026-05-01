# Stage 1: Build the application
FROM maven:3.9.9-amazoncorretto-23 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM amazoncorretto:23
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render uses a dynamic port, but defaults to 8080 for Spring
EXPOSE 8080

# Command to run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
