# ==============================================================================
# Multi-stage Dockerfile for TripFlow Spring Boot Backend (Java 21)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build stage
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /build

# Copy Maven wrapper and POM first for layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Pre-fetch dependencies
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build production artifact
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Runtime stage
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy AS runner

WORKDIR /app

# Run as a dedicated non-root user for container security
RUN groupadd -r spring && useradd -r -g spring spring

# Copy compiled JAR from builder stage
COPY --from=builder /build/target/tripflow-backend-0.0.1-SNAPSHOT.jar app.jar

# Ensure permissions
RUN chown -R spring:spring /app

USER spring:spring

# Render provides the PORT environment variable dynamically (e.g. 10000)
ENV PORT=10000
ENV SERVER_ADDRESS=0.0.0.0
EXPOSE 10000

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
