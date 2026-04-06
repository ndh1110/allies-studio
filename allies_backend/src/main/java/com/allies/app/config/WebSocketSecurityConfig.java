package com.allies.app.config;

import com.allies.app.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Solves the silent-drop problem with convertAndSendToUser().
 *
 * convertAndSendToUser("admin", ...) routes by matching the WebSocket session's
 * Principal name to "admin". Without this interceptor, Spring has no Principal
 * on the WS session because JwtAuthTokenFilter only runs on HTTP requests —
 * not on STOMP frames. This interceptor fills that gap by parsing the JWT
 * from the STOMP CONNECT frame headers and calling accessor.setUser().
 */
@Configuration
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                // Only act on the initial CONNECT frame — ignore all other frame types.
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                        String jwt = authHeader.substring(7);

                        try {
                            if (jwtUtils.validateJwtToken(jwt)) {
                                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                                UsernamePasswordAuthenticationToken authentication =
                                        new UsernamePasswordAuthenticationToken(
                                                userDetails,
                                                null,
                                                userDetails.getAuthorities()
                                        );

                                // KEY: Bind the authenticated Principal to this WebSocket session.
                                // This is what enables convertAndSendToUser() to route correctly.
                                accessor.setUser(authentication);
                                System.out.println("[WS] Principal set for user: " + username);
                            }
                        } catch (Exception e) {
                            System.err.println("[WS] JWT auth failed during CONNECT: " + e.getMessage());
                        }
                    }
                }

                return message;
            }
        });
    }
}
