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
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        Role role = parseRole(request.getRole());

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User saved = userRepository.save(user);

        return RegisterResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .message("Registration successful")
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException();
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(InvalidCredentialsException::new);

        String token = jwtService.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresInMs(jwtService.getExpirationMs())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    private Role parseRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return Role.USER;
        }
        try {
            return Role.valueOf(rawRole.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return Role.USER;
        }
    }
}