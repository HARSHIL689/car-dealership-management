package com.example.inventory.service;

import com.example.inventory.dto.auth.LoginRequest;
import com.example.inventory.dto.auth.LoginResponse;
import com.example.inventory.dto.auth.RegisterRequest;
import com.example.inventory.dto.auth.RegisterResponse;
import com.example.inventory.entity.Role;
import com.example.inventory.entity.User;
import com.example.inventory.exception.EmailAlreadyExistsException;
import com.example.inventory.exception.InvalidCredentialsException;
import com.example.inventory.repository.UserRepository;
import com.example.inventory.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("Jane Doe")
                .email("jane@example.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();
    }

    @Test
    @DisplayName("register() creates a new user with the default USER role when none is specified")
    void register_createsUser_withDefaultRole() {
        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "password123", null);

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        RegisterResponse response = authService.register(request);

        assertThat(response.getEmail()).isEqualTo("jane@example.com");
        assertThat(response.getRole()).isEqualTo("USER");
        assertThat(response.getMessage()).isEqualTo("Registration successful");
    }

    @Test
    @DisplayName("register() honors an explicit ADMIN role")
    void register_createsUser_withAdminRole() {
        RegisterRequest request = new RegisterRequest("Admin User", "admin@example.com", "password123", "ADMIN");

        when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        RegisterResponse response = authService.register(request);

        assertThat(response.getRole()).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("register() throws EmailAlreadyExistsException when the email is already taken")
    void register_throwsException_whenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "password123", null);

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("login() returns a JWT and user details on valid credentials")
    void login_returnsToken_onValidCredentials() {
        LoginRequest request = new LoginRequest("jane@example.com", "password123");

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(sampleUser)).thenReturn("mock-jwt-token");
        when(jwtService.getExpirationMs()).thenReturn(86400000L);

        LoginResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
        assertThat(response.getEmail()).isEqualTo("jane@example.com");
        assertThat(response.getRole()).isEqualTo("USER");
        verify(authenticationManager, times(1)).authenticate(any());
    }

    @Test
    @DisplayName("login() throws InvalidCredentialsException on bad credentials")
    void login_throwsException_onInvalidCredentials() {
        LoginRequest request = new LoginRequest("jane@example.com", "wrong-password");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(jwtService, never()).generateToken(any());
    }
}