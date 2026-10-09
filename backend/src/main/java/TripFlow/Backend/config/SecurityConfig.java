package TripFlow.Backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {}) // Handled by CorsConfig
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"error\": \"Unauthorized: Missing or invalid authentication token\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json");
                            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write("{\"error\": \"Forbidden: You do not have permission to perform this action\"}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**", "/api/test", "/h2-console/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Owner-only Admin Operations
                        .requestMatchers(HttpMethod.POST, "/api/drivers").hasRole("OWNER")
                        .requestMatchers(HttpMethod.DELETE, "/api/drivers/**").hasRole("OWNER")
                        .requestMatchers(HttpMethod.PUT, "/api/drivers/{id}").hasRole("OWNER")

                        .requestMatchers(HttpMethod.POST, "/api/vehicles").hasRole("OWNER")
                        .requestMatchers(HttpMethod.DELETE, "/api/vehicles/**").hasRole("OWNER")
                        .requestMatchers(HttpMethod.PUT, "/api/vehicles/{id}").hasRole("OWNER")

                        .requestMatchers(HttpMethod.POST, "/api/trips").hasRole("OWNER")
                        .requestMatchers(HttpMethod.DELETE, "/api/trips/**").hasRole("OWNER")

                        .requestMatchers(HttpMethod.POST, "/api/customers/**").hasRole("OWNER")
                        .requestMatchers(HttpMethod.PUT, "/api/customers/**").hasRole("OWNER")
                        .requestMatchers(HttpMethod.DELETE, "/api/customers/**").hasRole("OWNER")

                        // Availability & Status endpoints
                        .requestMatchers(HttpMethod.PUT, "/api/drivers/*/availability").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/vehicles/*/availability").hasRole("OWNER")
                        .requestMatchers(HttpMethod.PATCH, "/api/trips/*/status").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/trips/*").authenticated()

                        // General Read endpoints (Authorized Drivers & Owners)
                        .requestMatchers(HttpMethod.GET, "/api/**").authenticated()

                        // Any other request
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
